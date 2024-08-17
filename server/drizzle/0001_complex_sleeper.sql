ALTER TABLE "board" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "card" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "infoItem" ALTER COLUMN "content" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "infoItem" ALTER COLUMN "images" DROP NOT NULL;