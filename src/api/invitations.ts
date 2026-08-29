import type { Invitation } from '@/types/household'
import { mockInvitations } from '@/data/mockData'

const MOCK_DELAY_MS = 400

function delay<T>(value: T, ms = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

/**
 * Mock invitations API — Week 2 simulates email/link/code invites entirely
 * on the frontend. Same shape a real `POST /households/:id/invitations`
 * endpoint will return, so this swaps cleanly in Week 4.
 */
export const invitationsApi = {
  async getInvitations(householdId: string): Promise<Invitation[]> {
    const invitations = mockInvitations.filter((inv) => inv.householdId === householdId)
    return delay(invitations)
  },

  async sendInvitation(householdId: string, email: string): Promise<Invitation> {
    const invitation: Invitation = {
      id: `inv_${Date.now()}`,
      householdId,
      email: email.trim(),
      status: 'Pending',
      sentAt: new Date().toISOString(),
    }
    mockInvitations.push(invitation)
    return delay(invitation)
  },

  async cancelInvitation(id: string): Promise<Invitation> {
    const invitation = mockInvitations.find((inv) => inv.id === id)
    if (!invitation) {
      return Promise.reject(new Error('Invitation not found.'))
    }
    invitation.status = 'Cancelled'
    return delay(invitation)
  },
}
