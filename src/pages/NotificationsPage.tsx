import { useEffect, useState } from 'react'
import { Bell, Receipt, FileStack, ListChecks, Users, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, Button, Skeleton, EmptyState, ErrorState } from '@/components/common'
import { useAuth } from '@/hooks/useAuth'
import { notificationsApi } from '@/api/notifications'
import { formatRelativeTime } from '@/utils/date'
import { cn } from '@/utils/cn'
import type { Notification, NotificationType } from '@/types/notification'

const TYPE_ICON: Record<NotificationType, typeof Bell> = {
  invitation: Users,
  expense: Receipt,
  settlement: Wallet,
  bill: FileStack,
  chore: ListChecks,
}

type LoadState = 'loading' | 'error' | 'ready'

export function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [state, setState] = useState<LoadState>('loading')

  async function load() {
    if (!user) return
    setState('loading')
    try {
      const result = await notificationsApi.getNotifications(user.id)
      setNotifications(result)
      setState('ready')
    } catch {
      setState('error')
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  async function handleMarkRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    await notificationsApi.markAsRead(id)
  }

  async function handleMarkAllRead() {
    if (!user) return
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    await notificationsApi.markAllAsRead(user.id)
  }

  const hasUnread = notifications.some((n) => !n.read)

  if (!user) return null

  return (
    <>
      <PageHeader
        title="Notifications"
        action={
          hasUnread ? (
            <Button size="sm" variant="ghost" onClick={handleMarkAllRead}>
              Mark all read
            </Button>
          ) : undefined
        }
      />

      {state === 'loading' && (
        <Card padded={false} className="divide-y divide-line">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4">
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </Card>
      )}

      {state === 'error' && <ErrorState description="Couldn't load notifications." onRetry={load} />}

      {state === 'ready' && notifications.length === 0 && (
        <EmptyState icon={<Bell size={22} />} title="No notifications" description="You're all caught up." />
      )}

      {state === 'ready' && notifications.length > 0 && (
        <Card padded={false} className="divide-y divide-line">
          {notifications.map((notification) => {
            const Icon = TYPE_ICON[notification.type]
            return (
              <button
                key={notification.id}
                type="button"
                onClick={() => !notification.read && handleMarkRead(notification.id)}
                className={cn(
                  'flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-slate-tint',
                  !notification.read && 'bg-moss-tint/40',
                )}
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-tint text-ink-soft">
                  <Icon size={15} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn('text-sm', notification.read ? 'text-ink-soft' : 'font-medium text-ink')}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-slate">{formatRelativeTime(notification.createdAt)}</p>
                </div>
                {!notification.read && (
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-moss" aria-label="Unread" />
                )}
              </button>
            )
          })}
        </Card>
      )}
    </>
  )
}
