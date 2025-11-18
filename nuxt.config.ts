import { resolve } from "path";

import { generateRoutes } from "./scripts/prerender";

export default defineNuxtConfig({
  compatibilityDate: "2025-11-15",
  devtools: { enabled: false },
  spaLoadingTemplate: true,

  sourcemap: {
    server: false,
    client: false,
  },

  modules: [
    "@nuxt/ui",
    "@nuxt/image",
    "nuxt-auth-utils",
    "nitro-cloudflare-dev",
    "@nuxtjs/i18n",
    "nuxt-authorization",
    "nuxt-echarts",
    "@nuxtjs/turnstile",
    "@nuxtjs/mdc",
    "@nuxtjs/sitemap",
    "@nuxtjs/robots",
    "@nuxt/eslint",
  ],

  css: ["~/assets/css/main.css", "~/assets/css/extra.css"],

  build: { 
    transpile: ["echarts", "echarts-liquidfill"],
  },

  vite: {
    resolve: {
      alias: { "echarts/lib/util/number": "echarts/lib/util/number.js" },
    },
    css: {
      preprocessorOptions: {
        scss: { api: "modern" },
      },
    },
    server: {
      hmr: {
        protocol: "ws",
        host: "localhost",
      },
    },
  
    build: {
      target: "esnext",
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Only chunk very large dependencies to avoid circular dependency issues
            if (id.includes("node_modules/echarts")) {
              return "echarts";
            }
            // Let Vite handle other chunking automatically
          },
        },
      },
    },
    optimizeDeps: {
      include: [
        "echarts",
        "echarts-liquidfill",
        "@nuxt/ui",
      ],
    },
    ssr: {
      noExternal: [
        "nuxt-echarts",
        "echarts",
        "echarts-liquidfill",
        "@noble/curves",
        "@noble/hashes",
      ],
    },
  },

  nitro: {
    preset: "cloudflare-pages",
    compressPublicAssets: { brotli: true, gzip: true },
    minify: true,
    sourceMap: false,
    timing: false,
    prerender: {
      crawlLinks: false,
      routes: generateRoutes(),
      failOnError: false,
      autoSubfolderIndex: false,
      concurrency: 10,
    },
    cloudflare: {
      pages: {
        routes: {
          exclude: ["/api/*"],
        },
      },
    },
  },
  ui: { fonts: false },
  image: {
    provider: process.env.NODE_ENV === "production" ? "cloudflare" : "none",
    screens: {
      default: 320,
      xxs: 480,
      xs: 576,
      sm: 768,
      md: 996,
      lg: 1200,
      xl: 1367,
      xxl: 1600,
      "4k": 1921,
    },
    cloudflare: {
      baseURL: process.env.NUXT_BASE_URL || "https://mohet.ir",
    },
    quality: 70,
    domains: ["mohet.ir", "i.ytimg.com", "vumbnail.com"],
    alias: {
      youtube: "i.ytimg.com",
      vimeo: "vumbnail.com",
    },
  },

  i18n: {
    langDir: "locales",
    defaultLocale: "fa",
    strategy: "prefix",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n",
      redirectOn: "root",
    },
    locales: [
      {
        name: "فارسی",
        dir: "rtl",
        code: "fa",
        file: "fa.js",
      },
      {
        name: "English",
        dir: "ltr",
        code: "en",
        file: "en.js",
      },
    ],
    compilation: {
      strictMessage: false,
      escapeHtml: false,
    },
    experimental: {
      localeDetector: "localeDetector.ts",
    },
  },

  routeRules: {
    "/api/**": {
      ssr: true,
      cors: true,
    },
    "/": {
      prerender: false,
      ssr: false,
    },
    "/:locale/manage": { 
      prerender: false, 
      ssr: false,
    },
    "/:locale/manage/**": { 
      prerender: false, 
      ssr: false,
    },
    "/:locale": { 
      swr: 3600,
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    },
    "/:locale/**": { 
      swr: 3600,
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    },
  },

  experimental: {
    restoreState: true,
    payloadExtraction: true,
    componentIslands: true,
    headNext: true,
    inlineRouteRules: true,
  },

  echarts: {
    renderer: ["svg"],
    charts: ["BarChart", "LineChart"],
    components: [
      "DatasetComponent",
      "GridComponent",
      "TooltipComponent",
      "ToolboxComponent",
      "VisualMapComponent",
      "LegendComponent",
    ],
  },

  runtimeConfig: {
    githubToken: process.env.NUXT_APP_GITHUB_TOKEN || "",
    githubOwner: process.env.NUXT_APP_GITHUB_OWNER || "",
    githubRepo: process.env.NUXT_APP_GITHUB_REPO || "",
    flareToken: process.env.NUXT_APP_FLARE_TOKEN || "",
    flareZoneId: process.env.NUXT_APP_FLARE_ZONE_ID || "",
    app: {},
    turnstile: {
      secretKey: process.env.NUXT_TURNSTILE_SECRET_KEY || "",
    },
  },

  turnstile: {
    siteKey: process.env.NUXT_TURNSTILE_SITE_KEY || "",
    addValidateEndpoint: true,
  },
  alias: {
    "#velite": resolve(__dirname, "./.velite"),
  },
  mdc: {
    highlight: false,
  },
  robots: {
    disallow: ["/manage", "/profile"],
  },

  icon: {
    serverBundle: {
      collections: ["lucide"],
    },
    timeout: 5000,
  },
});
