import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		include: [
			"src/**/*.test.ts",
			"src/**/*.test.tsx",
			"src/**/*.integration.test.ts",
			"src/**/*.integration.test.tsx",
		],
	},
	resolve: {
		alias: {
			"@domains": resolve(__dirname, "src/domains"),
			"@providers": resolve(__dirname, "src/providers"),
		},
	},
});
