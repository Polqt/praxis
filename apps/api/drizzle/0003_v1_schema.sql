-- v1 schema: enums, tables, indexes, RLS policies

-- =====================
-- ENUMS
-- =====================

CREATE TYPE "public"."submission_status" AS ENUM(
  'created',
  'queued',
  'ingesting',
  'ingestion_failed',
  'analyzing',
  'analysis_failed',
  'generating_report',
  'report_generation_failed',
  'awaiting_human_review',
  'verified',
  'insufficient',
  'failed',
  'expired'
);

CREATE TYPE "public"."project_type" AS ENUM(
  'frontend',
  'backend',
  'fullstack'
);

CREATE TYPE "public"."verdict" AS ENUM(
  'verified',
  'conditional',
  'insufficient',
  'failed'
);

CREATE TYPE "public"."source_type" AS ENUM(
  'project',
  'task'
);

-- =====================
-- TABLES
-- =====================

CREATE TABLE "tracks" (
  "id" text PRIMARY KEY NOT NULL,
  "slug" text NOT NULL,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "tracks_slug_unique" UNIQUE("slug")
);

CREATE TABLE "skills" (
  "id" text PRIMARY KEY NOT NULL,
  "track_id" text NOT NULL,
  "name" text NOT NULL,
  "category" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "skills_name_unique" UNIQUE("name")
);

CREATE TABLE "user_skills" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "skill_id" text NOT NULL,
  "source_type" "source_type" NOT NULL,
  "awarded_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "project_challenges" (
  "id" text PRIMARY KEY NOT NULL,
  "track_id" text NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "project_type" "project_type" NOT NULL,
  "rubric" jsonb NOT NULL,
  "passing_threshold" integer DEFAULT 70 NOT NULL,
  "version" integer DEFAULT 1 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "github_accounts" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "github_user_id" bigint NOT NULL,
  "github_username" text NOT NULL,
  "github_email" text,
  "access_token" text NOT NULL,
  "token_scope" text NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "connected_at" timestamp DEFAULT now() NOT NULL,
  "last_synced_at" timestamp,
  CONSTRAINT "github_accounts_user_id_unique" UNIQUE("user_id"),
  CONSTRAINT "github_accounts_github_user_id_unique" UNIQUE("github_user_id")
);

CREATE TABLE "project_submissions" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "challenge_id" text NOT NULL,
  "github_repo_full_name" text NOT NULL,
  "github_repo_id" bigint NOT NULL,
  "commit_sha" text NOT NULL,
  "status" "submission_status" DEFAULT 'created' NOT NULL,
  "submitted_at" timestamp DEFAULT now() NOT NULL,
  "ingested_at" timestamp,
  "analyzed_at" timestamp,
  "completed_at" timestamp,
  "attempts" integer DEFAULT 1 NOT NULL,
  "failure_reason" text,
  "ingested_data" jsonb,
  "rubric_version" integer NOT NULL
);

CREATE TABLE "project_verification_reports" (
  "id" text PRIMARY KEY NOT NULL,
  "submission_id" text NOT NULL,
  "composite_score" integer NOT NULL,
  "verdict" "verdict" NOT NULL,
  "category_scores" jsonb NOT NULL,
  "public_summary" text,
  "ai_model_version" text NOT NULL,
  "generated_at" timestamp DEFAULT now() NOT NULL,
  "is_public" boolean DEFAULT false NOT NULL,
  "public_token" text,
  CONSTRAINT "project_verification_reports_submission_id_unique" UNIQUE("submission_id"),
  CONSTRAINT "project_verification_reports_public_token_unique" UNIQUE("public_token")
);

-- =====================
-- FOREIGN KEYS
-- =====================

ALTER TABLE "skills"
  ADD CONSTRAINT "skills_track_id_tracks_id_fk"
  FOREIGN KEY ("track_id") REFERENCES "public"."tracks"("id")
  ON DELETE no action ON UPDATE no action;

