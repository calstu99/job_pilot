# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 2 — Profile Page
**Last completed:** 06 Profile Save Logic
**Next:** 07 AI Profile Extraction from Resume

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
- [ ] 07 AI Profile Extraction from Resume
- [ ] 08 Resume PDF Generation from Profile

### Phase 3 — Find Jobs Page

- [ ] 09 Find Jobs Page — Full UI
- [ ] 10 Adzuna Job Discovery
- [ ] 11 Filter + Sort + Pagination

### Phase 4 — Job Details Page

- [ ] 12 Job Details Page — Full UI
- [ ] 13 Company Research Agent

### Phase 5 — Dashboard

- [ ] 14 Dashboard Page — Full UI
- [ ] 15 Stats Bar — Real Data
- [ ] 16 Recent Activity — Real Data
- [ ] 17 Analytics Charts — PostHog Data

---

## Decisions Made During Build

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

---

## Notes

- 2026-06-29 — Production build requires network access the first time Next fetches the Inter font for self-hosting.
- 2026-06-29 — Auth runtime expects `NEXT_PUBLIC_INSFORGE_URL`, `NEXT_PUBLIC_INSFORGE_ANON_KEY`, and `NEXT_PUBLIC_APP_URL` in `.env.local`. Server Actions fall back to `http://localhost:3000` for `NEXT_PUBLIC_APP_URL` in local development.
- 2026-06-29 — PostHog runtime expects `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST`. The code temporarily accepts the existing local `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` name as a fallback while env files migrate to the documented key name.
- 2026-06-29 — `resumes` storage bucket exists and is private. App uploads should store files at `resumes/{user_id}/resume.pdf` and persist both URL and key.
- 2026-06-30 — Feature 06 uses the installed `@insforge/sdk@1.4.3` shape: database calls go through `insforge.database.from(...)`, and storage uploads call `insforge.storage.from("resumes").upload(path, file)` without an options object.
