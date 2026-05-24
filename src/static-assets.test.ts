import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Fastify from "fastify";
import { afterEach, describe, expect, it } from "vitest";
import { registerStaticAssetFallback } from "./static-assets.js";

let tempDir: string | null = null;

afterEach(async () => {
	if (tempDir) await rm(tempDir, { recursive: true, force: true });
	tempDir = null;
});

describe("registerStaticAssetFallback", () => {
	it("serves static assets and falls back to index for browser routes", async () => {
		tempDir = await mkdtemp(join(tmpdir(), "static-assets-"));
		await writeFile(join(tempDir, "index.html"), "<main>app</main>");
		await writeFile(join(tempDir, "asset.js"), "export {};");

		const app = Fastify();
		registerStaticAssetFallback(app, tempDir);
		try {
			const asset = await app.inject({ method: "GET", url: "/asset.js" });
			expect(asset.statusCode).toBe(200);
			expect(asset.headers["content-type"]).toContain("text/javascript");
			expect(asset.body).toBe("export {};");

			const browserRoute = await app.inject({ method: "GET", url: "/items/123" });
			expect(browserRoute.statusCode).toBe(200);
			expect(browserRoute.headers["content-type"]).toContain("text/html");
			expect(browserRoute.body).toBe("<main>app</main>");
		} finally {
			await app.close();
		}
	});

	it("does not serve the app shell for unknown API routes", async () => {
		tempDir = await mkdtemp(join(tmpdir(), "static-assets-"));
		await writeFile(join(tempDir, "index.html"), "<main>app</main>");

		const app = Fastify();
		registerStaticAssetFallback(app, tempDir);
		try {
			const response = await app.inject({ method: "GET", url: "/api/missing" });
			expect(response.statusCode).toBe(404);
			expect(response.json()).toEqual({ error: "Not found" });
		} finally {
			await app.close();
		}
	});

	it("serves PWA assets with browser-expected content types", async () => {
		tempDir = await mkdtemp(join(tmpdir(), "static-assets-"));
		await writeFile(join(tempDir, "index.html"), "<main>app</main>");
		await writeFile(join(tempDir, "manifest.webmanifest"), "{}");
		await writeFile(join(tempDir, "robots.txt"), "User-agent: *\nAllow: /\n");

		const app = Fastify();
		registerStaticAssetFallback(app, tempDir);
		try {
			const manifest = await app.inject({ method: "GET", url: "/manifest.webmanifest" });
			expect(manifest.statusCode).toBe(200);
			expect(manifest.headers["content-type"]).toContain("application/manifest+json");

			const robots = await app.inject({ method: "GET", url: "/robots.txt" });
			expect(robots.statusCode).toBe(200);
			expect(robots.headers["content-type"]).toContain("text/plain");
		} finally {
			await app.close();
		}
	});
});
