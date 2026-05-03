import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const itemsTable = pgTable("items", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: varchar("name", { length: 255 }).notNull(),
	description: text("description"),
	status: varchar("status", { length: 32 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
