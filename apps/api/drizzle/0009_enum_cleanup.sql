-- Remove awaiting_human_review from submission_status enum
-- PostgreSQL requires creating a new type and migrating the column

-- 1. Create the new enum without awaiting_human_review
CREATE TYPE submission_status_new AS ENUM (
  'created',
  'queued',
  'ingesting',
  'ingestion_failed',
  'analyzing',
  'analysis_failed',
  'generating_report',
  'report_generation_failed',
  'verified',
  'insufficient',
  'failed',
  'expired'
);

-- 2. Migrate any rows that have the old value (safety net — should not exist in V1)
UPDATE project_submissions
  SET status = 'failed'
  WHERE status::text = 'awaiting_human_review';

UPDATE project_submission_events
  SET from_status = NULL
  WHERE from_status::text = 'awaiting_human_review';

UPDATE project_submission_events
  SET to_status = 'failed'
  WHERE to_status::text = 'awaiting_human_review';

-- 3. Drop defaults that reference the old enum type before altering columns
ALTER TABLE project_submissions ALTER COLUMN status DROP DEFAULT;

-- 4. Alter the columns to use the new type
ALTER TABLE project_submissions
  ALTER COLUMN status TYPE submission_status_new
    USING status::text::submission_status_new;

ALTER TABLE project_submission_events
  ALTER COLUMN from_status TYPE submission_status_new
    USING from_status::text::submission_status_new;

ALTER TABLE project_submission_events
  ALTER COLUMN to_status TYPE submission_status_new
    USING to_status::text::submission_status_new;

-- 5. Drop the old type and rename the new one
DROP TYPE submission_status;
ALTER TYPE submission_status_new RENAME TO submission_status;

-- 6. Restore the default using the renamed type
ALTER TABLE project_submissions ALTER COLUMN status SET DEFAULT 'created'::submission_status;

-- Remove conditional from verdict enum
CREATE TYPE verdict_new AS ENUM (
  'verified',
  'insufficient',
  'failed'
);

UPDATE project_verification_reports
  SET verdict = 'insufficient'
  WHERE verdict::text = 'conditional';

ALTER TABLE project_verification_reports
  ALTER COLUMN verdict TYPE verdict_new
    USING verdict::text::verdict_new;

DROP TYPE verdict;
ALTER TYPE verdict_new RENAME TO verdict;

-- Remove task from source_type enum
CREATE TYPE source_type_new AS ENUM (
  'project'
);

UPDATE user_skills
  SET source_type = 'project'
  WHERE source_type::text = 'task';

ALTER TABLE user_skills
  ALTER COLUMN source_type TYPE source_type_new
    USING source_type::text::source_type_new;

DROP TYPE source_type;
ALTER TYPE source_type_new RENAME TO source_type;

-- Remove frontend and fullstack from project_type enum
CREATE TYPE project_type_new AS ENUM (
  'backend'
);

-- Any non-backend challenges are out of scope for V1 — mark inactive rather than delete
UPDATE project_challenges
  SET project_type = 'backend'
  WHERE project_type::text IN ('frontend', 'fullstack');

ALTER TABLE project_challenges
  ALTER COLUMN project_type TYPE project_type_new
    USING project_type::text::project_type_new;

DROP TYPE project_type;
ALTER TYPE project_type_new RENAME TO project_type;
