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
import PageTransition from './components/PageTransition'; // Import Transition

// ... (imports remain)

// AppContent body...
// ...
{/* Routed Main Content */ }
<main className={`relative z-10 min-h-screen ${showLayout ? 'pt-52 pb-24' : ''}`}>
  <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>}>
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Main Tabs */}
        <Route path="/" element={<PageTransition><HomeView onOpenCreation={openCreation} onOpenTemplate={openTemplate} onOpenLeaderboard={openLeaderboard} /></PageTransition>} />
        <Route path="/gallery" element={<PageTransition><GalleryView onRemix={(creation) => openCreation('image-gen', creation.prompt)} /></PageTransition>} />
        <Route path="/history" element={<PageTransition><HistoryView /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><ProfileView isDark={isDarkMode} onOpenPayment={openPayment} /></PageTransition>} />

        {/* Full Pages */}
        <Route path="/create" element={<PageTransition><CreateView /></PageTransition>} />
        <Route path="/generate/:type" element={<PageTransition><GenerationView onOpenPayment={openPayment} /></PageTransition>} />
        <Route path="/template/:id" element={<PageTransition><TemplateView /></PageTransition>} />
        <Route path="/user/:userId" element={<PageTransition><UserProfileView /></PageTransition>} />
        <Route path="/admin" element={<PageTransition><AdminView /></PageTransition>} />
        <Route path="/payment/success" element={<PageTransition><PaymentSuccessView /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFoundView /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  </Suspense>
</main>

{
  showLayout && (
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
  )
}

{/* Global Modals */ }
      <Suspense fallback={null}>
        {isPaymentOpen || hasPaymentMounted ? (
            <PaymentDrawer isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} />
        ) : null}
      </Suspense>

      <Suspense fallback={null}>
        {isLeaderboardOpen || hasLeaderboardMounted ? (
            <LeaderboardDrawer isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} />
        ) : null}
      </Suspense>

      <Suspense fallback={null}>
        {isInpaintingOpen || hasInpaintingMounted ? (
            <InpaintingEditor isOpen={isInpaintingOpen} onClose={() => setIsInpaintingOpen(false)} />
        ) : null}
      </Suspense>

      <Suspense fallback={null}>
        {isFaceSwapOpen || hasFaceSwapMounted ? (
            <FaceSwap isOpen={isFaceSwapOpen} onClose={() => setIsFaceSwapOpen(false)} />
        ) : null}
      </Suspense>

      <Suspense fallback={null}>
        {isAvatarTrainerOpen || hasAvatarTrainerMounted ? (
            <AvatarTrainer isOpen={isAvatarTrainerOpen} onClose={() => setIsAvatarTrainerOpen(false)} />
        ) : null}
      </Suspense>

      <Suspense fallback={null}>
        {isOnboardingVisible && (
            <OnboardingOverlay
                isVisible={isOnboardingVisible}
                onComplete={handleOnboardingComplete}
                onStepAction={handleOnboardingAction}
            />
        )}
      </Suspense>

      <Suspense fallback={null}>
        <DailyBonusModal isOpen={showDailyBonus} onClose={() => setShowDailyBonus(false)} user={telegramUser} />
      </Suspense>

      <Suspense fallback={null}>
        <NotificationsPanel
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
        />
      </Suspense>

{/* Global Generation UI */ }
<GlobalGenerationOverlay />
    </div >
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
