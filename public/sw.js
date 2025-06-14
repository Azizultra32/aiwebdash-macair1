const CACHE_NAME = 'audio-dashboard-v1';
const VERSION_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes

// Add version check function
async function checkForUpdates() {
  try {
    // Request current version from client
    const clients = await self.clients.matchAll();
    for (const client of clients) {
      client.postMessage({ type: 'GET_CURRENT_VERSION' });
    }
  } catch (err) {
    console.log('Version check failed:', err);
  }
}

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

// Clear the interval used for checking updates when this worker is replaced
function cleanup() {
  if (self.__versionCheckInterval) {
    clearInterval(self.__versionCheckInterval);
  }
}

// Precache assets injected by Workbox during the build
// Fallback to an empty manifest in development or tests where
// Workbox does not inject __WB_MANIFEST.
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST || []);

// Install event - immediately activate the new service worker
self.addEventListener('install', () => {
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      checkForUpdates(), // Add version check on activation
    ])
  );
  // Start the interval timer after activation
  const intervalId = setInterval(checkForUpdates, VERSION_CHECK_INTERVAL);
  // Store the interval ID if needed for cleanup
  self.__versionCheckInterval = intervalId;

  // When this service worker is superseded, clear the version check interval
  self.addEventListener('controllerchange', cleanup);
  if (self.registration) {
    self.registration.addEventListener('updatefound', () => {
      const newWorker = self.registration?.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', cleanup);
      }
    });
  }
});

// Message event - handle version checks
self.addEventListener('message', async (event) => {
  if (event.data.type === 'CURRENT_VERSION') {
    const currentVersion = event.data.version;
    
    try {
      const response = await fetch('/version.json?t=' + Date.now(), {
        credentials: 'same-origin',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      const { version } = await response.json();
      
      if (version !== currentVersion) {
        await caches.delete(CACHE_NAME);
        // Notify clients to update version and reload
        self.clients.matchAll().then(clients => {
          clients.forEach(client => client.postMessage({ 
            type: 'UPDATE_AVAILABLE',
            version: version
          }));
        });
      }
    } catch (err) {
      console.log('Version comparison failed:', err);
    }
  }
});

// Fetch event - serve from cache, falling back to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((response) => {
          // Don't cache non-successful responses
          const isValidForCache = response && response.status === 200 && response.type === 'basic';
          if (!isValidForCache) {
            return response;
          }
          
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});
