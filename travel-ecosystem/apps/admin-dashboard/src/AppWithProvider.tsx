import { Provider } from 'react-redux';
import { useEffect } from 'react';
import { store } from './store';
import App from './App';
import './index.css';

export default function AppWithProvider() {
  useEffect(() => {
    // Dynamically inject CSS for module federation when a remote bundle requires it
    const cssId = 'admin-dashboard-styles';
    if (document.getElementById(cssId)) {
      return;
    }

    const globalWindow = window as typeof window & {
      __ADMIN_DASHBOARD_CSS_URL?: string;
    };

    const configuredHref =
      import.meta.env.VITE_ADMIN_REMOTE_CSS_URL || globalWindow.__ADMIN_DASHBOARD_CSS_URL;

    if (!configuredHref) {
      if (import.meta.env.DEV) {
        console.info('Admin dashboard remote CSS URL not provided; relying on bundled styles.');
      }
      return;
    }

    const href = configuredHref.startsWith('http')
      ? configuredHref
      : new URL(
          configuredHref.startsWith('/') ? configuredHref : `/${configuredHref}`,
          window.location.origin
        ).toString();

    const link = document.createElement('link');
    link.id = cssId;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }, []);

  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}
