import { existsSync, readFileSync } from "node:fs";
import { readMetadata } from "./shared.js";

const metadata = readMetadata();
if (!metadata) {
	console.error("harness metadata not found; run pnpm harness:boot");
	process.exit(1);
}

const args = process.argv.slice(2);
const service = readArg("--service") ?? "api";
const query = readArg("--query");
const lines = Number(readArg("--lines") ?? 120);

if (service !== "api" && service !== "web") {
	console.error("--service must be api or web");
	process.exit(1);
}

const logPath = metadata.logs[service];
if (!existsSync(logPath)) {
	console.error(`log file not found: ${logPath}`);
	process.exit(1);
}

let output = readFileSync(logPath, "utf-8").split("\n").filter(Boolean);
if (query) {
	output = output.filter((line) => line.includes(query));
}

for (const line of output.slice(-lines)) {
	console.log(line);
}

function readArg(name: string) {
	const index = args.indexOf(name);
	if (index === -1) return undefined;
	return args[index + 1];
}
