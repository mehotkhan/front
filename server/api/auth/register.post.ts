import { z } from "h3-zod";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event);
  const now = new Date();

  // Schema validation with Zod
  const schema = z.object({
    firstName: z.string().min(1, t("First name must not be empty")),
    lastName: z.string().min(1, t("Last name must not be empty")),
    userName: z.string().min(1, t("Username must not be empty")),
    password: z.string().min(1, t("Password must not be empty")),
    pub: z.string().min(1, t("Public key must not be empty")),
    about: z.string().min(1, t("About must not be empty")),
  });

  try {
    // Validate request body
    const body = await readBody(event);
    const { firstName, lastName, userName, password, pub, about } = schema.parse(body);

    const { DB } = event.context.cloudflare.env;
    const db = drizzle(DB);

    // Check for existing username
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, userName))
      .get();

    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: t(
          "Username is already taken. Please choose another one."
        ),
      });
    }

    // Hash password securely with PBKDF2
    const hashedPassword = await hashWorkerPassword(password);

    // Create user
    await db
      .insert(users)
      .values({
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`,
        username: userName,
        about,
        password: hashedPassword,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      })
      .execute();

    return {
      message: t("User registered successfully"),
    };
  } catch (error: unknown) {
    console.error("Registration error:", error);
    const errorMessage = error instanceof Error ? error.message : t("Registration failed");
    throw createError({
      statusCode: 400,
      statusMessage: errorMessage,
    });
  }
});
