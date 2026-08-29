export type ChoreStatus = 'Pending' | 'Completed' | 'Overdue'
export type ChoreFrequency = 'One-time' | 'Daily' | 'Weekly' | 'Monthly'

export interface Chore {
  id: string
  householdId: string
  title: string
  description?: string
  assignedToUserId: string
  assignedToName: string
  dueDate: string
  frequency: ChoreFrequency
  status: ChoreStatus
}

export interface CreateChoreInput {
  title: string
  description?: string
  assignedToUserId: string
  dueDate: string
  frequency: ChoreFrequency
}
