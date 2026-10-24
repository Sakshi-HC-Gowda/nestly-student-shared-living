import { useEffect, useState } from 'react'
import { ListChecks, Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, Button, Skeleton, EmptyState, ErrorState } from '@/components/common'
import { ChoreListItem } from '@/components/chores/ChoreListItem'
import { AddChoreModal } from '@/components/chores/AddChoreModal'
import { useHousehold } from '@/hooks/useHousehold'
import { choresApi } from '@/api/chores'
import type { Chore } from '@/types/chore'

type LoadState = 'loading' | 'error' | 'ready'

export function ChoresPage() {
  const { currentHousehold } = useHousehold()
  const [chores, setChores] = useState<Chore[]>([])
  const [state, setState] = useState<LoadState>('loading')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  async function loadChores() {
    if (!currentHousehold) return
    setState('loading')
    try {
      const result = await choresApi.getChores(currentHousehold.id)
      setChores(result)
      setState('ready')
    } catch {
      setState('error')
    }
  }

  useEffect(() => {
    loadChores()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentHousehold?.id])

  async function handleComplete(id: string) {
    setActionError(null)
    setCompletingId(id)
    try {
      const updated = await choresApi.completeChore(id)
      setChores((prev) => prev.map((c) => (c.id === id ? updated : c)))
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not complete this chore.')
    } finally {
      setCompletingId(null)
    }
  }

  if (!currentHousehold) return null

  return (
    <>
      <PageHeader
        title="Chores"
        description="Who's doing what, and when"
        action={
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Add chore
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

      {state === 'error' && <ErrorState description="Couldn't load chores for this household." onRetry={loadChores} />}

      {actionError && <div className="mb-4"><ErrorState description={actionError} /></div>}

      {state === 'ready' && chores.length === 0 && (
        <EmptyState
          icon={<ListChecks size={22} />}
          title="No chores yet"
          description="Assign a chore so everyone knows what's next."
          action={{ label: 'Add chore', onClick: () => setIsModalOpen(true) }}
        />
      )}

      {state === 'ready' && chores.length > 0 && (
        <Card padded={false} className="divide-y divide-line">
          {chores.map((chore) => (
            <ChoreListItem
              key={chore.id}
              chore={chore}
              onComplete={handleComplete}
              isCompleting={completingId === chore.id}
            />
          ))}
        </Card>
      )}

      <AddChoreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={(chore) => setChores((prev) => [...prev, chore])}
      />
    </>
  )
}
