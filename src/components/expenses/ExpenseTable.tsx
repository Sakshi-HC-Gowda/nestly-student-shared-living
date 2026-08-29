import { Link } from 'react-router-dom'
import { Badge } from '@/components/common'
import type { BadgeTone } from '@/components/common'
import { formatCurrency, formatShortDate } from '@/utils/date'
import type { Expense } from '@/types/expense'

const CATEGORY_TONE: Record<string, BadgeTone> = {
  Food: 'warning',
  Groceries: 'success',
  Utilities: 'info',
  Rent: 'neutral',
  Transport: 'info',
  Household: 'neutral',
  Other: 'neutral',
}

/** Shown at lg+ instead of the card list — a proper table reads better once there's room for real columns. */
export function ExpenseTable({ expenses }: { expenses: Expense[] }) {
  return (
    <table className="w-full text-sm">
      <caption className="sr-only">Household expenses</caption>
      <thead>
        <tr className="border-b border-line text-left text-xs font-medium uppercase tracking-wide text-slate">
          <th scope="col" className="px-4 py-3 font-medium">
            Description
          </th>
          <th scope="col" className="px-4 py-3 font-medium">
            Category
          </th>
          <th scope="col" className="px-4 py-3 font-medium">
            Paid by
          </th>
          <th scope="col" className="px-4 py-3 font-medium">
            Date
          </th>
          <th scope="col" className="px-4 py-3 text-right font-medium">
            Amount
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {expenses.map((expense) => (
          <tr key={expense.id} className="hover:bg-slate-tint">
            <td className="px-4 py-3">
              <Link to={`/expenses/${expense.id}`} className="font-medium text-ink hover:underline">
                {expense.description}
              </Link>
            </td>
            <td className="px-4 py-3">
              <Badge tone={CATEGORY_TONE[expense.category] ?? 'neutral'}>{expense.category}</Badge>
            </td>
            <td className="px-4 py-3 text-ink-soft">{expense.paidByName}</td>
            <td className="px-4 py-3 text-ink-soft">{formatShortDate(expense.date)}</td>
            <td className="px-4 py-3 text-right font-mono font-semibold text-ink">{formatCurrency(expense.amount)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
