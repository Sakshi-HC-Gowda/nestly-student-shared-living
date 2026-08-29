import { NavLink } from 'react-router-dom'
import { Home } from 'lucide-react'
import { NAV_ITEMS } from './navItems'
import { cn } from '@/utils/cn'

/** Desktop-only sidebar. Full section list — nothing is hidden behind a "more" menu here. */
export function Sidebar() {
  return (
    <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:border-r lg:border-line lg:bg-surface lg:px-4 lg:py-6">
      <div className="mb-8 flex items-center gap-2 px-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-moss text-white">
          <Home size={16} />
        </span>
        <span className="font-display text-xl font-semibold text-ink">Nestly</span>
      </div>

      <nav aria-label="Main" className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-moss-tint text-moss-dark' : 'text-ink-soft hover:bg-slate-tint',
              )
            }
          >
            <Icon size={18} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
