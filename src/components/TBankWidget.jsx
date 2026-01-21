import React, { useEffect, useRef, useState } from 'react';

/**
 * T-Bank (Tinkoff) Payment Widget Component
 */
const TBankWidget = ({ amount, description, userId, telegramId, userEmail, onSuccess }) => {
    const containerRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const integrationRef = useRef(null);

    useEffect(() => {
        // 1. Check if integration script is loaded
        const checkScript = setInterval(() => {
            if (window.PaymentIntegration) {
                setIsLoaded(true);
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
                terminalKey: '1768938209941DEMO',
                product: 'eacq',
                features: {
                    payment: {
                        container: containerRef.current,
                        paymentStartCallback: async () => {
                            // Call our backend to get PaymentURL
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

                            if (data.paymentUrl) {
                                return data.paymentUrl;
                            } else {
                                throw new Error(data.error || 'Failed to init payment');
                            }
                        }
                    }
                }
            };

            const integration = await window.PaymentIntegration.init(initConfig);
            integrationRef.current = integration;
            console.log('✅ T-Bank Widget Initialized');
        } catch (err) {
            console.error('❌ T-Bank Widget Init Error:', err);
        }
    };

    return (
        <div className="w-full mt-4">
            <div
                ref={containerRef}
                id="tbank-payment-container"
                className="min-h-[100px] flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-dashed border-slate-300 dark:border-slate-600"
            >
                {!isLoaded && (
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs text-slate-500 font-medium">Загрузка виджета оплат...</span>
                    </div>
                )}
            </div>
            <p className="text-[10px] text-center text-slate-400 mt-2">
                Безопасная оплата через Т-Банк (Тинькофф)
            </p>
        </div>
    );
};

export default TBankWidget;
