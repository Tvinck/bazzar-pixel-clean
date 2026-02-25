import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { EmptyHistory } from '../components/ui/EmptyStates';
import { useUser } from '../context/UserContext';
import galleryAPI from '../lib/galleryAPI';

// ─── Premium Animated SVG Icons ────────────────────────────────────────────────

const SparkleIcon = ({ size = 24, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <motion.path
            d="M12 2L14.09 8.26L20.18 8.63L15.54 12.74L16.82 19.02L12 15.77L7.18 19.02L8.46 12.74L3.82 8.63L9.91 8.26L12 2Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
            fill="currentColor"
            fillOpacity="0.15"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
        />
    </svg>
);

const RepeatFlowIcon = ({ size = 20, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <motion.path
            d="M17 1L21 5L17 9"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            initial={{ x: -4, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
        />
        <motion.path
            d="M3 11V9C3 6.79086 4.79086 5 7 5H21"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.6 }}
        />
        <motion.path
            d="M7 23L3 19L7 15"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            initial={{ x: 4, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
        />
        <motion.path
            d="M21 13V15C21 17.2091 19.2091 19 17 19H3"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
        />
    </svg>
);

const GlobeAnimIcon = ({ size = 20, isActive, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <motion.circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
        <motion.ellipse cx="12" cy="12" rx="4" ry="10" stroke="currentColor" strokeWidth="1.5"
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
        />
        <motion.line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5"
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
            transition={{ duration: 0.4, delay: 0.25 }}
        />
        {isActive && (
            <motion.circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"
                fill="currentColor" fillOpacity="0.1"
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400 }}
            />
        )}
    </svg>
);

const ShareIcon = ({ size = 20, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <motion.circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
        />
        <motion.circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
        />
        <motion.circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.5"
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.3 }}
        />
        <motion.line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" strokeWidth="1.5"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.3 }}
        />
        <motion.line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="currentColor" strokeWidth="1.5"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.2 }}
        />
    </svg>
);

