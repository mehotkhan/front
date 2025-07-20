import { drizzle } from "drizzle-orm/d1";
import { z } from "h3-zod";

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event);

  const schema = z.object({
    email: z.string().email(t("Invalid email address")),
    route: z.string(), // optional: validate format or fallback
  });

  try {
    const body = await readBody(event);
    const { email: emailAddress, route } = schema.parse(body);

    const { DB } = event.context.cloudflare.env;
    const db = drizzle(DB);

    const now = new Date();

    // Insert into newsletter table
    await db.insert(newsletter).values({
      email: emailAddress,
      routePath: route,
      createdAt: now,
      updatedAt: now,
    });

    return {
      message: t("Subscription successful"),
      email: emailAddress,
    };
  } catch (error: unknown) {
    console.error("Newsletter subscription error:", error);
    const errorMessage = error instanceof Error ? error.message : t("Subscription failed");
    throw createError({
      statusCode: 400,
      statusMessage: errorMessage,
    });
  }
});
