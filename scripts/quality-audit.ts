import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DOMAIN_LAYERS = ["types", "config", "repo", "service", "runtime", "ui"];
const domainsDir = join(process.cwd(), "src/domains");

if (!existsSync(domainsDir)) {
	console.log("No domains found.");
	process.exit(0);
}

for (const domain of readdirSync(domainsDir, { withFileTypes: true }).filter((entry) =>
	entry.isDirectory(),
)) {
	console.log(`domain: ${domain.name}`);
	for (const layer of DOMAIN_LAYERS) {
		const layerDir = join(domainsDir, domain.name, layer);
		const sourceFiles = existsSync(layerDir)
			? readdirSync(layerDir).filter((file) => /\.(ts|tsx)$/.test(file) && !file.includes(".test."))
			: [];
		const testFiles = existsSync(layerDir)
			? readdirSync(layerDir).filter((file) => /\.(test|integration\.test)\.(ts|tsx)$/.test(file))
			: [];
		console.log(`  ${layer}: ${sourceFiles.length} source, ${testFiles.length} test`);
	}
}
