'use client'

import { useState } from 'react'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'

type Props = {
  submissionId: string
  isPublic: boolean
}

export function ReportVisibilityButton({ submissionId, isPublic }: Props) {
  const [publicState, setPublicState] = useState(isPublic)
  const [pending, setPending] = useState(false)

  async function toggle() {
    setPending(true)
    try {
      const report = await apiClient.setReportVisibility(submissionId, !publicState)
      setPublicState(report.isPublic)
    } finally {
      setPending(false)
    }
  }

  return (
    <Button variant={publicState ? 'outline' : 'default'} onClick={toggle} disabled={pending}>
      {pending ? 'Updating...' : publicState ? 'Unpublish proof' : 'Publish proof'}
    </Button>
  )
}
