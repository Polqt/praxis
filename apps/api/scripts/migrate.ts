import 'dotenv/config'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as postgresModule from 'postgres'
import * as path from 'node:path'

const postgres = (postgresModule as unknown as { default: typeof postgresModule }).default ?? postgresModule

async function runMigrations() {
  const url = process.env.DATABASE_DIRECT_URL ?? process.env.DATABASE_URL
  if (!url) {
    process.stderr.write('DATABASE_URL or DATABASE_DIRECT_URL is required\n')
    process.exit(1)
  }

  const client = postgres(url, { max: 1 })
  const db = drizzle(client)

  const migrationsFolder = path.join(__dirname, '..', 'drizzle')

  process.stdout.write(`Running migrations from ${migrationsFolder}\n`)

  try {
    await migrate(db, { migrationsFolder })
    process.stdout.write('Migrations complete\n')
    await client.end()
    process.exit(0)
  } catch (err) {
    process.stderr.write(`Migration failed: ${err instanceof Error ? err.message : String(err)}\n`)
    await client.end()
    process.exit(1)
  }
}

runMigrations()
