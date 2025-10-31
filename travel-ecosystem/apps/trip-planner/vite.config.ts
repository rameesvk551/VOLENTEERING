import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

export default defineConfig({
  plugins: [
    react(),
    ...(federation({
      name: 'tripPlanner',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App',
      },
      shared: ['react', 'react-dom', 'react-router-dom']
    }) as unknown as PluginOption[])
  ],
  server: {
    port: 1005,
    strictPort: true,
    cors: true,
  },
  preview: {
    port: 1005,
    strictPort: true,
  },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
