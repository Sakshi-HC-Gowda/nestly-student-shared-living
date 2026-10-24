import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Card } from '@/components/common'

interface InviteCodeCardProps {
  code?: string
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
}

export function InviteCodeCard({ code, isLoading = false, error = null, onRetry }: InviteCodeCardProps) {
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState<string | null>(null)
  const canCopy = Boolean(code) && !isLoading && !error

  async function handleCopy() {
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      setCopyError(null)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
      setCopyError('Could not copy code.')
    }
  }

  return (
    <Card className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate">Invite code</p>
        <p className="font-mono text-xl font-semibold tracking-widest text-ink">
          {isLoading ? 'Loading...' : error ? 'Unavailable' : code || 'No code'}
        </p>
        {(error || copyError) && (
          <p className="mt-1 text-xs text-brick">
            {copyError ?? error}
            {error && onRetry && (
              <button type="button" onClick={onRetry} className="ml-2 font-medium underline">
                Retry
              </button>
            )}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={handleCopy}
        disabled={!canCopy}
        className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink-soft hover:bg-slate-tint focus-visible:outline-2 focus-visible:outline-moss focus-visible:outline-offset-2"
      >
        {copied ? (
          <>
            <Check size={15} className="text-moss-dark" /> Copied
          </>
        ) : (
          <>
            <Copy size={15} /> Copy
          </>
        )}
      </button>
    </Card>
  )
}
