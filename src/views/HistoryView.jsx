import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { HistorySkeleton } from '../components/ui/Skeletons';
import { ImageCard } from '../components/ui/AnimatedCards';
import { Image, Sparkles, X, Repeat, Globe, Share2, Download, Video } from 'lucide-react';
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
                className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center"
            >
                <div className="relative mb-8 group">
                    <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-700" />
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                        className="w-28 h-28 rounded-[2.5rem] bg-[#1a1a1c] border border-white/10 flex items-center justify-center shadow-2xl relative z-10"
                    >
                        <Image size={48} className="text-white opacity-80" />
                    </motion.div>
                </div>

                <h3 className="text-3xl font-black text-white mb-3 tracking-tight">
                    {t('home.historyEmpty') || 'История пуста'}
                </h3>

                <p className="text-white/40 leading-relaxed max-w-xs mb-10 font-medium text-sm">
                    {t('home.historyInfo') || 'Здесь будут отображаться ваши генерации.'}
                </p>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="w-full max-w-xs">
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
            className="pt-4 pb-24 px-4 bg-[#0f0f10] min-h-screen"
        >
            <div className="mb-8 flex items-end justify-between px-1">
                <div>
                    <h2 className="text-3xl font-black text-white mb-1 tracking-tight">
                        {t('home.history') || 'История'}
                    </h2>
                    <p className="text-sm font-bold text-white/40 uppercase tracking-widest">
                        {generations.length} {generations.length === 1 ? 'WORK' : 'WORKS'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {generations.map((gen, index) => (
                    <motion.div
                        key={gen.id}
                        layoutId={`card-${gen.id}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedItem(gen)}
                        className="relative aspect-square rounded-[1.5rem] overflow-hidden bg-white/5 border border-white/10 group cursor-pointer shadow-lg shadow-black/20"
                    >
                        {/* Type Badge */}
                        {gen.type === 'video' && (
                            <div className="absolute top-2 right-2 z-20 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
                                <Video size={10} className="text-white" />
                            </div>
                        )}

                        {gen.type === 'video' ? (
                            <video src={gen.image_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" muted loop onMouseOver={e => e.target.play()} onMouseOut={e => e.target.pause()} />
                        ) : (
                            <img src={gen.image_url} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-110 transition-transform duration-700" />
                        )}

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            <p className="text-[10px] text-white/90 font-medium line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                {gen.prompt}
                            </p>
                            <div className="flex items-center gap-1.5 mt-2">
                                <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded-md text-white/70 backdrop-blur-sm border border-white/5 font-mono">
                                    {new Date(gen.created_at).getDate()}/{new Date(gen.created_at).getMonth() + 1}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* --- PREMIUM DETAIL MODAL --- */}
            <AnimatePresence>
                {selectedItem && (
                    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedItem(null)}
                            className="absolute inset-0 bg-[#0f0f10]/95 backdrop-blur-xl"
                        />

                        {/* Content */}
                        <motion.div
                            layoutId={`card-${selectedItem.id}`}
                            className="relative bg-[#151517] w-full max-w-sm rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl border-t sm:border border-white/10 max-h-[92vh] flex flex-col"
                        >
                            {/* Drag Handle (Mobile) */}
                            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1 bg-white/20 rounded-full z-50 sm:hidden" />

                            {/* Image Container */}
                            <div className="relative w-full aspect-square bg-black/50 overflow-hidden group">
                                {selectedItem.type === 'video' ? (
                                    <video src={selectedItem.image_url} className="w-full h-full object-contain" controls loop autoPlay />
                                ) : (
                                    <img src={selectedItem.image_url} className="w-full h-full object-cover" />
                                )}

                                {/* Close Button */}
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="absolute top-5 right-5 w-10 h-10 bg-black/40 text-white rounded-full flex items-center justify-center backdrop-blur-xl border border-white/10 hover:bg-black/60 transition-all z-20"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="p-6 overflow-y-auto">
                                <div className="mb-6">
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <h3 className="font-black text-2xl text-white leading-tight tracking-tight">
                                            Generative Art
                                        </h3>
                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 transition-colors border border-white/5">
                                                <Share2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 mb-4 shadow-inner">
                                        <p className="text-sm text-white/80 leading-relaxed font-medium">
                                            {selectedItem.prompt}
                                        </p>
                                    </div>

                                    <div className="flex gap-2 text-[10px] text-white/40 font-mono overflow-x-auto pb-2 scrollbar-none">
                                        <span className="bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg whitespace-nowrap uppercase tracking-wider">{selectedItem.model_id}</span>
                                        <span className="bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg whitespace-nowrap uppercase tracking-wider">{selectedItem.ratio || '1:1'}</span>
                                        <span className="bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg whitespace-nowrap">{new Date(selectedItem.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {/* Actions Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleRepeat(selectedItem)}
                                        className="col-span-2 py-4 bg-white text-black hover:bg-white/90 rounded-2xl font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-white/5 relative overflow-hidden group"
                                    >
                                        <div className="absolute inset-0 bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                        <Repeat size={18} />
                                        <span>Remix / Повторить</span>
                                    </button>

                                    <button
                                        onClick={() => handlePublish(selectedItem)}
                                        className={`py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 transition-all border backdrop-blur-md ${selectedItem.is_public
                                            ? 'bg-green-500/20 text-green-400 border-green-500/20'
                                            : 'bg-white/5 text-white/80 border-white/5 hover:bg-white/10'}`}
                                    >
                                        <Globe size={16} />
                                        {selectedItem.is_public ? 'Public' : 'Private'}
                                    </button>

                                    <a
                                        href={selectedItem.image_url}
                                        download={`generation_${selectedItem.id}.png`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 transition-all border border-white/5 backdrop-blur-md"
                                    >
                                        <Download size={16} />
                                        <span>Save</span>
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
