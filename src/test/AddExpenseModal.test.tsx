import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AddExpenseModal } from '@/components/expenses/AddExpenseModal'
import { expensesApi } from '@/api/expenses'

vi.mock('@/hooks/useHousehold', () => ({
  useHousehold: () => ({
    currentHousehold: {
      id: '1',
      name: 'Test Household',
      members: [
        { id: '10', userId: '1', name: 'Alice', role: 'OWNER' },
        { id: '11', userId: '2', name: 'Bob', role: 'MEMBER' },
      ],
    },
  }),
}))

vi.mock('@/api/expenses', () => ({
  expensesApi: {
    createExpense: vi.fn(),
  },
}))

describe('AddExpenseModal', () => {
  const mockOnClose = vi.fn()
  const mockOnCreated = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly when open', () => {
    render(<AddExpenseModal isOpen={true} onClose={mockOnClose} onCreated={mockOnCreated} />)

    expect(screen.getByRole('heading', { name: /add expense/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
  })

  it('validates required fields on submit with empty inputs', async () => {
    render(<AddExpenseModal isOpen={true} onClose={mockOnClose} onCreated={mockOnCreated} />)

    fireEvent.click(screen.getByRole('button', { name: /add expense/i }))

    expect(await screen.findByText(/amount must be greater than/i)).toBeInTheDocument()
    expect(screen.getByText(/description is required/i)).toBeInTheDocument()
    expect(expensesApi.createExpense).not.toHaveBeenCalled()
  })

  it('validates exact split sum mismatch', async () => {
    render(<AddExpenseModal isOpen={true} onClose={mockOnClose} onCreated={mockOnCreated} />)

    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '100' } })
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Dinner' } })
    fireEvent.change(screen.getByLabelText(/split method/i), { target: { value: 'Exact' } })

    // Input exact amounts that don't add up to 100
    const aliceInput = screen.getByLabelText(/amount for alice/i)
    fireEvent.change(aliceInput, { target: { value: '40' } })

    const bobInput = screen.getByLabelText(/amount for bob/i)
    fireEvent.change(bobInput, { target: { value: '40' } })

    fireEvent.click(screen.getByRole('button', { name: /add expense/i }))

    expect(await screen.findByText(/exact amounts add up to/i)).toBeInTheDocument()
    expect(expensesApi.createExpense).not.toHaveBeenCalled()
  })

  it('submits successfully with valid data', async () => {
    const createdMock: import('@/types/expense').Expense = {
      id: '50',
      householdId: '1',
      amount: 100,
      description: 'Utilities',
      category: 'Utilities',
      paidByUserId: '1',
      paidByName: 'Alice',
      participantIds: ['1', '2'],
      splitMethod: 'Equal',
      shares: { '1': 50, '2': 50 },
      date: new Date().toISOString(),
    }
    vi.mocked(expensesApi.createExpense).mockResolvedValue(createdMock)

    render(<AddExpenseModal isOpen={true} onClose={mockOnClose} onCreated={mockOnCreated} />)

    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '100' } })
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Utilities' } })

    fireEvent.click(screen.getByRole('button', { name: /add expense/i }))

    await waitFor(() => {
      expect(expensesApi.createExpense).toHaveBeenCalled()
      expect(mockOnCreated).toHaveBeenCalledWith(createdMock)
      expect(mockOnClose).toHaveBeenCalled()
    })
  })
})
