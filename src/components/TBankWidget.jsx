import React, { useState } from 'react';

/**
 * Simple T-Bank Payment Button
 * Opens the official payment page in a new window/tab
 */
const TBankWidget = ({ amount, description, userId, telegramId, userEmail }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handlePayment = async () => {
        setLoading(true);
        setError(null);
        try {
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
                // Open the payment page directly
                if (window.Telegram?.WebApp) {
                    window.Telegram.WebApp.openLink(data.paymentUrl);
                } else {
                    window.open(data.paymentUrl, '_blank');
                }
            } else {
                setError(data.error || 'Ошибка при создании платежа');
            }
        } catch (err) {
            console.error('Payment Error:', err);
            setError('Не удалось связаться с банком');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full mt-4 space-y-3">
            <button
                onClick={handlePayment}
                disabled={loading}
                className={`
                    w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-3
                    text-base font-bold transition-all active:scale-[0.98]
                    ${loading
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-[#FFDD2D] text-[#000000] hover:bg-[#FFD200] shadow-lg shadow-yellow-500/20'
                    }
                `}
            >
                {loading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                        <span>Создание счета...</span>
                    </>
                ) : (
                    <>
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                            <path d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z" fill="currentColor" />
                        </svg>
                        <span>Оплатить картой / СБП</span>
                    </>
                )}
            </button>

            {error && (
                <p className="text-[11px] text-red-500 text-center font-medium bg-red-50 dark:bg-red-900/20 py-2 rounded-xl border border-red-100 dark:border-red-900/10">
                    {error}
                </p>
            )}

            <div className="text-center">
                <p className="text-[10px] text-slate-400 font-medium">
                    Безопасная оплата через <b>Т-Банк</b>
                </p>
            </div>
        </div>
    );
};

export default TBankWidget;
