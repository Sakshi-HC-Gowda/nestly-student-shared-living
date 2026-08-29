export type ActivityType = 'expense' | 'settlement' | 'chore' | 'bill' | 'invitation'

export interface ActivityItem {
  id: string
  householdId: string
  type: ActivityType
  message: string
  timestamp: string
}
