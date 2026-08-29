import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Receipt, Plus, Scale } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, Button, Skeleton, EmptyState, ErrorState } from '@/components/common'
import { ExpenseListItem } from '@/components/expenses/ExpenseListItem'
import { ExpenseTable } from '@/components/expenses/ExpenseTable'
import { AddExpenseModal } from '@/components/expenses/AddExpenseModal'
import { useHousehold } from '@/hooks/useHousehold'
import { expensesApi } from '@/api/expenses'
import type { Expense } from '@/types/expense'

type LoadState = 'loading' | 'error' | 'ready'

export function ExpensesPage() {
  const { currentHousehold } = useHousehold()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [state, setState] = useState<LoadState>('loading')
  const [isModalOpen, setIsModalOpen] = useState(false)

  async function loadExpenses() {
    if (!currentHousehold) return
    setState('loading')
    try {
      const result = await expensesApi.getExpenses(currentHousehold.id)
      setExpenses(result)
      setState('ready')
    } catch {
      setState('error')
    }
  }

  useEffect(() => {
    loadExpenses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentHousehold?.id])

  if (!currentHousehold) return null

  return (
    <>
      <PageHeader
        title="Expenses"
        description="Shared spending for this household"
        action={
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Add expense
          </Button>
        }
      />

      <Link
        to="/balances"
        className="mb-4 flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-3 text-sm font-medium text-ink-soft hover:bg-slate-tint"
      >
        <span className="flex items-center gap-2">
          <Scale size={16} /> View balances &amp; settle up
        </span>
        <span aria-hidden="true">→</span>
      </Link>

      {state === 'loading' && (
        <Card padded={false} className="divide-y divide-line">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4">
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </Card>
      )}

      {state === 'error' && <ErrorState description="Couldn't load expenses for this household." onRetry={loadExpenses} />}

      {state === 'ready' && expenses.length === 0 && (
        <EmptyState
          icon={<Receipt size={22} />}
          title="No expenses yet"
          description="Add your first shared expense to start splitting costs."
          action={{ label: 'Add expense', onClick: () => setIsModalOpen(true) }}
        />
      )}

      {state === 'ready' && expenses.length > 0 && (
        <>
          <Card padded={false} className="divide-y divide-line lg:hidden">
            {expenses.map((expense) => (
              <ExpenseListItem key={expense.id} expense={expense} />
            ))}
          </Card>
          <Card padded={false} className="hidden overflow-x-auto lg:block">
            <ExpenseTable expenses={expenses} />
          </Card>
        </>
      )}

      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={(expense) => setExpenses((prev) => [expense, ...prev])}
      />
    </>
  )
}
