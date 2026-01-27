import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, Zap, ExternalLink } from 'lucide-react';
import { useSound } from '../context/SoundContext';

const InsufficientCreditsModal = ({ isOpen, onClose, onTopUp }) => {
    const { playClick } = useSound();

    const handleSubscribe = () => {
        playClick();
        // Replace with actual channel link
        window.open('https://t.me/pixel_imagess', '_blank');
        onClose();
    };

    const handleTopUp = () => {
        playClick();
        onTopUp();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md px-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) onClose();
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.8, y: 50 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.8, y: 50 }}
                        className="w-full max-w-sm bg-white dark:bg-[#1a1c22] rounded-[2rem] p-6 shadow-2xl relative overflow-hidden"
                    >
                        {/* Background Gradient */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-red-500/10 to-orange-500/10 blur-xl" />

                        <div className="relative z-10 text-center">
                            {/* Icon */}
                            <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-500">
                                <Zap size={40} className="fill-red-500/20" />
                            </div>

                            <h2 className="text-2xl font-black font-display text-slate-900 dark:text-white mb-2">
                                Недостаточно Кредитов
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium leading-relaxed">
                                Для генерации необходимо пополнить баланс или выполнить задание.
                            </p>

                            {/* Actions */}
                            <div className="flex flex-col gap-3">
                                {/* Top Up Button */}
                                <button
                                    onClick={handleTopUp}
                                    className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 text-white bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 active:scale-95 transition-transform"
                                >
                                    <Wallet size={20} />
                                    Пополнить Баланс
                                </button>

                                {/* Subscribe Button */}
                                <button
                                    onClick={handleSubscribe}
                                    className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 text-slate-700 dark:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 active:scale-95 transition-transform"
                                >
                                    <ExternalLink size={20} />
                                    Подписаться (+10⚡)
                                </button>
                            </div>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-2"
                        >
                            <X size={20} />
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default InsufficientCreditsModal;
