import { Navigate, Outlet } from 'react-router-dom'
import { useHousehold } from '@/hooks/useHousehold'

/** Sits inside ProtectedRoute. Sends anyone with zero households to onboarding first. */
export function RequireHousehold() {
  const { hasHousehold, isLoading } = useHousehold()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <p className="text-sm text-slate">Loading your households…</p>
      </div>
    )
  }

  if (!hasHousehold) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
