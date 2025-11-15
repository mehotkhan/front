import { resolve } from "path";
import viteCompression from "vite-plugin-compression";

import { generateRoutes } from "./scripts/prerender";

export default defineNuxtConfig({
  compatibilityDate: "2025-11-15",
  devtools: { enabled: false },
  spaLoadingTemplate: true,
  
  // Performance optimizations
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
    "nuxt-booster",
    "nuxt-delay-hydration",
  ],

  css: ["~/assets/css/main.css", "~/assets/css/extra.css"],
  
  postcss: {
    plugins: {
      cssnano: {
        preset: ["default", {
          discardComments: { removeAll: true },
        }],
      },
    },
  },
  
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
    plugins: [
      viteCompression({
        algorithm: "brotliCompress",
        threshold: 1024,
      }),
    ],
    build: {
      target: "esnext",
      minify: "esbuild",
      cssMinify: true, // Use default minifier (more compatible than lightningcss)
      cssCodeSplit: true,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Core Vue framework
            if (id.includes("node_modules/vue/") || id.includes("node_modules/@vue/")) {
              return "vue-core";
            }
            // Router separate
            if (id.includes("node_modules/vue-router")) {
              return "vue-router";
            }
            // i18n separate chunk
            if (id.includes("node_modules/@intlify") || id.includes("node_modules/vue-i18n")) {
              return "i18n";
            }
            // Nuxt UI components
            if (id.includes("node_modules/@nuxt/ui")) {
              return "nuxt-ui";
            }
            // Echarts
            if (id.includes("node_modules/echarts") || id.includes("echarts-liquidfill")) {
              return "echarts";
            }
            // Other large vendors
            if (id.includes("node_modules")) {
              return "vendor";
            }
          },
          chunkFileNames: "_nuxt/[name]-[hash].js",
          entryFileNames: "_nuxt/[name]-[hash].js",
          assetFileNames: "_nuxt/[name]-[hash][extname]",
        },
      },
    },
    optimizeDeps: {
      include: [
        "echarts",
        "echarts-liquidfill",
      ],
    },
    ssr: {
      noExternal: [
        "nuxt-echarts",
        "echarts",
        "echarts-liquidfill",
      ],
    },
  },

  nitro: {
    preset: "cloudflare-pages",
    compressPublicAssets: { brotli: true, gzip: true },
    minify: true,
    sourceMap: false,
    timing: false,
    rollupConfig: {
      plugins: [
        {
          name: "fix-to-value-import",
          transform(code, id) {
            // Only process files that might have the issue
            if (!code.includes("toValue") || !code.includes("@vueuse/core")) {
              return null;
            }
            
            let modified = false;
            let newCode = code;
            
            // Handle import pattern: import { toValue, ...other } from '@vueuse/core'
            const importPattern = /import\s*\{([^}]*)\}\s*from\s*['"]@vueuse\/core['"]/g;
            
            newCode = newCode.replace(importPattern, (match, imports) => {
              if (!imports.includes("toValue")) {
                return match;
              }
              
              modified = true;
              const importsList = imports.split(",").map((i: string) => i.trim());
              const toValueImports = importsList.filter((i: string) => i.includes("toValue"));
              const otherImports = importsList.filter((i: string) => !i.includes("toValue"));
              
              let result = "";
              if (toValueImports.length > 0) {
                result += `import { ${toValueImports.join(", ")} } from 'vue';\n`;
              }
              if (otherImports.length > 0) {
                result += `import { ${otherImports.join(", ")} } from '@vueuse/core';`;
              }
              return result || match;
            });
            
            return modified ? { code: newCode, map: null } : null;
          },
        },
      ],
    },
    prerender: {
      crawlLinks: false,
      routes: generateRoutes(),
      failOnError: false, // Don't fail on icon timeout warnings during prerender
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
    provider: process.env.NODE_ENV === "production" ? "cloudflare" : "ipx",
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
    formats: ["webp", "avif"],
    density: [1, 2],
    quality: 70,
    // Configure domains for nuxt-booster YouTube/Vimeo components (even if not used)
    domains: ["mohet.ir", "i.ytimg.com", "vumbnail.com"],
    alias: {
      youtube: "i.ytimg.com",
      vimeo: "vumbnail.com",
    },
  },

  i18n: {
    lazy: true,
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
    // Exclude root route from prerendering (i18n prefix strategy redirects it)
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
    // Cache static pages aggressively
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
    // ssr: true,
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
    targetFormats: ["webp", "avif"],
    componentAutoImport: false,
    componentPrefix: undefined,
    lazyOffset: {
      component: "0%",
      asset: "0%",
    },
  },
  delayHydration: {
    mode: "init",
    debug: process.env.NODE_ENV === "development",
    replayClick: true,
  },
  robots: {
    disallow: ["/manage", "/profile"],
  },
  
  // Icon configuration - use local mode and increase timeout
  icon: {
    serverBundle: {
      collections: ["lucide"],
    },
    timeout: 5000, // Increase timeout from default 1500ms to 5000ms
  },
});
