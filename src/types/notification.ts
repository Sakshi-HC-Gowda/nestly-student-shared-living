export type NotificationType = 'invitation' | 'expense' | 'settlement' | 'bill' | 'chore'

export interface Notification {
  id: string
  householdId: string
  userId: string
  type: NotificationType
  message: string
  createdAt: string
  read: boolean
}
