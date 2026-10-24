import { Navigate, Outlet } from 'react-router-dom'
import { useHousehold } from '@/hooks/useHousehold'
import { ErrorState } from '@/components/common'

/** Sits inside ProtectedRoute. Sends anyone with zero households to onboarding first. */
export function RequireHousehold() {
  const { hasHousehold, isLoading, error, refreshHouseholds } = useHousehold()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <p className="text-sm text-slate">Loading your households…</p>
      </div>
    )
  }

  if (error) {
    return <ErrorState description={error} onRetry={refreshHouseholds} />
  }

  if (!hasHousehold) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
