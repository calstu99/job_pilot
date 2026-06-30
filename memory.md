# Memory — Database Schema

Last updated: 2026-06-28 23:36 PDT

## What was built

Completed Feature 04 Database Schema from Phase 1.

- Created and applied InsForge migration `migrations/20260629062950_create-jobpilot-schema.sql`.
- Added `profiles` table keyed to `auth.users(id)`.
- Added `agent_runs` table for manually triggered job searches.
- Added `jobs` table for discovered job records and later company research enrichment.
- Added `agent_logs` table for human-readable agent activity and errors.
- Added `resume_pdf_key` to `profiles` alongside `resume_pdf_url` so future upload logic can persist both InsForge Storage values.
- Added indexes for owner-scoped dashboard, job list, run, score, and log queries.
- Enabled RLS on all four app tables.
- Added authenticated owner-only policies for select/insert/update/delete where appropriate.
- Added column-level update grants so clients cannot update protected ownership or identity fields.
- Added composite owner consistency constraints so `jobs` and `agent_logs` cannot point at another user's run/job rows.
- Created private InsForge Storage bucket `resumes`.
- Updated project docs:
  - `context/progress-tracker.md` marks `04 Database Schema` complete and `05 Profile Page — Full UI` next.
  - `context/ui-registry.md` documents the non-visual database schema feature.

## Decisions made

- Schema changes use InsForge CLI migrations instead of direct ad hoc SQL.
- App-owned database objects live in the `public` schema.
- Tables reference managed `auth.users(id)` but do not modify managed InsForge schemas.
- RLS policies use direct owner checks with `(SELECT auth.uid())`, avoiding cross-table policy helpers and recursion risk.
- Profile onboarding fields are nullable so users can create partial profiles before completion.
- `source` is constrained to `search` or `url` because the architecture names both values, even though manual URL import is currently out of scope.
- Status, level, preference, and similar fields use `CHECK` constraints instead of Postgres enum types so future changes are easier.
- Resume storage is private. Future app code should store files at `resumes/{user_id}/resume.pdf` and persist both the returned URL and object key.

## Problems solved

- Remote InsForge project had no existing migrations and no storage buckets. Feature 04 now establishes the first applied migration and the first bucket.
- The schema now guards against future code accidentally linking a job or log to a run/job owned by another user.
- The migration applied cleanly to the linked InsForge backend.
- Verification confirmed:
  - one applied migration,
  - private `resumes` bucket,
  - RLS enabled on all four app tables,
  - owner policies present on the app tables.
- `npm run lint` passes.
- Attempting to write durable details to InsForge external project memory was rejected by the approval guard because it would upload implementation details outside the workspace without explicit authorization. Local project docs and this memory file are the durable handoff instead.

## Current state

- Phase 1 Foundation is complete:
  - 01 Homepage
  - 02 Auth
  - 03 PostHog Initialization
  - 04 Database Schema
- Protected pages are still temporary placeholders.
- No profile UI, profile save logic, resume upload, job discovery, or dashboard data UI has been built yet.
- Auth and PostHog initialization remain in place from previous sessions.
- Database and storage are ready for Phase 2 profile work.
- Git status still includes broader existing homepage/auth/PostHog/context/assets work from prior sessions; do not assume every changed file came from Feature 04.

## Next session starts with

Start Feature 05 Profile Page — Full UI from `context/build-plan.md`.

Before implementation:

- Follow the `AGENTS.md` reading order.
- Use `/architect` before building because the profile page is a complex UI feature.
- Use `/imprint` after building UI components and update `context/ui-registry.md`.
- Read the relevant Next.js docs in `node_modules/next/dist/docs/` before any Next.js-specific code changes.
- Build the profile page UI with mock data only. Do not wire save logic yet.
- Match existing protected page shell patterns and project UI tokens. Never use hardcoded hex values or raw Tailwind color classes.

## Open questions

- Should `.env.example` be added soon to document required public environment variables without secrets?
- Are Google and GitHub OAuth providers fully configured in InsForge and provider dashboards for the auth callback URL?
- Should logout UI/actions be added during the first real authenticated shell/dashboard feature, or before then?
- During Feature 06, should profile save logic create the `profiles` row lazily on first save, or should a profile row be inserted immediately after auth callback?
