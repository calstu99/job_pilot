# Memory — Feature 07 AI Profile Extraction from Resume

Last updated: 2026-06-30 17:27 PDT

## What was built

Completed Feature 07 AI Profile Extraction from Resume.

- Added `app/api/resume/extract/route.ts` as an authenticated PDF extraction endpoint with file type, signature, size, and text-content validation.
- Added `agent/profile-extractor.ts` for GPT-4o structured resume extraction through the OpenAI Responses API.
- Added `lib/profile-extraction.ts` for shared Zod schemas, extraction types, and API response validation.
- Extended `components/profile/ProfileForm.tsx` with:
  - Extract from Resume controls after a local PDF is selected.
  - Loading, success, and friendly failure states.
  - Client-side population of empty profile fields for manual review before saving.
- Added `openai`, `zod`, and `pdf-parse` dependencies and configured `pdf-parse` as a server-external package in `next.config.ts`.
- Updated `actions/profile.ts` so the profile contact email is editable, validated, and persisted independently from the authenticated login email.
- Updated `context/architecture.md`, `context/build-plan.md`, `context/library-docs.md`, `context/progress-tracker.md`, and `context/ui-registry.md`.

## Decisions made

- Extraction runs from the currently selected unsaved PDF; the file does not need to be uploaded first.
- Extracted data fills only empty fields. Existing saved values and manual edits are preserved.
- Extraction is evidence-based and supports contact details except email, links, professional information, skills, industries, up to three work roles, education, and likely job titles.
- GPT-4o does not infer work authorization, remote preference, salary expectations, preferred locations, or cover-letter tone.
- Extracted values remain client-side until the user explicitly clicks Save Profile.
- Profile contact email may differ from the login email. Authentication identity remains unchanged.
- Email is excluded from AI resume extraction so an authenticated user's contact address is not silently replaced.

## Problems solved

- Resolved the project documentation's outdated `pdf-parse` v1 example. Installed `pdf-parse@2.4.5` uses the class-based `PDFParse({ data })`, `getText()`, and `destroy()` lifecycle.
- Added `serverExternalPackages: ["pdf-parse"]` for the current Next.js 16 server build.
- Runtime-validates extraction API responses in the client instead of trusting a TypeScript assertion.
- Handles invalid, oversized, image-only, and failed PDF extraction paths with human-readable messages and no raw error exposure.
- Changed the Personal Info email field from read-only auth data to an editable contact address and added server-side validation.
- Verification completed:
  - `npm run lint` passes.
  - `npx tsc --noEmit` passes.
  - `npm run build` passes when network access is allowed for the Inter font fetch.
  - `git diff --check` passes.

## Current state

- Phase 1 Foundation is complete.
- Phase 2 Profile Page:
  - 05 Profile Page — Full UI is complete.
  - 06 Profile Save Logic is complete.
  - 07 AI Profile Extraction from Resume is complete.
  - 08 Resume PDF Generation from Profile is next.
- `/profile` supports real profile loading/saving, resume upload, GPT-4o extraction into empty fields, completion calculation, and an editable contact email.
- Resume generation remains disabled and visual-only.
- Dashboard, Find Jobs, and Job Details remain protected placeholders.
- The worktree is dirty with uncommitted Feature 07 changes. Do not assume every modified profile or context file belongs only to the final email follow-up.
- A credential was exposed in conversation during this session. It was not copied here or used by the implementation; it must be revoked/rotated if that has not already happened.

## Next session starts with

Start Feature 08 Resume PDF Generation from Profile.

- Run `/remember restore`.
- Follow the `AGENTS.md` reading order.
- Use `/architect` because generation crosses profile data, GPT output, PDF rendering, storage replacement, and UI state.
- Use the OpenAI docs skill before OpenAI API work.
- Load the relevant installed skill before adding `@react-pdf/renderer`, then read the project-specific rules in `context/library-docs.md`.
- Read the relevant installed Next.js 16 route-handler guidance before implementation.
- Preserve Feature 06 saving and Feature 07 extraction behavior.
- Update `context/progress-tracker.md` and `context/ui-registry.md` after Feature 08.

## Open questions

- Should generated resumes replace the currently uploaded resume at the same stable storage key, as the existing architecture specifies, or should the user confirm replacement first?
- Should generation use only saved profile data or allow the current unsaved form state?
- Should `.env.example` be added to document required environment variable names without values?
