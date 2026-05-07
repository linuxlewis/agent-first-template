/**
 * Production server entry point.
 *
 * Serves Fastify API routes and the built React app from one Node process.
 */

import { resolve } from "node:path";
import { buildServer } from "./app-server.js";
import { createLogger } from "./providers/telemetry/index.js";

const log = createLogger("prod-server");
const staticRoot = process.env.STATIC_ROOT ?? resolve(process.cwd(), "dist/app");
const app = await buildServer({ staticRoot });

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? "0.0.0.0";

app.listen({ port, host }, (err, address) => {
	if (err) {
		log.error({ err }, "Failed to start production server");
		process.exit(1);
	}
	log.info({ address, staticRoot }, "Production server started");
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
	process.on(signal, async () => {
		log.info({ signal }, "Shutting down production server");
		await app.close();
		process.exit(0);
	});
}
