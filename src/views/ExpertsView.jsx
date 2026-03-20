import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EXPERTS } from '../config/experts';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { SkeletonCard } from '../components/ui/Skeleton';

/**
 * ExpertsView - Main screen showing all available AI experts
 */
export default function ExpertsView() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    // const [selectedCategory, setSelectedCategory] = useState('all');

    // Group experts by category (for future filtering)
    /*
    const categories = [
        { id: 'all', label: 'Все', emoji: '✨' },
        { id: 'health', label: 'Здоровье', emoji: '💚' },
        { id: 'lifestyle', label: 'Лайфстайл', emoji: '🌟' },
        { id: 'fun', label: 'Развлечение', emoji: '🎭' },
    ];
    */

    const handleExpertClick = (expert) => {
        // Haptic feedback for Telegram
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
        navigate(`/experts/${expert.id}`);
    };

    return (
        <div className="min-h-screen bg-black pb-24 md:max-w-3xl md:mx-auto md:px-6">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center justify-between px-4 py-3 pt-[calc(env(safe-area-inset-top)+10px)]">
                    <button
                        onClick={() => navigate('/')}
                        className="p-1 -ml-1 active:opacity-60 transition-opacity"
                    >
                        <ChevronLeft className="w-7 h-7 text-accent-blue" />
                    </button>
                    <h1 className="text-[17px] font-semibold text-white tracking-tight flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-accent-blue" />
                        Эксперты
                    </h1>
                    <div className="w-8" /> {/* Spacer for centering */}
                </div>
            </div>

            {/* Hero Section */}
            <div className="px-4 py-5">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-5"
                >
                    <p className="text-text-secondary text-[15px]">
                        AI-помощники с уникальными личностями
                    </p>
                </motion.div>

                {/* Experts Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {isLoading ? (
                        [1, 2, 3, 4, 5, 6].map(i => (
                            <SkeletonCard key={i} />
                        ))
                    ) : (
                        EXPERTS.map((expert, index) => (
                            <motion.div
                                key={expert.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => handleExpertClick(expert)}
                                className="relative overflow-hidden rounded-input cursor-pointer group active:scale-[0.97] transition-transform"
                                style={{ background: expert.gradient }}
                            >
                                {/* Card Content */}
                                <div className="relative p-4 min-h-[140px] flex flex-col justify-between">
                                    {/* Emoji */}
                                    <div className="text-4xl mb-2 transform group-hover:scale-110 transition-transform">
                                        {expert.emoji}
                                    </div>

                                    {/* Info */}
                                    <div>
                                        <h3 className="font-semibold text-white text-[15px] leading-tight mb-1">
                                            {expert.name}
                                        </h3>
                                        <p className="text-white/70 text-[13px] line-clamp-2">
                                            {expert.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Bottom gradient overlay */}
                                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Info Note */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 p-4 rounded-input bg-bg-secondary"
                >
                    <p className="text-[13px] text-text-secondary text-center leading-relaxed">
                        🤖 Эксперты используют AI для генерации ответов.
                        Для серьезных вопросов обращайтесь к профессионалам.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
