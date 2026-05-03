import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests/e2e",
	outputDir: "test-results",
	reporter: process.env.CI
		? [["line"], ["html", { open: "never" }]]
		: [["list"], ["html", { open: "never" }]],
	retries: process.env.CI ? 1 : 0,
	use: {
		baseURL: process.env.WEB_URL ?? "http://127.0.0.1:3000",
		trace: "retain-on-failure",
		screenshot: "only-on-failure",
		video: "retain-on-failure",
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
});
