import { useState } from 'react'
import { Link } from 'react-router-dom'
import { UserPlus, Crown } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, Avatar, Badge, Button } from '@/components/common'
import { MemberActionsMenu } from '@/components/household/MemberActionsMenu'
import { useAuth } from '@/hooks/useAuth'
import { useHousehold } from '@/hooks/useHousehold'
import { householdsApi } from '@/api/households'

/** Owner-only actions (remove/transfer) are simulated frontend interactions per the Week 2 spec. */
export function MembersPage() {
  const { user } = useAuth()
  const { currentHousehold, updateHousehold } = useHousehold()
  const [busyUserId, setBusyUserId] = useState<string | null>(null)

  if (!currentHousehold || !user) return null

  const me = currentHousehold.members.find((m) => m.userId === user.id)
  const isOwner = me?.role === 'OWNER'

  async function handleRemove(userId: string) {
    if (!currentHousehold) return
    setBusyUserId(userId)
    try {
      const updated = await householdsApi.removeMember(currentHousehold.id, userId)
      updateHousehold(updated)
    } finally {
      setBusyUserId(null)
    }
  }

  async function handleTransfer(userId: string) {
    if (!currentHousehold) return
    setBusyUserId(userId)
    try {
      const updated = await householdsApi.transferOwnership(currentHousehold.id, userId)
      updateHousehold(updated)
    } finally {
      setBusyUserId(null)
    }
  }

  return (
    <>
      <PageHeader
        title="Members"
        description={currentHousehold.name}
        action={
          isOwner && (
            <Link to="/invite">
              <Button size="sm">
                <UserPlus size={16} /> Invite
              </Button>
            </Link>
          )
        }
      />

      <Card className="divide-y divide-line p-0">
        {currentHousehold.members.map((member) => {
          const isMe = member.userId === user.id
          const isBusy = busyUserId === member.userId

          return (
            <div key={member.id} className="flex items-center gap-3 px-4 py-3">
              <Avatar name={member.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">
                  {member.name}
                  {isMe && <span className="text-slate"> (you)</span>}
                </p>
                <Badge tone={member.role === 'OWNER' ? 'success' : 'neutral'} icon={member.role === 'OWNER' ? <Crown size={12} /> : undefined}>
                  {member.role}
                </Badge>
              </div>

              {isOwner && !isMe && (
                <MemberActionsMenu
                  memberName={member.name}
                  isBusy={isBusy}
                  onTransferOwnership={() => handleTransfer(member.userId)}
                  onRemove={() => handleRemove(member.userId)}
                />
              )}
            </div>
          )
        })}
      </Card>
    </>
  )
}
