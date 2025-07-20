import { drizzle } from "drizzle-orm/d1";
import { sql } from "drizzle-orm/sql";
import { z } from "h3-zod";

export default defineEventHandler(async (event) => {
  // Define Zod schema for query parameters
  const querySchema = z.object({
    page: z.string().optional().transform((val) => (val ? Number(val) : 1)),
    pageSize: z.string().optional().transform((val) => (val ? Number(val) : 5)),
  });

  // Read and validate query parameters
  const query = getQuery(event);
  const parsedQuery = querySchema.parse(query);

  const { page = 1, pageSize = 5 } = parsedQuery;
  const offset = (page - 1) * pageSize;

  const { DB } = event.context.cloudflare.env;
  const drizzleDb = drizzle(DB);

  // Query the total count of roles
  const totalResult = await drizzleDb
    .select({ count: sql`COUNT(*)` })
    .from(roles);
  const total = Number(totalResult[0].count);

  // Query paginated roles
  const allRoles = await drizzleDb
    .select()
    .from(roles)
    .limit(pageSize)
    .offset(offset);

  return {
    total,
    page,
    pageSize,
    roles: allRoles,
  };
});
