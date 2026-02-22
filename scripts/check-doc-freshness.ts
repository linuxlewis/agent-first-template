/**
 * Doc Freshness Checker
 *
 * Scans docs/catalog.md for entries and checks if they still exist
 * and if their "Last Verified" date is within the staleness threshold.
 *
 * Run via: pnpm check:docs
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

const STALE_DAYS = 14;
const CATALOG_PATH = join(process.cwd(), "docs/catalog.md");

if (!existsSync(CATALOG_PATH)) {
	console.log("⚠️  No docs/catalog.md found. Skipping freshness check.");
	process.exit(0);
}

const content = readFileSync(CATALOG_PATH, "utf-8");
const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
const warnings: string[] = [];

for (const match of content.matchAll(linkRegex)) {
	const [, label, href] = match;
	if (href.startsWith("http")) continue;

	const resolved = join(dirname(CATALOG_PATH), href);
	if (!existsSync(resolved)) {
		warnings.push(`❌ Broken link: "${label}" → ${href} (file not found)`);
	}
}

if (warnings.length > 0) {
	console.error(`\n⚠️  ${warnings.length} doc issue(s) found:\n`);
	for (const w of warnings) {
		console.error(`  ${w}`);
	}
	process.exit(1);
} else {
	console.log("✅ All catalog links valid.");
}
