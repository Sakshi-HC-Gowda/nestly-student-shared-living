import { AlertTriangle } from 'lucide-react'

interface FormAlertProps {
  message: string
}

/** Small banner for form-level failures (e.g. "no account found"), as opposed to per-field errors on Input/Select. */
export function FormAlert({ message }: FormAlertProps) {
  return (
    <div role="alert" className="flex items-start gap-2 rounded-xl bg-brick-tint px-3 py-2.5 text-sm text-brick-dark">
      <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  )
}
