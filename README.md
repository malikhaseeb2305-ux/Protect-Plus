# Weather Intelligence Dashboard

A full-stack application for monitoring weather conditions across multiple locations, configuring custom alert rules, and receiving in-app, real-time notifications when conditions are met.

## Tech Stack

- **Backend:** Node.js, Express, TypeScript, MongoDB (Mongoose)
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript
- **Data Source:** [OpenWeatherMap API](https://openweathermap.org/api) (free tier)
- **State Management:** TanStack React Query
- **Charts:** Recharts
- **Validation:** Zod (backend + frontend)
- **Scheduling:** node-cron
- **Auth:** JWT with HTTP-only cookies, bcrypt password hashing

---

## Setup and Run Instructions (Local Development)

### Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas connection string)
- OpenWeatherMap API key (free tier: [sign up here](https://openweathermap.org/appid))

### 1. Clone and install

```bash
git clone <repository-url>
cd Protect-Plus

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Environment variables

Copy the example and fill in your values for the backend:

```bash
cp .env.example backend/.env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `4000` |
| `MONGODB_URI` | MongoDB connection string | *(required)* |
| `JWT_SECRET` | Secret for JWT token signing | *(required)* |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key | *(required)* |
| `ALERT_EVALUATION_CRON` | Cron schedule for alert evaluation | `* * * * *` (every minute) |

Notes:
- `ALERT_EVALUATION_CRON` controls how often the alert rules engine runs. In dev it is set to once per minute for faster feedback.
- Individual alert rules have their own **cooldownMinutes**, with a **minimum of 5 minutes** enforced at the API level to avoid notification spam.

Create a frontend env file:

```bash
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:4000" > frontend/.env.local
```

### 3. Run

```bash
# Terminal 1 — Backend (with scheduler)
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

- Backend runs on `http://localhost:4000`
- Frontend runs on `http://localhost:3000`

### 4. Tests

```bash
cd backend && npm test

# Type-checks
cd backend && npx tsc --noEmit
cd frontend && npx tsc --noEmit
```

The backend has **100+ unit tests** across multiple suites covering auth, locations, weather caching, rule evaluation, the scheduler engine, and alert notifications.

---

## Architectural Decisions and Trade-offs

### Backend — Modular Monolith with Layered Architecture

Each feature module (`auth`, `users`, `locations`, `weather`, `rules`, `alerts`, `scheduler`) follows a consistent 4-layer structure:

- **`domain/`** — Types, entities, pure business logic (e.g., `ruleEvaluator.ts`)
- **`application/`** — Service layer orchestrating use cases
- **`infrastructure/`** — Mongoose models, repositories, external API clients
- **`api/`** — Controllers, DTOs, Zod schemas, Express routes

**Why:** This mirrors how an enterprise team would organize a codebase — each module is self-contained with clear boundaries, making it easy to split into microservices later if needed. DTOs and mappers at module boundaries prevent Mongoose documents from leaking across layers.

### Weather Data Freshness Strategy

Instead of calling OpenWeatherMap on every page load, the backend uses a **10-minute TTL caching strategy**:

1. On request, check if a `WeatherSnapshot` exists for the location and is < 10 minutes old
2. If fresh, return cached data immediately
3. If stale or missing, fetch from OWM, persist the snapshot, and return

The background scheduler also refreshes snapshots when evaluating alert rules, keeping data fresh for all users without redundant API calls.

**Trade-off:** A 10-minute window means users may see slightly stale data, but this is acceptable for weather (conditions don't change second-by-second) and keeps us well within the OWM free tier rate limits.

### Authentication — JWT in HTTP-only Cookies

Tokens are stored in HTTP-only, SameSite cookies rather than localStorage:

- Immune to XSS attacks (JavaScript can't access the cookie)
- Automatically sent with every request (`withCredentials: true`)
- Server-side route protection in Next.js via `cookies()` API

**Trade-off:** Requires `withCredentials` on all API calls and CORS configuration, but the security benefit is worth the complexity.

### Frontend — Server Components with Client Islands

The Next.js App Router lets us use Server Components for route-level data fetching and auth guards, while interactive features (`'use client'`) handle forms, charts, and real-time updates:

- **Server Components:** Route layouts, auth cookie checks, page shells
- **Client Components:** Forms, weather panels, notification bell, charts, alert history, location management

React Query manages all client-side server state with automatic caching, background refetching, and cache invalidation on mutations.

### Frontend — Atomic Design + Feature-based Structure

Components follow the atomic design hierarchy:

- **Atoms:** Button, Input, Card, Spinner, Skeleton, Toast
- **Molecules:** LocationCard, AlertRuleForm, ForecastDayCard
- **Organisms:** LocationsGrid, WeatherDetailPanel, AlertRuleList, NotificationBell

Each feature (`auth`, `locations`, `weather`, `rules`, `alerts`) is self-contained with its own `types/`, `api/`, `hooks/`, `atoms/`, `molecules/`, `organisms/`. Shared components live in `shared/ui/`.

### Alert Rules Engine & Scheduler

The **scheduler** runs on a configurable cron schedule (default: every minute in dev via `ALERT_EVALUATION_CRON=* * * * *`):

1. Load all active rules
2. Group by location to minimize weather API calls
3. For each rule: check cooldown → evaluate condition → create notification if triggered
4. Update evaluation timestamps regardless of outcome

Key details:

- **Cooldown mechanism** prevents notification spam:
  - Each rule has `cooldownMinutes` (default 30, **minimum 5** enforced by Zod schemas).
  - A triggered rule will not fire again until its cooldown window has passed.
- **Concurrency safety:**
  - An in-memory `evaluating` flag ensures only one evaluation cycle runs at a time.
  - A repository-level `claimTrigger(ruleId, cooldownMinutes, now)` call uses an atomic update to guarantee the same rule is not triggered concurrently by overlapping scheduler cycles.

---

## Feature Overview and Behavior

---

### Authentication & User Settings

- **Registration & Login**
  - Email + password registration with bcrypt hashing.
  - Login issues a JWT, stored in an **HTTP-only, SameSite cookie** (`token`).
  - All protected API routes use an `authMiddleware` that reads and verifies the JWT from cookies.
  - Next.js `(app)/layout.tsx` uses `cookies()` to protect dashboard routes server-side; unauthenticated users are redirected to `/login`.

- **User Settings**
  - Users can configure temperature units (`C` / `F`).
  - Settings are persisted on the backend and used by mappers to display user-preferred units.

---

### Locations Management

- **Add Location Manually**
  - Form fields: `cityName`, `countryCode`, `lat`, `lon`.
  - Client-side validation ensures:
    - Non-empty city and valid 2–3 character country code.
    - Numeric latitude and longitude.
  - On success: toast **“Location added successfully”** and the locations grid updates via React Query invalidation.
  - On error (e.g., invalid data or duplicate city): a toast shows the API error message.

- **Detect My Location**
  - Frontend:
    - Tries `navigator.geolocation` to get browser coordinates.
    - If geolocation fails or times out, falls back to sending an empty payload to the backend.
  - Backend (`/locations/detect`):
    1. If lat/lon provided, use OpenWeather reverse-geocoding to resolve `cityName` and `countryCode`.
    2. If still unknown, fall back to **IP-based geolocation** using `ip-api.com`.
    3. If coordinates cannot be determined, returns a 422 with a clear error message.
    4. Otherwise, calls `locationService.detectCurrentLocation`, which:
       - Marks the location as `isCurrentLocation: true`.
       - Delegates to `createLocation` (which enforces all invariants).
  - Duplicate protection:
    - `locationService.createLocation` checks `locationRepository.findByUserAndCity(userId, cityName, countryCode)`.
    - If a matching city/country already exists for the user, it throws a `DomainError('Location already exists for this city')`.
    - For **Detect my location**:
      - The button shows a toast with this message.
      - The inline error under the button is suppressed for this specific case to avoid clutter.

- **Reordering & Deletion**
  - Users can remove locations completely.
  - Reordering is supported via a `reorder` endpoint that updates `sortOrder` for all user locations atomically.

---

### Weather Data & Dashboard

- **Current Conditions + 5-Day Forecast**
  - The backend integrates with **OpenWeatherMap**:
    - Current weather for each location.
    - Forecast data aggregated and mapped into a dashboard-friendly DTO.
  - The frontend dashboard displays:
    - Key metrics (temperature, humidity, wind speed) using `MetricBadge` atoms.
    - Trend charts using **Recharts** for visualizing temperature over time.

- **Caching & TTL**
  - Weather snapshots are cached per location with a **10-minute TTL** to balance freshness and API rate limits.
  - The scheduler also refreshes data when evaluating rules so alerts use up-to-date conditions.

---

### Alert Rules

- **Rule Model**
  - Parameters: `temperature`, `humidity`, `windSpeed`.
  - Operators: `<`, `>`, `<=`, `>=`.
  - Threshold: numeric value in user-selected units (for temperature).
  - `cooldownMinutes`:
    - Default: 30.
    - Minimum: **5 minutes**, enforced by Zod (`CreateRuleSchema` / `UpdateRuleSchema`).
  - `active` flag to enable/disable rules without deleting them.

- **Rule Creation & Validation**
  - Frontend `AlertRuleForm` provides:
    - Parameter and operator selects.
    - Threshold input with typing constraints.
    - Cooldown input labeled as **“Cooldown (min, min 5)”**, with `min={5}`.
  - Backend uses Zod schemas to validate all rule creation/update requests and returns structured error messages.

- **Evaluation Logic**
  - Every scheduler tick:
    1. Load all active rules.
    2. Group them by `locationId` to minimize weather API calls.
    3. For each group:
       - Fetch or refresh weather data via `weatherService.getOrRefreshForScheduler`.
       - Evaluate each rule with a pure `evaluateRule` function.
       - Respect cooldowns via `isCooldownActive(rule, now)`.
       - Use `alertRuleRepository.claimTrigger` (atomic operation) to prevent double-triggering.
    4. When a rule triggers:
       - Compute human-readable messages like:
         - `"Temperature exceeds 30 in London (current: 33)"`.
       - Persist an `AlertNotification` document with `triggeredAt` and `message`.

---

### Alert Notifications, Real-time Updates & History

- **Notification Storage**
  - Each alert notification stores:
    - `userId`, `locationId`, `ruleId`
    - `message`, `triggeredAt`
    - `read` flag
  - The `alerts` module provides:
    - List alerts with pagination (`/alerts`).
    - Get unread count (`/alerts/unread-count`).
    - Mark single alert read (`/alerts/:id/read`).
    - Mark all alerts read (`/alerts/read-all`).

- **Real-time Delivery with Server-Sent Events (SSE)**
  - Backend:
    - An in-memory **`AlertEventBus`** built on `EventEmitter` publishes events per user (`alert:${userId}` channels).
    - When a rule triggers and a notification is created, the evaluation service publishes an event containing:
      - `id`, `message`, `triggeredAt`, `locationId`, `ruleId`.
    - An authenticated SSE endpoint (`GET /alerts/stream`) streams real-time events to the browser:
      - Sets `Content-Type: text/event-stream`.
      - Sends heartbeat comments periodically to keep connections alive through proxies.
  - Frontend:
    - A `useAlertStream` hook establishes an `EventSource` connection to `/alerts/stream`.
    - On each message:
      - Invalidates all alert-related React Query caches (unread count + alert lists across pages).
      - Shows a toast with the alert message, even if the notification dropdown is closed.
    - Uses exponential back-off to reconnect if the connection drops.

- **Notification Bell UI**
  - Always visible in the `AppShell` header for authenticated routes.
  - Shows an unread badge (capped at `99+`).
  - Dropdown:
    - Lists the 5 most recent alerts, with clear unread vs. read styling.
    - “Mark all read” button to clear unread count.
    - Improved typography, spacing, and visual hierarchy for readability, including dark mode adjustments.

- **Alert History Panel**
  - Full list of alerts on the dashboard:
    - Paged view with `PAGE_SIZE` of 10.
    - `AlertListItem` components show message, timestamp, and read state.
  - Header actions:
    - **Refresh icon**:
      - Triggers a React Query refetch for all `alerts` queries.
      - Shows a brief spin animation while refreshing.
      - Displays a success or error toast when the refresh completes.
    - **Mark all read** button to clear unread history.

---

### Toasts & Error Handling Strategy

- A global `ToastProvider` exposes a simple `showToast(message, type?)` API.
- Key flows with toast feedback:
  - Auth (login/register failures).
  - Location add / detect (success + duplicate or geolocation errors).
  - Rule create/update errors.
  - Alert history refresh.
  - Real-time alert arrivals via SSE.
- Inline error text is used selectively where it aids clarity (e.g., form field-level validation), while server-side / domain errors are surfaced primarily via toasts for consistency.

---

## Project Structure

```
Protect-Plus/
├── backend/
│   └── src/
│       ├── app/                    # Express app setup, routes
│       ├── shared/                 # Config, errors, middleware, utils
│       └── modules/
│           ├── auth/               # Registration, login, JWT
│           ├── users/              # User settings (temp unit)
│           ├── locations/          # CRUD, reorder, detect
│           ├── weather/            # OWM client, caching, mapper
│           ├── rules/              # Alert rule CRUD, evaluator
│           ├── alerts/             # Notification CRUD
│           └── scheduler/          # Cron-based rule evaluation
├── frontend/
│   └── src/
│       ├── app/                    # Next.js App Router pages
│       │   ├── (auth)/             # Login, register (public)
│       │   └── (app)/              # Dashboard, settings, locations (protected)
│       ├── features/               # Feature modules (atomic design)
│       │   ├── auth/
│       │   ├── locations/
│       │   ├── weather/
│       │   ├── rules/
│       │   ├── alerts/
│       │   └── dashboard/
│       ├── shared/                 # Shared atoms, molecules, organisms
│       ├── providers/              # QueryProvider, ToastProvider
│       └── lib/                    # API client, query client
├── PLAN.md                         # Architectural plan
├── TODO.md                         # Granular implementation checklist
└── AI-ASSIST-LOG.md                # AI usage log
```

---

## Possible Next Improvements

1. **Location search autocomplete** — Integrate OpenWeatherMap's geocoding API for a search-as-you-type experience instead of manual lat/lon entry.
2. **Drag-and-drop reordering** — The backend supports `sortOrder` and reorder endpoints; the frontend could expose a drag-and-drop UI.
3. **E2E tests** — Cypress or Playwright tests for critical user flows (register → add location → create rule → verify alert).
4. **Rate limiting middleware** — Express rate limiter on auth endpoints and rule creation to prevent abuse.
5. **Docker Compose** — Single-command setup with backend, frontend, and MongoDB containers.
6. **Manual dark mode toggle** — CSS custom properties are already dark-mode-ready via `prefers-color-scheme`; a user-facing toggle would improve UX.
7. **Monitoring and observability** — Extend structured logging with request tracing, metrics (Prometheus), and health dashboards.
