import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Ghost, Home, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFoundView = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-white text-center">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-8 relative"
            >
                <div className="w-32 h-32 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
                    <Ghost size={64} className="text-slate-400 dark:text-slate-500" />
                </div>
                <div className="absolute -bottom-2 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg rotate-12">
                    404 Error
                </div>
            </motion.div>

            <h1 className="text-3xl font-black font-display mb-2">Страница не найдена</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto text-sm leading-relaxed">
                Похоже, вы заблудились в генерации. Этой страницы не существует или она была удалена.
            </p>

            <div className="flex flex-col w-full max-w-xs gap-3">
                <button
                    onClick={() => navigate('/')}
                    className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                >
                    <Home size={20} />
                    На главную
                </button>

                <button
                    onClick={() => navigate(-1)}
                    className="w-full py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all border border-slate-200 dark:border-white/10"
                >
                    <ArrowLeft size={20} />
                    Назад
                </button>
            </div>
        </div>
    );
};

export default NotFoundView;
