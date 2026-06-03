ALTER TYPE "public"."submission_status" ADD VALUE 'cancelled';--> statement-breakpoint
ALTER TABLE "project_verification_reports" ADD COLUMN "view_count" integer DEFAULT 0 NOT NULL;