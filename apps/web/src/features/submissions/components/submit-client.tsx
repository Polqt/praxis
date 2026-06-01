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
import { CATEGORY_LABEL } from '@/features/submissions/constants'
import type { ProjectChallenge } from '@praxis/shared'

type Props = {
  challenge: ProjectChallenge
  githubReady: boolean
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
