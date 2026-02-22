/**
 * Custom Architectural Linter
 *
 * Enforces the layered dependency rules defined in ARCHITECTURE.md.
 * Run via: pnpm lint (or directly: tsx lints/check-deps.ts)
 *
 * Rules enforced:
 * 1. No backward imports within a domain (Types → Config → Repo → Service → Runtime → UI)
 * 2. No cross-domain imports below the service layer
 * 3. No direct cross-cutting imports (must go through providers)
 * 4. Max file size: 300 lines
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const LAYER_ORDER = ["types", "config", "repo", "service", "runtime", "ui"] as const;
type Layer = (typeof LAYER_ORDER)[number];

const LAYER_INDEX = Object.fromEntries(LAYER_ORDER.map((l, i) => [l, i])) as Record<Layer, number>;

const MAX_FILE_LINES = 300;

const BANNED_DIRECT_IMPORTS = [
	"pino", // Use @providers/telemetry
	"@opentelemetry", // Use @providers/telemetry
];

interface Violation {
	file: string;
	line: number;
	rule: string;
	message: string;
	fix: string;
}

const violations: Violation[] = [];

function getLayer(filePath: string): Layer | null {
	const parts = filePath.split(sep);
	const domainIdx = parts.indexOf("domains");
	if (domainIdx === -1 || domainIdx + 2 >= parts.length) return null;
	const layer = parts[domainIdx + 2] as Layer;
	return LAYER_ORDER.includes(layer) ? layer : null;
}

function getDomain(filePath: string): string | null {
	const parts = filePath.split(sep);
	const domainIdx = parts.indexOf("domains");
	if (domainIdx === -1 || domainIdx + 1 >= parts.length) return null;
	return parts[domainIdx + 1];
}

function walkTs(dir: string): string[] {
	const results: string[] = [];
	try {
		for (const entry of readdirSync(dir, { withFileTypes: true })) {
			const full = join(dir, entry.name);
			if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== "dist") {
				results.push(...walkTs(full));
			} else if (
				entry.isFile() &&
				/\.tsx?$/.test(entry.name) &&
				!entry.name.endsWith(".d.ts") &&
				!entry.name.endsWith(".d.tsx")
			) {
				results.push(full);
			}
		}
	} catch {
		// skip unreadable dirs
	}
	return results;
}

function checkFile(filePath: string) {
	const content = readFileSync(filePath, "utf-8");
	const lines = content.split("\n");
	const rel = relative(process.cwd(), filePath);

	// Rule: Max file size
	if (lines.length > MAX_FILE_LINES) {
		violations.push({
			file: rel,
			line: MAX_FILE_LINES,
			rule: "max-file-size",
			message: `File has ${lines.length} lines (max ${MAX_FILE_LINES}).`,
			fix: "Split this file into smaller, focused modules. Each file should contain one concept.",
		});
	}

	const sourceLayer = getLayer(filePath);
	const sourceDomain = getDomain(filePath);

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const importMatch = line.match(/(?:import|from)\s+['"]([^'"]+)['"]/);
		if (!importMatch) continue;

		const importPath = importMatch[1];

		// Rule: No direct cross-cutting imports (providers are exempt — they wrap these)
		const isProvider = rel.includes(`providers${sep}`) || rel.includes("providers/");
		for (const banned of BANNED_DIRECT_IMPORTS) {
			if (importPath.startsWith(banned) && !isProvider) {
				violations.push({
					file: rel,
					line: i + 1,
					rule: "no-direct-crosscutting",
					message: `Direct import of '${banned}' is not allowed in domain code.`,
					fix: `Import from '@providers/telemetry' instead. This ensures consistent logging/tracing configuration across the codebase.`,
				});
			}
		}

		if (!sourceLayer || !sourceDomain) continue;

		// Check imports of other domain layers
		const targetDomainMatch = importPath.match(/@domains\/([^/]+)\/([^/]+)/);
		if (targetDomainMatch) {
			const [, targetDomain, targetLayerStr] = targetDomainMatch;
			const targetLayer = targetLayerStr as Layer;

			if (!LAYER_ORDER.includes(targetLayer)) continue;

			// Rule: No backward imports
			if (targetDomain === sourceDomain && LAYER_INDEX[targetLayer] > LAYER_INDEX[sourceLayer]) {
				violations.push({
					file: rel,
					line: i + 1,
					rule: "no-backward-import",
					message: `'${sourceLayer}' layer cannot import from '${targetLayer}' layer (backward dependency).`,
					fix: "The dependency direction is: Types → Config → Repo → Service → Runtime → UI. Move shared logic to a lower layer, or pass it as a parameter from a higher layer.",
				});
			}

			// Rule: No cross-domain imports below service layer
			if (targetDomain !== sourceDomain && LAYER_INDEX[sourceLayer] < LAYER_INDEX.service) {
				violations.push({
					file: rel,
					line: i + 1,
					rule: "no-cross-domain-low-layer",
					message: `Cross-domain import from '${sourceLayer}' layer is not allowed. Cross-domain communication must happen at the 'service' layer or above.`,
					fix: `Move this logic to the service layer of '${sourceDomain}' domain, then import '${targetDomain}' types/services there.`,
				});
			}
		}
	}
}

// Run
const srcDir = join(process.cwd(), "src");
try {
	const files = walkTs(srcDir);
	for (const file of files) {
		checkFile(file);
	}
} catch {
	// src/ may not exist yet in a fresh template
}

if (violations.length > 0) {
	console.error(`\n❌ ${violations.length} architectural violation(s) found:\n`);
	for (const v of violations) {
		console.error(`  ${v.file}:${v.line}`);
		console.error(`    Rule: ${v.rule}`);
		console.error(`    ${v.message}`);
		console.error(`    Fix: ${v.fix}\n`);
	}
	process.exit(1);
} else {
	console.log("✅ No architectural violations found.");
}
