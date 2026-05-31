import 'dotenv/config'
import * as postgresModule from 'postgres'

const postgres = (postgresModule as any).default ?? postgresModule
const sql = postgres(process.env.DATABASE_DIRECT_URL ?? process.env.DATABASE_URL!, { max: 1 })

async function main() {
  const tables = await sql.unsafe(`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_type = 'BASE TABLE'
    order by table_name
  `)

  const rls = await sql.unsafe(`
    select relname, relrowsecurity
    from pg_class
    join pg_namespace on pg_namespace.oid = pg_class.relnamespace
    where nspname = 'public'
      and relkind = 'r'
      and relname in (
        'users',
        'tracks',
        'skills',
        'user_skills',
        'project_challenges',
        'github_accounts',
        'project_submissions',
        'project_submission_events',
        'project_verification_reports',
        'repository_ingestions',
        'repository_analyses'
      )
    order by relname
  `)

  const policies = await sql.unsafe(`
    select tablename, policyname, cmd, roles
    from pg_policies
    where schemaname = 'public'
    order by tablename, policyname
  `)

  console.log(JSON.stringify({ tables, rls, policies }, null, 2))
}

main()
  .catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
  .finally(() => sql.end())
