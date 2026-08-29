import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, Skeleton, ErrorState, EmptyState } from '@/components/common'
import { BarRow } from '@/components/analytics/BarRow'
import { useHousehold } from '@/hooks/useHousehold'
import { analyticsApi } from '@/api/analytics'
import { formatCurrency } from '@/utils/date'
import type { CategorySpending, MonthlyComparison, MemberContribution } from '@/types/analytics'

type LoadState = 'loading' | 'error' | 'ready'

const MONTH_LABEL = new Date().toLocaleDateString('en-IN', { month: 'long' })

export function AnalyticsPage() {
  const { currentHousehold } = useHousehold()
  const [categories, setCategories] = useState<CategorySpending[]>([])
  const [comparison, setComparison] = useState<MonthlyComparison | null>(null)
  const [contributions, setContributions] = useState<MemberContribution[]>([])
  const [state, setState] = useState<LoadState>('loading')

  async function load() {
    if (!currentHousehold) return
    setState('loading')
    try {
      const [categoryResult, comparisonResult, contributionResult] = await Promise.all([
        analyticsApi.getSpendingByCategory(currentHousehold.id),
        analyticsApi.getMonthlyComparison(currentHousehold.id),
        analyticsApi.getMemberContribution(currentHousehold.id),
      ])
      setCategories(categoryResult)
      setComparison(comparisonResult)
      setContributions(contributionResult)
      setState('ready')
    } catch {
      setState('error')
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentHousehold?.id])

  if (!currentHousehold) return null

  const maxCategory = Math.max(...categories.map((c) => c.amount), 0)
  const maxContribution = Math.max(...contributions.map((c) => c.amount), 0)

  return (
    <>
      <PageHeader title="Analytics" description="Household spending over time" />

      {state === 'loading' && (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      )}

      {state === 'error' && <ErrorState description="Couldn't load analytics." onRetry={load} />}

      {state === 'ready' && comparison && (
        <div className="space-y-4">
          <Card className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate">{MONTH_LABEL} spending</p>
              <p className="font-mono text-2xl font-semibold text-ink">{formatCurrency(comparison.currentMonth)}</p>
              <p className="text-xs text-slate">Previous month: {formatCurrency(comparison.previousMonth)}</p>
            </div>
            {comparison.changePercent !== null && (
              <span
                className={`flex items-center gap-1 rounded-[var(--radius-tag)] px-2.5 py-1.5 text-sm font-medium ${
                  comparison.changePercent > 0 ? 'bg-brick-tint text-brick-dark' : 'bg-moss-tint text-moss-dark'
                }`}
              >
                {comparison.changePercent > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {Math.abs(comparison.changePercent)}%
              </span>
            )}
          </Card>

          <Card className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate">Spending by category</p>
            {categories.length === 0 ? (
              <EmptyState icon={<BarChart3 size={20} />} title="No spending yet" description="Add an expense to see the breakdown." />
            ) : (
              <div className="space-y-3">
                {categories.map((c) => (
                  <BarRow key={c.category} label={c.category} amount={c.amount} maxAmount={maxCategory} tone="moss" />
                ))}
              </div>
            )}
          </Card>

          <Card className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate">Member contribution</p>
            {contributions.every((c) => c.amount === 0) ? (
              <p className="text-sm text-slate">Nobody's paid for anything this month yet.</p>
            ) : (
              <div className="space-y-3">
                {contributions.map((c) => (
                  <BarRow key={c.userId} label={c.name} amount={c.amount} maxAmount={maxContribution} tone="amber" />
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  )
}
