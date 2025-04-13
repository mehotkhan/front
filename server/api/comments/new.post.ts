import { drizzle } from "drizzle-orm/d1";
import { z } from "zod";

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

  // Define Zod schema for body validation
  const schema = z.object({
    routePath: z.string().min(1, t("Route path must not be empty")),
    commentBody: z.string().min(1, t("Comment body must not be empty")),
    parentCommentId: z
      .number()
      .int()
      .positive(t("Parent comment ID must be a positive integer"))
      .optional()
      .nullable(),
  });

  // Read and validate the body
  const payload = await readBody(event);
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.message,
    });
  }
  const { routePath, commentBody, parentCommentId } = parsed.data;

  const { DB } = event.context.cloudflare.env;
  const drizzleDb = drizzle(DB);

  const session = await getUserSession(event);
  // Insert new comment into the database
  const insertedComment = await drizzleDb
    .insert(comments)
    .values({
      routePath,
      authorId: session.user.id,
      parentCommentId: parentCommentId || null,
      body: commentBody,
      status: CommentStatus.Draft,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return {
    message: t("Comment posted successfully."),
    comment: insertedComment,
  };
});
