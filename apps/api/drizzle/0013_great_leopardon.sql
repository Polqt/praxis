CREATE TABLE "report_feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"report_id" text NOT NULL,
	"user_id" text NOT NULL,
	"accuracy_rating" integer NOT NULL,
	"missed_evidence" text,
	"notes" text,
	"would_share" boolean,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "report_feedback" ADD CONSTRAINT "report_feedback_report_id_project_verification_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."project_verification_reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_feedback" ADD CONSTRAINT "report_feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "report_feedback_report_user_idx" ON "report_feedback" USING btree ("report_id","user_id");