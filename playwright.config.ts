import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests/e2e",
	outputDir: "test-results",
	reporter: process.env.CI
		? [["line"], ["html", { open: "never" }]]
		: [["list"], ["html", { open: "never" }]],
	retries: process.env.CI ? 1 : 0,
	use: {
		baseURL: requiredEnv("WEB_URL"),
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

function requiredEnv(name: string) {
	const value = process.env[name];
	if (!value) {
		throw new Error(`${name} is required. Run e2e through pnpm test:e2e or pnpm test.`);
	}
	return value;
}
