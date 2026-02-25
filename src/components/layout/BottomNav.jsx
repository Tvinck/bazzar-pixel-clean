import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import AnimatedIcon from '../ui/AnimatedIcon';
import { TelegramHome, TelegramGallery, TelegramHistory, TelegramProfile } from '../ui/TelegramIcons';

const BottomNav = ({ activeTab, onTabChange, onCreateClick, isVisible = true, zIndex = 50 }) => {
    return (
        <div style={{ zIndex }} className={`fixed bottom-0 left-0 right-0 transition-transform duration-300 ${!isVisible ? 'translate-y-full' : 'translate-y-0'}`}>
            <nav className="bg-[#1c1c1e]/95 backdrop-blur-xl border-t border-white/10 px-2 py-2 flex justify-around items-center safe-area-bottom pb-4">

                {/* Home */}
                <NavButton
                    iconComponent={TelegramHome}
                    label="Главная"
                    isActive={activeTab === 'home'}
                    onClick={() => onTabChange('home')}
                />

                {/* Gallery */}
                <NavButton
                    iconComponent={TelegramGallery}
                    label="Галерея"
                    isActive={activeTab === 'gallery'}
                    onClick={() => onTabChange('gallery')}
                />

                {/* Create (Center) */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onCreateClick}
                    className="flex flex-col items-center justify-center gap-1 min-w-[60px] relative -translate-y-2"
                >
                    <div className="w-14 h-14 bg-gradient-to-tr from-[#2a85e4] to-[#42a5f5] rounded-full flex items-center justify-center shadow-[0_4px_16px_rgba(51,144,236,0.4)] overflow-hidden relative">
                        <motion.div
                            className="absolute inset-0 bg-white"
                            initial={{ scale: 0, opacity: 0 }}
                            whileTap={{ scale: 2, opacity: 0.3 }}
                            transition={{ duration: 0.4 }}
                        />
                        <AnimatedIcon icon={Plus} size={28} className="text-white z-10" />
                    </div>
                </motion.button>

                {/* History */}
                <NavButton
                    iconComponent={TelegramHistory}
                    label="История"
                    isActive={activeTab === 'history'}
                    onClick={() => onTabChange('history')}
                />

                {/* Profile */}
                <NavButton
                    iconComponent={TelegramProfile}
                    label="Профиль"
                    isActive={activeTab === 'profile'}
                    onClick={() => onTabChange('profile')}
                />
            </nav>
        </div>
    );
};

const NavButton = ({ iconComponent: IconComponent, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center justify-center gap-1 min-w-[64px] h-[56px] relative transition-colors duration-200"
    >
        <div className="relative flex items-center justify-center h-8">
            <IconComponent active={isActive} size={28} />
        </div>
        <span className={`text-[11px] font-medium z-10 transition-colors duration-300 ${isActive ? 'text-[#3390ec]' : 'text-white/50'
            }`}>
            {label}
        </span>
    </button>
);

export default BottomNav;
