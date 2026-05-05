import { execFileSync, spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { open } from "node:fs/promises";
import { createServer } from "node:net";
import { basename, join } from "node:path";

export interface StackMetadata {
	mode?: "dev" | "preview";
	worktreeName: string;
	projectName: string;
	root: string;
	dir: string;
	ports: {
		api: number;
		web: number;
		postgres: number;
	};
	urls: {
		api: string;
		web: string;
	};
	databaseUrl: string;
	pids: {
		api?: number;
		web?: number;
	};
	logs: {
		api: string;
		web: string;
	};
	startedAt: string;
}

export function getRoot() {
	return execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf-8" }).trim();
}

export function getStackPaths(root = getRoot()) {
	const worktreeName = basename(root);
	const hash = createHash("sha256").update(root).digest("hex").slice(0, 8);
	const dir = join(root, ".stack", `${worktreeName}-${hash}`);
	return {
		root,
		worktreeName,
		hash,
		projectName: `aft-${worktreeName}-${hash}`,
		dir,
		metadataPath: join(dir, "metadata.json"),
		logDir: join(dir, "logs"),
	};
}

export function readMetadata(): StackMetadata | null {
	const { metadataPath } = getStackPaths();
	if (!existsSync(metadataPath)) return null;
	return JSON.parse(readFileSync(metadataPath, "utf-8")) as StackMetadata;
}

export function writeMetadata(metadata: StackMetadata) {
	mkdirSync(metadata.dir, { recursive: true });
	mkdirSync(join(metadata.dir, "logs"), { recursive: true });
	writeFileSync(join(metadata.dir, "metadata.json"), `${JSON.stringify(metadata, null, 2)}\n`);
}

export async function findFreePort(start: number) {
	for (let port = start; port < start + 1000; port++) {
		if (await isPortFree(port)) return port;
	}
	throw new Error(`No free port found starting at ${start}.`);
}

async function isPortFree(port: number) {
	return new Promise<boolean>((resolve) => {
		const server = createServer();
		server.once("error", () => resolve(false));
		server.once("listening", () => {
			server.close(() => resolve(true));
		});
		server.listen(port, "127.0.0.1");
	});
}

export function computePortSeeds(hash: string) {
	const offset = Number.parseInt(hash.slice(0, 4), 16) % 1000;
	return {
		web: 3000 + offset,
		api: 4000 + offset,
		postgres: 5500 + offset,
	};
}

export function runCommand(command: string, args: string[], env: NodeJS.ProcessEnv = {}) {
	const result = spawnSync(command, args, {
		cwd: getRoot(),
		env: { ...process.env, ...env },
		stdio: "inherit",
	});
	if (result.status !== 0) {
		throw new Error(
			`${command} ${args.join(" ")} failed with exit code ${result.status ?? "unknown"}.`,
		);
	}
}

export async function spawnLogged(
	command: string,
	args: string[],
	logPath: string,
	env: NodeJS.ProcessEnv = {},
) {
	const logFile = await open(logPath, "a");
	const child = spawn(command, args, {
		cwd: getRoot(),
		detached: true,
		env: { ...process.env, ...env },
		stdio: ["ignore", logFile.fd, logFile.fd],
	});
	child.unref();
	await logFile.close();
	return child.pid;
}

export async function waitForHttp(url: string, timeoutMs: number) {
	const started = Date.now();
	let lastError: unknown;

	while (Date.now() - started < timeoutMs) {
		try {
			const response = await fetch(url);
			if (response.ok) return;
			lastError = new Error(`${url} returned HTTP ${response.status}`);
		} catch (err) {
			lastError = err;
		}
		await new Promise((resolve) => setTimeout(resolve, 500));
	}

	throw new Error(`Timed out waiting for ${url}: ${String(lastError)}`);
}

export function isProcessAlive(pid: number | undefined) {
	if (!pid) return false;
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}

export function killProcess(pid: number | undefined) {
	if (!pid || !isProcessAlive(pid)) return;
	try {
		process.kill(-pid, "SIGTERM");
	} catch {
		try {
			process.kill(pid, "SIGTERM");
		} catch {
			// Already gone.
		}
	}
}
