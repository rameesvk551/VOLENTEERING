import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

const sharedDeps = {
  react: { singleton: true, eager: true, requiredVersion: '^18.2.0' },
  'react-dom': { singleton: true, eager: true, requiredVersion: '^18.2.0' },
  'react-router-dom': { singleton: true, eager: true, requiredVersion: '^6.20.0' },
  'react-redux': { singleton: true, eager: true, requiredVersion: '^9.0.4' },
  '@reduxjs/toolkit': { singleton: true, requiredVersion: '^2.0.1' },
  '@tanstack/react-query': { singleton: true, eager: true, requiredVersion: '^5.90.9' }
} satisfies Record<string, Record<string, unknown>>;

export default defineConfig({
  plugins: [
    react(),
    ...(federation({
      name: 'shell',
      remotes: {
        blog: {
          type: 'module',
          name: 'blog',
          entry: 'http://localhost:1002/remoteEntry.js',
        },
        visaExplorer: {
          type: 'module',
          name: 'visaExplorer',
          entry: 'http://localhost:1004/remoteEntry.js',
        },
        adminDashboard: {
          type: 'module',
          name: 'adminDashboard',
          entry: 'http://localhost:1003/remoteEntry.js',
        },
        tripPlanner: {
          type: 'module',
          name: 'tripPlanner',
          entry: 'http://localhost:1005/remoteEntry.js',
        },
        volunteering: {
          type: 'module',
          name: 'volunteering',
          entry: 'http://localhost:1006/remoteEntry.js',
        },
      },
      shared: sharedDeps
    }) as unknown as PluginOption[])
  ],
  server: {
    port: 1001,
    strictPort: true,
  },
  preview: {
    port: 1001,
    strictPort: true,
  },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  }
});
