import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';
import TelegramLoginWidget from '../components/TelegramLoginWidget';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';

// ============================================================
// PKCE Helpers for VK ID
// ============================================================
function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (b) => chars[b % chars.length]).join('');
}

async function generateCodeChallenge(verifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

// ============================================================
// OAuth Provider Configs
// ============================================================
const YANDEX_CLIENT_ID = import.meta.env.VITE_YANDEX_CLIENT_ID || '';
const VK_CLIENT_ID = import.meta.env.VITE_VK_CLIENT_ID || '';

// ============================================================
// Provider Button Component
// ============================================================
const ProviderButton = ({ icon, label, sublabel, gradient, hoverGradient, onClick, disabled }) => (
    <motion.button
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.01 }}
        onClick={onClick}
        disabled={disabled}
        className="w-full flex items-center gap-4 p-4 rounded-2xl border border-white/10 transition-all duration-200 hover:border-white/20 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none"
        style={{ background: gradient }}
    >
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: hoverGradient }}>
            {icon}
        </div>
        <div className="text-left flex-1">
            <div className="text-[15px] font-semibold text-white">{label}</div>
            {sublabel && <div className="text-[12px] text-white/50 mt-0.5">{sublabel}</div>}
        </div>
        <svg className="w-5 h-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    </motion.button>
);

