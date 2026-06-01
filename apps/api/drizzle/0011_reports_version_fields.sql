-- Add report_generator_version to project_verification_reports.
-- Also drop ai_model_version which is superseded by analyzer_version.
ALTER TABLE project_verification_reports
  ADD COLUMN IF NOT EXISTS report_generator_version text;

-- Drop the misleading ai_model_version column; analyzer_version carries this meaning.
ALTER TABLE project_verification_reports
  DROP COLUMN IF EXISTS ai_model_version;
