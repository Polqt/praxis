import { BACKEND_SKILL_KEYWORDS, FRONTEND_SKILL_KEYWORDS } from '@/features/profile/constants'

export function deriveEngineerTitle(skills: string[]): string {
  if (skills.length === 0) return 'Praxis Developer'

  const lower = skills.map((s) => s.toLowerCase())

  const hasBackend = BACKEND_SKILL_KEYWORDS.some((kw) =>
    lower.some((s) => s.includes(kw)),
  )
  const hasFrontend = FRONTEND_SKILL_KEYWORDS.some((kw) =>
    lower.some((s) => s.includes(kw)),
  )

  if (hasBackend && hasFrontend) return 'Verified Full-Stack Engineer'
  if (hasBackend) return 'Verified Backend Engineer'
  if (hasFrontend) return 'Verified Frontend Engineer'

  // Skills present but don't match known keywords — still verified
  return 'Verified Engineer'
}
