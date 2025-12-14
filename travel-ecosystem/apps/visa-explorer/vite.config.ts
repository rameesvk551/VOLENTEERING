import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import { federation } from '@module-federation/vite'
import { fileURLToPath, URL } from 'node:url'

const resolvePath = (relativePath: string) => fileURLToPath(new URL(relativePath, import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    ...(federation({
      name: 'visaExplorer',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.2.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
        'react-router-dom': { singleton: true, requiredVersion: '^6.20.0' },
      }
    }) as unknown as PluginOption[])
  ],
  server: {
    port: 1004,
    strictPort: true,
    cors: true,
  },
  preview: {
    port: 1004,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': resolvePath('./src'),
      '@components': resolvePath('./src/components'),
      '@pages': resolvePath('./src/pages'),
      '@hooks': resolvePath('./src/hooks'),
      '@lib': resolvePath('./src/lib'),
      '@types': resolvePath('./src/types'),
      '@services': resolvePath('./src/services'),
      '@utils': resolvePath('./src/utils'),
    },
  },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  }
})
