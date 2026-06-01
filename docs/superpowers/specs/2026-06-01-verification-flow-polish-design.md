# Verification Flow Polish — Design Spec

**Date:** 2026-06-01
**Scope:** Frontend UX completeness for the core verification flow. No new backend features, no new challenge tracks.

---

## User Journey

```
/challenges → /challenges/:id → /submit?challengeId=:id → /submissions/:id → /reports/:submissionId
```

Both authenticated and unauthenticated users can browse challenges. Auth state determines CTA behavior and layout. Unauthenticated users who click "Start verification" land on the submit page for that specific challenge after sign-in via the `next` param.

---

## Section 1: Shared Foundation

### `buildAuthRedirect(destination: string): string`

**File:** `apps/web/src/shared/utils/build-auth-redirect.ts`

Accepts an internal destination path and returns the full sign-in URL with the encoded `next` param.

```ts
// Guard against open redirect
if (!destination.startsWith('/')) return '/sign-in'
return `/sign-in?next=${encodeURIComponent(destination)}`
```

Used everywhere a sign-in redirect with a `next` param is constructed. Replaces inline `encodeURIComponent` calls.

### `ProfileReport` type

**File:** `apps/web/src/features/profile/types/index.ts`

Add `submissionId: string` alongside `id: string`. The profile API mapping must pass `submissionId` through from the backend `project_verification_reports.submission_id` field. If the backend profile endpoint does not return `submissionId`, note as a known gap and do not silently swallow the missing field.

### Submission pipeline constants

**File:** `apps/web/src/features/submissions/constants.ts`

Ordered pipeline stages with display labels and `toStatus` matchers:

```ts
export const PIPELINE_STAGES = [
  { key: 'created',           label: 'Submission created',  toStatus: null },         // synthetic
  { key: 'queued',            label: 'Queued',              toStatus: 'queued' },
  { key: 'ingesting',         label: 'Repository ingested', toStatus: 'ingesting' },
  { key: 'analyzing',         label: 'Analysis started',    toStatus: 'analyzing' },
  { key: 'generating_report', label: 'Report generating',   toStatus: 'generating_report' },
]

export const TERMINAL_STAGE_LABELS: Record<string, string> = {
  verified:   'Verified',
  insufficient: 'Insufficient',
  failed:     'Failed',
  expired:    'Expired',
}

export const FAILED_REASON_LABELS: Record<string, string> = {
  ingestion_failed:          'Ingestion failed',
  analysis_failed:           'Analysis failed',
  report_generation_failed:  'Report generation failed',
  expired:                   'Expired',
}
```

`submission.status` is the authoritative source for which step is active or terminal. Events supply timestamps only.

---

## Section 2: Challenges Page & Challenge Detail

### Challenge card CTA (`features/challenges/components/challenge-card.tsx`)

Card already receives `isAuthenticated`. CTA logic:

- Authenticated → `href=/submit?challengeId={id}`, label "Submit repository"
- Unauthenticated → `href=buildAuthRedirect('/submit?challengeId={id}')`, label "Start verification"

### Public challenges page (`features/challenges/components/challenges-public-page.tsx`)

`PublicChallengeCard` currently hardcodes `href=/sign-in?redirect=/challenges/{slug}`. Replace with `buildAuthRedirect('/submit?challengeId={id}')`.

### Challenge detail page (`app/(public)/challenges/[id]/page.tsx`)

Server component. Calls `notFound()` if challenge fetch throws. Max-width 720px centered.

Content order (top to bottom):

1. Back link → `/challenges` (ghost button, arrow-left icon)
2. Header: title (large semibold), category badge (e.g. "Backend Engineering"), verification focus sentence from challenge data
3. `<hr />`
4. "What this challenge verifies" — `challenge.description` as prose
5. "Rubric categories" — `challenge.rubric.categories` as icon list rows (`ti-circle-check` icon + category name)
6. "Skills earned" — badge pills (outline variant)
7. "Accepted repository examples" — hardcoded fallback list for MVP: `['Inventory API', 'Booking API', 'CRM Backend', 'Auth Service', 'Internal Tools API']`. Monospace anchors with `ti-external-link` icon. Marked as temporary UI fallback pending real data from backend.
8. "Passing threshold" — single sentence from challenge data (fallback: derived from rubric floor values if field absent)
9. Primary CTA button — same auth-conditional logic as challenge card

