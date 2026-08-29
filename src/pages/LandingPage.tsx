import { Link } from 'react-router-dom'
import { Button } from '@/components/common'

export function LandingPage() {
  return (
    <div className="space-y-6 text-center">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">One place to manage life together.</h1>
        <p className="mt-2 text-sm text-slate">
          Split expenses, track bills, share chores, and keep your household's grocery list in sync — built for
          roommates in PGs, hostels, and shared apartments.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Link to="/register">
          <Button fullWidth>Create an account</Button>
        </Link>
        <Link to="/login">
          <Button variant="secondary" fullWidth>
            Log in
          </Button>
        </Link>
      </div>
    </div>
  )
}
