import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
}

/** Shown when a mock/API call fails. States plainly what happened and offers a retry — no apology, no vagueness. */
export function ErrorState({
  title = "Couldn't load this",
  description = 'Something went wrong while fetching this data.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border border-brick-tint bg-brick-tint/40 px-6 py-12 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brick-tint text-brick-dark" aria-hidden="true">
        <AlertTriangle size={22} />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-ink">{title}</p>
        <p className="text-sm text-slate max-w-xs">{description}</p>
      </div>
      {onRetry && (
        <Button size="sm" variant="secondary" onClick={onRetry} className="mt-1">
          Try again
        </Button>
      )}
    </div>
  )
}
