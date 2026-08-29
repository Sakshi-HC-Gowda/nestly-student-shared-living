import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { HouseholdSwitcher } from '@/components/household/HouseholdSwitcher'
import { Avatar } from '@/components/common'
import { useAuth } from '@/hooks/useAuth'

export function TopBar() {
  const { user } = useAuth()

  return (
    <header className="flex items-center justify-between border-b border-line bg-surface px-4 py-3 lg:px-8">
      <HouseholdSwitcher />

      <div className="flex items-center gap-3">
        <Link
          to="/notifications"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-slate-tint"
        >
          <Bell size={18} />
          <span
            className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brick"
            aria-hidden="true"
          />
        </Link>
        <Link to="/profile" aria-label="Profile">
          {user && <Avatar name={user.name} size="sm" />}
        </Link>
      </div>
    </header>
  )
}
