# Memory — Feature 08 Resume PDF Generation from Profile

Last updated: 2026-06-30 18:03 PDT

## What was built

Feature 08 is implemented but not yet marked complete because two review findings remain open.

- Added `app/api/resume/generate/route.ts` for authenticated generation from the current user's saved profile.
- Added `agent/resume-generator.ts` for GPT-4o structured professional summaries and polished work-experience bullets through the OpenAI Responses API.
- Added `lib/resume-generation.ts` for shared Zod schemas, types, and client response validation.
- Added `lib/resume-pdf.tsx` for server-side A4 PDF rendering with `@react-pdf/renderer`.
- Added `@react-pdf/renderer@4.5.1`.
- Extended `components/profile/ProfileForm.tsx` with:
  - Existing-resume replacement confirmation.
  - Generation loading, success, and friendly failure states.
  - Reset behavior that prevents a previously selected local PDF from overwriting a newly generated resume on the next profile save.
- Added `app/api/resume/view/route.ts` and a `View Resume` control that opens the active private PDF through an authenticated inline response.
- Updated `context/ui-registry.md` with the Resume View Control pattern.

## Decisions made

- Generation uses saved profile data only. Unsaved form edits must be saved first.
- Generation requires full name, contact email, current title, at least one skill, and one complete work-experience role. It does not require 100% profile completion.
- GPT-4o may polish wording but must not invent employers, titles, dates, responsibilities, achievements, metrics, skills, education, or credentials.
- Job preferences, salary, work authorization, industries, and cover-letter tone are excluded from generated resumes.
- A generated resume replaces the one active resume at `resumes/{user_id}/resume.pdf`.
- Users must confirm replacement when an active resume already exists.
- The route attempts to restore the prior file if the storage upload succeeds but the profile database update fails.
- Resume viewing goes through an authenticated route because the storage bucket is private.

## Problems solved

- Used the installed OpenAI Responses API and Zod structured-output pattern rather than the outdated Chat Completions example in project documentation.
- Verified the installed InsForge SDK accepts `File | Blob` uploads and persists both returned `url` and `key`.
- Converted the React PDF Node buffer to a typed byte array before creating a `Blob`, resolving the Node `Buffer<ArrayBufferLike>` versus browser `BlobPart` TypeScript mismatch.
- The first production build could not fetch Inter inside the restricted network sandbox; the build passed when network access was allowed.
- Verification currently passes:
  - `npx tsc --noEmit`
  - `npm run lint`
  - `npm run build`
  - `git diff --check`
- The worktree was clean when this memory was saved.

## Current state

- Features 05, 06, and 07 are complete.
- Feature 08 generation and authenticated PDF viewing work at the code/build level.
- `context/progress-tracker.md` still lists Feature 08 as next because final review has not passed.
- `context/ui-registry.md` includes the new Resume View Control, but the broader Feature 08 generation UI should only be finalized after the open review issues are resolved.
- Dashboard, Find Jobs, and Job Details remain protected placeholders.
- A credential was exposed in an earlier conversation. It was not copied here or used by this implementation; it must be revoked or rotated if that has not already happened.

## Next session starts with

Resolve the two Feature 08 review findings:

1. Filter saved work history so only complete roles are sent to GPT-4o and rendered.
2. Tighten or dynamically constrain summary, skills, roles, and bullet content so the single A4 page cannot overflow or clip.

Then:

- Re-run TypeScript, lint, production build, and `git diff --check`.
- Run `/review` again.
- Run `/imprint` for the completed generation controls.
- Mark Feature 08 complete in `context/progress-tracker.md`.
- Update `context/ui-registry.md` and any affected architecture/library documentation.

## Open questions

- Should `.env.example` be added to document required environment variable names without values?
