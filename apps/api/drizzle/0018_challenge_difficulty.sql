CREATE TYPE "public"."challenge_difficulty" AS ENUM('beginner', 'intermediate', 'advanced');

ALTER TABLE "project_challenges" ADD COLUMN IF NOT EXISTS "difficulty" "challenge_difficulty" NOT NULL DEFAULT 'intermediate';
