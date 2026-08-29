import type { ReactNode, HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  tone?: 'moss' | 'amber' | 'ink'
}

const toneClasses: Record<NonNullable<TagProps['tone']>, string> = {
  moss: 'bg-moss-tint text-moss-dark',
  amber: 'bg-amber-tint text-amber-dark',
  ink: 'bg-surface text-ink border border-line',
}

/**
 * Nestly's signature shape: a small door-nameplate tag with a die-cut notch
 * on the left, standing in for "which home" throughout the app (household
 * switcher, invite codes, role labels). Kept to one recurring motif rather
 * than scattered decoration.
 */
export function Tag({ children, tone = 'moss', className, ...props }: TagProps) {
  return (
    <span
      className={cn(
        'relative inline-flex items-center gap-1.5 rounded-[var(--radius-tag)] py-1.5 pl-4 pr-3 text-sm font-medium',
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      <span
        className="absolute left-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-current opacity-40"
        aria-hidden="true"
      />
      {children}
    </span>
  )
}
