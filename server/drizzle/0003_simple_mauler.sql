ALTER TABLE "assignedLabel" DROP CONSTRAINT "assignedLabel_cardId_card_id_fk";
--> statement-breakpoint
ALTER TABLE "assignedLabel" DROP CONSTRAINT "assignedLabel_labelId_labels_id_fk";
--> statement-breakpoint
ALTER TABLE "card" DROP CONSTRAINT "card_listId_list_id_fk";
--> statement-breakpoint
ALTER TABLE "checklist" DROP CONSTRAINT "checklist_cardId_card_id_fk";
--> statement-breakpoint
ALTER TABLE "checklistItem" DROP CONSTRAINT "checklistItem_checklistId_checklist_id_fk";
--> statement-breakpoint
ALTER TABLE "infoItem" DROP CONSTRAINT "infoItem_boardId_board_id_fk";
--> statement-breakpoint
ALTER TABLE "labels" DROP CONSTRAINT "labels_boardId_board_id_fk";
--> statement-breakpoint
ALTER TABLE "list" DROP CONSTRAINT "list_boardId_board_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "assignedLabel" ADD CONSTRAINT "assignedLabel_cardId_card_id_fk" FOREIGN KEY ("cardId") REFERENCES "public"."card"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "assignedLabel" ADD CONSTRAINT "assignedLabel_labelId_labels_id_fk" FOREIGN KEY ("labelId") REFERENCES "public"."labels"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "card" ADD CONSTRAINT "card_listId_list_id_fk" FOREIGN KEY ("listId") REFERENCES "public"."list"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "checklist" ADD CONSTRAINT "checklist_cardId_card_id_fk" FOREIGN KEY ("cardId") REFERENCES "public"."card"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "checklistItem" ADD CONSTRAINT "checklistItem_checklistId_checklist_id_fk" FOREIGN KEY ("checklistId") REFERENCES "public"."checklist"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "infoItem" ADD CONSTRAINT "infoItem_boardId_board_id_fk" FOREIGN KEY ("boardId") REFERENCES "public"."board"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "labels" ADD CONSTRAINT "labels_boardId_board_id_fk" FOREIGN KEY ("boardId") REFERENCES "public"."board"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "list" ADD CONSTRAINT "list_boardId_board_id_fk" FOREIGN KEY ("boardId") REFERENCES "public"."board"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
