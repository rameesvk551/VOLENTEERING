import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

const sharedDeps = {
  react: { singleton: true, eager: true, requiredVersion: '^18.2.0' },
  'react-dom': { singleton: true, eager: true, requiredVersion: '^18.2.0' },
  'react-router-dom': { singleton: true, eager: true, requiredVersion: '^6.30.1' }
} satisfies Record<string, Record<string, unknown>>;

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'shell',
      remotes: {
        blog: 'http://localhost:5001/assets/remoteEntry.js',
        visaExplorer: 'http://localhost:5002/assets/remoteEntry.js',
        adminDashboard: 'http://localhost:5003/assets/remoteEntry.js',
        tripPlanner: 'http://localhost:5004/assets/remoteEntry.js',
        volunteering: 'http://localhost:5005/assets/remoteEntry.js',
      },
  shared: sharedDeps
    })
  ],
  server: {
    port: 5000,
    strictPort: true,
  },
  preview: {
    port: 5000,
    strictPort: true,
  },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  }
});
