# AI Assist Log

This document records significant AI-assisted interactions during the development of the Weather Intelligence Dashboard.

---

## Entry 1 — MongoDB Schema Design for Alert Rules and Weather Snapshots

**Tool used:** Claude (Sonnet 4) via Cursor
**Prompt/task:** "Design MongoDB schemas for alert rules, weather snapshots, and alert notifications that support the rules engine and caching requirements."
**What it generated:** Initial schemas with embedded alert rules inside the User document and a flat weather cache with no TTL tracking. The alert rule schema used a simple string field for operators without enum constraints.
**What you changed and why:** Moved alert rules to a separate `alertRules` collection — embedding inside Users would hit the 16MB document size limit for power users and makes querying all active rules across users impossible for the background evaluator. Added `lastTriggeredAt` and `lastEvaluatedAt` fields to support cooldown logic and evaluation tracking, which the generated schema missed entirely. Added compound indexes (`userId + locationId`, `userId + active`) to optimize the queries the scheduler would run. For weather snapshots, added an explicit `fetchedAt` timestamp to drive the 10-minute TTL cache instead of relying on MongoDB's `updatedAt` (which could be overwritten by unrelated updates).
**Outcome:** Modified significantly

---

## Entry 2 — Backend Modular Monolith Architecture

**Tool used:** Claude (Sonnet 4) via Cursor
**Prompt/task:** "Set up the backend with an enterprise-level modular architecture — each feature module should have domain, application, infrastructure, and API layers."
**What it generated:** A working folder structure and basic Express setup. However, the initial generation mixed concerns — controllers directly imported Mongoose models, and the error handling was inconsistent (some controllers returned JSON errors, others threw unhandled exceptions).
**What you changed and why:** Enforced strict layering: controllers only call application services, services only call repositories, repositories own Mongoose models. Created a centralized `asyncHandler` wrapper so all controllers propagate errors to the global error handler consistently. Introduced `validateOrThrow` as a shared utility because the AI initially duplicated Zod parsing logic in every controller. Also separated DTOs from domain entities — the AI was returning raw Mongoose documents from services, which leaks internal fields like `__v` and `_id` formatting.
**Outcome:** Modified significantly

---

## Entry 3 — Alert Rule Evaluation Logic and Cooldown

**Tool used:** Claude (Sonnet 4) via Cursor
**Prompt/task:** "Implement the rule evaluation engine that runs on a cron schedule, checks weather against rules, and creates notifications."
**What it generated:** A straightforward loop that fetched weather for each rule individually, evaluated the condition, and created a notification. The generated code had no cooldown logic and would have hammered the OWM API with one call per rule.
**What you changed and why:** Restructured to group rules by location first, so we make one weather API call per unique location instead of one per rule — this is critical for staying within OWM rate limits. Added a `isCooldownActive` function that checks if `lastTriggeredAt + cooldownMinutes > now`, preventing notification spam for persistent conditions (e.g., temperature staying above threshold for hours). Also added error isolation per location group — the AI's version would abort the entire evaluation cycle if one API call failed, but the corrected version continues evaluating other locations and logs the error.
**Outcome:** Modified significantly

---

## Entry 4 — Weather Data Caching and Freshness Strategy

**Tool used:** Claude (Sonnet 4) via Cursor
**Prompt/task:** "Implement weather data fetching with a caching layer that avoids calling the external API on every page load."
**What it generated:** A basic implementation using MongoDB as a cache store with a simple `findOne` and `updateOne` pattern. The cache check used `updatedAt` from Mongoose timestamps and a hardcoded 10-minute window.
**What you changed and why:** Added an explicit `fetchedAt` field rather than relying on Mongoose's `updatedAt`, which is more semantically correct and won't break if we ever update the document for non-fetch reasons. Extracted the TTL value into configuration (`WEATHER_CACHE_TTL_MINUTES`) so it can be tuned per environment. Rewrote the mapper to properly aggregate OWM's 3-hour forecast intervals into daily highs/lows — the AI's initial version just picked the first entry per day rather than calculating min/max across all intervals. Also added the representative midday entry selection (closest to 12:00) for the daily icon and description, which the AI missed.
**Outcome:** Modified significantly

