import { Link } from 'react-router-dom'
import { Badge } from '@/components/common'
import type { BadgeTone } from '@/components/common'
import { formatCurrency, formatShortDate } from '@/utils/date'
import type { Bill } from '@/types/bill'

const STATUS_TONE: Record<Bill['status'], BadgeTone> = {
  Upcoming: 'info',
  Due: 'warning',
  Paid: 'success',
  Overdue: 'danger',
}

export function BillTable({ bills, myUserId }: { bills: Bill[]; myUserId: string }) {
  return (
    <table className="w-full text-sm">
      <caption className="sr-only">Household bills</caption>
      <thead>
        <tr className="border-b border-line text-left text-xs font-medium uppercase tracking-wide text-slate">
          <th scope="col" className="px-4 py-3 font-medium">
            Title
          </th>
          <th scope="col" className="px-4 py-3 font-medium">
            Category
          </th>
          <th scope="col" className="px-4 py-3 font-medium">
            Due date
          </th>
          <th scope="col" className="px-4 py-3 font-medium">
            Status
          </th>
          <th scope="col" className="px-4 py-3 text-right font-medium">
            Your share
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {bills.map((bill) => (
          <tr key={bill.id} className="hover:bg-slate-tint">
            <td className="px-4 py-3">
              <Link to={`/bills/${bill.id}`} className="font-medium text-ink hover:underline">
                {bill.title}
              </Link>
            </td>
            <td className="px-4 py-3 text-ink-soft">{bill.category}</td>
            <td className="px-4 py-3 text-ink-soft">{formatShortDate(bill.dueDate)}</td>
            <td className="px-4 py-3">
              <Badge tone={STATUS_TONE[bill.status]}>{bill.status}</Badge>
            </td>
            <td className="px-4 py-3 text-right font-mono font-semibold text-ink">
              {formatCurrency(bill.shares[myUserId] ?? 0)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
