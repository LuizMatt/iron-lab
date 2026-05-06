import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const groupsTable = pgTable("groups", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  ownerId: text("owner_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  inviteToken: varchar("invite_token", { length: 20 }).unique().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const groupMembersTable = pgTable("group_members", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  groupId: text("group_id")
    .notNull()
    .references(() => groupsTable.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export type Group = typeof groupsTable.$inferSelect;
export type GroupMember = typeof groupMembersTable.$inferSelect;
