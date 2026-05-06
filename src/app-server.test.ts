import { describe, expect, it } from "vitest";
import { buildServer } from "./app-server.js";

describe("buildServer", () => {
	it("exposes a health endpoint without database access", async () => {
		const app = await buildServer();
		try {
			const response = await app.inject({ method: "GET", url: "/healthz" });
			expect(response.statusCode).toBe(200);
			expect(response.json()).toEqual({ ok: true });
		} finally {
			await app.close();
		}
	});

	it("exposes the OpenAPI document without database access", async () => {
		const app = await buildServer();
		try {
			const response = await app.inject({ method: "GET", url: "/openapi.json" });
			expect(response.statusCode).toBe(200);
			expect(response.json()).toMatchObject({
				openapi: "3.1.0",
				paths: {
					"/api/items": expect.any(Object),
					"/api/items/{id}": expect.any(Object),
				},
			});
		} finally {
			await app.close();
		}
	});
});
