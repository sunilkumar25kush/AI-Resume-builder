import path from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

/**
 * Injects `<link rel="preload">` for the primary UI font (Geist, latin subset)
 * so the browser fetches it in parallel with the CSS instead of discovering it
 * only after the stylesheet is parsed (HTML → CSS → font critical chain).
 */
function preloadCriticalFonts(): Plugin {
  return {
    name: "preload-critical-fonts",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(_html, ctx) {
        if (!ctx.bundle) return [];
        return Object.keys(ctx.bundle)
          .filter((file) => /geist-latin-wght-normal.*\.woff2$/.test(file))
          .map((file) => ({
            tag: "link",
            attrs: {
              rel: "preload",
              as: "font",
              type: "font/woff2",
              href: `/${file}`,
              crossorigin: "anonymous",
            },
            injectTo: "head-prepend" as const,
          }));
      },
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), preloadCriticalFonts()],
  resolve: {
    alias: {
      "@": path.fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5001",
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: "http://127.0.0.1:5001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    target: "es2022",
    cssMinify: true,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        /*
         * Only the React core is pinned into a long-term-cacheable vendor chunk.
         * Everything else (radix, framer-motion, gsap, three, forms, crop, ...) is
         * left to the bundler so each library ships ONLY with the lazy route that
         * actually uses it. Forcing them into big shared vendor chunks made the
         * entry modulepreload ~500 KB of JS that the first page never executes.
         */
        manualChunks: (id) => {
          if (
            /[\\/]node_modules[\\/](react|react-dom|scheduler|react-router)[\\/]/.test(id)
          ) {
            return "vendor-react";
          }
          // Tree-shaken icons are tiny (~0.3 KB each); bundling the used ones
          // together avoids dozens of extra round-trips on mobile networks.
          if (/[\\/]node_modules[\\/]lucide-react[\\/]/.test(id)) {
            return "vendor-icons";
          }
        },
      },
    },
  },
});
