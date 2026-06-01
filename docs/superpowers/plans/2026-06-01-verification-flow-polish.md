# Verification Flow Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the end-to-end verification flow — challenges CTA, challenge detail page, submit page, submission timeline, and report links — with zero new backend features.

**Architecture:** All changes are frontend-only in `apps/web`. Shared types in `packages/shared` are read-only. A single `buildAuthRedirect` utility centralises the auth redirect pattern. The submit page moves from a single-file form to a server component + client component + hook split following the spec's feature-first structure.

**Tech Stack:** Next.js App Router (server + client components), Supabase SSR auth, `@tabler/icons-react`, shadcn/ui, TypeScript strict mode.

**Spec:** `docs/superpowers/specs/2026-06-01-verification-flow-polish-design.md`

---

## File Map

**Created:**
- `apps/web/src/shared/utils/build-auth-redirect.ts` — open-redirect-safe sign-in URL builder
- `apps/web/src/features/submissions/constants.ts` — pipeline stage definitions + label maps
- `apps/web/src/features/submissions/components/submit-client.tsx` — pure render submit form
- `apps/web/src/features/submissions/hooks/use-submit-form.ts` — all submit form logic
- `apps/web/src/features/submissions/components/submission-status-message.tsx` — status zone
- `apps/web/src/features/submissions/components/submission-timeline.tsx` — pipeline timeline

**Modified:**
- `apps/web/src/features/challenges/components/challenge-card.tsx` — CTA href + label
- `apps/web/src/features/challenges/components/challenges-public-page.tsx` — PublicChallengeCard CTA
- `apps/web/src/app/(public)/challenges/[id]/page.tsx` — full redesign
- `apps/web/src/app/(protected)/submit/page.tsx` — use new SubmitClient
- `apps/web/src/app/(protected)/submissions/[id]/page.tsx` — use new timeline + status components
- `apps/web/src/app/(protected)/submissions/page.tsx` — add View report button
- `apps/web/src/features/profile/types/index.ts` — add submissionId to ProfileReport
- `apps/web/src/features/profile/components/verified-projects-section.tsx` — fix report link
- `apps/web/src/app/p/[username]/page.tsx` — pass submissionId through from API

**Deleted:**
- `apps/web/src/features/studio/components/submit-repository-form.tsx`

---

## Task 1: `buildAuthRedirect` utility

**Files:**
- Create: `apps/web/src/shared/utils/build-auth-redirect.ts`

- [ ] **Step 1: Create the utility file**

```ts
// apps/web/src/shared/utils/build-auth-redirect.ts
export function buildAuthRedirect(destination: string): string {
  if (!destination.startsWith('/')) return '/sign-in'
  return `/sign-in?next=${encodeURIComponent(destination)}`
}
```

- [ ] **Step 2: Verify TypeScript accepts it**

```bash
cd apps/web && pnpm exec tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/shared/utils/build-auth-redirect.ts
git commit -m "feat: add buildAuthRedirect utility"
```

---

## Task 2: Submission pipeline constants

**Files:**
- Create: `apps/web/src/features/submissions/constants.ts`

- [ ] **Step 1: Create the constants file**

```ts
// apps/web/src/features/submissions/constants.ts
import type { SubmissionStatus } from '@praxis/shared'

export interface PipelineStage {
  key: string
  label: string
  toStatus: SubmissionStatus | null
}

export const PIPELINE_STAGES: PipelineStage[] = [
  { key: 'created',           label: 'Submission created',  toStatus: null },
  { key: 'queued',            label: 'Queued',              toStatus: 'queued' },
  { key: 'ingesting',         label: 'Repository ingested', toStatus: 'ingesting' },
  { key: 'analyzing',         label: 'Analysis started',    toStatus: 'analyzing' },
  { key: 'generating_report', label: 'Report generating',   toStatus: 'generating_report' },
]

export const TERMINAL_STAGE_LABELS: Partial<Record<SubmissionStatus, string>> = {
  verified:     'Verified',
  insufficient: 'Insufficient',
  failed:       'Failed',
  expired:      'Expired',
}

export const TERMINAL_STATUSES: SubmissionStatus[] = [
  'verified', 'insufficient', 'failed', 'expired',
]
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd apps/web && pnpm exec tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/features/submissions/constants.ts
git commit -m "feat: add submission pipeline constants"
```

---

## Task 3: `ProfileReport` type — add `submissionId`

**Files:**
- Modify: `apps/web/src/features/profile/types/index.ts`

- [ ] **Step 1: Add `submissionId` to the interface**

Replace the entire file content:

```ts
// apps/web/src/features/profile/types/index.ts
export interface ProfileReport {
  id: string
  submissionId: string
  repositoryName: string
  challengeTitle: string
  challengeCategory: string
  verdict: string
  verifiedAt: string
}

export interface PublicProfile {
  username: string
  verifiedSkills: string[]
  reportsCount: number
  verificationsCount: number
  challengesCompleted: number
  latestReports: ProfileReport[]
}
```

