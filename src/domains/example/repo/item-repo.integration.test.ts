import { closeDb, getDb } from "@providers/database/index.js";
import { sql } from "drizzle-orm";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { itemRepo } from "./item-repo.js";

const runDbTests = Boolean(process.env.DATABASE_URL);

describe.skipIf(!runDbTests)("itemRepo integration", () => {
	beforeEach(async () => {
		await getDb().execute(sql`TRUNCATE TABLE items`);
	});

	afterAll(async () => {
		await closeDb();
	});

	it("creates, lists, finds, and deletes items in Postgres", async () => {
		const created = await itemRepo.create({ name: "Harness Item", status: "draft" });

		expect(created.id).toMatch(/[0-9a-f-]{36}/);
		expect(created.name).toBe("Harness Item");

		await expect(itemRepo.findById(created.id)).resolves.toMatchObject({
			id: created.id,
			name: "Harness Item",
		});

		await expect(itemRepo.findAll()).resolves.toHaveLength(1);
		await expect(itemRepo.delete(created.id)).resolves.toBe(true);
		await expect(itemRepo.findAll()).resolves.toHaveLength(0);
	});
});
