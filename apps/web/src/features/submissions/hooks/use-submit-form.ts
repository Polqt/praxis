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
