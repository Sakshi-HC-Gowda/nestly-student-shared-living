# Week 5 Debugging and Regression Report

## Overview
This report documents confirmed defects identified during code inspection and test execution, their reproduction methods, root causes, corrective code changes, and corresponding automated regression tests.

---

## Confirmed Issue 1: Missing Entity Lookups Threw Raw `RuntimeException` Resulting in HTTP 500

### Summary
In `ExpenseService`, `HouseholdService`, `BillService`, and `InvitationService`, queries that failed to find an entity by ID or email (such as user lookups or household lookups) threw raw `new RuntimeException(...)`.

### Reproduction Steps
1. Make a POST request to `/api/expenses` with a valid JWT token for an email not yet in the `users` table or a `householdId` that does not exist.
2. Observe HTTP response status.
3. **Expected**: HTTP 404 Not Found with JSON `{"error": "User not found"}` or `{"error": "Household not found"}`.
4. **Actual (Before Fix)**: HTTP 500 Internal Server Error with unhandled stack trace.

### Root Cause
`ExpenseService.java`, `HouseholdService.java`, `BillService.java`, and `InvitationService.java` were invoking `.orElseThrow(() -> new RuntimeException("..."))` instead of Spring's `ResponseStatusException(HttpStatus.NOT_FOUND, "...")`. Because `GlobalExceptionHandler` only handles `ResponseStatusException`, `InvalidExpenseException`, `EmailAlreadyRegisteredException`, and `MethodArgumentNotValidException`, raw `RuntimeException` bypassed specific status mappings and defaulted to 500.

### Fix
Replaced raw `RuntimeException` throws across all service classes with `ResponseStatusException(HttpStatus.NOT_FOUND, "...")` and appropriate status codes (`HttpStatus.FORBIDDEN` for authorization failures, `HttpStatus.BAD_REQUEST` for invalid lifecycle transitions).

### Regression Tests
- `ExpenseServiceTest.createExpenseThrowsNotFoundWhenUserNotFound()`
- `ExpenseServiceTest.createExpenseThrowsNotFoundWhenHouseholdNotFound()`
- `ExpenseServiceTest.getHouseholdExpensesThrowsNotFoundWhenUserNotFound()`
- `HouseholdServiceTest.createHouseholdThrowsNotFoundWhenUserNotFound()`
- `HouseholdServiceTest.getMyHouseholdsThrowsNotFoundWhenUserNotFound()`
- `HouseholdServiceTest.joinHouseholdThrowsNotFoundWhenInviteCodeInvalid()`
- `BillServiceTest.createBillThrowsNotFoundWhenUserNotFound()`
- `BillServiceTest.createBillThrowsNotFoundWhenHouseholdNotFound()`
- `ChoreServiceTest.createChoreThrowsNotFoundWhenCreatorNotFound()`
- `ChoreServiceTest.createChoreThrowsNotFoundWhenHouseholdNotFound()`

---

## Confirmed Issue 2: Frontend Client Swallowed Specific Field Validation Messages

### Summary
When backend request validation failed (e.g. submitting a chore with a blank title, or an expense with invalid numbers), Spring Boot returned:
```json
{
  "message": "Validation failed",
  "errors": {
    "title": "Chore title is required"
  }
}
```
The frontend displayed the vague message `"Validation failed"` instead of `"Chore title is required"`.

### Reproduction Steps
1. Submit an API request with invalid field inputs using `apiClient`.
2. Inspect the extracted `ApiError.message`.
3. **Expected**: `ApiError.message` should be `"Chore title is required"`.
4. **Actual (Before Fix)**: `ApiError.message` was `"Validation failed"`.

### Root Cause
In `src/api/client.ts`, `extractErrorMessage` checked `'message' in body` *before* checking for field errors:
```ts
if ('message' in body && typeof body.message === 'string') return body.message
if ('fieldErrors' in body && body.fieldErrors && ...) { ... }
```
Furthermore, the backend DTO was named `ValidationErrorResponse`, which defines `getErrors()` (key `errors`), whereas the client looked for `fieldErrors`.

### Fix
Updated `extractErrorMessage` in `src/api/client.ts` to:
1. First inspect `body.errors` and `body.fieldErrors` for specific field-level messages.
2. Return the first specific error message if present.
3. Only fall back to `body.message` if it is not the generic `"Validation failed"`.

### Regression Test
- `src/test/apiClient.test.ts`:
  - `"handles 400 Bad Request with field errors message"`

---

