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

    // Mock the Telegram WebApp object
    window.Telegram = window.Telegram || {};
    window.Telegram.WebApp = window.Telegram.WebApp || {};

    // Some Telegram SDK versions seal the object. Safest way is to try defineProperty,
    // if it fails (Cannot redefine), we catch it and try normal assignment.
    try {
      Object.defineProperty(window.Telegram.WebApp, 'initData', {
        value: webAuthToken,
        writable: true,
        configurable: true
      });

      Object.defineProperty(window.Telegram.WebApp, 'initDataUnsafe', {
        value: {
          user: {
            id: decodedPayload.id,
            username: decodedPayload.username || '',
            first_name: decodedPayload.first_name || '',
          }
        },
        writable: true,
        configurable: true
      });
    } catch (e) {
      console.warn('Could not define property on WebApp, falling back to direct assignment');
      window.Telegram.WebApp.initData = webAuthToken;
      window.Telegram.WebApp.initDataUnsafe = {
        user: {
          id: decodedPayload.id,
          username: decodedPayload.username || '',
          first_name: decodedPayload.first_name || '',
        }
      };
    }

    // Mock required SDK functions to prevent runtime errors in the web
    window.Telegram.WebApp.ready = () => { };
    window.Telegram.WebApp.expand = () => { };
    window.Telegram.WebApp.enableClosingConfirmation = () => { };
    window.Telegram.WebApp.HapticFeedback = { impactOccurred: () => { }, notificationOccurred: () => { }, selectionChanged: () => { } };
    window.Telegram.WebApp.BackButton = { show: () => { }, hide: () => { }, onClick: () => { }, offClick: () => { } };
    window.Telegram.WebApp.openTelegramLink = (url) => window.open(url, '_blank');
    window.Telegram.WebApp.openLink = (url) => window.open(url, '_blank');

    console.log('✅ Injected Web Auth Token for browser session');
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
