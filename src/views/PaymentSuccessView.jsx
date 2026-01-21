import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { motion } from 'framer-motion';

const PaymentSuccessView = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { refreshUser } = useUser();
    const [status, setStatus] = useState('checking'); // checking, success, error

    useEffect(() => {
        const checkPayment = async () => {
            // Ждем немного, чтобы банк успел обработать
            await new Promise(r => setTimeout(r, 2000));

            try {
                // Принудительно обновляем данные пользователя
                await refreshUser();
                setStatus('success');

                // Через 3 секунды в профиль
                setTimeout(() => {
                    navigate('/profile');
                }, 3000);
            } catch (e) {
                console.error('Update error:', e);
                setStatus('error');
            }
        };

        checkPayment();
    }, [refreshUser, navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-[#0f1014] text-center">
            {status === 'checking' && (
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <h2 className="text-xl font-bold dark:text-white">Проверяем оплату...</h2>
                    <p className="text-slate-500 text-sm">Пожалуйста, подождите</p>
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
                    <h2 className="text-2xl font-bold dark:text-white">Оплата прошла успешно!</h2>
                    <p className="text-slate-500">Кредиты зачислены на ваш баланс</p>
                    <button
                        onClick={() => navigate('/profile')}
                        className="mt-6 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-bold"
                    >
                        Вернуться в профиль
                    </button>
                </motion.div>
            )}
        </div>
    );
};

export default PaymentSuccessView;