- [ ] **Step 2: Verify TypeScript (expect errors in consumers — fix in next steps)**

```bash
cd apps/web && pnpm exec tsc --noEmit
```

Expected: errors in `verified-projects-section.tsx` and `p/[username]/page.tsx` referencing missing `submissionId`. That's expected — fix in Tasks 4 and 5.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/features/profile/types/index.ts
git commit -m "feat: add submissionId to ProfileReport type"
```

---

## Task 4: Fix profile page — pass `submissionId` from API

**Files:**
- Modify: `apps/web/src/app/p/[username]/page.tsx`

The backend `/users/:username/profile` endpoint returns `latestReports`. Check whether `submissionId` is already in the response shape. The `PublicProfile` type drives the mapping — since `ProfileReport` now requires `submissionId`, the API must return it. If the backend does not return it, log a known gap comment and use `''` as a temporary fallback.

- [ ] **Step 1: The profile page fetches the raw API response and passes it straight to `ProfileClient` as `PublicProfile`. The type assertion at `res.json() as Promise<PublicProfile>` means the field will be `undefined` at runtime if the API does not include it. Add a runtime mapping that either passes through the field or surfaces the gap.**

Replace the entire file:

```tsx
// apps/web/src/app/p/[username]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ProfileClient } from '@/features/profile/components/profile-client'
import type { PublicProfile, ProfileReport } from '@/features/profile/types'

type Props = {
  params: Promise<{ username: string }>
}

type RawProfileReport = Omit<ProfileReport, 'submissionId'> & { submissionId?: string }
type RawPublicProfile = Omit<PublicProfile, 'latestReports'> & { latestReports: RawProfileReport[] }

async function fetchPublicProfile(username: string): Promise<PublicProfile | null> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/users/${encodeURIComponent(username)}/profile`,
    { cache: 'no-store' },
  )
  if (res.status === 404) return null
  if (!res.ok) throw new Error('Failed to fetch profile')
  const raw = await res.json() as RawPublicProfile
  return {
    ...raw,
    latestReports: raw.latestReports.map((r) => ({
      ...r,
      // Known gap: submissionId will be '' if backend profile endpoint does not yet return it.
      submissionId: r.submissionId ?? '',
    })),
  }
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params
  const profile = await fetchPublicProfile(username)
  if (!profile) notFound()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[680px] mx-auto px-6 pt-12 pb-20">
        <div className="mb-10">
          <Link href="/" className="text-sm font-semibold tracking-tight text-foreground hover:opacity-80 transition-opacity">
            Praxis
          </Link>
        </div>
        <ProfileClient profile={profile} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd apps/web && pnpm exec tsc --noEmit
```

Expected: no errors in this file. `verified-projects-section.tsx` may still error — fix in Task 5.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/p/[username]/page.tsx
git commit -m "fix: pass submissionId through profile API mapping"
```

---

## Task 5: Fix `VerifiedProjectsSection` report link

**Files:**
- Modify: `apps/web/src/features/profile/components/verified-projects-section.tsx`

- [ ] **Step 1: Change `report.id` to `report.submissionId` in the link href**

Find line:
```tsx
<Link href={`/reports/${report.id}`}>View report</Link>
```

Replace with:
```tsx
<Link href={`/reports/${report.submissionId}`}>View report</Link>
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd apps/web && pnpm exec tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/features/profile/components/verified-projects-section.tsx
git commit -m "fix: link profile report cards to canonical /reports/:submissionId"
```

---

## Task 6: Update challenge card CTA

**Files:**
- Modify: `apps/web/src/features/challenges/components/challenge-card.tsx`

The card currently links to `/challenges/${challenge.slug}` (authenticated) or `/sign-in?redirect=...` (unauthenticated). Per spec, the CTA should go directly to `/submit?challengeId=` and the label should change to match auth state.

- [ ] **Step 1: Rewrite the CTA logic**

Replace entire file:

```tsx
// apps/web/src/features/challenges/components/challenge-card.tsx
'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DIFFICULTY_CLASS, DIFFICULTY_LABEL } from '@/features/challenges/constants'
import { buildAuthRedirect } from '@/shared/utils/build-auth-redirect'
import type { Challenge } from '@/features/challenges/types'

type Props = {
  challenge: Challenge
  isAuthenticated: boolean
}

