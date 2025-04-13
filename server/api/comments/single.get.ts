import { and, eq, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { desc, sql } from "drizzle-orm/sql";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event);

  // Define a Zod schema for validating query parameters
  const schema = z.object({
    page: z
      .string()
      .transform((val) => Number(val))
      .refine((val) => !isNaN(val) && val >= 1, {
        message: t("Invalid page parameter: must be a number >= 1"),
      }),
    pageSize: z
      .string()
      .transform((val) => Number(val))
      .refine((val) => !isNaN(val) && val >= 1 && val <= 100, {
        message: t(
          "Invalid pageSize parameter: must be a number between 1 and 100"
        ),
      }),
    path: z.string().min(1, {
      message: t("Missing or invalid path parameter"),
    }),
  });

  // Parse query parameters
  const query = getQuery(event);
  const parsed = schema.safeParse(query);

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues
        .map((issue) => issue.message)
        .join(", "),
    });
  }

  try {
    const { DB } = event.context.cloudflare.env;
    const drizzleDb = drizzle(DB);

    // Extract validated parameters
    const { page, pageSize, path } = parsed.data;
    const offset = (page - 1) * pageSize;

    // Retrieve current user session (if any)
    const session = await getUserSession(event);
    const currentUserId = session && session.user ? session.user.id : null;

    // Build the where condition
    const whereCondition = currentUserId
      ? and(
          eq(comments.routePath, path),
          or(
            eq(comments.status, "published"),
            eq(comments.authorId, currentUserId)
          )
        )
      : and(eq(comments.routePath, path), eq(comments.status, "published"));

    // Query the total count of comments
    const totalResult = await drizzleDb
      .select({ count: sql`COUNT(*)` })
      .from(comments)
      .where(whereCondition);
    const total = Number(totalResult[0].count);

    // Query paginated comments
    const paginatedComments = await drizzleDb
      .select({
        author: {
          id: users.id,
          displayName: users.displayName,
          avatar: users.avatar,
        },
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        status: comments.status,
        id: comments.id,
        parentCommentId: comments.parentCommentId,
        body: comments.body,
      })
      .from(comments)
      .leftJoin(users, eq(users.id, comments.authorId))
      .where(whereCondition)
      .orderBy(desc(comments.createdAt))
      .limit(pageSize)
      .offset(offset);

    return {
      total,
      page,
      pageSize,
      comments: paginatedComments,
    };
  } catch (error: any) {
    console.error("Error fetching comments:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || t("Internal Server Error"),
    });
  }
});
