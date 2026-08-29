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

export function BillListItem({ bill, myShare }: { bill: Bill; myShare: number }) {
  return (
    <Link to={`/bills/${bill.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-tint">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink">{bill.title}</p>
        <p className="text-xs text-slate">
          {formatCurrency(bill.amount)} · Due {formatShortDate(bill.dueDate)}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="font-mono text-sm font-semibold text-ink">Your share {formatCurrency(myShare)}</span>
        <Badge tone={STATUS_TONE[bill.status]}>{bill.status}</Badge>
      </div>
    </Link>
  )
}
