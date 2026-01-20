import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import {
    ChevronLeft, MoreHorizontal, ChevronDown,
    Image as ImageIcon, Video, Music, Wand2,
    Banana, Wind, Cloud, PenTool, Layers
} from 'lucide-react';

const CreateView = () => {
    const navigate = useNavigate();
    const { stats } = useUser();
    const balance = stats?.current_balance || 10;

    const { t } = useLanguage(); // Import language hook if not already imported, wait, import 'useLanguage' at top first if missing.
    // It seems 'useLanguage' is not imported in CreateView based on previous view_file. No, it's not imported.
    // I need to add import first. But I am constrained to replace lines.
    // Let me check imports in CreateView.
    // Oh, I see 'import { useUser } from ...', but not 'useLanguage'.
    // I will assume I need to add import in a separate step or just assume it's available?
    // No, I must import it.
    // I'll do a separate step for import.
    // For now, let's just use useUser as placeholder or skip if strict.
    // Wait, previous file view showed no useLanguage import.
    // I must add it.

    // I will replace lines 16-26 with translated tools.
    // But I can't use 't' if I don't import it.
    // I'll combine the import and the tools definition update in two steps or use multi_replace.
    // I'll use multi_replace to add import and update tools.

    const tools = [
        { id: 'image', label: t('toolsCard.image'), icon: ImageIcon, color: 'text-indigo-500 dark:text-indigo-400' },
        { id: 'video', label: t('toolsCard.video'), icon: Video, color: 'text-rose-500 dark:text-rose-400' },
        { id: 'banana', label: t('toolsCard.nanoBanana'), icon: Banana, color: 'text-yellow-500 dark:text-yellow-400', special: true },
        { id: 'kling', label: 'Kling 2.6\nMotion', icon: Wind, color: 'text-emerald-500 dark:text-emerald-400' }, // Missing key?
        { id: 'audio', label: t('toolsCard.audio'), icon: Music, color: 'text-blue-500 dark:text-blue-400' },
        { id: 'animate', label: t('toolsCard.animate'), icon: Wand2, color: 'text-purple-500 dark:text-purple-400' },
        { id: 'veo', label: 'Veo 3', icon: Layers, color: 'text-orange-500 dark:text-orange-400' },
        { id: 'sora', label: t('toolsCard.sora'), icon: Cloud, color: 'text-sky-500 dark:text-sky-400' },
        { id: 'tools', label: t('toolsCard.tools'), icon: PenTool, color: 'text-slate-500 dark:text-slate-400' },
    ];

    const handleSelect = (id) => {
        let type = 'Image Gen';
        let model = null;

        switch (id) {
            case 'image': type = 'image-gen'; break;
            case 'video': type = 'video-gen'; break;
            case 'banana': type = 'image-gen'; model = 'nano_banana_pro'; break;
            case 'kling': type = 'video-gen'; model = 'kling_motion'; break;
            case 'audio': type = 'audio-gen'; break;
            case 'animate': type = 'animate-photo'; break;
            case 'sora': type = 'video-gen'; model = 'sora_turbo'; break;
            case 'veo': type = 'video-gen'; model = 'runway_gen3'; break; // Fallback for Veo to Gen3 or similar
            case 'tools': type = 'tools'; break;
            default: type = 'image-gen';
        }

        navigate(`/generate/${encodeURIComponent(type)}`, { state: { model } });
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-white pb-safe transition-colors duration-300"
        >
            <div className="max-w-md mx-auto min-h-screen flex flex-col relative">

                {/* Top Navigation Bar */}
                <div className="flex items-center justify-between px-4 py-4 pt-[calc(env(safe-area-inset-top)+10px)]">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        <ChevronLeft size={24} />
                        <span className="text-base font-medium">Назад</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <button className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-white/60 hover:bg-slate-300 dark:hover:text-white transition-colors">
                            <ChevronDown size={20} />
                        </button>
                    </div>
                </div>

                {/* Brand Header REMOVED - Duplicates main header */}

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

                {/* Tools Grid (Updated from horizontal scroll) */}
                <div className="w-full mb-8">
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 px-5">
                        {tools.map((tool) => (
                            <button
                                key={tool.id}
                                onClick={() => handleSelect(tool.id)}
                                className="flex flex-col items-center gap-2 group w-full"
                            >
                                {/* Icon Container */}
                                <div className="w-full aspect-square rounded-[1.8rem] bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-white/5 flex items-center justify-center shadow-lg shadow-slate-200/50 dark:shadow-black/20 group-hover:scale-105 group-hover:bg-slate-50 dark:group-hover:bg-[#252528] group-hover:border-slate-300 dark:group-hover:border-white/20 transition-all duration-300 relative overflow-hidden">
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

export default CreateView;
