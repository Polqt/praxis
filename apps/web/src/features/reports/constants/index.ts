import type { ReportStatus, Report } from '@/features/reports/types'

export const SCORE_HIGH_THRESHOLD = 8
export const SCORE_MID_THRESHOLD = 6

export function scoreBarColor(score: number): string {
  if (score >= SCORE_HIGH_THRESHOLD) return 'bg-green-500'
  if (score >= SCORE_MID_THRESHOLD) return 'bg-amber-500'
  return 'bg-red-500'
}

export const STATUS_CONFIG: Record<ReportStatus, { label: string; className: string }> = {
  verified: { label: 'Verified', className: 'bg-green-100 text-green-800 border-green-200' },
  insufficient: { label: 'Insufficient', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  failed: { label: 'Failed', className: 'bg-red-100 text-red-800 border-red-200' },
}

export const CATEGORY_STATUS_CLASS: Record<string, string> = {
  pass: 'bg-green-100 text-green-700 border-green-200',
  fail: 'bg-red-100 text-red-700 border-red-200',
  floor: 'bg-amber-100 text-amber-700 border-amber-200',
}

export const exampleReport: Report = {
  id: 'example',
  submissionId: 'example',
  repositoryName: 'acme-corp/inventory-api',
  commitSha: '4b7d2a8',
  challengeTitle: 'Production REST API',
  status: 'verified',
  compositeScore: 80,
  summary:
    'This repository demonstrates strong API design, consistent validation patterns, meaningful documentation, and production-ready structure across all evaluated rubric categories.',
  scores: [
    {
      category: 'API Design',
      score: 9,
      status: 'pass',
      narrative:
        'Route organization is clean and consistent. Resource naming follows REST conventions throughout. Response shapes are standardized with proper HTTP status codes.',
      citations: [
        'src/routes/products.ts',
        'src/routes/orders.ts',
        'src/middleware/validate.ts',
      ],
    },
    {
      category: 'Documentation',
      score: 8,
      status: 'pass',
      narrative:
        'README covers setup, environment variables, and deployment. OpenAPI specification is present and matches implemented routes.',
      citations: ['README.md', 'docs/openapi.yaml'],
    },
    {
      category: 'Testing',
      score: 7,
      status: 'pass',
      narrative:
        'Unit tests cover core business logic. Integration tests exist for authentication flow. Coverage could be improved for edge cases.',
      citations: ['tests/auth.spec.ts', 'tests/products.spec.ts'],
    },
    {
      category: 'Security',
      score: 8,
      status: 'pass',
      narrative:
        'JWT authentication is implemented correctly. Input validation middleware applies consistently. No obvious injection vectors detected.',
      citations: ['src/auth/jwt.guard.ts', 'src/middleware/validate.ts'],
    },
  ],
  skills: [
    'API Design',
    'REST APIs',
    'Documentation',
    'Input Validation',
    'Authentication',
    'Testing',
  ],
  strengths: [
    'Strong result in API Design',
    'Strong result in Security',
    'Strong result in Documentation',
  ],
  improvements: ['Improve coverage in Testing'],
  derivedStrengthsAndImprovements: false,
  allCitedFiles: [
    'src/routes/products.ts',
    'src/routes/orders.ts',
    'src/middleware/validate.ts',
    'README.md',
    'docs/openapi.yaml',
    'tests/auth.spec.ts',
    'tests/products.spec.ts',
    'src/auth/jwt.guard.ts',
  ],
  generatedAt: '2026-06-01T00:00:00.000Z',
  modelVersion: 'deterministic-v1',
  isPublic: false,
  publicToken: null,
}
