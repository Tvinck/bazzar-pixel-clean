import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, MoreHorizontal, ChevronDown,
    Image as ImageIcon, Video, Music, Wand2,
    Banana, Wind, Cloud, PenTool, Layers
} from 'lucide-react';

const CreateMenu = ({ isOpen, onClose, onSelectTool, balance = 10 }) => {
    if (!isOpen) return null;

    const tools = [
        { id: 'image', label: 'Картинка', icon: ImageIcon, color: 'text-indigo-500 dark:text-indigo-400' },
        { id: 'video', label: 'Видео', icon: Video, color: 'text-rose-500 dark:text-rose-400' },
        { id: 'banana', label: 'Nano Banana\nPro', icon: Banana, color: 'text-yellow-500 dark:text-yellow-400', special: true },
        { id: 'kling', label: 'Kling 2.6\nMotion', icon: Wind, color: 'text-emerald-500 dark:text-emerald-400' },
        { id: 'audio', label: 'Аудио', icon: Music, color: 'text-blue-500 dark:text-blue-400' },
        { id: 'animate', label: 'Оживить фото', icon: Wand2, color: 'text-purple-500 dark:text-purple-400' },
        { id: 'veo', label: 'Veo 3', icon: Layers, color: 'text-orange-500 dark:text-orange-400' },
        { id: 'sora', label: 'Sora 2', icon: Cloud, color: 'text-sky-500 dark:text-sky-400' },
        { id: 'tools', label: 'Инструменты', icon: PenTool, color: 'text-slate-500 dark:text-slate-400' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[100] bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-white overflow-y-auto pb-safe transition-colors duration-300"
        >
            <div className="max-w-md mx-auto min-h-screen flex flex-col relative">

                {/* Top Navigation Bar */}
                <div className="flex items-center justify-between px-4 py-4 pt-safe-top">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        <ChevronLeft size={24} />
                        <span className="text-base font-medium">Назад</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <button className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-white/60 hover:bg-slate-300 dark:hover:text-white transition-colors">
                            <ChevronDown size={20} />
                        </button>
                        <button className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-white/60 hover:bg-slate-300 dark:hover:text-white transition-colors">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>
                </div>

                {/* Brand Header */}
                <div className="px-5 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-tr from-amber-300 to-amber-500 rounded-lg flex items-center justify-center transform -rotate-6 shadow-amber-500/20 shadow-lg">
                            <span className="font-black text-black text-lg">B</span>
                        </div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter transition-colors">
                            bazzar
                        </div>
                    </div>
                    {/* Pill */}
                    <div className="flex items-center bg-slate-200 dark:bg-[#1A1B23] border border-slate-300 dark:border-white/10 rounded-full h-9 pl-4 pr-1 transition-colors">
                        <div className="text-[10px] font-bold text-slate-500 dark:text-white/40 tracking-wider uppercase mr-3">
                            КУПИТЬ
                        </div>
                        <div className="w-[1px] h-3 bg-slate-400 dark:bg-white/10 mr-3" />
                        <div className="flex items-center gap-2">
                            <span className="text-[15px] font-bold text-slate-900 dark:text-white tabular-nums transition-colors">{balance}</span>
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-sm ring-1 ring-white/50 dark:ring-white/5">
                                <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Promo Banner */}
                <div className="px-5 mb-8">
                    <div className="relative w-full aspect-[2/1] rounded-[2rem] overflow-hidden bg-gradient-to-br from-amber-700/40 to-yellow-900/20 shadow-xl dark:shadow-2xl border border-white/5 group">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                        <div className="relative h-full flex flex-col justify-center p-6 max-w-[70%]">
                            <h3 className="text-2xl font-bold leading-tight mb-2 text-white">
                                Попробуйте профессиональные бананы!
                            </h3>
                            <div className="inline-block bg-white text-black text-xs font-black px-2 py-0.5 rounded-md transform -rotate-3 self-start shadow-lg">
                                pro
                            </div>
                        </div>
                        <Banana className="absolute -right-4 -bottom-4 w-40 h-40 text-yellow-400 rotate-[-15deg] opacity-20 drop-shadow-[0_0_30px_rgba(250,204,21,0.3)]" />
                    </div>
                </div>

                {/* Create Section Title */}
                <div className="px-5 mb-4">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Создать</h2>
                </div>

                {/* Tools Carousel (Horizontal Scroll) */}
                <div className="w-full mb-8">
                    <div className="flex overflow-x-auto px-5 gap-4 pb-4 no-scrollbar snap-x snap-mandatory">
                        {tools.map((tool) => (
                            <button
                                key={tool.id}
                                onClick={() => onSelectTool(tool.id)}
                                className="flex flex-col items-center gap-3 min-w-[80px] snap-start group"
                            >
                                {/* Icon Container */}
                                <div className="w-[80px] h-[80px] rounded-[1.8rem] bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-white/5 flex items-center justify-center shadow-lg shadow-slate-200/50 dark:shadow-black/20 group-hover:scale-105 group-hover:bg-slate-50 dark:group-hover:bg-[#252528] group-hover:border-slate-300 dark:group-hover:border-white/20 transition-all duration-300 relative overflow-hidden">
                                    {/* Inner Glow */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <tool.icon
                                        size={32}
                                        strokeWidth={2}
                                        className={`${tool.color} opacity-90 group-hover:opacity-100 drop-shadow-sm transition-all`}
                                    />
                                </div>
                                {/* Label */}
                                <span className="text-[11px] font-medium text-slate-600 dark:text-white/60 text-center leading-tight whitespace-pre-line group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                    {tool.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </motion.div>
    );
};

export default CreateMenu;
