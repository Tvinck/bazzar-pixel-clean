import React, { useEffect, useRef } from 'react';

const PaymentWidget = ({ amount, description, userId }) => {
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;

        const initWidget = () => {
            if (!window.PaymentIntegration) return;

            const initConfig = {
                terminalKey: '1768938209941DEMO',
                product: 'eacq',
                features: {
                    payment: {
                        container: document.getElementById('payment-container'),
                        paymentStartCallback: async () => {
                            console.log('Initiating payment on backend...');
                            try {
                                const res = await fetch('/api/payment-init', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ amount, description, userId })
                                });
                                const data = await res.json();
                                if (data.error) throw new Error(data.error);

                                console.log('Payment URL received:', data.paymentUrl);
                                return data.paymentUrl;
                            } catch (e) {
                                console.error('Payment Failed', e);
                                alert('Ошибка оплаты: ' + e.message);
                                return null;
                            }
                        }
                    }
                }
            };

            window.PaymentIntegration.init(initConfig)
                .then(() => {
                    initialized.current = true;
                    // Remove loading text if it exists
                    const loader = document.getElementById('payment-loader');
                    if (loader) loader.style.display = 'none';
                })
                .catch(err => console.error('Widget Init Error:', err));
        };

        // Try init immediately or poll
        if (window.PaymentIntegration) {
            initWidget();
        } else {
            const interval = setInterval(() => {
                if (window.PaymentIntegration) {
                    initWidget();
                    clearInterval(interval);
                }
            }, 200);
            return () => clearInterval(interval);
        }

    }, [amount, description, userId]);

    return (
        <div className="w-full">
            <div id="payment-container" className="w-full">
                <div id="payment-loader" className="text-center text-gray-400 py-4 text-sm animate-pulse">
                    Загрузка кассы...
                </div>
            </div>
        </div>
    );
};

export default PaymentWidget;
