'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient, ApiError } from '@/lib/api'
import { parseGitHubUrl, COMMIT_SHA_RE } from '@/features/submissions/utils/github-url'
import { SUBMIT_ERRORS } from '@/features/submissions/constants/error-messages'

export type UseSubmitFormReturn = {
  repoUrl: string
  commitSha: string
  submitting: boolean
  error: string | null
  setRepoUrl: (v: string) => void
  setCommitSha: (v: string) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
}

export function useSubmitForm(
  challengeId: string,
  initial?: { repoUrl?: string; commitSha?: string },
): UseSubmitFormReturn {
  const router = useRouter()
  const [repoUrl, setRepoUrlRaw] = useState(initial?.repoUrl ?? '')
  const [commitSha, setCommitSha] = useState(initial?.commitSha ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function setRepoUrl(v: string) {
    setRepoUrlRaw(v)
    if (error) setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const githubRepoFullName = parseGitHubUrl(repoUrl)
    if (!githubRepoFullName) {
      setError(SUBMIT_ERRORS.invalidUrl)
      return
    }

    const sha = commitSha.trim()
    if (sha && !COMMIT_SHA_RE.test(sha)) {
      setError(SUBMIT_ERRORS.invalidSha)
      return
    }

    setSubmitting(true)
    try {
      const submission = await apiClient.createSubmission({
        challengeId,
        githubRepoFullName,
        commitSha: sha || undefined,
      })
      router.push(`/submissions/${submission.id}`)
    } catch (err) {
      if (err instanceof ApiError) {
        const API_ERRORS: Partial<Record<number, string>> = {
          429: SUBMIT_ERRORS.rateLimit,
          404: SUBMIT_ERRORS.repoNotFound,
          403: SUBMIT_ERRORS.forbidden,
          409: SUBMIT_ERRORS.duplicate,
        }
        setError(API_ERRORS[err.status] ?? err.message ?? SUBMIT_ERRORS.generic)
      } else {
        setError(SUBMIT_ERRORS.generic)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return { repoUrl, commitSha, submitting, error, setRepoUrl, setCommitSha, handleSubmit }
}
