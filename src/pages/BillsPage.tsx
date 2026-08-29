import { useEffect, useState } from 'react'
import { FileStack, Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, Button, Skeleton, EmptyState, ErrorState } from '@/components/common'
import { BillListItem } from '@/components/bills/BillListItem'
import { BillTable } from '@/components/bills/BillTable'
import { AddBillModal } from '@/components/bills/AddBillModal'
import { useAuth } from '@/hooks/useAuth'
import { useHousehold } from '@/hooks/useHousehold'
import { billsApi } from '@/api/bills'
import type { Bill } from '@/types/bill'

type LoadState = 'loading' | 'error' | 'ready'

export function BillsPage() {
  const { user } = useAuth()
  const { currentHousehold } = useHousehold()
  const [bills, setBills] = useState<Bill[]>([])
  const [state, setState] = useState<LoadState>('loading')
  const [isModalOpen, setIsModalOpen] = useState(false)

  async function loadBills() {
    if (!currentHousehold) return
    setState('loading')
    try {
      const result = await billsApi.getBills(currentHousehold.id)
      setBills(result)
      setState('ready')
    } catch {
      setState('error')
    }
  }

  useEffect(() => {
    loadBills()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentHousehold?.id])

  if (!currentHousehold || !user) return null

  return (
    <>
      <PageHeader
        title="Bills"
        description="Recurring and one-off household bills"
        action={
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Add bill
          </Button>
        }
      />

      {state === 'loading' && (
        <Card padded={false} className="divide-y divide-line">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4">
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </Card>
      )}

      {state === 'error' && <ErrorState description="Couldn't load bills for this household." onRetry={loadBills} />}

      {state === 'ready' && bills.length === 0 && (
        <EmptyState
          icon={<FileStack size={22} />}
          title="No bills yet"
          description="Add a bill so everyone knows their share."
          action={{ label: 'Add bill', onClick: () => setIsModalOpen(true) }}
        />
      )}

      {state === 'ready' && bills.length > 0 && (
        <>
          <Card padded={false} className="divide-y divide-line lg:hidden">
            {bills.map((bill) => (
              <BillListItem key={bill.id} bill={bill} myShare={bill.shares[user.id] ?? 0} />
            ))}
          </Card>
          <Card padded={false} className="hidden overflow-x-auto lg:block">
            <BillTable bills={bills} myUserId={user.id} />
          </Card>
        </>
      )}

      <AddBillModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreated={(bill) => setBills((prev) => [...prev, bill])} />
    </>
  )
}
