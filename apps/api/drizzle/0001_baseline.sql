-- v0 baseline snapshot — DO NOT RUN against existing database
-- Tables already exist. This file is for migration history only.

CREATE TYPE "public"."language" AS ENUM('python');
CREATE TYPE "public"."difficulty" AS ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
CREATE TYPE "public"."task_status" AS ENUM('PENDING', 'IN_PROGRESS', 'VERIFIED', 'FAILED');

CREATE TABLE "users" (
  "id" text PRIMARY KEY NOT NULL,
  "supabase_uid" text NOT NULL,
  "email" text NOT NULL,
  "username" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "users_supabase_uid_unique" UNIQUE("supabase_uid")
);

CREATE TABLE "tasks" (
  "id" text PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "language" "language" DEFAULT 'python' NOT NULL,
  "difficulty" "difficulty" NOT NULL,
  "starter_code" text NOT NULL,
  "test_code" text NOT NULL,
  "skill_tags" text[] DEFAULT '{}' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "user_tasks" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "task_id" text NOT NULL,
  "status" "task_status" DEFAULT 'PENDING' NOT NULL,
  "latest_code" text,
  "attempts" integer DEFAULT 0 NOT NULL,
  "feedback" text,
  "verified_at" timestamp,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "user_tasks_user_id_task_id_idx" UNIQUE("user_id","task_id")
);

CREATE TABLE "skills" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "category" text NOT NULL,
  CONSTRAINT "skills_name_unique" UNIQUE("name")
);

CREATE TABLE "user_skills" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "skill_id" text NOT NULL,
  "verified_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "user_tasks" ADD CONSTRAINT "user_tasks_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "user_tasks" ADD CONSTRAINT "user_tasks_task_id_tasks_id_fk"
  FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_skill_id_skills_id_fk"
  FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE no action ON UPDATE no action;
