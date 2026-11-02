import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { MoreHorizontal } from 'lucide-react'
import { NAV_ITEMS, type NavItem } from './navItems'
import { cn } from '@/utils/cn'

/** Mobile-only bottom tab bar. Less frequent sections are grouped behind More. */
export function BottomNav() {
  const primaryItems = NAV_ITEMS.filter((item) => item.primary)
  const moreItems = NAV_ITEMS.filter((item) => !item.primary && ['Analytics', 'Members'].includes(item.label))
  const location = useLocation()
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const navigationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isMoreOpen) return

    function handlePointerDown(event: PointerEvent) {
      if (navigationRef.current && !navigationRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsMoreOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMoreOpen])

  const isMoreActive = moreItems.some((item) => location.pathname.startsWith(item.path))

  return (
    <div ref={navigationRef}>
      {isMoreOpen && (
        <div
          className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-3 z-30 min-w-44 rounded-xl border border-line bg-surface p-2 shadow-lg lg:hidden"
          aria-label="More navigation"
        >
          {moreItems.map(({ label, path, icon: Icon }) => (
            <MoreNavLink key={path} label={label} path={path} icon={Icon} onNavigate={() => setIsMoreOpen(false)} />
          ))}
        </div>
      )}

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
                'flex min-w-0 flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors',
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
        <button
          type="button"
          aria-expanded={isMoreOpen}
          aria-haspopup="menu"
          onClick={() => setIsMoreOpen((open) => !open)}
          className={cn(
            'flex min-w-0 flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors',
            isMoreActive || isMoreOpen ? 'text-moss-dark' : 'text-slate',
          )}
        >
          <MoreHorizontal size={20} aria-hidden="true" strokeWidth={isMoreActive || isMoreOpen ? 2.5 : 2} />
          More
        </button>
      </nav>
    </div>
  )
}

function MoreNavLink({
  label,
  path,
  icon: Icon,
  onNavigate,
}: NavItem & { onNavigate: () => void }) {
  return (
    <NavLink
      to={path}
      role="menuitem"
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
          isActive ? 'bg-moss-tint text-moss-dark' : 'text-ink-soft hover:bg-slate-tint',
        )
      }
    >
      <Icon size={18} aria-hidden="true" />
      {label}
    </NavLink>
  )
}
