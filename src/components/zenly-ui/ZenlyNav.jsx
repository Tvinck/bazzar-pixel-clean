import React from 'react';
import { motion } from 'framer-motion';
import { Home, Compass, User, Zap, Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const TABS = [
    { id: 'home', icon: Home, label: 'Главная', path: '/' },
    { id: 'discover', icon: Compass, label: 'Обзор', path: '/image-templates' }, // Changed to new templates page
    { id: 'create', icon: Plus, label: 'Создать', isSpecial: true },
    { id: 'saved', icon: Zap, label: 'Избранное', path: '/saved' }, // Changed to something valid or keep as placeholder
    { id: 'profile', icon: User, label: 'Профиль', path: '/profile' }
];

export const ZenlyNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
            <div className="pointer-events-auto relative bg-white/80 dark:bg-bg-secondary/90 backdrop-blur-[30px] rounded-[32px] px-6 py-3 flex items-center justify-between gap-2 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)] ring-1 ring-white/60 dark:ring-white/10 min-w-[320px]">

                {TABS.map((tab) => {
                    const isActive = location.pathname === tab.path;
                    const Icon = tab.icon;

                    if (tab.isSpecial) {
                        return (
                            <div key={tab.id} className="relative -mt-10 mx-2 group cursor-pointer">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/design-lab')}
                                    className="w-16 h-16 rounded-[24px] rotate-45 bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-[0_10px_20px_rgba(79,70,229,0.4)] border-[6px] border-[#F0F2F8] dark:border-[#0f1014] relative z-10"
                                >
                                    <Plus size={32} strokeWidth={3} className="text-white -rotate-45" />
                                </motion.button>
                            </div>
                        );
                    }

                    return (
                        <button
                            key={tab.id}
                            onClick={() => tab.path && navigate(tab.path)}
                            className="relative flex flex-col items-center justify-center gap-1 cursor-pointer w-12 h-10"
                        >
                            <motion.div
                                animate={{
                                    y: isActive ? -2 : 0,
                                    color: isActive ? '#3B82F6' : '#A8A29E' // Blue vs Stone-400
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                                <Icon size={26} strokeWidth={isActive ? 3 : 2.5} />
                            </motion.div>

                            {/* Dot Indicator */}
                            {isActive && (
                                <motion.div
                                    layoutId="nav-dot"
                                    className="absolute -bottom-2 w-1 h-1 bg-blue-500 rounded-full"
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
