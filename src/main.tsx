import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';

// Clean registration of the authoritative service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Unregister any rogue dev-sw workers to prevent collision
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const reg of registrations) {
        if (reg.active?.scriptURL.includes('dev-sw')) {
          reg.unregister();
        }
      }
    }).catch(() => {});

    // Register /sw.js for offline app shell and PWA installability
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).then((reg) => {
      console.log('Internet Mission ServiceWorker registered with scope:', reg.scope);
    }).catch((err) => {
      console.warn('ServiceWorker registration note:', err);
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);


