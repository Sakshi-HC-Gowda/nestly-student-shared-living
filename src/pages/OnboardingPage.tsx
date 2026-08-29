import { Link } from 'react-router-dom'
import { Home, DoorOpen } from 'lucide-react'
import { Card, Button } from '@/components/common'
import { useAuth } from '@/hooks/useAuth'

export function OnboardingPage() {
  const { user } = useAuth()

  return (
    <Card className="space-y-5 text-center">
      <div>
        <h1 className="text-lg font-semibold text-ink">Welcome to Nestly{user ? `, ${user.name.split(' ')[0]}` : ''}</h1>
        <p className="mt-1 text-sm text-slate">You're not part of a household yet. Create one or join with an invite.</p>
      </div>
      <div className="flex flex-col gap-2">
        <Link to="/create-household">
          <Button fullWidth>
            <Home size={16} /> Create a Home
          </Button>
        </Link>
        <Link to="/join-household">
          <Button variant="secondary" fullWidth>
            <DoorOpen size={16} /> Join a Home
          </Button>
        </Link>
      </div>
    </Card>
  )
}
