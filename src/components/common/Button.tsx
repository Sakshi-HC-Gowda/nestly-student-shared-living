import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-moss text-white hover:bg-moss-dark active:bg-moss-dark disabled:bg-moss/50',
  secondary:
    'bg-surface text-ink border border-line hover:bg-slate-tint active:bg-slate-tint disabled:opacity-50',
  ghost: 'bg-transparent text-ink hover:bg-slate-tint active:bg-slate-tint disabled:opacity-50',
  danger: 'bg-brick text-white hover:bg-brick/90 active:bg-brick/90 disabled:bg-brick/50',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-4 text-sm gap-2',
}

/**
 * Base button used everywhere in Nestly. Keep this the only place button
 * styling is defined so every screen stays visually consistent.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-medium transition-colors',
          'disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
