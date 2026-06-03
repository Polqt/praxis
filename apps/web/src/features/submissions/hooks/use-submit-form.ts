'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient, ApiError } from '@/lib/api'

const COMMIT_SHA_RE = /^[0-9a-f]{7,40}$/i

function parseGitHubUrl(input: string): string | null {
  const trimmed = input.trim().replace(/\/+$/, '') // strip trailing slashes
  try {
    const url = new URL(trimmed)
    if (url.hostname !== 'github.com') return null
    // Take only the first two path segments (owner/repo), ignoring /tree/main, /issues, etc.
    const segments = url.pathname.replace(/^\//, '').split('/').filter(Boolean)
    if (segments.length < 2 || !segments[0] || !segments[1]) return null
    return `${segments[0]}/${segments[1]}`
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
  const [repoUrl, setRepoUrlRaw] = useState('')
  const [commitSha, setCommitSha] = useState('')
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
      setError('Enter a valid GitHub URL — e.g. https://github.com/owner/repo')
      return
    }

    const sha = commitSha.trim()
    if (sha && !COMMIT_SHA_RE.test(sha)) {
      setError('Commit SHA must be a 7–40 character hex string (e.g. a1b2c3d). Leave blank to use the latest commit.')
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
      if (err instanceof ApiError) {
        if (err.status === 429) {
          setError('Submission limit reached. Please wait a few minutes before submitting again.')
        } else if (err.status === 404) {
          setError('Repository not found. Make sure it exists and you have access to it.')
        } else if (err.status === 403) {
          setError('You must own or have write access to submit this repository.')
        } else if (err.status === 409) {
          setError("You've already submitted this exact commit. Try a different commit SHA or repository.")
        } else {
          setError(err.message || 'Something went wrong. Please try again.')
        }
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return { repoUrl, commitSha, submitting, error, setRepoUrl, setCommitSha, handleSubmit }
}
