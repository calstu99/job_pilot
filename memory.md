# Memory — Feature 06 Profile Save Logic

Last updated: 2026-06-29 20:59 PDT

## What was built

Completed Feature 06 Profile Save Logic from Phase 2.

- Added `actions/profile.ts` for the profile save Server Action.
- Added `lib/profile.ts` for profile view-model normalization, option values, completion calculation, and shared profile types.
- Reworked `/profile` in `app/profile/page.tsx` to load the authenticated user's `profiles` row, normalize it, and pass it into the client form.
- Added `components/profile/ProfileForm.tsx` as the editable profile form:
  - Personal Info, Professional Info, Work Experience, Education, and Job Preferences now submit real data.
  - Tag/list sections use client state plus hidden JSON inputs.
  - Work Experience supports up to 3 roles.
  - Resume PDF upload saves to the stable storage key and persists URL/key.
  - Save feedback uses `useActionState`.
- Kept `components/layout/ProtectedHeader.tsx` and `actions/auth.ts` from the previous profile UI/logout work.
- Updated `context/progress-tracker.md` and `context/ui-registry.md` for Feature 06 and follow-up UI fixes.

## Decisions made

- Profile completion percentage and missing fields are derived from saved profile data at render time. Only `is_complete` is persisted because the current schema does not include separate completion percentage or missing-field columns.
- Profile rows are created lazily on first profile save when no `profiles` row exists yet.
- Profile saves always scope writes to the authenticated user. Existing rows update by `id = user.id`; new rows insert with `id: user.id`.
- `profile_completed` is captured only when the profile transitions from missing/incomplete to complete.
- After successful saves, `ProfileForm` calls `router.refresh()` so server-derived completion UI reflects the persisted row immediately.
- Simple scalar fields and selects are controlled client state so submitted form data matches the visible UI values.
- Feature 06 uses the installed `@insforge/sdk@1.4.3` shape: database calls go through `insforge.database.from(...)`, and storage uploads call `insforge.storage.from("resumes").upload(path, file)` without an options object.

## Problems solved

- Fixed a Next.js runtime error from exporting a non-async value out of a `"use server"` file. The initial `useActionState` value now lives in the client form instead of `actions/profile.ts`.
- Made missing-field chips in the profile attention banner clickable; they scroll to the relevant section and focus the matching field.
- Fixed stale form/completion state after saving by returning `savedAt` from the Server Action and refreshing the router after successful saves.
- Fixed Education changes not appearing to save by ensuring the server-rendered profile data refreshes after save.
- Fixed Cover Letter Tone not saving by moving scalar/select fields to controlled client state.
- Fixed Work Authorization select usability by giving selects select-specific styling/event syncing and making Work Authorization span the full Personal Info row.
- Fixed complete-state profile ring overflow by using a smaller centered text treatment for `100%` while preserving the larger type for lower percentages.
- Verification completed during this session:
  - `npm run lint` passes.
  - `npx tsc --noEmit` passes.
  - `npm run build` passes when network access is allowed for the Next/Inter font fetch.

## Current state

- Phase 1 Foundation is complete:
  - 01 Homepage
  - 02 Auth
  - 03 PostHog Initialization
  - 04 Database Schema
- Phase 2 Profile Page:
  - 05 Profile Page — Full UI is complete.
  - 06 Profile Save Logic is complete.
  - 07 AI Profile Extraction from Resume is next.
  - 08 Resume PDF Generation from Profile is not started.
- `/profile` now loads real profile data, lets the user edit/save all profile sections, uploads a resume PDF, refreshes completion UI, and persists `is_complete`.
- Resume extraction and resume generation controls are still not implemented; generation remains disabled/visual-only.
- Dashboard, Find Jobs, and Job Details are still protected placeholders from earlier phases, with shared protected navigation/logout.
- Worktree is dirty with broader uncommitted feature work. Current `git status --short` includes modified `actions/auth.ts`, protected page files, `app/profile/page.tsx`, context docs, `memory.md`, and untracked `actions/profile.ts`, `components/layout/`, `components/profile/`, and `lib/profile.ts`. Do not assume every changed file came from the most recent small fix alone.

## Next session starts with

Start Feature 07 AI Profile Extraction from Resume.

Before implementation:

- Run `/remember restore`.
- Follow the `AGENTS.md` reading order.
- Use `/architect` because Feature 07 touches uploaded files, AI extraction, form population, and profile data boundaries.
- Use the OpenAI docs skill before writing OpenAI API code.
- Read the relevant Next.js docs in `node_modules/next/dist/docs/` before adding route handlers or form/extraction flow changes.
- Preserve the existing Feature 06 profile save flow and extend it instead of replacing the form.
- Implement extraction so the user can upload/select a resume, click Extract from Resume, review populated fields, and save manually.
- Keep resume parsing failures user-friendly and avoid surfacing raw errors.
- Update `context/progress-tracker.md` and `context/ui-registry.md` after Feature 07.

## Open questions

- Which PDF text extraction library should Feature 07 use in this Next.js 16 app, and does it need special bundling/runtime handling?
- Should extraction run from the currently selected unsaved file in the browser, or only from a resume that has already been uploaded and saved by Feature 06?
- Should extracted values overwrite all form fields or only fill currently empty fields?
- Should `.env.example` be added soon to document required public environment variables without secrets?
