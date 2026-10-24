import { apiClient } from '@/api/client'
import type { Bill, CreateBillInput } from '@/types/bill'

interface BackendBill {
  id: number
  title: string
  amount: number
  dueDate: string
  category: string
  status: 'PENDING' | 'PAID'
  householdId: number
  createdByUserId: number
  createdByName: string
  createdAt: string
}

const billCache = new Map<string, Bill>()

function computeStatus(response: BackendBill): Bill['status'] {
  if (response.status === 'PAID') return 'Paid'
  const due = new Date(response.dueDate)
  const now = new Date()
  const dayInMs = 24 * 60 * 60 * 1000
  if (due.getTime() < now.getTime() - dayInMs) return 'Overdue'
  if (due.getTime() <= now.getTime() + dayInMs) return 'Due'
  return 'Upcoming'
}

function toBill(response: BackendBill): Bill {
  const bill: Bill = {
    id: String(response.id),
    householdId: String(response.householdId),
    title: response.title,
    amount: Number(response.amount),
    dueDate: response.dueDate,
    category: response.category as Bill['category'],
    participantIds: [],
    splitMethod: 'Equal',
    shares: {},
    recurring: false,
    status: computeStatus(response),
  }
  billCache.set(bill.id, bill)
  return bill
}

export const billsApi = {
  async getBills(householdId: string): Promise<Bill[]> {
    const bills = await apiClient.get<BackendBill[]>(`/bills/household/${householdId}`)
    return bills.map(toBill).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  },

  async getBillById(id: string): Promise<Bill | null> {
    return billCache.get(id) ?? null
  },

  async createBill(householdId: string, input: CreateBillInput, _splitValues?: Record<string, number>): Promise<Bill> {
    const bill = await apiClient.post<BackendBill>('/bills', {
      title: input.title.trim(),
      amount: input.amount,
      dueDate: input.dueDate.slice(0, 10),
      category: input.category,
      householdId: Number(householdId),
    })
    return toBill(bill)
  },

  async markBillPaid(_id: string): Promise<Bill> {
    throw new Error('Marking bills paid is not supported by the backend yet.')
  },
}
