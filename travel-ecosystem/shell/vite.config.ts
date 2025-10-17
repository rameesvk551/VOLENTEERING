import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'shell',
      remotes: {
        blog: 'http://localhost:5001/assets/remoteEntry.js',
        visaExplorer: 'http://localhost:5002/assets/remoteEntry.js',
        travelHub: 'http://localhost:5003/assets/remoteEntry.js',
        tripPlanner: 'http://localhost:5004/assets/remoteEntry.js',
        volunteering: 'http://localhost:5005/assets/remoteEntry.js',
      },
      shared: ['react', 'react-dom', 'react-router-dom']
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
