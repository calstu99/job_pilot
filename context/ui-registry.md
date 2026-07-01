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

### Profile Page Full UI

File: app/profile/page.tsx
Last updated: 2026-06-30

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-background` for page, `bg-surface` for cards and controls, `bg-surface-secondary` for upload and nested role panels |
| Border           | `border-border`, `border-error/20`, `border-dashed` for upload dropzone |
| Border radius    | `rounded-xl` for cards, upload area, major buttons, and chips; `rounded-lg` for form controls |
| Text — primary   | `text-text-primary`, `text-text-dark` |
| Text — secondary | `text-text-secondary`, `text-text-muted` |
| Spacing          | `px-6 py-8` page shell, `p-8` cards, `space-y-8` between cards, `space-y-16` between form sections, `gap-6` form grid |
| Hover state      | none for mock controls in Feature 05 |
| Shadow           | `shadow-sm` |
| Accent usage     | `bg-accent`, `text-accent`, `border-accent`, SVG progress stroke using `var(--color-error)`, `text-error`, `bg-error/5` |

**Pattern notes:**
The profile page follows the delivered `context/designs/profile.png` mock as source of truth. It uses the retina-scaled centered content column (`max-w-[936px]`) inside the protected page background, white card surfaces, 16px form control text, uppercase 12px labels, and visual-only mock controls. The completion indicator uses layered SVG circles with rounded stroke caps so progress arcs match the design instead of hard-ended conic gradients.

### Profile Save Form

File: components/profile/ProfileForm.tsx
Last updated: 2026-06-30

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-surface` for cards and controls, `bg-surface-secondary` for upload zones, role panels, add buttons, and status messages |
| Border           | `border-border`, `border-error/20`, `border-success/20`, `border-dashed` for upload dropzone |
| Border radius    | `rounded-xl` for cards, upload area, major buttons, and role panels; `rounded-lg` for form controls and chips |
| Text — primary   | `text-text-primary`, `text-text-dark` |
| Text — secondary | `text-text-secondary`, `text-text-muted` |
| Spacing          | `p-8` cards, `px-8 py-9` banner, `space-y-8` page form stack, `space-y-16` form sections, `gap-6` form grid |
| Hover state      | `hover:bg-error/10` and `focus:ring-error` for clickable missing-field chips; additive chip buttons rely on explicit click affordance and focus rings |
| Shadow           | `shadow-sm` |
| Accent usage     | `bg-accent`, `text-accent`, `border-accent`, `focus:ring-accent`, `text-error`, `text-success`, SVG strokes using token CSS variables |

**Pattern notes:**
Feature 06 preserves the Feature 05 visual shell while moving editable controls into `components/profile/ProfileForm.tsx`. Scalar inputs and selects are controlled client state, with hidden JSON inputs for tag arrays and work experience, and `useActionState` for save feedback. Contact email uses the standard editable email input pattern; it is initially populated from authentication but may diverge from the login identity. Select controls keep the same 40px tokenized form-control shell but use select-specific cursor/appearance/pr classes so native dropdown hit areas remain reliable. Resume upload uses a styled label that matches the existing secondary button pattern while the real file input stays visually hidden. Missing-field chips in the attention banner behave as compact navigation buttons: they keep the badge styling, scroll to the relevant form section, and focus the first useful input in that section. The completion ring keeps `text-[34px]` for normal percentages and uses a centered `w-20 text-[30px]` treatment for `100%` so complete-state text stays inside the circle.

### Protected Header

File: components/layout/ProtectedHeader.tsx
Last updated: 2026-06-30

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-surface` |
| Border           | `border-border` |
| Border radius    | `rounded-md` for sign out button |
| Text — primary   | `text-text-primary`, `text-text-dark` |
| Text — secondary | none |
| Spacing          | `px-6 py-4`, `gap-4`, `gap-6`, `sm:gap-8` |
| Hover state      | `hover:bg-surface-secondary` |
| Shadow           | `shadow-sm` on sign out button |
| Accent usage     | `text-accent` for active protected nav item |

**Pattern notes:**
Protected pages share this header for authenticated navigation and logout. The sign out control is a Server Action form button so it clears SSR auth cookies without adding client-side auth state. Dashboard, Find Jobs, Job Details, and Profile should use this component until a later full-page UI phase replaces the surrounding content.

### Resume Extraction Controls

File: components/profile/ProfileForm.tsx
Last updated: 2026-06-30

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-surface-secondary` for the extraction panel, `bg-success-lightest` or `bg-error/5` for feedback |
| Border           | `border-border`, `border-success/20`, `border-error/20` |
| Border radius    | `rounded-xl` for panel and primary action, `rounded-lg` for feedback |
| Text — primary   | `text-text-secondary` for guidance |
| Text — secondary | `text-success-foreground`, `text-error` for status |
| Spacing          | `p-4`, `px-6 py-3`, `px-4 py-3`, `gap-3` |
| Hover state      | disabled actions use `disabled:cursor-not-allowed disabled:opacity-70` |
| Shadow           | `shadow-sm` on the extraction action |
| Accent usage     | `bg-accent text-accent-foreground` for Extract from Resume |

