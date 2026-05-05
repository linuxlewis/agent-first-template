/**
 * Custom Architectural Linter
 *
 * Enforces the layered dependency rules defined in docs/architecture.md.
 * Run via: pnpm lint (or directly: tsx lints/check-deps.ts)
 *
 * Rules enforced:
 * 1. No backward imports within a domain (Types → Config → Repo → Service → Runtime → UI)
 * 2. No cross-domain imports below the service layer
 * 3. No direct cross-cutting imports (must go through providers)
 * 4. No useEffect in application source
 * 5. Max file size: 300 lines
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, dirname, extname, join, relative, sep } from "node:path";

const LAYER_ORDER = ["types", "config", "repo", "service", "runtime", "ui"] as const;
type Layer = (typeof LAYER_ORDER)[number];

const LAYER_INDEX = Object.fromEntries(LAYER_ORDER.map((l, i) => [l, i])) as Record<Layer, number>;

const MAX_FILE_LINES = 300;

const BANNED_DIRECT_IMPORTS = [
	"pino", // Use @providers/telemetry
	"@opentelemetry", // Use @providers/telemetry
];

const ENTRYPOINT_FILES = new Set(["src/server.ts", "src/app/main.tsx", "src/app/vite.config.ts"]);

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

	if (isSourceModuleRequiringTest(rel) && !hasColocatedTest(filePath)) {
		violations.push({
			file: rel,
			line: 1,
			rule: "co-located-test-required",
			message: "Source module does not have a co-located test.",
			fix: "Add a focused foo.test.ts, foo.test.tsx, or foo.integration.test.ts next to this file. Tests are part of the agent feedback loop.",
		});
	}

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (isAppSource(rel) && /\bconsole\.(log|info|warn|error|debug|trace)\b/.test(line)) {
			violations.push({
				file: rel,
				line: i + 1,
				rule: "no-console",
				message: "Application code must not write directly to console.",
				fix: "Use the structured logger from src/providers/telemetry so stack logs are queryable.",
			});
		}

		if (isAppSource(rel) && /\buseEffect\b/.test(line)) {
			violations.push({
				file: rel,
				line: i + 1,
				rule: "no-use-effect",
				message: "React useEffect is not allowed in application source.",
				fix: "Use event handlers, TanStack Query, derived render state, or explicit state transitions instead. See docs/react.md.",
			});
		}

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

function isTestFile(rel: string) {
	return /\.(test|integration\.test)\.tsx?$/.test(rel);
}

function isAppSource(rel: string) {
	return rel.startsWith("src/") && !isTestFile(rel);
}

function isSourceModuleRequiringTest(rel: string) {
	if (!isAppSource(rel)) return false;
	if (ENTRYPOINT_FILES.has(rel)) return false;
	if (basename(rel) === "index.ts") return false;
	return /\.(ts|tsx)$/.test(rel);
}

function hasColocatedTest(filePath: string) {
	const dir = dirname(filePath);
	const ext = extname(filePath);
	const stem = basename(filePath, ext);
	const candidates = [
		`${stem}.test.ts`,
		`${stem}.test.tsx`,
		`${stem}.integration.test.ts`,
		`${stem}.integration.test.tsx`,
	];
	return candidates.some((candidate) => existsSync(join(dir, candidate)));
}

function checkDomainShape(srcDir: string) {
	const domainsDir = join(srcDir, "domains");
	if (!existsSync(domainsDir)) return;

	for (const entry of readdirSync(domainsDir, { withFileTypes: true })) {
		if (!entry.isDirectory()) continue;
		for (const layer of LAYER_ORDER) {
			const layerDir = join(domainsDir, entry.name, layer);
			if (!existsSync(layerDir)) {
				violations.push({
					file: relative(process.cwd(), join(domainsDir, entry.name)),
					line: 1,
					rule: "required-domain-layer",
					message: `Domain '${entry.name}' is missing required '${layer}' layer directory.`,
					fix: `Create src/domains/${entry.name}/${layer}/ so agents can rely on the standard Types -> Config -> Repo -> Service -> Runtime -> UI shape.`,
				});
			}
		}
	}
}

// Run
const srcDir = join(process.cwd(), "src");
try {
	checkDomainShape(srcDir);
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
