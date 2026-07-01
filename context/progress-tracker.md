# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 5 — Dashboard
**Last completed:** 16 Recent Activity — Real Data
**Next:** 17 Analytics Charts — PostHog Data

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [x] 02 Auth
- [x] 03 PostHog Initialization
- [x] 04 Database Schema

### Phase 2 — Profile Page

- [x] 05 Profile Page — Full UI
- [x] 06 Profile Save Logic
- [x] 07 AI Profile Extraction from Resume
- [x] 08 Resume PDF Generation from Profile

### Phase 3 — Find Jobs Page

- [x] 09 Find Jobs Page — Full UI
- [x] 10 Adzuna Job Discovery
- [x] 11 Filter + Sort + Pagination

### Phase 4 — Job Details Page

- [x] 12 Job Details Page — Full UI
- [x] 13 Company Research Agent

### Phase 5 — Dashboard

- [x] 14 Dashboard Page — Full UI
- [x] 15 Stats Bar — Real Data
- [x] 16 Recent Activity — Real Data
- [ ] 17 Analytics Charts — PostHog Data

---

## Decisions Made During Build

- 2026-07-01 — Feature 16 merges the current user's five newest completed job searches and timestamped company research records, sorts them by occurrence time, and renders human-readable relative times over semantic `<time>` values. Search entries use success dots and research entries use info dots.
- 2026-07-01 — Migration `20260701232211_add-company-researched-at.sql` adds nullable `jobs.company_researched_at`, a partial owner-and-time index, and a column-scoped authenticated update grant. Successful research persistence now writes the dossier and timestamp together; pre-migration dossiers are intentionally not backfilled because their actual research time is unknown.
- 2026-07-01 — Recent activity queries fail independently. Successful entries remain visible with a partial-data notice; a total failure gets retry guidance, and users with no qualifying activity get a deliberate empty state.
- 2026-07-01 — Feature 15 loads all four dashboard stats through concurrent owner-scoped InsForge reads in the Dashboard Server Component. Total jobs, researched companies, and rolling seven-day jobs use exact database counts; average match rate rounds the mean of non-null saved scores to the nearest whole percent.
- 2026-07-01 — Dashboard stat queries fail independently: unavailable values render an em dash while successful values and the rest of the dashboard remain visible. Empty datasets render zero, and mock comparison badges were removed because Feature 15 does not yet provide a real prior-period comparison.
- 2026-07-01 — Feature 14 replaces the protected dashboard placeholder with a responsive static dashboard matching `context/designs/dashboard.png`. The delivered mock is the visual source of truth where the older build plan differs, so the fourth stat is Jobs This Week and the weekday chart is Company Research Activity.
- 2026-07-01 — Dashboard charts use accessible, token-colored SVG and CSS with mock data rather than a client charting dependency. The page remains a Server Component with real InsForge and PostHog data deferred to Features 15 through 17.
- 2026-07-01 — Feature 13 runs synchronously from the job-details client: the research action shows an explicit one-to-two-minute loading state, waits for browsing, synthesis, and persistence, then refreshes the Server Component data.
- 2026-07-01 — Company research uses Stagehand 3.6 with one Browserbase session capped at 120 seconds, visits the homepage plus at most three prioritized same-company pages, and always closes the session in a `finally` block.
- 2026-07-01 — Browser extraction is best-effort. Empty or failed website research falls back to GPT-4o synthesis from the owner-scoped saved job and profile; synthesis and persistence failures preserve the previous dossier and return human-readable errors.
- 2026-07-01 — The persisted `company_research` dossier contains all nine approved fields. Sources are replaced with the exact URLs actually visited rather than model-authored URLs, and `company_researched` fires only after the owner-scoped database update succeeds.
- 2026-07-01 — The Company Research card now renders loading, error, empty, and complete states. Candidate-specific Your Edge and Gaps to Address content shares one accent-muted guidance panel; evidence-free tech, culture, or sources fields render deliberate muted fallbacks.
- 2026-07-01 — Persisted job table rows now navigate to `/find-jobs/[id]` through native links spanning every visible cell. This repairs the missing Feature 12 entry path while preserving table layout, filtering, pagination, and keyboard focus behavior.
- 2026-07-01 — Job details load through a server-only, owner-scoped InsForge query and normalize the selected job fields before rendering. Missing or inaccessible jobs return the route not-found state, while transient query failures show a human-readable retry card.
- 2026-07-01 — Feature 12 follows `context/designs/job-details.png` in a centered `max-w-[936px]` layout with responsive summary cards, token-only match and gap badges, real external application links, and the company-research empty state. Research behavior remains deferred to Feature 13.

