import { useEffect, useRef, useState } from 'react'
import { MoreVertical } from 'lucide-react'

interface MemberActionsMenuProps {
  memberName: string
  isBusy: boolean
  onTransferOwnership: () => void
  onRemove: () => void
}

export function MemberActionsMenu({ memberName, isBusy, onTransferOwnership, onRemove }: MemberActionsMenuProps) {
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

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={`Actions for ${memberName}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        disabled={isBusy}
        className="flex h-8 w-8 items-center justify-center rounded-full text-slate hover:bg-slate-tint focus-visible:outline-2 focus-visible:outline-moss focus-visible:outline-offset-2"
      >
        <MoreVertical size={16} />
      </button>
      {isOpen && (
        <div
          role="menu"
          aria-label={`Actions for ${memberName}`}
          className="absolute right-0 top-[calc(100%+4px)] z-10 min-w-40 overflow-hidden rounded-xl border border-line bg-surface shadow-lg"
        >
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setIsOpen(false)
              onTransferOwnership()
            }}
            className="block w-full px-3 py-2.5 text-left text-sm text-ink hover:bg-slate-tint"
          >
            Transfer ownership
          </button>
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setIsOpen(false)
              onRemove()
            }}
            className="block w-full px-3 py-2.5 text-left text-sm text-brick-dark hover:bg-brick-tint"
          >
            Remove member
          </button>
        </div>
      )}
    </div>
  )
}
