import React, { useEffect, useRef, useState } from 'react';

/**
 * Premium T-Bank (Tinkoff) Payment Widget
 * Supports native buttons (SBP, T-Pay, etc.) and iframe fallback
 */
const TBankWidget = ({ amount, description, userId, telegramId, userEmail }) => {
    const containerRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(null);
    const integrationRef = useRef(null);

    useEffect(() => {
        let attempts = 0;
        const checkScript = setInterval(() => {
            attempts++;
            if (window.PaymentIntegration) {
                setIsLoaded(true);
                clearInterval(checkScript);
            } else if (attempts > 20) {
                setError('Не удалось загрузить платежный модуль');
                clearInterval(checkScript);
            }
        }, 500);

        return () => clearInterval(checkScript);
    }, []);

    useEffect(() => {
        if (isLoaded && containerRef.current && !integrationRef.current) {
            initWidget();
        }
    }, [isLoaded]);

    const initWidget = async () => {
        try {
            const initConfig = {
                terminalKey: '1768938209983',
                product: 'eacq',
                methods: ['sbp', 'tinkoff_pay', 'card'],
                features: {
                    payment: {
                        container: containerRef.current,
                        methods: ['sbp', 'tinkoff_pay', 'card'],
                        paymentStartCallback: async () => {
                            const res = await fetch('/api/payment-init', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    amount,
                                    description,
                                    userId,
                                    telegramId,
                                    userEmail
                                })
                            });

                            const data = await res.json();
                            if (data.paymentUrl) return data.paymentUrl;
                            throw new Error(data.error || 'Ошибка инициализации');
                        }
                    },
                    iframe: {
                        container: null
                    }
                }
            };

            const integration = await window.PaymentIntegration.init(initConfig);
            integrationRef.current = integration;

            console.log('✅ T-Bank Integration Object:', integration);
            console.log('✅ Available methods:', integration.methods || 'auto');
        } catch (err) {
            console.error('❌ T-Bank Widget Error:', err);
            setError('Ошибка инициализации виджета');
        }
    };

    return (
        <div className="w-full mt-6 space-y-4">
            {error ? (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-500 text-xs text-center font-medium">
                    {error}
                </div>
            ) : (
                <div
                    ref={containerRef}
                    id="paymentContainer"
                    className="payment-widget-container transition-all duration-500 min-h-[60px]"
                >
                    {!isLoaded && (
                        <div className="flex flex-col items-center justify-center p-8 gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 animate-pulse">
                            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Инициализация оплаты...</span>
                        </div>
                    )}
                </div>
            )}

            <div className="flex items-center justify-center gap-2 py-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent"></div>
                <span className="text-[10px] text-slate-400 font-medium px-2">Защищено Т-Банк</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent"></div>
            </div>
        </div>
    );
};

export default TBankWidget;
