import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
	build: {
		emptyOutDir: false,
		outDir: resolve(__dirname, "../dist/server"),
		rollupOptions: {
			input: {
				"db-migrate": resolve(__dirname, "../scripts/db-migrate.ts"),
				"prod-server": resolve(__dirname, "prod-server.ts"),
			},
			output: {
				entryFileNames: "[name].mjs",
			},
		},
		ssr: true,
		target: "node24",
	},
	resolve: {
		alias: {
			"@domains": resolve(__dirname, "domains"),
			"@providers": resolve(__dirname, "providers"),
		},
	},
});
