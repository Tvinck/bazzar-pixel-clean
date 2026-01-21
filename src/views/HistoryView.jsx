import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { HistorySkeleton } from '../components/ui/Skeletons';
import { ImageCard } from '../components/ui/AnimatedCards';
import { Image, Sparkles, X, Repeat, Globe, Share2, Download } from 'lucide-react';
import { AnimatedButton } from '../components/ui/AnimatedButtons';
import { useUser } from '../context/UserContext';
import galleryAPI from '../lib/galleryAPI';

const HistoryView = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { user, isLoading: isUserLoading } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [generations, setGenerations] = useState([]);

    // Detailed View State
    const [selectedItem, setSelectedItem] = useState(null);

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

    const handlePublish = async (item) => {
        if (!item) return;

        const newStatus = !item.is_public;

        // 1. Optimistic Update (UI)
        setGenerations(prev => prev.map(g => g.id === item.id ? { ...g, is_public: newStatus } : g));
        setSelectedItem(prev => prev ? { ...prev, is_public: newStatus } : null);

        // 2. API Call
        const res = await galleryAPI.togglePublic(item.id, newStatus);

        if (!res.success) {
            // Revert on failure
            alert('Ошибка при обновлении статуса');
            setGenerations(prev => prev.map(g => g.id === item.id ? { ...g, is_public: !newStatus } : g));
            setSelectedItem(prev => prev ? { ...prev, is_public: !newStatus } : null);
        }
    };

    const handleRepeat = (item) => {
        // Navigate to generation view
        // Map backend model ID to frontend type if needed, or default to image-gen
        let type = 'image-gen';
        if (item.type === 'video') type = 'video-gen';

        navigate(`/generate/${type}`, {
            state: {
                prompt: item.prompt,
                model: item.model_id
            }
        });
    };

    if (isLoading) {
        return <HistorySkeleton />;
    }

    // Empty state
    if (!generations || generations.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                    className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mb-6 shadow-2xl shadow-violet-500/30"
                >
                    <Image size={40} className="text-white" />
                </motion.div>

                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                    {t('home.historyEmpty') || 'История пуста'}
                </h3>

                <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mb-8">
                    {t('home.historyInfo') || 'Здесь будут отображаться ваши генерации.'}
                </p>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <AnimatedButton variant="primary" icon={<Sparkles size={20} />} onClick={() => navigate('/create')}>
                        {t('creation.newCreation') || 'Создать'}
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
                    {t('home.history') || 'История'}
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
                            onClick={() => setSelectedItem(gen)}
                        />
                    </motion.div>
                ))}
            </div>

            {/* --- DETAIL MODAL --- */}
            <AnimatePresence>
                {selectedItem && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedItem(null)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-md"
                        />

                        {/* Content */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="relative bg-white dark:bg-[#151517] w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl border border-white/10"
                        >
                            {/* Image */}
                            <div className="aspect-square relative bg-black/50">
                                {selectedItem.type === 'video' ? (
                                    <video src={selectedItem.image_url} className="w-full h-full object-contain" controls loop autoPlay />
                                ) : (
                                    <img src={selectedItem.image_url} className="w-full h-full object-cover" />
                                )}
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="absolute top-4 right-4 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-md hover:bg-black/70 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Info */}
                            <div className="p-6">
                                <div className="mb-6">
                                    <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white line-clamp-2 leading-tight">
                                        {selectedItem.prompt}
                                    </h3>
                                    <div className="flex gap-2 text-xs text-slate-500 font-mono">
                                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">{selectedItem.model_id}</span>
                                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg uppercase">{selectedItem.ratio || '1:1'}</span>
                                    </div>
                                </div>

                                {/* Actions Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleRepeat(selectedItem)}
                                        className="col-span-2 py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                                    >
                                        <Repeat size={18} />
                                        Повторить / Remix
                                    </button>

                                    <button
                                        onClick={() => handlePublish(selectedItem)}
                                        className={`py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all border ${selectedItem.is_public
                                            ? 'bg-green-500 text-white border-green-500'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-transparent'}`}
                                    >
                                        <Globe size={18} />
                                        {selectedItem.is_public ? 'Опубликовано' : 'В идеи'}
                                    </button>

                                    <a
                                        href={selectedItem.image_url}
                                        download={`generation_${selectedItem.id}.png`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
                                    >
                                        <Download size={18} />
                                        Скачать
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default HistoryView;
