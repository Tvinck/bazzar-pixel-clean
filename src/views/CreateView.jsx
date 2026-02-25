import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import {
    ChevronLeft, Zap,
    Image as ImageIcon, Video, Music, Wand2,
    Banana, Wind, Layers, PenTool, Sparkles
} from 'lucide-react';

/**
 * CreateView - Modern dark-themed tool selection page
 * Updated design matching the app's dark aesthetic
 */

const CreateView = () => {
    const navigate = useNavigate();
    const { stats } = useUser();
    const balance = stats?.current_balance || 0;

    const tools = [
        {
            id: 'image',
            label: 'Изображение',
            desc: 'По описанию',
            icon: ImageIcon,
            gradient: 'from-indigo-500 to-purple-600',
            cost: 3
        },
        {
            id: 'video',
            label: 'Видео',
            desc: 'Анимация',
            icon: Video,
            gradient: 'from-rose-500 to-pink-600',
            cost: 15
        },
        {
            id: 'banana',
            label: 'Nano Banana',
            desc: 'Google Gemini',
            icon: Banana,
            gradient: 'from-yellow-400 to-orange-500',
            special: true,
            cost: 2
        },
        {
            id: 'kling',
            label: 'Kling 2.6',
            desc: 'Motion Control',
            icon: Wind,
            gradient: 'from-emerald-500 to-teal-600',
            cost: 20
        },
        {
            id: 'audio',
            label: 'Музыка',
            desc: 'AI Audio',
            icon: Music,
            gradient: 'from-blue-500 to-cyan-600',
            cost: 5
        },
        {
            id: 'animate',
            label: 'Оживить фото',
            desc: 'Анимация',
            icon: Wand2,
            gradient: 'from-purple-500 to-violet-600',
            cost: 8
        },
        {
            id: 'veo',
            label: 'Veo 3',
            desc: 'Google Video',
            icon: Layers,
            gradient: 'from-orange-500 to-red-600',
            cost: 25
        },
        {
            id: 'tools',
            label: 'Инструменты',
            desc: 'Face Swap',
            icon: PenTool,
            gradient: 'from-gray-600 to-gray-700',
            cost: 0
        },
    ];

    const handleSelect = (id) => {
        let type = 'image-gen';
        let model = null;

        switch (id) {
            case 'image': type = 'image-gen'; break;
            case 'video': type = 'video-gen'; break;
            case 'banana': type = 'image-gen'; model = 'nano_banana'; break;
            case 'kling': type = 'video-gen'; model = 'kling_motion'; break;
            case 'audio': type = 'audio-gen'; break;
            case 'animate': type = 'animate-photo'; break;
            case 'veo': type = 'video-gen'; model = 'veo_3'; break;
            case 'tools': navigate('/design-lab'); return;
            default: type = 'image-gen';
        }

        window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
        navigate(`/generate/${encodeURIComponent(type)}`, { state: { model } });
    };

    return (
        <div className="min-h-screen bg-black text-white pb-safe md:max-w-3xl md:mx-auto md:px-6">
            {/* Ambient gradients */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px] pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] pointer-events-none" />

            {/* Header */}
            <div className="sticky top-0 z-50 backdrop-blur-xl bg-black/95 border-b border-white/5">
                <div className="flex items-center justify-between px-4 py-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <h1 className="text-[17px] tracking-tight font-semibold">Создать</h1>

                    <div className="flex items-center gap-1.5 bg-[#2c2c2e] px-3 py-1.5 rounded-full">
                        <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-[15px] font-semibold">{balance}</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 py-6">
                {/* Featured Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative w-full aspect-[2/1] rounded-[20px] overflow-hidden mb-6 bg-gradient-to-br from-yellow-500 via-orange-500 to-amber-600 shadow-md"
                >
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=800')] bg-cover bg-center opacity-20 mix-blend-overlay" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

                    <div className="relative h-full flex flex-col justify-center p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-5 h-5 text-yellow-200" />
                            <span className="text-[11px] font-bold text-yellow-200 uppercase tracking-wider">NEW</span>
                        </div>
                        <h3 className="text-[22px] tracking-tight font-black text-white leading-tight mb-2">
                            Nano Banana
                        </h3>
                        <p className="text-[15px] text-white/80 max-w-[70%]">
                            Google Gemini с генерацией изображений
                        </p>
                    </div>

                    <Banana className="absolute -right-4 -bottom-4 w-32 h-32 text-yellow-200/50 rotate-[-15deg]" />
                </motion.div>

                {/* Section Title */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 bg-[#007aff] rounded-full" />
                    <h2 className="text-[17px] tracking-tight font-semibold">Инструменты</h2>
                </div>

                {/* Tools Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {tools.map((tool, idx) => (
                        <motion.button
                            key={tool.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleSelect(tool.id)}
                            className="group relative bg-[#1c1c1e] rounded-[20px] p-4 border border-transparent transition-all text-left overflow-hidden shadow-sm"
                        >
                            {/* Background gradient on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />

                            {/* Icon */}
                            <div className={`w-12 h-12 rounded-[14px] bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-3 shadow-md`}>
                                <tool.icon className="w-6 h-6 text-white" />
                            </div>

                            {/* Text */}
                            <h3 className="font-semibold text-white mb-0.5 tracking-tight">{tool.label}</h3>
                            <p className="text-[13px] text-gray-400">{tool.desc}</p>

                            {/* Cost badge */}
                            {tool.cost > 0 && !tool.special && (
                                <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/10 backdrop-blur-md px-2 py-1 rounded-full">
                                    <Zap className="w-[10px] h-[10px] text-yellow-400 fill-yellow-400" />
                                    <span className="text-[11px] font-bold">{tool.cost}</span>
                                </div>
                            )}

                            {/* Special badge */}
                            {tool.special && (
                                <div className="absolute top-3 right-3 bg-yellow-500 text-black px-2 py-1 rounded-full text-[10px] font-bold shadow-sm">
                                    ✨ HOT
                                </div>
                            )}
                        </motion.button>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="mt-6">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-5 bg-[#bf5af2] rounded-full" />
                        <h2 className="text-[17px] tracking-tight font-semibold">Быстрые действия</h2>
                    </div>

                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                        {[
                            { label: 'Face Swap', icon: '🎭', route: '/design-lab' },
                            { label: 'Шаблоны', icon: '📋', route: '/image-templates' },
                            { label: 'Галерея', icon: '🖼️', route: '/gallery' },
                        ].map((action) => (
                            <motion.button
                                key={action.label}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate(action.route)}
                                className="bg-[#1c1c1e] rounded-[16px] py-3 px-2 flex flex-col items-center gap-1.5 transition-colors shadow-sm"
                            >
                                <span className="text-xl">{action.icon}</span>
                                <span className="text-[13px] font-medium text-gray-300">{action.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateView;
