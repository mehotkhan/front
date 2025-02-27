import { defineCollection, defineContentConfig, z } from "@nuxt/content";

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: "page",
      source: "**/*.md",
      schema: z.object({
        title: z.string(),
        thumbnail: z.string(),
        description: z.string(),
        date: z.string(),
        rawbody: z.string(),
        intro: z.boolean(),
        toc: z.boolean(),
        comments: z.boolean(),
      }),
    }),
    notes: defineCollection({
      type: "page",
      source: "**/notes/*.md",
      schema: z.object({
        title: z.string(),
        thumbnail: z.string(),
        description: z.string(),
        date: z.string(),
        category: z.string(),
        rawbody: z.string(),
        intro: z.boolean(),
        toc: z.boolean(),
        comments: z.boolean(),
      }),
    }),
  },
});
