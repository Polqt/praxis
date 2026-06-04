ALTER TABLE "repository_executions" ADD COLUMN IF NOT EXISTS "framework" text;
ALTER TABLE "repository_executions" ADD COLUMN IF NOT EXISTS "command_summary" jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE "repository_executions" ADD COLUMN IF NOT EXISTS "install_result" jsonb;
ALTER TABLE "repository_executions" ADD COLUMN IF NOT EXISTS "test_result" jsonb;
ALTER TABLE "repository_executions" ADD COLUMN IF NOT EXISTS "build_result" jsonb;
ALTER TABLE "repository_executions" ADD COLUMN IF NOT EXISTS "lint_result" jsonb;
ALTER TABLE "repository_executions" ADD COLUMN IF NOT EXISTS "typecheck_result" jsonb;
ALTER TABLE "repository_executions" ADD COLUMN IF NOT EXISTS "doctor_result" jsonb;
ALTER TABLE "repository_executions" ADD COLUMN IF NOT EXISTS "public_summary" text;

CREATE TABLE IF NOT EXISTS "repository_ai_reviews" (
  "id" text PRIMARY KEY NOT NULL,
  "repository_analysis_id" text NOT NULL REFERENCES "repository_analyses"("id"),
  "model" text NOT NULL,
  "prompt_version" text NOT NULL,
  "input_hash" text NOT NULL,
  "review_data" jsonb NOT NULL,
  "input_tokens" integer NOT NULL DEFAULT 0,
  "output_tokens" integer NOT NULL DEFAULT 0,
  "estimated_cost_usd" text,
  "latency_ms" integer,
  "status" text NOT NULL DEFAULT 'success',
  "error_message" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "repository_ai_reviews_analysis_prompt_input_idx"
  ON "repository_ai_reviews" ("repository_analysis_id", "prompt_version", "input_hash");
