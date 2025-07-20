import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import { z } from "h3-zod";

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event);
  const db: D1Database = event.context.cloudflare.env.DB;
  const drizzleDb = drizzle(db);
  const appConfig = useAppConfig(event);

  // Check if app is installed
  if (appConfig.installed) {
    throw createError({
      statusCode: 403,
      message: t("Application is already installed"),
    });
  }

  // Define Zod schema for role validation
  const RoleSchema = z.array(
    z.object({
      name: z.string().min(1, t("Role name must not be empty")),
      description: z.string().min(1, t("Role description must not be empty")),
      permissions: z.array(z.string()),
    })
  );

  try {
    // Validate roles data
    const body = await readBody(event);
    const roles = RoleSchema.parse(body.roles);

    // Test database connection and insert roles
    const { results } = await db.prepare("SELECT 1 as result").all();
    const isConnected = Boolean(results?.length);

    if (isConnected && roles.length > 0) {
      // Insert roles into the database
      for (const role of roles) {
        await drizzleDb
          .insert(roles)
          .values({
            name: role.name,
            description: role.description,
            permissions: JSON.stringify(role.permissions),
          })
          .execute();
      }
    }

    return {
      dbConnected: isConnected,
      rolesInserted: isConnected ? roles.length : 0,
      message: isConnected
        ? t("Database connection is working and roles have been inserted.")
        : t("Database connection is not working."),
    };
  } catch (error: unknown) {
    console.error("Database loading error:", error);
    const errorMessage = error instanceof Error ? error.message : t("Invalid roles data or database error");
    return {
      dbConnected: false,
      rolesInserted: 0,
      message: t("Error: ") + errorMessage,
    };
  }
});
