import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Mail, X, Users } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, Button, Input, Badge, Skeleton, EmptyState, ErrorState } from '@/components/common'
import type { BadgeTone } from '@/components/common'
import { InviteCodeCard } from '@/components/household/InviteCodeCard'
import { useHousehold } from '@/hooks/useHousehold'
import { invitationsApi } from '@/api/invitations'
import { isValidEmail, isEmpty } from '@/utils/validation'
import type { Invitation, InvitationStatus } from '@/types/household'

const STATUS_TONE: Record<InvitationStatus, BadgeTone> = {
  Pending: 'warning',
  Accepted: 'success',
  Expired: 'danger',
  Cancelled: 'neutral',
}

type ListState = 'loading' | 'error' | 'ready'

export function InviteMembersPage() {
  const { currentHousehold } = useHousehold()

  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [listState, setListState] = useState<ListState>('loading')

  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)

  async function loadInvitations() {
    if (!currentHousehold) return
    setListState('loading')
    try {
      const result = await invitationsApi.getInvitations(currentHousehold.id)
      setInvitations(result)
      setListState('ready')
    } catch {
      setListState('error')
    }
  }

  useEffect(() => {
    loadInvitations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentHousehold?.id])

  async function handleSend(event: FormEvent) {
    event.preventDefault()
    if (!currentHousehold) return
    if (isEmpty(email)) {
      setEmailError('Enter an email address.')
      return
    }
    if (!isValidEmail(email)) {
      setEmailError('Enter a valid email address.')
      return
    }

    setEmailError(null)
    setIsSending(true)
    try {
      const invitation = await invitationsApi.sendInvitation(currentHousehold.id, email)
      setInvitations((prev) => [invitation, ...prev])
      setEmail('')
    } finally {
      setIsSending(false)
    }
  }

  async function handleCancel(id: string) {
    setInvitations((prev) => prev.map((inv) => (inv.id === id ? { ...inv, status: 'Cancelled' } : inv)))
    await invitationsApi.cancelInvitation(id)
  }

  if (!currentHousehold) return null

  return (
    <>
      <PageHeader title="Invite roommates" description={currentHousehold.name} />

      <div className="space-y-4">
        <Card className="space-y-3">
          <h2 className="text-sm font-semibold text-ink">Invite by email</h2>
          <form onSubmit={handleSend} noValidate className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <div className="flex-1">
              <Input
                label="Email address"
                type="email"
                placeholder="roommate@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setEmailError(null)
                }}
                error={emailError ?? undefined}
              />
            </div>
            <Button type="submit" disabled={isSending} className="sm:mt-6">
              <Mail size={16} />
              {isSending ? 'Sending…' : 'Send invitation'}
            </Button>
          </form>
        </Card>

        <InviteCodeCard code={currentHousehold.inviteCode} />

        <Card padded={false}>
          <h2 className="px-4 pt-4 text-sm font-semibold text-ink">Pending &amp; past invitations</h2>

          {listState === 'loading' && (
            <div className="space-y-2 p-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}

          {listState === 'error' && (
            <div className="p-4">
              <ErrorState description="Couldn't load invitations for this household." onRetry={loadInvitations} />
            </div>
          )}

          {listState === 'ready' && invitations.length === 0 && (
            <div className="p-4">
              <EmptyState
                icon={<Users size={20} />}
                title="No invitations yet"
                description="Send an email invite above, or share the invite code."
              />
            </div>
          )}

          {listState === 'ready' && invitations.length > 0 && (
            <ul className="divide-y divide-line">
              {invitations.map((invitation) => (
                <li key={invitation.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{invitation.email}</p>
                    <p className="text-xs text-slate">
                      Sent {new Date(invitation.sentAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={STATUS_TONE[invitation.status]}>{invitation.status}</Badge>
                    {invitation.status === 'Pending' && (
                      <button
                        type="button"
                        aria-label={`Cancel invitation to ${invitation.email}`}
                        onClick={() => handleCancel(invitation.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-slate hover:bg-slate-tint hover:text-brick"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Link to="/dashboard" className="block text-center text-sm font-medium text-moss-dark">
          Continue to dashboard →
        </Link>
      </div>
    </>
  )
}
