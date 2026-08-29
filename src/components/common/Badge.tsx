import type { ReactNode } from 'react'
import { CheckCircle2, Clock, AlertTriangle, XCircle, Circle } from 'lucide-react'
import { cn } from '@/utils/cn'

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

interface BadgeProps {
  tone: BadgeTone
  children: ReactNode
  icon?: ReactNode
  className?: string
}

const toneClasses: Record<BadgeTone, string> = {
  success: 'bg-moss-tint text-moss-dark',
  warning: 'bg-amber-tint text-amber-dark',
  danger: 'bg-brick-tint text-brick-dark',
  info: 'bg-slate-tint text-ink-soft',
  neutral: 'bg-slate-tint text-slate',
}

// Default icon per tone so status is legible without relying on color alone.
const toneIcons: Record<BadgeTone, ReactNode> = {
  success: <CheckCircle2 size={12} strokeWidth={2.5} />,
  warning: <Clock size={12} strokeWidth={2.5} />,
  danger: <AlertTriangle size={12} strokeWidth={2.5} />,
  info: <Circle size={12} strokeWidth={2.5} fill="currentColor" />,
  neutral: <XCircle size={12} strokeWidth={2.5} />,
}

/** Small status pill used for invitation, bill, chore and grocery states. */
export function Badge({ tone, children, icon, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-[var(--radius-tag)] px-2 py-1 text-xs font-medium',
        toneClasses[tone],
        className,
      )}
    >
      {icon ?? toneIcons[tone]}
      {children}
    </span>
  )
}
