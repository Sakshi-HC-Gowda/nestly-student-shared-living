import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { GroceryItemModal } from '@/components/groceries/GroceryItemModal'

describe('GroceryItemModal', () => {
  const mockOnClose = vi.fn()
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly in add mode', () => {
    render(<GroceryItemModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />)

    expect(screen.getByRole('heading', { name: /add item/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/item name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add item/i })).toBeInTheDocument()
  })

  it('validates empty item name', async () => {
    render(<GroceryItemModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />)

    fireEvent.click(screen.getByRole('button', { name: /add item/i }))

    expect(await screen.findByText(/item name is required/i)).toBeInTheDocument()
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('submits valid item and calls onSubmit and onClose', async () => {
    mockOnSubmit.mockResolvedValue(undefined)

    render(<GroceryItemModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />)

    fireEvent.change(screen.getByLabelText(/item name/i), { target: { value: 'Almond Milk' } })
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: '2 cartons' } })

    fireEvent.click(screen.getByRole('button', { name: /add item/i }))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Almond Milk',
        quantity: '2 cartons',
        note: undefined,
      })
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('populates fields when editing an existing item', () => {
    const existing = {
      id: '1',
      householdId: '1',
      name: 'Eggs',
      quantity: '1 dozen',
      purchased: false,
      addedByUserId: '2',
      addedByName: 'Alice',
    }

    render(
      <GroceryItemModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        editingItem={existing}
      />,
    )

    expect(screen.getByRole('heading', { name: /edit item/i })).toBeInTheDocument()
    expect(screen.getByDisplayValue('Eggs')).toBeInTheDocument()
    expect(screen.getByDisplayValue('1 dozen')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })
})
