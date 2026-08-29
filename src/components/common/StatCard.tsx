import type { ReactNode } from 'react'
import { Card } from './Card'
import { cn } from '@/utils/cn'

interface StatCardProps {
  label: string
  value: string
  tone?: 'default' | 'positive' | 'negative'
  caption?: string
  icon?: ReactNode
}

const toneClasses = {
  default: 'text-ink',
  positive: 'text-moss-dark',
  negative: 'text-brick',
}

/** Single-number summary tile — balance, spending, dues, counts. Not a list, so no loading/empty state of its own. */
export function StatCard({ label, value, tone = 'default', caption, icon }: StatCardProps) {
  return (
    <Card className="space-y-1">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate">{label}</p>
        {icon && <span className="text-slate">{icon}</span>}
      </div>
      <p className={cn('font-mono text-2xl font-semibold', toneClasses[tone])}>{value}</p>
      {caption && <p className="text-xs text-slate">{caption}</p>}
    </Card>
  )
}
