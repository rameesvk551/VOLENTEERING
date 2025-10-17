/**
 * Service Worker Registration
 * Purpose: Register and manage service worker lifecycle
 * Architecture: As specified in claude.md - PWA service worker registration
 *
 * Provides:
 * - Service worker registration
 * - Update detection and notification
 * - Unregistration utility
 */

type Config = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
};

/**
 * Register service worker
 * Only works in production and over HTTPS
 */
export function register(config?: Config): void {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      registerValidSW(swUrl, config);
    });
  }
}

/**
 * Register valid service worker
 */
function registerValidSW(swUrl: string, config?: Config): void {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.log('[SW] Service worker registered:', registration);

      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New update available
              console.log('[SW] New content is available; please refresh.');

              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }

              // Prompt user to reload
              if (confirm('New version available! Reload to update?')) {
                installingWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            } else {
              // Content cached for offline use
              console.log('[SW] Content is cached for offline use.');

              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('[SW] Error during service worker registration:', error);
    });
}

/**
 * Unregister service worker
 */
export function unregister(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error('[SW] Error unregistering service worker:', error);
      });
  }
}

/**
 * Check for updates
 * Manually check for service worker updates
 */
export function checkForUpdates(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.update();
      })
      .catch((error) => {
        console.error('[SW] Error checking for updates:', error);
      });
  }
}
