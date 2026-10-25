# Week 6 — Maintenance Plan

## 1. Overview

This document outlines the maintenance strategy for the Nestly Student Shared-Living Platform after initial deployment. It covers monitoring, logging, backups, dependency management, incident response, and routine maintenance procedures.

Practices are divided into **implemented features** (already present in the codebase) and **recommended future practices** (improvements for production maturity).

---

## 2. Application Monitoring

### Implemented
- **Render Dashboard Metrics**: Render provides built-in monitoring for deployed services including CPU usage, memory consumption, response times, and request counts. These are available in the Render Dashboard under each service's **Metrics** tab.
- **Health Check Endpoint**: The backend exposes `/swagger-ui.html` and `/api/auth/register` as accessible endpoints that can serve as basic liveness checks.

### Recommended Future Practices
- **Spring Boot Actuator**: Add `spring-boot-starter-actuator` to expose `/actuator/health`, `/actuator/info`, and `/actuator/metrics` endpoints for structured health monitoring.
- **Uptime Monitoring**: Use a free service like UptimeRobot or Render's built-in health check to ping the backend every 5 minutes and alert on downtime.
- **Frontend Error Tracking**: Integrate a client-side error reporting tool (e.g., Sentry) to capture and aggregate unhandled JavaScript exceptions in production.

---

## 3. Logging & Error Investigation

### Implemented
- **Backend Logging**: Spring Boot logs to standard output. Render captures stdout/stderr and displays logs in the Dashboard under **Logs**.
- **SQL Logging Disabled**: `spring.jpa.show-sql=false` and `spring.jpa.properties.hibernate.format_sql=false` prevent verbose SQL output in production logs.
- **Structured Error Responses**: The `GlobalExceptionHandler` returns consistent JSON error responses (`ValidationErrorResponse`, `ResponseStatusException` messages) without exposing internal stack traces to clients.

### Recommended Future Practices
- **Structured JSON Logging**: Configure Logback to output JSON-formatted log lines for easier parsing and searching in log aggregation tools.
- **Log Retention & Aggregation**: For long-term log analysis, integrate with a log management service (e.g., Papertrail, Datadog, or ELK Stack).
- **Request Correlation IDs**: Add a filter that generates a unique request ID per API call and includes it in log entries and error responses for end-to-end tracing.

---

## 4. Database Backup & Recovery

### Implemented
- **Render Managed Backups**: Render PostgreSQL instances on paid plans include automatic daily backups with point-in-time recovery.
- **Schema Management**: `spring.jpa.hibernate.ddl-auto=update` ensures Hibernate creates or modifies tables on startup to match JPA entity definitions. Existing data is preserved during schema updates.

### Recommended Future Practices
- **Manual Backup Before Migrations**: Before deploying schema changes, manually export the database using `pg_dump`:
  ```bash
  pg_dump -h <host> -U <user> -d <dbname> -F c -f nestly_backup_$(date +%Y%m%d).dump
  ```
- **Flyway or Liquibase Migrations**: Replace `ddl-auto=update` with versioned migration scripts for predictable, repeatable schema changes. This provides an audit trail of every schema modification.
- **Disaster Recovery Plan**: Document the exact steps to restore from a Render backup or a manual `pg_dump` file. Test the recovery process periodically.

---

## 5. Dependency & Security Updates

### Implemented
- **Lock Files**: `package-lock.json` pins exact frontend dependency versions. `pom.xml` specifies explicit versions for backend dependencies.
- **npm Audit**: `npm audit` reports known vulnerabilities in frontend dependencies.

### Recommended Future Practices
- **Monthly Dependency Review**: Run `npm audit` and `mvn versions:display-dependency-updates` monthly. Update dependencies with known security vulnerabilities promptly.
- **Dependabot or Renovate**: Enable GitHub Dependabot to automatically create pull requests for outdated or vulnerable dependencies.
- **Security Scanning**: Integrate OWASP Dependency-Check or Snyk into the CI pipeline for automated vulnerability detection.
- **Java Runtime Updates**: When updating the JDK version in the `Dockerfile`, ensure the `<java.version>` in `pom.xml` remains consistent (currently Java 17).

---

## 6. Bug Reporting & Issue Tracking

### Implemented
- **GitHub Issues**: The GitHub repository supports issue tracking for bug reports, feature requests, and task management.
- **Debugging Report**: Documented confirmed bugs and their fixes in `docs/week5/debugging-report.md` as a reference for recurring issues.

### Recommended Future Practices
- **Issue Templates**: Create GitHub Issue templates for bug reports (reproduction steps, expected vs. actual behavior, screenshots) and feature requests.
- **Labels and Milestones**: Use labels (`bug`, `enhancement`, `deployment`, `security`) and milestones to organize and prioritize work.
- **Post-Incident Reviews**: After resolving a production incident, write a brief post-mortem documenting what happened, root cause, resolution, and prevention measures.

---

## 7. Testing Before Releases

### Implemented
- **Backend Test Suite**: 99 automated tests (JUnit 5, Mockito, MockMvc) covering unit, controller, and context integration tests. Run with `.\mvnw.cmd test` from the `backend/` directory.
- **Frontend Test Suite**: 29 automated tests (Vitest, React Testing Library, jsdom) covering API client, components, and pages. Run with `npm test` from the project root.
- **Lint Check**: `npm run lint` (oxlint) for code quality enforcement. Currently 0 errors, 4 non-blocking warnings.
- **Production Build Verification**: `npm run build` (TypeScript compilation + Vite bundle) to catch type errors before deployment.
- **JaCoCo Coverage Reports**: Backend code coverage generated automatically during test execution.

