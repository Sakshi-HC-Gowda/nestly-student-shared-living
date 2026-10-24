import { ApiError, apiClient } from '@/api/client'
import type { Household, CreateHouseholdInput } from '@/types/household'
import type { User } from '@/types/auth'
import type { ActivityItem } from '@/types/activity'

interface BackendHousehold {
  id: number
  name: string
  accommodationType: string
  inviteCode?: string
  createdAt: string
}

interface InviteCodeResponse {
  inviteCode: string
}

interface BackendHouseholdMember {
  id: number
  userId: number
  name: string
  role: 'OWNER' | 'MEMBER'
  joinedAt: string
}

/** Thrown by joinHousehold so the UI can distinguish "wrong code" from "used-up code" per the wireframe spec. */
export class InvitationError extends Error {
  reason: 'invalid' | 'expired' | 'duplicate'
  constructor(reason: 'invalid' | 'expired' | 'duplicate', message: string) {
    super(message)
    this.reason = reason
  }
}

function toHousehold(
  response: BackendHousehold,
  members: Household['members'] = [],
  owner?: User,
): Household {
  const createdAt = response.createdAt ?? new Date().toISOString()
  return {
    id: String(response.id),
    name: response.name,
    type: response.accommodationType as Household['type'],
    inviteCode: response.inviteCode ?? '',
    createdAt,
    members: members.length > 0
      ? members
      : owner
        ? [{ id: `${response.id}-${owner.id}`, userId: owner.id, name: owner.name, role: 'OWNER', joinedAt: createdAt }]
        : [],
  }
}

function toMember(response: BackendHouseholdMember): Household['members'][number] {
  return {
    id: String(response.id),
    userId: String(response.userId),
    name: response.name,
    role: response.role,
    joinedAt: response.joinedAt,
  }
}

export const householdsApi = {
  async getHouseholds(_userId?: string, user?: User): Promise<Household[]> {
    const households = await apiClient.get<BackendHousehold[]>('/households')
    return Promise.all(
      households.map(async (household) => {
        const members = await this.getHouseholdMembers(String(household.id))
        return toHousehold(household, members, user)
      }),
    )
  },

  async getHouseholdMembers(householdId: string): Promise<Household['members']> {
    const members = await apiClient.get<BackendHouseholdMember[]>(`/households/${householdId}/members`)
    return members.map(toMember)
  },

  async getHouseholdById(id: string): Promise<Household | null> {
    const households = await this.getHouseholds()
    return households.find((household) => household.id === id) ?? null
  },

  async createHousehold(input: CreateHouseholdInput, owner: User): Promise<Household> {
    const household = await apiClient.post<BackendHousehold>('/households', {
      name: input.name.trim(),
      accommodationType: input.type,
    })
    return toHousehold(household, [], owner)
  },

  async getInviteCode(householdId: string): Promise<string> {
    const response = await apiClient.get<InviteCodeResponse>(`/households/${householdId}/invite-code`)
    return response.inviteCode
  },

  async joinHousehold(rawCode: string, user: User): Promise<Household> {
    try {
      const household = await apiClient.post<BackendHousehold>('/households/join', {
        inviteCode: rawCode.trim().toUpperCase(),
      })
      return toHousehold(household, [], user)
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 409) {
          throw new InvitationError('duplicate', error.message)
        }
        if (error.status === 404 || error.status === 400) {
          throw new InvitationError('invalid', error.message)
        }
      }
      throw error
    }
  },

  async getRecentActivity(_householdId: string): Promise<ActivityItem[]> {
    return []
  },

  async removeMember(_householdId: string, _userId: string): Promise<Household> {
    throw new Error('Removing members is not supported by the backend yet.')
  },

  async transferOwnership(_householdId: string, _newOwnerUserId: string): Promise<Household> {
    throw new Error('Transferring ownership is not supported by the backend yet.')
  },
}
