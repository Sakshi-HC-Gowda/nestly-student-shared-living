import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, Badge, Avatar, Skeleton, ErrorState } from '@/components/common'
import { expensesApi } from '@/api/expenses'
import { useHousehold } from '@/hooks/useHousehold'
import { formatCurrency, formatShortDate } from '@/utils/date'
import type { Expense } from '@/types/expense'

type LoadState = 'loading' | 'error' | 'not-found' | 'ready'

export function ExpenseDetailsPage() {
  const { id } = useParams()
  const { currentHousehold } = useHousehold()
  const [expense, setExpense] = useState<Expense | null>(null)
  const [state, setState] = useState<LoadState>('loading')

  function nameFor(userId: string): string {
    return currentHousehold?.members.find((m) => m.userId === userId)?.name ?? 'Former member'
  }

  async function loadExpense() {
    if (!id) return
    setState('loading')
    try {
      const result = await expensesApi.getExpenseById(id, currentHousehold?.id)
      if (!result) {
        setState('not-found')
        return
      }
      setExpense(result)
      setState('ready')
    } catch {
      setState('error')
    }
  }

  useEffect(() => {
    loadExpense()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  return (
    <>
      <Link to="/expenses" className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-slate hover:text-ink">
        <ArrowLeft size={15} /> Back to expenses
      </Link>

      {state === 'loading' && (
        <div className="space-y-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-40 w-full" />
        </div>
      )}

      {state === 'error' && <ErrorState description="Couldn't load this expense." onRetry={loadExpense} />}

      {state === 'not-found' && (
        <ErrorState title="Expense not found" description="This expense may have been removed." />
      )}

      {state === 'ready' && expense && (
        <>
          <PageHeader title={expense.description} description={formatShortDate(expense.date)} />

          <div className="space-y-4">
            <Card className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-3xl font-semibold text-ink">{formatCurrency(expense.amount)}</span>
                <Badge tone="info">{expense.category}</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-ink-soft">
                <Avatar name={expense.paidByName} size="sm" />
                {expense.paidByName} paid · split {expense.splitMethod.toLowerCase()}
              </div>
              {expense.notes && <p className="text-sm text-slate">{expense.notes}</p>}
            </Card>

            <Card padded={false}>
              <p className="px-4 pt-4 text-xs font-medium uppercase tracking-wide text-slate">Split between</p>
              <ul className="divide-y divide-line">
                {expense.participantIds.map((participantId) => {
                  const name = nameFor(participantId)
                  return (
                    <li key={participantId} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={name} size="sm" />
                        <span className="text-sm text-ink">{name}</span>
                      </div>
                      <span className="font-mono text-sm text-ink-soft">
                        {formatCurrency(expense.shares[participantId] ?? 0)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </Card>
          </div>
        </>
      )}
    </>
  )
}
