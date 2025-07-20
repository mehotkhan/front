import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { z } from "h3-zod";

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event);
  const { DB } = event.context.cloudflare.env;
  const drizzleDb = drizzle(DB);
  const headers = getHeaders(event);
  const now = new Date();
  const appConfig = useAppConfig(event);

  // Check if app is installed
  if (appConfig.installed) {
    throw createError({
      statusCode: 403,
      message: t("Application is already installed"),
    });
  }

  // Define Zod schema for admin user
  const UserSchema = z.object({
    firstName: z.string().min(1, t("First name must not be empty")),
    lastName: z.string().min(1, t("Last name must not be empty")),
    userName: z.string().min(1, t("Username must not be empty")),
    password: z.string().min(1, t("Password must not be empty")),
    pub: z.string().min(1, t("Public key must not be empty")),
    about: z.string().min(1, t("About must not be empty")),
    avatar: z.string().optional(),
  });

  try {
    // Read and validate the body
    const body = await readBody(event);
    const parsed = UserSchema.parse(body);

    // Check for existing username
    const existingUser = await drizzleDb
      .select()
      .from(users)
      .where(eq(users.username, parsed.userName))
      .get();
    if (existingUser) {
      throw createError({
        statusCode: 409,
        message: t("This username is already in use. Please choose another."),
      });
    }

    // Hash password
    const hashedPassword = await hashWorkerPassword(parsed.password);

    // Insert new user
    await drizzleDb
      .insert(users)
      .values({
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        displayName: `${parsed.firstName} ${parsed.lastName}`,
        username: parsed.userName,
        about: parsed.about,
        avatar: parsed.avatar || "",
        password: hashedPassword,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      })
      .execute();

    // Retrieve created user
    const newUser = await drizzleDb
      .select()
      .from(users)
      .where(eq(users.username, parsed.userName))
      .get();
    if (!newUser) {
      throw createError({
        statusCode: 500,
        message: t("Failed to retrieve the newly created user."),
      });
    }

    // Insert device information
    const ip = headers["cf-connecting-ip"] || "";
    const userAgent = headers["user-agent"] || "";
    const location = headers["cf-ipcountry"] || "unknown";
    await drizzleDb.insert(devices).values({
      userId: newUser.id,
      pubKey: parsed.pub,
      deviceName: `Device - ${parsed.pub.slice(0, 6)}`,
      ip,
      location,
      userAgent,
      loginDate: now,
      lastActivity: now,
    });

    // Assign admin role
    const adminRole = await drizzleDb
      .select()
      .from(roles)
      .where(eq(roles.name, "owner"))
      .get();
    if (!adminRole) {
      throw createError({
        statusCode: 500,
        message: t("The Admin role is not configured in the system."),
      });
    }

    await drizzleDb
      .insert(user_roles)
      .values({ userId: newUser.id, roleId: adminRole.id })
      .execute();

    // Set user session
    await setUserSession(event, {
      user: {
        id: newUser.id,
        username: newUser.username,
        displayName: newUser.displayName,
        pub: parsed.pub,
        permissions: [],
      },
      loggedInAt: now,
    });

    return {
      message: t("Admin user registered and loaded successfully."),
    };
  } catch (error: unknown) {
    console.error("Admin loading error:", error);
    const errorMessage = error instanceof Error ? error.message : t("Admin loading failed");
    throw createError({
      statusCode: 400,
      statusMessage: errorMessage,
    });
  }
});
