import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';

const PaymentSuccessOverlay = ({ isOpen, onClose }) => {
    useEffect(() => {
        if (isOpen) {
            // Auto-close after 4 seconds
            const timer = setTimeout(() => {
                onClose();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#0f0f10]/90 backdrop-blur-xl"
                    />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center">
                        {/* Circle Burst Animation */}
                        <div className="relative mb-8">
                            {/* Inner Circle */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
                                className="w-32 h-32 rounded-full bg-gradient-to-tr from-green-400 to-emerald-600 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.5)] relative z-20"
                            >
                                <motion.div
                                    initial={{ scale: 0, rotate: -45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", delay: 0.3 }}
                                >
                                    <Check size={64} className="text-white" strokeWidth={4} />
                                </motion.div>
                            </motion.div>

                            {/* Ripple Effect */}
                            {[1, 2, 3].map((i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0.8, opacity: 1 }}
                                    animate={{ scale: 2.5, opacity: 0 }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: i * 0.4,
                                        ease: "easeOut"
                                    }}
                                    className="absolute inset-0 rounded-full border border-emerald-500/30 z-10"
                                />
                            ))}

                            {/* Floating Particles */}
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={`p-${i}`}
                                    initial={{ x: 0, y: 0, scale: 0 }}
                                    animate={{
                                        x: (Math.random() - 0.5) * 200,
                                        y: (Math.random() - 0.5) * 200,
                                        scale: [0, 1, 0],
                                        rotate: Math.random() * 360
                                    }}
                                    transition={{ duration: 1.5, delay: 0.2 }}
                                    className="absolute inset-0 m-auto w-4 h-4 text-amber-400"
                                >
                                    <Sparkles size={16} fill="currentColor" />
                                </motion.div>
                            ))}
                        </div>

                        {/* Text */}
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-4xl font-black text-white text-center mb-2 tracking-tight"
                        >
                            Успешно!
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="text-white/50 font-bold text-lg"
                        >
                            Баланс пополнен 🚀
                        </motion.p>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PaymentSuccessOverlay;
