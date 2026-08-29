export type ExpenseCategory = 'Food' | 'Groceries' | 'Utilities' | 'Rent' | 'Transport' | 'Household' | 'Other'
export type SplitMethod = 'Equal' | 'Exact' | 'Percentage'

export interface Expense {
  id: string
  householdId: string
  amount: number
  description: string
  category: ExpenseCategory
  paidByUserId: string
  paidByName: string
  participantIds: string[]
  splitMethod: SplitMethod
  /** Each participant's owed amount, already resolved regardless of split method. */
  shares: Record<string, number>
  date: string
  notes?: string
}

export interface CreateExpenseInput {
  amount: number
  description: string
  category: ExpenseCategory
  paidByUserId: string
  participantIds: string[]
  splitMethod: SplitMethod
  /** Raw per-participant input before resolution: exact amounts or percentages, depending on splitMethod. */
  splitValues?: Record<string, number>
  date: string
  notes?: string
}
