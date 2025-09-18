
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const isDev = process.env.NODE_ENV !== 'production'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    !isDev && VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['/icon.svg', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Aurevo - Smart Goal Tracking',
        short_name: 'Aurevo',
        description: 'Transform your dreams into achievable milestones with smart goal tracking, habits, and productivity tools.',
        theme_color: '#8b5cf6',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        orientation: 'portrait',
        icons: [
          {
            src: '/icon.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: '/icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ],
        categories: ['productivity', 'lifestyle', 'education'],
        screenshots: [],
        shortcuts: [
          {
            name: 'Add Goal',
            short_name: 'New Goal',
            description: 'Create a new goal',
            url: '/goals?action=new',
            icons: [{ src: '/icon.svg', sizes: '96x96' }]
          },
          {
            name: 'Check Habits',
            short_name: 'Habits',
            description: 'View your habits',
            url: '/goals?tab=habits',
            icons: [{ src: '/icon.svg', sizes: '96x96' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
        navigateFallback: null,
        navigateFallbackDenylist: [
          new RegExp('/__/auth/handler')
        ],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets'
            }
          },
          {
            urlPattern: /^https:\/\/firebaseapp\.com/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firebase-cache'
            }
          }
        ]
      },
      devOptions: {
        enabled: false
      }
    })
  ].filter(Boolean),
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          ui: ['framer-motion', 'lucide-react']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
