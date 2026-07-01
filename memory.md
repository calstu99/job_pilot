# Memory — Feature 13 Company Research Review

Last updated: 2026-07-01 14:32 PDT

## What was built

- Implemented Feature 13 Company Research across `agent/research.ts`, `lib/browserbase.ts`, `lib/stagehand.ts`, `app/api/agent/research/route.ts`, and `components/job-details/CompanyResearch.tsx`.
- Added synchronous research loading, browser-research fallback, structured GPT-4o dossier synthesis, owner-scoped persistence, agent logging, and the approved `company_researched` PostHog event.
- Extended job details loading to normalize and render all nine persisted dossier fields.
- Added a `View full job description` action to `components/job-details/JobDescription.tsx`; it opens the saved original listing because Adzuna only provides a truncated description snippet.
- Installed the approved Browserbase SDK and Stagehand dependencies.
- Updated `context/ui-registry.md` and `context/progress-tracker.md`.

## Decisions made

- Research waits synchronously in the UI while one 120-second Browserbase session visits the homepage and at most three prioritized same-company pages.
- Browser failures fall back to synthesis from the saved job and profile; generation or persistence failures preserve any previous dossier.
- Sources saved in the dossier are the exact pages visited, not model-authored URLs.
- Analytics fires only after the owner-scoped dossier update succeeds.

## Problems solved

- Replaced stale Stagehand examples with the installed Stagehand v3 API and explicit Browserbase session creation.
- Added empty, loading, error, complete, and rerun states to the Company Research card.
- Added fallback warnings and hard-failure entries to `agent_logs` when the job has an originating agent run.
- Replaced the misleading impression of locally truncated job content with a direct path to the complete source listing.
- ESLint, standalone TypeScript, production build, route generation, and `git diff --check` pass.
- The focused job-description ESLint, TypeScript, and diff checks also pass.

## Current state

- Feature 13 is implemented but is not production-ready.
- Final review found a critical SSRF risk: authenticated users can update `jobs.source_url`, and homepage discovery follows that URL server-side with automatic redirects.
- The current working tree still contains the combined Feature 10 through Feature 13 changes.
- No live Browserbase/OpenAI research run was executed during verification.

## Next session starts with

Run `/remember restore`, confirm this handoff, then fix the SSRF boundary before treating Feature 13 as complete. Validate every outbound fetch target and redirect hop against private, loopback, link-local, and otherwise unsafe destinations, then rerun `/review`.

## Open questions

- Choose the SSRF defense: strict trusted Adzuna-host validation plus manual redirect handling, or a reusable outbound URL safety helper with DNS/IP checks.
- After the security review passes, decide whether to perform a live research run before starting Feature 14.
- Decide later whether to add `.env.example` containing variable names only.
