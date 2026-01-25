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
        { id: 'image', label: t('toolsCard.image'), icon: ImageIcon, color: 'text-indigo-400' },
        { id: 'video', label: t('toolsCard.video'), icon: Video, color: 'text-rose-400' },
        { id: 'banana', label: t('toolsCard.nanoBanana'), icon: Banana, color: 'text-yellow-400', special: true },
        { id: 'kling', label: 'Kling 2.6\nMotion', icon: Wind, color: 'text-emerald-400' },
        { id: 'audio', label: t('toolsCard.audio'), icon: Music, color: 'text-blue-400' },
        { id: 'animate', label: t('toolsCard.animate'), icon: Wand2, color: 'text-purple-400' },
        { id: 'veo', label: 'Veo 3', icon: Layers, color: 'text-orange-400' },
        { id: 'sora', label: t('toolsCard.sora'), icon: Cloud, color: 'text-sky-400' },
        { id: 'tools', label: t('toolsCard.tools'), icon: PenTool, color: 'text-white/40' },
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
            className="min-h-screen bg-[#0f0f10] text-white pb-safe relative overflow-hidden"
        >
            {/* Ambient Background */}
            <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-96 h-96 bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-md mx-auto min-h-screen flex flex-col relative z-10">

                {/* Top Navigation Bar */}
                <div className="flex items-center justify-between px-4 py-4 pt-[calc(env(safe-area-inset-top)+10px)] backdrop-blur-sm sticky top-0 z-50">
                    <div />

                    <div className="flex items-center gap-3">
                        <div className="bg-white/5 px-3 py-1.5 rounded-full border border-white/5 flex items-center gap-2">
                            <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Balance</span>
                            <span className="text-sm font-black text-white">{balance}</span>
                        </div>
                    </div>
                </div>

                {/* Promo Banner */}
                <div className="px-5 mb-8 mt-2">
                    <div className="relative w-full aspect-[2/1] rounded-[2rem] overflow-hidden bg-gradient-to-br from-amber-600 via-orange-600 to-yellow-600 shadow-2xl border border-white/10 group shadow-orange-500/20">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                        <div className="relative h-full flex flex-col justify-center p-6 max-w-[75%]">
                            <h3 className="text-2xl font-black leading-none mb-2 text-white drop-shadow-lg tracking-tight">
                                Professional<br />Bananas!
                            </h3>
                            <div className="inline-block bg-white text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest self-start shadow-xl transform group-hover:scale-105 transition-transform">
                                New Model
                            </div>
                        </div>
                        <Banana className="absolute -right-2 -bottom-4 w-36 h-36 text-yellow-300 rotate-[-15deg] opacity-80 drop-shadow-[0_0_20px_rgba(253,224,71,0.5)] group-hover:rotate-0 transition-all duration-500" />
                    </div>
                </div>

                {/* Create Section Title */}
                <div className="px-6 mb-5 flex items-center gap-3">
                    <div className="w-1 h-6 bg-indigo-500 rounded-full shadow-[0_0_10px_#6366f1]" />
                    <h2 className="text-2xl font-black text-white tracking-tight">Create New</h2>
                </div>

                {/* Tools Grid */}
                <div className="w-full mb-8 flex-1">
                    <div className="grid grid-cols-4 sm:grid-cols-4 gap-3 px-4">
                        {tools.map((tool) => (
                            <button
                                key={tool.id}
                                onClick={() => handleSelect(tool.id)}
                                className="flex flex-col items-center gap-2 group w-full"
                            >
                                {/* Icon Container */}
                                <div className="w-full aspect-square rounded-[1.5rem] bg-[#1a1a1c] border border-white/5 flex items-center justify-center shadow-lg group-hover:scale-105 group-hover:border-white/20 transition-all duration-300 relative overflow-hidden group-active:scale-95">
                                    {/* Inner Glow */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className={`absolute inset-0 bg-gradient-to-br ${tool.special ? 'from-yellow-500/20' : 'from-indigo-500/10'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />

                                    <tool.icon
                                        size={28}
                                        strokeWidth={2}
                                        className={`${tool.color} drop-shadow-lg transition-transform duration-300 group-hover:scale-110`}
                                    />
                                </div>
                                {/* Label */}
                                <span className="text-[10px] font-bold text-white/50 text-center leading-tight whitespace-pre-line group-hover:text-white transition-colors uppercase tracking-wide">
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
