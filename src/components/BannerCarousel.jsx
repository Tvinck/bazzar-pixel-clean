import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Coins, Bell, Sparkles, ChevronRight, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const banners = [
    {
        id: 1,
        title: "COMMUNITY",
        subtitle: "Вступай в сообщество",
        desc: "Находи единомышленников",
        icon: Users,
        colors: ["#6366f1", "#8b5cf6", "#d946ef"], // Indigo -> Violet -> Fuchsia
        link: "https://t.me/pixel_communityy",
        accent: "rgba(255,255,255,0.2)"
    },
    {
        id: 2,
        title: "REWARDS",
        subtitle: "Разыгрываем 50 000",
        desc: "Кредитов на генерации",
        icon: Coins,
        colors: ["#f59e0b", "#ea580c", "#db2777"], // Amber -> Orange -> Pink
        link: "https://t.me/pixel_imagess/6",
        action: "WIN",
        accent: "rgba(255,255,255,0.2)"
    },
    {
        id: 3,
        title: "UPDATES",
        subtitle: "Подпишись на канал",
        desc: "Новости и фишки",
        icon: Bell,
        colors: ["#0ea5e9", "#3b82f6", "#2563eb"], // Sky -> Blue -> Royal
        link: "https://t.me/pixel_imagess",
        accent: "rgba(255,255,255,0.2)"
    }
];

const BannerCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5000); // Faster rotation

        return () => clearInterval(timer);
    }, []);

    const handleBannerClick = (link) => {
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
            if (link) window.Telegram.WebApp.openTelegramLink(link);
        }
    };

    return (
        <div className="relative w-full h-[180px] rounded-3xl overflow-hidden group cursor-pointer shadow-lg">
            {/* Main Carousel Container */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    onClick={() => handleBannerClick(banners[currentIndex].link)}
                    className="absolute inset-0 w-full h-full relative overflow-hidden bg-white"
                >
                    {/* Soft Gradient Background */}
                    <div
                        className="absolute inset-0 opacity-20 transition-all duration-1000"
                        style={{
                            background: `
                                linear-gradient(135deg, 
                                    ${banners[currentIndex].colors[0]} 0%, 
                                    ${banners[currentIndex].colors[1]} 50%, 
                                    ${banners[currentIndex].colors[2]} 100%
                                )
                            `
                        }}
                    />

                    {/* Decorative Blob */}
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 0]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-20 -right-20 w-64 h-64 opacity-10 blur-3xl rounded-full"
                        style={{
                            background: `radial-gradient(circle, ${banners[currentIndex].colors[1]}, transparent)`
                        }}
                    />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-between p-6 z-10">
                        {/* Top Row: Icon badge & Action */}
                        <div className="flex justify-between items-start">
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="w-12 h-12 bg-gradient-to-br rounded-2xl flex items-center justify-center shadow-lg"
                                style={{
                                    background: `linear-gradient(135deg, ${banners[currentIndex].colors[0]}, ${banners[currentIndex].colors[1]})`
                                }}
                            >
                                {React.createElement(banners[currentIndex].icon, { size: 22, className: "text-white" })}
                            </motion.div>

                            {banners[currentIndex].action && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", delay: 0.4 }}
                                    className="text-white text-xs font-black uppercase tracking-wider px-4 py-2 rounded-full flex items-center gap-1.5 shadow-lg"
                                    style={{
                                        background: `linear-gradient(135deg, ${banners[currentIndex].colors[0]}, ${banners[currentIndex].colors[1]})`
                                    }}
                                >
                                    <Zap size={12} className="fill-white" />
                                    {banners[currentIndex].action}
                                </motion.div>
                            )}
                        </div>

                        {/* Huge Background Text (Subtle) */}
                        <h1
                            className="absolute -right-4 top-1/2 -translate-y-1/2 text-[80px] font-black opacity-[0.03] font-display pointer-events-none select-none tracking-tighter leading-none whitespace-nowrap"
                            style={{ color: banners[currentIndex].colors[1] }}
                        >
                            {banners[currentIndex].title}
                        </h1>

                        {/* Bottom Content */}
                        <div className="relative">
                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-2xl font-black leading-7 mb-2 font-display bg-gradient-to-r bg-clip-text text-transparent"
                                style={{
                                    backgroundImage: `linear-gradient(135deg, ${banners[currentIndex].colors[0]}, ${banners[currentIndex].colors[1]})`
                                }}
                            >
                                {banners[currentIndex].subtitle}
                            </motion.h2>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="flex items-center gap-2"
                            >
                                <div
                                    className="h-0.5 w-6 rounded-full"
                                    style={{ backgroundColor: banners[currentIndex].colors[1] }}
                                />
                                <p className="text-gray-600 font-semibold text-sm">{banners[currentIndex].desc}</p>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Custom Paginator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {banners.map((banner, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ scale: 1.2 }}
                        className={`rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 h-1.5' : 'w-1.5 h-1.5'
                            }`}
                        style={{
                            backgroundColor: idx === currentIndex
                                ? banner.colors[1]
                                : '#D1D5DB'
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default BannerCarousel;
