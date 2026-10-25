# Week 6 — Project Reflection

## 1. Project Goals & Architecture

When I started the Nestly project, the goal was clear: build a full-stack platform that helps students living together manage shared expenses, chores, grocery lists, bills, and household organization. The idea was something I could relate to — the everyday friction of splitting costs and coordinating responsibilities in a shared living arrangement.

The architecture I chose was a decoupled frontend-backend design:
- **Frontend**: React with TypeScript, Vite as the build tool, and Tailwind CSS for styling. React Router handles client-side navigation, and a custom `apiClient` wrapper manages all HTTP communication with the backend.
- **Backend**: Java 17 with Spring Boot, Spring Security with JWT-based stateless authentication, Spring Data JPA with Hibernate for persistence, and PostgreSQL as the database.
- **Testing**: JUnit 5 and Mockito for backend unit testing, MockMvc for controller slice tests, and Vitest with React Testing Library for frontend component tests.

This separation allowed me to develop, test, and deploy each layer independently while maintaining a clean API contract between them.

---

## 2. What Went Well

**The API client pattern** turned out to be one of the best decisions I made early on. Centralizing all HTTP communication in `src/api/client.ts` with automatic Bearer token injection, structured error extraction, and session expiration handling meant that every page and component could focus on UI logic without worrying about authentication plumbing.

**Spring Security with JWT** provided a solid foundation for authentication. Once the `JwtAuthenticationFilter` and `SecurityConfig` were in place, adding protected endpoints was straightforward. The stateless session model (`SessionCreationPolicy.STATELESS`) simplified the architecture and made it naturally suitable for cloud deployment.

**The testing pyramid approach** was valuable. Starting with Mockito-based unit tests for all service classes, then adding MockMvc controller tests, and finally component-level frontend tests gave me confidence that individual pieces worked correctly before integrating them. When I found bugs during integration, the unit tests helped narrow down root causes quickly.

**Tailwind CSS** dramatically accelerated the UI work. Being able to compose styles directly in JSX without switching between files kept me focused on component structure and behavior.

---

## 3. Challenges Encountered During Full-Stack Integration

**CORS configuration** was one of my first real integration hurdles. When the React dev server on port 5173 started making requests to the Spring Boot backend on port 8080, every request failed silently with a CORS error. Understanding that CORS is enforced by the browser (not the server) and that Spring Security's filter chain had to explicitly allow the frontend origin took some research. Getting it right for production — where the frontend and backend are on different Render subdomains — required making the allowed origins configurable through environment variables.

**The N+1 HTTP request cascade** in the expenses page was a subtle performance bug. The `getExpenses()` function was calling `getExpenseSplits()` for every single expense in the list, triggering 21 HTTP requests for a 20-expense household. I only noticed this when I opened the browser's Network tab during testing. The fix was straightforward (defer split loading to the detail view), but finding it required deliberate performance inspection.

**Error message handling** between backend and frontend was trickier than expected. Spring Boot's `@Valid` annotation returns field-level errors in a `ValidationErrorResponse` DTO with an `errors` map, but my frontend `extractErrorMessage` function was checking for `body.message` first, which always matched the generic "Validation failed" string. Users saw vague error messages instead of specific field-level feedback like "Chore title is required." Fixing the priority order of error field inspection solved it, but it taught me how important it is to test the complete error flow end-to-end, not just the happy path.

---

## 4. Authentication & Security Lessons

**JWT token lifecycle management** required careful thought. I had to handle several edge cases:
- Clearing the token on 401 responses, but *not* when the 401 comes from a login attempt (which means bad credentials, not an expired session).
- Handling concurrent requests where one succeeds and refreshes the token while another fails with 401 — I shouldn't clear a newer, valid token just because an older request returned 401.
- Ensuring the frontend's `getAuthToken()` and `clearAuthToken()` are consistent across all API calls.

**Spring Security's filter chain** was powerful but required understanding the execution order. The `JwtAuthenticationFilter` runs before Spring Security's own authentication filters, so it needs to gracefully handle missing or malformed tokens without throwing exceptions that bypass the controller layer.

**Keeping secrets out of source control** was a discipline I maintained throughout. The `application.properties` uses `${DB_USERNAME}`, `${DB_PASSWORD}`, and `${JWT_SECRET}` without defaults, forcing the developer to supply them via environment variables. The `.env.example` template documents the required variables without exposing real values.

---

## 5. API Design & Database Lessons

**ResponseStatusException vs. RuntimeException** was a significant debugging discovery. Several service methods were using `new RuntimeException("User not found")`, which Spring's default error handler converted to HTTP 500 Internal Server Error. Replacing these with `ResponseStatusException(HttpStatus.NOT_FOUND, "User not found")` produced clean 404 responses that the frontend could handle gracefully. This taught me the importance of using framework-specific exception types that map to appropriate HTTP semantics.

**JPA fetch strategies** required deliberate attention. With `spring.jpa.open-in-view=false`, lazy-loaded associations throw `LazyInitializationException` outside the transaction boundary. The repository queries already used `JOIN FETCH` to eagerly load required associations, which avoided this problem. But understanding *why* this was necessary — and auditing every query to confirm — was an important exercise during the optimization phase.

**`ddl-auto=update`** is convenient for development but requires careful consideration for production. It adds new columns and tables automatically but never removes or renames them. For the current stage of the project, this is acceptable. For production maturity, I would switch to Flyway or Liquibase for versioned migration scripts with rollback support.

---

## 6. Testing & Debugging Experiences

