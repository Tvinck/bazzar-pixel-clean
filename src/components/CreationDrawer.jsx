import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronDown, Image as ImageIcon, Sparkles, Trash2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSound } from '../context/SoundContext';
import { useToast } from '../context/ToastContext';
import { useUser } from '../context/UserContext';

const CreationDrawer = ({ isOpen, onClose, type = 'Картинка', initialPrompt = '' }) => {
    const { t } = useLanguage();
    const { playClick } = useSound();
    const [prompt, setPrompt] = useState(initialPrompt);
    // Sync prompt if initialPrompt changes
    useEffect(() => {
        if (initialPrompt) setPrompt(initialPrompt);
    }, [initialPrompt]);

    // Simple placeholder logic for inputs
    const [model, setModel] = useState('NanoBanana');
    const [aspectRatio, setAspectRatio] = useState('auto');

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: '100%' }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: '100%' }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="fixed inset-0 z-[70] flex flex-col bg-[#09090b] text-white"
                >
                    {/* Header */}
                    <div className="px-4 py-4 pt-[calc(env(safe-area-inset-top)+10px)] flex items-center justify-between bg-[#09090b]">
                        <button onClick={onClose} className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors">
                            <ChevronLeft size={20} /> <span className="text-sm font-medium">Назад</span>
                        </button>

                        {/* Centered Title with Dropdown Arrow */}
                        <div className="flex items-center gap-2 font-bold text-sm">
                            <ImageIcon size={16} className="text-slate-400" />
                            {type === 'Image Gen' ? 'Картинка' : type}
                            <ChevronDown size={14} className="text-slate-500" />
                        </div>

                        <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Content Scrollable Area */}
                    <div className="flex-1 overflow-y-auto px-5 pb-32">

                        {/* 1. Model Selector */}
                        <div className="mb-6 mt-2">
                            <label className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-wide">Модель</label>
                            <div className="bg-[#1c1c1e] rounded-2xl p-4 flex items-center justify-between border border-white/5 active:bg-[#252528] transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">G</div>
                                    <span className="font-medium text-sm text-white">NanoBanana</span>
                                </div>
                                <ChevronDown size={16} className="text-slate-500" />
                            </div>
                        </div>

                        {/* 2. Images (Reference/Upload) */}
                        <div className="mb-6">
                            <label className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-wide">Изображения</label>
                            <div className="flex gap-3 overflow-x-auto no-scrollbar">
                                {/* If we had an initial image (remix scenario), visually show it here if logic allowed. For now keeping UI static like shared image showing 1 image + upload */}
                                {/* Mock Existing Image */}
                                <div className="w-24 h-32 flex-shrink-0 rounded-2xl bg-slate-800 relative overflow-hidden border border-white/10 group">
                                    <img src="https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=200" className="w-full h-full object-cover opacity-80" alt="ref" />
                                    <button className="absolute top-1 right-1 bg-red-500/80 p-1 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 size={12} />
                                    </button>
                                </div>

                                {/* Upload Placeholder */}
                                <div className="w-28 h-32 flex-shrink-0 rounded-2xl bg-[#1c1c1e] border border-white/5 border-dashed flex flex-col items-center justify-center text-center p-3 cursor-pointer hover:bg-[#252528] transition-colors">
                                    <ImageIcon size={20} className="text-slate-500 mb-2" />
                                    <span className="text-[10px] text-slate-500 leading-tight font-medium">Загрузите одно<br />или несколько<br />изображений<br />для редактирования.</span>
                                </div>
                            </div>
                        </div>

                        {/* 3. Prompt Input */}
                        <div className="mb-6">
                            <label className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-wide">Запрос <span className="text-amber-500">*</span></label>
                            <div className="relative">
                                <textarea
                                    className="w-full h-36 bg-[#1c1c1e] rounded-2xl border border-white/5 p-4 text-sm leading-relaxed focus:outline-none focus:border-amber-500/50 transition-colors placeholder:text-slate-600 text-white resize-none"
                                    placeholder="Опишите, что вы хотите увидеть..."
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                />
                                <button className="absolute bottom-3 right-3 text-slate-500 hover:text-white transition-colors">
                                    <Sparkles size={16} />
                                </button>
                            </div>
                        </div>

                        {/* 4. Aspect Ratio */}
                        <div className="mb-8">
                            <label className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-wide">Соотношение сторон</label>
                            <div className="bg-[#1c1c1e] rounded-2xl p-4 flex items-center justify-between border border-white/5 cursor-pointer hover:bg-[#252528] transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="font-medium text-sm text-white">Автоматически</span>
                                    <div className="w-5 h-5 rounded border border-amber-500/30 text-amber-500 text-[10px] font-bold flex items-center justify-center">?</div>
                                </div>
                                <ChevronDown size={16} className="text-slate-500" />
                            </div>
                        </div>
                    </div>

                    {/* Footer / Generate Button */}
                    <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe-bottom bg-[#09090b] border-t border-white/5 z-20">
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => { playClick(); /* Handle Generate */ }}
                            className="w-full h-14 bg-gradient-to-r from-amber-300 to-amber-500 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 text-[#321805] font-bold text-base"
                        >
                            <Sparkles size={20} className="text-[#321805]" strokeWidth={2.5} />
                            Сгенерировать - 5
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CreationDrawer;
