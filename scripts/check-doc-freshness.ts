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
const staleDaysMs = STALE_DAYS * 24 * 60 * 60 * 1000;
const now = new Date();

for (const match of content.matchAll(linkRegex)) {
	const [, label, href] = match;
	if (href.startsWith("http")) continue;

	const resolved = join(dirname(CATALOG_PATH), href);
	if (!existsSync(resolved)) {
		warnings.push(`❌ Broken link: "${label}" → ${href} (file not found)`);
	}
}

if (content.includes("YYYY-MM-DD")) {
	warnings.push("❌ Placeholder date found: replace YYYY-MM-DD with a real Last Verified date");
}

for (const line of content.split("\n")) {
	const dateMatch = line.match(/\|\s*(\d{4}-\d{2}-\d{2})\s*\|$/);
	if (!dateMatch) continue;

	const date = new Date(`${dateMatch[1]}T00:00:00Z`);
	if (Number.isNaN(date.valueOf())) {
		warnings.push(`❌ Invalid Last Verified date: ${dateMatch[1]}`);
		continue;
	}
	if (date > now) {
		warnings.push(`❌ Future Last Verified date: ${dateMatch[1]}`);
		continue;
	}
	if (now.getTime() - date.getTime() > staleDaysMs) {
		warnings.push(`❌ Stale Last Verified date: ${dateMatch[1]} is older than ${STALE_DAYS} days`);
	}
}

if (warnings.length > 0) {
	console.error(`\n⚠️  ${warnings.length} doc issue(s) found:\n`);
	for (const w of warnings) {
		console.error(`  ${w}`);
	}
	process.exit(1);
} else {
	console.log("✅ Catalog links and verification dates valid.");
}
