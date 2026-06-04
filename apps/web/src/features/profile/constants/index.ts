export const BACKEND_SKILL_KEYWORDS = [
  'api',
  'rest',
  'database',
  'backend',
  'server',
  'authentication',
  'deployment',
  'testing',
  'documentation',
]

export const FRONTEND_SKILL_KEYWORDS = [
  'component',
  'ui',
  'frontend',
  'accessibility',
  'state',
  'css',
  'design',
]

export const VERDICT_CLASS: Record<string, string> = {
  verified: 'text-green-700 bg-green-50 border-green-200',
  insufficient: 'text-amber-700 bg-amber-50 border-amber-200',
  failed: 'text-red-700 bg-red-50 border-red-200',
}

export const SKILL_TRACK_MAP: Record<string, string> = {
  'API Design': 'Backend Engineering',
  'Authentication': 'Backend Engineering',
  'Database Design': 'Backend Engineering',
  'Testing': 'Backend Engineering',
  'Documentation': 'Backend Engineering',
  'Deployment': 'Backend Engineering',
  'Architecture': 'Backend Engineering',
  'Security': 'Backend Engineering',
}
