# Nestly Backend

Nestly is a Student Shared Living Platform designed for students and young adults living in shared accommodation.

The backend provides RESTful APIs for managing users, households, invitations, shared expenses, expense splits, bills, chores, and groceries.

## Technology Stack

- Java 17
- Spring Boot 4.1.1
- Spring Web MVC
- Spring Data JPA
- Hibernate
- PostgreSQL
- Spring Security
- JWT Authentication
- BCrypt Password Hashing
- Jakarta Bean Validation
- Swagger / OpenAPI
- JUnit 5
- Mockito
- MockMvc
- Maven

## Features

- User registration
- User login
- BCrypt password hashing
- JWT-based authentication
- Protected REST APIs
- Household creation
- Household membership management
- Household invitations
- Shared expense management
- Expense splitting
- Bill management
- Chore management
- Grocery management
- Request validation
- Centralized exception handling
- Swagger/OpenAPI documentation
- Automated controller tests

## Project Structure

```text
src/
├── main/
│   ├── java/
│   │   └── com/
│   │       └── nestly/
│   │           └── nestly_backend/
│   │               ├── config/
│   │               │   ├── OpenApiConfig.java
│   │               │   └── SecurityConfig.java
│   │               ├── controller/
│   │               ├── dto/
│   │               ├── entity/
│   │               ├── exception/
│   │               ├── repository/
│   │               ├── security/
│   │               │   ├── JwtAuthenticationFilter.java
│   │               │   └── JwtService.java
│   │               └── service/
│   └── resources/
│       └── application.properties
│
└── test/
    └── java/
        └── com/
            └── nestly/
                └── nestly_backend/
                    └── controller/
                        └── AuthControllerTest.java
                        
```

## Database

Nestly uses PostgreSQL with Spring Data JPA and Hibernate.
Default local database configuration:
Database: nestly
Username: postgres
Port: 5432
Database credentials are supplied through environment variables and should not be committed to source control.

## Environment Variables
The application expects the following environment variables:
DB_USERNAME
DB_PASSWORD
JWT_SECRET
Example PowerShell configuration:
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="your_database_password"
$env:JWT_SECRET="your_long_random_jwt_secret"
Do not commit actual passwords or JWT secrets to GitHub.

## Application Configuration
The application uses environment variables through application.properties.
Example:
spring.application.name=nestly-backend

spring.datasource.url=jdbc:postgresql://localhost:5432/nestly
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.open-in-view=false

server.port=8080

jwt.secret=${JWT_SECRET}

## Running the Application
Make sure PostgreSQL is running and the required environment variables are configured.
From the backend project root:
Windows
.\mvnw.cmd spring-boot:run
Linux / macOS
./mvnw spring-boot:run
The application runs at:
http://localhost:8080

## API Documentation
Swagger UI is available at:
http://localhost:8080/swagger-ui/index.html
OpenAPI specification:
http://localhost:8080/v3/api-docs
Swagger provides interactive documentation for the REST APIs and allows authenticated API requests using JWT bearer authentication.

## Authentication Flow
Nestly uses stateless JWT authentication.
1. Register
POST /api/auth/register
Example request:
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Password@123"
}
2. Login
POST /api/auth/login
Example request:
{
  "email": "test@example.com",
  "password": "Password@123"
}
The response contains a JWT token.
3. Access Protected APIs
Include the token in the request:
Authorization: Bearer <JWT_TOKEN>
Swagger UI can be used to authorize the token through the Authorize button.

## API Endpoints
Authentication
Method	Endpoint	Description
POST	/api/auth/register	Register a new user
POST	/api/auth/login	Authenticate user and generate JWT
GET	/api/auth/test	Test public authentication endpoint


Households
Method	Endpoint	Description
POST	/api/households	Create a household
GET	/api/households	Get households for the authenticated user


Invitations
Method	Endpoint	Description
POST	/api/households/{householdId}/invitations	Invite a user to a household
PUT	/api/households/invitations/{invitationId}/accept	Accept a household invitation


Expenses
Method	Endpoint	Description
POST	/api/expenses	Create an expense
GET	/api/expenses/household/{householdId}	Get household expenses
GET	/api/expenses/{expenseId}/splits	Get expense splits


Bills
Method	Endpoint	Description
POST	/api/bills	Create a bill
GET	/api/bills/household/{householdId}	Get household bills


Chores
Method	Endpoint	Description
POST	/api/chores	Create a chore
GET	/api/chores/household/{householdId}	Get household chores


Groceries
Method	Endpoint	Description
POST	/api/groceries	Add a grocery item
GET	/api/groceries/household/{householdId}	Get household groceries


## Validation
The backend uses Jakarta Bean Validation for incoming API requests.
Examples of validated fields include:
- Required names and descriptions
- Valid email addresses
- Minimum password length
- Positive expense amounts
- Valid bill due dates
- Required household IDs
- Required assigned users
- Valid grocery information
- Expense split amount validation
Invalid requests return HTTP 400 Bad Request with structured validation information.
Example:
{
  "message": "Validation failed",
  "errors": {
    "name": "Grocery name is required",
    "quantity": "Quantity is required",
    "estimatedPrice": "Estimated price cannot be negative"
  }
}
## Error Handling
The backend uses a centralized exception handler through @RestControllerAdvice.
Handled cases include:
- Duplicate email registration
- Invalid expense split totals
- Request validation failures
Errors are returned using appropriate HTTP status codes and JSON responses.
## Security
The backend uses Spring Security with stateless JWT authentication.
Security measures include:
- BCrypt password hashing
- JWT authentication
- Stateless session management
- Protected REST endpoints
- Authentication required for household and shared-living operations
- Environment variables for database credentials
- Environment variables for JWT secrets
- CSRF disabled for the stateless REST API
Passwords are never returned through API response DTOs.
## Testing
Automated API tests are implemented using:
- JUnit 5
- Mockito
- MockMvc
Current authentication controller tests cover:
1. Successful user registration
2. Successful user login
3. Invalid email validation
## Tests can be executed using:
.\mvnw.cmd test
Build
To compile and package the backend:
.\mvnw.cmd clean package
A successful build generates the application JAR inside the target directory.
## Verification
The backend was verified through:
- PostgreSQL database connectivity
- REST API testing
- Swagger/OpenAPI testing
- JWT authentication testing
- Request validation testing
- Automated JUnit/MockMvc tests
- Maven test execution
- Maven package build
## Future Improvements
Possible future enhancements include:
- Settlement calculation between household members
- Recurring bills
- Expense analytics
- Notifications
- Role-based permissions
- Refresh tokens
- Pagination and filtering
- More comprehensive integration testing
- Production deployment