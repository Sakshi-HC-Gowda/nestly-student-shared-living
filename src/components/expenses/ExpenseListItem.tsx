import { Link } from 'react-router-dom'
import { Avatar, Badge } from '@/components/common'
import { formatCurrency, formatShortDate } from '@/utils/date'
import type { Expense } from '@/types/expense'
import type { BadgeTone } from '@/components/common'

const CATEGORY_TONE: Record<string, BadgeTone> = {
  Food: 'warning',
  Groceries: 'success',
  Utilities: 'info',
  Rent: 'neutral',
  Transport: 'info',
  Household: 'neutral',
  Other: 'neutral',
}

export function ExpenseListItem({ expense }: { expense: Expense }) {
  return (
    <Link
      to={`/expenses/${expense.id}`}
      className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-tint"
    >
      <div className="flex items-center gap-3 min-w-0">
        <Avatar name={expense.paidByName} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{expense.description}</p>
          <p className="text-xs text-slate">
            {expense.paidByName} paid · {formatShortDate(expense.date)}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="font-mono text-sm font-semibold text-ink">{formatCurrency(expense.amount)}</span>
        <Badge tone={CATEGORY_TONE[expense.category] ?? 'neutral'}>{expense.category}</Badge>
      </div>
    </Link>
  )
}