Route stays as `[id]` — no rename to `[slug]`.

---

## Section 3: Submit Page

### Server component (`app/(protected)/submit/page.tsx`)

Protected by `(protected)` layout (Supabase auth + redirect) and `proxy.ts` (`/submit` already in `PROTECTED_PREFIXES`; `pathWithSearch` already preserved in `next` param on redirect).

Reads `challengeId` from `searchParams`. If absent or challenge fetch throws: renders centered muted error state with link back to `/challenges`. No redirect.

Parallel fetches: challenge data + GitHub account status.

`githubReady`: `github.connected && ['read:user'].every(scope => github.scopes.includes(scope))`

Note: `repo` scope dropped from MVP requirements. Only `read:user` required.

Page max-width: 600px centered.

### `SubmitClient` (`features/submissions/components/submit-client.tsx`)

Pure render component. Receives: `challenge`, `githubReady`, and all form state/handlers from `useSubmitForm`.

**GitHub not connected state:**
- Bordered card
- `ti-brand-github` icon
- "Connect GitHub to continue" heading
- Explanation paragraph
- `ConnectGitHubButton` with `nextPath=/submit?challengeId={id}`
- No form shown

**GitHub connected state:**
- Challenge summary card (read-only): "Selected challenge" label, challenge title, category badge, "Change challenge" link → `/challenges`
- Repository URL input: full GitHub URL (`https://github.com/your-org/your-repo`), label "Repository URL"
- Commit SHA input: optional, label "Commit SHA" with "(optional)" badge, placeholder "Leave blank to verify the latest commit on the default branch"
- Submit button: "Submit for verification" (loading: "Submitting...", disabled)
- Error message zone (below button)
- Small muted text: "Verification typically takes 2–5 minutes."

### `useSubmitForm` hook (`features/submissions/hooks/use-submit-form.ts`)

Owns: `repoUrl`, `commitSha`, `submitting`, `error` state.

`parseGitHubUrl(url: string): string | null` — strips full GitHub URL to `owner/repo`. Returns `null` on invalid input. Lives in this file or in `shared/utils/`.

On submit:
1. Parse URL → `owner/repo`. If null, set validation error, return.
2. Call `apiClient.createSubmission({ challengeId, githubRepoFullName, commitSha: sha || undefined })`
3. Success → `router.push('/submissions/${id}')`
4. 429 → "You have reached the submission limit. Please wait before submitting again."
5. Any other error → "Something went wrong. Please try again."

### Dead code removed

`features/studio/components/submit-repository-form.tsx` — deleted. Replaced entirely by `SubmitClient` + `useSubmitForm`.

---

## Section 4: Submission Detail Polish

### Server component stays as server component

Parallel fetches: submission + events. Both passed as props to rendering components.

### Metadata card (left column)

Fields: repo name (monospace medium), challenge title (small muted), branch, commit SHA (monospace), submitted date (full human-readable), status badge.

### Status-specific message zone (below metadata card)

| Status | Renders |
|--------|---------|
| `queued \| ingesting \| analyzing \| generating_report` | Muted small text: "Verification is running. Results will appear here when complete." |
| `verified \| insufficient` | Full-width solid primary button "View report" → `/reports/${submission.id}` |
| `failed` | Muted card with `ti-alert-circle` (destructive color) + `failureReason` text. Fallback if null: "Verification failed. Please try again or contact support." |
| `expired` | Muted card with `ti-clock` + "Verification expired. The submission stayed in progress too long. Please submit again." |

Components: `SubmissionStatusMessage` in `features/submissions/components/`.

### Timeline (right column)

`SubmissionTimeline` component in `features/submissions/components/`.

**Stage resolution algorithm:**
1. `submission.status` determines active/terminal truth (not events).
2. Events supply timestamps for completed stages.
3. "Submission created" is completed if `events.length > 0`.
4. For non-terminal submissions: stages up to (not including) the current `submission.status` stage are completed; the current status stage is active; later stages are pending.
5. For terminal submissions: all stages up to and including the terminal stage are completed; no active or pending stages.
6. Terminal stage slot renders whichever of `verified | insufficient | failed | expired` matches `submission.status`.

