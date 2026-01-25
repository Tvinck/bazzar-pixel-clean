import '@telegram-apps/telegram-ui/dist/styles.css';
import React, { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { SoundProvider } from './context/SoundContext';
import { ToastProvider } from './context/ToastContext';
import { UserProvider, useUser } from './context/UserContext';
import ErrorBoundary from './components/ErrorBoundary';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { ThemeProvider } from './context/ThemeContext';

// Layout Components
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';

// Lazy Load Views
const HomeView = React.lazy(() => import('./views/HomeView'));
const GalleryView = React.lazy(() => import('./views/GalleryView'));
const ProfileView = React.lazy(() => import('./views/ProfileView'));
const HistoryView = React.lazy(() => import('./views/HistoryView'));

// Full Screen Pages (New)
const CreateView = React.lazy(() => import('./views/CreateView'));
const GenerationView = React.lazy(() => import('./views/GenerationView'));
const TemplateView = React.lazy(() => import('./views/TemplateView'));
const UserProfileView = React.lazy(() => import('./views/UserProfileView'));
const AdminView = React.lazy(() => import('./views/AdminView'));
const PaymentSuccessView = React.lazy(() => import('./views/PaymentSuccessView'));
const NotFoundView = React.lazy(() => import('./views/NotFoundView'));

// Modals/Drawers
const PaymentDrawer = React.lazy(() => import('./components/PaymentDrawer'));
const LeaderboardDrawer = React.lazy(() => import('./components/LeaderboardDrawer'));
const InpaintingEditor = React.lazy(() => import('./components/tools/InpaintingEditor'));
const FaceSwap = React.lazy(() => import('./components/tools/FaceSwap'));
const AvatarTrainer = React.lazy(() => import('./components/tools/AvatarTrainer'));
const OnboardingOverlay = React.lazy(() => import('./components/OnboardingOverlay'));
const DailyBonusModal = React.lazy(() => import('./components/DailyBonusModal'));
const NotificationsPanel = React.lazy(() => import('./components/NotificationsPanel'));
const GenerationLoader = React.lazy(() => import('./components/GenerationLoader'));
const GenerationResult = React.lazy(() => import('./components/GenerationResult'));

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [telegramUser, setTelegramUser] = useState(null);
  /* State */
  const [isOnboardingVisible, setIsOnboardingVisible] = useState(false);
  const { stats } = useUser();

  // Ref to prevent deep link loop
  const hasHandledDeepLink = useRef(false);

  // Layout Logic
  const mainTabs = ['/', '/gallery', '/history', '/profile'];
  console.log('📍 Path:', location.pathname, 'Onboarding:', isOnboardingVisible);

  // Force layout if we are in the "Tap Create" step of onboarding (step 1)
  const showLayout = mainTabs.includes(location.pathname) || isOnboardingVisible;

  const currentPath = location.pathname === '/' ? 'home' : location.pathname.substring(1);
  const activeTab = ['gallery', 'history', 'profile'].includes(currentPath) ? currentPath : 'home';

  // State for Global Modals
  const [showDailyBonus, setShowDailyBonus] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [hasPaymentMounted, setHasPaymentMounted] = useState(false);

  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [hasLeaderboardMounted, setHasLeaderboardMounted] = useState(false);

  const [isInpaintingOpen, setIsInpaintingOpen] = useState(false);
  const [hasInpaintingMounted, setHasInpaintingMounted] = useState(false);

  const [isFaceSwapOpen, setIsFaceSwapOpen] = useState(false);
  const [hasFaceSwapMounted, setHasFaceSwapMounted] = useState(false);

  const [isAvatarTrainerOpen, setIsAvatarTrainerOpen] = useState(false);
  const [hasAvatarTrainerMounted, setHasAvatarTrainerMounted] = useState(false);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const isDarkMode = document.documentElement.classList.contains('dark');

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      setTelegramUser(tg.initDataUnsafe?.user);

      // Check for start_param (Deep Linking) - ONCE PER SESSION
      if (!hasHandledDeepLink.current) {
        const startParam = tg.initDataUnsafe?.start_param;

        if (startParam && startParam.startsWith('payment_success')) {
          hasHandledDeepLink.current = true; // Gatekeeper

          const parts = startParam.split('__');
          const orderId = parts[1];

          // Check if already processed locally to prevent loop
          const processed = JSON.parse(localStorage.getItem('processed_orders') || '[]');
          if (processed.includes(orderId)) {
            console.log('⚠️ Order already processed locally, skipping check:', orderId);
            navigate('/profile');
          } else {
            navigate('/payment/success', { state: { orderId } });
          }
        }
      }

      try {
        // Core Initialization
        tg.expand();
        tg.ready();

        // New Features (Latest Tech)
        // 1. Fullscreen (Removes header entirely on supported clients)
        if (tg.requestFullscreen) {
          tg.requestFullscreen();
        }

        // 2. Vertical Swipes (Prevent accidental close)
        if (tg.disableVerticalSwipes) {
          tg.disableVerticalSwipes();
        }

        // 3. Closing Confirmation (Prevent accidental exit)
        if (tg.enableClosingConfirmation) {
          tg.enableClosingConfirmation();
        }

        // 4. Color Scheme & Header Match
        const isDark = tg.colorScheme === 'dark';
        if (isDark) {
          document.documentElement.classList.add('dark');
        }

        // Immediate Header Color Set (Fallback if fullscreen fails)
        const headerColor = isDark ? '#0f1014' : '#ffffff'; // Matches bg-pixel-dark / bg-slate-50
        if (tg.setHeaderColor) tg.setHeaderColor(headerColor);
        if (tg.setBackgroundColor) tg.setBackgroundColor(headerColor);

        // 5. Settings Button (Native)
        if (tg.SettingsButton) {
          tg.SettingsButton.show();
          tg.SettingsButton.onClick(() => {
            navigate('/profile');
          });
        }
      } catch (e) { console.error('TG Init Error:', e); }
    }
  }, [navigate]);

  useEffect(() => {
    const isCompleted = localStorage.getItem('pixel_onboarding_v2_completed');
    if (!isCompleted) {
      setTimeout(() => setIsOnboardingVisible(true), 1000);
    }
  }, []);

  // Handle Telegram Back Button
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    // Handle back button click
    const handleBackButton = () => {
      console.log('🔙 Telegram back button pressed');
      if (location.pathname !== '/') {
        navigate(-1);
      }
    };

    tg.onEvent('backButtonClicked', handleBackButton);

    // Control back button visibility based on route
    const mainRoutes = ['/', '/gallery', '/history', '/profile'];
    const isMainRoute = mainRoutes.includes(location.pathname);

    if (isMainRoute) {
      tg.BackButton.hide();
    } else {
      tg.BackButton.show();
    }

    // Set Header Color to match Theme
    const headerColor = isDarkMode ? '#0f1014' : '#ffffff';
    if (tg.setHeaderColor) tg.setHeaderColor(headerColor);
    if (tg.setBackgroundColor) tg.setBackgroundColor(headerColor);

    return () => {
      tg.offEvent('backButtonClicked', handleBackButton);
    };
  }, [location.pathname, navigate, isDarkMode]);

  const triggerHaptic = useCallback((style) => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  }, []);

  // Navigation Handler
  const handleTabChange = useCallback((tab) => {
    triggerHaptic('light');

    // Force header color update
    if (window.Telegram?.WebApp) {
      const headerColor = document.documentElement.classList.contains('dark') ? '#0f1014' : '#ffffff';
      window.Telegram.WebApp.setHeaderColor?.(headerColor);
      window.Telegram.WebApp.setBackgroundColor?.(headerColor);
    }

    navigate(tab === 'home' ? '/' : `/${tab}`);
  }, [navigate, triggerHaptic]);

  // Openers / Navigators
  const openPayment = () => { setIsPaymentOpen(true); setHasPaymentMounted(true); triggerHaptic('medium'); };
  const openLeaderboard = () => { setIsLeaderboardOpen(true); setHasLeaderboardMounted(true); triggerHaptic('medium'); };
  const openInpainting = () => { setIsInpaintingOpen(true); setHasInpaintingMounted(true); triggerHaptic('medium'); };
  const openFaceSwap = () => { setIsFaceSwapOpen(true); setHasFaceSwapMounted(true); triggerHaptic('medium'); };
  const openAvatarTrainer = () => { setIsAvatarTrainerOpen(true); setHasAvatarTrainerMounted(true); triggerHaptic('medium'); };

  const openTemplate = (template) => {
    triggerHaptic('medium');
    navigate(`/template/${template.id}`);
  };

  const openCreation = (type, initialPrompt = '', model = null) => {
    if (type === 'Magic Eraser') { openInpainting(); return; }
    if (type === 'Face Swap') { openFaceSwap(); return; }
    if (type === 'Avatar Training') { openAvatarTrainer(); return; }

    triggerHaptic('medium');
    navigate(`/generate/${encodeURIComponent(type)}`, { state: { prompt: initialPrompt, model } });
  };

  const handleOnboardingComplete = useCallback(() => {
    setIsOnboardingVisible(false);
    localStorage.setItem('pixel_onboarding_v2_completed', 'true');
  }, []);

  const handleOnboardingAction = (actionId) => {
    if (actionId === 'create_click') { navigate('/create'); }
    if (actionId === 'trigger_fake_gen') {
      navigate('/generate/image-gen', { state: { prompt: "A cute futuristic robot painting digital art, neon style" } });
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-pixel-dark' : 'bg-slate-50'}`}>

      {/* Background Noise used globally */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 dark:opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 dark:brightness-100 contrast-150 dark:contrast-100 mix-blend-overlay"></div>

      {showLayout && (
        <Header
          onTabChange={handleTabChange}
          onOpenPayment={openPayment}
          balance={stats?.current_balance || 0}
          isDark={isDarkMode}
        />
      )}

      {/* Routed Main Content */}
      <main className={`relative z-10 min-h-screen ${showLayout ? 'pt-36 pb-24' : ''}`}>
        <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>}>
          <Routes>
            {/* Main Tabs */}
            <Route path="/" element={<HomeView onOpenCreation={openCreation} onOpenTemplate={openTemplate} onOpenLeaderboard={openLeaderboard} />} />
            <Route path="/gallery" element={<GalleryView onRemix={(creation) => openCreation('image-gen', creation.prompt)} />} />
            <Route path="/history" element={<HistoryView />} />
            <Route path="/profile" element={<ProfileView isDark={isDarkMode} onOpenPayment={openPayment} />} />

            {/* Full Pages */}
            <Route path="/create" element={<CreateView />} />
            <Route path="/generate/:type" element={<GenerationView onOpenPayment={openPayment} />} />
            <Route path="/template/:id" element={<TemplateView />} />
            <Route path="/user/:userId" element={<UserProfileView />} />
            <Route path="/admin" element={<AdminView />} />
            <Route path="/payment/success" element={<PaymentSuccessView />} />
            <Route path="*" element={<NotFoundView />} />
          </Routes>
        </Suspense>
      </main>

      {showLayout && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onCreateClick={() => {
            triggerHaptic('medium');
            navigate('/create');
            if (isOnboardingVisible && window.__onboardingAdvance) window.__onboardingAdvance();
          }}
          isVisible={true}
          zIndex={isOnboardingVisible ? 9999 : 50}
        />
      )}

      {/* Global Modals (Only non-page ones left) */}
      {(isPaymentOpen || hasPaymentMounted) && (
        <Suspense fallback={null}>
          <PaymentDrawer isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} />
        </Suspense>
      )}

      {(isLeaderboardOpen || hasLeaderboardMounted) && (
        <Suspense fallback={null}>
          <LeaderboardDrawer isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} />
        </Suspense>
      )}

      {(isInpaintingOpen || hasInpaintingMounted) && (
        <Suspense fallback={null}>
          <InpaintingEditor isOpen={isInpaintingOpen} onClose={() => setIsInpaintingOpen(false)} />
        </Suspense>
      )}

      {(isFaceSwapOpen || hasFaceSwapMounted) && (
        <Suspense fallback={null}>
          <FaceSwap isOpen={isFaceSwapOpen} onClose={() => setIsFaceSwapOpen(false)} />
        </Suspense>
      )}

      {(isAvatarTrainerOpen || hasAvatarTrainerMounted) && (
        <Suspense fallback={null}>
          <AvatarTrainer isOpen={isAvatarTrainerOpen} onClose={() => setIsAvatarTrainerOpen(false)} />
        </Suspense>
      )}

      {(isOnboardingVisible) && (
        <Suspense fallback={null}>
          <OnboardingOverlay
            isVisible={isOnboardingVisible}
            onComplete={handleOnboardingComplete}
            onStepAction={handleOnboardingAction}
          />
        </Suspense>
      )}

      <Suspense fallback={null}>
        <DailyBonusModal isOpen={showDailyBonus} onClose={() => setShowDailyBonus(false)} user={telegramUser} />
      </Suspense>

      <Suspense fallback={null}>
        <NotificationsPanel
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
        />
      </Suspense>

      {/* Global Generation UI (Moved here to fix React Error #310) */}
      <GlobalGenerationOverlay />
    </div>
  );
}

const GlobalGenerationOverlay = () => {
  const { activeGeneration, closeGlobalGen } = useUser();
  if (!activeGeneration.showLoader && !activeGeneration.resultData) return null;

  return (
    <Suspense fallback={null}>
      {activeGeneration.showLoader && (
        <GenerationLoader
          type={activeGeneration.type}
          estimatedTime={activeGeneration.estimatedTime}
        />
      )}
      {activeGeneration.resultData && (
        <GenerationResult
          result={activeGeneration.resultData}
          type={activeGeneration.type}
          onClose={closeGlobalGen}
          onRemix={closeGlobalGen}
        />
      )}
    </Suspense>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <ThemeProvider>
            <SoundProvider>
              <ToastProvider>
                <UserProvider>
                  <Router>
                    <AppRoot
                      appearance={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
                      platform={['macos', 'ios'].includes(window.Telegram?.WebApp?.platform) ? 'ios' : 'base'}
                    >
                      <AppContent />
                    </AppRoot>
                  </Router>
                </UserProvider>
              </ToastProvider>
            </SoundProvider>
          </ThemeProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
