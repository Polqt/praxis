ALTER TABLE project_verification_reports
  ADD COLUMN IF NOT EXISTS analyzer_version text NOT NULL DEFAULT 'deterministic-v2',
  ADD COLUMN IF NOT EXISTS scoring_version text NOT NULL DEFAULT 'scoring-v2',
  ADD COLUMN IF NOT EXISTS rubric_version integer;
