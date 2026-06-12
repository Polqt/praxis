import type {
  ReportStatus,
  Report,
  ScoreItem,
  SkillTier,
} from '@/features/reports/types'

export const SECTION_LABEL_CLASS = 'text-xs font-medium uppercase tracking-wider text-muted-foreground'
export const EXECUTION_STDOUT_CAP = 5000
export const EXECUTION_STDERR_CAP = 2000
export const EXECUTION_FAILURE_PREVIEW_CAP = 500
export const EXECUTION_PHASE_PREVIEW_CAP = 400

export const LANGUAGE_LABEL: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  go: 'Go',
  rust: 'Rust',
}

export const CONFIDENCE_CLASS: Record<
  NonNullable<ScoreItem['confidence']>,
  string
> = {
  high: 'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-muted text-muted-foreground border-border',
}

export const SKILL_TIER_CLASS: Record<SkillTier, string> = {
  gold: 'border-amber-400 bg-amber-50 text-amber-900',
  standard: 'border-border bg-card text-foreground',
  muted: 'border-muted bg-muted/40 text-muted-foreground',
}

export const SKILL_TIER_ICON_CLASS: Record<SkillTier, string> = {
  gold: 'text-amber-500',
  standard: 'text-green-500',
  muted: 'text-muted-foreground',
}

export const REPORT_DISCLAIMER_TEXT =
  'Praxis uses deterministic repository signals. Reports are evidence-based, not a replacement for human review.'

export const REPORT_DISCLAIMER_LINK_LABEL = 'Learn about our methodology'

export const REPORT_DISCLAIMER_LINK_HREF =
  'https://github.com/Polqt/praxis/blob/main/docs/LIMITATIONS.md'

export { SCORE_HIGH_THRESHOLD, SCORE_MID_THRESHOLD } from '@/features/reports/utils/score-color'

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

export const CATEGORY_FIX_INSTRUCTIONS: Record<string, string[]> = {
  'API Design': [
    'Add a request validation library (zod, class-validator, or joi) to your dependencies.',
    'Add authentication middleware to protect your routes.',
    'Use environment variables for all configuration — no hardcoded values.',
  ],
  'Authentication': [
    'Add a JWT library (jsonwebtoken, jose) or session management to your dependencies.',
    'Create dedicated auth files (auth.guard.ts, auth.middleware.ts, or equivalent).',
    'Add password hashing via bcrypt or argon2 if handling user credentials.',
  ],
  'Database Design': [
    'Add an ORM (Drizzle, Prisma, TypeORM, or Sequelize) to your dependencies.',
    'Create migration files to track schema changes over time.',
    'Define schema or entity files with relational patterns (foreign keys, associations).',
  ],
  'Testing': [
    'Add at least one test file — any test framework (Jest, Vitest, Mocha) counts.',
    'Add integration tests that hit your actual routes or service layer.',
    'Add a coverage configuration (jest.config.ts or vitest.config.ts with coverage).',
  ],
  'Documentation': [
    'Add a README.md with setup instructions (install, env vars, run command).',
    'Add API documentation (openapi.yaml, swagger.yaml, or a docs/api.md).',
    'Add a CONTRIBUTING.md for contribution guidelines.',
  ],
  'Deployment': [
    'Add a Dockerfile to containerize your application.',
    'Add a CI workflow (.github/workflows/) that runs tests on push.',
    'Add a deployment workflow or platform config (render.yaml, railway.toml, vercel.json).',
  ],
  'Security': [
    'Remove any committed .env files or hardcoded secrets from your repository.',
    'Add a validation library (zod, class-validator) to validate all inputs.',
    'Use environment variables for secrets — never hardcode them in source files.',
  ],
  'Architecture': [
    'Organize your source into meaningful subdirectories (src/routes, src/services, src/models).',
    'Separate concerns into distinct layers (controllers/handlers, services, repositories).',
    'Group related files into feature modules rather than a flat structure.',
  ],
  'Component Architecture': [
    'Organize components into a /components directory with subdirectories by feature or type.',
    'Add index.ts barrel exports for clean imports.',
    'Create a /components/ui or /components/shared directory for reusable components.',
    'Type all component props with TypeScript interfaces.',
  ],
  'State Management': [
    'Add a state library (Zustand, Redux Toolkit, or Jotai) or use React Context for global state.',
    'Extract repeated state logic into custom hooks (useXxx.ts) in a /hooks directory.',
  ],
  'Accessibility': [
    'Add aria-label or aria-describedby to interactive elements without visible labels.',
    'Use semantic HTML elements (nav, main, header, footer, article, section).',
    'Add alt attributes to all img elements.',
    'Add eslint-plugin-jsx-a11y to catch accessibility issues at lint time.',
  ],
  'Styling': [
    'Add a styling library (Tailwind CSS, styled-components, or CSS modules) to your dependencies.',
    'Add a global stylesheet (globals.css or equivalent).',
    'Add responsive breakpoints for mobile/tablet/desktop layouts.',
  ],
  'Performance': [
    'Use next/image or equivalent for automatic image optimization.',
    'Add React.lazy() or next/dynamic() for code-split heavy components.',
    'Add a next.config.ts or vite.config.ts with optimization settings.',
  ],
  'Frontend Testing': [
    'Add at least one component test file (.spec.tsx or .test.tsx).',
    'Use Testing Library (@testing-library/react) for component tests.',
    'Add Cypress or Playwright for end-to-end tests.',
    'Add a coverage configuration in your test config.',
  ],
}

