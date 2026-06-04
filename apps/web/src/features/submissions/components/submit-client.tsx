'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { IconBrandGithub, IconInfoCircle } from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConnectGitHubButton } from '@/features/github/components/connect-github-button'
import { useSubmitForm } from '../hooks/use-submit-form'
import { CATEGORY_LABEL } from '../constants'
import { staggerContainer, fadeUp } from '@/lib/animations'
import { useGitHubRepos } from '@/features/github/hooks/use-github-repos'
import { RepoCombobox } from './repo-combobox'
import type { ProjectChallenge } from '@praxis/shared'

type Props = {
  challenge: ProjectChallenge
  githubConnected: boolean
  githubHasScopes: boolean
  initialRepoUrl?: string
  initialCommitSha?: string
  isRecommended?: boolean
}

export function SubmitClient({ challenge, githubConnected, githubHasScopes, initialRepoUrl, initialCommitSha, isRecommended }: Props) {
  const { repoUrl, commitSha, submitting, error, setRepoUrl, setCommitSha, handleSubmit } =
    useSubmitForm(challenge.id, {
      repoUrl: initialRepoUrl,
      commitSha: initialCommitSha,
    })

  const { repos, loading: reposLoading } = useGitHubRepos(githubConnected && githubHasScopes)

  const categoryLabel = CATEGORY_LABEL[challenge.projectType] ?? challenge.projectType

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeUp} className="rounded-lg border bg-card p-5">
        <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-3">Selected challenge</p>
        <p className="font-medium text-base">{challenge.title}</p>
        <Badge variant="outline" className="mt-2 text-xs">{categoryLabel}</Badge>
        <div className="mt-3">
          <Link href="/challenges" className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">
            Change challenge
          </Link>
        </div>
      </motion.div>

      {!githubConnected ? (
        <motion.div variants={fadeUp} className="rounded-lg border bg-card p-6">
          <div className="flex items-start gap-4">
            <div className="size-9 rounded-md border flex items-center justify-center shrink-0">
              <IconBrandGithub size={18} className="text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Connect GitHub to continue</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Praxis needs read access to your repositories to verify your work.
              </p>
              <div className="mt-4">
                <ConnectGitHubButton nextPath={`/submit?challengeId=${challenge.id}`} label="Connect GitHub" />
              </div>
            </div>
          </div>
        </motion.div>
      ) : !githubHasScopes ? (
        <motion.div variants={fadeUp} className="rounded-lg border bg-card p-6">
          <div className="flex items-start gap-4">
            <div className="size-9 rounded-md border flex items-center justify-center shrink-0">
              <IconBrandGithub size={18} className="text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Reconnect GitHub to continue</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Praxis needs repository read access to verify your work. Please reconnect to grant the required permissions.
              </p>
              <div className="mt-4">
                <ConnectGitHubButton nextPath={`/submit?challengeId=${challenge.id}`} label="Reconnect GitHub" />
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <>
          {isRecommended && (
            <motion.div variants={fadeUp} className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              <IconInfoCircle size={14} className="shrink-0 mt-0.5 text-blue-500" />
              Recommended for first-time users — submit any project that fits this challenge&apos;s criteria.
            </motion.div>
          )}
          <motion.form
            variants={fadeUp}
            onSubmit={handleSubmit}
            className="rounded-lg border bg-card p-6 space-y-6"
          >
          <div className="space-y-2">
            <label htmlFor="repo-url" className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
              Repository URL
            </label>
            <RepoCombobox
              value={repoUrl}
              onChange={setRepoUrl}
              repos={repos}
              loading={reposLoading}
            />
            <p className="text-xs text-muted-foreground">
              Select from your connected repos or paste a GitHub URL.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label htmlFor="commit-sha" className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
                Commit SHA
              </label>
              <span className="text-[10px] text-muted-foreground border rounded px-1.5 py-0.5">optional</span>
            </div>
            <Input
              id="commit-sha"
              placeholder="Leave blank to pin to the latest commit"
              value={commitSha}
              onChange={(e) => setCommitSha(e.target.value)}
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              Leaving this empty pins to the latest commit at submission time.
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center justify-between pt-2 border-t">
            <p className="text-xs text-muted-foreground">Verification usually takes 3–8 minutes.</p>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit for verification'}
            </Button>
          </div>
        </motion.form>
        </>
      )}
    </motion.div>
  )
}