## Confirmed Issue 3: Refreshing or Directly Navigating to Expense Details Showed "Expense Not Found"

### Summary
Navigating directly to `/expenses/:id` or pressing refresh in the browser on the expense detail view caused the page to enter the "not-found" state, claiming the expense was removed.

### Reproduction Steps
1. Navigate directly to `http://localhost:5173/expenses/12` without first loading the Expenses page.
2. **Expected**: The expense details and split list should load from the server.
3. **Actual (Before Fix)**: Page displays `"Expense not found"`.

### Root Cause
`expensesApi.getExpenseById(id)` only checked an in-memory `expenseCache.get(id)`. Because the cache was only populated if the user visited the household expenses list first, a direct load or browser refresh had an empty cache.

### Fix
Enhanced `expensesApi.getExpenseById(id, householdId)` in `src/api/expenses.ts`:
1. If the expense is not found in cache and `householdId` is provided, it fetches `getExpenses(householdId)` to populate the cache.
2. It fetches `/expenses/${id}/splits` on demand for detailed split inspection.
3. Updated `ExpenseDetailsPage.tsx` to supply `currentHousehold?.id`.

---

## Confirmed Issue 4: Cascading Synchronous `setState` Inside `HouseholdContext` Effect

### Summary
Oxlint reported: `! react(set-state-in-effect): Calling setState synchronously within an effect can trigger cascading renders` in `src/context/HouseholdContext.tsx`.

### Reproduction Steps
Run `npm run lint`. Warning triggered at `HouseholdContext.tsx:64`.

### Root Cause
Inside `useEffect`, `setIsLoading(true)` was called synchronously when `isAuthInitializing` was true, even though `isLoading` is already initialized to `true` by default:
```tsx
if (isAuthInitializing) {
  setIsLoading(true) // redundant state update triggering immediate re-render
}
```

### Fix
Changed the condition to return early during auth initialization without redundant state dispatch:
```tsx
if (isAuthInitializing) {
  return
}
```
Eliminates the extra render cycle and cleans up the fast refresh state model.

---

## Confirmed Issue 5: `NestlyBackendApplicationTests.contextLoads` Failed Due to Missing Test Datasource & Unset Environment Variables

### Summary
The Spring Boot smoke test `NestlyBackendApplicationTests.contextLoads` failed with:
`IllegalStateException: Failed to load ApplicationContext`
caused by:
`org.postgresql.util.PSQLException: FATAL: password authentication failed for user "${DB_USERNAME}"`

### Reproduction Steps
1. Ensure `DB_USERNAME`, `DB_PASSWORD`, and `JWT_SECRET` are not exported in the shell environment.
2. Run `.\mvnw.cmd test` from the `backend/` directory.
3. **Expected**: Unit and context tests should bootstrap reliably in an isolated test environment without requiring external database services or exposed credentials.
4. **Actual (Before Fix)**: Hikari attempted to authenticate against PostgreSQL using the unexpanded literal string `"${DB_USERNAME}"`, throwing a fatal JDBC authentication error and aborting context startup.

### Root Cause
Deepest exception:
`Caused by: org.postgresql.util.PSQLException: FATAL: password authentication failed for user "${DB_USERNAME}"`
`backend/src/main/resources/application.properties` defines:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/nestly
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
jwt.secret=${JWT_SECRET}
```
Without environment variables set or a dedicated test property source, Spring evaluates `${DB_USERNAME}` to the literal string `"${DB_USERNAME}"`. Hikari attempts to open a connection to PostgreSQL on port 5432 with that literal username, which fails authentication. Furthermore, unit and context tests should be hermetic and not depend on external database state.

### Fix
1. Added `com.h2database:h2` with `<scope>test</scope>` to `backend/pom.xml`.
2. Created an isolated test configuration in `backend/src/test/resources/application.properties`:
   - Configures an in-memory H2 database in PostgreSQL compatibility mode: `jdbc:h2:mem:nestly_test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;MODE=PostgreSQL`
   - Configures `spring.jpa.hibernate.ddl-auto=create-drop` for clean test lifecycle.
   - Configures a test-only 256-bit JWT secret for `JwtService`.
3. Preserves production security by keeping `backend/src/main/resources/application.properties` requiring developer/production environment variables.

### Verification & Regression Results
- `.\mvnw.cmd test "-Dtest=NestlyBackendApplicationTests"`: 1/1 passed.
- `.\mvnw.cmd test`: All 99/99 tests passed (0 failures, 0 errors, 0 skipped).

