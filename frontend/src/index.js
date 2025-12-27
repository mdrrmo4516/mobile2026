import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";
import * as serviceWorkerRegistration from './utils/serviceWorkerRegistration';
import cacheManager from './utils/cacheManager';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Register service worker for offline support
serviceWorkerRegistration.register({
  onSuccess: () => {
    console.log('App is ready for offline use!');
    // Pre-cache critical data after service worker is ready
    cacheManager.preCacheCriticalData().catch(err => {
      console.error('Failed to pre-cache critical data:', err);
    });
  },
  onUpdate: (registration) => {
    console.log('New version available! Please refresh.');
    // Optionally show update notification to user
    if (window.confirm('New version available! Refresh to update?')) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }
});
