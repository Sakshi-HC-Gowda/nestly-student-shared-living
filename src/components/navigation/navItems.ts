import {
  LayoutDashboard,
  Receipt,
  Scale,
  FileStack,
  ListChecks,
  ShoppingBasket,
  BarChart3,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
  /** Shown in the mobile bottom nav (kept to 5 for touch comfort). */
  primary?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, primary: true },
  { label: 'Expenses', path: '/expenses', icon: Receipt, primary: true },
  { label: 'Balances', path: '/balances', icon: Scale },
  { label: 'Bills', path: '/bills', icon: FileStack, primary: true },
  { label: 'Chores', path: '/chores', icon: ListChecks, primary: true },
  { label: 'Groceries', path: '/groceries', icon: ShoppingBasket, primary: true },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { label: 'Members', path: '/members', icon: Users },
]
