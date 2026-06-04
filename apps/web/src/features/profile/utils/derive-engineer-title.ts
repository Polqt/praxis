import { BACKEND_SKILL_KEYWORDS, FRONTEND_SKILL_KEYWORDS } from '../constants'

const TITLE_THRESHOLDS = [
  { min: 0,  title: 'Praxis Developer',           next: 1,  nextTitle: 'Verified Engineer' },
  { min: 1,  title: 'Verified Engineer',           next: 3,  nextTitle: 'Backend/Frontend Engineer' },
  { min: 3,  title: 'Verified Backend/Frontend Engineer', next: 6, nextTitle: 'Senior Engineer' },
  { min: 6,  title: 'Senior Engineer',             next: 10, nextTitle: 'Principal Engineer' },
  { min: 10, title: 'Principal Engineer',          next: null, nextTitle: null },
]

export function deriveEngineerTitleTooltip(skills: string[]): string {
  const count = skills.length
  const tier = TITLE_THRESHOLDS.slice().reverse().find((t) => count >= t.min)
  if (!tier) return `Based on ${count} verified skill${count !== 1 ? 's' : ''}.`
  if (tier.next === null) return `Top tier. Based on ${count} verified skills.`
  const needed = tier.next - count
  return `Based on ${count} verified skill${count !== 1 ? 's' : ''}. Verify ${needed} more to reach ${tier.nextTitle}.`
}

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
