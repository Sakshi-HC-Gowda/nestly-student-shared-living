export interface CategorySpending {
  category: string
  amount: number
}

export interface MonthlyComparison {
  currentMonth: number
  previousMonth: number
  changePercent: number | null
}

export interface MemberContribution {
  userId: string
  name: string
  amount: number
}
