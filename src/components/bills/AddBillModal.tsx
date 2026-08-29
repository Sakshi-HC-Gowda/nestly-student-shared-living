import { useState } from 'react'
import type { FormEvent } from 'react'
import { Modal, Button, Input, Select, FormAlert } from '@/components/common'
import { billsApi } from '@/api/bills'
import { useHousehold } from '@/hooks/useHousehold'
import type { Bill, BillCategory, SplitMethod } from '@/types/bill'

interface AddBillModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: (bill: Bill) => void
}

const CATEGORIES: BillCategory[] = ['Electricity', 'Water', 'Internet', 'Rent', 'Gas', 'Other']

function defaultDueDate(): string {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  return date.toISOString().slice(0, 10)
}

export function AddBillModal({ isOpen, onClose, onCreated }: AddBillModalProps) {
  const { currentHousehold } = useHousehold()
  const members = currentHousehold?.members ?? []

  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState(defaultDueDate())
  const [category, setCategory] = useState<BillCategory>('Electricity')
  const [participantIds, setParticipantIds] = useState<string[]>(members.map((m) => m.userId))
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('Equal')
  const [splitValues, setSplitValues] = useState<Record<string, string>>({})
  const [recurring, setRecurring] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function resetAndClose() {
    setTitle('')
    setAmount('')
    setDueDate(defaultDueDate())
    setCategory('Electricity')
    setParticipantIds(members.map((m) => m.userId))
    setSplitMethod('Equal')
    setSplitValues({})
    setRecurring(false)
    setErrors({})
    setFormError(null)
    onClose()
  }

  function toggleParticipant(userId: string) {
    setParticipantIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
    setErrors((prev) => ({ ...prev, participants: '' }))
  }

  function validate(): Record<string, string> {
    const nextErrors: Record<string, string> = {}
    const numericAmount = Number(amount)

    if (title.trim().length === 0) nextErrors.title = 'Title is required.'
    if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      nextErrors.amount = 'Amount must be greater than ₹0.'
    }
    if (!dueDate) nextErrors.dueDate = 'Due date is required.'
    if (participantIds.length === 0) nextErrors.participants = 'Select at least one participant.'

    if (numericAmount > 0 && participantIds.length > 0) {
      const sum = participantIds.reduce((total, id) => total + (Number(splitValues[id]) || 0), 0)
      if (splitMethod === 'Exact' && Math.round(sum * 100) !== Math.round(numericAmount * 100)) {
        nextErrors.split = `Exact amounts add up to ₹${sum.toFixed(2)}, not ₹${numericAmount.toFixed(2)}.`
      }
      if (splitMethod === 'Percentage' && Math.round(sum) !== 100) {
        nextErrors.split = `Percentages add up to ${sum}%, not 100%.`
      }
    }

    return nextErrors
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!currentHousehold) return

    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setFormError(null)
    setIsSubmitting(true)
    try {
      const numericSplitValues: Record<string, number> = {}
      participantIds.forEach((id) => {
        numericSplitValues[id] = Number(splitValues[id]) || 0
      })

      const bill = await billsApi.createBill(
        currentHousehold.id,
        {
          title,
          amount: Number(amount),
          dueDate: new Date(dueDate).toISOString(),
          category,
          participantIds,
          splitMethod,
          recurring,
        },
        splitMethod === 'Equal' ? undefined : numericSplitValues,
      )
      onCreated(bill)
      resetAndClose()
    } catch {
      setFormError('Could not save this bill. Try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title="Add bill">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && <FormAlert message={formError} />}

        <Input
          label="Title"
          placeholder="Electricity"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            setErrors((prev) => ({ ...prev, title: '' }))
          }}
          error={errors.title}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Amount (₹)"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)
              setErrors((prev) => ({ ...prev, amount: '' }))
            }}
            error={errors.amount}
            required
          />
          <Input
            label="Due date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            error={errors.dueDate}
            required
          />
        </div>

        <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value as BillCategory)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-ink">Participants</legend>
          <div className="flex flex-wrap gap-2">
            {members.map((m) => {
              const checked = participantIds.includes(m.userId)
              return (
                <label
                  key={m.userId}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm ${
                    checked ? 'border-moss bg-moss-tint text-moss-dark' : 'border-line text-ink-soft'
                  }`}
                >
                  <input type="checkbox" checked={checked} onChange={() => toggleParticipant(m.userId)} className="sr-only" />
                  {m.name}
                </label>
              )
            })}
          </div>
          {errors.participants && <p className="mt-1.5 text-xs text-brick">{errors.participants}</p>}
        </fieldset>

        <Select label="Split method" value={splitMethod} onChange={(e) => setSplitMethod(e.target.value as SplitMethod)}>
          <option value="Equal">Equal</option>
          <option value="Exact">Exact amount</option>
          <option value="Percentage">Percentage</option>
        </Select>

        {(splitMethod === 'Exact' || splitMethod === 'Percentage') && participantIds.length > 0 && (
          <div className="space-y-2">
            {participantIds.map((id) => {
              const member = members.find((m) => m.userId === id)
              return (
                <div key={id} className="flex items-center gap-2">
                  <span className="w-24 shrink-0 truncate text-sm text-ink-soft">{member?.name}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={splitValues[id] ?? ''}
                    onChange={(e) => {
                      setSplitValues((prev) => ({ ...prev, [id]: e.target.value }))
                      setErrors((prev) => ({ ...prev, split: '' }))
                    }}
                    aria-label={`${splitMethod === 'Exact' ? 'Amount' : 'Percentage'} for ${member?.name}`}
                    className="h-10 flex-1 rounded-lg border border-line bg-surface px-3 text-sm focus-visible:outline-2 focus-visible:outline-moss focus-visible:outline-offset-2"
                  />
                  <span className="text-sm text-slate">{splitMethod === 'Exact' ? '₹' : '%'}</span>
                </div>
              )
            })}
            {errors.split && <p className="text-xs text-brick">{errors.split}</p>}
          </div>
        )}

        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={recurring}
            onChange={(e) => setRecurring(e.target.checked)}
            className="h-4 w-4 rounded border-line accent-[var(--color-moss)]"
          />
          This bill repeats every cycle
        </label>

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Add bill'}
        </Button>
      </form>
    </Modal>
  )
}
