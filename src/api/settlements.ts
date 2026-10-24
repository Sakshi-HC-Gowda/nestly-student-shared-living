import type { Balance, SuggestedSettlement, Settlement } from '@/types/settlement'
import { expensesApi } from '@/api/expenses'
import { householdsApi } from '@/api/households'

/** Recorded settlements reduce what's shown as owed. Client-side until a backend endpoint exists. */
const mockSettlements: Settlement[] = []

async function computeBalances(householdId: string): Promise<Balance[]> {
  const [expenses, members] = await Promise.all([
    expensesApi.getExpenses(householdId),
    householdsApi.getHouseholdMembers(householdId),
  ])

  if (members.length === 0) return []

  const net: Record<string, number> = {}
  members.forEach((m) => {
    net[m.userId] = 0
  })

  expenses.forEach((expense) => {
    net[expense.paidByUserId] = (net[expense.paidByUserId] ?? 0) + expense.amount
    Object.entries(expense.shares).forEach(([userId, amount]) => {
      net[userId] = (net[userId] ?? 0) - amount
    })
  })

  mockSettlements
    .filter((s) => s.householdId === householdId)
    .forEach((settlement) => {
      net[settlement.fromUserId] = (net[settlement.fromUserId] ?? 0) + settlement.amount
      net[settlement.toUserId] = (net[settlement.toUserId] ?? 0) - settlement.amount
    })

  return members.map((m) => ({
    userId: m.userId,
    name: m.name,
    amount: Math.round((net[m.userId] ?? 0) * 100) / 100,
  }))
}

/** Greedy debtor-to-creditor matching — minimizes the number of payments needed to settle up. */
function computeSuggestedSettlements(balances: Balance[]): SuggestedSettlement[] {
  const creditors = balances.filter((b) => b.amount > 0).map((b) => ({ ...b })).sort((a, b) => b.amount - a.amount)
  const debtors = balances.filter((b) => b.amount < 0).map((b) => ({ ...b, amount: -b.amount })).sort((a, b) => b.amount - a.amount)

  const settlements: SuggestedSettlement[] = []
  let i = 0
  let j = 0
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i]
    const creditor = creditors[j]
    const amount = Math.min(debtor.amount, creditor.amount)

    if (amount > 0.5) {
      settlements.push({
        fromUserId: debtor.userId,
        fromName: debtor.name,
        toUserId: creditor.userId,
        toName: creditor.name,
        amount: Math.round(amount),
      })
    }

    debtor.amount -= amount
    creditor.amount -= amount
    if (debtor.amount <= 0.5) i++
    if (creditor.amount <= 0.5) j++
  }

  return settlements
}

export const settlementsApi = {
  async getBalances(householdId: string): Promise<Balance[]> {
    return computeBalances(householdId)
  },

  async getSuggestedSettlements(householdId: string): Promise<SuggestedSettlement[]> {
    const balances = await computeBalances(householdId)
    return computeSuggestedSettlements(balances)
  },

  async markSettled(fromUserId: string, fromName: string, toUserId: string, toName: string, amount: number, householdId: string): Promise<Settlement> {
    const settlement: Settlement = {
      id: `s_${Date.now()}`,
      householdId,
      fromUserId,
      fromName,
      toUserId,
      toName,
      amount,
      settledAt: new Date().toISOString(),
    }
    mockSettlements.push(settlement)
    return settlement
  },
}
