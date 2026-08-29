# Nestly — Student Shared Living Platform

> "One place to manage life together."

**YuvaIntern Junior Full Stack Developer Internship — Week 2: Front-End Application Development**

---

## 1. Project Overview

Nestly is a mobile-first, responsive web application that helps roommates in shared accommodation — PGs, hostels, and shared apartments — manage the day-to-day logistics of living together: splitting expenses, tracking bills, assigning chores, keeping a shared grocery list, and seeing household spending at a glance.

This repository is the **Week 2 deliverable**: a fully functional, API-ready frontend built on the Week 1 architecture, using realistic mock data in place of the backend, which arrives in Weeks 3–4.

## 2. Problem

Splitting costs and coordinating chores in shared housing is usually scattered across group chats, mental math, and sticky notes. Nothing tracks who paid for what, who still owes whom, whose turn it is to clean, or what's actually left on the grocery list — so small disagreements build up over the course of a semester. Nestly gives a household one shared source of truth for all of it.

## 3. Target Users

- College students and young professionals in shared apartments, PGs, or hostels
- Groups of 2–6 roommates who need to split recurring and one-off costs
- Anyone currently doing this coordination manually over chat

## 4. Features

- **Household management** — create a household, invite roommates by email/link/code, join via invite code, switch between multiple households
- **Expenses** — add shared expenses with Equal / Exact / Percentage splitting, full validation, per-expense detail view
- **Balances & settlements** — live-computed balances (not hardcoded), a greedy settlement suggester that minimizes the number of payments needed, "Mark as Settled"
- **Bills** — recurring or one-off bills with due dates, per-person shares, auto-computed status (Upcoming / Due / Overdue / Paid)
- **Chores** — assign, track, and complete household chores with due dates and frequency
- **Groceries** — a shared, editable shopping list with purchased state
- **Notifications** — read/unread activity relevant to the signed-in user
- **Analytics** — spending by category, month-over-month comparison, member contribution — all derived live from expense data
- **Members** — household roster with owner-only remove/transfer-ownership actions
- **Profile** — identity, current household, basic preferences, logout

## 5. Tech Stack

**Frontend (this repo)**
- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- React Router v7

**Backend (planned, Weeks 3–4 — not implemented here)**
- Java, Spring Boot, Spring Security, JWT
- Spring Data JPA / Hibernate
- PostgreSQL
- REST APIs

## 6. Frontend Architecture

- **Context** (`AuthContext`, `HouseholdContext`) holds global auth/session state and which household is currently active. All household-scoped data throughout the app reads from `HouseholdContext.currentHousehold`.
- **API layer** (`api/*.ts`) — one file per domain (auth, households, invitations, expenses, settlements, bills, chores, groceries, notifications, analytics). Every function is `async` and typed, matching the shape a real REST call will have. Pages never touch mock data directly — they always go through this layer.
- **Mock data** (`data/mockData.ts`) is the single source of hardcoded data in the whole app, shaped like the future backend DTOs.
- **Route guards** (`routes/ProtectedRoute.tsx`, `routes/RequireHousehold.tsx`) gate access: unauthenticated → `/login`; authenticated with no household → `/onboarding`; otherwise → the full app shell.
- **Hooks** (`hooks/useAuth.ts`, `hooks/useHousehold.ts`) are the only way components read context, kept in separate files from the Provider components for clean React Fast Refresh.

## 7. Folder Structure

```
src/
  pages/            One component per route (Landing, Login, Dashboard, Expenses, ...)
  components/
    layout/         AppShell, AuthLayout, TopBar, PageHeader
    navigation/     Sidebar (desktop), BottomNav (mobile), shared nav config
    household/      Household switcher, invite code card, member actions menu
    expenses/       Expense list item, table (desktop), add-expense modal
    bills/          Bill list item, table (desktop), add-bill modal
    chores/         Chore list item, add-chore modal
    groceries/      Grocery item row, add/edit modal
    notifications/  (uses common components directly)
    analytics/      Reusable bar-chart row
    common/         Button, Card, Input, Select, Textarea, Badge, Tag, Avatar,
                     Modal, StatCard, EmptyState, ErrorState, Skeleton, FormAlert
  context/          AuthContext, HouseholdContext
  api/              One typed async module per domain — the only layer that
                     touches mock data
  types/            TypeScript interfaces per domain, shaped like backend DTOs
  data/             mockData.ts — the single mock data store
  hooks/            useAuth, useHousehold
  utils/            cn (classnames), validation, date/currency formatting
  routes/           AppRoutes, ProtectedRoute, RequireHousehold
```

## 8. Design Approach

Nestly avoids the two most common "default AI app" looks (warm-cream + terracotta, or dark + neon). The palette is a grounded moss green (brand/primary) with a warm brass/amber accent — a "keys to a shared home" motif — on a cool, soft-neutral paper background. Type pairs **Fraunces**, a serif with real character, for headlines and the wordmark, with **Inter** for body/UI text and **IBM Plex Mono** for money figures and invite codes, since tabular numerals read better for balances.

The one recurring shape motif is a small "nameplate" tag (rounded rectangle with a notch) used for the household switcher and invite codes, tying back to the idea of different doors in a shared home — kept to this single element rather than scattered decoration.

