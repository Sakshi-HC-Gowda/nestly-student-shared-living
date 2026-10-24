import { apiClient } from '@/api/client'
import type { Invitation } from '@/types/household'

interface BackendInvitation {
  id: number
  invitedEmail: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt: string
  household?: {
    id: number
  }
}

function toInvitation(response: BackendInvitation, householdId: string): Invitation {
  const statusMap = {
    PENDING: 'Pending',
    ACCEPTED: 'Accepted',
    REJECTED: 'Cancelled',
  } as const

  return {
    id: String(response.id),
    householdId: response.household?.id ? String(response.household.id) : householdId,
    email: response.invitedEmail,
    status: statusMap[response.status],
    sentAt: response.createdAt,
  }
}

export const invitationsApi = {
  async getInvitations(_householdId: string): Promise<Invitation[]> {
    return []
  },

  async sendInvitation(householdId: string, email: string): Promise<Invitation> {
    const invitation = await apiClient.post<BackendInvitation>(`/households/${householdId}/invitations`, {
      invitedEmail: email.trim(),
    })
    return toInvitation(invitation, householdId)
  },

  async cancelInvitation(_id: string): Promise<Invitation> {
    throw new Error('Cancelling invitations is not supported by the backend yet.')
  },
}
