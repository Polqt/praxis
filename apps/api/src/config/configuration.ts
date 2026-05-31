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
  port: parseInt(process.env.PORT ?? '4000', 10),
})
