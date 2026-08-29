import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Modal, Button, Input, FormAlert } from '@/components/common'
import type { GroceryItem, CreateGroceryItemInput } from '@/types/grocery'

interface GroceryItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (input: CreateGroceryItemInput) => Promise<void>
  /** When set, the modal edits this item instead of creating a new one. */
  editingItem?: GroceryItem | null
}

export function GroceryItemModal({ isOpen, onClose, onSubmit, editingItem }: GroceryItemModalProps) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [note, setNote] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setName(editingItem?.name ?? '')
      setQuantity(editingItem?.quantity ?? '')
      setNote(editingItem?.note ?? '')
      setNameError(null)
      setFormError(null)
    }
  }, [isOpen, editingItem])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (name.trim().length === 0) {
      setNameError('Item name is required.')
      return
    }

    setFormError(null)
    setIsSubmitting(true)
    try {
      await onSubmit({ name, quantity: quantity || undefined, note: note || undefined })
      onClose()
    } catch {
      setFormError('Could not save this item. Try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingItem ? 'Edit item' : 'Add item'}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && <FormAlert message={formError} />}

        <Input
          label="Item name"
          placeholder="Milk"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setNameError(null)
          }}
          error={nameError ?? undefined}
          required
        />
        <Input label="Quantity (optional)" placeholder="2 L" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        <Input label="Note (optional)" placeholder="The unscented one" value={note} onChange={(e) => setNote(e.target.value)} />

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : editingItem ? 'Save changes' : 'Add item'}
        </Button>
      </form>
    </Modal>
  )
}
