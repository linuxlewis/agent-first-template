import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		include: ["src/**/*.test.ts"],
	},
	resolve: {
		alias: {
			"@domains": "./src/domains",
			"@providers": "./src/providers",
		},
	},
});
