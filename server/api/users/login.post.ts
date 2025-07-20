import { z } from "h3-zod";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event);
  const now = new Date();

  try {
    // Define Zod schema for body validation
    const schema = z.object({
      userName: z.string().min(1, t("Username must not be empty")),
      password: z.string().min(1, t("Password must not be empty")),
      pub: z.string().min(1, t("Public key must not be empty")),
    });

    // Read and validate the body
    const body = await readBody(event);
    const parsed = schema.parse(body);
    const { userName, password, pub } = parsed;

    const { DB } = event.context.cloudflare.env;
    const drizzleDb = drizzle(DB);

    // Find user by username
    const user = await drizzleDb
      .select()
      .from(users)
      .where(eq(users.username, userName))
      .get();

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: t("Invalid username or password"),
      });
    }

    // Verify password
    const isPasswordValid = await verifyWorkerPassword(password, user.password);

    if (!isPasswordValid) {
      throw createError({
        statusCode: 401,
        statusMessage: t("Invalid username or password"),
      });
    }

    // Fetch user's roles and permissions
    const rolePermissions = await drizzleDb
      .select({ permissions: roles.permissions })
      .from(user_roles)
      .innerJoin(roles, eq(user_roles.roleId, roles.id))
      .where(eq(user_roles.userId, user.id))
      .all();

    const permissionsSet = new Set<string>();
    for (const { permissions } of rolePermissions) {
      try {
        JSON.parse(permissions).forEach((p: string) => permissionsSet.add(p));
      } catch (err) {
        console.error("Error parsing permissions:", err);
      }
    }

    // Update last login time
    await drizzleDb
      .update(users)
      .set({ lastLoginAt: now })
      .where(eq(users.id, user.id))
      .execute();

    // Set user session
    await setUserSession(event, {
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        about: user.about,
        avatar: user.avatar,
        pub: user.pub,
      },
      loggedInAt: now,
      permissions: Array.from(permissionsSet),
    });

    return {
      message: t("Login successful"),
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
      about: user.about,
      username: user.username,
    };
  } catch (error: unknown) {
    console.error("Error logging in user:", error);
    const errorMessage = error instanceof Error ? error.message : t("Internal Server Error");
    throw createError({
      statusCode: error instanceof Error && 'statusCode' in error ? (error as { statusCode: number }).statusCode : 500,
      statusMessage: errorMessage,
    });
  }
});