**Step render rules:**
- Completed: filled green check circle, full foreground text, timestamp (small monospace muted)
- Active: pulsing dot (primary color), medium weight text, no timestamp
- Pending: empty circle (muted), muted text, no timestamp

---

## Section 5: Report Links & Route Cleanup

### Report link audit

| Location | Current | Fix |
|----------|---------|-----|
| `submissions/page.tsx` | No "View report" button | Add "View report" button for terminal submissions → `/reports/${submission.id}` |
| `studio/page.tsx` | `/reports/${latestReport.submissionId}` | Already correct — no change |
| `profile/verified-projects-section.tsx` | `/reports/${report.id}` (report ID) | Fix to `/reports/${report.submissionId}` |

### `ProfileReport` mapping

Check profile API server component for `latestReports` mapping. Add `submissionId` to the mapped object. If backend endpoint does not return `submissionId`, flag as known gap.

### Redirects

Already implemented in `proxy.ts`:
- `/dashboard` → `/studio` ✓
- `/studio/submissions` → `/submissions` ✓
- `/studio/challenges` → `/challenges` ✓

No changes to `proxy.ts` or `next.config.ts` needed for redirects.

### `/submit` protection

Already implemented in `proxy.ts`:
- `/submit` already in `PROTECTED_PREFIXES`
- `pathWithSearch` already preserved in `next` param on unauthenticated redirect

No `middleware.ts` to be created.

### Sidebar audit

Sidebar renders only in `app/(protected)/layout.tsx`. Challenges page and challenge detail page manually control layout based on auth state. No sidebar leak detected — no fix needed.

---

## Files Created

| File | Description |
|------|-------------|
| `apps/web/src/shared/utils/build-auth-redirect.ts` | `buildAuthRedirect` utility with open-redirect guard |
| `apps/web/src/app/(protected)/submit/page.tsx` | Submit page server component (replaces current one) |
| `apps/web/src/features/submissions/components/submit-client.tsx` | Submit form client component (pure render) |
| `apps/web/src/features/submissions/hooks/use-submit-form.ts` | Submit form hook (all form logic) |
| `apps/web/src/features/submissions/components/submission-status-message.tsx` | Status-specific message zone component |
| `apps/web/src/features/submissions/components/submission-timeline.tsx` | Pipeline timeline component |
| `apps/web/src/features/submissions/constants.ts` | Pipeline stage definitions and label maps |

## Files Modified

| File | Description |
|------|-------------|
| `apps/web/src/features/challenges/components/challenge-card.tsx` | Auth-conditional CTA href using `buildAuthRedirect` |
| `apps/web/src/features/challenges/components/challenges-public-page.tsx` | `PublicChallengeCard` CTA replaced with `buildAuthRedirect` |
| `apps/web/src/app/(public)/challenges/[id]/page.tsx` | Full redesign: back link, structured sections, real data, auth-conditional CTA |
| `apps/web/src/app/(protected)/submissions/[id]/page.tsx` | Pass events to new timeline component; render status message zone |
| `apps/web/src/app/(protected)/submissions/page.tsx` | Add "View report" button for terminal submissions |
| `apps/web/src/features/profile/types/index.ts` | Add `submissionId: string` to `ProfileReport` |
| `apps/web/src/features/profile/components/verified-projects-section.tsx` | Link to `/reports/${report.submissionId}` |

## Files Deleted

| File | Description |
|------|-------------|
| `apps/web/src/features/studio/components/submit-repository-form.tsx` | Replaced by `SubmitClient` + `useSubmitForm` |

## No Changes Needed

| File | Reason |
|------|--------|
| `apps/web/src/proxy.ts` | `/submit` already protected; redirects already present |
| `apps/web/next.config.ts` | Redirects handled by `proxy.ts` |
| `apps/web/src/shared/components/sidebar.tsx` | Only renders in protected layout — no leak |
| `apps/web/src/app/(protected)/layout.tsx` | Auth guard already correct |
| `apps/web/src/lib/api.ts` | `getReportBySubmissionId` already canonical |
| `apps/web/src/app/(protected)/studio/page.tsx` | Report link already uses `submissionId` correctly |
