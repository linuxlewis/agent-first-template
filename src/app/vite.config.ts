import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],
	root: resolve(__dirname),
	resolve: {
		alias: {
			"@domains": resolve(__dirname, "../domains"),
			"@providers": resolve(__dirname, "../providers"),
		},
	},
	server: {
		port: 3000,
		proxy: {
			"/api": {
				target: "http://localhost:4000",
				changeOrigin: true,
			},
		},
	},
	build: {
		outDir: resolve(__dirname, "../../dist/app"),
	},
});
