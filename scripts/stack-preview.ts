import { mkdirSync } from "node:fs";
import { join } from "node:path";
import postgres from "postgres";
import {
	computePortSeeds,
	findFreePort,
	getStackPaths,
	isProcessAlive,
	readMetadata,
	runCommand,
	type StackMetadata,
	spawnLogged,
	waitForHttp,
	writeMetadata,
} from "./stack-shared.js";

const existing = readMetadata();
if (existing && isProcessAlive(existing.pids.api) && isProcessAlive(existing.pids.web)) {
	if (existing.mode && existing.mode !== "preview") {
		console.error(`stack is already running in ${existing.mode} mode; run pnpm stop first`);
		process.exit(1);
	}
	await waitForHttp(`${existing.urls.api}/healthz`, 10_000);
	await waitForHttp(existing.urls.web, 10_000);
	console.log(`stack already running (${existing.mode ?? "dev"})`);
	console.log(`api: ${existing.urls.api}`);
	console.log(`web: ${existing.urls.web}`);
	console.log(`metadata: ${join(existing.dir, "metadata.json")}`);
	process.exit(0);
}

console.log("building production web assets");
runCommand("pnpm", ["build"]);

const paths = getStackPaths();
const seeds = computePortSeeds(paths.hash);
const ports = {
	api: await findFreePort(seeds.api),
	web: await findFreePort(seeds.web),
	postgres: await findFreePort(seeds.postgres),
};

mkdirSync(paths.logDir, { recursive: true });

const databaseUrl = `postgres://app:localdev@127.0.0.1:${ports.postgres}/app`;

console.log(`starting preview database for ${paths.projectName}`);
runCommand("docker", ["compose", "-p", paths.projectName, "up", "-d", "db"], {
	POSTGRES_PORT: String(ports.postgres),
});

console.log("waiting for database");
await waitForPostgres(databaseUrl);

console.log("running migrations");
runCommand("pnpm", ["db:migrate"], { DATABASE_URL: databaseUrl });

const metadata: StackMetadata = {
	mode: "preview",
	worktreeName: paths.worktreeName,
	projectName: paths.projectName,
	root: paths.root,
	dir: paths.dir,
	ports,
	urls: {
		api: `http://127.0.0.1:${ports.api}`,
		web: `http://127.0.0.1:${ports.web}`,
	},
	databaseUrl,
	pids: {},
	logs: {
		api: join(paths.logDir, "api.log"),
		web: join(paths.logDir, "web.log"),
	},
	startedAt: new Date().toISOString(),
};

metadata.pids.api = await spawnLogged("pnpm", ["exec", "tsx", "src/server.ts"], metadata.logs.api, {
	DATABASE_URL: databaseUrl,
	HOST: "127.0.0.1",
	PORT: String(ports.api),
	NODE_ENV: "production",
});

metadata.pids.web = await spawnLogged(
	"pnpm",
	[
		"exec",
		"vite",
		"preview",
		"--config",
		"src/app/vite.config.ts",
		"--host",
		"127.0.0.1",
		"--port",
		String(ports.web),
		"--strictPort",
	],
	metadata.logs.web,
	{
		API_ORIGIN: metadata.urls.api,
		NODE_ENV: "production",
	},
);

writeMetadata(metadata);

console.log("waiting for api and web");
await waitForHttp(`${metadata.urls.api}/healthz`, 30_000);
await waitForHttp(metadata.urls.web, 30_000);

console.log(`api: ${metadata.urls.api}`);
console.log(`web: ${metadata.urls.web}`);
console.log(`metadata: ${join(metadata.dir, "metadata.json")}`);

async function waitForPostgres(databaseUrl: string) {
	const started = Date.now();
	let lastError: unknown;
	while (Date.now() - started < 30_000) {
		const sql = postgres(databaseUrl, { max: 1, connect_timeout: 2 });
		try {
			await sql`SELECT 1`;
			await sql.end();
			return;
		} catch (err) {
			lastError = err;
			await sql.end().catch(() => undefined);
		}
		await new Promise((resolve) => setTimeout(resolve, 500));
	}
	throw new Error(`Timed out waiting for Postgres: ${String(lastError)}`);
}
