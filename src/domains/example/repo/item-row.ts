import { type Item, ItemSchema } from "../types/index.js";

export function parseItemRow(row: unknown): Item {
	return ItemSchema.parse(row);
}
