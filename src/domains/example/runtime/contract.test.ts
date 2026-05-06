import { describe, expect, it } from "vitest";
import { itemRouteContracts } from "./contract.js";

describe("itemRouteContracts", () => {
	it("describes every item HTTP operation for OpenAPI and client generation", () => {
		expect(itemRouteContracts.map((route) => route.operationId)).toEqual([
			"listItems",
			"getItem",
			"createItem",
			"deleteItem",
		]);
		expect(itemRouteContracts.map((route) => route.client?.functionName)).toEqual([
			"listItems",
			"getItem",
			"createItem",
			"deleteItem",
		]);
	});

	it("uses serializable response schemas for date fields", () => {
		const itemResponse = itemRouteContracts[1].responses[200].schema?.safeParse({
			id: "550e8400-e29b-41d4-a716-446655440000",
			name: "Test",
			status: "active",
			createdAt: "2026-05-05T00:00:00.000Z",
			updatedAt: "2026-05-05T00:00:00.000Z",
		});

		expect(itemResponse?.success).toBe(true);
	});
});
