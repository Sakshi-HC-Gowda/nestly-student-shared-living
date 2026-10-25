# Week 5 Performance and Code Quality Report

## Overview
This report details performance investigations, measured bottlenecks, architectural optimizations, and code quality improvements completed during Week 5.

---

## 1. Bottleneck Investigation: Frontend-to-Backend N+1 HTTP Request Cascade

### Investigation & Profiling
While analyzing `src/api/expenses.ts`, we discovered an N+1 API call pattern in `getExpenses`:
```ts
// BEFORE OPTIMIZATION
async getExpenses(householdId: string): Promise<Expense[]> {
  const expenses = await apiClient.get<BackendExpense[]>(`/expenses/household/${householdId}`)
  const withSplits = await Promise.all(
    expenses.map(async (expense) => {
      const splits = await apiClient.get<BackendExpenseSplit[]>(`/expenses/${expense.id}/splits`)
      return toExpense(expense, splits)
    }),
  )
  return withSplits.sort(...)
}
```

### Analysis
1. Whenever the user viewed the `ExpensesPage` or `DashboardPage`, the frontend issued:
   - 1 request for `/expenses/household/:id`
   - **N concurrent requests** for `/expenses/:expenseId/splits` (one per expense).
2. Inspection of UI consumers (`ExpensesPage`, `ExpenseTable`, `ExpenseListItem`, `DashboardPage`) confirmed that the list views **do not display splits**. They only render `amount`, `category`, `description`, `paidByName`, and `date`.
3. The only view that requires splits is `ExpenseDetailsPage`.

### Measurement & Comparison

| Metric | Before Optimization | After Optimization | Improvement |
|---|---|---|---|
| **HTTP Requests (10 expenses)** | 11 requests | 1 request | **90.9% reduction** |
| **HTTP Requests (20 expenses)** | 21 requests | 1 request | **95.2% reduction** |
| **HTTP Requests (50 expenses)** | 51 requests | 1 request | **98.0% reduction** |
| **Backend Thread Utilization** | High burst of concurrent split queries | Single linear query | Minimal thread pool contention |

### Optimization Implemented
1. `getExpenses` now maps `BackendExpense` directly into `Expense` in memory without triggering extra split requests.
2. `getExpenseById(id, householdId)` fetches `/expenses/:id/splits` on demand only when a specific expense detail is inspected.

---

## 2. Backend JPA Query Patterns & Join Fetch Review

### Database Query Analysis
Spring Boot is configured with `spring.jpa.open-in-view=false` in `application.properties`. Under this configuration, accessing lazy relationships outside a transaction throws `LazyInitializationException` unless entities are eagerly fetched or query joins are specified.

### Verification of Existing Repositories
We audited each JPA repository for N+1 query patterns:
- **`ExpenseRepository.findByHouseholdId`**: Uses `JOIN FETCH e.paidBy JOIN FETCH e.household`. Single SQL query executed.
- **`ChoreRepository.findByHouseholdId`**: Uses `JOIN FETCH c.assignedTo JOIN FETCH c.createdBy JOIN FETCH c.household`. Single SQL query executed.
- **`GroceryRepository.findByHouseholdId`**: Uses `JOIN FETCH g.addedBy JOIN FETCH g.household`. Single SQL query executed.
- **`HouseholdMemberRepository.findByHouseholdIdWithUser`**: Uses `JOIN FETCH hm.user`. Single SQL query executed.
- **`HouseholdMemberRepository.findByUserIdWithHousehold`**: Uses `JOIN FETCH hm.household`. Single SQL query executed.

### Outcome
All service listing methods utilize explicit JPQL fetch joins. Database operations run in $O(1)$ queries per list request rather than $O(N)$ secondary SELECTs.

---

## 3. React Rendering and State Cleanup

### Synchronous State Dispatch Inside Effects
- In `HouseholdContext.tsx`, synchronous invocation of `setIsLoading(true)` was removed from the effect when `isAuthInitializing` is active, avoiding an immediate cascaded render cycle.
- In `GroceryItemModal.tsx`, modal reset behavior was unified to prevent redundant state setting when the modal is closed.

---

## 4. Summary of Improvements
1. **Network**: Eliminated 10–50+ redundant HTTP round-trips on initial household load.
2. **Reliability**: Replaced generic 500 error responses with structured 404, 403, and 400 responses.
3. **Observability**: Added automated JaCoCo coverage (backend) and Vitest v8 coverage (frontend).
4. **Resilience**: Added 93 backend unit and controller tests plus 29 frontend component tests.
