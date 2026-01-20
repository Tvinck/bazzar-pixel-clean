import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initMonitoring } from './lib/monitoring'
import { tracking } from './lib/tracking'

// Initialize Telegram WebApp
if (window.Telegram?.WebApp) {
  const tg = window.Telegram.WebApp;

  console.log('🚀 Initializing Telegram WebApp...');

  // Basic initialization
  tg.ready();
  tg.expand();

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
  tg.enableClosingConfirmation();

  // Setup back button handler
  tg.BackButton.onClick(() => {
    console.log('📱 Back button clicked');
    // Dispatch custom event that app can listen to
    window.dispatchEvent(new CustomEvent('telegram-back-button'));
  });

  // Show back button by default (app will control visibility)
  tg.BackButton.show();

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
