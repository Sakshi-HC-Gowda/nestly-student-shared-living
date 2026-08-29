import { Avatar, Badge, Button } from '@/components/common'
import type { BadgeTone } from '@/components/common'
import { formatShortDate, isToday } from '@/utils/date'
import type { Chore } from '@/types/chore'

const STATUS_TONE: Record<Chore['status'], BadgeTone> = {
  Pending: 'info',
  Completed: 'success',
  Overdue: 'danger',
}

interface ChoreListItemProps {
  chore: Chore
  onComplete: (id: string) => void
  isCompleting: boolean
}

export function ChoreListItem({ chore, onComplete, isCompleting }: ChoreListItemProps) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar name={chore.assignedToName} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{chore.title}</p>
          <p className="text-xs text-slate">
            {chore.assignedToName} · {isToday(chore.dueDate) ? 'Due today' : `Due ${formatShortDate(chore.dueDate)}`}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge tone={STATUS_TONE[chore.status]}>{chore.status}</Badge>
        {chore.status !== 'Completed' && (
          <Button size="sm" variant="secondary" onClick={() => onComplete(chore.id)} disabled={isCompleting}>
            {isCompleting ? 'Saving…' : 'Mark Complete'}
          </Button>
        )}
      </div>
    </div>
  )
}
