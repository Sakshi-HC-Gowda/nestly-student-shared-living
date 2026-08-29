import { useState } from 'react'
import type { FormEvent } from 'react'
import { Modal, Button, Input, Select, Textarea, FormAlert } from '@/components/common'
import { expensesApi } from '@/api/expenses'
import { useHousehold } from '@/hooks/useHousehold'
import type { Expense, ExpenseCategory, SplitMethod } from '@/types/expense'

interface AddExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: (expense: Expense) => void
}

const CATEGORIES: ExpenseCategory[] = ['Food', 'Groceries', 'Utilities', 'Rent', 'Transport', 'Household', 'Other']

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function AddExpenseModal({ isOpen, onClose, onCreated }: AddExpenseModalProps) {
  const { currentHousehold } = useHousehold()
  const members = currentHousehold?.members ?? []

  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<ExpenseCategory>('Food')
  const [paidByUserId, setPaidByUserId] = useState(members[0]?.userId ?? '')
  const [participantIds, setParticipantIds] = useState<string[]>(members.map((m) => m.userId))
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('Equal')
  const [splitValues, setSplitValues] = useState<Record<string, string>>({})
  const [date, setDate] = useState(todayIso())
  const [notes, setNotes] = useState('')

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function resetAndClose() {
    setAmount('')
    setDescription('')
    setCategory('Food')
    setPaidByUserId(members[0]?.userId ?? '')
    setParticipantIds(members.map((m) => m.userId))
    setSplitMethod('Equal')
    setSplitValues({})
    setDate(todayIso())
    setNotes('')
    setErrors({})
    setFormError(null)
    onClose()
  }

  function toggleParticipant(userId: string) {
    setParticipantIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    )
    setErrors((prev) => ({ ...prev, participants: '' }))
  }

  function validate(): Record<string, string> {
    const nextErrors: Record<string, string> = {}
    const numericAmount = Number(amount)

    if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      nextErrors.amount = 'Amount must be greater than ₹0.'
    }
    if (description.trim().length === 0) {
      nextErrors.description = 'Description is required.'
    }
    if (participantIds.length === 0) {
      nextErrors.participants = 'Select at least one participant.'
    }

    if (numericAmount > 0 && participantIds.length > 0) {
      if (splitMethod === 'Exact') {
        const sum = participantIds.reduce((total, id) => total + (Number(splitValues[id]) || 0), 0)
        if (Math.round(sum * 100) !== Math.round(numericAmount * 100)) {
          nextErrors.split = `Exact amounts add up to ₹${sum.toFixed(2)}, not ₹${numericAmount.toFixed(2)}.`
        }
      }
      if (splitMethod === 'Percentage') {
        const sum = participantIds.reduce((total, id) => total + (Number(splitValues[id]) || 0), 0)
        if (Math.round(sum) !== 100) {
          nextErrors.split = `Percentages add up to ${sum}%, not 100%.`
        }
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

      const expense = await expensesApi.createExpense(currentHousehold.id, {
        amount: Number(amount),
        description,
        category,
        paidByUserId,
        participantIds,
        splitMethod,
        splitValues: splitMethod === 'Equal' ? undefined : numericSplitValues,
        date: new Date(date).toISOString(),
        notes,
      })
      onCreated(expense)
      resetAndClose()
    } catch {
      setFormError('Could not save this expense. Try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const numericAmount = Number(amount) || 0
  const equalShare = participantIds.length > 0 ? numericAmount / participantIds.length : 0

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title="Add expense">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && <FormAlert message={formError} />}

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
          label="Description"
          placeholder="Grocery run"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value)
            setErrors((prev) => ({ ...prev, description: '' }))
          }}
          error={errors.description}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>

          <Select label="Paid by" value={paidByUserId} onChange={(e) => setPaidByUserId(e.target.value)}>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.name}
              </option>
            ))}
          </Select>
        </div>

        <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />

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
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleParticipant(m.userId)}
                    className="sr-only"
                  />
                  {m.name}
                </label>
              )
            })}
          </div>
          {errors.participants && <p className="mt-1.5 text-xs text-brick">{errors.participants}</p>}
        </fieldset>

        <Select
          label="Split method"
          value={splitMethod}
          onChange={(e) => setSplitMethod(e.target.value as SplitMethod)}
        >
          <option value="Equal">Equal</option>
          <option value="Exact">Exact amount</option>
          <option value="Percentage">Percentage</option>
        </Select>

        {splitMethod === 'Equal' && participantIds.length > 0 && (
          <p className="text-sm text-slate">
            ₹{numericAmount.toFixed(0)} / {participantIds.length} = ₹{equalShare.toFixed(2)} each
          </p>
        )}

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

        <Textarea label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Add expense'}
        </Button>
      </form>
    </Modal>
  )
}
