import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { HistorySkeleton } from '../components/ui/Skeletons';
import { ImageCard } from '../components/ui/AnimatedCards';
import { Image, Sparkles } from 'lucide-react';
import { AnimatedButton } from '../components/ui/AnimatedButtons';
import { useUser } from '../context/UserContext';
import galleryAPI from '../lib/galleryAPI';

const HistoryView = () => {
    const { t } = useLanguage();
    const { user, isLoading: isUserLoading } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [generations, setGenerations] = useState([]);

    useEffect(() => {
        if (isUserLoading) return;

        const fetchHistory = async () => {
            if (!user?.id) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                // Fetch user's history including private
                const data = await galleryAPI.getUserCreations(user.id, true);
                setGenerations(data);
            } catch (error) {
                console.error("Failed to load history", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [user, isUserLoading]);

    if (isLoading) {
        return <HistorySkeleton />;
    }

    // Empty state
    if (generations.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center"
            >
                {/* Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        delay: 0.1
                    }}
                    className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mb-6 shadow-2xl shadow-violet-500/30"
                >
                    <Image size={40} className="text-white" />
                </motion.div>

                {/* Title */}
                <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold text-slate-900 dark:text-white mb-3"
                >
                    {t('home.historyEmpty')}
                </motion.h3>

                {/* Description */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mb-8"
                >
                    {t('home.historyInfo')}
                </motion.p>

                {/* CTA Button */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <AnimatedButton
                        variant="primary"
                        icon={<Sparkles size={20} />}
                        onClick={() => {
                            // Navigate to home or open creation drawer
                            window.dispatchEvent(new CustomEvent('openCreationDrawer'));
                        }}
                    >
                        {t('creation.newCreation')}
                    </AnimatedButton>
                </motion.div>
            </motion.div>
        );
    }

    // Grid with generations
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-4 pb-20 px-4"
        >
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {t('home.history') || 'History'}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                    {generations.length} {generations.length === 1 ? 'генерация' : generations.length < 5 ? 'генерации' : 'генераций'}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {generations.map((gen, index) => (
                    <motion.div
                        key={gen.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <ImageCard
                            image={gen.image_url}
                            title={gen.prompt?.slice(0, 30) + '...' || 'Untitled'}
                            subtitle={new Date(gen.created_at).toLocaleDateString()}
                            badge={gen.is_new ? 'NEW' : null}
                            onClick={() => {
                                // Open image in modal
                                console.log('Open generation:', gen.id);
                            }}
                        />
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default HistoryView;
