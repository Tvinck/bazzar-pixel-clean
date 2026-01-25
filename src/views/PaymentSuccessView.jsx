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
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0f0f10] text-center relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-sm max-h-sm bg-indigo-500/10 blur-[100px] pointer-events-none" />

            {status === 'checking' && (
                <div className="flex flex-col items-center gap-6 relative z-10">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-white rounded-full animate-spin shadow-[0_0_20px_rgba(99,102,241,0.3)]"></div>
                    <div>
                        <h2 className="text-2xl font-black text-white mb-2">Verifying...</h2>
                        <p className="text-white/40 text-sm font-medium">Connecting to bank secure gateway</p>
                    </div>
                </div>
            )}

            {status === 'success' && (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-6 relative z-10"
                >
                    <div className="w-24 h-24 bg-gradient-to-tr from-green-500 to-emerald-400 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.4)] relative">
                        <div className="absolute inset-0 bg-white/20 blur-xl rounded-full" />
                        <svg className="w-10 h-10 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Success!</h2>
                        <p className="text-white/50 font-medium">Your balance has been updated</p>
                    </div>
                    <button
                        onClick={() => navigate('/profile')}
                        className="mt-8 px-8 py-4 bg-white text-black hover:bg-white/90 rounded-2xl font-black uppercase tracking-wide shadow-lg shadow-white/10 transition-all active:scale-95"
                    >
                        Back to Profile
                    </button>
                </motion.div>
            )}
        </div>
    );
};

export default PaymentSuccessView;
