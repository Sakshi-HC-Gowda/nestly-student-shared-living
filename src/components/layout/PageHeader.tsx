import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
        {description && <p className="mt-0.5 text-sm text-slate">{description}</p>}
      </div>
      {action}
    </div>
  )
}
