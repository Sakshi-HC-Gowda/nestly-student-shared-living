import { Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { GroceryItem } from '@/types/grocery'

interface GroceryItemRowProps {
  item: GroceryItem
  onTogglePurchased: (id: string) => void
  onEdit: (item: GroceryItem) => void
  onDelete: (id: string) => void
}

export function GroceryItemRow({ item, onTogglePurchased, onEdit, onDelete }: GroceryItemRowProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <input
        type="checkbox"
        checked={item.purchased}
        onChange={() => onTogglePurchased(item.id)}
        aria-label={`Mark ${item.name} as ${item.purchased ? 'not purchased' : 'purchased'}`}
        className="h-5 w-5 shrink-0 rounded border-line accent-[var(--color-moss)]"
      />
      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-sm font-medium', item.purchased ? 'text-slate line-through' : 'text-ink')}>
          {item.name}
          {item.quantity && <span className="ml-1.5 font-normal text-slate">· {item.quantity}</span>}
        </p>
        {item.note && <p className="truncate text-xs text-slate">{item.note}</p>}
      </div>
      <button
        type="button"
        aria-label={`Edit ${item.name}`}
        onClick={() => onEdit(item)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-slate hover:bg-slate-tint hover:text-ink"
      >
        <Pencil size={14} />
      </button>
      <button
        type="button"
        aria-label={`Delete ${item.name}`}
        onClick={() => onDelete(item.id)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-slate hover:bg-slate-tint hover:text-brick"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}
