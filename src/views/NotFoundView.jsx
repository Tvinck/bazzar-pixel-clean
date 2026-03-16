import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Ghost, Home, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFoundView = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black text-white text-center">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-8 relative"
            >
                <div className="w-28 h-28 bg-bg-secondary rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Ghost size={56} className="text-text-secondary" />
                </div>
                <div className="absolute -bottom-2 right-2 bg-[#ff3b30] text-white text-[11px] font-bold px-2 py-1 rounded-[8px] rotate-12">
                    404
                </div>
            </motion.div>

            <h1 className="text-[28px] font-bold tracking-tight mb-2">Страница не найдена</h1>
            <p className="text-text-secondary mb-8 max-w-xs mx-auto text-[15px] leading-relaxed">
                Похоже, вы заблудились в генерации. Этой страницы не существует или она была удалена.
            </p>

            <div className="flex flex-col w-full max-w-xs gap-3">
                <button
                    onClick={() => navigate('/')}
                    className="w-full py-3.5 bg-accent-blue text-white rounded-input text-[17px] font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                >
                    <Home size={20} />
                    На главную
                </button>

                <button
                    onClick={() => navigate(-1)}
                    className="w-full py-3.5 bg-bg-secondary text-white rounded-input text-[17px] font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                >
                    <ArrowLeft size={20} />
                    Назад
                </button>
            </div>
        </div>
    );
};

export default NotFoundView;
