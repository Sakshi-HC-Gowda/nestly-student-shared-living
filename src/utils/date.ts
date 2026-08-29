export function isToday(isoDate: string): boolean {
  const date = new Date(isoDate)
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

export function isSameMonth(isoDate: string, reference = new Date()): boolean {
  const date = new Date(isoDate)
  return date.getFullYear() === reference.getFullYear() && date.getMonth() === reference.getMonth()
}

export function formatShortDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.round(diffMs / 60000)
  const diffHours = Math.round(diffMinutes / 60)
  const diffDays = Math.round(diffHours / 24)

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return formatShortDate(isoDate)
}

export function formatCurrency(amount: number): string {
  const rounded = Math.round(amount * 100) / 100
  return `₹${rounded.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}
