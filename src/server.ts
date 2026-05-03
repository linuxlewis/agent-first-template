/**
 * Server entry point.
 *
 * Boots Fastify, registers domain routes, and starts listening.
 * Each domain's runtime layer exports a route registration function.
 */

import { buildServer } from "./app-server.js";
import { createLogger } from "./providers/telemetry/index.js";

const log = createLogger("server");

const app = await buildServer();

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

for (const signal of ["SIGINT", "SIGTERM"] as const) {
	process.on(signal, async () => {
		log.info({ signal }, "Shutting down server");
		await app.close();
		process.exit(0);
	});
}
