import type { D1Database } from "@cloudflare/workers-types";
import { z } from "h3-zod";

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event);
  const d1: D1Database = event.context.cloudflare.env.DB;
  const appConfig = useAppConfig(event);

  // Check if app is installed
  if (appConfig.installed) {
    throw createError({
      statusCode: 403,
      message: t("Application is already installed"),
    });
  }

  // Zod schema for public key
  const PublicKeySchema = z.string().min(1, t("Public key must not be empty"));

  try {
    // Validate public key (assuming it's part of the request)
    const body = await readBody(event);
    PublicKeySchema.parse(body.publicKey);

    // Test database connection
    const { results } = await d1.prepare("SELECT 1 as result").all();
    const isConnected = Boolean(results?.length);

    return {
      dbConnected: isConnected,
      message: isConnected
        ? t("Database connection is working.")
        : t("Database connection is not working."),
    };
  } catch (error: unknown) {
    return {
      dbConnected: false,
      message:
        t("Error: ") + (error instanceof Error ? error.message : t("Invalid public key or database error")),
    };
  }
});
