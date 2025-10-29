import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'adminDashboard',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/AppWithProvider',
      },
      shared: ['react', 'react-dom', 'react-router-dom', 'react-redux', '@reduxjs/toolkit']
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
