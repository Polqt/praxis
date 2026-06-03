CREATE TABLE "repository_executions" (
	"id" text PRIMARY KEY NOT NULL,
	"repository_ingestion_id" text NOT NULL,
	"language" text NOT NULL,
	"test_command" text NOT NULL,
	"exit_code" integer NOT NULL,
	"passed" integer DEFAULT 0 NOT NULL,
	"failed" integer DEFAULT 0 NOT NULL,
	"skipped" integer DEFAULT 0 NOT NULL,
	"duration_ms" integer,
	"stdout" text,
	"stderr" text,
	"timed_out" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "repository_executions" ADD CONSTRAINT "repository_executions_repository_ingestion_id_repository_ingestions_id_fk" FOREIGN KEY ("repository_ingestion_id") REFERENCES "public"."repository_ingestions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "repository_executions_ingestion_idx" ON "repository_executions" USING btree ("repository_ingestion_id");