import React, { Suspense } from 'react';
import { useUser } from '../../context/UserContext';

// Lazy load modals/drawers
const PaymentDrawer = React.lazy(() => import("../PaymentDrawer"));
const LeaderboardDrawer = React.lazy(() => import("../LeaderboardDrawer"));
const InpaintingEditor = React.lazy(() => import("../tools/InpaintingEditor"));
const FaceSwap = React.lazy(() => import("../tools/FaceSwap"));
const AvatarTrainer = React.lazy(() => import("../tools/AvatarTrainer"));
const OnboardingOverlay = React.lazy(() => import("../OnboardingOverlay"));
const StickerGenerator = React.lazy(() => import("../tools/StickerGenerator"));
const GenerationLoader = React.lazy(() => import("../GenerationLoader"));
const NotificationsPanel = React.lazy(() => import("../NotificationsPanel"));
const GenerationTopWidget = React.lazy(() => import("../GenerationTopWidget"));

const GlobalGenerationOverlay = () => {
    const { globalGen, closeGlobalGen } = useUser();
    if (!globalGen?.isOpen) return null;

    return (
        <Suspense fallback={null}>
            <GenerationLoader
                status={globalGen.status}
                result={globalGen.result}
                type={globalGen.type}
                estimatedTime={15}
                onMinimize={closeGlobalGen}
            />
        </Suspense>
    );
};

/**
 * Component to manage all global overlays, modals, and drawers.
 */
const GlobalModals = ({ state, handlers }) => {
    const {
        isPaymentOpen, hasPaymentMounted,
        isLeaderboardOpen, hasLeaderboardMounted,
        isInpaintingOpen, hasInpaintingMounted,
        isFaceSwapOpen, hasFaceSwapMounted,
        isAvatarTrainerOpen, hasAvatarTrainerMounted,
        isStickerGenOpen, hasStickerGenMounted,
        isOnboardingVisible,
        isNotificationsOpen
    } = state;

    const {
        setIsPaymentOpen,
        setIsLeaderboardOpen,
        setIsInpaintingOpen,
        setIsFaceSwapOpen,
        setIsAvatarTrainerOpen,
        setIsStickerGenOpen,
        handleOnboardingComplete,
        handleOnboardingAction,
        setIsNotificationsOpen
    } = handlers;

    return (
        <>
            {/* Payment Drawer */}
            <Suspense fallback={null}>
                {(isPaymentOpen || hasPaymentMounted) && (
                    <PaymentDrawer isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} />
                )}
            </Suspense>

            {/* Leaderboard Drawer */}
            <Suspense fallback={null}>
                {(isLeaderboardOpen || hasLeaderboardMounted) && (
                    <LeaderboardDrawer isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} />
                )}
            </Suspense>

            {/* AI Editors */}
            <Suspense fallback={null}>
                {(isInpaintingOpen || hasInpaintingMounted) && (
                    <InpaintingEditor isOpen={isInpaintingOpen} onClose={() => setIsInpaintingOpen(false)} />
                )}
            </Suspense>
            <Suspense fallback={null}>
                {(isFaceSwapOpen || hasFaceSwapMounted) && (
                    <FaceSwap isOpen={isFaceSwapOpen} onClose={() => setIsFaceSwapOpen(false)} />
                )}
            </Suspense>
            <Suspense fallback={null}>
                {(isAvatarTrainerOpen || hasAvatarTrainerMounted) && (
                    <AvatarTrainer isOpen={isAvatarTrainerOpen} onClose={() => setIsAvatarTrainerOpen(false)} />
                )}
            </Suspense>
            <Suspense fallback={null}>
                {(isStickerGenOpen || hasStickerGenMounted) && (
                    <StickerGenerator isOpen={isStickerGenOpen} onClose={() => setIsStickerGenOpen(false)} />
                )}
            </Suspense>

            {/* Overlays / Notifications */}
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
                <NotificationsPanel
                    isOpen={isNotificationsOpen}
                    onClose={() => setIsNotificationsOpen(false)}
                />
            </Suspense>

            {/* Global Generation UI */}
            <GlobalGenerationOverlay />
            <Suspense fallback={null}>
                <GenerationTopWidget />
            </Suspense>
        </>
    );
};

export default GlobalModals;
