// server/api/content/query.get.ts
import { z } from "h3-zod";

export default defineEventHandler(async (event) => {
  try {
    // Import logs.json
    const { default: Logs } = await import("#velite/logs.json", {
      with: { type: "json" },
    });

    // Define Zod schema for query parameters
    const schema = z.object({
      intro: z.string().optional().transform((value) => value === "true"),
      sortBy: z.string().optional().default("date"),
      sortOrder: z.string().optional().default("DESC"),
      limit: z.string().optional().transform((val) => val ? Number(val) : 10),
      locale: z.string().optional(),
      cat: z.string().optional(),
    });

    // Parse query parameters
    const query = getQuery(event);
    const parsed = schema.parse(query);

    // Filter logs by intro, locale, and cat if provided
    let filteredLogs = Logs;
    if (parsed.intro !== undefined) {
      filteredLogs = filteredLogs.filter((log) => log.intro === parsed.intro);
    }
    if (parsed.locale) {
      filteredLogs = filteredLogs.filter((log) =>
        log.path.startsWith(`/${parsed.locale}/`)
      );
    }
    if (parsed.cat) {
      filteredLogs = filteredLogs.filter((log) => log.cat === parsed.cat);
    }

    // Sort logs with type safety
    filteredLogs = filteredLogs.sort((a, b) => {
      const aValue = (a as Record<string, unknown>)[parsed.sortBy] || "";
      const bValue = (b as Record<string, unknown>)[parsed.sortBy] || "";
      const order = parsed.sortOrder === "ASC" ? 1 : -1;
      return aValue > bValue ? order : -order;
    });

    // Apply limit
    filteredLogs = filteredLogs.slice(0, parsed.limit);

    return { data: filteredLogs };
  } catch (error: unknown) {
    console.error("Error in content query:", error);
    const errorMessage = error instanceof Error ? error.message : "Invalid query parameters";
    throw createError({
      statusCode: 400,
      statusMessage: errorMessage,
    });
  }
});
