import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    X, ChevronDown, Sparkles, Trash2, Check, Upload,
    Image as ImageIcon, Video, Music, Zap, Sliders, Film, Camera,
    Eraser, Recycle, PlusCircle, User, ChevronRight, Settings2, Move,
    Grid, Layers, MonitorPlay, Search, Info, Star, Cpu, Clock, Wand2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useABTest } from '../hooks/useABTest';
import { useMarketing } from '../hooks/useMarketing';
import { useSound } from '../context/SoundContext';
import { useToast } from '../context/ToastContext';
import { useUser } from '../context/UserContext';
import InsufficientCreditsModal from '../components/InsufficientCreditsModal';
import { MODEL_FAMILIES, calculateModelCost, KIE_MODELS_FLAT } from '../kie-models';
import { CreateGraphic } from '../components/ui/GuideGraphics';

// Predefined Styles (Photo)
const PRESET_STYLES = [
    { id: 'ghibli', label: 'Ghibli', prompt: 'Studio Ghibli style, anime, vibrant colors' },
    { id: 'vogue', label: 'Vogue', prompt: 'Vogue magazine style, fashion photography, high contrast' },
    { id: 'cyberpunk', label: 'Cyberpunk', prompt: 'Cyberpunk style, neon lights, futuristic' },
    { id: 'christmas', label: 'Christmas', prompt: 'Christmas theme, snow, warm lights, festive' },
    { id: '3d_render', label: '3D Render', prompt: '3D render, unreal engine 5, octane render' },
    { id: 'oil', label: 'Oil Painting', prompt: 'Oil painting style, brush strokes, texture' },
];

const PROMPT_SUGGESTIONS = [
    "A futuristic city with flying cars",
    "Portrait of a cyberpunk warrior",
    "Peaceful zen garden in spring",
    "Cute cat astronaut on the moon"
];

