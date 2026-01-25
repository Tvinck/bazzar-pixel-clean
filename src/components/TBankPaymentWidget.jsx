import React, { useEffect, useRef, useState } from 'react';

/**
 * T-Bank Payment Integration Widget
 * Supports: T-Pay, SBP, Mir Pay, SberPay
 * Docs: https://www.tbank.ru/kassa/dev/payments/widget/
 */
const TBankPaymentWidget = ({
    amount,
    description,
    userId,
    telegramId,
    userEmail,
    terminalKey, // From env or props
    onSuccess,
    onError,
    widgetTypes = ['tpay', 'sbp', 'mirpay', 'sberpay'], // Default all widgets
    displayParams = {
        gap: 0.5,
        height: 3.5,
        radius: 0.75,
        theme: {
            default: 'accent'
        }
    }
}) => {
    const containerRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const integrationRef = useRef(null);

    useEffect(() => {
        // Check if script already loaded
        if (window.PaymentIntegration) {
            initializeWidget();
            return;
        }

        // Check if script is already being loaded
        const existingScript = document.querySelector('script[src="https://integrationjs.tbank.ru/integration.js"]');
        if (existingScript) {
            existingScript.addEventListener('load', initializeWidget);
            return () => {
                existingScript.removeEventListener('load', initializeWidget);
            };
        }

        // Load T-Bank Integration Script
        const script = document.createElement('script');
        script.src = 'https://integrationjs.tbank.ru/integration.js';
        script.async = true;
        script.onload = () => {
            console.log('T-Bank script loaded successfully');
            initializeWidget();
        };
        script.onerror = (err) => {
            console.error('Failed to load T-Bank script:', err);
            setError('Не удалось загрузить виджет оплаты. Используйте классическую кнопку ниже.');
            setLoading(false);
        };

        document.body.appendChild(script);

        return () => {
            // Cleanup
            if (integrationRef.current) {
                integrationRef.current.unmount().catch(console.error);
            }
            // Don't remove script - it might be used by other components
        };
    }, []);

    const initializeWidget = async () => {
        try {
            if (!window.PaymentIntegration) {
                throw new Error('PaymentIntegration not loaded');
            }

            // Get terminal key
            const key = terminalKey || process.env.REACT_APP_TBANK_TERMINAL_KEY;

            // Skip widget if no key or demo key (widgets don't work with demo)
            if (!key || key.includes('DEMO')) {
                console.warn('TBankPaymentWidget: No production Terminal Key, hiding widget');
                setError('No Terminal Key');
                return;
            }

            const initConfig = {
                terminalKey: key,
                product: 'eacq',
                features: {
                    payment: {}
                }
            };

            const integration = await window.PaymentIntegration.init(initConfig);

            // Create payment integration
            const paymentIntegration = await integration.payments.create(
                'bazzar-payment-widget',
                {
                    status: {
                        changedCallback: async (status) => {
                            console.log('Payment status changed:', status);
                            if (status === 'SUCCESS' && onSuccess) {
                                onSuccess(status);
                            } else if (['CANCELED', 'REJECTED', 'PROCESSING_ERROR'].includes(status) && onError) {
                                onError(new Error(`Payment ${status}`));
                            }
                        }
                    },
                    dialog: {
                        closedCallback: async () => {
                            console.log('Payment dialog closed');
                        }
                    },
                    payment: {
                        failedPaymentStartCallback: async (err) => {
                            console.error('Payment start failed:', err);
                            setError('Ошибка при создании платежа');
                            if (onError) onError(err);
                        }
                    }
                }
            );

            // Mount to container
            if (containerRef.current) {
                await paymentIntegration.mount(containerRef.current);
            }

            // Set payment start callback
            await integration.payments.setPaymentStartCallback(async (paymentType) => {
                console.log('Payment started with type:', paymentType);

                // Call backend to initialize payment
                const res = await fetch('/api/payment-init', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount,
                        description,
                        userId,
                        telegramId,
                        userEmail,
                        connectionType: 'Widget', // CRITICAL for widget
                        paymentType // For analytics
                    })
                });

                const data = await res.json();

                if (!data.paymentUrl) {
                    throw new Error(data.error || 'Failed to get payment URL');
                }

                // Save for success check
                if (data.paymentId) {
                    localStorage.setItem('pending_payment_id', data.paymentId);
                    localStorage.setItem('pending_order_id', data.orderId);
                }

                return data.paymentUrl;
            });

            // Update widget types
            await paymentIntegration.updateWidgetTypes(widgetTypes);

            // Update display params
            await paymentIntegration.updateDisplayParams(displayParams);

            // Set theme (auto-detect or force)
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            await paymentIntegration.setTheme(isDark ? 'dark' : 'light');

            // Set language
            await paymentIntegration.setLang('ru');

            integrationRef.current = paymentIntegration;
            setLoading(false);

        } catch (err) {
            console.error('Widget initialization error:', err);
            setError('Не удалось инициализировать виджет оплаты');
            setLoading(false);
            if (onError) onError(err);
        }
    };

    if (error) {
        // Silently hide widget if it fails - user will see classic button below
        console.warn('TBankPaymentWidget error:', error);
        return null;
    }

    return (
        <div className="w-full mt-4">
            {loading && (
                <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-slate-300 dark:border-slate-600 border-t-slate-600 dark:border-t-slate-300 rounded-full animate-spin"></div>
                    <span className="ml-3 text-sm text-slate-600 dark:text-slate-400">Загрузка способов оплаты...</span>
                </div>
            )}

            {/* Widget container */}
            <div ref={containerRef} className="w-full"></div>

            {!loading && (
                <div className="text-center mt-3">
                    <p className="text-[10px] text-slate-400 font-medium">
                        Безопасная оплата через <b>Т-Банк</b>
                    </p>
                </div>
            )}
        </div>
    );
};

export default TBankPaymentWidget;
