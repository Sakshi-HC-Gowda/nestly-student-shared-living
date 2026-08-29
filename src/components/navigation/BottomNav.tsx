import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from './navItems'
import { cn } from '@/utils/cn'

/** Mobile-only bottom tab bar. Shows the 5 sections used daily; Balances/Analytics/Members live in the sidebar and dashboard links. */
export function BottomNav() {
  const primaryItems = NAV_ITEMS.filter((item) => item.primary)

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 flex border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {primaryItems.map(({ label, path, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors',
              isActive ? 'text-moss-dark' : 'text-slate',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={20} aria-hidden="true" strokeWidth={isActive ? 2.5 : 2} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
