import viteCompression from "vite-plugin-compression";

import { generateRoutes } from "./scripts/prerender";

export default defineNuxtConfig({
  future: { compatibilityVersion: 4 },
  compatibilityDate: "2024-11-01",
  devtools: { enabled: false },
  modules: [
    "@nuxt/ui",
    "@nuxtjs/seo",
    "@nuxt/content",
    "@nuxt/image",
    "@nuxt/eslint",
    "nitro-cloudflare-dev",
    "nuxt-auth-utils",
    "nuxt-tiptap-editor",
    "@nuxtjs/i18n",
    "nuxt-authorization",
    "nuxt-echarts",
  ],

  css: ["~/assets/css/main.css", "~/assets/css/extra.css"],
  build: { transpile: ["echarts-liquidfill"] },

  vite: {
    resolve: {
      alias: { "echarts/lib/util/number": "echarts/lib/util/number.js" },
    },
    css: {
      preprocessorOptions: {
        scss: { api: "modern" },
      },
    },
    plugins: [
      viteCompression({
        algorithm: "brotliCompress",
        threshold: 1024,
      }),
    ],
    build: {
      minify: "esbuild",
      cssMinify: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["vue", "echarts"],
          },
        },
      },
    },
    optimizeDeps: {
      include: ["echarts", "echarts-liquidfill"],
    },
  },

  nitro: {
    // preset: "cloudflare-pages",
    compressPublicAssets: { brotli: true },
    minify: true,
    prerender: {
      crawlLinks: false,
      routes: generateRoutes(),
      failOnError: true,
      concurrency: 10,
      autoSubfolderIndex: true,
    },
    publicAssets: [
      {
        dir: "public",
        maxAge: 31536000,
      },
    ],
  },

  app: {
    head: {
      link: [
        // Add your font preloads here, e.g.:
        // { rel: "preload", as: "font", href: "/fonts/yourfont.woff2", type: "font/woff2", crossorigin: "anonymous" },
      ],
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
    },
  },

  ui: { fonts: false },
  content: {
    markdown: {
      remarkPlugins: ["remark-reading-time"],
      rehypePlugins: [],
    },
    highlight: {
      theme: "github-dark",
      preload: ["json", "js", "ts", "html", "css", "vue", "go"],
    },
    database: {
      type: "d1",
      bindingName: "DB",
    },
  },

  image: {
    cloudflare: {
      baseURL: "https://mohet.ir",
    },
    formats: ["webp", "avif"],
    densities: [1, 2],
    quality: 80,
  },

  i18n: {
    bundle: { optimizeTranslationDirective: true },
    detectBrowserLanguage: false,
    locales: [
      { name: "فارسی", dir: "rtl", code: "fa", file: "fa.json" },
      { name: "English", dir: "ltr", code: "en", file: "en.json" },
    ],
    langDir: "locales",
    defaultLocale: "fa",
    strategy: "prefix_and_default",
    experimental: { localeDetector: "localeDetector.ts" },
    lazy: true,
    baseUrl: "https://mohet.ir",
  },

  routeRules: {
    "/": { prerender: true },
    "/fa/": { prerender: true },
    "/en/": { prerender: true },
    "/:locale/**": { prerender: true },
    "/api/**": { ssr: true },
    "/manage": { prerender: false, ssr: false, robots: false },
    "/manage/**": { prerender: false, ssr: false, robots: false },
    "/:locale/manage": { prerender: false, ssr: false, robots: false },
    "/:locale/manage/**": { prerender: false, ssr: false, robots: false },
  },

  experimental: {
    restoreState: true,
    payloadExtraction: true,
  },

  echarts: {
    ssr: true,
    renderer: ["svg"],
    charts: ["BarChart", "LineChart"],
    components: [
      "DatasetComponent",
      "GridComponent",
      "TooltipComponent",
      "ToolboxComponent",
      "GeoComponent",
      "VisualMapComponent",
    ],
  },

  runtimeConfig: {
    githubToken: "",
    githubOwner: "",
    githubRepo: "",
  },

  seo: {
    automaticDefaults: true,
  },
  linkChecker: { enabled: false },
  hooks: {
    "nitro:build:public-assets": (nitro) => {
      console.log("Prerendered routes:", nitro.options.prerender?.routes);
    },
  },
});
