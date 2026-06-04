export default () => ({
  database: {
    url: process.env.DATABASE_URL,
  },
  supabase: {
    jwksUrl: process.env.SUPABASE_JWKS_URL,
    jwtSecret: process.env.SUPABASE_JWT_SECRET,
  },
  e2b: {
    apiKey: process.env.E2B_API_KEY,
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.ANTHROPIC_MODEL ?? 'claude-haiku-4-5-20251001',
  },
  github: {
    tokenEncryptionKey: process.env.GITHUB_TOKEN_ENCRYPTION_KEY,
  },
  redis: {
    url: process.env.REDIS_URL,
  },
  verificationPipeline: {
    maxTreeFiles: parseInt(process.env.INGESTION_MAX_TREE_FILES ?? '500', 10),
    maxSelectedFiles: parseInt(process.env.INGESTION_MAX_SELECTED_FILES ?? '80', 10),
    maxFileBytes: parseInt(process.env.INGESTION_MAX_FILE_BYTES ?? '102400', 10),
    maxTotalBytes: parseInt(process.env.INGESTION_MAX_TOTAL_BYTES ?? '1048576', 10),
    workerHeartbeatKey: process.env.WORKER_HEARTBEAT_KEY ?? 'praxis:worker:heartbeat',
    workerHeartbeatTtlSeconds: parseInt(process.env.WORKER_HEARTBEAT_TTL_SECONDS ?? '30', 10),
    submissionExpiryHours: parseInt(process.env.SUBMISSION_EXPIRY_HOURS ?? '6', 10),
    workerConcurrency: parseInt(process.env.WORKER_CONCURRENCY ?? '2', 10),
  },
  submissions: {
    rateLimitPerHour: parseInt(process.env.SUBMISSION_RATE_LIMIT_PER_HOUR ?? '5', 10),
  },
  port: parseInt(process.env.PORT ?? '4000', 10),
  notifications: {
    resendApiKey: process.env.RESEND_API_KEY ?? '',
    fromEmail: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
  },
  webBaseUrl: process.env.WEB_BASE_URL ?? 'https://praxisdev.vercel.app',
})
