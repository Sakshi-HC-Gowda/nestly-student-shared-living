import { apiClient } from '@/api/client'
import type { Expense, CreateExpenseInput } from '@/types/expense'

interface BackendExpense {
  id: number
  description: string
  amount: number
  category: string
  householdId: number
  paidByUserId: number
  paidByName: string
  createdAt: string
}

interface BackendExpenseSplit {
  id: number
  userId: number
  userName: string
  amount: number
}

const expenseCache = new Map<string, Expense>()

function resolveShares(input: CreateExpenseInput): Record<string, number> {
  const shares: Record<string, number> = {}
  if (input.splitMethod === 'Equal') {
    const base = Math.floor((input.amount / input.participantIds.length) * 100) / 100
    let distributed = 0
    input.participantIds.forEach((id, index) => {
      shares[id] = index === input.participantIds.length - 1 ? Math.round((input.amount - distributed) * 100) / 100 : base
      distributed += index === input.participantIds.length - 1 ? 0 : base
    })
    return shares
  }
  input.participantIds.forEach((id) => {
    const rawValue = input.splitValues?.[id] ?? 0
    shares[id] = input.splitMethod === 'Percentage' ? Math.round(((input.amount * rawValue) / 100) * 100) / 100 : rawValue
  })
  return shares
}

function toExpense(response: BackendExpense, splits: BackendExpenseSplit[] = []): Expense {
  const participantIds = splits.map((split) => String(split.userId))
  const shares = Object.fromEntries(splits.map((split) => [String(split.userId), Number(split.amount)]))
  const expense: Expense = {
    id: String(response.id),
    householdId: String(response.householdId),
    amount: Number(response.amount),
    description: response.description,
    category: response.category as Expense['category'],
    paidByUserId: String(response.paidByUserId),
    paidByName: response.paidByName,
    participantIds,
    splitMethod: splits.length > 0 ? 'Exact' : 'Equal',
    shares,
    date: response.createdAt,
  }
  expenseCache.set(expense.id, expense)
  return expense
}

export const expensesApi = {
  async getExpenses(householdId: string): Promise<Expense[]> {
    const expenses = await apiClient.get<BackendExpense[]>(`/expenses/household/${householdId}`)
    const converted = expenses.map((expense) => {
      const existing = expenseCache.get(String(expense.id))
      if (existing && existing.participantIds.length > 0) {
        return existing
      }
      return toExpense(expense, [])
    })
    return converted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  },

  async getExpenseById(id: string, householdId?: string): Promise<Expense | null> {
    let cached = expenseCache.get(id)
    if (!cached && householdId) {
      await expensesApi.getExpenses(householdId)
      cached = expenseCache.get(id)
    }

    try {
      const splits = await apiClient.get<BackendExpenseSplit[]>(`/expenses/${id}/splits`)
      if (cached) {
        return toExpense(
          {
            id: Number(cached.id),
            description: cached.description,
            amount: cached.amount,
            category: cached.category,
            householdId: Number(cached.householdId),
            paidByUserId: Number(cached.paidByUserId),
            paidByName: cached.paidByName,
            createdAt: cached.date,
          },
          splits,
        )
      }
    } catch {
      // If splits fail or endpoint is unreachable, fallback to cached expense
    }
    return cached ?? null
  },

  async createExpense(householdId: string, input: CreateExpenseInput): Promise<Expense> {
    const shares = resolveShares(input)
    const response = await apiClient.post<BackendExpense>('/expenses', {
      description: input.description.trim(),
      amount: input.amount,
      category: input.category,
      householdId: Number(householdId),
      splits: Object.entries(shares).map(([userId, amount]) => ({
        userId: Number(userId),
        amount,
      })),
    })
    return toExpense(response, Object.entries(shares).map(([userId, amount]) => ({
      id: 0,
      userId: Number(userId),
      userName: '',
      amount,
    })))
  },
}
