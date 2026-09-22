# Nestly API Documentation

## Base URL

```text
http://localhost:8080
```

## Authentication

Protected endpoints require a JWT bearer token.

```text
Authorization: Bearer <JWT_TOKEN>
```

JWT can be obtained using:

```http
POST /api/auth/login
```

Swagger UI:

```text
http://localhost:8080/swagger-ui/index.html
```

---

# 1. Authentication APIs

## Register User

### Endpoint

```http
POST /api/auth/register
```

### Request

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Password@123"
}
```

### Success Response

**HTTP 201 Created**

```json
{
  "id": 1,
  "name": "Test User",
  "email": "test@example.com",
  "createdAt": "2026-09-22T10:30:00"
}
```

---

## Login User

### Endpoint

```http
POST /api/auth/login
```

### Request

```json
{
  "email": "test@example.com",
  "password": "Password@123"
}
```

### Success Response

**HTTP 200 OK**

```json
{
  "token": "JWT_TOKEN",
  "userId": 1,
  "name": "Test User",
  "email": "test@example.com"
}
```

---

# 2. Household APIs

## Create Household

### Endpoint

```http
POST /api/households
```

### Authentication

Required.

### Request

```json
{
  "name": "Nestly Apartment",
  "accommodationType": "Apartment"
}
```

### Response

**HTTP 201 Created**

Returns the created household information.

---

## Get My Households

### Endpoint

```http
GET /api/households
```

### Authentication

Required.

### Response

**HTTP 200 OK**

Returns households associated with the authenticated user.

---

# 3. Invitation APIs

## Invite User

### Endpoint

```http
POST /api/households/{householdId}/invitations
```

### Authentication

Required.

### Request

```json
{
  "invitedEmail": "friend@example.com"
}
```

### Response

Returns the created invitation.

---

## Accept Invitation

### Endpoint

```http
PUT /api/households/invitations/{invitationId}/accept
```

### Authentication

Required.

### Response

Returns the accepted invitation information.

---

# 4. Expense APIs

## Create Expense

### Endpoint

```http
POST /api/expenses
```

### Authentication

Required.

### Request

```json
{
  "householdId": 1,
  "description": "Dinner with Roommates",
  "amount": 900,
  "category": "Food",
  "splits": [
    {
      "userId": 1,
      "amount": 300
    },
    {
      "userId": 2,
      "amount": 300
    },
    {
      "userId": 3,
      "amount": 300
    }
  ]
}
```

### Validation

The total split amount must equal the expense amount.

For example:

```text
300 + 300 + 300 = 900
```

---

## Get Household Expenses

### Endpoint

```http
GET /api/expenses/household/{householdId}
```

### Authentication

Required.

Returns expenses belonging to the specified household.

---

## Get Expense Splits

### Endpoint

```http
GET /api/expenses/{expenseId}/splits
```

### Authentication

Required.

Returns the individual split amounts associated with an expense.

---

# 5. Bill APIs

## Create Bill

### Endpoint

```http
POST /api/bills
```

### Authentication

Required.

### Request

```json
{
  "householdId": 1,
  "title": "Internet Bill",
  "amount": 999,
  "dueDate": "2026-10-01",
  "category": "Utilities"
}
```

---

## Get Household Bills

### Endpoint

```http
GET /api/bills/household/{householdId}
```

### Authentication

Required.

Returns bills belonging to the household.

---

# 6. Chore APIs

## Create Chore

### Endpoint

```http
POST /api/chores
```

### Authentication

Required.

### Request

```json
{
  "householdId": 1,
  "title": "Clean Kitchen",
  "description": "Clean the shared kitchen",
  "dueDate": "2026-10-01",
  "assignedToUserId": 2
}
```

---

## Get Household Chores

### Endpoint

```http
GET /api/chores/household/{householdId}
```

### Authentication

Required.

Returns chores associated with the household.

---

# 7. Grocery APIs

## Add Grocery Item

### Endpoint

```http
POST /api/groceries
```

### Authentication

Required.

### Request

```json
{
  "householdId": 1,
  "name": "Milk",
  "quantity": "2 litres",
  "estimatedPrice": 120
}
```

---

## Get Household Groceries

### Endpoint

```http
GET /api/groceries/household/{householdId}
```

### Authentication

Required.

Returns grocery items associated with the household.

---

# HTTP Status Codes

| Status | Meaning |
|---|---|
| 200 | Request successful |
| 201 | Resource created |
| 400 | Validation or invalid request |
| 401 | Authentication required or invalid JWT |
| 403 | Access denied |
| 409 | Resource conflict |
| 500 | Unexpected server error |

# Swagger

Interactive API documentation is available at:

```text
http://localhost:8080/swagger-ui/index.html
```

Swagger supports JWT authorization through the `Authorize` button.

# Testing

Run automated tests:

```powershell
.\mvnw.cmd test
```

Build the application:

```powershell
.\mvnw.cmd clean package
```