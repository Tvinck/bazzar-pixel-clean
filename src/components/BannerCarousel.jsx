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
    const { t } = useLanguage();

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
        <div className="relative w-full h-[240px] rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-2xl shadow-indigo-500/10">
            {/* Main Carousel Container */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    onClick={() => handleBannerClick(banners[currentIndex].link)}
                    className="absolute inset-0 w-full h-full relative overflow-hidden bg-slate-900"
                >
                    {/* 1. Animated Gradient Mesh Background */}
                    <div
                        className="absolute inset-0 opacity-80 transition-all duration-1000"
                        style={{
                            background: `
                                radial-gradient(circle at 0% 0%, ${banners[currentIndex].colors[0]}, transparent 50%),
                                radial-gradient(circle at 100% 0%, ${banners[currentIndex].colors[1]}, transparent 50%),
                                radial-gradient(circle at 100% 100%, ${banners[currentIndex].colors[2]}, transparent 50%),
                                radial-gradient(circle at 0% 100%, ${banners[currentIndex].colors[0]}, transparent 50%)
                            `
                        }}
                    />

                    {/* 2. Moving Blobs (Lava Lamp effect) */}
                    <motion.div
                        animate={{
                            x: [-20, 20, -20],
                            y: [-20, 20, -20],
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 0]
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute top-[-20%] left-[-20%] w-[120%] h-[120%] opacity-50 blur-[80px]"
                        style={{
                            background: `conic-gradient(from 0deg, ${banners[currentIndex].colors[0]}, ${banners[currentIndex].colors[1]}, ${banners[currentIndex].colors[2]}, ${banners[currentIndex].colors[0]})`
                        }}
                    />

                    {/* 3. Noise Texture Overlay */}
                    <div className="absolute inset-0 bg-noise opacity-[0.07] mix-blend-overlay pointer-events-none" />

                    {/* 4. Glassmorphism Shine/Reflection */}
                    <motion.div
                        initial={{ x: '-150%', opacity: 0 }}
                        animate={{ x: '150%', opacity: [0, 0.4, 0] }}
                        transition={{ duration: 3, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }}
                        className="absolute inset-0 w-2/3 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-25 pointer-events-none"
                    />

                    {/* 5. Typography & Content */}
                    <div className="absolute inset-0 flex flex-col justify-between p-7 z-10">
                        {/* Top Row: Icon badge & Action */}
                        <div className="flex justify-between items-start">
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg shadow-black/10"
                            >
                                {React.createElement(banners[currentIndex].icon, { size: 24, className: "text-white" })}
                            </motion.div>

                            {banners[currentIndex].action && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", delay: 0.4 }}
                                    className="bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1 shadow-xl"
                                >
                                    <Zap size={10} className="fill-slate-900" />
                                    {banners[currentIndex].action}
                                </motion.div>
                            )}
                        </div>

                        {/* Huge Background Text (Clipped) */}
                        <h1 className="absolute -right-4 top-1/2 -translate-y-1/2 text-[100px] font-black text-white opacity-[0.06] font-display pointer-events-none select-none tracking-tighter leading-none whitespace-nowrap">
                            {banners[currentIndex].title}
                        </h1>

                        {/* Bottom Content */}
                        <div className="relative">
                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-3xl font-black text-white leading-8 mb-2 font-display drop-shadow-lg"
                            >
                                {banners[currentIndex].subtitle}
                            </motion.h2>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="flex items-center gap-2"
                            >
                                <div className="h-0.5 w-6 bg-white/50 rounded-full" />
                                <p className="text-white/90 font-bold text-sm tracking-wide">{banners[currentIndex].desc}</p>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Custom Paginator */}
            <div className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col gap-2 z-20">
                {banners.map((_, idx) => (
                    <div
                        key={idx}
                        className={`w-1.5 rounded-full transition-all duration-500 ${idx === currentIndex ? 'h-6 bg-white' : 'h-1.5 bg-white/30'}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default BannerCarousel;
