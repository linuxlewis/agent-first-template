import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import postgres from "postgres";

const migrationsDir = join(process.cwd(), "migrations");
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error("DATABASE_URL is required to run migrations.");
}

const sql = postgres(databaseUrl, { max: 1 });

try {
	await sql`
		CREATE TABLE IF NOT EXISTS schema_migrations (
			name text PRIMARY KEY,
			applied_at timestamptz NOT NULL DEFAULT now()
		)
	`;

	const files = (await readdir(migrationsDir)).filter((file) => file.endsWith(".sql")).sort();

	for (const file of files) {
		const applied = await sql<{ name: string }[]>`
			SELECT name FROM schema_migrations WHERE name = ${file}
		`;
		if (applied.length > 0) continue;

		const statement = await readFile(join(migrationsDir, file), "utf-8");
		await sql.begin(async (tx) => {
			await tx.unsafe(statement);
			await tx`INSERT INTO schema_migrations (name) VALUES (${file})`;
		});
		console.log(`applied migration ${file}`);
	}
} finally {
	await sql.end();
}
