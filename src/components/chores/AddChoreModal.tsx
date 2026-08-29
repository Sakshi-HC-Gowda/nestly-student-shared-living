import { useState } from 'react'
import type { FormEvent } from 'react'
import { Modal, Button, Input, Select, Textarea, FormAlert } from '@/components/common'
import { choresApi } from '@/api/chores'
import { useHousehold } from '@/hooks/useHousehold'
import type { Chore, ChoreFrequency } from '@/types/chore'

interface AddChoreModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: (chore: Chore) => void
}

function defaultDueDate(): string {
  return new Date().toISOString().slice(0, 10)
}

export function AddChoreModal({ isOpen, onClose, onCreated }: AddChoreModalProps) {
  const { currentHousehold } = useHousehold()
  const members = currentHousehold?.members ?? []

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignedToUserId, setAssignedToUserId] = useState(members[0]?.userId ?? '')
  const [dueDate, setDueDate] = useState(defaultDueDate())
  const [frequency, setFrequency] = useState<ChoreFrequency>('One-time')

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function resetAndClose() {
    setTitle('')
    setDescription('')
    setAssignedToUserId(members[0]?.userId ?? '')
    setDueDate(defaultDueDate())
    setFrequency('One-time')
    setErrors({})
    setFormError(null)
    onClose()
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!currentHousehold) return

    const nextErrors: Record<string, string> = {}
    if (title.trim().length === 0) nextErrors.title = 'Title is required.'
    if (!dueDate) nextErrors.dueDate = 'Due date is required.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setFormError(null)
    setIsSubmitting(true)
    try {
      const chore = await choresApi.createChore(currentHousehold.id, {
        title,
        description,
        assignedToUserId,
        dueDate: new Date(dueDate).toISOString(),
        frequency,
      })
      onCreated(chore)
      resetAndClose()
    } catch {
      setFormError('Could not save this chore. Try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title="Add chore">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && <FormAlert message={formError} />}

        <Input
          label="Title"
          placeholder="Clean kitchen"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            setErrors((prev) => ({ ...prev, title: '' }))
          }}
          error={errors.title}
          required
        />

        <Textarea
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Select label="Assigned to" value={assignedToUserId} onChange={(e) => setAssignedToUserId(e.target.value)}>
          {members.map((m) => (
            <option key={m.userId} value={m.userId}>
              {m.name}
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Due date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            error={errors.dueDate}
            required
          />
          <Select label="Frequency" value={frequency} onChange={(e) => setFrequency(e.target.value as ChoreFrequency)}>
            <option value="One-time">One-time</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </Select>
        </div>

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Add chore'}
        </Button>
      </form>
    </Modal>
  )
}
