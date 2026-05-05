import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { isProcessAlive, readMetadata, runCommand } from "./stack-shared.js";

const args = new Set(process.argv.slice(2));
const suites = {
	unit: args.size === 0 || args.has("--unit"),
	integration: args.size === 0 || args.has("--integration"),
	e2e: args.size === 0 || args.has("--e2e"),
};

const needsStack = suites.integration || suites.e2e;
let shouldStopStack = false;

let exitCode = 0;

try {
	if (suites.unit) {
		runCommand("pnpm", ["test:unit"]);
	}

	if (needsStack) {
		shouldStopStack = !isStackRunning(readMetadata());
		runCommand("pnpm", ["start"]);
		const metadata = readMetadata();
		if (!metadata) {
			throw new Error("Stack start completed without metadata.");
		}

		if (suites.integration) {
			const integrationTests = collectIntegrationTests(join(process.cwd(), "src"));
			if (integrationTests.length === 0) {
				console.log("No integration test files found.");
			} else {
				runCommand("pnpm", ["exec", "vitest", "run", ...integrationTests], {
					DATABASE_URL: metadata.databaseUrl,
				});
			}
		}

		if (suites.e2e) {
			runCommand("pnpm", ["exec", "playwright", "test"], {
				API_ORIGIN: metadata.urls.api,
				WEB_URL: metadata.urls.web,
				DATABASE_URL: metadata.databaseUrl,
			});
		}
	}
} catch (err) {
	exitCode = 1;
	console.error(err instanceof Error ? err.message : String(err));
} finally {
	if (shouldStopStack) {
		try {
			runCommand("pnpm", ["stop"]);
		} catch (err) {
			exitCode = 1;
			console.error(err instanceof Error ? err.message : String(err));
		}
	}
}

process.exit(exitCode);

function isStackRunning(metadata: ReturnType<typeof readMetadata>) {
	return Boolean(
		metadata && isProcessAlive(metadata.pids.api) && isProcessAlive(metadata.pids.web),
	);
}

function collectIntegrationTests(dir: string): string[] {
	if (!existsSync(dir)) return [];

	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) return collectIntegrationTests(path);
		if (entry.isFile() && /\.integration\.test\.tsx?$/.test(entry.name)) return [path];
		return [];
	});
}
