/**
 * Vite Configuration with Module Federation
 * Purpose: Build configuration for React micro-frontend with Module Federation
 * Architecture: As specified in claude.md - Vite + Module Federation for RAIH integration
 *
 * Provides:
 * - Module Federation setup to expose blog components
 * - React + TypeScript support
 * - PWA plugin integration
 * - Build optimization
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import federation from '@originjs/vite-plugin-federation';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),

    // Module Federation - expose blog components as remotes
    federation({
      name: 'blog',
      filename: 'remoteEntry.js',
      // Expose components that can be consumed by the host app
      exposes: {
        './PostList': './components/PostList',
        './PostItem': './components/PostItem',
        './BlogPost': './components/BlogPost',
        './SEOHead': './SEOHead',
        './CategoryFilter': './components/CategoryFilter',
        './Tag': './components/Tag',
        './Breadcrumbs': './components/Breadcrumbs',
      },
      // Shared dependencies with host app
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^18.2.0',
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.2.0',
        },
      },
    }),

    // PWA Plugin
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon-192x192.png', 'icon-512x512.png'],
      manifest: {
        name: 'RAIH Blog',
        short_name: 'NookBlog',
        description: 'Travel blog and stories from nomadic travelers',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        // Cache API responses
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.nomadicnook\.com\/api\/posts/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
              },
            },
          },
        ],
      },
    }),
  ],

  // Build optimization
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: 'esbuild',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },

  // Server configuration
  server: {
    port: 3000,
    host: true,
    cors: true,
  },

  // Preview configuration
  preview: {
    port: 3000,
    host: true,
  },

  // Resolve aliases
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/components',
      '@hooks': '/hooks',
      '@services': '/services',
      '@utils': '/utils',
      '@styles': '/styles',
    },
  },
});
