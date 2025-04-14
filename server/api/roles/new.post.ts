import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event);

  // Define Zod schema for validating the incoming payload
  const schema = z.object({
    roleName: z
      .string()
      .min(3, t("Role name must be at least 3 characters"))
      .max(255, t("Role name must not exceed 255 characters")),
    description: z
      .string()
      .max(1000, t("Description must not exceed 1000 characters"))
      .optional(),
    permissions: z
      .array(z.string().min(1, t("Permission must not be empty")))
      .min(1, t("At least one permission must be selected")),
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

  const { roleName, description, permissions } = parsed.data;

  const { DB } = event.context.cloudflare.env;
  const drizzleDb = drizzle(DB);

  // Check if the role name is already registered
  const existingRole = await drizzleDb
    .select()
    .from(roles)
    .where(eq(roles.name, roleName))
    .get();

  if (existingRole) {
    throw createError({
      statusCode: 409,
      statusMessage: t(
        "Role name is already taken. Please choose another one."
      ),
    });
  }

  // Insert the new role into the database
  await drizzleDb
    .insert(roles)
    .values({
      name: roleName,
      description: description || "",
      permissions: JSON.stringify(permissions),
    })
    .execute();

  return {
    message: t("Role added successfully"),
  };
});
