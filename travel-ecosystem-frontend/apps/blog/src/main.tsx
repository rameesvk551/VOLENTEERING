/**
 * Main Entry Point
 * Purpose: Application bootstrap with service worker registration
 * Architecture: React 18 with StrictMode and PWA support
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// ...removed incorrect import for index.css...
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Correcting import path for index.css
import '../styles/index.css';

// Render React app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA functionality
serviceWorkerRegistration.register({
  onSuccess: () => {
    console.log('[App] Content is cached for offline use');
  },
  onUpdate: (registration) => {
    console.log('[App] New content is available; please refresh');
    // Show update notification to user
    // TODO: Implement update notification UI
  },
});
