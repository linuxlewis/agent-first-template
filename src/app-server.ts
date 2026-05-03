import { closeDb } from "@providers/database/index.js";
import { createLogger } from "@providers/telemetry/index.js";
import Fastify from "fastify";
import { registerItemRoutes } from "./domains/example/runtime/routes.js";

const log = createLogger("app-server");

export async function buildServer() {
	const app = Fastify({
		logger: false,
		genReqId: () => crypto.randomUUID(),
	});

	app.addHook("onRequest", async (request) => {
		request.headers["x-request-start"] = String(performance.now());
	});

	app.addHook("onResponse", async (request, reply) => {
		const started = Number(request.headers["x-request-start"] ?? performance.now());
		log.info(
			{
				requestId: request.id,
				method: request.method,
				url: request.url,
				statusCode: reply.statusCode,
				durationMs: Math.round(performance.now() - started),
			},
			"HTTP request completed",
		);
	});

	app.get("/healthz", async () => ({ ok: true }));
	await registerItemRoutes(app);

	app.addHook("onClose", async () => {
		await closeDb();
	});

	return app;
}