export function ChallengeCard({ challenge, isAuthenticated }: Props) {
  const ctaHref = isAuthenticated
    ? `/submit?challengeId=${challenge.id}`
    : buildAuthRedirect(`/submit?challengeId=${challenge.id}`)
  const ctaLabel = isAuthenticated ? 'Submit repository' : 'Start verification'

  return (
    <div className="rounded-lg border bg-card">
      <div className="px-5 py-4">
        <p className="text-sm font-semibold">{challenge.title}</p>
        <p className="text-xs text-muted-foreground mt-1">{challenge.description}</p>
      </div>
      <div className="px-5 py-3 border-t border-border/60 flex items-center gap-4">
        <div className="flex-1 flex flex-wrap gap-1.5">
          {challenge.skills.map((skill) => (
            <Badge key={skill} variant="outline" className="text-[11px]">
              {skill}
            </Badge>
          ))}
        </div>
        <span
          className={`shrink-0 text-[11px] font-medium px-2 py-0.5 border rounded-sm ${DIFFICULTY_CLASS[challenge.difficulty]}`}
        >
          {DIFFICULTY_LABEL[challenge.difficulty]}
        </span>
        <Button variant="outline" size="sm" asChild className="shrink-0">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd apps/web && pnpm exec tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/features/challenges/components/challenge-card.tsx
git commit -m "feat: update challenge card CTA to go directly to submit page"
```

---

## Task 7: Update public challenge card CTA

**Files:**
- Modify: `apps/web/src/features/challenges/components/challenges-public-page.tsx`

The `PublicChallengeCard` currently hardcodes `href=/sign-in?redirect=/challenges/${challenge.slug}`. Replace with `buildAuthRedirect`.

- [ ] **Step 1: Add import and fix href**

At the top of the file, add:
```tsx
import { buildAuthRedirect } from '@/shared/utils/build-auth-redirect'
```

In `PublicChallengeCard`, replace:
```tsx
const href = `/sign-in?redirect=/challenges/${challenge.slug}`
```
with:
```tsx
const href = buildAuthRedirect(`/submit?challengeId=${challenge.id}`)
```

Also replace the button and its sub-span:
```tsx
<Button variant="outline" size="sm" asChild>
  <Link href={href}>View challenge</Link>
</Button>
<span className="text-[11px] text-muted-foreground">Sign in required to submit</span>
```
with:
```tsx
<Button variant="outline" size="sm" asChild>
  <Link href={href}>Start verification</Link>
</Button>
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd apps/web && pnpm exec tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/features/challenges/components/challenges-public-page.tsx
git commit -m "feat: update public challenge card CTA to use buildAuthRedirect"
```

---

## Task 8: Redesign challenge detail page

**Files:**
- Modify: `apps/web/src/app/(public)/challenges/[id]/page.tsx`

Key facts from the types:
- `ProjectChallenge.passingThreshold` is a `number` (e.g. `70`) — render as "Requires a composite score of at least {n} and all category floors must be met."
- `ProjectChallenge.rubric.categories` → `RubricCategory[]` with `name`, `weight`, `floor`
- No `acceptedExamples` field on `ProjectChallenge` — use hardcoded fallback list
- Category label: derive from `projectType` — `'frontend'` → `'Frontend Engineering'`, else `'Backend Engineering'`

- [ ] **Step 1: Rewrite the page**

```tsx
// apps/web/src/app/(public)/challenges/[id]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { serverApiFetch } from '@/lib/api.server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { buildAuthRedirect } from '@/shared/utils/build-auth-redirect'
import { IconArrowLeft, IconCircleCheck, IconExternalLink } from '@tabler/icons-react'
import type { ProjectChallenge } from '@praxis/shared'

const ACCEPTED_REPOSITORY_EXAMPLES = [
  'Inventory API',
  'Booking API',
  'CRM Backend',
  'Auth Service',
  'Internal Tools API',
]

type Props = {
  params: Promise<{ id: string }>
}

export default async function ChallengeDetailPage(props: Props) {
  const { id } = await props.params
  const supabase = await createClient()

  const [{ data: { user } }, challenge] = await Promise.all([
    supabase.auth.getUser(),
    serverApiFetch<ProjectChallenge>(`/challenges/${id}`).catch(() => null),
  ])

  if (!challenge) notFound()

  const categoryLabel = challenge.projectType === 'frontend' ? 'Frontend Engineering' : 'Backend Engineering'
  const submitHref = user
    ? `/submit?challengeId=${challenge.id}`
    : buildAuthRedirect(`/submit?challengeId=${challenge.id}`)
  const ctaLabel = user ? 'Submit repository' : 'Start verification'

  return (
    <div className="max-w-[720px] mx-auto px-6 py-10">
      <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2 text-muted-foreground">
        <Link href="/challenges">
          <IconArrowLeft size={14} className="mr-1" />
          Back to challenges
        </Link>
      </Button>

      <h1 className="text-3xl font-semibold tracking-tight">{challenge.title}</h1>
      <Badge variant="outline" className="mt-3">{categoryLabel}</Badge>
      <p className="mt-3 text-sm text-muted-foreground">
        Submit any repository that satisfies this verification standard. Praxis analyses the work independently.
      </p>

      <hr className="my-8" />

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">What this challenge verifies</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{challenge.description}</p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-sm font-semibold">Rubric categories</h2>
        <ul className="space-y-2">
          {challenge.rubric.categories.map((cat) => (
            <li key={cat.name} className="flex items-center gap-2">
              <IconCircleCheck size={14} className="text-muted-foreground shrink-0" />
              <span className="text-sm">{cat.name}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-sm font-semibold">Skills earned</h2>
        <div className="flex flex-wrap gap-2">
          {challenge.rubric.categories.map((cat) => (
            <Badge key={cat.name} variant="outline">{cat.name}</Badge>
          ))}
        </div>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-sm font-semibold">Accepted repository examples</h2>
        {/* Temporary UI fallback — replace when backend returns acceptedExamples */}
        <ul className="space-y-1.5">
          {ACCEPTED_REPOSITORY_EXAMPLES.map((name) => (
            <li key={name} className="flex items-center gap-1.5 font-mono text-sm text-muted-foreground">
              <span>{name}</span>
              <IconExternalLink size={12} className="shrink-0" />
            </li>
          ))}
        </ul>
      </section>

      {challenge.passingThreshold != null && (
        <section className="mt-8 space-y-2">
          <h2 className="text-sm font-semibold">Passing threshold</h2>
          <p className="text-sm text-muted-foreground">
            Requires a composite score of at least {challenge.passingThreshold} and all category floors must be met.
          </p>
        </section>
      )}

      <div className="mt-10">
        <Button asChild>
          <Link href={submitHref}>{ctaLabel}</Link>
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd apps/web && pnpm exec tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/\(public\)/challenges/[id]/page.tsx
git commit -m "feat: redesign challenge detail page with structured sections and auth-conditional CTA"
```

---

## Task 9: `useSubmitForm` hook

**Files:**
- Create: `apps/web/src/features/submissions/hooks/use-submit-form.ts`

- [ ] **Step 1: Create the hook**

```ts
// apps/web/src/features/submissions/hooks/use-submit-form.ts
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient, ApiError } from '@/lib/api'

function parseGitHubUrl(input: string): string | null {
  const trimmed = input.trim()
  try {
    const url = new URL(trimmed)
    if (url.hostname !== 'github.com') return null
    const parts = url.pathname.replace(/^\//, '').replace(/\/$/, '').split('/')
    if (parts.length < 2 || !parts[0] || !parts[1]) return null
    return `${parts[0]}/${parts[1]}`
  } catch {
    // Not a URL — check if it's already owner/repo format
    const parts = trimmed.split('/')
    if (parts.length === 2 && parts[0] && parts[1]) return trimmed
    return null
  }
}

export type UseSubmitFormReturn = {
  repoUrl: string
  commitSha: string
  submitting: boolean
  error: string | null
  setRepoUrl: (v: string) => void
  setCommitSha: (v: string) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
}

export function useSubmitForm(challengeId: string): UseSubmitFormReturn {
  const router = useRouter()
  const [repoUrl, setRepoUrl] = useState('')
  const [commitSha, setCommitSha] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const githubRepoFullName = parseGitHubUrl(repoUrl)
    if (!githubRepoFullName) {
      setError('Please enter a valid GitHub repository URL (e.g. https://github.com/owner/repo).')
      return
    }

    setSubmitting(true)
    try {
      const submission = await apiClient.createSubmission({
        challengeId,
        githubRepoFullName,
        commitSha: commitSha.trim() || undefined,
      })
      router.push(`/submissions/${submission.id}`)
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError('You have reached the submission limit. Please wait before submitting again.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return { repoUrl, commitSha, submitting, error, setRepoUrl, setCommitSha, handleSubmit }
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd apps/web && pnpm exec tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/features/submissions/hooks/use-submit-form.ts
git commit -m "feat: add useSubmitForm hook with URL parsing and 429 handling"
```

---

## Task 10: `SubmitClient` component

**Files:**
- Create: `apps/web/src/features/submissions/components/submit-client.tsx`

- [ ] **Step 1: Create the component**

```tsx
// apps/web/src/features/submissions/components/submit-client.tsx
'use client'

import Link from 'next/link'
import { IconBrandGithub } from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConnectGitHubButton } from '@/features/github/components/connect-github-button'
import { useSubmitForm } from '@/features/submissions/hooks/use-submit-form'
import type { ProjectChallenge } from '@praxis/shared'

type Props = {
  challenge: ProjectChallenge
  githubReady: boolean
}

const CATEGORY_LABEL: Record<string, string> = {
  frontend: 'Frontend Engineering',
  backend: 'Backend Engineering',
}

export function SubmitClient({ challenge, githubReady }: Props) {
  const { repoUrl, commitSha, submitting, error, setRepoUrl, setCommitSha, handleSubmit } =
    useSubmitForm(challenge.id)

  const categoryLabel = CATEGORY_LABEL[challenge.projectType] ?? challenge.projectType

  return (
    <div>
      <Card className="mb-6">
        <CardContent className="p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Selected challenge</p>
          <p className="font-medium">{challenge.title}</p>
          <Badge variant="outline" className="mt-2">{categoryLabel}</Badge>
        </CardContent>
      </Card>
      <Link href="/challenges" className="text-xs text-muted-foreground hover:underline">
        Change challenge
      </Link>

      <div className="mt-6">
        {!githubReady ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-start gap-4">
                <IconBrandGithub size={24} className="text-muted-foreground" />
                <div>
                  <h2 className="font-semibold">Connect GitHub to continue</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Praxis needs read access to your repositories to verify your work. This is separate from your sign-in method.
                  </p>
                </div>
                <ConnectGitHubButton nextPath={`/submit?challengeId=${challenge.id}`} label="Connect GitHub" />
              </div>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="repo-url">Repository URL</Label>
              <Input
                id="repo-url"
                placeholder="https://github.com/your-org/your-repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter the full GitHub repository URL for the project you want to verify.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Label htmlFor="commit-sha">Commit SHA</Label>
                <Badge variant="outline" className="text-[10px] h-4 px-1.5">optional</Badge>
              </div>
              <Input
                id="commit-sha"
                placeholder="Leave blank to verify the latest commit on the default branch"
                value={commitSha}
                onChange={(e) => setCommitSha(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Praxis verifies a pinned commit, not a moving branch. Leaving this empty will pin to the latest commit at submission time.
              </p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="space-y-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit for verification'}
              </Button>
              <p className="text-xs text-muted-foreground">Verification typically takes 2–5 minutes.</p>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd apps/web && pnpm exec tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/features/submissions/components/submit-client.tsx
git commit -m "feat: add SubmitClient component"
```

---

## Task 11: Rewrite submit page server component

**Files:**
- Modify: `apps/web/src/app/(protected)/submit/page.tsx`

- [ ] **Step 1: Rewrite the page**

```tsx
// apps/web/src/app/(protected)/submit/page.tsx
import Link from 'next/link'
import { serverApiFetch } from '@/lib/api.server'
import type { GitHubAccount, ProjectChallenge } from '@praxis/shared'
import { SubmitClient } from '@/features/submissions/components/submit-client'

const REQUIRED_SCOPES = ['read:user']

type Props = {
  searchParams: Promise<{ challengeId?: string | string[] }>
}

export default async function SubmitPage(props: Props) {
  const searchParams = await props.searchParams
  const challengeId = typeof searchParams.challengeId === 'string' ? searchParams.challengeId : null

  if (!challengeId) {
    return (
      <div className="max-w-[600px] mx-auto px-6 py-10">
        <p className="text-sm text-muted-foreground text-center">
          Invalid challenge. Please{' '}
          <Link href="/challenges" className="underline">select a challenge first</Link>.
        </p>
      </div>
    )
  }

  let challenge: ProjectChallenge
  let github: GitHubAccount

  try {
    [challenge, github] = await Promise.all([
      serverApiFetch<ProjectChallenge>(`/challenges/${challengeId}`),
      serverApiFetch<GitHubAccount>('/github/account').catch(() => ({ connected: false, scopes: [] } as GitHubAccount)),
    ])
  } catch {
    return (
      <div className="max-w-[600px] mx-auto px-6 py-10">
        <p className="text-sm text-muted-foreground text-center">
          Invalid challenge. Please{' '}
          <Link href="/challenges" className="underline">select a challenge first</Link>.
        </p>
      </div>
    )
  }

  const githubReady = github.connected && REQUIRED_SCOPES.every((scope) => github.scopes?.includes(scope))

  return (
    <div className="max-w-[600px] mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Submit repository</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Submit a GitHub repository for independent verification.
      </p>

      <div className="mt-8">
        <SubmitClient challenge={challenge} githubReady={githubReady} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd apps/web && pnpm exec tsc --noEmit
```

Expected: zero errors. Note: `GitHubAccount` type may not have `scopes` field — check `packages/shared/src/types/github.types.ts`. If it uses a different field name, adjust accordingly.

- [ ] **Step 3: Delete dead code**

```bash
rm apps/web/src/features/studio/components/submit-repository-form.tsx
```

Check no other file imports it:
```bash
grep -r "submit-repository-form" apps/web/src/
```

Expected: no results.

- [ ] **Step 4: Verify TypeScript again**

```bash
cd apps/web && pnpm exec tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/\(protected\)/submit/page.tsx
git add -u apps/web/src/features/studio/components/submit-repository-form.tsx
git commit -m "feat: rewrite submit page with SubmitClient; delete legacy submit form"
```

---

## Task 12: Check `GitHubAccount` type for scopes field

**Files:**
- Read: `packages/shared/src/types/github.types.ts`

- [ ] **Step 1: Read the type**

```bash
cat packages/shared/src/types/github.types.ts
```

If `GitHubAccount` has a field named something other than `scopes` (e.g. `grantedScopes`, `tokenScopes`), update the `REQUIRED_SCOPES.every((scope) => github.scopes?.includes(scope))` line in both `apps/web/src/app/(protected)/submit/page.tsx` and verify the same field name is used in the existing `apps/web/src/app/(public)/challenges/[id]/page.tsx` (removed reference) and the old submit page for consistency.

The existing working code in `apps/web/src/features/github/constants/github.constants.ts` uses `REQUIRED_SCOPES` and the old submit page used `github.scopes` — follow that pattern.

- [ ] **Step 2: Verify TypeScript passes**

```bash
cd apps/web && pnpm exec tsc --noEmit
```

Expected: zero errors.

---

## Task 13: `SubmissionStatusMessage` component

**Files:**
- Create: `apps/web/src/features/submissions/components/submission-status-message.tsx`

- [ ] **Step 1: Create the component**

```tsx
// apps/web/src/features/submissions/components/submission-status-message.tsx
import Link from 'next/link'
import { IconAlertCircle, IconClock } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import type { ProjectSubmission } from '@praxis/shared'

type Props = {
  submission: ProjectSubmission
}

const IN_PROGRESS_STATUSES = ['created', 'queued', 'ingesting', 'analyzing', 'generating_report']

export function SubmissionStatusMessage({ submission }: Props) {
  if (IN_PROGRESS_STATUSES.includes(submission.status)) {
    return (
      <p className="text-sm text-muted-foreground mt-4">
        Verification is running. Results will appear here when complete.
      </p>
    )
  }

  if (submission.status === 'verified' || submission.status === 'insufficient') {
    return (
      <Button className="w-full mt-4" asChild>
        <Link href={`/reports/${submission.id}`}>View report</Link>
      </Button>
    )
  }

  if (submission.status === 'failed' || submission.status === 'ingestion_failed' || submission.status === 'analysis_failed' || submission.status === 'report_generation_failed') {
    return (
      <div className="mt-4 rounded-md border bg-muted/40 px-4 py-3 flex items-start gap-3">
        <IconAlertCircle size={16} className="text-destructive shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          {submission.failureReason ?? 'Verification failed. Please try again or contact support.'}
        </p>
      </div>
    )
  }

  if (submission.status === 'expired') {
    return (
      <div className="mt-4 rounded-md border bg-muted/40 px-4 py-3 flex items-start gap-3">
        <IconClock size={16} className="text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          Verification expired. The submission stayed in progress too long. Please submit again.
        </p>
      </div>
    )
  }

  return null
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd apps/web && pnpm exec tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/features/submissions/components/submission-status-message.tsx
git commit -m "feat: add SubmissionStatusMessage component"
```

---

## Task 14: `SubmissionTimeline` component

**Files:**
- Create: `apps/web/src/features/submissions/components/submission-timeline.tsx`

Key algorithm:
- `submission.status` is authoritative for active/terminal state
- Events supply timestamps, matched by `event.toStatus === stage.toStatus`
- "Submission created" (toStatus: null) is completed if any events exist
- Terminal statuses: `verified | insufficient | failed | expired | ingestion_failed | analysis_failed | report_generation_failed`
- For non-terminal: stages before current status are completed; current status stage is active; later are pending
- For terminal: all stages up to and including terminal are completed; none active/pending

- [ ] **Step 1: Create the component**

```tsx
// apps/web/src/features/submissions/components/submission-timeline.tsx
import { IconCircleCheck, IconCircle } from '@tabler/icons-react'
import { PIPELINE_STAGES, TERMINAL_STAGE_LABELS, TERMINAL_STATUSES } from '@/features/submissions/constants'
import type { ProjectSubmission, ProjectSubmissionEvent, SubmissionStatus } from '@praxis/shared'

type Props = {
  submission: ProjectSubmission
  events: ProjectSubmissionEvent[]
}

type StepState = 'completed' | 'active' | 'pending'

function getTimestamp(stages: typeof PIPELINE_STAGES, stageIndex: number, events: ProjectSubmissionEvent[]): string | null {
  const stage = stages[stageIndex]
  if (!stage) return null
  if (stage.toStatus === null) {
    // synthetic "created" step — use earliest event timestamp
    return events[0]?.createdAt ?? null
  }
  return events.find((e) => e.toStatus === stage.toStatus)?.createdAt ?? null
}

function formatTs(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

export function SubmissionTimeline({ submission, events }: Props) {
  const status = submission.status
  const isTerminal = TERMINAL_STATUSES.includes(status)

  // Build the full stage list: fixed pipeline + terminal slot
  const terminalLabel = TERMINAL_STAGE_LABELS[status as SubmissionStatus] ?? status
  const allStages = [
    ...PIPELINE_STAGES,
    { key: 'terminal', label: terminalLabel, toStatus: status as SubmissionStatus },
  ]

  // Determine the index of the current status in the pipeline (non-terminal)
  const pipelineStatusIndex = PIPELINE_STAGES.findIndex((s) => s.toStatus === status)

  function getState(index: number): StepState {
    if (isTerminal) {
      // All stages up to and including terminal (last index) are completed
      return 'completed'
    }
    // Non-terminal: stages before pipelineStatusIndex are completed, at is active, after is pending
    if (status === 'created' && index === 0) return 'active'
    if (pipelineStatusIndex === -1) return index === 0 && events.length > 0 ? 'completed' : 'pending'
    if (index < pipelineStatusIndex) return 'completed'
    if (index === pipelineStatusIndex) return 'active'
    return 'pending'
  }

  // For terminal, synthetic "created" completed check
  function isCreatedCompleted(): boolean {
    return events.length > 0
  }

  return (
    <div className="space-y-4">
      {allStages.map((stage, index) => {
        // Skip terminal slot when not terminal
        if (stage.key === 'terminal' && !isTerminal) return null

        let state: StepState
        if (stage.key === 'terminal') {
          state = 'completed'
        } else if (index === 0) {
          // "Submission created" synthetic step
          state = isTerminal || isCreatedCompleted() ? 'completed' : (events.length === 0 && status === 'created' ? 'active' : 'pending')
        } else {
          state = getState(index)
        }

        const ts = state === 'completed' ? getTimestamp(PIPELINE_STAGES, index, events) : null
        const terminalTs = stage.key === 'terminal'
          ? (events.find((e) => e.toStatus === status)?.createdAt ?? null)
          : null
        const displayTs = stage.key === 'terminal' ? terminalTs : ts

        return (
          <div key={stage.key} className="flex items-center gap-3">
            {displayTs && (
              <span className="font-mono text-xs text-muted-foreground w-28 shrink-0 text-right">
                {formatTs(displayTs)}
              </span>
            )}
            {!displayTs && <span className="w-28 shrink-0" />}

            <div className="shrink-0">
              {state === 'completed' && (
                <IconCircleCheck size={16} className="text-green-600" />
              )}
              {state === 'active' && (
                <span className="block size-3 rounded-full bg-primary animate-pulse" />
              )}
              {state === 'pending' && (
                <IconCircle size={16} className="text-muted-foreground" />
              )}
            </div>

            <span
              className={[
                'text-sm',
                state === 'completed' ? 'text-foreground' : '',
                state === 'active' ? 'font-medium text-foreground' : '',
                state === 'pending' ? 'text-muted-foreground' : '',
              ].join(' ')}
            >
              {stage.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd apps/web && pnpm exec tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/features/submissions/components/submission-timeline.tsx
git commit -m "feat: add SubmissionTimeline component with pipeline stage rendering"
```

---

## Task 15: Rewrite submission detail page

**Files:**
- Modify: `apps/web/src/app/(protected)/submissions/[id]/page.tsx`

- [ ] **Step 1: Rewrite the page**

```tsx
// apps/web/src/app/(protected)/submissions/[id]/page.tsx
import { serverApiFetch } from '@/lib/api.server'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { ProjectSubmission, ProjectSubmissionEvent } from '@praxis/shared'
import { formatDate, githubRepoUrl, repoName, shortSha, statusLabel } from '@/lib/praxis-format'
import { SubmissionStatusMessage } from '@/features/submissions/components/submission-status-message'
import { SubmissionTimeline } from '@/features/submissions/components/submission-timeline'

type Props = {
  params: Promise<{ id: string }>
}

export default async function SubmissionDetailPage(props: Props) {
  const { id } = await props.params
  const [submission, events] = await Promise.all([
    serverApiFetch<ProjectSubmission>(`/submissions/${id}`),
    serverApiFetch<ProjectSubmissionEvent[]>(`/submissions/${id}/events`).catch(() => []),
  ])

  return (
    <div className="px-10 py-8 max-w-5xl">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight font-mono">
            {repoName(submission.githubRepoFullName)}
          </h1>
          <a
            className="mt-2 block text-sm text-muted-foreground hover:underline"
            href={githubRepoUrl(submission.githubRepoFullName)}
            target="_blank"
            rel="noreferrer"
          >
            {submission.githubRepoFullName}
          </a>
        </div>
        <Badge className="capitalize" variant="outline">{statusLabel(submission.status)}</Badge>
      </div>

      <div className="mt-8 grid grid-cols-[320px_1fr] gap-6">
        <div>
          <Card>
            <CardContent className="p-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Repository</span>
                <span className="font-mono font-medium truncate">{repoName(submission.githubRepoFullName)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Commit</span>
                <span className="font-mono">{shortSha(submission.commitSha)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Submitted</span>
                <span>{formatDate(submission.submittedAt)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className="capitalize text-xs">{statusLabel(submission.status)}</Badge>
              </div>
            </CardContent>
          </Card>

          <SubmissionStatusMessage submission={submission} />
        </div>

        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold mb-5">Verification timeline</h2>
            <SubmissionTimeline submission={submission} events={events} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd apps/web && pnpm exec tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/\(protected\)/submissions/[id]/page.tsx
git commit -m "feat: rewrite submission detail page with timeline and status message components"
```

---

## Task 16: Add "View report" button to submissions list

**Files:**
- Modify: `apps/web/src/app/(protected)/submissions/page.tsx`

- [ ] **Step 1: Add import and conditional View report button**

Add `isTerminalSubmission` to the import from `@/lib/praxis-format`:
```tsx
import { formatDate, isTerminalSubmission, repoName, statusLabel } from '@/lib/praxis-format'
```

Inside the submission card's button row, after the existing "View Submission" button, add:
```tsx
{isTerminalSubmission(submission) && (
  <Button variant="outline" asChild>
    <Link href={`/reports/${submission.id}`}>View report</Link>
  </Button>
)}
```

The full updated card `div` inside `submissions.map`:
```tsx
<Card key={submission.id}>
  <CardContent className="p-5 flex items-center justify-between gap-6">
    <div className="min-w-0">
      <p className="font-medium truncate">{repoName(submission.githubRepoFullName)}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {submission.githubRepoFullName} • {formatDate(submission.submittedAt)}
      </p>
    </div>
    <div className="flex items-center gap-3 shrink-0">
      <Badge variant="outline">{statusLabel(submission.status)}</Badge>
      <Button variant="outline" asChild>
        <Link href={`/submissions/${submission.id}`}>View Submission</Link>
      </Button>
      {isTerminalSubmission(submission) && (
        <Button variant="outline" asChild>
          <Link href={`/reports/${submission.id}`}>View report</Link>
        </Button>
      )}
    </div>
  </CardContent>
</Card>
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd apps/web && pnpm exec tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/\(protected\)/submissions/page.tsx
git commit -m "feat: add View report button for terminal submissions in submissions list"
```

---

## Task 17: Final build verification

- [ ] **Step 1: Run full TypeScript checks across all packages**

```bash
cd apps/web && pnpm exec tsc --noEmit
cd apps/api && pnpm exec tsc --noEmit
cd packages/shared && pnpm exec tsc --noEmit
```

Expected: zero errors in all three.

- [ ] **Step 2: Run Next.js build**

```bash
cd apps/web && pnpm build
```

Expected: build completes with zero errors and zero warnings. If any `@tabler/icons-react` icons are missing (e.g. `IconCircleCheck` vs `IconCircleFilled`), fix the import name by checking the tabler icons package: `node_modules/@tabler/icons-react/dist/index.d.ts` for the exact export name.

- [ ] **Step 3: Commit any icon name fixes, then final commit**

```bash
git add -A
git commit -m "fix: correct tabler icon names after build verification"
```

---

## Self-Review Against Spec

**Spec coverage check:**

| Spec requirement | Task |
|-----------------|------|
| `buildAuthRedirect` utility with open-redirect guard | Task 1 |
| `PIPELINE_STAGES` constants + terminal labels | Task 2 |
| `ProfileReport.submissionId` added | Task 3 |
| Profile page passes `submissionId` through | Task 4 |
| `VerifiedProjectsSection` links to `/reports/:submissionId` | Task 5 |
| Challenge card CTA → `/submit?challengeId=` | Task 6 |
| Public challenge card CTA → `buildAuthRedirect` | Task 7 |
| Challenge detail page full redesign | Task 8 |
| `useSubmitForm` hook with URL parsing + 429 | Task 9 |
| `SubmitClient` with GitHub not-connected + form states | Task 10 |
| Submit page server component with error state | Task 11 |
| `GitHubAccount.scopes` field name verified | Task 12 |
| `SubmissionStatusMessage` all status cases | Task 13 |
| `SubmissionTimeline` pipeline rendering | Task 14 |
| Submission detail page uses new components | Task 15 |
| Submissions list "View report" button | Task 16 |
| Build + tsc clean | Task 17 |
| `submit-repository-form.tsx` deleted | Task 11 step 3 |
| `proxy.ts` redirects already present — no change | confirmed in design |
| Sidebar only in protected layout — no change | confirmed in design |
| `repo` scope not required — `read:user` only | Task 11 |

**Known gaps (flagged, not blocking):**
- Backend `/users/:username/profile` may not yet return `submissionId` on `latestReports` — fallback to `''` with comment in Task 4.
- Accepted repository examples are hardcoded — marked as temporary in Task 8.
- `challenge.projectType` used to derive category label — no `category` display field on `ProjectChallenge`.
