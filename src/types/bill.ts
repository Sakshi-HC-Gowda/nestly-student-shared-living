import type { SplitMethod } from './expense'

export type { SplitMethod }

export type BillCategory = 'Electricity' | 'Water' | 'Internet' | 'Rent' | 'Gas' | 'Other'
export type BillStatus = 'Upcoming' | 'Due' | 'Paid' | 'Overdue'

export interface Bill {
  id: string
  householdId: string
  title: string
  amount: number
  dueDate: string
  category: BillCategory
  participantIds: string[]
  splitMethod: SplitMethod
  shares: Record<string, number>
  recurring: boolean
  status: BillStatus
}

export interface CreateBillInput {
  title: string
  amount: number
  dueDate: string
  category: BillCategory
  participantIds: string[]
  splitMethod: SplitMethod
  recurring: boolean
}