const GenerationView = ({ onOpenPayment }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Type Handling (paramType is mostly legacy or internal routing, UI driven by Model Families)
    // We map paramType to a default family if possible.

    const { playClick, playSuccess } = useSound();
    const { user, stats, updateStats, startBackgroundGeneration, refreshUser } = useUser();
    const { trackEvent, trackFunnel } = useMarketing(user);
    const { variant: buttonVariant } = useABTest('gen_button_gradient');
    const { t } = useLanguage();
    const toaster = useToast();

    // State
    const { type: paramType } = useParams();
    const isVideoMode = paramType === 'video-gen';

    // Filter model families by type
    const filteredFamilies = useMemo(() => {
        return Object.values(MODEL_FAMILIES).filter(family => {
            if (isVideoMode) return family.id === 'video';
            return family.id !== 'video';
        });
    }, [isVideoMode]);

    const [selectedFamilyId, setSelectedFamilyId] = useState(() => {
        if (isVideoMode) return 'video';
        return 'google';
    });
    const [selectedModelId, setSelectedModelId] = useState(() => {
        if (isVideoMode) return 'kling_2_6';
        return 'nano_banana';
    });

    const [inputs, setInputs] = useState({});
    const [genCount] = useState(1);
    const [selectedImages, setSelectedImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [customValues, setCustomValues] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [showCreditModal, setShowCreditModal] = useState(false);

    // UI State
    const [openDropdown, setOpenDropdown] = useState(null);

    // Derived Data
    const currentFamily = MODEL_FAMILIES[selectedFamilyId];
    const currentModel = KIE_MODELS_FLAT[selectedModelId];

    // Calculate Cost Dynamically
    const cost = useMemo(() => {
        return calculateModelCost(selectedModelId, {
            resolution: customValues.resolution || '1K',
            quality: customValues.quality,
            duration: customValues.duration,
            count: genCount
        });
    }, [selectedModelId, customValues, genCount]);

    // Initialization
    useEffect(() => {
        if (location.state?.model) {
            // Find family for model
            const fam = Object.values(MODEL_FAMILIES).find(f => f.models.some(m => m.id === location.state.model));
            if (fam) {
                setSelectedFamilyId(fam.id);
                setSelectedModelId(location.state.model);
            }
        }
        if (location.state?.prompt) setInputs(p => ({ ...p, prompt: location.state.prompt }));

        return () => previewUrls.forEach(u => URL.revokeObjectURL(u));
    }, [location.state]);

    // Helpers
    // Check if current model accepts image inputs
    const modelAcceptsImages = useMemo(() => {
        const caps = currentModel?.capabilities || [];
        return caps.some(c => ['image-to-image', 'edit', 'image-to-video', 'inpainting', 'remix'].includes(c));
    }, [currentModel]);

    const maxImagesForModel = useMemo(() => {
        if (!modelAcceptsImages) return 0;
        return currentModel?.max_images || 1;
    }, [currentModel, modelAcceptsImages]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length) {
            playClick();

            const newTotal = selectedImages.length + files.length;

            if (maxImagesForModel > 0 && newTotal > maxImagesForModel) {
                toaster.error(t('creation.modelMaxImages').replace('{max}', maxImagesForModel.toString()));
                return;
            }

            setSelectedImages(prev => [...prev, ...files]);
            setPreviewUrls(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
        }
    };

    const handleRemoveImage = (index) => {
        const urlToRemove = previewUrls[index];
        if (urlToRemove) URL.revokeObjectURL(urlToRemove);

        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    // Cleanup blob URLs on unmount & track view
    useEffect(() => {
        trackFunnel('generation', 'view');
        return () => {
            previewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, []);

    const handleAddPreset = (presetPrompt) => {
        const current = inputs.prompt || '';
        setInputs({ ...inputs, prompt: current ? `${current}, ${presetPrompt}` : presetPrompt });
        playClick();
        trackFunnel('generation', 'preset_apply', { preset: presetPrompt });
    };

    const handleGenerate = async () => {
        if (!inputs['prompt']?.trim() && !selectedImages.length) {
            toaster.error(t('creation.promptEmpty'));
            return;
        }

        // Minimum Cost Rule: Always at least 1 credit
        const finalCost = Math.max(1, cost);

        if ((stats?.current_balance || 0) < finalCost) {
            setShowCreditModal(true);
            return;
        }

        setIsProcessing(true);
        playSuccess();
        if (stats) updateStats({ current_balance: stats.current_balance - finalCost });

        try {
            const payload = {
                mode: 'kie-gen', // Unified mode
                type: selectedFamilyId === 'video' ? 'video' : 'image', // For history display
                estimatedTime: selectedFamilyId === 'video' ? 120 : 15,
                inputs: { ...inputs },
                model: selectedModelId,
                cost: finalCost,
                callbackData: {
                    ...customValues,
                    source_files: selectedImages,
                    count: genCount,
                    // Pass specific params derived from UI to backend
                    resolution: customValues.resolution || '1K',
                    aspect_ratio: customValues.aspect_ratio || '1:1',
                    quality: customValues.quality,
                    format: customValues.format,
                    duration: customValues.duration,
                }
            };

            await startBackgroundGeneration(payload);
            trackFunnel('generation', 'success', { type: selectedFamilyId, model: selectedModelId, cost: finalCost });
            toaster.success(t('creation.taskStarted'));
            navigate('/history');

        } catch (e) {
            console.error(e);
            refreshUser();
            toaster.error(e.message || t('creation.error'));
        } finally {
            setIsProcessing(false);
        }
    };

    // --- RENDERERS ---

    // 1. Family Selector (Horizontal Scroll)
    const renderFamilySelector = () => (
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar px-4 pb-2">
            {filteredFamilies.map(family => (
                <button
                    key={family.id}
                    onClick={() => {
                        setSelectedFamilyId(family.id);
                        setSelectedModelId(family.models[0].id);
                        playClick();
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[15px] font-semibold whitespace-nowrap transition-all
                        ${selectedFamilyId === family.id
                            ? 'bg-[#007aff] text-white'
                            : 'bg-[#1c1c1e] text-[#8e8e93] hover:bg-[#2c2c2e] hover:text-white'
                        }`}
                >
                    <span className="text-[17px]">{family.icon}</span>
                    <span>{family.name}</span>
                </button>
            ))}
        </div>
    );

    // 2. Model Variant Selector (Chips)
    const renderModelVariants = () => (
        <div className="px-4 mb-3">
            {currentFamily.models.length > 1 && (
                <div className="bg-[#1c1c1e] rounded-[10px] p-1 flex gap-1 overflow-x-auto no-scrollbar mb-3">
                    {currentFamily.models.map(model => (
                        <button
                            key={model.id}
                            onClick={() => { setSelectedModelId(model.id); playClick(); }}
                            className={`px-4 py-2 rounded-[8px] text-[13px] font-medium transition-all whitespace-nowrap flex-1
                                ${selectedModelId === model.id
                                    ? 'bg-[#636366] text-white shadow-sm'
                                    : 'text-[#8e8e93] hover:text-white'
                                }`}
                        >
                            {model.name}
                        </button>
                    ))}
                </div>
            )}
            {/* Model Description + Cost + Capabilities */}
            <motion.div
                key={selectedModelId}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-[#1c1c1e] rounded-[12px] p-3.5 border border-white/5"
            >
                <div className="flex justify-between items-start gap-3 mb-2.5">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Cpu size={14} className="text-[#007aff]" />
                            <span className="text-[14px] font-semibold text-white">{currentModel?.name}</span>
                        </div>
                        <p className="text-[12px] text-[#8e8e93] leading-tight">{currentModel?.description}</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#ffcc00]/15 text-[#ffcc00] px-3 py-1.5 rounded-full text-[12px] font-bold flex-shrink-0">
                        <Zap size={12} className="fill-current" />
                        {currentModel?.pricing_type === 'resolution' ? '~' : ''}{currentModel?.base_cost}
                    </div>
                </div>

                {/* Capabilities Badges */}
                {currentModel?.capabilities && (
                    <div className="flex flex-wrap gap-1.5">
                        {currentModel.capabilities.map(cap => (
                            <span
                                key={cap}
                                className="px-2 py-0.5 bg-[#2c2c2e] text-[10px] font-medium text-[#8e8e93] rounded-md border border-white/5"
                            >
                                {cap.replace(/-/g, ' → ').replace(/^\w/, c => c.toUpperCase())}
                            </span>
                        ))}
                        {currentModel?.resolutions && (
                            <span className="px-2 py-0.5 bg-[#007aff]/10 text-[10px] font-medium text-[#007aff] rounded-md">
                                до {currentModel.resolutions[currentModel.resolutions.length - 1]}
                            </span>
                        )}
                        {currentModel?.durations && (
                            <span className="px-2 py-0.5 bg-purple-500/10 text-[10px] font-medium text-purple-400 rounded-md">
                                {currentModel.durations.join(' / ')}
                            </span>
                        )}
                    </div>
                )}
            </motion.div>

            {maxImagesForModel > 1 && (
                <div className="mt-3">
                    <div className="inline-flex items-center gap-2 bg-[#007aff]/10 text-[#007aff] px-3 py-2 rounded-[10px] text-[13px] font-medium">
                        <Layers size={16} />
                        {t('creation.addPhoto')} {t('creation.maxPhotos').replace('{max}', maxImagesForModel.toString())}
                    </div>
                </div>
            )}
        </div>
    );

    // 3. Dynamic Controls
    const renderControls = () => {
        return (
            <div className="px-4 md:px-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {/* Aspect Ratio / Resolution */}
                {(currentModel?.pricing_type === 'resolution' || currentModel?.resolutions) ? (
                    <div className="relative">
                        <label className="text-[13px] font-semibold text-[#8e8e93] mb-1.5 block ml-1">{t('creation.resolution')}</label>
                        <button
                            onClick={() => setOpenDropdown(openDropdown === 'res' ? null : 'res')}
                            className="w-full h-11 bg-[#1c1c1e] rounded-[10px] flex items-center justify-between px-3 text-[15px] font-medium"
                        >
                            <span className="text-white">{customValues.resolution || currentModel.default_res || '1K'}</span>
                            <ChevronDown size={18} className="text-[#8e8e93]" />
                        </button>
                        <AnimatePresence>
                            {openDropdown === 'res' && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-[#2c2c2e] rounded-[10px] overflow-hidden z-20 shadow-xl"
                                >
                                    {(currentModel.resolutions || ['1K', '2K']).map(res => (
                                        <button key={res}
                                            onClick={() => {
                                                setCustomValues(p => ({ ...p, resolution: res }));
                                                setOpenDropdown(null);
                                            }}
                                            className="w-full text-left px-4 py-3 text-[15px] text-white border-b border-white/5 last:border-0 hover:bg-[#3a3a3c]"
                                        >
                                            <div className="flex justify-between items-center">
                                                <span>{res}</span>
                                                {currentModel.pricing_type === 'resolution' && (
                                                    <span className="text-[#8e8e93] text-[13px]">{res === '4K' ? '24 cr' : '18 cr'}</span>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    // Default Aspect Ratio selector for standard models
                    <div className="relative">
                        <label className="text-[13px] font-semibold text-[#8e8e93] mb-1.5 block ml-1">{t('creation.aspectRatio')}</label>
                        <button
                            onClick={() => setOpenDropdown(openDropdown === 'ar' ? null : 'ar')}
                            className="w-full h-11 bg-[#1c1c1e] rounded-[10px] flex items-center justify-between px-3 text-[15px] font-medium"
                        >
                            <span className="text-white">{customValues.aspect_ratio || '1:1'}</span>
                            <ChevronDown size={18} className="text-[#8e8e93]" />
                        </button>
                        {openDropdown === 'ar' && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-[#2c2c2e] rounded-[10px] z-20 shadow-xl overflow-hidden">
                                {['1:1', '16:9', '9:16', '4:3', '3:4'].map(r => (
                                    <button key={r} onClick={() => { setCustomValues(p => ({ ...p, aspect_ratio: r })); setOpenDropdown(null); }} className="w-full text-left px-4 py-3 text-[15px] text-white border-b border-white/5 last:border-0 hover:bg-[#3a3a3c]">
                                        {r}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Video Duration */}
                {currentFamily.id === 'video' && currentModel?.durations && (
                    <div>
                        <label className="text-[13px] font-semibold text-[#8e8e93] mb-1.5 block ml-1">{t('creation.duration')}</label>
                        <div className="flex bg-[#1c1c1e] rounded-[10px] p-1 h-11 items-center">
                            {currentModel.durations.map(dur => (
                                <button key={dur}
                                    onClick={() => setCustomValues(p => ({ ...p, duration: dur }))}
                                    className={`flex-1 h-full rounded-[8px] text-[13px] font-medium transition-all ${customValues.duration === dur ? 'bg-[#636366] text-white shadow-sm' : 'text-[#8e8e93]'}`}
                                >
                                    {dur}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col md:max-w-3xl md:mx-auto relative overflow-x-hidden selection:bg-[#3390ec]/30">
            {/* Premium Animated Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-[#3390ec]/5 to-transparent" />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                        x: [0, 50, 0],
                        y: [0, 30, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-[#3390ec]/10 blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.4, 0.2],
                        x: [0, -40, 0],
                        y: [0, -50, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute top-[20%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-purple-500/10 blur-[100px]"
                />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 sticky top-0 bg-black/80 backdrop-blur-xl z-30 pt-[calc(env(safe-area-inset-top)+10px)] border-b border-white/5 shadow-sm">
                <button onClick={() => { playClick(); navigate(-1); }} className="w-10 h-10 flex items-center justify-center -ml-2 active:opacity-60 bg-white/5 rounded-full backdrop-blur-md">
                    <ChevronDown className="rotate-90 text-[#007aff]" size={24} />
                </button>
                <h1 className="text-[18px] font-bold tracking-tight flex-1 text-center mr-6 text-white drop-shadow-sm">
                    {isVideoMode ? 'Генерация видео' : 'Генерация фото'}
                </h1>
                <div className="absolute right-4 flex items-center gap-1.5 bg-gradient-to-r from-[#2c2c2e] to-[#1c1c1e] border border-white/5 px-3 py-1.5 rounded-full shadow-inner">
                    <Zap size={14} className="fill-[#ffcc00] text-[#ffcc00]" />
                    <span className="text-[15px] font-bold">{stats?.current_balance || 0}</span>
                </div>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="flex-1 overflow-y-auto pb-44 pt-4 space-y-6 relative z-10"
            >

                {/* 1. Prompt Input */}
                <motion.div variants={itemVariants} className="px-4">
                    <div className="bg-[#1c1c1e]/80 backdrop-blur-md border border-white/5 rounded-[18px] p-4 relative shadow-lg overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#3390ec]/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <div className="w-12 h-12 rounded-[12px] bg-gradient-to-br from-blue-500 to-[#3390ec] flex items-center justify-center shadow-md">
                                <CreateGraphic />
                            </div>
                            <div>
                                <h2 className="text-[17px] font-bold text-white tracking-tight leading-tight">{t('creation.question')}</h2>
                                <p className="text-[13px] text-gray-400 mt-0.5 font-medium">{t('creation.describeIdea')}</p>
                            </div>
                        </div>

                        <textarea
                            placeholder={t('creation.placeholder')}
                            value={inputs.prompt || ''}
                            onChange={e => setInputs({ ...inputs, prompt: e.target.value })}
                            className="w-full bg-[#2c2c2e]/60 focus:bg-[#2c2c2e]/90 rounded-[12px] p-3.5 text-white text-[15px] placeholder:text-[#8e8e93] resize-none outline-none min-h-[100px] leading-relaxed transition-all relative z-10 shadow-inner border border-white/5 focus:border-[#3390ec]/50"
                        />

                        {/* Quick Presets / Suggestions */}
                        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                            {PRESET_STYLES.map(style => (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    key={style.id}
                                    onClick={() => handleAddPreset(style.prompt)}
                                    className="px-3.5 py-1.5 rounded-[10px] bg-[#2c2c2e]/80 border border-white/5 text-[13px] font-semibold text-white whitespace-nowrap active:bg-[#3a3a3c] transition-all shadow-sm focus:outline-none"
                                >
                                    {style.label}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* 2. Upload (Dynamic) */}
                {modelAcceptsImages && (
                    <motion.div variants={itemVariants} className="px-4">
                        <label className="text-[14px] font-bold text-white mb-2.5 block ml-1 tracking-tight">
                            📷 {t('creation.addPhoto')} {maxImagesForModel > 1 ? <span className="text-gray-400 font-medium text-[12px] ml-1">({t('creation.maxPhotos').replace('{max}', maxImagesForModel.toString())})</span> : ''}
                        </label>

                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                            {/* Add Button */}
                            {selectedImages.length < maxImagesForModel && (
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative flex-shrink-0">
                                    <input
                                        type="file" multiple={maxImagesForModel > 1} accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 opacity-0 z-10 w-full h-full cursor-pointer"
                                    />
                                    <div className="w-20 h-20 rounded-[14px] bg-[#3390ec]/10 border-2 border-dashed border-[#3390ec]/30 hover:bg-[#3390ec]/15 transition-colors flex flex-col items-center justify-center gap-1.5 text-[#3390ec]">
                                        <PlusCircle size={22} strokeWidth={2.5} />
                                        <span className="text-[10px] font-bold tracking-widest uppercase">{t('common.save') === 'Save' ? 'Add' : 'Добавить'}</span>
                                    </div>
                                </motion.div>
                            )}

                            {previewUrls.map((url, i) => (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    key={i}
                                    className="relative w-20 h-20 flex-shrink-0 rounded-[14px] overflow-hidden border border-white/10 shadow-md group"
                                >
                                    <img src={url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    <button
                                        onClick={() => handleRemoveImage(i)}
                                        className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-md w-6 h-6 rounded-full flex items-center justify-center text-white hover:bg-black transition-colors z-20"
                                    >
                                        <X size={12} strokeWidth={3} />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* 3. Model Selection */}
                <motion.div variants={itemVariants} className="space-y-4">
                    <div className="px-4">
                        <label className="text-[14px] font-bold text-white tracking-tight block ml-1">{t('creation.aiModel')}</label>
                    </div>
                    {renderFamilySelector()}
                    {renderModelVariants()}
                </motion.div>

                {/* 4. Advanced Controls */}
                <motion.div variants={itemVariants}>
                    <div className="px-4 mb-3">
                        <label className="text-[14px] font-bold text-white tracking-tight block ml-1">{t('creation.settings')}</label>
                    </div>
                    {renderControls()}
                </motion.div>

                {/* 5. How It Works */}
                <motion.div variants={itemVariants} className="px-4">
                    <div className="bg-[#1c1c1e]/80 backdrop-blur-md rounded-[16px] p-4.5 border border-white/5 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
                        <div className="flex items-center gap-2 mb-3.5 relative z-10">
                            <Info size={16} className="text-[#3390ec]" />
                            <h3 className="text-[14px] font-bold text-white uppercase tracking-wider">Как это работает</h3>
                        </div>
                        <div className="space-y-3 relative z-10">
                            {(isVideoMode ? [
                                { emoji: '✏️', text: 'Опишите сцену или загрузите фото' },
                                { emoji: '🎬', text: 'Выберите модель: Kling, Wan или Hailuo' },
                                { emoji: '⏱', text: 'Укажите длительность и качество' },
                                { emoji: '📥', text: 'ИИ создаст видео за 1–2 минуты' }
                            ] : [
                                { emoji: '✏️', text: 'Опишите что хотите создать' },
                                { emoji: '🎨', text: 'Выберите ИИ-модель для стиля' },
                                { emoji: '📷', text: 'Добавьте фото для редактирования (опционально)' },
                                { emoji: '⚡', text: 'Генерация за 10–30 секунд' }
                            ]).map((step, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[15px] shadow-sm">
                                        {step.emoji}
                                    </div>
                                    <span className="text-[13px] font-medium text-gray-300 leading-snug">{step.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

            </motion.div>

            {/* Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-black/80 backdrop-blur-xl border-t border-white/10 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGenerate}
                    disabled={isProcessing}
                    className={`w-full h-[54px] rounded-[16px] flex items-center justify-center gap-2 text-[17px] font-bold transition-all shadow-lg overflow-hidden relative group
                        ${!isProcessing
                            ? 'bg-gradient-to-r from-blue-600 via-[#3390ec] to-blue-500 text-white'
                            : 'bg-[#2c2c2e] text-[#8e8e93]'
                        } ${buttonVariant === 'glow' && !isProcessing ? 'shadow-[0_0_20px_rgba(51,144,236,0.4)]' : ''}`}
                >
                    {!isProcessing && <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />}

                    {isProcessing ? (
                        <div className="flex items-center gap-2">
                            <span className="w-5 h-5 border-2 border-white/20 border-t-white/100 rounded-full animate-spin" />
                            {t('creation.generating')}
                        </div>
                    ) : (
                        <>
                            <Wand2 size={20} className="drop-shadow-sm" />
                            <span className="drop-shadow-sm">{t('creation.generate')}</span>
                            <span className="bg-black/25 px-2.5 py-0.5 rounded-md text-[13px] ml-1 flex items-center gap-1 font-bold shadow-inner border border-white/10">
                                <Zap size={12} className="fill-current text-[#ffcc00]" /> {Math.max(1, cost)}
                            </span>
                        </>
                    )}
                </motion.button>
            </div>

            <InsufficientCreditsModal
                isOpen={showCreditModal}
                onClose={() => setShowCreditModal(false)}
                onTopUp={() => { navigate('/'); setTimeout(() => onOpenPayment?.(), 200); }}
            />
        </div>
    );
};

export default GenerationView;
