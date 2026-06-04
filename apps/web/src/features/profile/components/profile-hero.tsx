'use client'

import { useState } from 'react'
import { IconPencil, IconCheck, IconX } from '@tabler/icons-react'
import { deriveEngineerTitle } from '../utils/derive-engineer-title'
import { deriveEngineerTitleTooltip } from '../utils/derive-engineer-title'
import { apiClient } from '@/lib/api'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CopyProfileUrlButton } from './copy-profile-url-button'
import type { VerifiedSkill } from '../types'

type Props = {
  username: string
  bio: string | null
  verifiedSkills: VerifiedSkill[]
  verifiedProjectsCount: number
  publishedReportsCount: number
  needsImprovementCount: number
  isOwner?: boolean
}

export function ProfileHero({
  username,
  bio,
  verifiedSkills,
  verifiedProjectsCount,
  publishedReportsCount,
  needsImprovementCount,
  isOwner,
}: Props) {
  const skillNames = verifiedSkills.map((s) => s.name)
  const title = deriveEngineerTitle(skillNames)
  const titleTooltip = deriveEngineerTitleTooltip(skillNames)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(bio ?? '')
  const [current, setCurrent] = useState(bio ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await apiClient.updateBio(draft.trim())
      setCurrent(draft.trim())
    } finally {
      setSaving(false)
      setEditing(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">@{username}</h1>
        <CopyProfileUrlButton />
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="text-sm text-muted-foreground mt-1 cursor-default w-fit">{title}</p>
          </TooltipTrigger>
          <TooltipContent>{titleTooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {editing ? (
        <div className="flex items-center gap-2 mt-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={160}
            placeholder="Add a one-line headline…"
            className="flex-1 text-sm bg-background border border-border rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false) }}
          />
          <button type="button" onClick={handleSave} disabled={saving} className="text-green-600 hover:opacity-70 transition-opacity">
            <IconCheck size={15} />
          </button>
          <button type="button" onClick={() => setEditing(false)} className="text-muted-foreground hover:text-foreground transition-colors">
            <IconX size={15} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 mt-2 group">
          <p className="text-sm text-muted-foreground">
            {current || (isOwner ? <span className="italic opacity-50">Add a headline…</span> : null)}
          </p>
          {isOwner && (
            <button
              type="button"
              onClick={() => { setDraft(current); setEditing(true) }}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
            >
              <IconPencil size={12} />
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mt-4">
        <StatPill value={verifiedProjectsCount} label="Verified projects" />
        <StatPill value={publishedReportsCount} label="Published reports" />
        <StatPill value={needsImprovementCount} label="Needs improvement" />
        <StatPill value={verifiedSkills.length} label="Verified skills" />
      </div>
    </div>
  )
}

function StatPill({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-muted rounded-md px-3 py-1.5">
      <span className="text-sm font-semibold tabular-nums">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}
