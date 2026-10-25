# Week 5 Testing Strategy & Execution Report

## Overview
This document outlines the testing strategy, test classifications, coverage goals, tools, test matrices, and automated verification results implemented for **Nestly** during Week 5.

---

## 1. Test Architecture & Frameworks

| Tier | Area | Frameworks / Tools | Scope & Purpose |
|---|---|---|---|
| **Backend Unit Tests** | Services & Core Logic | JUnit 5, Mockito | Isolated service business logic, authorization rules, validation guards, edge cases, HTTP exception statuses (`ResponseStatusException`). |
| **Backend API / Slice Tests** | Controllers & Routing | MockMvc, Jackson, Spring Test | HTTP route mapping, status codes (200, 201, 204, 400, 403, 404, 409), payload serialization/deserialization, global exception handling (`@RestControllerAdvice`). |
| **Backend Integration Tests** | Spring Context & Persistence | Spring Boot Test (`@SpringBootTest`), Spring Data JPA, PostgreSQL | End-to-end context bootstrapping and JPA database schema synchronization against PostgreSQL. |
| **Backend Coverage** | Code Analysis | JaCoCo (`jacoco-maven-plugin`) | Measures line and branch coverage across controllers, services, entities, DTOs, and exception handlers. |
| **Frontend Unit Tests** | Utilities & Client Layer | Vitest, Node / jsdom | API client header propagation, bearer token management, error extraction and user-friendly error formatting. |
| **Frontend Component Tests** | Modals, Pages, Views | Vitest, React Testing Library, jsdom | Form validation, user interactions (create, complete, toggle, delete), loading skeletons, error fallbacks, and modal lifecycles. |
| **Frontend Coverage** | Code Analysis | Vitest Coverage (v8) | Comprehensive line, branch, function, and statement coverage metrics. |

---

## 2. Test Plan & Scope

### Phase 1: Backend Unit Testing
We expanded and extended the existing Mockito-based test suites to cover positive outcomes, edge conditions, missing resources, and authorization checks:
- **`ExpenseServiceTest`**: Added tests for expense creation with splits, expense creation without splits, missing creator (404), missing household (404), creator not member (403), split user not member (403), split total sum mismatch (`InvalidExpenseException` -> 400), missing expense in split query (404), and non-member household expense retrieval (403).
- **`ChoreServiceTest`**: Added tests for chore creation success, missing creator (404), missing household (404), creator not member (403), assigned user not found (404), assigned user not member (403), chore retrieval for household members, and non-member access (403).
- **`GroceryServiceTest`**: Added tests for grocery item creation, missing user/household (404), non-member creation (403), household grocery listing, missing item on toggle/delete/update (404), non-member forbidden on toggle/delete/update (403).
- **`HouseholdServiceTest`**: Added tests for household creation (owner assignment, invite code generation), missing user (404), retrieving user households, scoped member retrieval, invite code generation when blank, non-member invite code access (403), invalid invite code on join (404), and conflict on duplicate join (409).
- **`BillServiceTest`**: Comprehensive tests for bill creation, household membership checks, bill retrieval, and 404/403 status handling.
- **`InvitationServiceTest`**: Tests for owner-only invitation creation, invitation acceptance, and invalid/already-accepted status rejection.
- **`AuthServiceTest`**: Added tests for registration, password hashing verification via BCrypt, duplicate email conflict (`EmailAlreadyRegisteredException`), login authentication, and invalid password/email handling.

### Phase 2: Frontend Unit Testing
Configured a lightweight, standard test setup with **Vitest**, **React Testing Library**, **jsdom**, and **@vitest/coverage-v8**:
- **`apiClient.test.ts`**: Verifies Bearer token injection, session expiration token cleanup on 401 (excluding `/auth/login`), structured validation error extraction (`errors` map and `fieldErrors`), and graceful offline/network failure messaging.
- **`LoginPage.test.tsx`**: Verifies input rendering, required field validation, invalid email format checks, API error banner presentation, and navigation upon successful login.
- **`RegisterPage.test.tsx`**: Verifies required inputs, 8-character minimum password constraint, password confirmation mismatch error, and successful redirect to onboarding.
- **`AddExpenseModal.test.tsx`**: Verifies amount > 0 validation, description validation, exact split calculation matching total expense amount, and successful submission.
- **`GroceryItemModal.test.tsx`**: Verifies required item name, create vs. edit mode field prefilling, and submission dispatch.
- **`GroceryPage.test.tsx`**: Verifies initial loading skeletons, error state with retry mechanism, toggling grocery purchased state, and deleting items.
- **`ChoresPage.test.tsx`**: Verifies loading skeletons, empty state rendering, and completing chores with badge update.

