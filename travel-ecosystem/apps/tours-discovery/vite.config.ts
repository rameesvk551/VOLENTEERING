import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@module-federation/vite';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'toursDiscovery',
      filename: 'remoteEntry.js',
      exposes: {
        './ToursApp': './src/App.tsx',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^18.2.0',
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.2.0',
        },
        'react-router-dom': {
          singleton: true,
          requiredVersion: '^6.20.0',
        },
      },
    }),
  ],
  server: {
    port: 1007,
    cors: true,
  },
  preview: {
    port: 1007,
  },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
});
