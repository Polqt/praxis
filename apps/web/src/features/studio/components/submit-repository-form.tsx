'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Props = {
  challengeId: string
}

export function SubmitRepositoryForm({ challengeId }: Props) {
  const router = useRouter()
  const [repo, setRepo] = useState('')
  const [commitSha, setCommitSha] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const submission = await apiClient.createSubmission({
        challengeId,
        githubRepoFullName: repo.trim(),
        commitSha: commitSha.trim() || undefined,
      })
      router.push(`/studio/submissions/${submission.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create submission')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="repo">Repository</Label>
        <Input
          id="repo"
          placeholder="owner/repository"
          value={repo}
          onChange={(event) => setRepo(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="commit">Commit SHA</Label>
        <Input
          id="commit"
          placeholder="Leave blank to use the default branch HEAD"
          value={commitSha}
          onChange={(event) => setCommitSha(event.target.value)}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit repository'}
      </Button>
    </form>
  )
}
