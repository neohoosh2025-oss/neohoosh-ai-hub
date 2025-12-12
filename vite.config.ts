import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "robots.txt"],
      manifest: {
        id: "neohoosh-pwa",
        name: "نئوهوش - پلتفرم هوش مصنوعی",
        short_name: "نئوهوش",
        description: "آموزش، محتوا و کاربردهای هوش مصنوعی برای کاربران فارسی‌زبان",
        theme_color: "#7C3AED",
        background_color: "#0D0D0D",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        dir: "rtl",
        lang: "fa",
        categories: ["productivity", "utilities", "education"],
        prefer_related_applications: false,
        icons: [
          {
            src: "/favicon.png",
            sizes: "48x48",
            type: "image/png"
          },
          {
            src: "/favicon.png",
            sizes: "72x72",
            type: "image/png"
          },
          {
            src: "/favicon.png",
            sizes: "96x96",
            type: "image/png"
          },
          {
            src: "/favicon.png",
            sizes: "128x128",
            type: "image/png"
          },
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/icon-192.png",
            sizes: "384x384",
            type: "image/png"
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ],
        // App shortcuts for quick actions
        shortcuts: [
          {
            name: "چت با AI",
            short_name: "چت",
            description: "شروع گفتگو با هوش مصنوعی",
            url: "/chat",
            icons: [{ src: "/favicon.png", sizes: "96x96" }]
          },
          {
            name: "تولید تصویر",
            short_name: "تصویر",
            description: "ساخت تصویر با AI",
            url: "/tools/image-generator",
            icons: [{ src: "/favicon.png", sizes: "96x96" }]
          },
          {
            name: "صدا به متن",
            short_name: "صدا",
            description: "تبدیل ویس به متن",
            url: "/tools/voice-to-text",
            icons: [{ src: "/favicon.png", sizes: "96x96" }]
          },
          {
            name: "تماس صوتی",
            short_name: "تماس",
            description: "مکالمه صوتی با AI",
            url: "/voice-call",
            icons: [{ src: "/favicon.png", sizes: "96x96" }]
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,jpg,jpeg,webp,json}"],
        // Offline fallback
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api/, /^\/supabase/],
        // Skip waiting and claim clients immediately
        skipWaiting: true,
        clientsClaim: true,
        // Clean old caches
        cleanupOutdatedCaches: true,
        // Runtime caching strategies
        runtimeCaching: [
          // Google Fonts - Cache First (long-term)
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // CDN assets - Cache First
          {
            urlPattern: /^https:\/\/cdn\..*\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "cdn-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Images - Cache First with network fallback
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // API calls - Network First with cache fallback (for offline support)
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 // 1 hour
              },
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Auth endpoints - Network Only (no caching for security)
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/auth\/.*/i,
            handler: "NetworkOnly"
          },
          // Storage/Assets from Supabase - Cache First
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "supabase-storage-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Edge Functions - Network First
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/functions\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "edge-functions-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 minutes
              },
              networkTimeoutSeconds: 15,
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Static assets - Stale While Revalidate
          {
            urlPattern: /\.(?:js|css)$/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "static-resources",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          },
          // HTML pages - Network First for fresh content
          {
            urlPattern: /\.html$/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "html-cache",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 // 1 day
              },
              networkTimeoutSeconds: 5
            }
          }
        ]
      },
      devOptions: {
        enabled: false
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
    force: true,
  },
}));
