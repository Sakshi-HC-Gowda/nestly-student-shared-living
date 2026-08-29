import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { Card, Button, Input, Select, FormAlert } from '@/components/common'
import { useAuth } from '@/hooks/useAuth'
import { useHousehold } from '@/hooks/useHousehold'
import { householdsApi } from '@/api/households'
import { isEmpty } from '@/utils/validation'
import type { FormErrors } from '@/utils/validation'
import type { CreateHouseholdInput, Household } from '@/types/household'

function validate(values: CreateHouseholdInput): FormErrors<CreateHouseholdInput> {
  const errors: FormErrors<CreateHouseholdInput> = {}
  if (isEmpty(values.name)) {
    errors.name = 'Household name is required.'
  }
  return errors
}

export function CreateHouseholdPage() {
  const { user } = useAuth()
  const { addHousehold } = useHousehold()
  const navigate = useNavigate()

  const [values, setValues] = useState<CreateHouseholdInput>({ name: '', type: 'Shared Apartment' })
  const [errors, setErrors] = useState<FormErrors<CreateHouseholdInput>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [created, setCreated] = useState<Household | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!user) return
    const validationErrors = validate(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setFormError(null)
    setIsSubmitting(true)
    try {
      const household = await householdsApi.createHousehold(values, user)
      addHousehold(household)
      setCreated(household)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not create the household. Try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (created) {
    return (
      <Card className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-moss-tint text-moss-dark">
          <CheckCircle2 size={24} />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-ink">{created.name} is ready</h1>
          <p className="text-sm text-slate">You're the owner. Invite your roommates to get started.</p>
        </div>
        <Button fullWidth onClick={() => navigate('/invite')}>
          Invite roommates
        </Button>
        <Button variant="ghost" fullWidth onClick={() => navigate('/dashboard')}>
          Skip for now
        </Button>
      </Card>
    )
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <h1 className="text-lg font-semibold text-ink">Create a household</h1>
          <p className="text-sm text-slate">You'll be the owner and can invite roommates next.</p>
        </div>

        {formError && <FormAlert message={formError} />}

        <Input
          label="Household name"
          placeholder="Green Nest"
          value={values.name}
          onChange={(e) => {
            setValues((prev) => ({ ...prev, name: e.target.value }))
            setErrors((prev) => ({ ...prev, name: undefined }))
          }}
          error={errors.name}
          required
        />

        <Select
          label="Household type"
          value={values.type}
          onChange={(e) =>
            setValues((prev) => ({ ...prev, type: e.target.value as CreateHouseholdInput['type'] }))
          }
        >
          <option value="Shared Apartment">Shared Apartment</option>
          <option value="PG">PG</option>
          <option value="Hostel">Hostel</option>
          <option value="Other">Other</option>
        </Select>

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Creating…' : 'Create household'}
        </Button>
      </form>
    </Card>
  )
}
