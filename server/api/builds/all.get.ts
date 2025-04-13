import { drizzle } from "drizzle-orm/d1";
import { sql } from "drizzle-orm/sql";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event);

  // Check that the user has permission to create a commit
  if (await denies(event, readBuild)) {
    throw createError({
      statusCode: 403,
      statusMessage: t("Forbidden: You do not have permission to get builds."),
    });
  }

  try {
    // Define Zod schema for query parameters
    const querySchema = z.object({
      page: z
        .string()
        .optional()
        .transform((val) => (val ? Number(val) : 1))
        .refine((val) => val >= 1, t("Page must be at least 1")),
      pageSize: z
        .string()
        .optional()
        .transform((val) => (val ? Number(val) : 10))
        .refine((val) => val >= 1, t("Page size must be at least 1")),
    });

    const query = getQuery(event);
    const parsedQuery = querySchema.safeParse(query);

    if (!parsedQuery.success) {
      throw createError({
        statusCode: 400,
        statusMessage: parsedQuery.error.message,
      });
    }

    const { page, pageSize } = parsedQuery.data;
    const offset = (page - 1) * pageSize;

    const { DB } = event.context.cloudflare.env;
    const db = drizzle(DB);

    // Query the total count of builds
    const totalResult = await db.select({ count: sql`COUNT(*)` }).from(builds);
    const total = Number(totalResult[0].count);

    // Query builds with pagination and order by createdAt descending
    const buildsData = await db
      .select()
      .from(builds)
      .orderBy(builds.createdAt, "desc")
      .limit(pageSize)
      .offset(offset);

    // If no builds, return empty array with total count
    if (!buildsData.length) {
      return { builds: [], total, page, pageSize };
    }

    // Get build IDs from the fetched builds
    const buildIds = buildsData.map((b) => b.id);

    // Fetch all commits for these build IDs
    const commitsData = await db
      .select()
      .from(commits)
      .where(sql`build_id IN (${buildIds.join(",")})`);

    // Group commits by buildId
    const commitsByBuild: Record<number, any[]> = {};
    buildIds.forEach((id) => (commitsByBuild[id] = []));
    for (const commit of commitsData) {
      if (commitsByBuild[commit.buildId]) {
        commitsByBuild[commit.buildId].push(commit);
      }
    }

    // Attach the commits array to each build
    const buildsWithCommits = buildsData.map((build) => ({
      ...build,
      commits: commitsByBuild[build.id] || [],
    }));

    return {
      builds: buildsWithCommits,
      total,
      page,
      pageSize,
    };
  } catch (error: any) {
    console.error("Error fetching builds:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || t("Internal Server Error"),
    });
  }
});
