import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, Heart, Plus } from 'lucide-react';

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

const ZapMiniIcon = ({ size = 10 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
    </svg>
);

const ActionButton = ({ onClick, icon, label, className = '', spanClass = 'col-span-2', delay = 0, children }) => (
    <motion.button
        onClick={onClick}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, type: 'spring', stiffness: 300, damping: 25 }}
        whileTap={{ scale: 0.96 }}
        className={`${spanClass} py-3 rounded-card font-semibold text-[15px] flex items-center justify-center gap-2.5 transition-colors ${className}`}
    >
        {icon}
        <span>{label}</span>
        {children}
    </motion.button>
);

const HistoryModal = ({
    selectedItem,
    setSelectedItem,
    handleRepeat,
    handlePublish,
    handleDownload,
    handleDelete,
    navigate,
    setShowCollectionModal,
    showCollectionModal,
    collections,
    handleSaveToCollection,
    newCollectionName,
    setNewCollectionName
}) => {
    if (typeof document === 'undefined') return null;

    return createPortal(
        <>
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
                            className="relative bg-bg-secondary w-full max-w-md rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl shadow-black/50 border-t border-white/10 max-h-[92vh] flex flex-col"
                        >
                            {/* Drag Handle */}
                            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-white/25 rounded-full z-50" />

                            {/* Media */}
                            <div className="relative w-full aspect-square bg-black overflow-hidden">
                                {selectedItem.status === 'pending' ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-bg-secondary gap-4">
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-full border-4 border-white/5 border-t-white/40 animate-spin" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-xs font-bold text-white/50 uppercase tracking-[0.3em] animate-pulse">ОБРАБОТКА</span>
                                            <span className="text-white/20 text-[10px]">Это займет около минуты...</span>
                                        </div>
                                    </div>
                                ) : selectedItem.type === 'video' ? (
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
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#3390ec] bg-accent-blue/10 px-2.5 py-0.5 rounded-lg">
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
                                        className="bg-accent-blue text-white shadow-lg shadow-[#007aff]/20"
                                        delay={0.1}
                                    />

                                    <ActionButton
                                        onClick={() => handlePublish(selectedItem)}
                                        icon={<GlobeAnimIcon size={18} isActive={selectedItem.is_public} />}
                                        label={selectedItem.is_public ? 'Опубликовано' : 'Приватно'}
                                        className={selectedItem.is_public
                                            ? 'bg-accent-blue/15 text-accent-blue border border-[#34c759]/20'
                                            : 'bg-bg-elevated text-white border border-white/5'}
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
                                        className="bg-bg-elevated text-white border border-white/5"
                                        spanClass="col-span-1"
                                        delay={0.2}
                                    />

                                    <ActionButton
                                        onClick={() => handleDownload(selectedItem)}
                                        icon={<DownloadAnimIcon size={18} />}
                                        label="Скачать"
                                        className="bg-bg-elevated text-white border border-white/5"
                                        delay={0.25}
                                    />

                                    <ActionButton
                                        onClick={() => setShowCollectionModal(true)}
                                        icon={<Folder size={18} />}
                                        label="В папку"
                                        className="bg-bg-elevated text-purple-400 border border-purple-500/20"
                                        delay={0.28}
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
                                        className="bg-bg-elevated text-[#ff3b30] border border-[#ff3b30]/10 mt-1"
                                        delay={0.35}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── COLLECTION PICKER MODAL ─────────────────────────────────────── */}
            <AnimatePresence>
                {showCollectionModal && selectedItem && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowCollectionModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-bg-secondary w-full max-w-sm rounded-3xl p-5 border border-white/10 shadow-2xl z-10"
                        >
                            <h3 className="text-xl font-bold mb-4">Сохранить в папку</h3>

                            <div className="space-y-2 mb-4 max-h-[40vh] overflow-y-auto no-scrollbar">
                                {Object.keys(collections).length === 0 && (
                                    <p className="text-[13px] text-gray-500 text-center py-4">Папок еще нет</p>
                                )}
                                {Object.keys(collections).map(name => {
                                    const isSaved = collections[name].includes(selectedItem.id);
                                    return (
                                        <button
                                            key={name}
                                            onClick={() => handleSaveToCollection(name, selectedItem.id)}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl border ${isSaved ? 'bg-accent-purple/20 border-purple-500/50 text-purple-300' : 'bg-bg-elevated border-white/5 text-white hover:bg-bg-elevated'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Folder size={18} />
                                                <span className="font-medium text-[15px]">{name}</span>
                                            </div>
                                            {isSaved && <Heart size={16} className="fill-current" />}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Новая папка..."
                                    value={newCollectionName}
                                    onChange={e => setNewCollectionName(e.target.value)}
                                    className="flex-1 bg-bg-elevated px-4 py-2.5 rounded-xl text-[14px] text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 border border-transparent"
                                />
                                <button
                                    disabled={!newCollectionName.trim()}
                                    onClick={() => handleSaveToCollection(newCollectionName.trim(), selectedItem.id)}
                                    className="bg-accent-purple text-white px-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default React.memo(HistoryModal);
