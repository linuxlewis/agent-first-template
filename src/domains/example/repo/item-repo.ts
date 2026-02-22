/**
 * Item Repository — data access layer.
 *
 * May import from: types, config
 * Must NOT import from: service, runtime, ui
 *
 * In a real app, this would use Drizzle ORM to query PostgreSQL.
 * This scaffold uses an in-memory store as a placeholder.
 */

import type { CreateItem, Item } from "../types/index.js";

// Placeholder: replace with Drizzle queries against PostgreSQL
const store = new Map<string, Item>();

export const itemRepo = {
	async findById(id: string): Promise<Item | null> {
		return store.get(id) ?? null;
	},

	async findAll(): Promise<Item[]> {
		return Array.from(store.values());
	},

	async create(input: CreateItem): Promise<Item> {
		const item: Item = {
			...input,
			id: crypto.randomUUID(),
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		store.set(item.id, item);
		return item;
	},

	async delete(id: string): Promise<boolean> {
		return store.delete(id);
	},
};
