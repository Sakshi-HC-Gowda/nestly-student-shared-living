import { cn } from '@/utils/cn'

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// A restrained set of tints pulled from the token palette, not arbitrary hues.
const PALETTE = [
  'bg-moss-tint text-moss-dark',
  'bg-amber-tint text-amber-dark',
  'bg-brick-tint text-brick-dark',
  'bg-slate-tint text-ink-soft',
]

function colorForName(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

const sizeClasses = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
}

/** Renders a member's initials on a name-derived tint. Same name always gets the same color. */
export function Avatar({ name, size = 'md', className }: AvatarProps) {
  return (
    <span
      role="img"
      aria-label={name}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold',
        sizeClasses[size],
        colorForName(name),
        className,
      )}
    >
      {initials(name)}
    </span>
  )
}
