ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "username_updated_at" timestamp;