### Pre-Release Checklist
1. Run `.\mvnw.cmd test` from `backend/` — all 99 tests must pass.
2. Run `npm test` from root — all 29 tests must pass.
3. Run `npm run lint` — 0 errors.
4. Run `npm run build` — clean production build.
5. Review `git diff` to understand all changes being deployed.
6. Test critical user flows manually: registration, login, household creation, expense management.

---

## 8. Deployment & Rollback Procedures

### Deployment
1. Merge changes to the `main` branch.
2. Push to GitHub: `git push origin main`.
3. Render automatically detects the push and starts deployment.
4. Monitor the build and deployment logs in the Render Dashboard.
5. After deployment completes, verify the application (see Deployment Guide § Verification).

### Rollback
1. Navigate to the affected service in the Render Dashboard.
2. Click **Events** to view deployment history.
3. Click **Rollback** on the last known working deployment.
4. Verify the application after rollback.

### Emergency Hotfix
1. Create a fix on a branch: `git checkout -b hotfix/description`.
2. Implement and test the fix locally.
3. Merge to `main` and push: `git push origin main`.
4. Monitor the Render deployment and verify.

---

## 9. Environment Variable Management

### Current Variables

| Variable | Service | Purpose |
|---|---|---|
| `SPRING_DATASOURCE_URL` | Backend | PostgreSQL JDBC connection URL |
| `DB_USERNAME` | Backend | Database username |
| `DB_PASSWORD` | Backend | Database password |
| `JWT_SECRET` | Backend | JWT signing key (≥256 bits) |
| `APP_CORS_ALLOWED_ORIGINS` | Backend | Allowed frontend origins (comma-separated) |
| `PORT` | Backend | Server port (auto-supplied by Render) |
| `VITE_API_BASE_URL` | Frontend | Backend API URL (build-time) |

### Best Practices
- Never commit real credentials to source control.
- Use `.env.example` as a reference template (committed). Use `.env` for local secrets (gitignored).
- Rotate `JWT_SECRET` periodically. After rotation, all existing user sessions become invalid and users must re-login.
- When changing `VITE_API_BASE_URL`, trigger a manual frontend redeploy since it is a build-time variable.

---

## 10. Database Migration Strategy

### Current Approach
- `spring.jpa.hibernate.ddl-auto=update` allows Hibernate to add new columns and tables automatically on startup.
- This is suitable for early-stage development where the schema is evolving rapidly.

### Recommended Migration Path
When the application matures:
1. Switch `ddl-auto` from `update` to `validate` (Hibernate verifies the schema matches entities but does not modify it).
2. Adopt **Flyway** or **Liquibase** for versioned SQL migration scripts:
   - Each schema change is a numbered migration file (e.g., `V1__create_users.sql`, `V2__add_household_members.sql`).
   - Migrations run automatically on startup in order.
   - Provides rollback capabilities and a complete audit trail.
3. Always test migrations against a backup copy of the production database before deploying.

> [!WARNING]
> Changing `ddl-auto` from `update` to `validate` should only be done after all existing schema changes are captured in migration scripts. Otherwise, the application will fail to start if the schema does not match.

---

## 11. Regular Maintenance Schedule

| Frequency | Task | Owner |
|---|---|---|
| **Weekly** | Check Render Dashboard for error spikes and resource usage | Developer |
| **Weekly** | Review application logs for unexpected errors | Developer |
| **Monthly** | Run `npm audit` and review dependency updates | Developer |
| **Monthly** | Run `mvn versions:display-dependency-updates` | Developer |
| **Quarterly** | Rotate `JWT_SECRET` and update in Render Dashboard | Developer |
| **Quarterly** | Review and update CORS allowed origins | Developer |
| **As needed** | Database backup before major schema changes | Developer |
| **As needed** | Test disaster recovery procedures | Developer |

---

## 12. Incident Response & Recovery

### Severity Levels

| Level | Description | Response Time | Example |
|---|---|---|---|
| **Critical** | Application completely unavailable | Immediate | Database connection failure, backend crash loop |
| **High** | Core feature broken | Within 4 hours | Authentication failure, expense creation error |
| **Medium** | Non-core feature degraded | Within 24 hours | Swagger UI not loading, minor UI glitch |
| **Low** | Cosmetic or minor issue | Next maintenance window | Typo in error message, CSS alignment |

### Response Procedure
1. **Detect**: Monitor Render Dashboard metrics and logs. Set up alerts for downtime.
2. **Assess**: Determine severity and affected users.
3. **Communicate**: If applicable, acknowledge the issue in the GitHub repository.
4. **Investigate**: Check Render logs, reproduce locally if possible.
5. **Fix**: Implement and test the fix. Use the emergency hotfix procedure if critical.
6. **Deploy**: Push the fix and monitor deployment.
7. **Verify**: Confirm the issue is resolved in production.
8. **Document**: Write a post-mortem for Critical and High severity incidents.

---

## 13. Separation: Implemented vs. Recommended

| Area | Implemented | Recommended (Future) |
|---|---|---|
| **Monitoring** | Render Dashboard metrics | Spring Boot Actuator, uptime monitoring, error tracking |
| **Logging** | Stdout logging, SQL logging disabled | JSON structured logging, log aggregation |
| **Backups** | Render managed backups (paid), `ddl-auto=update` | `pg_dump` scripts, Flyway migrations |
| **Dependencies** | Lock files, manual `npm audit` | Dependabot, automated security scanning |
| **Issue Tracking** | GitHub Issues | Issue templates, labels, post-mortems |
| **Testing** | 128 automated tests, lint, build | End-to-end tests, staging environment |
| **Deployment** | Git-push auto-deploy on Render | CI/CD pipeline with automated test gate |
| **Env Management** | `.env.example`, Render Dashboard | Secrets manager, automated rotation |
