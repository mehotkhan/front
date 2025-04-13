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
    plugins: [viteCompression({ algorithm: "brotliCompress" })],
    build: { minify: true },
  },

  nitro: {
    preset: "cloudflare-pages",
    compressPublicAssets: { brotli: true },
    minify: true,
    prerender: {
      crawlLinks: false, // Rely on explicit routes
      routes: generateRoutes(),
      failOnError: false, // Fail build if prerendering fails
      concurrency: 10,
    },
  },

  ui: { fonts: false },

  i18n: {
    bundle: { optimizeTranslationDirective: false },
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "root",
    },
    locales: [
      { name: "فارسی", dir: "rtl", code: "fa", file: "fa.json" },
      { name: "English", dir: "ltr", code: "en", file: "en.json" },
    ],
    langDir: "locales",
    defaultLocale: "fa",
    strategy: "prefix_and_default",
    experimental: { localeDetector: "localeDetector.ts" },
  },

  routeRules: {
    "/": { prerender: true },
    "/fa/": { prerender: true },
    "/en/": { prerender: true },
    "/manage": { prerender: false, ssr: false, robots: false },
    "/manage/**": { prerender: false, ssr: false, robots: false },
    "/:locale/manage": { prerender: false, ssr: false, robots: false },
    "/:locale/manage/**": { prerender: false, ssr: false, robots: false },
    "/:locale/logs": { isr: 3600 },
    "/:locale/logs/**": { isr: true },
    "/:locale/cats/**": { isr: true },
    "/:locale/profile/**": { robots: false },
    "/**": { prerender: true },
  },

  experimental: { restoreState: true },

  content: {
    database: {
      type: "d1",
      bindingName: "DB",
    },
  },

  echarts: {
    ssr: true,
    renderer: ["canvas", "svg"],
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

  image: {
    cloudflare: {
      baseURL: "https://mohet.ir",
    },
  },

  linkChecker: { enabled: false },

  // Enable debug logs for prerendering
  hooks: {
    "nitro:build:public-assets": (nitro) => {
      console.log("Prerendered routes:", nitro.options.prerender?.routes);
    },
  },
});
