/**
 * Item Repository — data access layer.
 *
 * May import from: types, config
 * Must NOT import from: service, runtime, ui
 *
 * Uses Drizzle ORM to query PostgreSQL. Database rows are parsed before
 * returning domain values.
 */

import { getDb } from "@providers/database/index.js";
import { eq } from "drizzle-orm";
import type { CreateItem, Item } from "../types/index.js";
import { parseItemRow } from "./item-row.js";
import { itemsTable } from "./item-table.js";

export const itemRepo = {
	async findById(id: string): Promise<Item | null> {
		const rows = await getDb().select().from(itemsTable).where(eq(itemsTable.id, id)).limit(1);
		return rows[0] ? parseItemRow(rows[0]) : null;
	},

	async findAll(): Promise<Item[]> {
		const rows = await getDb().select().from(itemsTable).orderBy(itemsTable.createdAt);
		return rows.map(parseItemRow);
	},

	async create(input: CreateItem): Promise<Item> {
		const rows = await getDb().insert(itemsTable).values(input).returning();
		return parseItemRow(rows[0]);
	},

	async delete(id: string): Promise<boolean> {
		const rows = await getDb()
			.delete(itemsTable)
			.where(eq(itemsTable.id, id))
			.returning({ id: itemsTable.id });
		return rows.length > 0;
	},
};
