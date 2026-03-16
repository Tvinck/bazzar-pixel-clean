import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { motion } from 'framer-motion';

const PaymentSuccessView = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, refreshUser } = useUser();
    const [status, setStatus] = useState('checking');

    const hasVerified = React.useRef(false);

    useEffect(() => {
        if (!user || hasVerified.current) return;

        const verifyPayment = async () => {
            hasVerified.current = true;

            const orderId = location.state?.orderId || localStorage.getItem('pending_order_id');
            const paymentId = localStorage.getItem('pending_payment_id');

            if (!paymentId && !orderId) {
                await refreshUser();
                setStatus('success');
                return;
            }

            try {
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
                    if (orderId) {
                        const processed = JSON.parse(localStorage.getItem('processed_orders') || '[]');
                        if (!processed.includes(orderId)) {
                            processed.push(orderId);
                            localStorage.setItem('processed_orders', JSON.stringify(processed));
                        }
                    }

                    localStorage.removeItem('pending_payment_id');
                    localStorage.removeItem('pending_order_id');

                    await refreshUser();
                    setStatus('success');
                } else {
                    console.warn('Payment check failed:', data);
                    await refreshUser();
                    setStatus('success');
                }

                setTimeout(() => navigate('/profile', { replace: true, state: {} }), 3000);

            } catch (e) {
                console.error('Verify Check Error:', e);
                setStatus('success');
                setTimeout(() => navigate('/profile', { replace: true, state: {} }), 3000);
            }
        };

        verifyPayment();
    }, [user, navigate, location.state?.orderId, refreshUser]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black text-center relative overflow-hidden">

            {status === 'checking' && (
                <div className="flex flex-col items-center gap-6 relative z-10">
                    <div className="w-16 h-16 border-4 border-accent-blue border-t-white rounded-full animate-spin"></div>
                    <div>
                        <h2 className="text-[22px] font-bold text-white mb-2 tracking-tight">Проверяем...</h2>
                        <p className="text-text-secondary text-[15px]">Подключение к платёжному шлюзу</p>
                    </div>
                </div>
            )}

            {status === 'success' && (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-6 relative z-10"
                >
                    <div className="w-20 h-20 bg-accent-blue rounded-full flex items-center justify-center relative">
                        <svg className="w-10 h-10 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-[22px] font-bold text-white mb-2 tracking-tight">Успешно!</h2>
                        <p className="text-text-secondary text-[15px]">Ваш баланс обновлён</p>
                    </div>
                    <button
                        onClick={() => navigate('/profile')}
                        className="mt-6 px-8 py-3.5 bg-accent-blue text-white rounded-input text-[17px] font-semibold transition-all active:scale-[0.97]"
                    >
                        Вернуться в профиль
                    </button>
                </motion.div>
            )}
        </div>
    );
};

export default PaymentSuccessView;
