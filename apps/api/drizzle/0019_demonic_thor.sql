CREATE TYPE "public"."challenge_difficulty" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TABLE "repository_ai_reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"repository_analysis_id" text NOT NULL,
	"model" text NOT NULL,
	"prompt_version" text NOT NULL,
	"input_hash" text NOT NULL,
	"review_data" jsonb NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"estimated_cost_usd" text,
	"latency_ms" integer,
	"status" text DEFAULT 'success' NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_challenges" ADD COLUMN "difficulty" "challenge_difficulty" DEFAULT 'intermediate' NOT NULL;--> statement-breakpoint
ALTER TABLE "project_submissions" ADD COLUMN "viewed_at" timestamp;--> statement-breakpoint
ALTER TABLE "repository_executions" ADD COLUMN "framework" text;--> statement-breakpoint
ALTER TABLE "repository_executions" ADD COLUMN "command_summary" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "repository_executions" ADD COLUMN "install_result" jsonb;--> statement-breakpoint
ALTER TABLE "repository_executions" ADD COLUMN "test_result" jsonb;--> statement-breakpoint
ALTER TABLE "repository_executions" ADD COLUMN "build_result" jsonb;--> statement-breakpoint
ALTER TABLE "repository_executions" ADD COLUMN "lint_result" jsonb;--> statement-breakpoint
ALTER TABLE "repository_executions" ADD COLUMN "typecheck_result" jsonb;--> statement-breakpoint
ALTER TABLE "repository_executions" ADD COLUMN "doctor_result" jsonb;--> statement-breakpoint
ALTER TABLE "repository_executions" ADD COLUMN "public_summary" text;--> statement-breakpoint
ALTER TABLE "user_skills" ADD COLUMN "source_report_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "username_updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "repository_ai_reviews" ADD CONSTRAINT "repository_ai_reviews_repository_analysis_id_repository_analyses_id_fk" FOREIGN KEY ("repository_analysis_id") REFERENCES "public"."repository_analyses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "repository_ai_reviews_analysis_prompt_input_idx" ON "repository_ai_reviews" USING btree ("repository_analysis_id","prompt_version","input_hash");--> statement-breakpoint
ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_source_report_id_project_verification_reports_id_fk" FOREIGN KEY ("source_report_id") REFERENCES "public"."project_verification_reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "project_submission_events_submission_id_idx" ON "project_submission_events" USING btree ("submission_id");--> statement-breakpoint
CREATE INDEX "project_submissions_user_id_idx" ON "project_submissions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "project_submissions_challenge_id_idx" ON "project_submissions" USING btree ("challenge_id");--> statement-breakpoint
CREATE INDEX "project_submissions_status_idx" ON "project_submissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "report_feedback_report_id_idx" ON "report_feedback" USING btree ("report_id");