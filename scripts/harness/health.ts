import { isProcessAlive, readMetadata, waitForHttp } from "./shared.js";

const metadata = readMetadata();
if (!metadata) {
	console.error("harness metadata not found; run pnpm harness:boot");
	process.exit(1);
}

const checks = [
	["api process", isProcessAlive(metadata.pids.api)],
	["web process", isProcessAlive(metadata.pids.web)],
] as const;

for (const [name, passed] of checks) {
	if (!passed) {
		console.error(`${name}: failed`);
		process.exit(1);
	}
	console.log(`${name}: ok`);
}

await waitForHttp(`${metadata.urls.api}/healthz`, 5_000);
console.log(`api health: ok (${metadata.urls.api}/healthz)`);

await waitForHttp(metadata.urls.web, 5_000);
console.log(`web health: ok (${metadata.urls.web})`);
