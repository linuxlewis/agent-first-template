/**
 * Server entry point.
 *
 * Boots Fastify, registers domain routes, and starts listening.
 * Each domain's runtime layer exports a route registration function.
 */

import { createLogger } from "@providers/telemetry/index.js";
import Fastify from "fastify";
import { registerItemRoutes } from "./domains/example/runtime/routes.js";

const log = createLogger("server");

const app = Fastify({ logger: false });

// Register domain routes
await registerItemRoutes(app);

// Start
const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? "0.0.0.0";

app.listen({ port, host }, (err, address) => {
	if (err) {
		log.error({ err }, "Failed to start server");
		process.exit(1);
	}
	log.info({ address }, "Server started");
});
