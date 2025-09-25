import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { sql } from "drizzle-orm/sql";
import { z } from "h3-zod";

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event);
  if (await denies(event, editComment)) {
    throw createError({
      statusCode: 403,
      statusMessage: t(
        "Forbidden: You do not have permission to Manage comments."
      ),
    });
  }

  try {
    const StatusEnum = z.enum(["new", "published", "spam"]);

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
      status: StatusEnum.optional(),
    });

    const query = getQuery(event);
    const { page, pageSize, status } = querySchema.parse(query);

    const currentPage = page ?? 1;
    const currentPageSize = pageSize ?? 5;
    const offset = (currentPage - 1) * currentPageSize;

    const { DB } = event.context.cloudflare.env;
    const drizzleDb = drizzle(DB);

    // Query total count of comments
    let totalQuery = drizzleDb.select({ count: sql`COUNT(*)` }).from(comments);
    if (status) {
      totalQuery = totalQuery.where(eq(comments.status, status));
    }
    const totalResult = await totalQuery;
    const total = Number(totalResult[0].count);

    // Query paginated comments with author details
    let commentsQuery = drizzleDb
      .select({
        id: comments.id,
        routePath: comments.routePath,
        body: comments.body,
        status: comments.status,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        authorId: comments.authorId,
        authorUsername: users.username,
        authorDisplayName: users.displayName,
        authorAvatar: users.avatar,
      })
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id))
      .limit(currentPageSize)
      .offset(offset);

    if (status) {
      commentsQuery = commentsQuery.where(eq(comments.status, status));
    }

    const allComments = await commentsQuery;

    return {
      total,
      page: currentPage,
      pageSize: currentPageSize,
      comments: allComments,
    };
  } catch (error: any) {
    console.error("Error fetching comments:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || t("Internal Server Error"),
    });
  }
});
