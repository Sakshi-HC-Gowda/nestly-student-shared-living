import { useEffect, useState } from 'react'
import { ShoppingBasket, Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, Button, Skeleton, EmptyState, ErrorState } from '@/components/common'
import { GroceryItemRow } from '@/components/groceries/GroceryItemRow'
import { GroceryItemModal } from '@/components/groceries/GroceryItemModal'
import { useAuth } from '@/hooks/useAuth'
import { useHousehold } from '@/hooks/useHousehold'
import { groceriesApi } from '@/api/groceries'
import type { GroceryItem, CreateGroceryItemInput } from '@/types/grocery'

type LoadState = 'loading' | 'error' | 'ready'

export function GroceryPage() {
  const { user } = useAuth()
  const { currentHousehold } = useHousehold()
  const [items, setItems] = useState<GroceryItem[]>([])
  const [state, setState] = useState<LoadState>('loading')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null)

  async function loadItems() {
    if (!currentHousehold) return
    setState('loading')
    try {
      const result = await groceriesApi.getItems(currentHousehold.id)
      setItems(result)
      setState('ready')
    } catch {
      setState('error')
    }
  }

  useEffect(() => {
    loadItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentHousehold?.id])

  async function handleTogglePurchased(id: string) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, purchased: !item.purchased } : item)))
    await groceriesApi.togglePurchased(id)
  }

  async function handleDelete(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id))
    await groceriesApi.deleteItem(id)
  }

  async function handleSubmit(input: CreateGroceryItemInput) {
    if (!currentHousehold || !user) return
    if (editingItem) {
      const updated = await groceriesApi.updateItem(editingItem.id, input)
      setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
    } else {
      const created = await groceriesApi.addItem(currentHousehold.id, input, user.id, user.name)
      setItems((prev) => [...prev, created])
    }
  }

  const pending = items.filter((item) => !item.purchased)
  const purchased = items.filter((item) => item.purchased)

  if (!currentHousehold) return null

  return (
    <>
      <PageHeader
        title="Groceries"
        description="Shared shopping list"
        action={
          <Button
            size="sm"
            onClick={() => {
              setEditingItem(null)
              setIsModalOpen(true)
            }}
          >
            <Plus size={16} /> Add item
          </Button>
        }
      />

      {state === 'loading' && (
        <Card padded={false} className="divide-y divide-line">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4">
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </Card>
      )}

      {state === 'error' && <ErrorState description="Couldn't load the grocery list." onRetry={loadItems} />}

      {state === 'ready' && items.length === 0 && (
        <EmptyState
          icon={<ShoppingBasket size={22} />}
          title="Grocery list is empty"
          description="Add the first thing this household needs."
          action={{ label: 'Add item', onClick: () => setIsModalOpen(true) }}
        />
      )}

      {state === 'ready' && items.length > 0 && (
        <div className="space-y-4">
          <Card padded={false} className="divide-y divide-line">
            {pending.map((item) => (
              <GroceryItemRow
                key={item.id}
                item={item}
                onTogglePurchased={handleTogglePurchased}
                onEdit={(i) => {
                  setEditingItem(i)
                  setIsModalOpen(true)
                }}
                onDelete={handleDelete}
              />
            ))}
            {pending.length === 0 && <p className="px-4 py-3 text-sm text-slate">Everything's been picked up 🎉</p>}
          </Card>

          {purchased.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate">Purchased</p>
              <Card padded={false} className="divide-y divide-line">
                {purchased.map((item) => (
                  <GroceryItemRow
                    key={item.id}
                    item={item}
                    onTogglePurchased={handleTogglePurchased}
                    onEdit={(i) => {
                      setEditingItem(i)
                      setIsModalOpen(true)
                    }}
                    onDelete={handleDelete}
                  />
                ))}
              </Card>
            </div>
          )}
        </div>
      )}

      <GroceryItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingItem(null)
        }}
        onSubmit={handleSubmit}
        editingItem={editingItem}
      />
    </>
  )
}
