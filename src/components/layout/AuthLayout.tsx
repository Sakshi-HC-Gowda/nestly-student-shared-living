import { Outlet } from 'react-router-dom'
import { Home } from 'lucide-react'

/** Used for Landing/Login/Register/Create-Household/Join-Household/Invite — no sidebar or bottom nav yet. */
export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 py-10">
      <div className="mb-8 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-moss text-white">
          <Home size={18} />
        </span>
        <span className="font-display text-2xl font-semibold text-ink">Nestly</span>
      </div>
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  )
}
