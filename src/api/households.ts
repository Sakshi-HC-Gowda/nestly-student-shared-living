import type { Household, CreateHouseholdInput } from '@/types/household'
import type { User } from '@/types/auth'
import type { ActivityItem } from '@/types/activity'
import { mockHouseholds, membershipIndex, mockActivity } from '@/data/mockData'

const MOCK_DELAY_MS = 400

function delay<T>(value: T, ms = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

/** Thrown by joinHousehold so the UI can distinguish "wrong code" from "used-up code" per the wireframe spec. */
export class InvitationError extends Error {
  reason: 'invalid' | 'expired'
  constructor(reason: 'invalid' | 'expired', message: string) {
    super(message)
    this.reason = reason
  }
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no ambiguous 0/O/1/I
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

/**
 * Mock households API. Function signatures match what the real
 * `GET/POST /households`, `POST /households/join` REST endpoints will
 * look like, so pages built against this never need to change when
 * Week 4 swaps the implementation for real HTTP calls.
 */
export const householdsApi = {
  async getHouseholds(userId: string): Promise<Household[]> {
    const ids = membershipIndex[userId] ?? []
    const households = mockHouseholds.filter((h) => ids.includes(h.id))
    return delay(households)
  },

  async getHouseholdById(id: string): Promise<Household | null> {
    const household = mockHouseholds.find((h) => h.id === id) ?? null
    return delay(household)
  },

  async createHousehold(input: CreateHouseholdInput, owner: User): Promise<Household> {
    const now = new Date().toISOString()
    const household: Household = {
      id: `h_${Date.now()}`,
      name: input.name.trim(),
      type: input.type,
      inviteCode: generateInviteCode(),
      createdAt: now,
      members: [{ id: `m_${Date.now()}`, userId: owner.id, name: owner.name, role: 'OWNER', joinedAt: now }],
    }
    mockHouseholds.push(household)
    membershipIndex[owner.id] = [...(membershipIndex[owner.id] ?? []), household.id]
    return delay(household)
  },

  async joinHousehold(rawCode: string, user: User): Promise<Household> {
    const code = rawCode.trim().toUpperCase()

    // Week 2 fixture: this specific code always simulates an expired invitation.
    if (code === 'EXPIRD') {
      return Promise.reject(new InvitationError('expired', 'This invitation has expired. Ask for a new one.'))
    }

    const household = mockHouseholds.find((h) => h.inviteCode === code)
    if (!household) {
      return Promise.reject(new InvitationError('invalid', "That code doesn't match any household."))
    }

    const alreadyMember = household.members.some((m) => m.userId === user.id)
    if (!alreadyMember) {
      household.members.push({
        id: `m_${Date.now()}`,
        userId: user.id,
        name: user.name,
        role: 'MEMBER',
        joinedAt: new Date().toISOString(),
      })
      membershipIndex[user.id] = [...(membershipIndex[user.id] ?? []), household.id]
    }

    return delay(household)
  },

  async getRecentActivity(householdId: string): Promise<ActivityItem[]> {
    const activity = mockActivity
      .filter((a) => a.householdId === householdId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    return delay(activity)
  },

  async removeMember(householdId: string, userId: string): Promise<Household> {
    const household = mockHouseholds.find((h) => h.id === householdId)
    if (!household) {
      return Promise.reject(new Error('Household not found.'))
    }
    household.members = household.members.filter((m) => m.userId !== userId)
    membershipIndex[userId] = (membershipIndex[userId] ?? []).filter((id) => id !== householdId)
    return delay(household)
  },

  async transferOwnership(householdId: string, newOwnerUserId: string): Promise<Household> {
    const household = mockHouseholds.find((h) => h.id === householdId)
    if (!household) {
      return Promise.reject(new Error('Household not found.'))
    }
    household.members = household.members.map((m) => ({
      ...m,
      role: m.userId === newOwnerUserId ? 'OWNER' : m.role === 'OWNER' ? 'MEMBER' : m.role,
    }))
    return delay(household)
  },
}
