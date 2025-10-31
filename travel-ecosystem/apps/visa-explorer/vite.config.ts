import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import { federation } from '@module-federation/vite'

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
      shared: ['react', 'react-dom', 'react-router-dom']
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
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  }
})
