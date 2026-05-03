import { readMetadata, runCommand } from "./shared.js";

let exitCode = 0;

try {
	runCommand("pnpm", ["harness:boot"]);
	const metadata = readMetadata();
	if (!metadata) {
		throw new Error("Harness boot completed without metadata.");
	}

	runCommand("pnpm", ["harness:seed"]);
	runCommand("pnpm", ["test"], { DATABASE_URL: metadata.databaseUrl });
	runCommand("pnpm", ["e2e"], {
		API_ORIGIN: metadata.urls.api,
		WEB_URL: metadata.urls.web,
		DATABASE_URL: metadata.databaseUrl,
	});
} catch (err) {
	exitCode = 1;
	console.error(err instanceof Error ? err.message : String(err));
} finally {
	try {
		runCommand("pnpm", ["harness:down"]);
	} catch (err) {
		exitCode = 1;
		console.error(err instanceof Error ? err.message : String(err));
	}
}

process.exit(exitCode);
