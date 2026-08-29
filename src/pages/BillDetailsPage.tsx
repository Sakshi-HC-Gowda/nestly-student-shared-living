import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, Badge, Avatar, Button, Skeleton, ErrorState } from '@/components/common'
import type { BadgeTone } from '@/components/common'
import { billsApi } from '@/api/bills'
import { useHousehold } from '@/hooks/useHousehold'
import { formatCurrency, formatShortDate } from '@/utils/date'
import type { Bill } from '@/types/bill'

type LoadState = 'loading' | 'error' | 'not-found' | 'ready'

const STATUS_TONE: Record<Bill['status'], BadgeTone> = {
  Upcoming: 'info',
  Due: 'warning',
  Paid: 'success',
  Overdue: 'danger',
}

export function BillDetailsPage() {
  const { id } = useParams()
  const { currentHousehold } = useHousehold()
  const [bill, setBill] = useState<Bill | null>(null)
  const [state, setState] = useState<LoadState>('loading')
  const [isMarkingPaid, setIsMarkingPaid] = useState(false)

  function nameFor(userId: string): string {
    return currentHousehold?.members.find((m) => m.userId === userId)?.name ?? 'Former member'
  }

  async function load() {
    if (!id) return
    setState('loading')
    try {
      const result = await billsApi.getBillById(id)
      if (!result) {
        setState('not-found')
        return
      }
      setBill(result)
      setState('ready')
    } catch {
      setState('error')
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleMarkPaid() {
    if (!bill) return
    setIsMarkingPaid(true)
    try {
      const updated = await billsApi.markBillPaid(bill.id)
      setBill(updated)
    } finally {
      setIsMarkingPaid(false)
    }
  }

  return (
    <>
      <Link to="/bills" className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-slate hover:text-ink">
        <ArrowLeft size={15} /> Back to bills
      </Link>

      {state === 'loading' && (
        <div className="space-y-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-40 w-full" />
        </div>
      )}

      {state === 'error' && <ErrorState description="Couldn't load this bill." onRetry={load} />}
      {state === 'not-found' && <ErrorState title="Bill not found" description="This bill may have been removed." />}

      {state === 'ready' && bill && (
        <>
          <PageHeader title={bill.title} description={`Due ${formatShortDate(bill.dueDate)}`} />

          <div className="space-y-4">
            <Card className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-3xl font-semibold text-ink">{formatCurrency(bill.amount)}</span>
                <Badge tone={STATUS_TONE[bill.status]}>{bill.status}</Badge>
              </div>
              <p className="text-sm text-ink-soft">
                {bill.category} · split {bill.splitMethod.toLowerCase()}
                {bill.recurring && ' · recurring'}
              </p>
              {bill.status !== 'Paid' && (
                <Button onClick={handleMarkPaid} disabled={isMarkingPaid} fullWidth>
                  <CheckCircle2 size={16} />
                  {isMarkingPaid ? 'Marking paid…' : 'Mark bill paid'}
                </Button>
              )}
            </Card>

            <Card padded={false}>
              <p className="px-4 pt-4 text-xs font-medium uppercase tracking-wide text-slate">Split between</p>
              <ul className="divide-y divide-line">
                {bill.participantIds.map((participantId) => (
                  <li key={participantId} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={nameFor(participantId)} size="sm" />
                      <span className="text-sm text-ink">{nameFor(participantId)}</span>
                    </div>
                    <span className="font-mono text-sm text-ink-soft">{formatCurrency(bill.shares[participantId] ?? 0)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </>
      )}
    </>
  )
}
