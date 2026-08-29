import { cn } from '@/utils/cn'

interface SkeletonProps {
  className?: string
}

/** Pulsing placeholder block for loading states. Animation is muted globally under prefers-reduced-motion. */
export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('animate-pulse rounded-lg bg-slate-tint', className)} aria-hidden="true" />
}
