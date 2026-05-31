-- Drop v0 deprecated tables and enums.
-- Dependency order: child tables before parent tables, tables before enums.

DROP TABLE IF EXISTS "user_skills";
DROP TABLE IF EXISTS "user_tasks";
DROP TABLE IF EXISTS "tasks";
DROP TABLE IF EXISTS "skills";

DROP TYPE IF EXISTS "public"."task_status";
DROP TYPE IF EXISTS "public"."difficulty";
DROP TYPE IF EXISTS "public"."language";
