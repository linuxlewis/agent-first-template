import { describe, expect, it } from "vitest";
import { parseItemRow } from "./item-row.js";

describe("parseItemRow", () => {
	it("parses a database row into an item", () => {
		const item = parseItemRow({
			id: "550e8400-e29b-41d4-a716-446655440000",
			name: "Test Item",
			description: null,
			status: "active",
			createdAt: new Date("2026-01-01T00:00:00Z"),
			updatedAt: new Date("2026-01-01T00:00:00Z"),
		});

		expect(item.name).toBe("Test Item");
	});

	it("rejects invalid database rows", () => {
		expect(() => parseItemRow({ id: "bad" })).toThrow();
	});
});
