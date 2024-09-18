import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

export const board = pgTable("board", {
  id: uuid("id").defaultRandom().primaryKey(),

  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
});
export type Board = typeof board.$inferSelect;
export type NewBoard = typeof board.$inferInsert;
export const boardRelations = relations(board, ({ many }) => ({
  lists: many(list),
  labels: many(label),
  infoItems: many(infoItem),
}));

export const list = pgTable("list", {
  id: uuid("id").defaultRandom().primaryKey(),
  boardId: uuid("boardId")
    .notNull()
    .references(() => board.id, { onDelete: "cascade" }),

  title: varchar("title", { length: 256 }).notNull(),
  position: integer("position").notNull(),
});
export type List = typeof list.$inferSelect;
export type NewList = typeof list.$inferInsert;
export const listRelations = relations(list, ({ one, many }) => ({
  board: one(board, {
    fields: [list.boardId],
    references: [board.id],
  }),
  cards: many(card),
}));

export const card = pgTable("card", {
  id: uuid("id").defaultRandom().primaryKey(),
  listId: uuid("listId")
    .notNull()
    .references(() => list.id, { onDelete: "cascade" }),
  cardId: uuid("cardId").references((): AnyPgColumn => card.id),

  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  position: integer("position").notNull(),
});
export type Card = typeof card.$inferSelect;
export type NewCard = typeof card.$inferInsert;
export const cardRelations = relations(card, ({ one, many }) => ({
  list: one(list, {
    fields: [card.listId],
    references: [list.id],
  }),
  parentCard: one(card, {
    fields: [card.cardId],
    references: [card.id],
  }),
  labelAssignments: many(assignedLabel),
  checklists: many(checklist),
}));

export const label = pgTable("labels", {
  id: uuid("id").defaultRandom().primaryKey(),
  boardId: uuid("boardId")
    .notNull()
    .references(() => board.id, { onDelete: "cascade" }),

  title: varchar("title", { length: 256 }).default("New Label"),
  color: varchar("color", { length: 9 }).default("#000000"),
  textColor: varchar("textColor", { length: 9 }).default("#FFFFFF"),
});
export type Label = typeof label.$inferSelect;
export type NewLabel = typeof label.$inferInsert;
export const labelRelations = relations(label, ({ one, many }) => ({
  board: one(board, {
    fields: [label.boardId],
    references: [board.id],
  }),
  labelAssignments: many(assignedLabel),
}));

export const assignedLabel = pgTable("assignedLabel", {
  cardId: uuid("cardId")
    .notNull()
    .references(() => card.id, { onDelete: "cascade" }),
  labelId: uuid("labelId")
    .notNull()
    .references(() => label.id, { onDelete: "cascade" }),
});
export type AssignedLabel = typeof assignedLabel.$inferSelect;
export type NewAssignedLabel = typeof assignedLabel.$inferInsert;
export const assignedLabelRelations = relations(assignedLabel, ({ one }) => ({
  card: one(card, {
    fields: [assignedLabel.cardId],
    references: [card.id],
  }),
  label: one(label, {
    fields: [assignedLabel.labelId],
    references: [label.id],
  }),
}));

export const checklist = pgTable("checklist", {
  id: uuid("id").defaultRandom().primaryKey(),
  cardId: uuid("cardId")
    .notNull()
    .references(() => card.id, { onDelete: "cascade" }),

  title: varchar("title", { length: 256 }).notNull(),
});
export type Checklist = typeof checklist.$inferSelect;
export type NewChecklist = typeof checklist.$inferInsert;
export const checklistRelations = relations(checklist, ({ one, many }) => ({
  card: one(card, {
    fields: [checklist.cardId],
    references: [card.id],
  }),
  checklistItems: many(checklistItem),
}));

export const checklistItem = pgTable("checklistItem", {
  id: uuid("id").defaultRandom().primaryKey(),
  checklistId: uuid("checklistId")
    .notNull()
    .references(() => checklist.id, { onDelete: "cascade" }),

  title: varchar("title", { length: 256 }).notNull(),
  checked: boolean("checked").default(false),
  position: integer("position").notNull(),
});
export type ChecklistItem = typeof checklistItem.$inferSelect;
export type NewChecklistItem = typeof checklistItem.$inferInsert;
export const checklistItemRelations = relations(checklistItem, ({ one }) => ({
  checklist: one(checklist, {
    fields: [checklistItem.checklistId],
    references: [checklist.id],
  }),
}));

export const infoItem = pgTable("infoItem", {
  id: uuid("id").defaultRandom().primaryKey(),
  boardId: uuid("boardId")
    .notNull()
    .references(() => board.id, { onDelete: "cascade" }),

  title: varchar("title", { length: 256 }).notNull(),
  content: text("content"),
  images: text("images"),
});
export type InfoItem = typeof infoItem.$inferSelect;
export type NewInfoItem = typeof infoItem.$inferInsert;
export const infoItemRelations = relations(infoItem, ({ one }) => ({
  board: one(board, {
    fields: [infoItem.boardId],
    references: [board.id],
  }),
}));
