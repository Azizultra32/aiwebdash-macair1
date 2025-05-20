import 'regenerator-runtime/runtime';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { registerServiceWorker } from './utils/serviceWorker';
import { initIndexedDB } from './utils/indexedDB';
import './index.css';
import App from './components/App';
import AuthProvider from './hooks/useAuth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Handle service worker messages
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data.type === 'GET_CURRENT_VERSION') {
      // Send current version to service worker
      const currentVersion = localStorage.getItem('app-version');
      event.source?.postMessage({
        type: 'CURRENT_VERSION',
        version: currentVersion,
      });
    } else if (event.data.type === 'UPDATE_AVAILABLE') {
      // Update stored version and reload
      localStorage.setItem('app-version', event.data.version);
    }
  });
}

// Initialize app services
const initializeServices = async () => {
  try {
    // Register Service Worker
    await registerServiceWorker();

    // Initialize IndexedDB through Web Worker
    await initIndexedDB();

    console.log('App services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize app services:', error);
  }
};

// Initialize services when the app starts
initializeServices();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
);
