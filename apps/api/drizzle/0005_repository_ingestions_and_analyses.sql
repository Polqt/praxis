CREATE TABLE IF NOT EXISTS "repository_ingestions" (
  "id" text PRIMARY KEY NOT NULL,
  "github_repo_id" bigint NOT NULL,
  "commit_sha" text NOT NULL,
  "repo_full_name" text NOT NULL,
  "ingested_data" jsonb NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "repository_ingestions_repo_commit_idx"
  ON "repository_ingestions" ("github_repo_id", "commit_sha");

CREATE TABLE IF NOT EXISTS "repository_analyses" (
  "id" text PRIMARY KEY NOT NULL,
  "repository_ingestion_id" text NOT NULL,
  "analyzer_version" text NOT NULL,
  "analysis_data" jsonb NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'repository_analyses'::regclass
      AND contype = 'f'
      AND conkey = ARRAY[
        (
          SELECT attnum
          FROM pg_attribute
          WHERE attrelid = 'repository_analyses'::regclass
            AND attname = 'repository_ingestion_id'
        )
      ]::smallint[]
  ) THEN
    ALTER TABLE "repository_analyses"
      ADD CONSTRAINT "repository_analyses_repository_ingestion_id_fk"
      FOREIGN KEY ("repository_ingestion_id") REFERENCES "public"."repository_ingestions"("id")
      ON DELETE no action ON UPDATE no action;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "repository_analyses_ingestion_version_idx"
  ON "repository_analyses" ("repository_ingestion_id", "analyzer_version");

ALTER TABLE "repository_ingestions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "repository_analyses" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "repository_ingestions_no_client_access" ON "repository_ingestions";
CREATE POLICY "repository_ingestions_no_client_access"
  ON "repository_ingestions" FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "repository_analyses_no_client_access" ON "repository_analyses";
CREATE POLICY "repository_analyses_no_client_access"
  ON "repository_analyses" FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);