- 2026-06-29 — Homepage implemented as a static Server Component using `next/image` public assets and `next/link` navigation/CTA links. No client component was needed.
- 2026-06-29 — Root layout switched from Geist to Inter via `next/font/google` to match project UI rules.
- 2026-06-29 — Shared landing background and divider treatments were added as `.hero-wash` and `.hatched-divider` utilities in `app/globals.css` using existing design tokens and `color-mix()`, avoiding component-level hardcoded colors.
- 2026-06-29 — Auth implemented with `@insforge/sdk@1.4.3` and the current `@insforge/sdk/ssr` helpers. Older local docs mentioning `@insforge/ssr` are outdated for this codebase.
- 2026-06-29 — Next.js 16 auth protection uses root `proxy.ts`, not `middleware.ts`. Proxy refreshes InsForge session cookies with `updateSession()` and redirects protected routes to `/login` when no access token is available.
- 2026-06-29 — OAuth uses server-side PKCE: login forms call Server Actions, `insforge_code_verifier` is stored as an httpOnly cookie for 10 minutes, `/api/auth/callback` exchanges `insforge_code`, and successful login redirects to `/dashboard`.
- 2026-06-29 — Added `/api/auth/refresh` via `createRefreshAuthRouter()` so SSR browser clients can refresh through the app.
- 2026-06-29 — Added temporary protected placeholder pages for `/dashboard`, `/profile`, `/find-jobs`, and `/find-jobs/[id]` so auth redirects can be verified before later UI phases replace them.
- 2026-06-29 — PostHog initialization now runs through `lib/posthog-client.ts`, `instrumentation-client.ts`, and a root `PostHogProvider`. Autocapture, pageview, and pageleave capture are disabled so only approved product events are emitted.
- 2026-06-29 — PostHog identifies signed-in users from the root layout session and resets the browser client when a previously identified user returns without a session.
- 2026-06-29 — Server-side PostHog usage now goes through `capturePostHogEvent()` in `lib/posthog-server.ts`, constrained to the four approved event names: `job_search_started`, `job_found`, `profile_completed`, and `company_researched`.
- 2026-06-29 — Removed wizard-added PostHog events such as auth and page-view captures because `code-standards.md` allows only the four project product events.
- 2026-06-29 — `getCurrentUser()` now calls Next.js `unstable_rethrow()` inside its catch block so framework-controlled dynamic route signals are not logged as application errors during production builds.
- 2026-06-29 — Database schema created through InsForge migration `20260629062950_create-jobpilot-schema.sql` and applied to the linked backend.
- 2026-06-29 — `profiles`, `agent_runs`, `jobs`, and `agent_logs` use owner-scoped RLS policies with `(SELECT auth.uid())`, plus SQL grants scoped to authenticated users only.
- 2026-06-29 — Protected ownership fields are guarded with column-level update grants. `jobs` and `agent_logs` also include composite owner consistency constraints so run/job/log relationships cannot point at another user's rows.
- 2026-06-29 — `profiles` includes `resume_pdf_key` in addition to `resume_pdf_url` so future resume upload code can persist both InsForge Storage values.
- 2026-06-30 — Profile page full UI implemented from `context/designs/profile.png` as a mock Server Component. It includes the protected top nav, attention banner, resume upload panel, complete profile form sections, and visual-only controls with no profile save/upload logic yet.
- 2026-06-30 — Profile completion ring uses layered token-colored SVG strokes with rounded caps to match the delivered design.
- 2026-06-30 — Logout is now implemented through `actions/auth.ts` using InsForge `createAuthActions().signOut()`. `components/layout/ProtectedHeader.tsx` provides shared Dashboard / Find Jobs / Profile navigation plus a Sign out button for protected pages.
- 2026-06-30 — Profile save logic is implemented through `actions/profile.ts`. `/profile` now loads the authenticated user's existing `profiles` row, pre-fills the editable form, saves owner-scoped profile fields, uploads PDF resumes to the stable `resumes/{user_id}/resume.pdf` key, persists both `resume_pdf_url` and `resume_pdf_key`, and revalidates `/profile` after save.
- 2026-06-30 — Feature 06 keeps completion percentage and missing fields derived from saved profile data at render time, while persisting `is_complete` to the current schema. No new completion columns were added because the existing migration only defines `is_complete`.
- 2026-06-30 — `profile_completed` fires through the existing server PostHog helper only when a profile transitions from incomplete or missing to complete.
- 2026-06-30 — Missing-field chips in the profile attention banner now scroll to the relevant form section and focus the first matching input, making incomplete-profile recovery faster.
- 2026-06-30 — After profile saves, the client now calls `router.refresh()` so all sections, completion percentage, and missing-field chips reflect the persisted `profiles` row immediately.
- 2026-06-30 — Profile scalar fields and selects, including Cover Letter Tone, are controlled client state so submitted form data matches the visible values while server-derived completion UI can refresh independently.
- 2026-06-30 — Profile select controls now use select-specific styling and input/change event syncing. Work Authorization spans the full Personal Info row so the native dropdown has the same reliable interaction area as the other profile selects.
- 2026-06-30 — Profile completion ring now uses a smaller centered text treatment for `100%` so the complete-state number stays inside the circle while lower percentages keep the original larger type.
- 2026-06-30 — Resume extraction runs from the currently selected unsaved PDF through authenticated `POST /api/resume/extract`. `pdf-parse` extracts server-side text and GPT-4o returns Zod-constrained profile data through the OpenAI Responses API.
- 2026-06-30 — Extracted resume data only fills empty evidence-backed fields. Existing manual or saved values remain unchanged, email remains authenticated/read-only, and work authorization, remote preference, salary, preferred locations, and cover-letter tone are never inferred.
- 2026-06-30 — Resume extraction is review-first: extracted values update client form state but are not persisted until the user clicks Save Profile. Invalid, oversized, image-only, and failed extractions return human-readable messages without raw errors.
- 2026-06-30 — Profile email is an editable contact address that may differ from the authenticated login email. New profiles start with the login email, while subsequent saves validate and persist the form value without changing authentication identity.
- 2026-06-30 — Resume generation reads only saved profile data, uses GPT-4o Structured Outputs for a bounded professional summary and role bullets, renders a single-page A4 PDF server-side, and replaces the one active private resume after explicit confirmation.
- 2026-06-30 — Only work-experience roles with company, title, and responsibilities are sent to GPT-4o or rendered. Original role indexes are preserved so generated bullet points remain attached to the correct saved role.
- 2026-06-30 — Single-page resume output is protected by schema-level character budgets, capped skills, and line-limited PDF text with ellipsis so user-controlled content cannot clip the A4 layout.
- 2026-06-30 — Generated resumes are viewed through authenticated `GET /api/resume/view`; private storage URLs are never exposed as direct public links.
- 2026-06-30 — Find Jobs full UI implemented from `context/designs/find-jobs.png` as token-only mock Server Components. It includes the search card and success banner, filter controls, six-row score table, and pagination with no Adzuna, database, filtering, sorting, or pagination behavior yet.
- 2026-06-30 — The delivered Find Jobs mock is the visual source of truth for Feature 09, so the table mirrors its five visible columns and does not add the build-plan-only Source column at this stage.
- 2026-06-30 — Find Jobs mock data is isolated in `components/find-jobs/JobsTable.tsx`; the table uses horizontal overflow below its desktop minimum width while the search, filters, and pagination reflow responsively.
- 2026-06-30 — Feature 10 adds authenticated `POST /api/agent/find`, complete-profile gating, Adzuna IT-job discovery, explicit US/UK/Canada/Australia country detection with US fallback, bounded-concurrency GPT-4o Structured Output scoring, owner-scoped run/job persistence, agent logs, and the approved PostHog search events.
- 2026-06-30 — Adzuna results are deduplicated by source URL in application logic and by the applied partial unique index from `20260701030000_add-search-job-url-uniqueness.sql`; successful jobs survive per-job scoring or persistence failures.
- 2026-06-30 — `/find-jobs` now shows the latest live search result set with loading, success, partial-success, empty, incomplete-profile, and error states. Results are not reloaded from the database after a page refresh until Feature 11.
- 2026-06-30 — The Feature 10 filter bar operates locally on the latest search results: company/role text matching is case-insensitive, High/Low Match uses the shared `MATCH_THRESHOLD` of 70, and sorting supports Match Score, Newest, and Oldest. Feature 11 still owns persisted database loading and real pagination.
- 2026-06-30 — Feature 11 replaces the latest-search-only list with owner-scoped persisted `jobs` loading through the InsForge SSR client. List reads select only table fields, request an exact filtered count, and use stable 20-row database ranges.
- 2026-06-30 — Find Jobs filter text, High/Low match selection, sort order, and page are encoded in validated URL query parameters. Text changes are debounced, dropdowns update immediately, filter changes reset to page 1, and invalid or out-of-range page values fall back or clamp safely.
- 2026-06-30 — Successful Adzuna discovery now refreshes the persisted jobs list and resets pagination while retaining active filters and sort order. Reloading `/find-jobs` restores saved results instead of returning to an empty client-only list.

