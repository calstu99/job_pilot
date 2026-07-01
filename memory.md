# Memory — Feature 14 Dashboard UI

Last updated: 2026-07-01 16:04 PDT

## What was built

- Replaced the `/dashboard` placeholder with the complete responsive Feature 14 mock UI in `app/dashboard/page.tsx` and `components/dashboard/DashboardOverview.tsx`.
- Added four mock stat cards, five recent-activity entries, Company Research Activity, Jobs Found Over Time, and Match Score Distribution.
- Updated `context/ui-registry.md` through `/imprint` and marked Feature 14 complete in `context/progress-tracker.md`.

## Decisions made

- `context/designs/dashboard.png` is the Feature 14 visual source of truth where it conflicts with older build-plan wording: the fourth stat is Jobs This Week and the weekday bar chart is Company Research Activity.
- Feature 14 is presentation-only. It remains server-rendered and uses accessible SVG/CSS charts with design tokens rather than a new client charting dependency.
- Real database and PostHog data remain scoped to Features 15 through 17.

## Problems solved

- Preserved the shared protected header while replacing the temporary dashboard content.
- Made the wide screenshot layout responsive: four stats, paired middle cards, and the two-to-one lower chart row stack at smaller breakpoints.
- Full ESLint, TypeScript, production build, route generation, and `git diff --check` pass. The production build needs network access when Next fetches Inter for self-hosting.

## Current state

- Feature 14 is complete and `/review` found no dashboard issues.
- The working tree still contains the combined Feature 10 through Feature 14 changes.
- Feature 13 still has an unresolved critical SSRF risk: authenticated users can update `jobs.source_url`, and company homepage discovery follows it server-side with automatic redirects. Feature 13 must not be considered production-ready until this is fixed.

## Next session starts with

Run `/remember restore` and confirm this handoff. Then implement Feature 15 Stats Bar — Real Data, unless security remediation takes priority; before shipping, fix the Feature 13 SSRF boundary and rerun `/review`.

## Open questions

- Decide whether to address the Feature 13 SSRF before Feature 15 or immediately before release.
- Choose the SSRF defense: trusted Adzuna-host validation plus manual redirect handling, or a reusable outbound URL safety helper with DNS/IP checks.
- Decide whether Feature 15 should retain trend indicators when the available database history cannot support a meaningful week-over-week comparison.
