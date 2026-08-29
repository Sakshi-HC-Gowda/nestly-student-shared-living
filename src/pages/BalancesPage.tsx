import { useEffect, useState } from 'react'
import { PartyPopper } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, Avatar, Button, Skeleton, ErrorState, EmptyState } from '@/components/common'
import { useAuth } from '@/hooks/useAuth'
import { useHousehold } from '@/hooks/useHousehold'
import { settlementsApi } from '@/api/settlements'
import { formatCurrency } from '@/utils/date'
import type { Balance, SuggestedSettlement } from '@/types/settlement'

type LoadState = 'loading' | 'error' | 'ready'

export function BalancesPage() {
  const { user } = useAuth()
  const { currentHousehold } = useHousehold()

  const [balances, setBalances] = useState<Balance[]>([])
  const [suggestions, setSuggestions] = useState<SuggestedSettlement[]>([])
  const [state, setState] = useState<LoadState>('loading')
  const [settlingKey, setSettlingKey] = useState<string | null>(null)

  async function load() {
    if (!currentHousehold) return
    setState('loading')
    try {
      const [balanceResult, suggestionResult] = await Promise.all([
        settlementsApi.getBalances(currentHousehold.id),
        settlementsApi.getSuggestedSettlements(currentHousehold.id),
      ])
      setBalances(balanceResult)
      setSuggestions(suggestionResult)
      setState('ready')
    } catch {
      setState('error')
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentHousehold?.id])

  async function handleMarkSettled(settlement: SuggestedSettlement) {
    if (!currentHousehold) return
    const key = `${settlement.fromUserId}-${settlement.toUserId}`
    setSettlingKey(key)
    try {
      await settlementsApi.markSettled(
        settlement.fromUserId,
        settlement.fromName,
        settlement.toUserId,
        settlement.toName,
        settlement.amount,
        currentHousehold.id,
      )
      await load()
    } finally {
      setSettlingKey(null)
    }
  }

  if (!currentHousehold || !user) return null

  return (
    <>
      <PageHeader title="Balances" description="Who owes what in this household" />

      {state === 'loading' && (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {state === 'error' && <ErrorState description="Couldn't load balances." onRetry={load} />}

      {state === 'ready' && (
        <div className="space-y-4">
          <Card padded={false}>
            <p className="px-4 pt-4 text-xs font-medium uppercase tracking-wide text-slate">Balances</p>
            <ul className="divide-y divide-line">
              {balances.map((balance) => {
                const isMe = balance.userId === user.id
                const isPositive = balance.amount >= 0
                return (
                  <li key={balance.userId} className="flex items-center justify-between gap-2 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <Avatar name={balance.name} size="sm" />
                      <span className="truncate text-sm text-ink">
                        {balance.name}
                        {isMe && <span className="text-slate"> (you)</span>}
                      </span>
                    </div>
                    <span className={`shrink-0 font-mono text-sm font-semibold ${isPositive ? 'text-moss-dark' : 'text-brick'}`}>
                      {isPositive ? '+' : '-'}
                      {formatCurrency(Math.abs(balance.amount))}
                    </span>
                  </li>
                )
              })}
            </ul>
          </Card>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate">Suggested settlements</p>
            {suggestions.length === 0 ? (
              <EmptyState
                icon={<PartyPopper size={22} />}
                title="All settled up"
                description="Nobody in this household owes anyone right now."
              />
            ) : (
              <Card padded={false} className="divide-y divide-line">
                {suggestions.map((s) => {
                  const key = `${s.fromUserId}-${s.toUserId}`
                  return (
                    <div key={key} className="flex items-center justify-between gap-3 px-4 py-3">
                      <p className="text-sm text-ink">
                        <span className="font-medium">{s.fromName}</span>
                        <span className="text-slate"> → </span>
                        <span className="font-medium">{s.toName}</span>
                        <span className="ml-2 font-mono text-slate">{formatCurrency(s.amount)}</span>
                      </p>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleMarkSettled(s)}
                        disabled={settlingKey === key}
                      >
                        {settlingKey === key ? 'Settling…' : 'Mark as Settled'}
                      </Button>
                    </div>
                  )
                })}
              </Card>
            )}
          </div>
        </div>
      )}
    </>
  )
}
