import { drizzle } from "drizzle-orm/d1";
import { sql } from "drizzle-orm/sql";
import { z } from "h3-zod";

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event);

  try {
    const querySchema = z.object({
      page: z
        .coerce
        .number({ invalid_type_error: t("Page must be at least 1") })
        .int()
        .min(1, t("Page must be at least 1"))
        .optional(),
      pageSize: z
        .coerce
        .number({ invalid_type_error: t("Page size must be at least 1") })
        .int()
        .min(1, t("Page size must be at least 1"))
        .optional(),
    });

    const query = getQuery(event);
    const { page, pageSize } = querySchema.parse(query);

    const currentPage = page ?? 1;
    const currentPageSize = pageSize ?? 5;
    const offset = (currentPage - 1) * currentPageSize;

    const { DB } = event.context.cloudflare.env;
    const drizzleDb = drizzle(DB);

    // Query the total count of users
    const totalResult = await drizzleDb
      .select({ count: sql`COUNT(*)` })
      .from(users);
    const total = Number(totalResult[0].count);

    // Query paginated users
    const allUsers = await drizzleDb
      .select()
      .from(users)
      .limit(currentPageSize)
      .offset(offset);

    // Remove sensitive fields such as password
    const safeUsers = allUsers.map(({ password, ...user }) => user);

    return {
      total,
      page: currentPage,
      pageSize: currentPageSize,
      users: safeUsers,
    };
  } catch (error: any) {
    console.error("Error fetching users:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || t("Internal Server Error"),
    });
  }
});
