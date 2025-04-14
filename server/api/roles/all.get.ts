import { drizzle } from "drizzle-orm/d1";
import { sql } from "drizzle-orm/sql";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event);

  try {
    // Define Zod schema for query parameters
    const querySchema = z.object({
      page: z
        .string()
        .optional()
        .transform((val) => (val ? Number(val) : 1))
        .refine((val) => val >= 1, t("Page must be at least 1")),
      pageSize: z
        .string()
        .optional()
        .transform((val) => (val ? Number(val) : 5))
        .refine((val) => val >= 1, t("Page size must be at least 1")),
    });

    // Read and validate query parameters
    const query = getQuery(event);
    const parsedQuery = querySchema.safeParse(query);
    if (!parsedQuery.success) {
      throw createError({
        statusCode: 400,
        statusMessage: parsedQuery.error.message,
      });
    }

    const { page, pageSize } = parsedQuery.data;
    const offset = (page - 1) * pageSize;

    const { DB } = event.context.cloudflare.env;
    const drizzleDb = drizzle(DB);

    // Get total count of roles
    const totalResult = await drizzleDb
      .select({ count: sql`COUNT(*)` })
      .from(roles);
    const total = Number(totalResult[0].count);

    // Get paginated roles
    const allRoles = await drizzleDb
      .select()
      .from(roles)
      .limit(pageSize)
      .offset(offset);

    // Return the pagination meta and roles array
    return {
      total,
      page,
      pageSize,
      roles: allRoles,
    };
  } catch (error: any) {
    console.error("Error fetching roles:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || t("Internal Server Error"),
    });
  }
});
