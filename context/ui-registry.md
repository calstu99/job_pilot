# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following ui-rules.md and ui-tokens.md, then add it here

After building any component — update this file with the component name, file path, and exact classes used.

---

## Components

### Homepage Shell

File: app/page.tsx
Last updated: 2026-06-29

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-surface` |
| Border           | `border-border` |
| Border radius    | `rounded-md` for buttons, `rounded-xl` to `rounded-[28px]` for screenshot assets |
| Text — primary   | `text-text-slate`, `text-text-black` |
| Text — secondary | `text-text-slate-medium`, `text-text-darker`, `text-text-secondary` |
| Spacing          | `px-6 sm:px-10 lg:px-20`, `py-16`, `py-24`, `gap-4` |
| Hover state      | `hover:bg-overlay`, `hover:bg-surface-secondary` |
| Shadow           | `shadow-sm`, screenshot asset shadows using token-based `color-mix()` |
| Accent usage     | `bg-overlay-dark`, `text-accent`, `border-l-accent`, `border-l-success-dark` |

**Pattern notes:**
Homepage sections use full-width bordered bands inside a `max-w-[1440px]` shell. The landing hero and final CTA share the `.hero-wash` utility from `app/globals.css`; decorative separators use `.hatched-divider`. CTA buttons use dark primary and white secondary variants with token colors only.

### Homepage Feature Bands

File: app/page.tsx
Last updated: 2026-06-29

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-surface`, `bg-surface-muted`, `bg-surface-tertiary` |
| Border           | `border-border`, `divide-border` |
| Border radius    | `rounded-xl` for embedded image assets |
| Text — primary   | `text-text-slate` |
| Text — secondary | `text-text-slate-medium` |
| Spacing          | `px-8 py-10 sm:px-16 lg:px-20`, `px-8 py-16 sm:px-16 lg:px-20` |
| Hover state      | none |
| Shadow           | token-based image shadows |
| Accent usage     | `border-l-accent`, `border-l-success-dark` |

**Pattern notes:**
Feature rows are separated with borders rather than nested cards. Active rows use a 2px left border only; horizontal separators remain `border-border`.

### Auth Login Card

File: app/(auth)/login/page.tsx
Last updated: 2026-06-29

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-background` for page, `bg-surface` for card and secondary OAuth button, `bg-overlay-dark` for primary OAuth button |
| Border           | `border-border`, `border-border-muted` |
| Border radius    | `rounded-xl` for auth card, `rounded-md` for buttons and messages, `rounded-full` for provider marks |
| Text — primary   | `text-text-primary` |
| Text — secondary | `text-text-secondary`, `text-text-dark` |
| Spacing          | `px-6 py-8`, `p-6`, `mt-8`, `gap-3`, `h-12` |
| Hover state      | `hover:bg-surface-secondary`, `hover:bg-overlay` |
| Shadow           | `shadow-sm` |
| Accent usage     | `text-accent`, `text-error`, `text-accent-foreground` |

**Pattern notes:**
Auth pages use a centered single card on `bg-background` with token-only colors. OAuth options are full-width 48px controls; the quieter option stays white and the stronger option uses `bg-overlay-dark` to match homepage CTA treatment.

### Protected Placeholder Shell

File: app/dashboard/page.tsx, app/profile/page.tsx, app/find-jobs/page.tsx, app/find-jobs/[id]/page.tsx
Last updated: 2026-06-29

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-background` for page, `bg-surface` for content card |
| Border           | `border-border` |
| Border radius    | `rounded-xl` |
| Text — primary   | `text-text-primary` |
| Text — secondary | `text-text-secondary` |
| Spacing          | `px-6 py-8`, `p-6`, `mt-3` |
| Hover state      | none |
| Shadow           | `shadow-sm` |
| Accent usage     | `text-accent` |

**Pattern notes:**
Temporary protected pages use one simple content card to verify auth routing without pre-building later phase UI. Replace these placeholders in their planned phases while preserving the page background, card surface, border, and typography tokens.

### PostHog Provider

File: components/providers/PostHogProvider.tsx
Last updated: 2026-06-29

| Property         | Class |
| ---------------- | ----- |
| Background       | none |
| Border           | none |
| Border radius    | none |
| Text — primary   | none |
| Text — secondary | none |
| Spacing          | none |
| Hover state      | none |
| Shadow           | none |
| Accent usage     | none |

**Pattern notes:**
This is a non-visual provider component. It should not introduce layout wrappers, classes, or visible UI; it only initializes PostHog context and keeps browser identity in sync with the active session.

### Database Schema

File: migrations/20260629062950_create-jobpilot-schema.sql
Last updated: 2026-06-29

| Property         | Class |
| ---------------- | ----- |
| Background       | none |
| Border           | none |
| Border radius    | none |
| Text — primary   | none |
| Text — secondary | none |
| Spacing          | none |
| Hover state      | none |
| Shadow           | none |
| Accent usage     | none |

**Pattern notes:**
This is a non-visual backend feature. It creates the owner-scoped InsForge tables and private resume storage bucket used by later UI phases, but it should not introduce layout, classes, or visible components.
