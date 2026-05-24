import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	plugins: [
		react(),
		VitePWA({
			registerType: "autoUpdate",
			includeAssets: ["favicon.ico", "logo.svg", "apple-touch-icon-180x180.png", "robots.txt"],
			manifest: {
				name: "Agent-First Template",
				short_name: "Agent First",
				description: "A full-stack TypeScript template for agent-first product development.",
				theme_color: "#111827",
				background_color: "#ffffff",
				display: "standalone",
				start_url: "/",
				icons: [
					{
						src: "pwa-64x64.png",
						sizes: "64x64",
						type: "image/png",
					},
					{
						src: "pwa-192x192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "pwa-512x512.png",
						sizes: "512x512",
						type: "image/png",
					},
					{
						src: "maskable-icon-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "maskable",
					},
				],
			},
			workbox: {
				cleanupOutdatedCaches: true,
				navigateFallbackDenylist: [/^\/api\//],
			},
		}),
	],
	root: resolve(__dirname),
	resolve: {
		alias: {
			"@domains": resolve(__dirname, "../domains"),
			"@providers": resolve(__dirname, "../providers"),
		},
	},
	server: {
		port: 3000,
		proxy: apiProxy(),
	},
	preview: {
		proxy: apiProxy(),
	},
	build: {
		emptyOutDir: true,
		outDir: resolve(__dirname, "../../dist/app"),
	},
});

function apiProxy() {
	return {
		"/api": {
			target: process.env.API_ORIGIN ?? "http://localhost:4000",
			changeOrigin: true,
		},
	};
}
