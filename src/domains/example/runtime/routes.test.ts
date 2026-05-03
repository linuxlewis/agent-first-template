import Fastify from "fastify";
import { describe, expect, it } from "vitest";
import { registerItemRoutes } from "./routes.js";

describe("registerItemRoutes", () => {
	it("rejects invalid item ids before database access", async () => {
		const app = Fastify();
		await registerItemRoutes(app);
		try {
			const response = await app.inject({ method: "GET", url: "/api/items/not-a-uuid" });
			expect(response.statusCode).toBe(400);
			expect(response.json()).toEqual({ error: "Invalid item id" });
		} finally {
			await app.close();
		}
	});
});
