import type { Expense, CreateExpenseInput } from '@/types/expense'
import { mockExpenses, mockHouseholds, mockActivity } from '@/data/mockData'

const MOCK_DELAY_MS = 400

function delay<T>(value: T, ms = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

/** Resolves the split method + raw input into a final per-participant shares map. Assumes the input already passed form validation. */
function resolveShares(input: CreateExpenseInput): Record<string, number> {
  const { splitMethod, participantIds, amount, splitValues } = input

  if (splitMethod === 'Equal') {
    const base = Math.floor((amount / participantIds.length) * 100) / 100
    const shares: Record<string, number> = {}
    let distributed = 0
    participantIds.forEach((id, index) => {
      if (index === participantIds.length - 1) {
        // Last participant absorbs the rounding remainder so shares always sum exactly to `amount`.
        shares[id] = Math.round((amount - distributed) * 100) / 100
      } else {
        shares[id] = base
        distributed += base
      }
    })
    return shares
  }

  if (splitMethod === 'Exact') {
    const shares: Record<string, number> = {}
    participantIds.forEach((id) => {
      shares[id] = Math.round((splitValues?.[id] ?? 0) * 100) / 100
    })
    return shares
  }

  // Percentage
  const shares: Record<string, number> = {}
  participantIds.forEach((id) => {
    const pct = splitValues?.[id] ?? 0
    shares[id] = Math.round(((amount * pct) / 100) * 100) / 100
  })
  return shares
}

export const expensesApi = {
  async getExpenses(householdId: string): Promise<Expense[]> {
    const expenses = mockExpenses
      .filter((e) => e.householdId === householdId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return delay(expenses)
  },

  async getExpenseById(id: string): Promise<Expense | null> {
    const expense = mockExpenses.find((e) => e.id === id) ?? null
    return delay(expense)
  },

  async createExpense(householdId: string, input: CreateExpenseInput): Promise<Expense> {
    const household = mockHouseholds.find((h) => h.id === householdId)
    const payer = household?.members.find((m) => m.userId === input.paidByUserId)

    const expense: Expense = {
      id: `e_${Date.now()}`,
      householdId,
      amount: input.amount,
      description: input.description.trim(),
      category: input.category,
      paidByUserId: input.paidByUserId,
      paidByName: payer?.name ?? 'Unknown',
      participantIds: input.participantIds,
      splitMethod: input.splitMethod,
      shares: resolveShares(input),
      date: input.date,
      notes: input.notes?.trim() || undefined,
    }

    mockExpenses.unshift(expense)
    mockActivity.unshift({
      id: `a_${Date.now()}`,
      householdId,
      type: 'expense',
      message: `${expense.paidByName} added ₹${expense.amount.toLocaleString('en-IN')} ${expense.description.toLowerCase()}`,
      timestamp: new Date().toISOString(),
    })

    return delay(expense)
  },
}
