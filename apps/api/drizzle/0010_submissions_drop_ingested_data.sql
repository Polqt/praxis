-- Drop the ingested_data column from project_submissions.
-- Ingestion data now lives canonically in repository_ingestions.
ALTER TABLE project_submissions DROP COLUMN IF EXISTS ingested_data;
