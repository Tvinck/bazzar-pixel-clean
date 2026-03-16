import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CompareModal = ({ isOpen, onClose, selectedItems }) => {
    const navigate = useNavigate();

    if (!isOpen || !selectedItems || selectedItems.length < 2) return null;

    const handleReusePrompt = (item) => {
        onClose();
        navigate(`/generate/${item.type === 'video' ? 'video-gen' : 'image-gen'}`, {
            state: { prompt: item.prompt, model: item.model_id }
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="w-full max-w-4xl max-h-[90vh] bg-bg-secondary text-white rounded-[24px] overflow-hidden flex flex-col shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
                            <h2 className="text-lg font-bold">Сравнение ({selectedItems.length})</h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Grid Content */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <div className={`grid gap-4 ${selectedItems.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
                                selectedItems.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
                                    'grid-cols-2'}`}>
                                {selectedItems.map((item, index) => (
                                    <div key={item.id} className="flex flex-col gap-3 bg-black/20 p-3 rounded-2xl border border-white/5">
                                        <div className="relative aspect-square rounded-xl overflow-hidden bg-bg-elevated">
                                            {item.type === 'video' ? (
                                                <video
                                                    src={item.video_url}
                                                    className="w-full h-full object-cover"
                                                    autoPlay
                                                    loop
                                                    muted
                                                    playsInline
                                                />
                                            ) : (
                                                <img
                                                    src={item.image_url}
                                                    alt="Generation"
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 flex items-center gap-1 rounded-md">
                                                <span className="text-xs font-medium text-white/90">#{index + 1}</span>
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold bg-accent-blue/20 text-accent-blue px-2 py-0.5 rounded uppercase">
                                                    {item.model_id || 'Unknown Model'}
                                                </span>
                                                <span className="text-[10px] text-gray-400">
                                                    {new Date(item.created_at).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <p className="text-xs text-gray-300 line-clamp-3 leading-snug">
                                                {item.prompt}
                                            </p>

                                            <button
                                                onClick={() => handleReusePrompt(item)}
                                                className="mt-2 w-full flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors"
                                            >
                                                <RefreshCw size={14} />
                                                Использовать промпт
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CompareModal;
