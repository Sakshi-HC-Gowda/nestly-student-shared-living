import type { Chore, CreateChoreInput } from '@/types/chore'
import { mockChores, mockHouseholds, mockActivity } from '@/data/mockData'

const MOCK_DELAY_MS = 400

function delay<T>(value: T, ms = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

function computeStatus(dueDate: string): Chore['status'] {
  const due = new Date(dueDate)
  const now = new Date()
  // A chore is overdue once its due date has fully passed (not just "later today").
  due.setHours(23, 59, 59, 999)
  return due.getTime() < now.getTime() ? 'Overdue' : 'Pending'
}

export const choresApi = {
  async getChores(householdId: string): Promise<Chore[]> {
    const chores = mockChores
      .filter((c) => c.householdId === householdId)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    return delay(chores)
  },

  async createChore(householdId: string, input: CreateChoreInput): Promise<Chore> {
    const household = mockHouseholds.find((h) => h.id === householdId)
    const assignee = household?.members.find((m) => m.userId === input.assignedToUserId)

    const chore: Chore = {
      id: `c_${Date.now()}`,
      householdId,
      title: input.title.trim(),
      description: input.description?.trim() || undefined,
      assignedToUserId: input.assignedToUserId,
      assignedToName: assignee?.name ?? 'Unknown',
      dueDate: input.dueDate,
      frequency: input.frequency,
      status: computeStatus(input.dueDate),
    }
    mockChores.push(chore)
    mockActivity.unshift({
      id: `a_${Date.now()}`,
      householdId,
      type: 'chore',
      message: `${chore.title} assigned to ${chore.assignedToName}`,
      timestamp: new Date().toISOString(),
    })
    return delay(chore)
  },

  async completeChore(id: string): Promise<Chore> {
    const chore = mockChores.find((c) => c.id === id)
    if (!chore) {
      return Promise.reject(new Error('Chore not found.'))
    }
    chore.status = 'Completed'
    mockActivity.unshift({
      id: `a_${Date.now()}`,
      householdId: chore.householdId,
      type: 'chore',
      message: `${chore.assignedToName} completed "${chore.title}"`,
      timestamp: new Date().toISOString(),
    })
    return delay(chore)
  },
}
