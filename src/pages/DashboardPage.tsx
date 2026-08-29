import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Receipt, FileStack, ListChecks, ShoppingBasket, Clock3, Activity } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, StatCard, Badge, Skeleton, EmptyState, ErrorState } from '@/components/common'
import { useAuth } from '@/hooks/useAuth'
import { useHousehold } from '@/hooks/useHousehold'
import { expensesApi } from '@/api/expenses'
import { settlementsApi } from '@/api/settlements'
import { billsApi } from '@/api/bills'
import { choresApi } from '@/api/chores'
import { householdsApi } from '@/api/households'
import { formatCurrency, formatShortDate, isSameMonth, isToday } from '@/utils/date'
import type { Balance } from '@/types/settlement'
import type { Bill } from '@/types/bill'
import type { ActivityItem } from '@/types/activity'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

const QUICK_ACTIONS = [
  { label: 'Expense', path: '/expenses', icon: Receipt },
  { label: 'Bill', path: '/bills', icon: FileStack },
  { label: 'Chore', path: '/chores', icon: ListChecks },
  { label: 'Grocery', path: '/groceries', icon: ShoppingBasket },
]

type LoadState = 'loading' | 'error' | 'ready'

export function DashboardPage() {
  const { user } = useAuth()
  const { currentHousehold } = useHousehold()

  const [state, setState] = useState<LoadState>('loading')
  const [monthlySpending, setMonthlySpending] = useState(0)
  const [myBalance, setMyBalance] = useState(0)
  const [pendingDues, setPendingDues] = useState(0)
  const [todaysChoreCount, setTodaysChoreCount] = useState(0)
  const [nextBill, setNextBill] = useState<Bill | null>(null)
  const [activity, setActivity] = useState<ActivityItem[]>([])

  async function loadDashboard() {
    if (!currentHousehold || !user) return
    setState('loading')
    try {
      const [expenses, balances, bills, chores, recentActivity] = await Promise.all([
        expensesApi.getExpenses(currentHousehold.id),
        settlementsApi.getBalances(currentHousehold.id),
        billsApi.getBills(currentHousehold.id),
        choresApi.getChores(currentHousehold.id),
        householdsApi.getRecentActivity(currentHousehold.id),
      ])

      const spendingThisMonth = expenses
        .filter((e) => isSameMonth(e.date))
        .reduce((sum, e) => sum + e.amount, 0)

      const myBalanceEntry = balances.find((b: Balance) => b.userId === user.id)

      const unpaidBills = bills.filter((b) => b.status !== 'Paid')
      const myPendingDues = unpaidBills.reduce((sum, b) => sum + (b.shares[user.id] ?? 0), 0)
      const statusPriority: Record<string, number> = { Overdue: 0, Due: 1, Upcoming: 2 }
      const upcoming = [...unpaidBills].sort((a, b) => {
        const priorityDiff = statusPriority[a.status] - statusPriority[b.status]
        if (priorityDiff !== 0) return priorityDiff
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      })[0]

      const choresToday = chores.filter((c) => isToday(c.dueDate) && c.status !== 'Completed').length

      setMonthlySpending(spendingThisMonth)
      setMyBalance(myBalanceEntry?.amount ?? 0)
      setPendingDues(myPendingDues)
      setTodaysChoreCount(choresToday)
      setNextBill(upcoming ?? null)
      setActivity(recentActivity)
      setState('ready')
    } catch {
      setState('error')
    }
  }

  useEffect(() => {
    loadDashboard()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentHousehold?.id])

  if (!currentHousehold || !user) return null

  return (
    <>
      <PageHeader
        title={`${getGreeting()}, ${user.name.split(' ')[0]} 👋`}
        description={currentHousehold.name}
      />

      {state === 'loading' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-20" />
          <Skeleton className="h-40" />
        </div>
      )}

      {state === 'error' && <ErrorState description="Couldn't load your dashboard." onRetry={loadDashboard} />}

      {state === 'ready' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="Your Balance"
              value={formatCurrency(Math.abs(myBalance))}
              tone={myBalance >= 0 ? 'positive' : 'negative'}
              caption={myBalance >= 0 ? "You're owed" : 'You owe'}
            />
            <StatCard label="Monthly Spending" value={formatCurrency(monthlySpending)} />
            <StatCard label="Pending Dues" value={formatCurrency(pendingDues)} tone={pendingDues > 0 ? 'negative' : 'default'} />
            <StatCard label="Today's Chores" value={String(todaysChoreCount)} icon={<Clock3 size={14} />} />
          </div>

          <Card>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate">Upcoming Bills</p>
            {nextBill ? (
              <Link
                to={`/bills/${nextBill.id}`}
                className="flex items-center justify-between rounded-lg -mx-2 -my-1 px-2 py-1 hover:bg-slate-tint"
              >
                <div>
                  <p className="text-sm font-medium text-ink">{nextBill.title}</p>
                  <p className="text-xs text-slate">Due {formatShortDate(nextBill.dueDate)}</p>
                </div>
                <Badge tone={nextBill.status === 'Overdue' ? 'danger' : 'warning'}>{nextBill.status}</Badge>
              </Link>
            ) : (
              <p className="text-sm text-slate">No upcoming bills.</p>
            )}
          </Card>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate">Quick actions</p>
            <div className="grid grid-cols-4 gap-2">
              {QUICK_ACTIONS.map(({ label, path, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-line bg-surface py-3 text-xs font-medium text-ink-soft hover:bg-slate-tint"
                >
                  <Icon size={18} aria-hidden="true" />+ {label}
                </Link>
              ))}
            </div>
          </div>

          <Card padded={false}>
            <div className="flex items-center gap-2 px-4 pt-4">
              <Activity size={15} className="text-slate" aria-hidden="true" />
              <p className="text-xs font-medium uppercase tracking-wide text-slate">Recent activity</p>
            </div>
            {activity.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  icon={<Activity size={20} />}
                  title="Nothing yet"
                  description="Household activity will show up here."
                />
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {activity.map((item) => (
                  <li key={item.id} className="px-4 py-3 text-sm text-ink-soft">
                    {item.message}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </>
  )
}
