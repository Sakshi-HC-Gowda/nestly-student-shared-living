import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ChoresPage } from '@/pages/ChoresPage'
import { choresApi } from '@/api/chores'
import type { Chore } from '@/types/chore'

vi.mock('@/hooks/useHousehold', () => ({
  useHousehold: () => ({
    currentHousehold: { id: '10', name: 'Maple House' },
  }),
}))

vi.mock('@/api/chores', () => ({
  choresApi: {
    getChores: vi.fn(),
    completeChore: vi.fn(),
    createChore: vi.fn(),
  },
}))

describe('ChoresPage', () => {
  const sampleChores: Chore[] = [
    {
      id: '1',
      householdId: '10',
      title: 'Kitchen cleanup',
      description: 'Wipe counters',
      assignedToUserId: '2',
      assignedToName: 'Bob',
      dueDate: '2026-11-01',
      frequency: 'One-time',
      status: 'Pending',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders chores list when data is loaded', async () => {
    vi.mocked(choresApi.getChores).mockResolvedValue(sampleChores)

    render(
      <MemoryRouter>
        <ChoresPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Kitchen cleanup')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mark complete/i })).toBeInTheDocument()
  })

  it('completes a chore and updates its badge status', async () => {
    vi.mocked(choresApi.getChores).mockResolvedValue(sampleChores)
    vi.mocked(choresApi.completeChore).mockResolvedValue({
      ...sampleChores[0],
      status: 'Completed',
    })

    render(
      <MemoryRouter>
        <ChoresPage />
      </MemoryRouter>,
    )

    await screen.findByText('Kitchen cleanup')

    const completeBtn = screen.getByRole('button', { name: /mark complete/i })
    fireEvent.click(completeBtn)

    await waitFor(() => {
      expect(choresApi.completeChore).toHaveBeenCalledWith('1')
      expect(screen.getByText('Completed')).toBeInTheDocument()
    })
  })

  it('displays empty state when household has no chores', async () => {
    vi.mocked(choresApi.getChores).mockResolvedValue([])

    render(
      <MemoryRouter>
        <ChoresPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText(/no chores yet/i)).toBeInTheDocument()
  })
})
