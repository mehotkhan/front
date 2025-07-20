import { z } from "h3-zod";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event);
  const now = new Date();

  try {
    // Ensure user is authenticated
    const session = await getUserSession(event);
    if (!session || !session.user) {
      throw createError({
        statusCode: 401,
        statusMessage: t("Unauthorized: User not authenticated"),
      });
    }
    const userId = session.user.id;

    // Define Zod schema for body validation
    const schema = z.object({
      firstName: z.string().min(1, t("First name must not be empty")),
      lastName: z.string().min(1, t("Last name must not be empty")),
      about: z.string().min(1, t("About must not be empty")),
    });

    // Read and validate the body
    const body = await readBody(event);
    const parsed = schema.parse(body);
    const { firstName, lastName, about } = parsed;

    // Initialize the database connection
    const { DB } = event.context.cloudflare.env;
    const drizzleDb = drizzle(DB);

    // Fetch user's roles and permissions
    const rolePermissions = await drizzleDb
      .select({ permissions: roles.permissions })
      .from(user_roles)
      .innerJoin(roles, eq(user_roles.roleId, roles.id))
      .where(eq(user_roles.userId, userId))
      .all();

    const permissionsSet = new Set<string>();
    for (const role of rolePermissions) {
      try {
        const perms: string[] = JSON.parse(role.permissions);
        perms.forEach((p) => permissionsSet.add(p));
      } catch (err) {
        console.error("Error parsing permissions for role", role, err);
      }
    }

    // Update user profile
    await drizzleDb
      .update(users)
      .set({
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`,
        about,
        updatedAt: now,
      })
      .where(eq(users.id, userId))
      .execute();

    // Fetch updated user data
    const updatedUser = await drizzleDb
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .get();

    if (!updatedUser) {
      throw createError({
        statusCode: 404,
        statusMessage: t("User not found"),
      });
    }

    return {
      message: t("Profile updated successfully"),
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      displayName: updatedUser.displayName,
      about: updatedUser.about,
    };
  } catch (error: unknown) {
    console.error("Error updating user profile:", error);
    const errorMessage = error instanceof Error ? error.message : t("Internal Server Error");
    throw createError({
      statusCode: error instanceof Error && 'statusCode' in error ? (error as { statusCode: number }).statusCode : 500,
      statusMessage: errorMessage,
    });
  }
});