**The context smoke test failure** was a memorable debugging experience. `NestlyBackendApplicationTests.contextLoads` was failing with `PSQLException: FATAL: password authentication failed for user "${DB_USERNAME}"` because the test was trying to connect to a real PostgreSQL instance using literal unexpanded environment variable names. The solution was creating an isolated `src/test/resources/application.properties` with an in-memory H2 database in PostgreSQL compatibility mode. This made the entire test suite hermetic — it runs identically on any machine without requiring a running database.

**Frontend component testing** with React Testing Library taught me to think about components from the user's perspective. Instead of testing implementation details (checking state variables, inspecting internal methods), I tested what the user sees and does: "Does the form render?" "Does validation show an error when the field is empty?" "Does the modal close after successful submission?" This approach made the tests more resilient to refactoring.

**Debugging the GroceryPage test** required understanding that the component used `<input type="checkbox">` instead of a `<button>` for the toggle action. My initial test queried for `getByRole('button')`, which failed. Switching to `getByRole('checkbox')` fixed it. Small details like this reinforced the value of testing against the actual DOM rather than making assumptions about the markup.

---

## 7. Deployment Preparation Lessons

**Environment configuration** for cloud deployment required a systematic approach. I had to ensure that every configurable value — database URL, credentials, JWT secret, CORS origins, server port — could be supplied through environment variables without hard-coded fallbacks that would work incorrectly in production. The Spring Boot property syntax `${ENV_VAR:default_value}` made this clean and explicit.

**The Dockerfile** design taught me about multi-stage builds. Using `eclipse-temurin:17-jdk-jammy` for the build stage (which needs the full JDK and Maven) and `eclipse-temurin:17-jre-jammy` for the runtime stage (which only needs the JRE) reduces the final image size significantly. Running as a non-root user (`nestly`) is a basic security practice that prevents container escape attacks from gaining host-level privileges.

**CORS for production** was more nuanced than local development. Locally, `http://localhost:5173` works. In production, the frontend is served from `https://nestly-frontend.onrender.com` and the backend from `https://nestly-backend.onrender.com`. The CORS configuration must allow the exact production frontend origin. Making this configurable via `APP_CORS_ALLOWED_ORIGINS` ensures the same codebase works in both environments.

---

## 8. Time Management & Technical Learning

Working through six weeks of iterative development taught me the discipline of incremental progress. Each week built on the previous one:
- **Weeks 1–3**: Core feature implementation (authentication, households, expenses, chores, groceries, bills).
- **Week 4**: Frontend-backend integration, end-to-end user flows.
- **Week 5**: Testing, debugging, and performance optimization.
- **Week 6**: Deployment preparation, documentation, and reflection.

The most important lesson was **not to skip testing to save time**. The bugs I found during Week 5 (RuntimeException → 500, swallowed validation errors, N+1 request cascade, direct navigation failure) would have been much harder to diagnose in production without a test suite to isolate the root causes.

---

## 9. What I Would Improve in a Future Project

1. **Start with a CI/CD pipeline**: Setting up GitHub Actions from Day 1 to run tests and lint on every pull request would catch issues earlier and enforce quality gates automatically.

2. **Use database migrations from the start**: Instead of relying on `ddl-auto=update`, I would use Flyway from the first migration to maintain a complete, versioned history of schema changes.

3. **Add end-to-end tests**: While unit and component tests are valuable, they don't test the full user journey across frontend and backend. Tools like Playwright or Cypress would fill this gap.

4. **Implement proper logging early**: Structured JSON logging with correlation IDs would make debugging production issues much easier.

5. **Design the API contract first**: Using OpenAPI specifications before implementing endpoints would make frontend-backend integration smoother and provide auto-generated API documentation.

---

## 10. Future Improvements for Nestly

- **Real-time notifications**: WebSocket support (STOMP/SockJS) to notify roommates instantly when expenses, chores, or bills are added or updated.
- **Payment integration**: UPI (Razorpay) or Stripe integration for settling debts directly within the app.
- **Receipt attachments**: Image upload support for expense receipts, stored in AWS S3 or MinIO.
- **Email notifications**: Automated email alerts for bill due dates, chore reminders, and household invitations using Spring Boot JavaMailSender.
- **Mobile responsive improvements**: While the current UI uses responsive design, a dedicated mobile app (React Native) would provide a better experience for on-the-go roommate coordination.
- **Analytics dashboard**: Charts and graphs showing spending trends, chore distribution fairness, and household activity over time.

---

## 11. How This Project Improved My Understanding of Real-World Software Development

Building Nestly from scratch taught me that real-world software development is fundamentally different from solving isolated coding exercises. The challenges are rarely about algorithms — they are about:

- **Integration**: Making a React frontend, Spring Boot backend, PostgreSQL database, JWT authentication, and a hosting platform all work together reliably.
- **Error handling**: Not just catching exceptions, but transforming them into user-friendly messages that help people fix their inputs.
- **Configuration management**: Ensuring the same codebase works in development, testing, and production through environment-driven configuration.
- **Testing discipline**: Writing tests that verify behavior (not implementation), running them before every change, and trusting them to catch regressions.
- **Documentation**: Writing guides that a future developer (or my future self) can follow to set up, run, test, and deploy the application.

This project gave me hands-on experience with every layer of a modern full-stack application, from CSS styling to Docker container security. That breadth of exposure is something I will carry into every future project.

<!-- 
NOTE TO STUDENT: Review this reflection and personalize any sections that don't 
accurately represent your individual experience. Add specific anecdotes, 
screenshots, or metrics from your actual development process where appropriate.
The deployment and UAT sections should be updated after you have actually 
deployed and tested the application on Render.
-->