ALTER TABLE "user_skills"
  ADD CONSTRAINT "user_skills_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
  ON DELETE no action ON UPDATE no action;

ALTER TABLE "user_skills"
  ADD CONSTRAINT "user_skills_skill_id_skills_id_fk"
  FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id")
  ON DELETE no action ON UPDATE no action;

ALTER TABLE "project_challenges"
  ADD CONSTRAINT "project_challenges_track_id_tracks_id_fk"
  FOREIGN KEY ("track_id") REFERENCES "public"."tracks"("id")
  ON DELETE no action ON UPDATE no action;

ALTER TABLE "github_accounts"
  ADD CONSTRAINT "github_accounts_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
  ON DELETE no action ON UPDATE no action;

ALTER TABLE "project_submissions"
  ADD CONSTRAINT "project_submissions_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
  ON DELETE no action ON UPDATE no action;

ALTER TABLE "project_submissions"
  ADD CONSTRAINT "project_submissions_challenge_id_project_challenges_id_fk"
  FOREIGN KEY ("challenge_id") REFERENCES "public"."project_challenges"("id")
  ON DELETE no action ON UPDATE no action;

ALTER TABLE "project_verification_reports"
  ADD CONSTRAINT "project_verification_reports_submission_id_project_submissions_id_fk"
  FOREIGN KEY ("submission_id") REFERENCES "public"."project_submissions"("id")
  ON DELETE no action ON UPDATE no action;

-- =====================
-- INDEXES
-- =====================

CREATE UNIQUE INDEX "user_skills_user_id_skill_id_idx"
  ON "user_skills" ("user_id", "skill_id");

CREATE UNIQUE INDEX "project_submissions_user_challenge_commit_idx"
  ON "project_submissions" ("user_id", "challenge_id", "commit_sha");

-- =====================
-- RLS: ENABLE
-- =====================

ALTER TABLE "tracks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "skills" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_skills" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "project_challenges" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "github_accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "project_submissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "project_verification_reports" ENABLE ROW LEVEL SECURITY;

-- =====================
-- RLS: PUBLIC READ (platform content)
-- =====================

CREATE POLICY "tracks_public_read"
  ON "tracks" FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "skills_public_read"
  ON "skills" FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "project_challenges_public_read"
  ON "project_challenges" FOR SELECT
  TO anon, authenticated
  USING (true);

-- =====================
-- RLS: USER-OWNED TABLES (select own rows only)
-- =====================

CREATE POLICY "user_skills_select_own"
  ON "user_skills" FOR SELECT
  TO authenticated
  USING (
    auth.uid()::text = (SELECT supabase_uid FROM users WHERE id = user_id)
  );

CREATE POLICY "github_accounts_select_own"
  ON "github_accounts" FOR SELECT
  TO authenticated
  USING (
    auth.uid()::text = (SELECT supabase_uid FROM users WHERE id = user_id)
  );

CREATE POLICY "project_submissions_select_own"
  ON "project_submissions" FOR SELECT
  TO authenticated
  USING (
    auth.uid()::text = (SELECT supabase_uid FROM users WHERE id = user_id)
  );

CREATE POLICY "project_verification_reports_select"
  ON "project_verification_reports" FOR SELECT
  TO anon, authenticated
  USING (
    is_public = true
    OR auth.uid()::text = (
      SELECT u.supabase_uid
      FROM users u
      INNER JOIN project_submissions ps ON ps.user_id = u.id
      WHERE ps.id = submission_id
    )
  );

-- =====================
-- RLS: BLOCK ALL WRITES for anon/authenticated
-- (service role bypasses RLS and handles all writes)
-- =====================

CREATE POLICY "user_skills_no_write"
  ON "user_skills" FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "github_accounts_no_write"
  ON "github_accounts" FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "project_submissions_no_write"
  ON "project_submissions" FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "project_verification_reports_no_write"
  ON "project_verification_reports" FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);
