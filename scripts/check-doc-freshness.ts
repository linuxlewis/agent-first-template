/**
 * Documentation checker
 *
 * Validates local Markdown links in the repository docs.
 * Run via: pnpm check:docs
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, extname, join, normalize, relative } from "node:path";

const DOC_ROOTS = ["AGENTS.md", "README.md", "docs"];
const markdownFiles = DOC_ROOTS.flatMap((entry) => collectMarkdown(join(process.cwd(), entry)));
const warnings: string[] = [];

for (const file of markdownFiles) {
	const content = readFileSync(file, "utf-8");
	const linkRegex = /\[[^\]]+\]\(([^)]+)\)/g;

	for (const match of content.matchAll(linkRegex)) {
		const href = match[1];
		if (shouldSkip(href)) continue;

		const [pathPart] = href.split("#");
		if (!pathPart) continue;

		const resolved = normalize(join(dirname(file), pathPart));
		if (!existsSync(resolved)) {
			warnings.push(`${relative(process.cwd(), file)} links to missing file: ${href}`);
		}
	}
}

if (warnings.length > 0) {
	console.error(`\n${warnings.length} doc issue(s) found:\n`);
	for (const warning of warnings) {
		console.error(`  - ${warning}`);
	}
	process.exit(1);
}

console.log(`Checked ${markdownFiles.length} Markdown files. Local links are valid.`);

function collectMarkdown(path: string): string[] {
	if (!existsSync(path)) return [];
	const statEntries = readdirSafe(path);
	if (!statEntries) {
		return extname(path) === ".md" ? [path] : [];
	}

	return statEntries.flatMap((entry) => {
		const child = join(path, entry.name);
		if (entry.isDirectory()) return collectMarkdown(child);
		return entry.isFile() && extname(entry.name) === ".md" ? [child] : [];
	});
}

function readdirSafe(path: string) {
	try {
		return readdirSync(path, { withFileTypes: true });
	} catch {
		return null;
	}
}

function shouldSkip(href: string) {
	return (
		href.startsWith("http://") ||
		href.startsWith("https://") ||
		href.startsWith("mailto:") ||
		href.startsWith("#")
	);
}
