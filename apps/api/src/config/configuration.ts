export default () => ({
  database: {
    url: process.env.DATABASE_URL,
  },
  supabase: {
    jwtSecret: process.env.SUPABASE_JWT_SECRET,
  },
  e2b: {
    apiKey: process.env.E2B_API_KEY,
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
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
  },
  port: parseInt(process.env.PORT ?? '4000', 10),
})
