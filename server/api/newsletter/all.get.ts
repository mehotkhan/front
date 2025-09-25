import { drizzle } from "drizzle-orm/d1";
import { sql } from "drizzle-orm/sql";
import { z } from "h3-zod";

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event);

  // Optional permission gate (if admin-only)
  if (await denies(event, readDashboard)) {
    throw createError({
      statusCode: 403,
      statusMessage: t(
        "Forbidden: You do not have permission to view subscriptions."
      ),
    });
  }

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
      email: z.string().optional(),
    });

    const query = getQuery(event);
    const { page, pageSize, email } = querySchema.parse(query);

    const currentPage = page ?? 1;
    const currentPageSize = pageSize ?? 10;
    const offset = (currentPage - 1) * currentPageSize;

    const { DB } = event.context.cloudflare.env;
    const db = drizzle(DB);

    // Total count query
    let countQuery = db.select({ count: sql`COUNT(*)` }).from(newsletter);
    if (email) {
      countQuery = countQuery.where(sql`email LIKE ${`%${email}%`}`);
    }
    const totalResult = await countQuery;
    const total = Number(totalResult[0].count);

    // Fetch paginated records
    let selectQuery = db
      .select()
      .from(newsletter)
      .orderBy(newsletter.createdAt)
      .limit(currentPageSize)
      .offset(offset);

    if (email) {
      selectQuery = selectQuery.where(sql`email LIKE ${`%${email}%`}`);
    }

    const subscriptions = await selectQuery;

    return {
      total,
      page: currentPage,
      pageSize: currentPageSize,
      subscriptions,
    };
  } catch (error: any) {
    console.error("Error fetching newsletter subscriptions:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || t("Internal Server Error"),
    });
  }
});
