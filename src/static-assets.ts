import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import { extname, join, normalize, relative, resolve, sep } from "node:path";
import type { FastifyInstance } from "fastify";

const CONTENT_TYPES: Record<string, string> = {
	".css": "text/css; charset=utf-8",
	".html": "text/html; charset=utf-8",
	".ico": "image/x-icon",
	".js": "text/javascript; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".map": "application/json; charset=utf-8",
	".png": "image/png",
	".svg": "image/svg+xml",
	".webp": "image/webp",
};

export function registerStaticAssetFallback(app: FastifyInstance, staticRoot: string) {
	const root = resolve(staticRoot);

	app.setNotFoundHandler(async (request, reply) => {
		if (request.url.startsWith("/api/")) {
			return reply.status(404).send({ error: "Not found" });
		}

		const requested = getAssetPath(root, request.url);
		const filePath = requested && (await isFile(requested)) ? requested : join(root, "index.html");

		if (!(await isFile(filePath))) {
			return reply.status(404).send({ error: "Not found" });
		}

		return reply
			.type(CONTENT_TYPES[extname(filePath)] ?? "application/octet-stream")
			.send(createReadStream(filePath));
	});
}

function getAssetPath(root: string, url: string) {
	const pathname = new URL(url, "http://localhost").pathname;
	const decoded = decodeURIComponent(pathname);
	const normalized = normalize(decoded).replace(/^[/\\]+/, "");
	const candidate = resolve(root, normalized || "index.html");
	const relativePath = relative(root, candidate);

	if (relativePath.startsWith("..") || relativePath === ".." || relativePath.includes(`..${sep}`)) {
		return null;
	}

	return candidate;
}

async function isFile(path: string) {
	try {
		await access(path);
		return (await stat(path)).isFile();
	} catch {
		return false;
	}
}
