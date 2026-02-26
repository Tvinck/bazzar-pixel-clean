import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Loader2 } from 'lucide-react';
import TelegramLoginWidget from '../components/TelegramLoginWidget';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';

const WebLogin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { refreshUser } = useUser();
    const { showToast } = useToast();

    const handleTelegramResponse = async (user) => {
        setIsLoading(true);
        try {
            // Forward the widget payload to our backend to verify and generate JWT
            const response = await fetch('/api/auth/telegram-web', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user)
            });

            const data = await response.json();

            if (data.success && data.token) {
                // Save Web Auth token
                localStorage.setItem('bazzar_web_auth', data.token);
                showToast('Успешный вход!', 'success');

                // Force UserContext to refresh and reload state
                window.location.reload();
            } else {
                throw new Error(data.error || 'Ошибка авторизации');
            }
        } catch (error) {
            console.error('Login error:', error);
            showToast(error.message || 'Ошибка подключения к серверу', 'error');
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
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="z-10 bg-[#1c1c1e] p-8 rounded-3xl border border-white/5 w-full max-w-sm flex flex-col items-center shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#3390ec]/10 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#3390ec]/10 rounded-full blur-3xl -ml-16 -mb-16" />

                <div className="w-20 h-20 bg-gradient-to-br from-[#3390ec] to-[#007aff] rounded-[24px] flex items-center justify-center mb-6 shadow-lg shadow-[#3390ec]/20">
                    <Bot className="w-10 h-10 text-white" />
                </div>

                <h1 className="text-2xl font-bold text-white mb-2 text-center">Bazzar Pixel</h1>
                <h2 className="text-[17px] font-semibold text-white mb-2 text-center">Вход через Telegram</h2>
                <p className="text-[15px] text-[#8e8e93] text-center mb-8">
                    Авторизуйтесь, чтобы получить доступ к генерации нейроартов и профилю
                </p>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-[40px] w-full">
                        <Loader2 className="w-6 h-6 text-[#3390ec] animate-spin mb-2" />
                        <span className="text-sm text-[#8e8e93]">Авторизация...</span>
                    </div>
                ) : (
                    // In a real production app, "botName" should be dynamically loaded or provided
                    // Right now, Bazzar Pixel uses bazzar_ai_bot (or similar, replace as needed).
                    // This creates the auth widget iframe wrapper.
                    <div className="flex flex-col w-full items-center gap-4">
                        <div className="bg-white/5 p-2 rounded-2xl border border-white/10 w-full flex justify-center">
                            <TelegramLoginWidget
                                botName={import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'Pixel_ai_bot'}
                                onAuth={handleTelegramResponse}
                            />
                        </div>

                        {import.meta.env.DEV && (
                            <button
                                onClick={async () => {
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
                                            showToast('DEV Вход успешен!', 'success');
                                            window.location.reload();
                                        } else {
                                            throw new Error(data.error);
                                        }
                                    } catch (e) {
                                        showToast(e.message, 'error');
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }}
                                className="text-xs text-[#8e8e93] underline hover:text-white mt-2 pb-4"
                            >
                                Войти как разработчик (DEV Bypass)
                            </button>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default WebLogin;
