import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event);
  const headers: any = getHeaders(event);
  const now = new Date();

  try {
    // Define Zod schema for body validation
    const schema = z.object({
      firstName: z.string().min(1, t("First name must not be empty")),
      lastName: z.string().min(1, t("Last name must not be empty")),
      userName: z.string().min(1, t("Username must not be empty")),
      password: z.string().min(1, t("Password must not be empty")),
      pub: z.string().min(1, t("Public key must not be empty")),
      about: z.string().min(1, t("About must not be empty")),
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
    const { firstName, lastName, userName, password, pub, about } = parsed.data;

    const { DB } = event.context.cloudflare.env;
    const drizzleDb = drizzle(DB);

    // Check for existing username
    const existingUser = await drizzleDb
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
    await drizzleDb
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

    // Fetch inserted user
    const insertedUser = await drizzleDb
      .select()
      .from(users)
      .where(eq(users.username, userName))
      .get();

    if (!insertedUser) {
      throw createError({
        statusCode: 500,
        statusMessage: t("Failed to retrieve the newly created user"),
      });
    }

    // Capture device information from headers
    const ip = headers["cf-connecting-ip"] || "";
    const userAgent = headers["user-agent"] || "";
    const location = headers["cf-ipcountry"] || "unknown";

    // Insert device associated with the user
    await drizzleDb.insert(devices).values({
      userId: insertedUser.id,
      pubKey: pub,
      deviceName: `Device - ${pub.slice(0, 6)}`,
      ip,
      location,
      userAgent,
      loginDate: now,
      lastActivity: now,
    });

    // Set user session
    await setUserSession(event, {
      user: {
        id: insertedUser.id,
        username: insertedUser.username,
        displayName: insertedUser.displayName,
        pub,
        permissions: [],
      },
      loggedInAt: now,
    });

    // Successful response with profile data
    return {
      message: t("Registered successfully"),
      firstName: insertedUser.firstName,
      lastName: insertedUser.lastName,
      displayName: insertedUser.displayName,
      about: insertedUser.about,
    };
  } catch (e: any) {
    console.error("Error creating user:", e);
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage:
        e.statusMessage || t("Internal Server Error. Please try again later."),
    });
  }
});
