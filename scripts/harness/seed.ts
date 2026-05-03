import { sql } from "drizzle-orm";
import { itemRepo } from "../../src/domains/example/repo/item-repo.js";
import { closeDb, getDb } from "../../src/providers/database/index.js";
import { readMetadata } from "./shared.js";

const metadata = readMetadata();
if (metadata && !process.env.DATABASE_URL) {
	process.env.DATABASE_URL = metadata.databaseUrl;
}

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL is required. Run pnpm harness:boot before seeding.");
}

try {
	await getDb().execute(sql`TRUNCATE TABLE items`);
	const item = await itemRepo.create({ name: "Seed Harness Item", status: "draft" });
	console.log(`seeded item ${item.id}`);
} finally {
	await closeDb();
}
