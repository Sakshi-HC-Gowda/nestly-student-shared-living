import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Card } from '@/components/common'

interface InviteCodeCardProps {
  code: string
}

export function InviteCodeCard({ code }: InviteCodeCardProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate">Invite code</p>
        <p className="font-mono text-xl font-semibold tracking-widest text-ink">{code}</p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
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
