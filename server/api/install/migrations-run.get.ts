import { z } from "h3-zod";
import { sha256 } from "@noble/hashes/sha2";
import { bytesToHex } from "@noble/hashes/utils";

async function computeHash(data: string): Promise<string> {
  const hash = await sha256(data);
  return bytesToHex(hash);
}

async function ensureMigrationsTable(db: D1Database) {
  // Use a single-line string without a trailing semicolon.
  await db.exec(
    "CREATE TABLE IF NOT EXISTS __drizzle_migrations (id INTEGER PRIMARY KEY, hash TEXT NOT NULL, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"
  );
}

async function getAppliedMigrations(db: D1Database): Promise<string[]> {
  const { results } = await db
    .prepare("SELECT hash FROM __drizzle_migrations")
    .all();
  return results ? results.map((row: any) => row.hash) : [];
}

async function applyMigration(db: D1Database, content: string): Promise<void> {
  if (!content.trim()) {
    throw new Error("Migration content is empty or malformed.");
  }

  const statements = content
    .split(/;|\-\-\> statement-breakpoint/)
    .map((stmt) => stmt.trim())
    .filter(Boolean);

  for (const stmt of statements) {
    try {
      await db.prepare(stmt).run();
    } catch (error) {
      console.error("Error executing SQL statement:", stmt, error);
      throw error;
    }
  }
}

async function markMigrationAsApplied(
  db: D1Database,
  hash: string
): Promise<void> {
  await db
    .prepare("INSERT INTO __drizzle_migrations (hash) VALUES (?)")
    .bind(hash)
    .run();
}

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event);

  // Get D1 database from Cloudflare environment
  const db = event.context.cloudflare?.env?.DB;

  // Define Zod schema for migrations
  const schema = z.object({
    migrations: z.array(z.string().min(1, t("Migration name must not be empty"))),
  });

  try {
    // Read and validate the body
    const body = await readBody(event);
    const { migrations } = schema.parse(body);

    if (!db) {
      console.warn("No D1 database found in environment; skipping migrations.");
      throw createError({
        statusCode: 500,
        message: t("Database connection is not configured."),
      });
    }

    await ensureMigrationsTable(db);

    // Process each migration
    for (const migration of migrations) {
      const migrationHash = await computeHash(migration);
      
      // Check if migration already applied
      const existingMigration = await db
        .prepare("SELECT id FROM __drizzle_migrations WHERE hash = ?")
        .bind(migrationHash)
        .first();

      if (!existingMigration) {
        // Apply migration
        await db.prepare(migration).run();
        
        // Record migration
        await db
          .prepare("INSERT INTO __drizzle_migrations (hash, applied_at) VALUES (?, ?)")
          .bind(migrationHash, new Date().toISOString())
          .run();
      }
    }

    return {
      success: true,
      message: t("All pending migrations applied successfully."),
    };
  } catch (error: unknown) {
    console.error("Migrations run error:", error);
    const errorMessage = error instanceof Error ? error.message : t("Migrations run failed");
    throw createError({
      statusCode: 400,
      statusMessage: errorMessage,
    });
  }
});
