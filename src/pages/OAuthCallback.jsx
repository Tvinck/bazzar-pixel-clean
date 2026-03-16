import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * Universal OAuth Callback page.
 * Handles redirect from Yandex ID (token in hash) and VK ID (code in query).
 */
const OAuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing'); // processing | success | error
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const processCallback = async () => {
            try {
                // --- Yandex SDK sends token in URL hash (#access_token=...) ---
                const hash = window.location.hash.substring(1);
                const hashParams = new URLSearchParams(hash);
                const yandexToken = hashParams.get('access_token');

                if (yandexToken) {
                    // Send token directly to backend
                    const response = await fetch('/api/auth/yandex', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ access_token: yandexToken })
                    });
                    const data = await response.json();
                    if (data.success && data.token) {
                        localStorage.setItem('bazzar_web_auth', data.token);
                        setStatus('success');
                        setTimeout(() => { window.location.href = '/'; }, 1200);
                        return;
                    } else {
                        throw new Error(data.error || 'Ошибка авторизации Яндекс');
                    }
                }

                // --- Telegram sends user data directly in query params: id, first_name, username, photo_url, auth_date, hash ---
                if (searchParams.has('hash') && searchParams.has('id')) {
                    const telegramUser = Object.fromEntries(searchParams.entries());
                    const response = await fetch('/api/auth/telegram-web', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(telegramUser)
                    });
                    const data = await response.json();
                    if (data.success && data.token) {
                        localStorage.setItem('bazzar_web_auth', data.token);
                        setStatus('success');
                        setTimeout(() => { window.location.href = '/'; }, 1200);
                        return;
                    } else {
                        throw new Error(data.error || 'Ошибка авторизации Telegram');
                    }
                }

                // --- VK sends code in query params ---
                const code = searchParams.get('code');
                const state = searchParams.get('state') || '';
                const deviceId = searchParams.get('device_id') || '';

                if (!code) {
                    throw new Error('Код авторизации не получен');
                }

                let provider = 'vk';
                let codeVerifier = '';

                if (state.startsWith('vk_')) {
                    provider = 'vk';
                    codeVerifier = sessionStorage.getItem('vk_code_verifier') || '';
                    sessionStorage.removeItem('vk_code_verifier');
                } else if (state.startsWith('yandex_')) {
                    // Fallback: Yandex code flow
                    provider = 'yandex';
                }

                const response = await fetch(`/api/auth/${provider}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code,
                        code_verifier: codeVerifier,
                        device_id: deviceId,
                        redirect_uri: `${window.location.origin}/auth/callback`
                    })
                });

                const data = await response.json();

                if (data.success && data.token) {
                    localStorage.setItem('bazzar_web_auth', data.token);
                    setStatus('success');
                    setTimeout(() => { window.location.href = '/'; }, 1200);
                } else {
                    throw new Error(data.error || 'Ошибка авторизации');
                }

            } catch (err) {
                console.error('OAuth Callback Error:', err);
                setErrorMsg(err.message);
                setStatus('error');
            }
        };

        processCallback();
    }, [searchParams, navigate]);

    // --- Yandex SDK token receiver (YaSendSuggestToken) ---
    useEffect(() => {
        if (window.YaSendSuggestToken) {
            window.YaSendSuggestToken(`${window.location.origin}`, { flag: true });
        }
    }, []);

    return (
        <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6">
            {/* Background glow */}
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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 bg-bg-secondary rounded-3xl border border-white/5 p-8 w-full max-w-sm flex flex-col items-center text-center"
            >
                {status === 'processing' && (
                    <>
                        <div className="w-16 h-16 rounded-full bg-accent-blue/20 flex items-center justify-center mb-5">
                            <Loader2 className="w-8 h-8 text-[#3390ec] animate-spin" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Авторизация...</h2>
                        <p className="text-text-secondary text-sm">Подключаемся к аккаунту</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', damping: 12 }}
                            className="w-16 h-16 rounded-full bg-accent-blue/20 flex items-center justify-center mb-5"
                        >
                            <CheckCircle2 className="w-8 h-8 text-accent-blue" />
                        </motion.div>
                        <h2 className="text-xl font-bold text-white mb-2">Успешно!</h2>
                        <p className="text-text-secondary text-sm">Перенаправляем...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 rounded-full bg-[#ff3b30]/20 flex items-center justify-center mb-5">
                            <AlertCircle className="w-8 h-8 text-[#ff3b30]" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Ошибка</h2>
                        <p className="text-text-secondary text-sm mb-6">{errorMsg}</p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 bg-accent-blue text-white rounded-xl font-semibold text-sm active:scale-[0.97] transition-transform"
                        >
                            Вернуться
                        </button>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default OAuthCallback;
