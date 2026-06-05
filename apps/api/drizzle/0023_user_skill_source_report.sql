ALTER TABLE "user_skills"
  ADD COLUMN IF NOT EXISTS "source_report_id" text REFERENCES "project_verification_reports"("id");