const DownloadAnimIcon = ({ size = 20, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <motion.path d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            initial={{ y: 4, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
        />
        <motion.path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
        />
        <motion.line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
            transition={{ duration: 0.3 }}
            style={{ transformOrigin: 'bottom' }}
        />
    </svg>
);

const TrashAnimIcon = ({ size = 20, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <motion.path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.3 }}
        />
        <motion.path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            initial={{ y: 2, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
        />
        <motion.path d="M19 6L18.1 20.14C18.0513 20.8139 17.7655 21.448 17.2955 21.9222C16.8255 22.3965 16.2044 22.6791 15.55 22.72H8.45C7.79565 22.6791 7.17448 22.3965 6.7045 21.9222C6.23451 21.448 5.94868 20.8139 5.9 20.14L5 6"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            style={{ transformOrigin: 'top' }}
        />
    </svg>
);

const UpscaleIcon = ({ size = 18, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <motion.rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5"
            initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
        <motion.path d="M15 3V9H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        />
        <motion.path d="M21 3L15 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
        />
        <motion.path d="M9 21V15H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
        />
        <motion.path d="M3 21L9 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.45 }}
        />
    </svg>
);

const VideoPlayBadge = () => (
    <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.2 }}
        className="absolute top-2.5 right-2.5 z-20 w-7 h-7 bg-black/60 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/10"
    >
        <svg width="10" height="12" viewBox="0 0 10 12" fill="white">
            <motion.path
                d="M1 1.5V10.5C1 10.87 1.41 11.09 1.72 10.88L9.23 6.38C9.52 6.2 9.52 5.8 9.23 5.62L1.72 1.12C1.41 0.91 1 1.13 1 1.5Z"
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
            />
        </svg>
    </motion.div>
);

const ZapMiniIcon = ({ size = 10 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
    </svg>
);

// ─── Animated Loading Skeleton ─────────────────────────────────────────────────

const HistoryLoadingSkeleton = () => (
    <div className="pt-4 pb-32 px-4 bg-[#1c1c1e] min-h-screen text-white">
        {/* Header Skeleton */}
        <div className="mb-6 px-1">
            <div className="h-8 w-28 bg-white/5 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-16 bg-white/5 rounded-md animate-pulse" />
        </div>
        {/* Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="aspect-square rounded-[20px] bg-[#2c2c2e] overflow-hidden relative"
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
                    />
                </motion.div>
            ))}
        </div>
    </div>
);

// ─── Animated Action Button component ──────────────────────────────────────────

const ActionButton = ({ onClick, icon, label, className = '', spanClass = 'col-span-2', delay = 0, children }) => (
    <motion.button
        onClick={onClick}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, type: 'spring', stiffness: 300, damping: 25 }}
        whileTap={{ scale: 0.96 }}
        className={`${spanClass} py-3 rounded-[14px] font-semibold text-[15px] flex items-center justify-center gap-2.5 transition-colors ${className}`}
    >
        {icon}
        <span>{label}</span>
        {children}
    </motion.button>
);

// ─── Main Component ────────────────────────────────────────────────────────────

const HistoryView = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { user, isLoading: isUserLoading } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [generations, setGenerations] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        if (isUserLoading) return;
        const fetchHistory = async () => {
            if (!user?.id) { setIsLoading(false); return; }
            setIsLoading(true);
            try {
                const data = await galleryAPI.getUserCreations(user.id, true);
                setGenerations(data || []);
            } catch (error) {
                console.error("Failed to load history", error);
                setGenerations([]);
            } finally { setIsLoading(false); }
        };
        fetchHistory();
    }, [user, isUserLoading]);

    // ── Handlers ───
    const handlePublish = async (item) => {
        if (!item) return;
        const newStatus = !item.is_public;
        setGenerations(prev => prev.map(g => g.id === item.id ? { ...g, is_public: newStatus } : g));
        setSelectedItem(prev => prev ? { ...prev, is_public: newStatus } : null);
        try {
            const res = await galleryAPI.togglePublic(item.id, newStatus);
            if (!res.success) throw new Error('Failed');
        } catch {
            setGenerations(prev => prev.map(g => g.id === item.id ? { ...g, is_public: !newStatus } : g));
            setSelectedItem(prev => prev ? { ...prev, is_public: !newStatus } : null);
        }
    };

    const handleDelete = async (item) => {
        if (!confirm('Удалить этот шедевр?')) return;
        setGenerations(prev => prev.filter(g => g.id !== item.id));
        setSelectedItem(null);
        try { await galleryAPI.deleteCreation(item.id); } catch { window.location.reload(); }
    };

    const handleRepeat = (item) => {
        navigate(`/generate/${item.type === 'video' ? 'video-gen' : 'image-gen'}`, {
            state: { prompt: item.prompt, model: item.model_id }
        });
    };

    const handleDownload = async (item) => {
        const url = item.image_url;
        const filename = `pixel-gen-${item.id.slice(0, 8)}.${item.type === 'video' ? 'mp4' : 'png'}`;
        if (window.Telegram?.WebApp?.downloadFile) {
            try { window.Telegram.WebApp.downloadFile({ url, file_name: filename }); return; } catch { }
        }
        try {
            const res = await fetch(url, { mode: 'cors' });
            const blob = await res.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl; a.download = filename; a.click();
            window.URL.revokeObjectURL(blobUrl);
        } catch { window.open(url, '_blank'); }
    };

    // ── Loading ───
    if (isLoading) return <HistoryLoadingSkeleton />;

    // ── Empty ───
    if (!generations || generations.length === 0) {
        return (
            <div className="min-h-screen bg-[#1c1c1e] text-white md:max-w-5xl md:mx-auto">
                <EmptyHistory onCreateClick={() => navigate('/create')} />
            </div>
        );
    }

    // ── Grid View ──────────────────────────────────────────────────────────────
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-4 pb-32 px-4 bg-[#1c1c1e] min-h-screen text-white font-sans"
        >
            {/* Animated Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="mb-6 px-1 flex items-end justify-between"
            >
                <div>
                    <div className="flex items-center gap-2">
                        <motion.h1
                            className="text-[28px] font-bold leading-tight"
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            История
                        </motion.h1>
                        <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.3 }}
                        >
                            <SparkleIcon size={22} className="text-[#007aff]" />
                        </motion.div>
                    </div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.25 }}
                        className="text-[13px] text-gray-400 font-medium"
                    >
                        {generations.length} {generations.length === 1 ? 'работа' : generations.length < 5 ? 'работы' : 'работ'}
                    </motion.p>
                </div>
            </motion.div>

            {/* Grid with stagger */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {generations.map((gen, index) => (
                    <motion.div
                        key={gen.id}
                        layoutId={`card-${gen.id}`}
                        initial={{ opacity: 0, scale: 0.85, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{
                            delay: Math.min(index * 0.06, 0.6),
                            type: 'spring',
                            stiffness: 260,
                            damping: 22
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedItem(gen)}
                        className="relative aspect-square rounded-[20px] overflow-hidden bg-[#2c2c2e] border border-white/[0.06] group cursor-pointer shadow-lg shadow-black/20"
                    >
                        {/* Video Badge */}
                        {gen.type === 'video' && <VideoPlayBadge />}

                        {/* Media */}
                        {gen.type === 'video' ? (
                            <video
                                src={gen.image_url}
                                className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-all duration-500 group-hover:scale-[1.05]"
                                muted loop playsInline
                                onMouseOver={e => e.target.play()}
                                onMouseOut={e => e.target.pause()}
                            />
                        ) : (
                            <img
                                src={gen.image_url}
                                loading="lazy"
                                className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-all duration-500 group-hover:scale-[1.05]"
                            />
                        )}

                        {/* Bottom gradient with prompt preview */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

                        {/* Public indicator glow dot */}
                        {gen.is_public && (
                            <motion.div
                                className="absolute top-2.5 left-2.5 z-20 w-2.5 h-2.5 rounded-full bg-[#34c759]"
                                animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        )}

                        {/* Prompt Preview */}
                        <div className="absolute bottom-3 left-3 right-3 z-10">
                            <p className="text-[10px] text-white/80 line-clamp-2 font-medium leading-snug drop-shadow-lg">
                                {gen.prompt}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ── DETAILED MODAL ─────────────────────────────────────────────────── */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {selectedItem && (
                        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center font-sans">
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedItem(null)}
                                className="absolute inset-0 bg-black/85 backdrop-blur-xl"
                            />

                            {/* Content */}
                            <motion.div
                                layoutId={`card-${selectedItem.id}`}
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                                className="relative bg-[#1c1c1e] w-full max-w-md rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl shadow-black/50 border-t border-white/10 max-h-[92vh] flex flex-col"
                            >
                                {/* Drag Handle */}
                                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-white/25 rounded-full z-50" />

                                {/* Media */}
                                <div className="relative w-full aspect-square bg-black overflow-hidden">
                                    {selectedItem.type === 'video' ? (
                                        <motion.video
                                            initial={{ scale: 1.05, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ duration: 0.4 }}
                                            src={selectedItem.image_url}
                                            className="w-full h-full object-contain"
                                            controls loop autoPlay playsInline
                                        />
                                    ) : (
                                        <motion.img
                                            initial={{ scale: 1.05, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ duration: 0.4 }}
                                            src={selectedItem.image_url}
                                            className="w-full h-full object-contain"
                                        />
                                    )}

                                    {/* Close Button */}
                                    <motion.button
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
                                        onClick={() => setSelectedItem(null)}
                                        className="absolute top-4 right-4 w-9 h-9 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-xl z-20 border border-white/10 active:scale-90 transition-transform"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                            <motion.path d="M1 1L13 13M13 1L1 13" stroke="white" strokeWidth="2" strokeLinecap="round"
                                                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                                                transition={{ duration: 0.3, delay: 0.3 }}
                                            />
                                        </svg>
                                    </motion.button>
                                </div>

                                {/* Controls */}
                                <div className="p-5 overflow-y-auto">
                                    {/* Meta Info */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 }}
                                        className="flex items-start justify-between gap-4 mb-4"
                                    >
                                        <div>
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#3390ec] bg-[#3390ec]/10 px-2.5 py-0.5 rounded-lg">
                                                    {selectedItem.model_id || 'AI Model'}
                                                </span>
                                                <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                                        <line x1="16" y1="2" x2="16" y2="6" />
                                                        <line x1="8" y1="2" x2="8" y2="6" />
                                                        <line x1="3" y1="10" x2="21" y2="10" />
                                                    </svg>
                                                    {new Date(selectedItem.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-[13px] text-gray-300 leading-relaxed font-light">
                                                {selectedItem.prompt}
                                            </p>
                                        </div>
                                    </motion.div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mt-4">
                                        <ActionButton
                                            onClick={() => handleRepeat(selectedItem)}
                                            icon={<RepeatFlowIcon size={18} />}
                                            label="Создать похожее"
                                            className="bg-[#007aff] text-white shadow-lg shadow-[#007aff]/20"
                                            delay={0.1}
                                        />

                                        <ActionButton
                                            onClick={() => handlePublish(selectedItem)}
                                            icon={<GlobeAnimIcon size={18} isActive={selectedItem.is_public} />}
                                            label={selectedItem.is_public ? 'Опубликовано' : 'Приватно'}
                                            className={selectedItem.is_public
                                                ? 'bg-[#34c759]/15 text-[#34c759] border border-[#34c759]/20'
                                                : 'bg-[#2c2c2e] text-white border border-white/5'}
                                            spanClass="col-span-1"
                                            delay={0.15}
                                        />

                                        <ActionButton
                                            onClick={() => {
                                                const appUrl = `https://t.me/bazzar_pixel_bot/app?startapp=c_${selectedItem.id}`;
                                                const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent('Посмотри, что я создал в Bazzar Pixel! ✨')}`;
                                                window.Telegram?.WebApp?.openTelegramLink
                                                    ? window.Telegram.WebApp.openTelegramLink(shareUrl)
                                                    : window.open(shareUrl, '_blank');
                                            }}
                                            icon={<ShareIcon size={18} />}
                                            label="Поделиться"
                                            className="bg-[#2c2c2e] text-white border border-white/5"
                                            spanClass="col-span-1"
                                            delay={0.2}
                                        />

                                        <ActionButton
                                            onClick={() => handleDownload(selectedItem)}
                                            icon={<DownloadAnimIcon size={18} />}
                                            label="Скачать"
                                            className="bg-[#2c2c2e] text-white border border-white/5"
                                            delay={0.25}
                                        />

                                        {/* Upscale HD */}
                                        {selectedItem.type !== 'video' && (
                                            <ActionButton
                                                onClick={() => { setSelectedItem(null); navigate(`/upscale/${selectedItem.id}`); }}
                                                icon={<UpscaleIcon size={18} />}
                                                label="Upscale HD"
                                                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20"
                                                delay={0.3}
                                            >
                                                <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[11px] font-bold ml-1">
                                                    <ZapMiniIcon size={10} /> 10
                                                </span>
                                            </ActionButton>
                                        )}

                                        <ActionButton
                                            onClick={() => handleDelete(selectedItem)}
                                            icon={<TrashAnimIcon size={18} className="text-[#ff3b30]" />}
                                            label="Удалить"
                                            className="bg-[#2c2c2e] text-[#ff3b30] border border-[#ff3b30]/10 mt-1"
                                            delay={0.35}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </motion.div>
    );
};

export default HistoryView;