// ============================================================
// WebLogin Component
// ============================================================
const WebLogin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [showTelegramWidget, setShowTelegramWidget] = useState(false);
    const {} = useUser(); // removed unused refreshUser
    const { success, error: toastError } = useToast();
    const yandexInitialized = useRef(false);

    // --- Initialize Yandex SDK suggest on mount ---
    useEffect(() => {
        if (yandexInitialized.current || !YANDEX_CLIENT_ID) return;

        const initYandex = () => {
            if (!window.YaAuthSuggest) return false;

            yandexInitialized.current = true;

            window.YaAuthSuggest.init(
                {
                    client_id: YANDEX_CLIENT_ID,
                    response_type: 'token',
                    redirect_uri: `${window.location.origin}/auth/callback`
                },
                `${window.location.origin}`,
                { view: 'button', parentId: 'yandex-login-button', buttonSize: 'l', buttonView: 'main', buttonTheme: 'dark', buttonBorderRadius: 16 }
            )
                .then(({ handler }) => handler())
                .then((data) => {
                    handleYandexToken(data.access_token);
                })
                .catch((error) => {
                    console.log('Yandex SDK suggest not available or declined:', error);
                });
        };

        initYandex();
    }, [handleYandexToken]);

    // --- Handle Yandex token (from SDK or callback) ---
    const handleYandexToken = useCallback(async (accessToken) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/yandex', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ access_token: accessToken })
            });
            const data = await response.json();
            if (data.success && data.token) {
                localStorage.setItem('bazzar_web_auth', data.token);
                success('Вход через Яндекс успешен!');
                window.location.reload();
            } else {
                throw new Error(data.error || 'Ошибка авторизации через Яндекс');
            }
        } catch (error) {
            console.error('Yandex login error:', error);
            toastError(error.message || 'Ошибка подключения');
        } finally {
            setIsLoading(false);
        }
    }, [success, toastError]);

    // --- Yandex Login Redirect (fallback if SDK doesn't work) ---
    const handleYandexLogin = useCallback(() => {
        if (!YANDEX_CLIENT_ID) {
            toastError('Yandex ID не настроен');
            return;
        }
        const state = 'yandex_' + generateRandomString(16);
        const redirectUri = `${window.location.origin}/auth/callback`;
        const url = `https://oauth.yandex.ru/authorize?response_type=token&client_id=${YANDEX_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
        window.location.href = url;
    }, [toastError]);

    // --- Telegram Login ---
    const handleTelegramResponse = async (user) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/telegram-web', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });
            const data = await response.json();
            if (data.success && data.token) {
                localStorage.setItem('bazzar_web_auth', data.token);
                success('Успешный вход!');
                window.location.reload();
            } else {
                throw new Error(data.error || 'Ошибка авторизации');
            }
        } catch (error) {
            console.error('Login error:', error);
            toastError(error.message || 'Ошибка подключения к серверу');
        } finally {
            setIsLoading(false);
        }
    };

    // --- VK Login ---
    const handleVKLogin = useCallback(async () => {
        if (!VK_CLIENT_ID) {
            toastError('VK ID не настроен');
            return;
        }
        const state = 'vk_' + generateRandomString(16);
        const codeVerifier = generateRandomString(64);
        const codeChallenge = await generateCodeChallenge(codeVerifier);
        const redirectUri = `${window.location.origin}/auth/callback`;

        // Save PKCE verifier for callback
        sessionStorage.setItem('vk_code_verifier', codeVerifier);

        const params = new URLSearchParams({
            response_type: 'code',
            client_id: VK_CLIENT_ID,
            redirect_uri: redirectUri,
            state: state,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
            scope: 'vkid.personal_info'
        });

        window.location.href = `https://id.vk.com/authorize?${params.toString()}`;
    }, [toastError]);

    // --- DEV BYPASS ---
    const handleDevLogin = async () => {
        setIsLoading(true);
        try {
            const mockUser = {
                id: 603207436,
                first_name: "Developer",
                username: "dev_user",
                photo_url: "https://github.com/apple.png",
                isDevMock: true
            };
            const response = await fetch('/api/auth/telegram-web', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mockUser)
            });
            const data = await response.json();
            if (data.success && data.token) {
                localStorage.setItem('bazzar_web_auth', data.token);
                success('DEV Вход успешен!');
                window.location.reload();
            } else {
                throw new Error(data.error);
            }
        } catch (e) {
            toastError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div
                    className="absolute w-full h-[600px] -top-[100px] left-0"
                    style={{
                        background: 'radial-gradient(ellipse at top, #3390ec 0%, rgba(51, 144, 236, 0.2) 40%, rgba(15, 15, 15, 0.0) 70%)',
                        filter: 'blur(60px)',
                    }}
                />
                <div
                    className="absolute w-[300px] h-[300px] bottom-[10%] right-[-50px]"
                    style={{
                        background: 'radial-gradient(circle, rgba(255, 59, 48, 0.15) 0%, transparent 70%)',
                        filter: 'blur(40px)',
                    }}
                />
                <div
                    className="absolute w-[250px] h-[250px] bottom-[20%] left-[-30px]"
                    style={{
                        background: 'radial-gradient(circle, rgba(88, 86, 214, 0.15) 0%, transparent 70%)',
                        filter: 'blur(40px)',
                    }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="z-10 w-full max-w-sm flex flex-col items-center"
            >
                {/* Logo */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, type: 'spring', damping: 15 }}
                    className="w-20 h-20 bg-gradient-to-br from-[#3390ec] to-[#007aff] rounded-[24px] flex items-center justify-center mb-6 shadow-lg shadow-[#3390ec]/20 relative"
                >
                    <Sparkles className="w-10 h-10 text-white" />
                    <div className="absolute -inset-1 bg-gradient-to-br from-[#3390ec] to-[#007aff] rounded-[28px] -z-10 opacity-30 blur-lg" />
                </motion.div>

                {/* Title */}
                <h1 className="text-[28px] font-bold text-white mb-1 tracking-tight">Bazzar Pixel</h1>
                <p className="text-[15px] text-[#8e8e93] text-center mb-8 max-w-[280px]">
                    Войдите, чтобы создавать нейроарты и получить доступ к профилю
                </p>

                {/* Auth Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="w-full flex flex-col gap-3"
                >
                    {/* Telegram */}
                    {showTelegramWidget ? (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-white/5 p-4 rounded-2xl border border-white/10 w-full flex flex-col items-center gap-3"
                        >
                            <TelegramLoginWidget
                                botName={import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'Pixel_ai_bot'}
                                onAuth={handleTelegramResponse}
                                authUrl={`${window.location.origin}/auth/callback`}
                            />
                            <button
                                onClick={() => setShowTelegramWidget(false)}
                                className="text-xs text-[#8e8e93] hover:text-white transition-colors"
                            >
                                ← Назад к выбору
                            </button>
                        </motion.div>
                    ) : (
                        <ProviderButton
                            icon={
                                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" fill="white" />
                                </svg>
                            }
                            label="Войти через Telegram"
                            sublabel="Быстрый вход через бот"
                            gradient="linear-gradient(135deg, rgba(51, 144, 236, 0.15) 0%, rgba(51, 144, 236, 0.05) 100%)"
                            hoverGradient="linear-gradient(135deg, #3390ec, #2681d9)"
                            onClick={() => setShowTelegramWidget(true)}
                            disabled={isLoading}
                        />
                    )}

                    {/* Yandex ID — SDK button container + fallback */}
                    <div id="yandex-login-button" className="w-full" style={{ minHeight: 0 }}></div>
                    {(!window.YaAuthSuggest || !YANDEX_CLIENT_ID) && (
                        <ProviderButton
                            icon={
                                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                                    <path d="M13.62 21.82V12.3l3.3-8.48h-2.34l-2.76 7.34c-.18.5-.36 1.04-.54 1.62-.18.56-.32 1.06-.44 1.48h-.06c-.12-.5-.28-1.02-.48-1.56s-.38-1.08-.56-1.54L6.86 3.82H4.38l3.84 8.86v9.14h5.4z" fill="white" />
                                </svg>
                            }
                            label="Войти через Яндекс"
                            sublabel="Yandex ID"
                            gradient="linear-gradient(135deg, rgba(255, 204, 0, 0.12) 0%, rgba(255, 68, 0, 0.08) 100%)"
                            hoverGradient="linear-gradient(135deg, #fc3f1d, #ff5722)"
                            onClick={handleYandexLogin}
                            disabled={isLoading}
                        />
                    )}

                    {/* VK ID */}
                    <ProviderButton
                        icon={
                            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                                <path d="M12.78 17.77h1.18s.36-.04.54-.24c.16-.18.16-.52.16-.52s-.02-1.6.72-1.84c.72-.24 1.66 1.56 2.64 2.26.74.52 1.32.4 1.32.4l2.64-.04s1.38-.08.72-1.16c-.04-.08-.32-.76-1.72-2.14-1.46-1.44-1.26-1.22.5-3.72 1.06-1.52 1.5-2.46 1.36-2.86-.12-.36-.9-.28-.9-.28l-2.98.02s-.22-.04-.38.06c-.16.1-.26.32-.26.32s-.48 1.26-1.1 2.34c-1.34 2.26-1.86 2.38-2.08 2.24-.52-.32-.38-1.28-.38-1.96 0-2.14.32-3.02-.64-3.26-.32-.08-.56-.12-1.38-.14-.06 0-1.14-.02-1.82.32-.44.22-.78.72-.58.74.26.04 1 .18 1.34.64.46.6.44 1.96.44 1.96s.26 2.52-.62 2.82c-.6.22-1.44-.9-2.3-2.38-.58-1.02-1.04-2.16-1.04-2.16s-.08-.2-.24-.32c-.18-.12-.44-.18-.44-.18l-2.82.02s-.42.02-.58.2c-.14.16-.02.48-.02.48s2.22 5.2 4.74 7.82c2.32 2.4 4.94 2.24 4.94 2.24z" fill="white" />
                            </svg>
                        }
                        label="Войти через ВКонтакте"
                        sublabel="VK ID"
                        gradient="linear-gradient(135deg, rgba(0, 119, 255, 0.12) 0%, rgba(0, 119, 255, 0.05) 100%)"
                        hoverGradient="linear-gradient(135deg, #0077ff, #0066dd)"
                        onClick={handleVKLogin}
                        disabled={isLoading}
                    />
                </motion.div>

                {/* Loading Overlay */}
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-6 flex items-center gap-2"
                    >
                        <Loader2 className="w-5 h-5 text-[#3390ec] animate-spin" />
                        <span className="text-sm text-[#8e8e93]">Авторизация...</span>
                    </motion.div>
                )}

                {/* DEV Bypass */}
                {import.meta.env.DEV && (
                    <button
                        onClick={handleDevLogin}
                        className="mt-6 text-xs text-[#8e8e93] underline hover:text-white transition-colors"
                    >
                        Войти как разработчик (DEV)
                    </button>
                )}

                {/* Footer */}
                <p className="mt-8 text-[11px] text-[#48484a] text-center max-w-[260px]">
                    Авторизуясь, вы соглашаетесь с условиями использования сервиса
                </p>
            </motion.div>
        </div>
    );
};

export default WebLogin;
