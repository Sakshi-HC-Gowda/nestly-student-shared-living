import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/navigation/Sidebar'
import { BottomNav } from '@/components/navigation/BottomNav'
import { TopBar } from './TopBar'

/** Wraps every logged-in page. Responsive: sidebar >= lg, bottom tab bar below it. */
export function AppShell() {
  return (
    <div className="flex min-h-screen bg-paper">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-moss focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to main content
      </a>
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <TopBar />
        <main id="main-content" className="flex-1 px-4 pb-24 pt-4 sm:px-6 lg:px-8 lg:pb-8">
          <div className="mx-auto max-w-4xl">
            <Outlet />
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
