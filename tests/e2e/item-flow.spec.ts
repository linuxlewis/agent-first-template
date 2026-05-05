import { expect, test } from "@playwright/test";

const apiOrigin = requiredEnv("API_ORIGIN");

test.beforeEach(async ({ request }) => {
	const response = await request.get(`${apiOrigin}/api/items`);
	expect(response.ok()).toBe(true);
	for (const item of await response.json()) {
		await request.delete(`${apiOrigin}/api/items/${item.id}`);
	}
});

test("creates, reloads, and deletes an item through the UI", async ({ page }) => {
	await page.goto("/");
	await expect(page.getByText("No items yet. Create one above.")).toBeVisible();

	await page.getByPlaceholder("New item name...").fill("Browser Harness Item");
	await page.getByRole("button", { name: "Add" }).click();

	await expect(page.getByText("Browser Harness Item")).toBeVisible();
	await page.reload();
	await expect(page.getByText("Browser Harness Item")).toBeVisible();

	await page.getByRole("button", { name: "Delete" }).click();
	await expect(page.getByText("No items yet. Create one above.")).toBeVisible();
});

test("shows an error when the item API fails", async ({ page }) => {
	await page.route("**/api/items", async (route) => {
		await route.fulfill({ status: 503, body: "service unavailable" });
	});

	await page.goto("/");
	await expect(page.getByText("HTTP 503")).toBeVisible();
});

function requiredEnv(name: string) {
	const value = process.env[name];
	if (!value) {
		throw new Error(`${name} is required. Run e2e through pnpm test:e2e or pnpm test.`);
	}
	return value;
}
