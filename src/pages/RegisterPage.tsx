import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, Button, Input, FormAlert } from '@/components/common'
import { useAuth } from '@/hooks/useAuth'
import { isValidEmail, isEmpty } from '@/utils/validation'
import type { FormErrors } from '@/utils/validation'

interface RegisterValues {
  name: string
  email: string
  password: string
  confirmPassword: string
}

const MIN_PASSWORD_LENGTH = 8

function validate(values: RegisterValues): FormErrors<RegisterValues> {
  const errors: FormErrors<RegisterValues> = {}
  if (isEmpty(values.name)) {
    errors.name = 'Name is required.'
  }
  if (isEmpty(values.email)) {
    errors.email = 'Email is required.'
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Enter a valid email address.'
  }
  if (isEmpty(values.password)) {
    errors.password = 'Password is required.'
  } else if (values.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`
  }
  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.'
  }
  return errors
}

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [values, setValues] = useState<RegisterValues>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<FormErrors<RegisterValues>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField<K extends keyof RegisterValues>(key: K, value: RegisterValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const validationErrors = validate(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setFormError(null)
    setIsSubmitting(true)
    try {
      await register(values)
      navigate('/onboarding')
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Something went wrong. Try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <h1 className="text-lg font-semibold text-ink">Create an account</h1>
          <p className="text-sm text-slate">Set up shared living with your roommates.</p>
        </div>

        {formError && <FormAlert message={formError} />}

        <Input
          label="Full name"
          autoComplete="name"
          value={values.name}
          onChange={(e) => updateField('name', e.target.value)}
          error={errors.name}
          required
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => updateField('email', e.target.value)}
          error={errors.email}
          required
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={(e) => updateField('password', e.target.value)}
          error={errors.password}
          helperText={errors.password ? undefined : `At least ${MIN_PASSWORD_LENGTH} characters.`}
          required
        />
        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={(e) => updateField('confirmPassword', e.target.value)}
          error={errors.confirmPassword}
          required
        />

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>

        <p className="text-center text-sm text-slate">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-moss-dark">
            Log in
          </Link>
        </p>
      </form>
    </Card>
  )
}
