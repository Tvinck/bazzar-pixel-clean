import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
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

// Initialize Telegram WebApp
if (window.Telegram?.WebApp && window.Telegram.WebApp.initData) {
  const tg = window.Telegram.WebApp;

  console.log('🚀 Initializing Telegram WebApp...');

  // Basic initialization
  if (typeof tg.ready === 'function') tg.ready();
  if (typeof tg.expand === 'function') tg.expand();

  // Configure header - try multiple methods
  try {
    // Method 1: Direct property
    tg.headerColor = '#000000';

    // Method 2: setHeaderColor method (if available)
    if (typeof tg.setHeaderColor === 'function') {
      tg.setHeaderColor('#000000');
    }

    // Method 3: Set background color
    tg.backgroundColor = '#000000';

    // Set theme params
    if (tg.themeParams) {
      tg.themeParams.bg_color = '#000000';
      tg.themeParams.secondary_bg_color = '#000000';
    }

    console.log('🎨 Header color configured');
  } catch (e) {
    console.warn('⚠️ Could not set header color:', e);
  }

  // Enable closing confirmation (optional)
  if (typeof tg.enableClosingConfirmation === 'function') tg.enableClosingConfirmation();

  // Setup back button handler
  if (tg.BackButton && typeof tg.BackButton.onClick === 'function') {
    tg.BackButton.onClick(() => {
      console.log('📱 Back button clicked');
      window.dispatchEvent(new CustomEvent('telegram-back-button'));
    });
    if (typeof tg.BackButton.show === 'function') tg.BackButton.show();
  }

  console.log('📱 Telegram WebApp initialized:', tg);
  console.log('👤 Telegram User Data:', tg.initDataUnsafe?.user);
  console.log('🎨 Header color set to:', tg.headerColor);
} else {
  console.warn('⚠️ Telegram WebApp SDK not loaded');
}

// Initialize Monitoring & Analytics
initMonitoring();
tracking.init();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
