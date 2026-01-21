import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { motion } from 'framer-motion';

const PaymentSuccessView = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Add location
    const { user, refreshUser } = useUser();
    const [status, setStatus] = useState('checking');

    const hasVerified = React.useRef(false);

    useEffect(() => {
        if (!user || hasVerified.current) return;

        const verifyPayment = async () => {
            hasVerified.current = true; // Mark as started

            // Priority: 1. Deep Link State, 2. Local Storage
            const orderId = location.state?.orderId || localStorage.getItem('pending_order_id');
            const paymentId = localStorage.getItem('pending_payment_id');

            // Если ID нет вообще, просто пробуем обновить профиль
            if (!paymentId && !orderId) {
                await refreshUser();
                setStatus('success');
                return;
            }

            try {
                // Активная проверка через наш сервер -> Т-Банк
                const res = await fetch('/api/payment-check', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        paymentId,
                        orderId,
                        userId: user?.id
                    })
                });

                const data = await res.json();

                if (data.success || data.status === 'ALREADY_CREDITED') {
                    // Mark as processed globally
                    if (orderId) {
                        const processed = JSON.parse(localStorage.getItem('processed_orders') || '[]');
                        if (!processed.includes(orderId)) {
                            processed.push(orderId);
                            localStorage.setItem('processed_orders', JSON.stringify(processed));
                        }
                    }

                    // Очищаем
                    localStorage.removeItem('pending_payment_id');
                    localStorage.removeItem('pending_order_id');

                    // Обновляем UI
                    await refreshUser();
                    setStatus('success');
                } else {
                    console.warn('Payment check failed:', data);
                    await refreshUser();
                    setStatus('success');
                }

                // Авто-редирект
                setTimeout(() => navigate('/profile', { replace: true, state: {} }), 3000);

            } catch (e) {
                console.error('Verify Check Error:', e);
                setStatus('success');
                setTimeout(() => navigate('/profile', { replace: true, state: {} }), 3000);
            }
        };

        verifyPayment();
    }, [user, navigate]); // Removed refreshUser to avoid loop, though ref handles it.

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-[#0f1014] text-center">
            {status === 'checking' && (
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <h2 className="text-xl font-bold dark:text-white">Подтверждаем оплату в банке...</h2>
                    <p className="text-slate-500 text-sm">Секундочку</p>
                </div>
            )}

            {status === 'success' && (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold dark:text-white">Успешно!</h2>
                    <p className="text-slate-500">Ваш баланс обновлен</p>
                    <button
                        onClick={() => navigate('/profile')}
                        className="mt-6 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-bold"
                    >
                        В профиль
                    </button>
                </motion.div>
            )}
        </div>
    );
};

export default PaymentSuccessView;
