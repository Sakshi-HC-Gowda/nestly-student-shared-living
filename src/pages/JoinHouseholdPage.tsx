import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { Card, Button, Input, FormAlert } from '@/components/common'
import { useAuth } from '@/hooks/useAuth'
import { useHousehold } from '@/hooks/useHousehold'
import { householdsApi, InvitationError } from '@/api/households'
import type { Household } from '@/types/household'

export function JoinHouseholdPage() {
  const { user } = useAuth()
  const { addHousehold } = useHousehold()
  const navigate = useNavigate()

  const [code, setCode] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [joined, setJoined] = useState<Household | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!user) return
    if (code.trim().length === 0) {
      setFieldError('Enter an invitation code.')
      return
    }

    setFieldError(null)
    setIsSubmitting(true)
    try {
      const household = await householdsApi.joinHousehold(code, user)
      addHousehold(household)
      setJoined(household)
    } catch (error) {
      if (error instanceof InvitationError) {
        setFieldError(error.message)
      } else {
        setFieldError('Something went wrong. Try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (joined) {
    return (
      <Card className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-moss-tint text-moss-dark">
          <CheckCircle2 size={24} />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-ink">You're in {joined.name}</h1>
          <p className="text-sm text-slate">Head to the dashboard to see what's going on.</p>
        </div>
        <Button fullWidth onClick={() => navigate('/dashboard')}>
          Go to dashboard
        </Button>
      </Card>
    )
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <h1 className="text-lg font-semibold text-ink">Join a household</h1>
          <p className="text-sm text-slate">Enter the invitation code a roommate shared with you.</p>
        </div>

        {fieldError && <FormAlert message={fieldError} />}

        <Input
          label="Invitation code"
          placeholder="ABC123"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase())
            setFieldError(null)
          }}
          className="font-mono tracking-widest uppercase"
          maxLength={8}
          required
        />

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Checking code…' : 'Join household'}
        </Button>
      </form>
    </Card>
  )
}
