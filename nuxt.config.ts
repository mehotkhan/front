import { resolve } from "path";
import viteCompression from "vite-plugin-compression";

import { generateRoutes } from "./scripts/prerender";

export default defineNuxtConfig({
  future: { compatibilityVersion: 4 },
  compatibilityDate: "2025-01-27",
  devtools: { enabled: false },
  spaLoadingTemplate: true,

  modules: [
    "@nuxt/ui",
    "@nuxt/image",
    "nuxt-auth-utils",
    "nitro-cloudflare-dev",
    "nuxt-tiptap-editor",
    "@nuxtjs/i18n",
    "nuxt-authorization",
    "nuxt-echarts",
    "@nuxtjs/turnstile",
    "@nuxtjs/mdc",
    "@nuxtjs/sitemap",
    "@nuxtjs/robots",
    "@nuxt/eslint",
    "nuxt-booster",
    "nuxt-delay-hydration",
  ],

  css: ["~/assets/css/main.css", "~/assets/css/extra.css"],
  build: { transpile: ["echarts", "echarts-liquidfill"] },

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
      target: "esnext",
      minify: "esbuild",
      cssMinify: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["vue", "vue-router"],
            liquidfill: ["echarts-liquidfill"],
          },
        },
      },
    },
    optimizeDeps: {
      include: [
        "echarts",
        "echarts-liquidfill",
        "@tiptap/extension-placeholder",
        "@tiptap/starter-kit",
        "@tiptap/vue-3",
        "tiptap-markdown",
        "tiptap-extension-auto-joiner"
      ],
    },
    ssr: {
      noExternal: [
        "nuxt-echarts",
        "echarts",
        "echarts-liquidfill",
        "@tiptap/extension-placeholder",
        "@tiptap/starter-kit",
        "@tiptap/vue-3",
        "tiptap-markdown",
        "tiptap-extension-auto-joiner"
      ],
    },
  },

  nitro: {
    preset: "cloudflare-pages",
    compressPublicAssets: { brotli: true },
    minify: true,
    prerender: {
      crawlLinks: false,
      routes: generateRoutes(),
      failOnError: true,
      autoSubfolderIndex: false,
    },
  },
  ui: { fonts: false },
  image: {
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
      baseURL: process.env.NUXT_BASE_URL,
    },
    formats: ["webp", "avif"],
    density: [1, 2],
    quality: 70,
  },

  i18n: {
    bundle: {
      optimizeTranslationDirective: false,
    },
    lazy: true,
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
    langDir: "locales",
    defaultLocale: "fa",
    strategy: "prefix",
    experimental: {
      localeDetector: "localeDetector.ts",
      // generatedLocaleFilePathFormat: "off",
    },
  },

  routeRules: {
    "/api/**": {
      ssr: true,
    },
    "/:locale/manage": { prerender: false, ssr: false },
    "/:locale/manage/**": { prerender: false, ssr: false },
  },

  experimental: {
    restoreState: true,
    payloadExtraction: false,
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
  booster: {
    detection: {
      performance: true,
      browserSupport: true,
    },
    performanceMetrics: {
      device: {
        hardwareConcurrency: { min: 2, max: 48 },
        deviceMemory: { min: 2 },
      },
      timing: {
        fcp: 800,
        dcl: 1200,
      },
    },
    optimizeSSR: {
      cleanPreloads: true,
      cleanPrefetches: true,
      inlineStyles: true,
    },
    disableNuxtFontaine: true,
    disableNuxtImage: true,
    experimental: {
      fallbackInit: true,
    },
  },
  delayHydration: {
    mode: "mount", // or 'manual' or 'mount'
    debug: process.env.NODE_ENV === "development",
  },
  robots: {
    disallow: ["/manage", "/profile"],
  },
});
