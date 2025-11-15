import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { z } from "h3-zod";

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event);

  // Define Zod schema for body validation
  const schema = z.object({
    userId: z.number().int().min(1, t("User ID must be a positive integer")),
    roleId: z.number().int().min(1, t("Role ID must be a positive integer")),
  });

  // Read and validate the body
  const body = await readBody(event);
  const parsed = schema.parse(body);
  const { userId, roleId } = parsed;

  const { DB } = event.context.cloudflare.env;
  const drizzleDb = drizzle(DB);

  // Add role to user logic here...
  // (Implementation depends on your DB schema)
  // For now, just return success message
  console.log(`Adding role ${roleId} to user ${userId}`);

  return {
    message: t("Role added to user successfully"),
  };
});
