ALTER TABLE "checklistItem" ALTER COLUMN "checked" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "checklistItem" ALTER COLUMN "checked" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "labels" ALTER COLUMN "title" SET DEFAULT 'New Label';--> statement-breakpoint
ALTER TABLE "labels" ALTER COLUMN "title" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "labels" ALTER COLUMN "color" SET DEFAULT '#000000';--> statement-breakpoint
ALTER TABLE "labels" ALTER COLUMN "color" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "labels" ALTER COLUMN "textColor" SET DEFAULT '#FFFFFF';--> statement-breakpoint
ALTER TABLE "labels" ALTER COLUMN "textColor" DROP NOT NULL;