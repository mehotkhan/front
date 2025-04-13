import { drizzle } from "drizzle-orm/d1";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event);

  // Define Zod schema for body validation
  const schema = z.object({
    userId: z.number().int().positive(t("User ID must be a positive integer")),
    roleIds: z
      .array(z.string().regex(/^\d+$/, t("Role ID must be a valid number")))
      .min(1, t("At least one role must be selected")),
  });

  // Read and validate the body
  const body = await readBody(event);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.message,
    });
  }
  const { userId, roleIds } = parsed.data;

  const { DB } = event.context.cloudflare.env;
  const drizzleDb = drizzle(DB);

  // Insert each roleId into the user_roles table
  for (const roleIdStr of roleIds) {
    const roleId = parseInt(roleIdStr, 10);
    await drizzleDb
      .insert(user_roles)
      .values({
        userId,
        roleId,
      })
      .execute();
  }

  return {
    message: t("Roles added successfully"),
  };
});
