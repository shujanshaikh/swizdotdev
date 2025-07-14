CREATE TABLE "swiz_message" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid,
	"model" text,
	"parts" jsonb NOT NULL,
	"role" varchar NOT NULL,
	"attachments" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "swiz_project" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "swiz_message" ADD CONSTRAINT "swiz_message_project_id_swiz_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."swiz_project"("id") ON DELETE no action ON UPDATE no action;