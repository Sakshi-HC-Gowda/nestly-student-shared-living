import { mockExpenses, mockHouseholds } from '@/data/mockData'
import type { CategorySpending, MonthlyComparison, MemberContribution } from '@/types/analytics'

const MOCK_DELAY_MS = 400

function delay<T>(value: T, ms = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

function isInMonth(isoDate: string, year: number, month: number): boolean {
  const date = new Date(isoDate)
  return date.getFullYear() === year && date.getMonth() === month
}

export const analyticsApi = {
  async getSpendingByCategory(householdId: string): Promise<CategorySpending[]> {
    const now = new Date()
    const totals = new Map<string, number>()

    mockExpenses
      .filter((e) => e.householdId === householdId && isInMonth(e.date, now.getFullYear(), now.getMonth()))
      .forEach((e) => {
        totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount)
      })

    const result = Array.from(totals.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)

    return delay(result)
  },

  async getMonthlyComparison(householdId: string): Promise<MonthlyComparison> {
    const now = new Date()
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const sumForMonth = (year: number, month: number) =>
      mockExpenses
        .filter((e) => e.householdId === householdId && isInMonth(e.date, year, month))
        .reduce((sum, e) => sum + e.amount, 0)

    const currentMonth = sumForMonth(now.getFullYear(), now.getMonth())
    const previousMonth = sumForMonth(prevMonthDate.getFullYear(), prevMonthDate.getMonth())

    const changePercent = previousMonth === 0 ? null : Math.round(((currentMonth - previousMonth) / previousMonth) * 100)

    return delay({ currentMonth, previousMonth, changePercent })
  },

  async getMemberContribution(householdId: string): Promise<MemberContribution[]> {
    const now = new Date()
    const household = mockHouseholds.find((h) => h.id === householdId)
    if (!household) return delay([])

    const totals = new Map<string, number>()
    household.members.forEach((m) => totals.set(m.userId, 0))

    mockExpenses
      .filter((e) => e.householdId === householdId && isInMonth(e.date, now.getFullYear(), now.getMonth()))
      .forEach((e) => {
        totals.set(e.paidByUserId, (totals.get(e.paidByUserId) ?? 0) + e.amount)
      })

    const result = household.members
      .map((m) => ({ userId: m.userId, name: m.name, amount: totals.get(m.userId) ?? 0 }))
      .sort((a, b) => b.amount - a.amount)

    return delay(result)
  },
}
