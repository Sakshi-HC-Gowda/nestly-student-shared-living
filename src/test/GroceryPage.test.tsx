import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { GroceryPage } from '@/pages/GroceryPage'
import { groceriesApi } from '@/api/groceries'
import type { GroceryItem } from '@/types/grocery'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Alice' },
    isAuthenticated: true,
  }),
}))

vi.mock('@/hooks/useHousehold', () => ({
  useHousehold: () => ({
    currentHousehold: { id: '10', name: 'Maple House' },
  }),
}))

vi.mock('@/api/groceries', () => ({
  groceriesApi: {
    getItems: vi.fn(),
    togglePurchased: vi.fn(),
    deleteItem: vi.fn(),
    addItem: vi.fn(),
    updateItem: vi.fn(),
  },
}))

describe('GroceryPage', () => {
  const sampleItems: GroceryItem[] = [
    {
      id: '1',
      householdId: '10',
      name: 'Milk',
      quantity: '1 L',
      purchased: false,
      addedByUserId: '1',
      addedByName: 'Alice',
    },
    {
      id: '2',
      householdId: '10',
      name: 'Bread',
      quantity: '1 loaf',
      purchased: true,
      addedByUserId: '1',
      addedByName: 'Alice',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially then displays items', async () => {
    vi.mocked(groceriesApi.getItems).mockResolvedValue(sampleItems)

    render(
      <MemoryRouter>
        <GroceryPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Milk')).toBeInTheDocument()
    expect(screen.getByText('Bread')).toBeInTheDocument()
    expect(screen.getByText(/purchased/i)).toBeInTheDocument()
  })

  it('renders error state on API failure and retries', async () => {
    vi.mocked(groceriesApi.getItems).mockRejectedValueOnce(new Error('Network error'))

    render(
      <MemoryRouter>
        <GroceryPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText("Couldn't load the grocery list.")).toBeInTheDocument()

    // Retry
    vi.mocked(groceriesApi.getItems).mockResolvedValueOnce(sampleItems)
    fireEvent.click(screen.getByRole('button', { name: /try again/i }))

    expect(await screen.findByText('Milk')).toBeInTheDocument()
  })

  it('toggles item purchased status', async () => {
    vi.mocked(groceriesApi.getItems).mockResolvedValue(sampleItems)
    vi.mocked(groceriesApi.togglePurchased).mockResolvedValue({
      ...sampleItems[0],
      purchased: true,
    })

    render(
      <MemoryRouter>
        <GroceryPage />
      </MemoryRouter>,
    )

    await screen.findByText('Milk')

    // Find checkbox for Milk
    const toggleCheckbox = screen.getByRole('checkbox', { name: /mark milk as purchased/i })
    fireEvent.click(toggleCheckbox)

    await waitFor(() => {
      expect(groceriesApi.togglePurchased).toHaveBeenCalledWith('1')
    })
  })

  it('deletes item from the list', async () => {
    vi.mocked(groceriesApi.getItems).mockResolvedValue(sampleItems)
    vi.mocked(groceriesApi.deleteItem).mockResolvedValue(undefined)

    render(
      <MemoryRouter>
        <GroceryPage />
      </MemoryRouter>,
    )

    await screen.findByText('Milk')

    const deleteButton = screen.getByRole('button', { name: /delete milk/i })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(groceriesApi.deleteItem).toHaveBeenCalledWith('1')
      expect(screen.queryByText('Milk')).not.toBeInTheDocument()
    })
  })
})
