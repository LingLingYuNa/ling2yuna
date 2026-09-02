import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// ⭐ 徹底清理註銷舊版 PWA Service Worker 與 CacheStorage，解決瀏覽器 SW 衝突白屏問題 ⭐
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (let registration of registrations) {
      registration.unregister();
    }
  }).catch((err) => {
    console.warn('Failed to unregister SW:', err);
  });

  if ('caches' in window) {
    caches.keys().then((names) => {
      for (let name of names) {
        caches.delete(name);
      }
    }).catch((err) => {
      console.warn('Failed to clear caches:', err);
    });
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
