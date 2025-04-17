import { minLength, object, parse, string } from "valibot";
import { parseMarkdown } from "@nuxtjs/mdc/runtime";

export default defineEventHandler(async (event) => {
  const { default: Content } = await import("#velite/content.json", {
    with: { type: "json" },
  });
  const t = await useTranslation(event);
  const schema = object({
    path: string([minLength(1, "Missing or invalid path parameter")]),
  });
  const query = getQuery(event);
  const parsed = parse(schema, query, { abortEarly: false });
  try {
    let { path } = parsed as { path: string };
    if (path !== "/" && path.endsWith("/")) {
      path = path.slice(0, -1);
    }
    if (!path.startsWith("/")) {
      path = "/" + path;
    }

    // 4. Lookup
    const item = (Content as Array<{ path: string }>).find(
      (i) => i.path === path
    );

    return item ?? {};
    // const item = Content.find((item) => item.path === path);
    // return item ?? {};
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || t("Internal Server Error"),
    });
  }
});
