import type { HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean
  interactive?: boolean
}

/** Base surface for grouped content: dashboard tiles, list rows, form panels. */
export function Card({ padded = true, interactive = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-card)] bg-surface border border-line',
        padded && 'p-4 sm:p-5',
        interactive && 'transition-shadow hover:shadow-md cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
