/** Net position for one member: positive = owed to them, negative = they owe the household. */
export interface Balance {
  userId: string
  name: string
  amount: number
}

export interface SuggestedSettlement {
  fromUserId: string
  fromName: string
  toUserId: string
  toName: string
  amount: number
}

export interface Settlement {
  id: string
  householdId: string
  fromUserId: string
  fromName: string
  toUserId: string
  toName: string
  amount: number
  settledAt: string
}