**Pattern notes:**
Resume extraction stays inside the existing Resume card and appears only after a local PDF is selected. Async feedback uses token-colored bordered messages with `aria-live="polite"`. The primary action retains the profile page’s rounded accent-button treatment and swaps its label to `Extracting...` while disabled.

### Resume View Control

File: components/profile/ProfileForm.tsx
Last updated: 2026-06-30

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-surface`, `hover:bg-surface-secondary` |
| Border           | `border-border` |
| Border radius    | `rounded-xl` |
| Text — primary   | `text-text-dark` |
| Text — secondary | none |
| Spacing          | `mt-4`, `px-6 py-2` |
| Hover state      | `hover:bg-surface-secondary`, `focus:ring-1 focus:ring-accent` |
| Shadow           | `shadow-sm` |
| Accent usage     | `focus:ring-accent` |

**Pattern notes:**
The active saved resume uses a quiet secondary action beneath the upload status. `View Resume` opens the authenticated inline PDF route in a new tab; the control is hidden when no persisted resume exists and does not preview a locally selected unsaved file.

### Resume Generation Controls

File: components/profile/ProfileForm.tsx
Last updated: 2026-06-30

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-surface-secondary` for guidance, `bg-accent` for the action, `bg-success-lightest` or `bg-error/5` for feedback |
| Border           | `border-border`, `border-success/20`, `border-error/20` |
| Border radius    | `rounded-xl` for panel and action, `rounded-lg` for feedback |
| Text — primary   | `text-text-dark`, `text-accent-foreground` |
| Text — secondary | `text-text-secondary`, `text-text-muted`, status token colors |
| Spacing          | `p-4`, `px-8 py-3`, `mt-6`, `px-4 py-3`, `gap-4` |
| Hover state      | disabled actions use `disabled:cursor-not-allowed disabled:opacity-70` |
| Shadow           | `shadow-sm` on the generation action |
| Accent usage     | `bg-accent text-accent-foreground` for Generate Resume from Profile |

**Pattern notes:**
Resume generation stays inside the Resume card and clearly states that it uses saved profile data. The primary action swaps to `Generating...` while disabled, existing resumes require replacement confirmation, and success or failure feedback uses the same tokenized live-region pattern as resume extraction.

### Find Jobs Search Controls

File: components/find-jobs/SearchControls.tsx
Last updated: 2026-06-30

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-surface` for card and controls, `bg-success-lightest` for success feedback |
| Border           | `border-border`, `border-success-light` |
| Border radius    | `rounded-xl` for card, `rounded-lg` for controls and feedback |
| Text — primary   | `text-text-primary`, `text-text-dark`, `text-accent-foreground` |
| Text — secondary | `text-text-muted`, `text-success-dark` |
| Spacing          | `p-6`, `gap-5`, `px-4`, `px-7`, `mt-5` |
| Hover state      | none for Feature 09 mock controls |
| Shadow           | `shadow-sm` |
| Accent usage     | `bg-accent`, `focus-within:ring-accent`, `focus:ring-accent` |

**Pattern notes:**
Find Jobs search uses uppercase 12px field labels, 48px controls, and a full-width tokenized success banner beneath the desktop control row. The controls stack on smaller screens and remain visual-only until Feature 10.

### Job Filter Bar

File: components/find-jobs/JobFilters.tsx
Last updated: 2026-06-30

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-surface` |
| Border           | `border-border` |
| Border radius    | `rounded-xl` for bar, `rounded-lg` for selects |
| Text — primary   | `text-text-primary`, `text-text-dark` |
| Text — secondary | `text-text-muted` |
| Spacing          | `p-4`, `gap-3`, `gap-4`, `px-4` |
| Hover state      | none for Feature 09 mock controls |
| Shadow           | `shadow-sm` |
| Accent usage     | `focus:ring-accent`, `focus:border-accent` |

**Pattern notes:**
Job list filtering uses one quiet search field followed by bordered select controls. A token-colored divider separates search from desktop filters, while mobile uses a stacked layout without the divider.

### Jobs Results Table

File: components/find-jobs/JobsTable.tsx, components/find-jobs/JobsPagination.tsx
Last updated: 2026-06-30

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-surface` for rows and buttons, `bg-surface-secondary` for header, pagination, icons, and row hover |
| Border           | `border-border`, active page uses `border-accent-light` |
| Border radius    | `rounded-xl` for outer card, `rounded-lg` for icons and pagination controls, `rounded-full` for score bars |
| Text — primary   | `text-text-primary`, `text-text-dark` |
| Text — secondary | `text-text-secondary`, `text-text-muted` |
| Spacing          | `px-8 py-5` table cells, `px-6 py-5` pagination, `gap-2`, `gap-3`, `gap-4` |
| Hover state      | `hover:bg-surface-secondary` |
| Shadow           | `shadow-sm` on outer card and pagination buttons |
| Accent usage     | `bg-accent-muted text-accent` for active page; score fills use `bg-success`, `bg-info-medium`, and `bg-warning` |

**Pattern notes:**
Jobs tables use uppercase 12px headers, white rows separated by token borders, 16px primary row content, and inline 6px match bars. The desktop table scrolls horizontally on narrow screens instead of collapsing columns; pagination wraps naturally below it.
