import type { Bill, CreateBillInput } from '@/types/bill'
import { mockBills, mockActivity } from '@/data/mockData'

const MOCK_DELAY_MS = 400

function delay<T>(value: T, ms = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

function resolveShares(
  amount: number,
  participantIds: string[],
  splitMethod: CreateBillInput['splitMethod'],
  splitValues?: Record<string, number>,
): Record<string, number> {
  if (splitMethod === 'Equal') {
    const base = Math.floor((amount / participantIds.length) * 100) / 100
    const shares: Record<string, number> = {}
    let distributed = 0
    participantIds.forEach((id, index) => {
      if (index === participantIds.length - 1) {
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
  const shares: Record<string, number> = {}
  participantIds.forEach((id) => {
    shares[id] = Math.round(((amount * (splitValues?.[id] ?? 0)) / 100) * 100) / 100
  })
  return shares
}

function computeStatus(dueDate: string): Bill['status'] {
  const due = new Date(dueDate)
  const now = new Date()
  const dayInMs = 24 * 60 * 60 * 1000
  if (due.getTime() < now.getTime() - dayInMs) return 'Overdue'
  if (due.getTime() <= now.getTime() + dayInMs) return 'Due'
  return 'Upcoming'
}

export const billsApi = {
  async getBills(householdId: string): Promise<Bill[]> {
    const bills = mockBills
      .filter((b) => b.householdId === householdId)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    return delay(bills)
  },

  async getBillById(id: string): Promise<Bill | null> {
    const bill = mockBills.find((b) => b.id === id) ?? null
    return delay(bill)
  },

  async createBill(
    householdId: string,
    input: CreateBillInput,
    splitValues?: Record<string, number>,
  ): Promise<Bill> {
    const bill: Bill = {
      id: `b_${Date.now()}`,
      householdId,
      title: input.title.trim(),
      amount: input.amount,
      dueDate: input.dueDate,
      category: input.category,
      participantIds: input.participantIds,
      splitMethod: input.splitMethod,
      shares: resolveShares(input.amount, input.participantIds, input.splitMethod, splitValues),
      recurring: input.recurring,
      status: computeStatus(input.dueDate),
    }
    mockBills.push(bill)
    mockActivity.unshift({
      id: `a_${Date.now()}`,
      householdId,
      type: 'bill',
      message: `${bill.title} bill added, due ${new Date(bill.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`,
      timestamp: new Date().toISOString(),
    })
    return delay(bill)
  },

  async markBillPaid(id: string): Promise<Bill> {
    const bill = mockBills.find((b) => b.id === id)
    if (!bill) {
      return Promise.reject(new Error('Bill not found.'))
    }
    bill.status = 'Paid'
    mockActivity.unshift({
      id: `a_${Date.now()}`,
      householdId: bill.householdId,
      type: 'bill',
      message: `${bill.title} bill marked as paid`,
      timestamp: new Date().toISOString(),
    })
    return delay(bill)
  },
}
