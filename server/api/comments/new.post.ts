import { drizzle } from "drizzle-orm/d1";
import { z } from "h3-zod";

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event);
  const now = new Date();

  if (await denies(event, createComment)) {
    throw createError({
      statusCode: 403,
      statusMessage: t(
        "Forbidden: You do not have permission to post comments."
      ),
    });
  }

  const schema = z.object({
    routePath: z
      .string()
      .min(1, t("Route path must not be empty")),
    commentBody: z
      .string()
      .min(1, t("Comment body must not be empty")),
    parentCommentId: z
      .union([
        z
          .coerce
          .number({
            invalid_type_error: t(
              "Parent comment ID must be a positive integer"
            ),
          })
          .int()
          .min(1, t("Parent comment ID must be a positive integer")),
        z.null(),
      ])
      .optional(),
  });

  const payload = await readBody(event);
  const { routePath, commentBody, parentCommentId } = schema.parse(payload);
  const normalizedParentId =
    typeof parentCommentId === "number" ? parentCommentId : null;

  const { DB } = event.context.cloudflare.env;
  const drizzleDb = drizzle(DB);

  const session = await getUserSession(event);
  // Insert new comment into the database
  const insertedComment = await drizzleDb
    .insert(comments)
    .values({
      routePath,
      authorId: session.user.id,
      parentCommentId: normalizedParentId,
      body: commentBody,
      status: CommentStatus.New,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return {
    message: t("Comment posted successfully."),
    comment: insertedComment,
  };
});