Status is never communicated by color alone: every status badge pairs a color with a distinct icon (e.g. a clock for Pending, a checkmark for Paid, a warning triangle for Overdue).

## 9. Libraries Used

- `react-router-dom` — routing
- `lucide-react` — icons (lightweight, tree-shakeable, one import per icon used)
- `@tailwindcss/vite` — Tailwind v4 integration
- No state-management library (Context + `useState` was enough for this scope), no form library (validation is straightforward enough to hand-roll), no chart library (analytics uses plain CSS bars, per the Week 2 brief's instruction not to overcomplicate analytics), no `clsx` (a 4-line local `cn()` helper covers it)

## 10. Key Interactions

- Household creation → success state → invite roommates
- Join household by code, with distinct invalid-code, expired-code, and success states
- Add expense with live Equal / Exact / Percentage split validation
- Mark a suggested settlement as settled → balances recompute immediately
- Mark a bill paid, complete a chore, toggle a grocery item purchased — all update instantly with an optimistic-feeling UI backed by a real (simulated) API call
- Household switcher in the top bar — switching updates every page's data
- Owner-only member actions (remove, transfer ownership) via a dropdown menu

## 11. Responsive Design

Mobile-first throughout. Below the `lg` breakpoint: bottom tab bar navigation, stacked single-column layouts, card-style list rows, full-width bottom-sheet modals. At `lg` and above: a persistent sidebar replaces the bottom nav, page content is centered with a max width so it doesn't stretch edge-to-edge on wide monitors, and the Expenses and Bills lists switch from card rows to real `<table>` elements, since tabular data reads better with real columns once there's room for them.

## 12. Accessibility

- Semantic HTML landmarks (`<main>`, `<nav aria-label>`, `<header>`), a skip-to-content link
- Every form field has a real `<label>`; errors are linked via `aria-describedby` and flagged with `aria-invalid`
- Visible focus outlines on every interactive element (`:focus-visible`, not just default browser styling)
- Status is conveyed with color **and** an icon, never color alone
- Modal dialogs trap Tab-key focus, close on Escape and backdrop click, and return focus sensibly
- All badge/tint color pairs were checked against WCAG AA (4.5:1) contrast — two were originally too low and were darkened during the accessibility pass (see the Week 2 development notes below)
- `prefers-reduced-motion` disables animation globally for anyone who's set that preference

## 13. Mock Data / API-Ready Architecture

There is no backend in Week 2. Every `api/*.ts` module is `async`, simulates network latency, and returns/accepts the same shapes the real Spring Boot REST endpoints are expected to use. Balances, monthly spending, and analytics are **computed live** from the mock expense data — never hardcoded separately — so the numbers stay internally consistent everywhere they appear. When Week 4 arrives, each `api/*.ts` file's internals get replaced with real `fetch` calls; nothing that imports from them should need to change.

One limitation worth knowing: a few mock records (e.g. bill due dates, "today's chores") are seeded against specific August 2026 dates. If you're viewing this well after that, those specific demo numbers will look stale — the logic itself (status computation, balance math, month-over-month comparison) is date-relative and will work correctly regardless of when it's run.

## 14–17. Local Setup, Installation, Run, and Build Commands

Requires Node.js 18+.

```bash
# from the project root
npm install          # installs dependencies

npm run dev           # starts the dev server (default: http://localhost:5173)
npm run build          # type-checks (tsc -b) and produces a production build in dist/
npm run preview        # serves the production build locally, for a final check
npm run lint          # runs oxlint
```

On first load, go to **Log in** and either fill in the (currently mock) form or tap **"Continue as Sakshi (demo)"** to skip straight into a seeded household ("Green Nest") with sample expenses, bills, chores, and groceries already in place.

## 18. Screenshots

_Add screenshots here before submission — e.g. Dashboard (mobile + desktop), Add Expense split validation, Balances page, Bills list on desktop (table view)._

## 19. Current Week 2 Scope

Everything above is implemented. Explicitly **out of scope** for Week 2, per the brief:
- Spring Boot / Spring Security / JWT backend
- PostgreSQL or any real database
- Real email delivery for invitations
- Real payments
- WebSockets, microservices, Docker deployment, native mobile apps

Authentication and household data are **entirely mocked on the frontend** — see `api/auth.ts` and `data/mockData.ts`.

## 20. Future Integration with Spring Boot (Week 4)

The API layer was deliberately built so this integration is a swap, not a rewrite:
1. Replace the body of each function in `api/*.ts` with a real `fetch`/`axios` call to the matching Spring Boot endpoint — the function signatures and return types don't need to change.
2. Replace the mock session logic in `api/auth.ts` with real JWT issuance/validation; `AuthContext` already expects an async `login`/`register`/`getCurrentUser` shape.
3. Remove `data/mockData.ts` once the backend is the source of truth.
4. `ProtectedRoute` and `RequireHousehold` don't need to change — they only care about `isAuthenticated` and `hasHousehold`, however those get determined.

## 21. Future Enhancements

- Real-time updates (WebSockets) when a roommate adds an expense or completes a chore
- Push/email notifications
- Recurring expense templates
- Receipt photo attachments on expenses
- Export household spending as a report

---

*Built by Sakshi as the Week 2 YuvaIntern Junior Full Stack Developer internship deliverable.*
