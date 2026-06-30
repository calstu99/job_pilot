<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog into JobPilot. The integration covers client-side initialization via `instrumentation-client.ts` (Next.js 15.3+ pattern), a reverse proxy via `next.config.ts` rewrites, a server-side PostHog singleton in `lib/posthog-server.ts`, server-side event capture in the OAuth server action and auth callback route, user identification on successful sign-in, and engagement event capture on all authenticated server-rendered pages.

| Event name | Description | File |
|---|---|---|
| `oauth_sign_in_initiated` | User clicked a social sign-in button (Google or GitHub) to start the OAuth flow. | `actions/auth.ts` |
| `sign_in_completed` | User successfully completed OAuth sign-in and was redirected to the dashboard. | `app/api/auth/callback/route.ts` |
| `sign_in_failed` | OAuth sign-in failed due to an error during the callback or code exchange. | `app/api/auth/callback/route.ts` |
| `dashboard_viewed` | Authenticated user loaded the dashboard page after signing in. | `app/dashboard/page.tsx` |
| `find_jobs_viewed` | Authenticated user navigated to the job discovery page. | `app/find-jobs/page.tsx` |
| `job_detail_viewed` | Authenticated user opened a specific job listing detail page. | `app/find-jobs/[id]/page.tsx` |
| `profile_viewed` | Authenticated user visited their profile setup page. | `app/profile/page.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) dashboard](https://us.posthog.com/project/490212/dashboard/1772872)
- [Sign-in Funnel](https://us.posthog.com/project/490212/insights/mBfxKC3z) — Conversion from OAuth initiation to sign-in completion
- [New Sign-ins Over Time](https://us.posthog.com/project/490212/insights/mlUYWuJ5) — Daily sign-in volume
- [Sign-in Failures](https://us.posthog.com/project/490212/insights/yeX4079g) — Auth error monitoring
- [Daily Active Users](https://us.posthog.com/project/490212/insights/A6SBYbl4) — Engagement retention signal
- [Feature Adoption](https://us.posthog.com/project/490212/insights/vLKYqwnQ) — Find Jobs, Job Details, and Profile usage

## Verify before merging

- [ ] Run a full production build (`npm run build`) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env.example` and any monorepo/bootstrap scripts so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify.
- [ ] Confirm the returning-visitor path also calls `identify` — currently `identify` only runs on the OAuth callback. A user who returns with a valid session cookie bypasses the callback and will be on an anonymous distinct ID until they sign in again. Consider calling `posthog.identify()` in a server component that reads the active session on page load.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
