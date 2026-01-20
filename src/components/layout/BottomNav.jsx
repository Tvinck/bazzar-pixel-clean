import React from 'react';
import { motion } from 'framer-motion';
import { Home, Compass, Sparkles, History, User } from 'lucide-react';

const BottomNav = ({ activeTab, onTabChange, onCreateClick, isVisible = true, zIndex = 50 }) => {
    return (
        <div style={{ zIndex }} className={`fixed bottom-0 left-0 right-0 transition-transform duration-300 pb-safe ${!isVisible ? 'translate-y-[200%]' : 'translate-y-0'}`}>
            <nav className="bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 pb-2 pt-2 px-2 flex justify-around items-end shadow-2xl">

                {/* Home */}
                <button
                    onClick={() => onTabChange('home')}
                    className={`flex flex-col items-center gap-1 p-2 min-w-[64px] transition-colors ${activeTab === 'home' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/60'}`}
                >
                    <Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">Главная</span>
                </button>

                {/* Ideas (Gallery) */}
                <button
                    onClick={() => onTabChange('gallery')}
                    className={`flex flex-col items-center gap-1 p-2 min-w-[64px] transition-colors ${activeTab === 'gallery' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/60'}`}
                >
                    <Compass size={24} strokeWidth={activeTab === 'gallery' ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">Идеи</span>
                </button>

                {/* Create (Prominent) */}
                <div className="relative -top-5">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={onCreateClick}
                        className="flex flex-col items-center gap-1 group"
                    >
                        <div className="w-14 h-14 bg-gradient-to-tr from-amber-300 to-amber-500 rounded-[18px] flex items-center justify-center shadow-lg shadow-amber-500/20 ring-4 ring-white dark:ring-black">
                            <Sparkles size={28} className="text-[#321805]" strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-bold text-amber-500 dark:text-amber-400 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">Создать</span>
                    </motion.button>
                </div>

                {/* History */}
                <button
                    onClick={() => onTabChange('history')}
                    className={`flex flex-col items-center gap-1 p-2 min-w-[64px] transition-colors ${activeTab === 'history' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/60'}`}
                >
                    <History size={24} strokeWidth={activeTab === 'history' ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">История</span>
                </button>

                {/* Profile */}
                <button
                    onClick={() => onTabChange('profile')}
                    className={`flex flex-col items-center gap-1 p-2 min-w-[64px] transition-colors ${activeTab === 'profile' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/60'}`}
                >
                    <User size={24} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">Профиль</span>
                </button>

            </nav>
        </div>
    );
};

export default BottomNav;
