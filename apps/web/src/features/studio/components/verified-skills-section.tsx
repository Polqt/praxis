'use client'

import { Badge } from '@/components/ui/badge'
import { SECTION_LABEL } from '@/features/studio/constants/studio.constants'

type Props = {
  skills: string[]
}

export function VerifiedSkillsSection({ skills }: Props) {
  return (
    <div>
      <p className={`${SECTION_LABEL} mb-3`}>Verified skills</p>
      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="gap-1">
              <span className="text-green-500 text-[10px]">✓</span>
              {skill}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No verified skills yet.</p>
      )}
    </div>
  )
}
