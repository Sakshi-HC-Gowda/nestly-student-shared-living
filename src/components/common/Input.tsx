import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
}

/**
 * Text input paired with a real <label>, and an error/helper message linked
 * via aria-describedby so screen readers announce it alongside the field.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, id, className, required, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id ?? generatedId
    const messageId = error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-ink">
          {label}
          {required && (
            <span className="text-brick" aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </label>
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={messageId}
          className={cn(
            'h-11 w-full rounded-xl border bg-surface px-3 text-sm text-ink placeholder:text-slate',
            'focus-visible:outline-2 focus-visible:outline-moss focus-visible:outline-offset-2',
            error ? 'border-brick' : 'border-line',
            className,
          )}
          {...props}
        />
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

Input.displayName = 'Input'