---

## Notes

- 2026-07-01 — Feature 13 expects server-only `BROWSERBASE_API_KEY`, `BROWSERBASE_PROJECT_ID`, and `OPENAI_API_KEY`. The installed browser packages are `@browserbasehq/stagehand@3.6.0` and `@browserbasehq/sdk@2.14.1`; Stagehand v3 manages the Browserbase session through `browserbaseSessionCreateParams`.
- 2026-06-29 — Production build requires network access the first time Next fetches the Inter font for self-hosting.
- 2026-06-29 — Auth runtime expects `NEXT_PUBLIC_INSFORGE_URL`, `NEXT_PUBLIC_INSFORGE_ANON_KEY`, and `NEXT_PUBLIC_APP_URL` in `.env.local`. Server Actions fall back to `http://localhost:3000` for `NEXT_PUBLIC_APP_URL` in local development.
- 2026-06-29 — PostHog runtime expects `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST`. The code temporarily accepts the existing local `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` name as a fallback while env files migrate to the documented key name.
- 2026-06-29 — `resumes` storage bucket exists and is private. App uploads should store files at `resumes/{user_id}/resume.pdf` and persist both URL and key.
- 2026-06-30 — Feature 06 uses the installed `@insforge/sdk@1.4.3` shape: database calls go through `insforge.database.from(...)`, and storage uploads call `insforge.storage.from("resumes").upload(path, file)` without an options object.
- 2026-06-30 — Feature 07 uses `openai@6.45.0`, `zod@4.4.3`, and `pdf-parse@2.4.5`. The current pdf-parse API is class-based: create `PDFParse` with PDF bytes, call `getText()`, and always call `destroy()`.
- 2026-06-30 — Feature 08 uses `openai.responses.parse()` with `zodTextFormat()` and `@react-pdf/renderer@4.5.1`. Resume PDF text uses supported `maxLines` and `textOverflow: "ellipsis"` safeguards to preserve one-page output.
- 2026-06-30 — Feature 10 expects server-only `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`, and `OPENAI_API_KEY` values. Never expose these with a `NEXT_PUBLIC_` prefix.