### Phase 3: Integration & REST Controller Testing
Implemented standalone MockMvc controller test suites paired with `GlobalExceptionHandler`:
- **`AuthControllerTest`**: Registration (201), Login (200 + token), Invalid input (400).
- **`ExpenseControllerTest`**: Expense creation (201), negative amount validation (400), split total mismatch (400), expense retrieval (200), forbidden access (403).
- **`ChoreControllerTest`**: Chore creation (201), validation (400), household chore list (200), mark complete (200), unauthorized complete (403).
- **`GroceryControllerTest`**: Create grocery (201), validation (400), list groceries (200), toggle status (200), update item (200), delete item (204), forbidden delete (403).
- **`HouseholdControllerTest`**: Create household (201), validation (400), get households (200), get members (200), get invite code (200), join household (200), duplicate join conflict (409).
- **`BillControllerTest`**: Create bill (201), get household bills (200).

---

## 3. Automated Test Verification Results

### Backend Suite Summary
- **Execution Command**:
  ```powershell
  .\mvnw.cmd test
  ```
- **Total Tests Executed**: 99 (across 14 test suites including `NestlyBackendApplicationTests`)
- **Passed**: 99
- **Failures**: 0
- **Errors**: 0
- **Build Status**: `BUILD SUCCESS`

### Backend Coverage (JaCoCo)
- **`ChoreService`**: 100% line coverage (72 / 72 lines)
- **`HouseholdService`**: 100% line coverage (74 / 74 lines)
- **`BillService`**: 100% line coverage (48 / 48 lines)
- **`GroceryService`**: 100% line coverage (88 / 88 lines)
- **`ExpenseService`**: 98.8% line coverage (87 / 88 lines)
- **`InvitationService`**: 97.6% line coverage (41 / 42 lines)
- **Controllers (`ChoreController`, `GroceryController`, `HouseholdController`, `ExpenseController`, `BillController`)**: 100% line coverage

### Frontend Suite Summary
- **Execution Command**:
  ```bash
  npm run test:coverage
  ```
- **Total Test Files**: 7
- **Total Tests Executed**: 29
- **Passed**: 29
- **Failures**: 0
- **Duration**: ~8.6s

### Frontend Coverage Highlights
- `LoginPage.tsx`: 100% lines, 100% functions, 92.85% branches
- `GroceryItemModal.tsx`: 93.1% lines, 91.66% branches
- `RegisterPage.tsx`: 87.17% lines, 100% functions
- `AddExpenseModal.tsx`: 84.88% lines
- `ChoresPage.tsx`: 80% lines
- `api/client.ts`: 77.19% lines, 83.33% functions
- `GroceryPage.tsx`: 58.49% lines
- Core Utilities (`validation.ts`, `cn.ts`): 100% lines

---

## 4. Test Environment & Dependency Requirements
- **Unit and Controller Tests**: Run fully in-memory with Mockito and MockMvc without requiring external databases or network calls.
- **Application Context Smoke Test (`NestlyBackendApplicationTests.java`)**:
  - Uses an isolated in-memory H2 database in PostgreSQL compatibility mode configured in `src/test/resources/application.properties` and test scope `com.h2database:h2`.
  - Runs hermetically across all developer environments and CI/CD without requiring local PostgreSQL or hardcoded credentials.
- **Production / Local Server Runtime**:
  - Bound to the live PostgreSQL datasource defined in `src/main/resources/application.properties`.
  - Requires PostgreSQL running on port 5432 and credentials supplied via `$env:DB_USERNAME`, `$env:DB_PASSWORD`, and `$env:JWT_SECRET`.
