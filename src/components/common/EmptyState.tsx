import type { ReactNode } from 'react'
import { Button } from './Button'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}

/** Shown in place of a list/page body when there is no data yet. Frames the empty screen as an invitation to act. */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border border-dashed border-line px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-tint text-slate" aria-hidden="true">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-ink">{title}</p>
        <p className="text-sm text-slate max-w-xs">{description}</p>
      </div>
      {action && (
        <Button size="sm" variant="secondary" onClick={action.onClick} className="mt-1">
          {action.label}
        </Button>
      )}
    </div>
  )
}