export const exampleReport: Report = {
  id: 'example',
  submissionId: 'example',
  repositoryName: 'acme-corp/inventory-api',
  commitSha: '4b7d2a8f',
  challengeTitle: 'Build a Production REST API',
  status: 'verified',
  compositeScore: 78,
  summary:
    'This repository demonstrates strong API design, authentication, and database patterns. Documentation and deployment evidence are present. Testing coverage is adequate but could be expanded with integration and end-to-end suites.',
  aiFallback: false,
  scores: [
    {
      category: 'API Design',
      score: 9,
      status: 'pass',
      minimumScore: 5,
      weight: 20,
      narrative:
        'Route organization is clean and consistent. Resource naming follows REST conventions throughout. Request validation via class-validator is applied consistently. Configuration is managed via environment variables.',
      citations: [
        'src/routes/products.ts',
        'src/routes/orders.ts',
        'src/middleware/validate.ts',
      ],
    },
    {
      category: 'Authentication',
      score: 8,
      status: 'pass',
      minimumScore: 5,
      weight: 15,
      narrative:
        'Authentication files detected (src/auth/jwt.guard.ts). Auth libraries in use: jsonwebtoken, bcryptjs. Guard or middleware patterns detected for route protection. Token signing and session management code found in source files.',
      citations: [
        'src/auth/jwt.guard.ts',
        'src/auth/auth.service.ts',
        'src/auth/auth.controller.ts',
      ],
    },
    {
      category: 'Database Design',
      score: 8,
      status: 'pass',
      minimumScore: 5,
      weight: 20,
      narrative:
        'ORM detected: typeorm. 4 migration files found (src/migrations/). Schema or entity definitions present. Relational patterns (foreign keys, associations) detected. Seed data files present.',
      citations: [
        'src/entities/product.entity.ts',
        'src/entities/order.entity.ts',
        'src/migrations/1680000000000-InitSchema.ts',
      ],
    },
    {
      category: 'Testing',
      score: 6,
      status: 'pass',
      minimumScore: 5,
      weight: 20,
      narrative:
        'Detected 8 test files. No integration or end-to-end test suites were found. Coverage configuration is present.',
      citations: [
        'tests/products.spec.ts',
        'tests/orders.spec.ts',
        'tests/auth.spec.ts',
      ],
    },
    {
      category: 'Documentation',
      score: 7,
      status: 'pass',
      minimumScore: 3,
      weight: 10,
      narrative:
        'Detected: README, setup instructions, API documentation. Not found: architecture documentation, contribution guidelines.',
      citations: ['README.md', 'docs/openapi.yaml'],
    },
    {
      category: 'Deployment',
      score: 4,
      status: 'floor',
      minimumScore: 3,
      weight: 15,
      narrative:
        'Detected deployment assets: Dockerfile, CI workflow. Not detected: deployment workflow. Representative files: Dockerfile, .github/workflows/ci.yml.',
      citations: ['Dockerfile', '.github/workflows/ci.yml'],
    },
  ],
  skills: ['API Design', 'Authentication', 'Database Design', 'Testing', 'Documentation'],
  strengths: [
    'Strong result in API Design',
    'Strong result in Authentication',
    'Strong result in Database Design',
  ],
  improvements: ['Improve coverage in Testing', 'Improve coverage in Deployment'],
  derivedStrengthsAndImprovements: false,
  allCitedFiles: [
    'src/routes/products.ts',
    'src/routes/orders.ts',
    'src/middleware/validate.ts',
    'src/auth/jwt.guard.ts',
    'src/auth/auth.service.ts',
    'src/entities/product.entity.ts',
    'src/migrations/1680000000000-InitSchema.ts',
    'tests/products.spec.ts',
    'README.md',
    'docs/openapi.yaml',
    'Dockerfile',
  ],
  generatedAt: '2026-06-01T00:00:00.000Z',
  modelVersion: 'deterministic-v2',
  isPublic: true,
  publicToken: 'example-token',
  skillProgress: [
    { name: 'API Design', score: 9, minimumScore: 5, pointsNeeded: 0, eligible: true, awarded: true, matchedSkillId: 'example-api' },
    { name: 'Authentication', score: 8, minimumScore: 5, pointsNeeded: 0, eligible: true, awarded: true, matchedSkillId: 'example-auth' },
    { name: 'Database Design', score: 8, minimumScore: 5, pointsNeeded: 0, eligible: true, awarded: true, matchedSkillId: 'example-db' },
    { name: 'Testing', score: 6, minimumScore: 5, pointsNeeded: 0, eligible: true, awarded: true, matchedSkillId: 'example-testing' },
    { name: 'Documentation', score: 7, minimumScore: 3, pointsNeeded: 0, eligible: true, awarded: true, matchedSkillId: 'example-docs' },
    { name: 'Deployment', score: 4, minimumScore: 3, pointsNeeded: 0, eligible: true, awarded: true, matchedSkillId: 'example-deploy' },
  ],
  aiReview: {
    status: 'success',
    model: 'claude-haiku-4-5',
    promptVersion: 'ai-evidence-review-v1',
    possibleMissedEvidence: [
      {
        category: 'Testing',
        path: 'tests/integration/orders.spec.ts',
        reason: 'Possible integration coverage not reflected in deterministic test classification.',
        confidence: 0.72,
      },
    ],
    inputTokens: 1200,
    outputTokens: 180,
    estimatedCostUsd: '0.001680',
    latencyMs: 1800,
    errorMessage: null,
    createdAt: '2026-06-01T00:00:00.000Z',
  },
  previousSubmission: {
    previousSubmissionId: 'example-previous',
    previousCommitSha: '9a1c3ef',
    currentCommitSha: '4b7d2a8f',
    previousCompositeScore: 71,
    currentCompositeScore: 78,
    compositeDelta: 7,
    categories: [
      { category: 'Testing', previousScore: 4, currentScore: 6, delta: 2 },
      { category: 'Deployment', previousScore: 2, currentScore: 4, delta: 2 },
    ],
    changedFiles: [
      { path: 'tests/orders.spec.ts', status: 'added' },
      { path: '.github/workflows/ci.yml', status: 'changed' },
    ],
  },
}
