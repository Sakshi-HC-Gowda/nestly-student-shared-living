# Week 6 — Deployment Guide

## 1. Project Architecture & Hosting Design

Nestly uses a decoupled frontend/backend architecture deployed as two independent services on Render:

```
┌─────────────────────┐        HTTPS         ┌─────────────────────┐
│  Render Static Site  │ ──────────────────── │  Render Web Service  │
│  (React / Vite SPA)  │   VITE_API_BASE_URL  │  (Spring Boot JAR)   │
│  dist/index.html     │    → /api/*          │  Dockerfile (root)   │
└─────────────────────┘                       └──────────┬──────────┘
                                                         │
                                              ┌──────────▼──────────┐
                                              │  Render PostgreSQL   │
                                              │  Managed Database    │
                                              └─────────────────────┘
```

| Component | Hosting Type | Build | Source |
|---|---|---|---|
| **Backend** | Render Web Service (Docker) | Root `Dockerfile` (multi-stage, Java 17) | `backend/` directory |
| **Frontend** | Render Static Site | `npm ci && npm run build` → `dist/` | Repository root |
| **Database** | Render Managed PostgreSQL | Provisioned via Render Dashboard | — |

---

## 2. Prerequisites

Before deploying, ensure the following are available:

- A [Render](https://render.com) account (free tier is sufficient for initial deployment).
- The repository pushed to GitHub: [https://github.com/Sakshi-HC-Gowda/nestly-student-shared-living](https://github.com/Sakshi-HC-Gowda/nestly-student-shared-living)
- All tests passing locally:
  - Backend: `.\mvnw.cmd test` from `backend/` → 99/99 tests pass.
  - Frontend: `npm test` from root → 29/29 tests pass.
  - Build: `npm run build` → clean production bundle in `dist/`.
- No credentials or secrets committed to the repository.

---

## 3. Push Deployment-Ready Code to GitHub

From the repository root:

```powershell
# Stage all deployment changes
git add -A

# Commit with a descriptive message
git commit -m "feat: Week 6 deployment configuration for Render"

# Push to GitHub
git push origin main
```

Verify that the following files are included in the commit:
- `Dockerfile` — multi-stage backend build
- `.dockerignore` — excludes build artifacts and secrets
- `.env.example` — safe environment variable template
- `backend/src/main/resources/application.properties` — environment-configured properties
- `backend/src/main/java/.../config/SecurityConfig.java` — configurable CORS origins
- `src/api/client.ts` — configurable API base URL
- `docs/week6/` — deployment documentation

---

## 4. Create a PostgreSQL Database on Render

1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New** → **PostgreSQL**.
3. Configure the database:
   - **Name**: `nestly-db`
   - **Database**: `nestly`
   - **User**: Leave as default or set to `nestly_user`
   - **Region**: Choose the region closest to your users (e.g., Oregon, US West)
   - **Plan**: Free (for development/testing)
4. Click **Create Database**.
5. Once provisioned, navigate to the database dashboard and note the following from the **Connections** section:
   - **Internal Database URL** (for backend service in the same Render region): `postgresql://user:password@host/dbname`
   - **External Database URL** (for external tools/debugging): similar format with external hostname.

> [!IMPORTANT]
> Use the **Internal Database URL** when configuring `SPRING_DATASOURCE_URL` for the backend service. Internal connections are faster and free of bandwidth charges on Render.

---

## 5. Deploy the Backend as a Render Web Service

1. In the Render Dashboard, click **New** → **Web Service**.
2. Connect your GitHub repository: `Sakshi-HC-Gowda/nestly-student-shared-living`.
3. Configure the service:
   - **Name**: `nestly-backend`
   - **Region**: Same region as the PostgreSQL database.
   - **Runtime**: **Docker** (Render will detect the root `Dockerfile`).
   - **Dockerfile Path**: `./Dockerfile` (default, points to the root-level Dockerfile).
   - **Plan**: Free (for development/testing).
4. Click **Create Web Service**.
5. **Do not** deploy yet — configure environment variables first (see next section).

---

## 6. Configure Backend Environment Variables

In the Render Dashboard for the `nestly-backend` service, navigate to **Environment** and add the following variables:

| Variable | Value | Description |
|---|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://<internal-host>/<dbname>` | Internal PostgreSQL URL from Render database dashboard. Prefix with `jdbc:postgresql://`. |
| `DB_USERNAME` | *(from Render database dashboard)* | PostgreSQL username. |
| `DB_PASSWORD` | *(from Render database dashboard)* | PostgreSQL password. |
| `JWT_SECRET` | *(generate a random 64+ character string)* | JWT signing secret. Must be at least 256 bits (32+ characters). Generate with: `openssl rand -base64 48` |
| `APP_CORS_ALLOWED_ORIGINS` | `https://nestly-frontend.onrender.com` | The public URL of your deployed frontend. |

> [!CAUTION]
> Never use your local development passwords or simple test secrets in production. Generate strong, unique values for `JWT_SECRET` and `DB_PASSWORD`.

### Constructing `SPRING_DATASOURCE_URL`

Render provides a PostgreSQL connection URL in this format:
```
postgresql://user:password@host:port/dbname
```

Spring Boot requires the JDBC prefix:
```
jdbc:postgresql://host:port/dbname
```

Extract only the `host:port/dbname` portion from the Render Internal Database URL and prepend `jdbc:postgresql://`. The username and password are configured separately via `DB_USERNAME` and `DB_PASSWORD`.

---

## 7. Deploy the Frontend as a Render Static Site

1. In the Render Dashboard, click **New** → **Static Site**.
2. Connect the same GitHub repository.
3. Configure the static site:
   - **Name**: `nestly-frontend`
   - **Branch**: `main`
   - **Build Command**: `npm ci && npm run build`
   - **Publish Directory**: `dist`
4. Add the following environment variable:

| Variable | Value | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `https://nestly-backend.onrender.com/api` | The public URL of the deployed backend service, followed by `/api`. |

> [!NOTE]
> `VITE_API_BASE_URL` is a build-time variable. It is embedded into the JavaScript bundle during `npm run build`. After changing this variable, you must trigger a **manual deploy** or redeploy the static site for the change to take effect.

### SPA Rewrite Configuration for React Router

Since Nestly uses React Router for client-side routing, direct navigation to routes like `/dashboard` or `/expenses/123` would return a 404 from the static file server. To fix this:

1. In the Render Dashboard for the static site, navigate to **Redirects/Rewrites**.
2. Add a rewrite rule:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: **Rewrite** (not Redirect)

This ensures all routes are served by `index.html`, allowing React Router to handle navigation.

---

## 8. Verify the Deployed Application

After both services are deployed:

1. **Backend Health Check**:
   - Open `https://nestly-backend.onrender.com/swagger-ui.html` in a browser.
   - The Swagger UI should load, confirming the backend is running.
   - Try the unauthenticated endpoint `POST /api/auth/register` via Swagger to verify database connectivity.

2. **Frontend Verification**:
   - Open `https://nestly-frontend.onrender.com` in a browser.
   - The landing page should load.
   - Register a new user account and log in.
   - Create a household and verify that data persists after page refresh.
   - Test navigation to deep links (e.g., `/dashboard`, `/expenses`) directly in the browser address bar.

3. **CORS Verification**:
   - Open browser Developer Tools → Network tab.
   - Perform an action that triggers an API call (e.g., login).
   - Verify that the request succeeds without CORS errors in the console.

---

## 9. Common Deployment Errors & Troubleshooting

### Backend Issues

| Symptom | Likely Cause | Resolution |
|---|---|---|
| `FATAL: password authentication failed` | `DB_USERNAME` or `DB_PASSWORD` is incorrect | Re-copy credentials from Render database dashboard. |
| `Unable to open JDBC Connection` | `SPRING_DATASOURCE_URL` is missing or malformed | Ensure the URL uses `jdbc:postgresql://` prefix and points to the internal hostname. |
| `SignatureException: JWT signature does not match` | `JWT_SECRET` changed between deployments | Use a consistent `JWT_SECRET`. Existing JWTs become invalid when the secret changes; users must re-login. |
| Backend returns 500 on all requests | Missing environment variables | Check that all five required variables are set in the Render Dashboard. |
| Port binding error | `PORT` not supplied | Render automatically injects `PORT`. The application reads `${PORT:8080}` with a fallback. |

### Frontend Issues

| Symptom | Likely Cause | Resolution |
|---|---|---|
| API calls fail with `CORS` errors | `APP_CORS_ALLOWED_ORIGINS` does not include the frontend URL | Update the backend environment variable to include the exact frontend origin (e.g., `https://nestly-frontend.onrender.com`). Redeploy the backend. |
| 404 on page refresh or direct URL navigation | Missing SPA rewrite rule | Add the `/* → /index.html` rewrite rule in the Render Static Site dashboard. |
| API calls go to `localhost:8080` | `VITE_API_BASE_URL` not set or not rebuilt | Set the environment variable in the Render Static Site dashboard and trigger a manual deploy. |
| Blank page after deployment | Build failed silently | Check the Render build logs. Ensure `npm ci && npm run build` completes without errors. |

### General

| Symptom | Likely Cause | Resolution |
|---|---|---|
| Free-tier backend takes 30–60 seconds to respond | Render free-tier services spin down after inactivity | The first request after inactivity triggers a cold start. This is expected behavior on the free tier. |
| Database connection timeout after free-tier expiry | Render free PostgreSQL databases expire after 90 days | Upgrade to a paid plan or create a new database and update `SPRING_DATASOURCE_URL`. |

---

## 10. Rollback & Redeployment

### Rolling Back a Deployment

1. In the Render Dashboard, navigate to the service (backend or frontend).
2. Click on **Events** to see the deployment history.
3. Find the last known working deployment and click **Rollback** to redeploy it.

### Manual Redeployment

1. Push a fix to the `main` branch on GitHub.
2. Render will automatically detect the push and start a new deployment.
3. Alternatively, click **Manual Deploy** → **Deploy latest commit** in the Render Dashboard.

### Environment Variable Changes

- **Backend variables** (`SPRING_DATASOURCE_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `APP_CORS_ALLOWED_ORIGINS`): Changes take effect after the backend service restarts. Render restarts the service automatically when environment variables change.
- **Frontend variables** (`VITE_API_BASE_URL`): Changes require a rebuild because the value is embedded at build time. Trigger a manual deploy after updating.

---

## 11. Completed Steps vs. Manual Steps Required

### ✅ Completed (in codebase)
- Production-ready `application.properties` with environment variable bindings.
- Configurable CORS origins via `APP_CORS_ALLOWED_ORIGINS`.
- Root-level `Dockerfile` for backend deployment.
- `.dockerignore` excluding secrets and build artifacts.
- `.env.example` template with all required variables.
- Frontend `VITE_API_BASE_URL` configuration with localhost fallback.
- Trailing-slash normalization in API client.
- SQL logging disabled for production.
- All 99 backend tests and 29 frontend tests passing.

### 🔲 Requires Manual Action on Render
- Create PostgreSQL database instance.
- Create backend Web Service and configure environment variables.
- Create frontend Static Site and configure `VITE_API_BASE_URL`.
- Add SPA rewrite rule (`/* → /index.html`) to the static site.
- Push code to GitHub.
- Verify deployed application end-to-end.
- Perform user acceptance testing on live URLs.
