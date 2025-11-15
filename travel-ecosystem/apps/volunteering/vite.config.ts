import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';
import { fileURLToPath, URL } from 'node:url';

const resolvePath = (relativePath: string) => fileURLToPath(new URL(relativePath, import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    ...(federation({
      name: 'volunteering',
      filename: 'remoteEntry.js',
      exposes: {
        './Router': './src/bootstrap.tsx',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.2.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
        'react-router-dom': { singleton: true, requiredVersion: '^6.22.0' },
        '@reduxjs/toolkit': { singleton: true, requiredVersion: '^1.9.7' },
        'react-redux': { singleton: true, requiredVersion: '^8.1.3' },
        '@tanstack/react-query': { singleton: true, requiredVersion: '^5.90.9' }
      }
    }) as unknown as PluginOption[])
  ],
  server: {
    port: 1006,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': resolvePath('./src'),
      '@components': resolvePath('./src/components'),
      '@pages': resolvePath('./src/pages'),
      '@styles': resolvePath('./src/styles'),
      '@redux': resolvePath('./src/redux'),
      '@server': resolvePath('./src/server'),
      '@config': resolvePath('./src/config'),
    },
  },
  preview: {
    port: 1006,
    strictPort: true,
  },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  }
});
