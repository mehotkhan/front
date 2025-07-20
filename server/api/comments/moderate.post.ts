import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { z } from "h3-zod";

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event);

  // Check permission: only allow if the user has editComment permission
  if (await denies(event, editComment)) {
    throw createError({
      statusCode: 403,
      statusMessage: t(
        "Forbidden: You do not have permission to edit comments."
      ),
    });
  }

  // Define Zod schema for body validation
  const schema = z.object({
    id: z.number().int().min(1, t("Comment ID must be a positive integer")),
    newStatus: z.enum(["published", "spam", "new"], t("Invalid status value.")),
  });

  try {
    // Read and validate the body
    const body = await readBody(event);
    const parsed = schema.parse(body);
    const { id, newStatus } = parsed;

    // Initialize database connection
    const { DB } = event.context.cloudflare.env;
    const drizzleDb = drizzle(DB);

    // Update the comment's status and update timestamp
    const result = await drizzleDb
      .update(comments)
      .set({
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(comments.id, id))
      .returning({ id: comments.id, status: comments.status })
      .execute();

    if (!result.length) {
      throw createError({
        statusCode: 404,
        statusMessage: t("Comment not found."),
      });
    }

    return {
      success: true,
      message: t("Comment status updated successfully."),
      comment: result[0],
    };
  } catch (error: unknown) {
    console.error("Moderate comment error:", error);
    const errorMessage = error instanceof Error ? error.message : t("Moderate comment failed");
    throw createError({
      statusCode: 400,
      statusMessage: errorMessage,
    });
  }
});
