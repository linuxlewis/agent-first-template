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
});
