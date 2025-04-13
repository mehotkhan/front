import type { D1Database } from "@cloudflare/workers-types";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event);
  const d1: D1Database = event.context.cloudflare.env.DB;

  try {
    // Define Zod schema for query parameters (optional, as none are used)
    const querySchema = z.object({}).optional();

    // Read and validate query parameters
    const query = getQuery(event);
    const parsedQuery = querySchema.safeParse(query);
    if (!parsedQuery.success) {
      throw createError({
        statusCode: 400,
        statusMessage: parsedQuery.error.message,
      });
    }

    // Perform a simple query to verify that the database connection is working
    const result = await d1.prepare("SELECT 1 as result").all();

    const connected = Boolean(
      result && result.results && result.results.length > 0
    );
    return {
      dbConnected: connected,
      message: connected
        ? t("Database connection is working.")
        : t("Database connection is not working."),
    };
  } catch (error: any) {
    return {
      dbConnected: false,
      message: t("Error checking database connection: ") + error.message,
    };
  }
});
