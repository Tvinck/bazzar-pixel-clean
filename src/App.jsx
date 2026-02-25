import "@telegram-apps/telegram-ui/dist/styles.css";
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { AppRoot } from "@telegram-apps/telegram-ui";
import { BrowserRouter as Router, useLocation, useNavigate } from "react-router-dom";

// Providers
import { LanguageProvider } from "./context/LanguageContext";
import { SoundProvider } from "./context/SoundContext";
import { ToastProvider } from "./context/ToastContext";
import { UserProvider, useUser } from "./context/UserContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ABTestProvider } from "./context/ABTestContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

// Hooks & Components
import { useMarketing } from "./hooks/useMarketing";
import { useTelegramInit } from "./hooks/useTelegramInit";
import ErrorBoundary from "./components/ErrorBoundary";
import Header from "./components/layout/Header";
import BottomNav from "./components/layout/BottomNav";
import Sidebar from "./components/layout/Sidebar";
import AppRoutes from "./routes/AppRoutes";
import GlobalModals from "./components/modals/GlobalModals";
import TemplateSelectionSheet from "./components/TemplateSelectionSheet";
import WebLogin from "./pages/WebLogin";
import MaintenanceView from "./views/MaintenanceView";

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, stats, isLoading, telegramId } = useUser();
  const { trackEvent, trackFunnel } = useMarketing(user);

  // State
  const [telegramUser, setTelegramUser] = useState(null);
  const [isOnboardingVisible, setIsOnboardingVisible] = useState(false);
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
  const [isStickerGenOpen, setIsStickerGenOpen] = useState(false);
  const [hasStickerGenMounted, setHasStickerGenMounted] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Template Sheet State
  const [selectedTemplateForSheet, setSelectedTemplateForSheet] = useState(null);

  // Initialize Telegram Mini App
  const tg = useTelegramInit(setTelegramUser);

  // Layout Logic
  const mainTabs = ["/", "/gallery", "/history", "/profile"];
  const showLayout = mainTabs.includes(location.pathname) || isOnboardingVisible;
  const currentPath = location.pathname === "/" ? "home" : location.pathname.substring(1);
  const activeTab = ["gallery", "history", "profile"].includes(currentPath) ? currentPath : "home";
  const isDarkMode = document.documentElement.classList.contains("dark");

  // Effects
  useEffect(() => {
    if (isPaymentOpen) trackEvent("shop_view");
  }, [isPaymentOpen, trackEvent]);

  useEffect(() => {
    const isCompleted = localStorage.getItem("pixel_onboarding_v2_completed");
    if (!isCompleted) setTimeout(() => {
      setIsOnboardingVisible(true);
      trackFunnel('onboarding', 'view');
    }, 1000);
  }, []);

  useEffect(() => {
    const isOnboardingCompleted = localStorage.getItem("pixel_onboarding_v2_completed");
    if (!isOnboardingCompleted) return;

    const lastClaim = localStorage.getItem('last_bonus_claim');
    const today = new Date().toDateString();
    if (lastClaim !== today) {
      const timer = setTimeout(() => setShowDailyBonus(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const triggerHaptic = useCallback((style) => {
    tg?.HapticFeedback?.impactOccurred(style);
  }, [tg]);

  // Handlers
  const handleTabChange = useCallback((tab) => {
    triggerHaptic("light");
    navigate(tab === "home" ? "/" : `/${tab}`);
  }, [navigate, triggerHaptic]);

  const openPayment = () => { setIsPaymentOpen(true); setHasPaymentMounted(true); triggerHaptic("medium"); };
  const openLeaderboard = () => { setIsLeaderboardOpen(true); setHasLeaderboardMounted(true); triggerHaptic("medium"); };
  const openInpainting = () => { setIsInpaintingOpen(true); setHasInpaintingMounted(true); triggerHaptic("medium"); };
  const openFaceSwap = () => { setIsFaceSwapOpen(true); setHasFaceSwapMounted(true); triggerHaptic("medium"); };
  const openAvatarTrainer = () => { setIsAvatarTrainerOpen(true); setHasAvatarTrainerMounted(true); triggerHaptic("medium"); };
  const openStickerGen = () => { setIsStickerGenOpen(true); setHasStickerGenMounted(true); triggerHaptic("medium"); };

  const openTemplate = (template) => {
    triggerHaptic("medium");
    setSelectedTemplateForSheet(template);
  };

  const openCreation = (type, initialPrompt = "", model = null) => {
    const editorOpeners = {
      "Magic Eraser": openInpainting,
      "Face Swap": openFaceSwap,
      "Avatar Training": openAvatarTrainer,
      "Stickers": openStickerGen
    };
    if (editorOpeners[type]) { editorOpeners[type](); return; }

    triggerHaptic("medium");
    navigate(`/generate/${encodeURIComponent(type)}`, { state: { prompt: initialPrompt, model } });
  };

  const handleOnboardingComplete = useCallback(() => {
    setIsOnboardingVisible(false);
    localStorage.setItem("pixel_onboarding_v2_completed", "true");
    trackFunnel('onboarding', 'finish');
  }, [trackFunnel]);

  const handleOnboardingAction = (actionId) => {
    if (actionId === "create_click") navigate("/create");
    if (actionId === "trigger_fake_gen") {
      trackFunnel('onboarding', 'click_try_gen');
      navigate("/generate/image-gen", { state: { prompt: "A cute futuristic robot painting digital art, neon style" } });
    }
  };

  const handlers = {
    openCreation, openTemplate, openLeaderboard, openPayment,
    openInpainting, openFaceSwap, openStickerGen,
    setIsPaymentOpen, setIsLeaderboardOpen, setIsInpaintingOpen,
    setIsFaceSwapOpen, setIsAvatarTrainerOpen, setIsStickerGenOpen,
    handleOnboardingComplete, handleOnboardingAction, setShowDailyBonus,
    setIsNotificationsOpen
  };

  const state = {
    isDarkMode, isPaymentOpen, hasPaymentMounted, isLeaderboardOpen,
    hasLeaderboardMounted, isInpaintingOpen, hasInpaintingMounted,
    isFaceSwapOpen, hasFaceSwapMounted, isAvatarTrainerOpen,
    hasAvatarTrainerMounted, isStickerGenOpen, hasStickerGenMounted,
    isOnboardingVisible, showDailyBonus, isNotificationsOpen, telegramUser
  };

  if (!isLoading && !telegramId && !user) {
    return <WebLogin />;
  }

  // Maintenance Check - Block all users except 'artykosh'
  if (!isLoading && user && user.username !== 'artykosh') {
    return <MaintenanceView />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "dark" : ""}`}>
      <div className="mx-auto max-w-[480px] md:max-w-none md:ml-64 md:w-auto md:mx-0 min-h-screen bg-[#0f0f0f] relative transition-all duration-300 pt-[60px] md:pt-0">

        <Sidebar activeTab={activeTab} onTabChange={handleTabChange} onCreateClick={() => openCreation('image-gen')} />

        {/* Brand Glows */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden max-w-[480px] md:max-w-none md:ml-64 mx-auto md:mx-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute w-full h-[600px] -top-[100px] left-0"
            style={{
              background: "radial-gradient(ellipse at top, #3390ec 0%, rgba(51, 144, 236, 0.4) 40%, rgba(15, 15, 15, 0.0) 70%)",
              filter: "blur(60px)",
            }}
          />
        </div>

        {/* Main Content Sections */}
        <main className="relative z-10 min-h-screen">
          <AppRoutes handlers={handlers} state={state} />
        </main>
      </div>

      {showLayout && (
        <div className="md:hidden">
          <BottomNav activeTab={activeTab} onTabChange={handleTabChange} onCreateClick={() => openCreation('image-gen')} />
        </div>
      )}

      <GlobalModals state={state} handlers={handlers} />

      <TemplateSelectionSheet
        template={selectedTemplateForSheet}
        isOpen={!!selectedTemplateForSheet}
        onClose={() => setSelectedTemplateForSheet(null)}
      />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <ThemeProvider>
            <SoundProvider>
              <ToastProvider>
                <UserProvider>
                  <ABTestProvider>
                    <Router>
                      <AppRoot appearance={document.documentElement.classList.contains("dark") ? "dark" : "light"}>
                        <AppContent />
                      </AppRoot>
                    </Router>
                  </ABTestProvider>
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
