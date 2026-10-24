import { apiClient } from '@/api/client'
import type { Chore, CreateChoreInput } from '@/types/chore'

interface BackendChore {
  id: number
  title: string
  description?: string
  dueDate: string
  status: 'PENDING' | 'COMPLETED'
  householdId: number
  assignedToUserId: number
  assignedToName: string
  createdByUserId: number
  createdByName: string
  createdAt: string
}

function toChore(response: BackendChore): Chore {
  return {
    id: String(response.id),
    householdId: String(response.householdId),
    title: response.title,
    description: response.description || undefined,
    assignedToUserId: String(response.assignedToUserId),
    assignedToName: response.assignedToName,
    dueDate: response.dueDate,
    frequency: 'One-time',
    status: response.status === 'COMPLETED' ? 'Completed' : 'Pending',
  }
}

export const choresApi = {
  async getChores(householdId: string): Promise<Chore[]> {
    const chores = await apiClient.get<BackendChore[]>(`/chores/household/${householdId}`)
    return chores.map(toChore).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  },

  async createChore(householdId: string, input: CreateChoreInput): Promise<Chore> {
    const chore = await apiClient.post<BackendChore>('/chores', {
      title: input.title.trim(),
      description: input.description?.trim() || undefined,
      dueDate: input.dueDate.slice(0, 10),
      assignedToUserId: Number(input.assignedToUserId),
      householdId: Number(householdId),
    })
    return toChore(chore)
  },

  async completeChore(_id: string): Promise<Chore> {
    throw new Error('Completing chores is not supported by the backend yet.')
  },
}
