CREATE TABLE "swiz_versioning" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" uuid,
	"sandbox_url" text,
	"sandbox_id" text,
	"title" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "swiz_versioning" ADD CONSTRAINT "swiz_versioning_message_id_swiz_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."swiz_message"("id") ON DELETE no action ON UPDATE no action;