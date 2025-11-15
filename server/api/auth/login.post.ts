import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { z } from "h3-zod";

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event);
  const now = new Date();

  // Schema validation with Zod
  const schema = z.object({
    userName: z.string().min(1, t("Username must not be empty")),
    password: z.string().min(1, t("Password must not be empty")),
    pub: z.string().min(1, t("Public key must not be empty")),
  });

  try {
    // Validate request body
    const body = await readBody(event);
    const { userName, password, pub } = schema.parse(body);

    const { DB } = event.context.cloudflare.env;
    const db = drizzle(DB);

    // Find user by username
    const user = await db
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

    // Fetch permissions
    const rolePermissions = await db
      .select({ permissions: roles.permissions })
      .from(user_roles)
      .innerJoin(roles, eq(user_roles.roleId, roles.id))
      .where(eq(user_roles.userId, user.id))
      .all();

    const permissions = new Set<string>();
    for (const { permissions: perms } of rolePermissions) {
      try {
        JSON.parse(perms).forEach((p: string) => permissions.add(p));
      } catch (err) {
        console.error("Error parsing permissions:", err);
      }
    }

    // Update last login time
    await db
      .update(users)
      .set({ lastLoginAt: now })
      .where(eq(users.id, user.id))
      .execute();

    // Create session
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
      permissions: Array.from(permissions),
    });

    return {
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
      about: user.about,
      avatar: user.avatar,
      pub: user.pub,
    };
  } catch (error: unknown) {
    console.error("Login error:", error);
    const errorMessage = error instanceof Error ? error.message : t("Login failed");
    throw createError({
      statusCode: 400,
      statusMessage: errorMessage,
    });
  }
});
