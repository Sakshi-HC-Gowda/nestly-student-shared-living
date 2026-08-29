import { forwardRef, useId } from 'react'
import type { SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  helperText?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, id, className, required, children, ...props }, ref) => {
    const generatedId = useId()
    const selectId = id ?? generatedId
    const messageId = error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={selectId} className="text-sm font-medium text-ink">
          {label}
          {required && (
            <span className="text-brick" aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </label>
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={messageId}
            className={cn(
              'h-11 w-full appearance-none rounded-xl border bg-surface px-3 pr-9 text-sm text-ink',
              'focus-visible:outline-2 focus-visible:outline-moss focus-visible:outline-offset-2',
              error ? 'border-brick' : 'border-line',
              className,
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate"
            aria-hidden="true"
          />
        </div>
        {error ? (
          <p id={messageId} className="text-xs text-brick">
            {error}
          </p>
        ) : helperText ? (
          <p id={messageId} className="text-xs text-slate">
            {helperText}
          </p>
        ) : null}
      </div>
    )
  },
)

Select.displayName = 'Select'
