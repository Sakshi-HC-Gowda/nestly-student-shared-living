import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { useHousehold } from '@/hooks/useHousehold'
import { Tag } from '@/components/common'
import { cn } from '@/utils/cn'

/** Lets the user see and switch which household's data is currently in view. */
export function HouseholdSwitcher() {
  const { households, currentHousehold, setCurrentHouseholdId } = useHousehold()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  if (!currentHousehold) return null

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="rounded-[var(--radius-tag)] focus-visible:outline-2 focus-visible:outline-moss focus-visible:outline-offset-2"
      >
        <Tag tone="moss">
          {currentHousehold.name}
          <ChevronDown size={14} aria-hidden="true" />
        </Tag>
      </button>

      {isOpen && households.length > 1 && (
        <div
          role="menu"
          aria-label="Switch household"
          className="absolute left-0 top-[calc(100%+6px)] z-30 min-w-48 overflow-hidden rounded-xl border border-line bg-surface shadow-lg"
        >
          {households.map((household) => {
            const isActive = household.id === currentHousehold.id
            return (
              <button
                key={household.id}
                role="menuitem"
                type="button"
                onClick={() => {
                  setCurrentHouseholdId(household.id)
                  setIsOpen(false)
                }}
                className={cn(
                  'flex w-full items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-slate-tint',
                  isActive ? 'text-moss-dark font-medium' : 'text-ink',
                )}
              >
                {household.name}
                {isActive && <Check size={14} aria-hidden="true" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
