import type { ReportStatus, Report } from '@/features/reports/types'

export const REPORT_DISCLAIMER_TEXT =
  'Praxis uses deterministic repository signals. Reports are evidence-based, not a replacement for human review.'

export const REPORT_DISCLAIMER_LINK_LABEL = 'Learn about our methodology'

export const REPORT_DISCLAIMER_LINK_HREF =
  'https://github.com/Polqt/praxis/blob/main/docs/LIMITATIONS.md'

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
