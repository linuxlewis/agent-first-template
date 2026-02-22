import { describe, expect, it } from "vitest";
import { CreateItemSchema, ItemSchema } from "./item.js";

describe("ItemSchema", () => {
	it("parses a valid item", () => {
		const result = ItemSchema.safeParse({
			id: "550e8400-e29b-41d4-a716-446655440000",
			name: "Test Item",
			status: "active",
			createdAt: "2025-01-01T00:00:00Z",
			updatedAt: "2025-01-01T00:00:00Z",
		});
		expect(result.success).toBe(true);
	});

	it("rejects empty name", () => {
		const result = ItemSchema.safeParse({
			id: "550e8400-e29b-41d4-a716-446655440000",
			name: "",
			status: "active",
			createdAt: "2025-01-01T00:00:00Z",
			updatedAt: "2025-01-01T00:00:00Z",
		});
		expect(result.success).toBe(false);
	});

	it("rejects invalid status", () => {
		const result = ItemSchema.safeParse({
			id: "550e8400-e29b-41d4-a716-446655440000",
			name: "Test",
			status: "invalid",
			createdAt: "2025-01-01T00:00:00Z",
			updatedAt: "2025-01-01T00:00:00Z",
		});
		expect(result.success).toBe(false);
	});
});

describe("CreateItemSchema", () => {
	it("does not require id or timestamps", () => {
		const result = CreateItemSchema.safeParse({
			name: "New Item",
			status: "draft",
		});
		expect(result.success).toBe(true);
	});
});
