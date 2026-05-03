import { describe, expect, it } from "vitest";
import { itemsTable } from "./item-table.js";

describe("itemsTable", () => {
	it("defines the items table", () => {
		expect(itemsTable).toBeDefined();
	});
});
