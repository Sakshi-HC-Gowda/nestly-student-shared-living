import { formatCurrency } from '@/utils/date'

interface BarRowProps {
  label: string
  amount: number
  maxAmount: number
  tone?: 'moss' | 'amber'
}

export function BarRow({ label, amount, maxAmount, tone = 'moss' }: BarRowProps) {
  const percent = maxAmount > 0 ? Math.max((amount / maxAmount) * 100, 4) : 0
  const barColor = tone === 'moss' ? 'bg-moss' : 'bg-amber'

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-ink">{label}</span>
        <span className="font-mono text-ink-soft">{formatCurrency(amount)}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-tint">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
