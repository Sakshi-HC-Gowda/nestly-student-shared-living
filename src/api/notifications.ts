import type { Notification } from '@/types/notification'
import { mockNotifications } from '@/data/mockData'

const MOCK_DELAY_MS = 350

function delay<T>(value: T, ms = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export const notificationsApi = {
  async getNotifications(userId: string): Promise<Notification[]> {
    const notifications = mockNotifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return delay(notifications)
  },

  async markAsRead(id: string): Promise<Notification> {
    const notification = mockNotifications.find((n) => n.id === id)
    if (!notification) {
      return Promise.reject(new Error('Notification not found.'))
    }
    notification.read = true
    return delay(notification)
  },

  async markAllAsRead(userId: string): Promise<void> {
    mockNotifications.filter((n) => n.userId === userId).forEach((n) => (n.read = true))
    return delay(undefined)
  },
}
