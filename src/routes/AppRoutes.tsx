import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from './ProtectedRoute'
import { RequireHousehold } from './RequireHousehold'

import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { CreateHouseholdPage } from '@/pages/CreateHouseholdPage'
import { JoinHouseholdPage } from '@/pages/JoinHouseholdPage'
import { InviteMembersPage } from '@/pages/InviteMembersPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ExpensesPage } from '@/pages/ExpensesPage'
import { ExpenseDetailsPage } from '@/pages/ExpenseDetailsPage'
import { BalancesPage } from '@/pages/BalancesPage'
import { BillsPage } from '@/pages/BillsPage'
import { BillDetailsPage } from '@/pages/BillDetailsPage'
import { ChoresPage } from '@/pages/ChoresPage'
import { GroceryPage } from '@/pages/GroceryPage'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { MembersPage } from '@/pages/MembersPage'
import { ProfilePage } from '@/pages/ProfilePage'

export function AppRoutes() {
  return (
    <Routes>
      {/* Public, unauthenticated */}
      <Route element={<AuthLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Authenticated, but not yet inside the app shell (onboarding) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/create-household" element={<CreateHouseholdPage />} />
          <Route path="/join-household" element={<JoinHouseholdPage />} />
        </Route>

        {/* Authenticated and belongs to at least one household */}
        <Route element={<RequireHousehold />}>
          <Route element={<AppShell />}>
            <Route path="/invite" element={<InviteMembersPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/expenses/:id" element={<ExpenseDetailsPage />} />
            <Route path="/balances" element={<BalancesPage />} />
            <Route path="/bills" element={<BillsPage />} />
            <Route path="/bills/:id" element={<BillDetailsPage />} />
            <Route path="/chores" element={<ChoresPage />} />
            <Route path="/groceries" element={<GroceryPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/members" element={<MembersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
