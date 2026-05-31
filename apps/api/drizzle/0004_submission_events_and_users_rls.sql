-- Add submission status history and lock down users reads.
-- Idempotent so it can be applied to databases that already received an edited 0003.

CREATE TABLE IF NOT EXISTS "project_submission_events" (
  "id" text PRIMARY KEY NOT NULL,
  "submission_id" text NOT NULL,
  "from_status" "submission_status",
  "to_status" "submission_status" NOT NULL,
  "reason" text,
  "metadata" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'project_submission_events'::regclass
      AND contype = 'f'
      AND conkey = ARRAY[
        (
          SELECT attnum
          FROM pg_attribute
          WHERE attrelid = 'project_submission_events'::regclass
            AND attname = 'submission_id'
        )
      ]::smallint[]
  ) THEN
    ALTER TABLE "project_submission_events"
      ADD CONSTRAINT "project_submission_events_submission_id_fk"
      FOREIGN KEY ("submission_id") REFERENCES "public"."project_submissions"("id")
      ON DELETE no action ON UPDATE no action;
  END IF;
END $$;

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "project_submission_events" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own" ON "users";
CREATE POLICY "users_select_own"
  ON "users" FOR SELECT
  TO authenticated
  USING (auth.uid()::text = supabase_uid);

DROP POLICY IF EXISTS "users_no_write" ON "users";
CREATE POLICY "users_no_write"
  ON "users" FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "project_submission_events_select_own" ON "project_submission_events";
CREATE POLICY "project_submission_events_select_own"
  ON "project_submission_events" FOR SELECT
  TO authenticated
  USING (
    auth.uid()::text = (
      SELECT u.supabase_uid
      FROM users u
      INNER JOIN project_submissions ps ON ps.user_id = u.id
      WHERE ps.id = submission_id
    )
  );

DROP POLICY IF EXISTS "project_submission_events_no_write" ON "project_submission_events";
CREATE POLICY "project_submission_events_no_write"
  ON "project_submission_events" FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);
