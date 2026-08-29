export type FormErrors<T extends object> = Partial<Record<keyof T, string>>

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function isEmpty(value: string): boolean {
  return value.trim().length === 0
}
