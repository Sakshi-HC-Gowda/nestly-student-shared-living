import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, Button, Input, FormAlert } from '@/components/common'
import { useAuth } from '@/hooks/useAuth'
import { isValidEmail, isEmpty } from '@/utils/validation'
import type { FormErrors } from '@/utils/validation'

interface LoginValues {
  email: string
  password: string
}

function validate(values: LoginValues): FormErrors<LoginValues> {
  const errors: FormErrors<LoginValues> = {}
  if (isEmpty(values.email)) {
    errors.email = 'Email is required.'
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Enter a valid email address.'
  }
  if (isEmpty(values.password)) {
    errors.password = 'Password is required.'
  }
  return errors
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [values, setValues] = useState<LoginValues>({ email: '', password: '' })
  const [errors, setErrors] = useState<FormErrors<LoginValues>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField<K extends keyof LoginValues>(key: K, value: LoginValues[K]) {
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
      await login(values)
      navigate('/dashboard')
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
          <h1 className="text-lg font-semibold text-ink">Log in</h1>
          <p className="text-sm text-slate">Welcome back to your household.</p>
        </div>

        {formError && <FormAlert message={formError} />}

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
          autoComplete="current-password"
          value={values.password}
          onChange={(e) => updateField('password', e.target.value)}
          error={errors.password}
          required
        />

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </Button>

        <p className="text-center text-sm text-slate">
          New here?{' '}
          <Link to="/register" className="font-medium text-moss-dark">
            Create an account
          </Link>
        </p>
      </form>
    </Card>
  )
}
