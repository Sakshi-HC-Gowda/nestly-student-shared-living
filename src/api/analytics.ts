import { expensesApi } from '@/api/expenses'
import { householdsApi } from '@/api/households'
import type { CategorySpending, MonthlyComparison, MemberContribution } from '@/types/analytics'

function isInMonth(isoDate: string, year: number, month: number): boolean {
  const date = new Date(isoDate)
  return date.getFullYear() === year && date.getMonth() === month
}

export const analyticsApi = {
  async getSpendingByCategory(householdId: string): Promise<CategorySpending[]> {
    const expenses = await expensesApi.getExpenses(householdId)
    const now = new Date()
    const totals = new Map<string, number>()

    expenses
      .filter((e) => isInMonth(e.date, now.getFullYear(), now.getMonth()))
      .forEach((e) => {
        totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount)
      })

    return Array.from(totals.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
  },

  async getMonthlyComparison(householdId: string): Promise<MonthlyComparison> {
    const expenses = await expensesApi.getExpenses(householdId)
    const now = new Date()
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const sumForMonth = (year: number, month: number) =>
      expenses
        .filter((e) => isInMonth(e.date, year, month))
        .reduce((sum, e) => sum + e.amount, 0)

    const currentMonth = sumForMonth(now.getFullYear(), now.getMonth())
    const previousMonth = sumForMonth(prevMonthDate.getFullYear(), prevMonthDate.getMonth())

    const changePercent = previousMonth === 0 ? null : Math.round(((currentMonth - previousMonth) / previousMonth) * 100)

    return { currentMonth, previousMonth, changePercent }
  },

  async getMemberContribution(householdId: string): Promise<MemberContribution[]> {
    const [expenses, members] = await Promise.all([
      expensesApi.getExpenses(householdId),
      householdsApi.getHouseholdMembers(householdId),
    ])
    const now = new Date()

    if (members.length === 0) return []

    const totals = new Map<string, number>()
    members.forEach((m) => totals.set(m.userId, 0))

    expenses
      .filter((e) => isInMonth(e.date, now.getFullYear(), now.getMonth()))
      .forEach((e) => {
        totals.set(e.paidByUserId, (totals.get(e.paidByUserId) ?? 0) + e.amount)
      })

    return members
      .map((m) => ({ userId: m.userId, name: m.name, amount: totals.get(m.userId) ?? 0 }))
      .sort((a, b) => b.amount - a.amount)
  },
}
