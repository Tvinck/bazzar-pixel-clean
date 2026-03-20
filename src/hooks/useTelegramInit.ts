import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Custom hook to handle Telegram Mini App initialization and lifecycle events.
 */
export const useTelegramInit = (setTelegramUser?: (user: any) => void) => {
    const navigate = useNavigate();
    const location = useLocation();
    const hasHandledDeepLink = useRef(false);

    useEffect(() => {
        const tg = (window as any).Telegram?.WebApp;
        if (tg) {
            // Set User State
            if (setTelegramUser) {
                setTelegramUser(tg.initDataUnsafe?.user);
            }

            // --- DEEP LINKING ---
            if (!hasHandledDeepLink.current) {
                const startParam = tg.initDataUnsafe?.start_param;
                if (startParam && startParam.startsWith("payment_success")) {
                    hasHandledDeepLink.current = true;
                    const parts = startParam.split("__");
                    const orderId = parts[1];

                    const processedStr = localStorage.getItem("processed_orders") || "[]";
                    const processed = JSON.parse(processedStr);

                    if (processed.includes(orderId)) {
                        navigate("/profile");
                    } else {
                        navigate("/payment/success", { state: { orderId } });
                    }
                } else if (startParam && startParam.startsWith("c_")) {
                    hasHandledDeepLink.current = true;
                    const creationId = startParam.substring(2);
                    navigate(`/c/${creationId}`);
                } else if (startParam && startParam.startsWith("u_")) {
                    hasHandledDeepLink.current = true;
                    const username = startParam.substring(2);
                    navigate(`/u/${username}`);
                }
            }

            // --- CORE INIT ---
            try {
                tg.expand();
                tg.ready();

                // 1. Fullscreen (7.7+)
                if (tg.requestFullscreen && tg.isVersionAtLeast('7.7')) {
                    try { tg.requestFullscreen(); } catch (e) { }
                }

                // 2. Disable Vertical Swipes (7.7+)
                if (tg.disableVerticalSwipes && tg.isVersionAtLeast('7.7')) {
                    try { tg.disableVerticalSwipes(); } catch (e) { }
                }

                // 3. Closing Confirmation (6.2+)
                if (tg.enableClosingConfirmation && tg.isVersionAtLeast('6.2')) {
                    try { tg.enableClosingConfirmation(); } catch (e) { }
                }

                // 4. Theme Optimization
                const savedThemeMode = localStorage.getItem('pixel_theme_mode');
                const isDarkTheme = savedThemeMode ? savedThemeMode === 'dark' : tg.colorScheme === "dark";

                if (isDarkTheme) {
                    document.documentElement.classList.add("dark");
                } else {
                    document.documentElement.classList.remove("dark");
                }

                const headerColor = "#0f0f0f"; // App brand color
                if (tg.setHeaderColor && tg.isVersionAtLeast('6.1')) {
                    tg.setHeaderColor(headerColor);
                    tg.setBackgroundColor(headerColor);
                }

                // 5. Native Settings Button
                if (tg.SettingsButton && tg.isVersionAtLeast('6.1')) {
                    tg.SettingsButton.show();
                    tg.SettingsButton.onClick(() => navigate("/profile"));
                }

                // 6. Orientation Lock (8.0+)
                if (tg.lockOrientation && tg.isVersionAtLeast('8.0')) {
                    try { tg.lockOrientation("portrait"); } catch (e) { }
                }

                // 7. Platform Specific Classes
                const platform = tg.platform || 'unknown';
                document.body.classList.add(`tg-platform-${platform}`);
                if (['tdesktop', 'macos', 'web', 'weba'].includes(platform)) {
                    document.body.classList.add('tg-is-desktop');
                } else {
                    document.body.classList.add('tg-is-mobile');
                }

                // 8. Dynamic Theme Sync
                const syncTheme = () => {
                    const colorScheme = tg.colorScheme || 'dark';
                    document.documentElement.classList.remove('tg-dark', 'tg-light');
                    document.documentElement.classList.add(colorScheme === 'dark' ? 'tg-dark' : 'tg-light');
                    
                    // Also sync with our internal dark mode class if needed
                    if (colorScheme === 'dark') {
                        document.documentElement.classList.add('dark');
                    } else {
                        // Only remove if not explicitly set by user before
                        if (!localStorage.getItem('pixel_theme_mode')) {
                            document.documentElement.classList.remove('dark');
                        }
                    }
                };

                syncTheme();
                tg.onEvent('themeChanged', syncTheme);

                return () => {
                    tg.offEvent('themeChanged', syncTheme);
                };

            } catch (e) {
                console.error("Telegram Mini App Init Error:", e);
            }
        } else {
            // SDK Missing or Timeout Check
            console.warn("⚠️ Telegram SDK not detected yet. Retrying initialization...");
            const timer = setTimeout(() => {
                if (!(window as any).Telegram?.WebApp) {
                    console.error("❌ Telegram SDK Load Timeout (5s). Network issues detected.");
                }
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [navigate, setTelegramUser]);

    // --- BACK BUTTON LOGIC ---
    useEffect(() => {
        const tg = (window as any).Telegram?.WebApp;
        if (!tg) return;

        const handleBackButton = () => {
            if (location.pathname !== "/") {
                navigate(-1);
            }
        };

        tg.onEvent("backButtonClicked", handleBackButton);

        const mainRoutes = ["/", "/gallery", "/history", "/profile"];
        const isMainRoute = mainRoutes.includes(location.pathname);

        if (isMainRoute) {
            tg.BackButton.hide();
        } else {
            tg.BackButton.show();
        }

        return () => {
            tg.offEvent("backButtonClicked", handleBackButton);
        };
    }, [location.pathname, navigate]);

    return (window as any).Telegram?.WebApp;
};
