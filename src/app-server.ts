import { closeDb } from "@providers/database/index.js";
import { createOpenApiDocument } from "@providers/openapi/index.js";
import { createLogger } from "@providers/telemetry/index.js";
import Fastify from "fastify";
import { apiRouteContracts } from "./api-contracts.js";
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
	app.get("/openapi.json", async () =>
		createOpenApiDocument({
			title: "Agent-First Template API",
			version: "0.1.0",
			routes: apiRouteContracts,
		}),
	);
	await registerItemRoutes(app);

	app.addHook("onClose", async () => {
		await closeDb();
	});

	return app;
}
