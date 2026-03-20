import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async';
import './index.css'
import App from './App.jsx'
import { initMonitoring } from './lib/monitoring'
import { tracking } from './lib/tracking'

// Check and apply Web Auth token if no native Telegram WebApp environment
const webAuthToken = localStorage.getItem('bazzar_web_auth');
if (!window.Telegram?.WebApp?.initData && webAuthToken) {
  try {
    const payloadBase64 = webAuthToken.split('.')[1];
    const decodedPayload = JSON.parse(decodeURIComponent(atob(payloadBase64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join('')));

    // Store securely in our own namespace to avoid Telegram SDK read-only conflicts
    window.__bazzar_auth__ = {
      initData: webAuthToken,
      user: {
        id: decodedPayload.id,
        username: decodedPayload.username || '',
        first_name: decodedPayload.first_name || '',
      }
    };

    console.log('✅ Injected Web Auth Token into browser session');
  } catch (e) {
    console.error("Failed to parse web token", e);
    localStorage.removeItem('bazzar_web_auth');
  }
}

// Initialize Monitoring & Analytics
initMonitoring();
tracking.init();

// Catch errors outside the React tree
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)
