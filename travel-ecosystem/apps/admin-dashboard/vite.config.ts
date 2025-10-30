import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import path from 'path';

const sharedDeps = {
  react: { singleton: true, eager: true, requiredVersion: '^18.2.0' },
  'react-dom': { singleton: true, eager: true, requiredVersion: '^18.2.0' },
  'react-router-dom': { singleton: true, eager: true, requiredVersion: '^6.30.1' },
  'react-redux': { singleton: true, eager: true, requiredVersion: '^9.0.4' },
  '@reduxjs/toolkit': { singleton: true, requiredVersion: '^2.0.1' }
} satisfies Record<string, Record<string, unknown>>;

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'adminDashboard',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/AppWithProvider',
      },
      shared: sharedDeps
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5003,
    strictPort: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4002',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 5003,
    strictPort: true,
  },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  }
});
