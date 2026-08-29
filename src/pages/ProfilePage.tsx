import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, Avatar, Button, Tag } from '@/components/common'
import { useAuth } from '@/hooks/useAuth'
import { useHousehold } from '@/hooks/useHousehold'

export function ProfilePage() {
  const { user, logout } = useAuth()
  const { currentHousehold } = useHousehold()
  const navigate = useNavigate()
  const [emailNotifications, setEmailNotifications] = useState(true)

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  if (!user) return null

  return (
    <>
      <PageHeader title="Profile" />

      <div className="space-y-4">
        <Card className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar name={user.name} size="lg" />
            <div>
              <p className="font-medium text-ink">{user.name}</p>
              <p className="text-sm text-slate">{user.email}</p>
            </div>
          </div>
          {currentHousehold && (
            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate">Current household</p>
              <Tag tone="moss">{currentHousehold.name}</Tag>
            </div>
          )}
        </Card>

        <Card className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate">Preferences</p>
          <label className="flex items-center justify-between">
            <span className="text-sm text-ink">Email notifications</span>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              aria-label="Toggle email notifications"
              className="h-5 w-5 rounded border-line accent-[var(--color-moss)]"
            />
          </label>
        </Card>

        <Button variant="secondary" onClick={handleLogout}>
          Log out
        </Button>
      </div>
    </>
  )
}
