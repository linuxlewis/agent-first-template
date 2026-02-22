/**
 * Item Service — business logic layer.
 *
 * May import from: types, config, repo
 * Must NOT import from: runtime, ui
 *
 * This layer orchestrates domain rules and coordinates repo calls.
 */

import { createLogger } from "@providers/telemetry/index.js";
import { itemRepo } from "../repo/item-repo.js";
import { CreateItemSchema, type Item } from "../types/index.js";

const log = createLogger("example.item-service");

export const itemService = {
	async getItem(id: string): Promise<Item | null> {
		log.info({ id }, "Fetching item");
		return itemRepo.findById(id);
	},

	async listItems(): Promise<Item[]> {
		return itemRepo.findAll();
	},

	async createItem(raw: unknown): Promise<Item> {
		// Parse at the boundary
		const input = CreateItemSchema.parse(raw);
		log.info({ name: input.name }, "Creating item");
		return itemRepo.create(input);
	},

	async deleteItem(id: string): Promise<boolean> {
		log.info({ id }, "Deleting item");
		return itemRepo.delete(id);
	},
};
