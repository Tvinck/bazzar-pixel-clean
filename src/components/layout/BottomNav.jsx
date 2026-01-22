import React from 'react';
import { motion } from 'framer-motion';
import { Home, Compass, Sparkles, History, User } from 'lucide-react';

const BottomNav = ({ activeTab, onTabChange, onCreateClick, isVisible = true, zIndex = 50 }) => {
    return (
        <div style={{ zIndex }} className={`fixed bottom-4 left-4 right-4 transition-transform duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) ${!isVisible ? 'translate-y-[150%]' : 'translate-y-0'}`}>
            <nav className="bg-white/90 dark:bg-[#121212]/90 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 rounded-[2rem] px-2 py-3 shadow-2xl shadow-indigo-500/10 flex justify-between items-center relative">

                {/* Home */}
                <NavButton
                    icon={Home}
                    label="Главная"
                    isActive={activeTab === 'home'}
                    onClick={() => onTabChange('home')}
                />

                {/* Gallery */}
                <NavButton
                    icon={Compass}
                    label="Галерея"
                    isActive={activeTab === 'gallery'}
                    onClick={() => onTabChange('gallery')}
                />

                {/* Create (Floating Center) */}
                <div className="relative -top-8 mx-2">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={onCreateClick}
                        className="w-16 h-16 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl shadow-indigo-500/40 ring-4 ring-[#F8F9FC] dark:ring-[#0f1014] relative z-20 group"
                    >
                        <Sparkles size={28} className="text-white fill-white animate-pulse-slow" />
                        <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.button>
                </div>

                {/* History */}
                <NavButton
                    icon={History}
                    label="История"
                    isActive={activeTab === 'history'}
                    onClick={() => onTabChange('history')}
                />

                {/* Profile */}
                <NavButton
                    icon={User}
                    label="Профиль"
                    isActive={activeTab === 'profile'}
                    onClick={() => onTabChange('profile')}
                />
            </nav>
        </div>
    );
};

const NavButton = ({ icon: Icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex flex-col items-center gap-1 min-w-[50px] relative transition-colors duration-300 ${isActive ? 'text-indigo-500 dark:text-white' : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300'}`}
    >
        <div className="relative">
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className="transition-all duration-300" />
            {isActive && (
                <motion.div
                    layoutId="activeTabDot"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-500 dark:bg-white rounded-full"
                />
            )}
        </div>
        <span className={`text-[9px] font-bold transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 hidden'}`}>
            {label}
        </span>
    </button>
);

export default BottomNav;
