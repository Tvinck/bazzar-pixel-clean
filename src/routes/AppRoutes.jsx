import React, { Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Layout Components
import PageTransition from '../components/PageTransition';
import LoadingScreen from '../components/LoadingScreen';

// Lazy Load Views
const HomeView = React.lazy(() => import("../views/HomeView"));
const GalleryView = React.lazy(() => import("../views/GalleryView"));
const ProfileView = React.lazy(() => import("../views/ProfileView"));
const HistoryView = React.lazy(() => import("../views/HistoryView"));
const CreateView = React.lazy(() => import("../views/CreateView"));
const GenerationView = React.lazy(() => import("../views/GenerationView"));
const TemplateView = React.lazy(() => import("../views/TemplateView"));
const UserProfileView = React.lazy(() => import("../views/UserProfileView"));
const AdminView = React.lazy(() => import("../views/AdminView"));
const DesignLabView = React.lazy(() => import("../views/DesignLabView"));
const StarGreetingsView = React.lazy(() => import("../views/StarGreetingsView"));
const ImageTemplatesView = React.lazy(() => import("../views/ImageTemplatesView"));
const PaymentSuccessView = React.lazy(() => import("../views/PaymentSuccessView"));
const ExpertsView = React.lazy(() => import("../views/ExpertsView"));
const ExpertChatView = React.lazy(() => import("../views/ExpertChatView"));
const UniversalChatView = React.lazy(() => import("../views/UniversalChatView"));
const OnboardingView = React.lazy(() => import("../views/OnboardingView"));
const GuideView = React.lazy(() => import("../views/GuideView"));
const PublicProfileView = React.lazy(() => import("../views/collaboration/PublicProfileView"));
const SharedCreationView = React.lazy(() => import("../views/collaboration/SharedCreationView"));
const ReferralDashView = React.lazy(() => import("../views/ReferralDashView"));
const PromptMarketView = React.lazy(() => import("../views/PromptMarketView"));
const DevDashboardView = React.lazy(() => import("../views/DevDashboardView"));
const SuperResolutionView = React.lazy(() => import("../views/SuperResolutionView"));
const StickersView = React.lazy(() => import("../views/StickersView"));
const NotFoundView = React.lazy(() => import("../views/NotFoundView"));

/**
 * Component for managing all application routes and transitions.
 */
const AppRoutes = ({ handlers, state }) => {
    const location = useLocation();
    const { isDarkMode } = state;
    const {
        openCreation, openTemplate, openLeaderboard,
        openPayment, openInpainting, openFaceSwap,
        openStickerGen
    } = handlers;

    return (
        <Suspense fallback={<LoadingScreen />}>
            <AnimatePresence mode="wait" initial={false}>
                <Routes location={location} key={location.pathname}>
                    {/* Main Tabs */}
                    <Route path="/" element={
                        <PageTransition>
                            <HomeView
                                onOpenCreation={openCreation}
                                onOpenTemplate={openTemplate}
                                onOpenLeaderboard={openLeaderboard}
                                onOpenPayment={openPayment}
                                onOpenStickers={openStickerGen}
                            />
                        </PageTransition>
                    } />
                    <Route path="/gallery" element={
                        <PageTransition>
                            <GalleryView
                                onRemix={(creation) => openCreation("image-gen", creation.prompt)}
                                onOpenTemplate={openTemplate}
                            />
                        </PageTransition>
                    } />
                    <Route path="/history" element={
                        <PageTransition>
                            <HistoryView />
                        </PageTransition>
                    } />
                    <Route path="/profile" element={
                        <PageTransition>
                            <ProfileView isDark={isDarkMode} onOpenPayment={openPayment} />
                        </PageTransition>
                    } />

                    {/* Full Pages */}
                    <Route path="/create" element={
                        <PageTransition>
                            <CreateView />
                        </PageTransition>
                    } />
                    <Route path="/generate/:type" element={
                        <PageTransition>
                            <GenerationView onOpenPayment={openPayment} />
                        </PageTransition>
                    } />
                    <Route path="/template/:id" element={
                        <PageTransition>
                            <TemplateView onOpenPayment={openPayment} />
                        </PageTransition>
                    } />
                    <Route path="/user/:userId" element={
                        <PageTransition>
                            <UserProfileView />
                        </PageTransition>
                    } />
                    <Route path="/admin" element={
                        <PageTransition>
                            <AdminView />
                        </PageTransition>
                    } />
                    <Route path="/payment/success" element={
                        <PageTransition>
                            <PaymentSuccessView />
                        </PageTransition>
                    } />
                    <Route path="/greetings" element={
                        <PageTransition>
                            <StarGreetingsView />
                        </PageTransition>
                    } />
                    <Route path="/stickers" element={
                        <PageTransition>
                            <StickersView />
                        </PageTransition>
                    } />
                    <Route path="/design-lab" element={
                        <DesignLabView
                            onOpenPayment={openPayment}
                            onOpenInpainting={openInpainting}
                            onOpenFaceSwap={openFaceSwap}
                        />
                    } />
                    <Route path="/image-templates" element={
                        <PageTransition>
                            <ImageTemplatesView onOpenTemplate={openTemplate} />
                        </PageTransition>
                    } />
                    <Route path="/experts" element={
                        <PageTransition>
                            <ExpertsView />
                        </PageTransition>
                    } />
                    <Route path="/experts/:expertId" element={
                        <PageTransition>
                            <ExpertChatView />
                        </PageTransition>
                    } />
                    <Route path="/chat/:chatType" element={
                        <PageTransition>
                            <UniversalChatView />
                        </PageTransition>
                    } />
                    <Route path="/onboarding" element={
                        <PageTransition>
                            <OnboardingView />
                        </PageTransition>
                    } />
                    <Route path="/guide" element={
                        <PageTransition>
                            <GuideView />
                        </PageTransition>
                    } />
                    <Route path="/u/:username" element={
                        <PageTransition>
                            <PublicProfileView />
                        </PageTransition>
                    } />
                    <Route path="/c/:id" element={
                        <PageTransition>
                            <SharedCreationView />
                        </PageTransition>
                    } />
                    <Route path="/referrals" element={
                        <PageTransition>
                            <ReferralDashView />
                        </PageTransition>
                    } />
                    <Route path="/marketplace" element={
                        <PageTransition>
                            <PromptMarketView />
                        </PageTransition>
                    } />
                    <Route path="/developer" element={
                        <PageTransition>
                            <DevDashboardView />
                        </PageTransition>
                    } />
                    <Route path="/upscale/:id" element={
                        <PageTransition>
                            <SuperResolutionView />
                        </PageTransition>
                    } />
                    <Route path="*" element={
                        <PageTransition>
                            <NotFoundView />
                        </PageTransition>
                    } />
                </Routes>
            </AnimatePresence>
        </Suspense>
    );
};

export default AppRoutes;