---

## Entry 5 — Frontend Component Architecture (Atomic Design + Features)

**Tool used:** Claude (Sonnet 4) via Cursor
**Prompt/task:** "Set up the frontend with atomic design (atoms, molecules, organisms) within a feature-based folder structure, using Server Components where possible and Client Components only for interactivity."
**What it generated:** A reasonable folder structure but made everything a Client Component (`'use client'`) by default — including the root layout and route pages that don't need client-side JavaScript. Also generated a single large `Dashboard` component with all weather, location, and alert logic mixed together.
**What you changed and why:** Kept route layouts and page components as Server Components for auth cookie checks and initial rendering. Only marked interactive components (forms, charts, notification bell, dropdowns) as Client Components. Broke the monolithic Dashboard into proper atomic components: `LocationCard` (molecule), `MiniWeather` (molecule), `LocationsGrid` (organism), `WeatherDetailPanel` (organism), etc. Each feature module (`locations/`, `weather/`, `rules/`, `alerts/`) contains its own component hierarchy, and shared atoms (`Button`, `Input`, `Card`, `Spinner`, `Skeleton`) live in `shared/ui/atoms/`.
**Outcome:** Modified significantly

---

## Entry 6 — React Query Integration and Cache Invalidation

**Tool used:** Claude (Sonnet 4) via Cursor
**Prompt/task:** "Implement data fetching hooks with React Query for locations, weather, rules, and alerts — including proper cache invalidation on mutations."
**What it generated:** Basic `useQuery` and `useMutation` hooks that worked individually. However, cache invalidation was inconsistent — creating a new location didn't invalidate the locations list, and creating a rule didn't refetch the rules list for that location.
**What you changed and why:** Defined consistent query key factories (e.g., `['locations']`, `['weather', locationId]`, `['rules', { locationId }]`) and ensured every mutation's `onSuccess` invalidates the appropriate queries. For the notification bell, added a `refetchInterval: 30000` on the unread count query so the badge updates without manual refresh. Added a `staleTime: 5 * 60 * 1000` for weather queries to align with the backend's 10-minute cache — no point refetching on the client if the server will return cached data anyway. Also configured the global `QueryClient` with sensible defaults (`retry: 1` instead of the default 3 to fail fast in development).
**Outcome:** Modified significantly

---

## Entry 7 — Debugging TypeScript Errors in Recharts and Zod Integration

**Tool used:** Claude (Sonnet 4) via Cursor
**Prompt/task:** "Fix TypeScript compilation errors after integrating Recharts charts and Zod validation."
**What it generated:** The AI initially generated chart code with explicitly typed formatter functions `(value: number, name: string)` for Recharts Tooltip, and Zod validation calls as `validateOrThrow(Schema, data)` (two arguments).
**What you changed and why:** Two distinct issues:

1. **Recharts `Tooltip` formatter type:** Recharts' `Formatter<ValueType, NameType>` type allows `ValueType` to be `undefined`, but the generated code typed the formatter parameter as `number`. Fixed by removing explicit type annotations and letting TypeScript infer the correct union type from Recharts.

2. **Zod `validateOrThrow` signature:** The AI generated `validateOrThrow(CreateRuleSchema, req.body)` (passing schema + data), but our shared utility expects `validateOrThrow(Schema.safeParse(data))` (a `SafeParseResult`). This pattern was intentional — calling `safeParse` at the call site makes the utility simpler and more composable. Fixed all controller call sites to use the correct pattern.

Also fixed `node-cron` import — AI used `import cron from 'node-cron'` (default import) but the package only exports named members. Changed to `import { schedule, ScheduledTask } from 'node-cron'`.

**Outcome:** Modified significantly — multiple AI-generated type assumptions were incorrect
