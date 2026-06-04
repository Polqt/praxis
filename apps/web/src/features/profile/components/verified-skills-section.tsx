'use client'

import { IconCircleCheckFilled } from '@tabler/icons-react'
import { repoName } from '@/lib/praxis-format'
import { SKILL_TRACK_MAP } from '../constants'
import type { ProfileReport, VerifiedSkill } from '../types'

type Props = {
  skills: VerifiedSkill[]
  reports?: ProfileReport[]
}

function skillSource(skillName: string, reports: ProfileReport[]): string | null {
  const verified = reports.find((r) => r.submissionStatus === 'verified')
  if (!verified) return null
  return `${repoName(verified.repositoryName)} · ${verified.challengeTitle}`
}

function groupByTrack(skills: VerifiedSkill[]): Map<string, VerifiedSkill[]> {
  const map = new Map<string, VerifiedSkill[]>()
  for (const skill of skills) {
    const track = SKILL_TRACK_MAP[skill.name] ?? 'General'
    const existing = map.get(track) ?? []
    existing.push(skill)
    map.set(track, existing)
  }
  return map
}

export function VerifiedSkillsSection({ skills, reports = [] }: Props) {
  const sorted = [...skills].sort((a, b) => a.name.localeCompare(b.name))
  const grouped = groupByTrack(sorted)
  const multipleTracks = grouped.size > 1

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">Verified skills</p>
      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Skills unlock when a project reaches a verified verdict. Insufficient reports still show progress by category.
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {Array.from(grouped.entries()).map(([track, trackSkills]) => (
            <div key={track}>
              {multipleTracks && (
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2">{track}</p>
              )}
              <div className="flex flex-col gap-3">
                {trackSkills.map((skill) => {
                  const source = skillSource(skill.name, reports)
                  return (
                    <div key={skill.name} className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <IconCircleCheckFilled size={14} className="text-green-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium">{skill.name}</span>
                          {source && (
                            <p className="text-xs text-muted-foreground mt-0.5">{source}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0" suppressHydrationWarning>
                        {new Date(skill.awardedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
