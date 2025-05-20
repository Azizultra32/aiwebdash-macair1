const CACHE_NAME = 'audio-dashboard-v1';
const VERSION_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes

// Add version check function
async function checkForUpdates() {
  try {
    // Request current version from client
    const clients = await self.clients.matchAll();
    if (clients.length > 0) {
      clients[0].postMessage({ type: 'GET_CURRENT_VERSION' });
    }
  } catch (err) {
    console.log('Version check failed:', err);
  }
}

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

// Precache assets injected by Workbox during the build
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

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
          if (!response || response.status !== 200 || response.type !== 'basic') {
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
