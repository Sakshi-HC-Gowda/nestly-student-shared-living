import { forwardRef, useId } from 'react'
import type { TextareaHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  helperText?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, id, className, required, ...props }, ref) => {
    const generatedId = useId()
    const textareaId = id ?? generatedId
    const messageId = error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={textareaId} className="text-sm font-medium text-ink">
          {label}
          {required && (
            <span className="text-brick" aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={messageId}
          rows={3}
          className={cn(
            'w-full rounded-xl border bg-surface px-3 py-2 text-sm text-ink placeholder:text-slate resize-none',
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

Textarea.displayName = 'Textarea'
