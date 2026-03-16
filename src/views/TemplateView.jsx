import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Upload, Zap, Image as ImageIcon, Sparkles, X, ChevronRight, Settings2, Film, LayoutGrid, Edit3 } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { useSound } from '../context/SoundContext';
import { aiService } from '../ai-client';
import galleryAPI from '../lib/galleryAPI';
import templatesData from '../data/templates';
import InsufficientCreditsModal from '../components/InsufficientCreditsModal';

// Import Dynamic Models & Pricing
import { MODEL_FAMILIES, calculateModelCost, KIE_MODELS_FLAT } from '../kie-models';

import { getCDNUrl } from '../hooks/useCDN';
// Typewriter Component
const TypewriterText = ({ text, speed = 10, startDelay = 500 }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        setDisplayedText('');
        let currentIndex = 0;

        const timeout = setTimeout(() => {
            const interval = setInterval(() => {
                if (currentIndex < text.length) {
                    setDisplayedText(prev => prev + text[currentIndex]);
                    currentIndex++;
                } else {
                    clearInterval(interval);
                }
            }, speed);

            return () => clearInterval(interval);
        }, startDelay);

        return () => clearTimeout(timeout);
    }, [text, speed, startDelay]);

    return <span>{displayedText}</span>;
};

const TemplateView = ({ onOpenPayment }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, stats, updateStats, startGlobalGen, closeGlobalGen, setGlobalGenResult } = useUser();
    const toaster = useToast();
    const { playClick, playSuccess } = useSound();

    const [template, setTemplate] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // File State
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    // UI State
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [selectedModel, setSelectedModel] = useState(null);
    const [aspectRatio, setAspectRatio] = useState('9:16');
    const [activeTab, setActiveTab] = useState('templates');
    const [customPrompt, setCustomPrompt] = useState('');

    // Load Template
    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            let found = await galleryAPI.getTemplate(id);
            if (!found && location.state?.template) found = location.state.template;
            if (!found) found = templatesData.find(t => t.id === id);

            if (found) {
                // Normalize
                const norm = {
                    ...found,
                    requiredFilesCount: found.requiredFilesCount || 1,
                    mediaType: found.mediaType || 'image',
                    model_id: found.model_id || 'nano_banana'
                };
                setTemplate(norm);

                const initialsFiles = new Array(norm.requiredFilesCount).fill(null);
                const initialsUrls = new Array(norm.requiredFilesCount).fill(null);

                if (location.state?.initialFile) {
                    initialsFiles[0] = location.state.initialFile;
                    initialsUrls[0] = URL.createObjectURL(location.state.initialFile);
                }

                setSelectedFiles(initialsFiles);
                setPreviewUrls(initialsUrls);

                setSelectedModel(norm.model_id);
                // Default Aspect Ratio
                if (norm.configuration?.aspect_ratio) setAspectRatio(norm.configuration.aspect_ratio);
                setCustomPrompt(norm.generation_prompt || norm.prompt || norm.description || '');
            }
            setIsLoading(false);
        };
        load();
        return () => previewUrls.forEach(url => url && URL.revokeObjectURL(url));
    }, [id, location.state?.initialFile, location.state?.template, previewUrls]);

    const similarTemplates = useMemo(() => {
        if (!template) return [];
        let similar = templatesData.filter(t => t.category === template.category && t.id !== template.id);

        // Fallback if not enough similar templates in the exact category
        if (similar.length < 5) {
            const others = templatesData.filter(t => t.id !== template.id && t.category !== template.category);
            similar = [...similar, ...others];
        }

        return similar.slice(0, 15);
    }, [template]);

    // Compatible Models Computation
    const compatibleModels = useMemo(() => {
        if (!template) return [];
        const isVideo = template.mediaType === 'video' || template.category === 'video' || template.category === 'dances';

        if (isVideo) {
            return MODEL_FAMILIES.video.models.map(m => ({
                id: m.id,
                name: m.name,
                label: m.description, // 'Video Generation' -> m.description
                cost: m.base_cost,
                icon: <Film size={18} />
            }));
        } else {
            // Photo Models: Auto-detect from families
            const photoFamilies = ['google', 'flux', 'seedream', 'ideogram', 'z_image'];
            let models = [];
            photoFamilies.forEach(famId => {
                if (MODEL_FAMILIES[famId]) {
                    models = [...models, ...MODEL_FAMILIES[famId].models];
                }
            });

            // Filter valid text-to-image or image-to-image models
            return models
                .filter(m => m.capabilities.includes('text-to-image') || m.capabilities.includes('image-to-image'))
                .map(m => ({
                    id: m.id,
                    name: m.name,
                    label: m.description,
                    cost: m.base_cost,
                    icon: m.id.includes('flux') ? <Sparkles size={18} /> : <Zap size={18} />
                }));
        }
    }, [template]);

    // Current Cost Calculation
    const currentCost = useMemo(() => {
        if (!selectedModel) return 0;
        // Use the centralized calculator for accurate dynamic pricing
        return calculateModelCost(selectedModel, {
            resolution: '1K', // Default context, could be dynamic
            quality: '720p',
            duration: '5s'
        });
    }, [selectedModel]);


    const handleFileChange = (e, index) => {
        const file = e.target.files[0];
        if (file) {
            playClick();
            const newFiles = [...selectedFiles];
            newFiles[index] = file;
            setSelectedFiles(newFiles);

            const newUrls = [...previewUrls];
            if (newUrls[index]) URL.revokeObjectURL(newUrls[index]);
            newUrls[index] = URL.createObjectURL(file);
            setPreviewUrls(newUrls);
        }
    };

    const handleGenerate = async () => {
        const currentModelId = selectedModel || template.model_id;
        const validFiles = selectedFiles.filter(Boolean).length;

        if ((stats?.current_balance || 0) < currentCost) {
            setShowCreditModal(true);
            return;
        }

        if (validFiles < (template.requiredFilesCount || 1)) {
            toaster.error('Пожалуйста, загрузите фото');
            return;
        }

        playClick();
        playSuccess();
        setIsProcessing(true);
        const isVideo = template.category === 'video' || currentModelId.includes('video') || currentModelId.includes('kling');
        const estTime = isVideo ? 120 : 15;
        startGlobalGen(isVideo ? 'video' : 'image', estTime);

        // Optimistic Deduction
        if (stats) updateStats({ current_balance: stats.current_balance - currentCost });

        try {
            // Encode files
            const validFilesList = selectedFiles.filter(Boolean);
            const sourceFilesBase64 = await Promise.all(validFilesList.map(file => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    const url = URL.createObjectURL(file);
                    img.src = url;
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        let width = img.width, height = img.height;
                        const MAX_SIZE = 1200;
                        if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } }
                        else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
                        canvas.width = Math.round(width);
                        canvas.height = Math.round(height);
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        URL.revokeObjectURL(url);
                        resolve(canvas.toDataURL('image/jpeg', 0.8).split(',')[1]);
                    };
                    img.onerror = () => { URL.revokeObjectURL(url); reject(); };
                });
            }));

            const finalPrompt = customPrompt.trim() !== '' ? customPrompt : (template.generation_prompt || template.prompt);
            const options = {
                userId: user?.id,
                source_files: sourceFilesBase64,
                template_id: template.id,
                aspect_ratio: aspectRatio,
                ...template.configuration // Merge defaults
            };
            // Force override if user selected
            options.aspect_ratio = aspectRatio;

            const result = await aiService.generateImageAsync(finalPrompt, currentModelId, options);

            if (result.success) {
                if (result.newBalance !== undefined) updateStats({ current_balance: result.newBalance });

                if (result.status === 'queued') {
                    // Async Job Started
                    closeGlobalGen();
                    toaster.success('Генерация началась 🚀', {
                        description: 'Мы пришлем результат в бот, когда всё будет готово.',
                        duration: 5000
                    });
                    playSuccess();
                } else {
                    setGlobalGenResult({
                        imageUrl: result.imageUrl,
                        id: result.id || ('gen_' + Date.now()),
                        prompt: finalPrompt
                    });
                    playSuccess();
                }
            } else {
                throw new Error(result.error || 'Ошибка');
            }

        } catch (e) {
            console.error(e);
            toaster.error('Ошибка генерации: ' + e.message);
            closeGlobalGen();
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading || !template) return <div className="min-h-screen bg-[#1c1c1e] flex items-center justify-center text-white"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>;

    const isReady = selectedFiles.filter(Boolean).length >= (template.requiredFilesCount || 1);

    return (
        <div className="min-h-screen bg-[#1c1c1e] text-white flex flex-col font-sans md:max-w-3xl md:mx-auto">
            {/* --- HEADER (No Back Button) --- */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#1c1c1e] sticky top-0 z-30 pt-[calc(env(safe-area-inset-top)+10px)]">
                <div className="w-8" />
                <h1 className="text-[17px] font-semibold text-center absolute left-1/2 -translate-x-1/2">Создать</h1>
                <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full ml-auto">
                    <Zap size={14} className="fill-white text-white" />
                    <span className="text-[13px] font-semibold">{stats?.current_balance || 0}</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-40 px-4 pt-2 space-y-6">

                {/* --- UPLOAD --- */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                    {Array.from({ length: template.requiredFilesCount }).map((_, i) => (
                        <div key={i} className="relative flex-shrink-0 w-24 h-24">
                            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, i)} className="absolute inset-0 z-20 opacity-0 cursor-pointer w-full h-full" />

                            {previewUrls[i] ? (
                                <div className="w-full h-full rounded-[16px] overflow-hidden bg-[#2c2c2e] relative border border-white/10 shadow-lg group cursor-pointer">
                                    <img src={getCDNUrl(previewUrls[i])} loading="lazy" decoding="async" alt="Preview" className="w-full h-full object-cover group-hover:opacity-60 transition-opacity duration-300" />

                                    {/* Edit Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                        <div className="bg-black/50 p-2 rounded-full backdrop-blur-sm">
                                            <Edit3 size={20} className="text-white" />
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleFileChange({ target: { files: [] } }, i); }}
                                        className="absolute top-1.5 right-1.5 bg-black/60 p-1.5 rounded-full z-30 pointer-events-auto hover:bg-black transition-colors"
                                    >
                                        <X size={12} strokeWidth={3} className="text-white" />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full h-full bg-[#3390ec]/10 rounded-[16px] flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-[#3390ec]/30 active:scale-95 transition-transform hover:bg-[#3390ec]/15">
                                    <Upload size={20} className="text-[#3390ec]" strokeWidth={2.5} />
                                    <span className="text-[#3390ec] text-[10px] font-bold uppercase tracking-widest text-center leading-none">Фото {i + 1}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* --- IDEA & TEMPLATES TABS --- */}
                <div className="bg-[#1c1c1e] rounded-[24px] border border-white/5 shadow-lg overflow-hidden flex flex-col">
                    {/* Tab Headers */}
                    <div className="flex border-b border-white/5 bg-[#2c2c2e]/30 p-1">
                        <button
                            onClick={() => { setActiveTab('templates'); playClick(); }}
                            className={`flex-1 py-3 text-[13px] font-bold flex items-center justify-center gap-2 transition-all relative rounded-[20px] ${activeTab === 'templates' ? 'bg-[#3390ec] text-white shadow-lg shadow-[#3390ec]/20' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <LayoutGrid size={16} /> Похожие
                        </button>
                        <button
                            onClick={() => { setActiveTab('edit'); playClick(); }}
                            className={`flex-1 py-3 text-[13px] font-bold flex items-center justify-center gap-2 transition-all relative rounded-[20px] ${activeTab === 'edit' ? 'bg-[#3390ec] text-white shadow-lg shadow-[#3390ec]/20' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Edit3 size={16} /> Редактировать
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-4 bg-[#2c2c2e]/10 min-h-[140px] relative">
                        <AnimatePresence mode="popLayout" initial={false}>
                            {activeTab === 'templates' ? (
                                <motion.div
                                    key="templates"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex gap-3 overflow-x-auto no-scrollbar pb-2"
                                >
                                    {similarTemplates.length > 0 ? (
                                        <>
                                            {similarTemplates.slice(0, 5).map(t => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => { playClick(); navigate(`/template/${t.id}`, { replace: true }); }}
                                                    className="flex-shrink-0 w-24 aspect-[3/4] rounded-[16px] overflow-hidden relative border border-white/10 active:scale-95 transition-transform shadow-md group"
                                                >
                                                    <img src={getCDNUrl(t.src)} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                </button>
                                            ))}
                                            {similarTemplates.length > 5 && (
                                                <button
                                                    onClick={() => { playClick(); navigate('/gallery'); }}
                                                    className="flex-shrink-0 w-24 aspect-[3/4] rounded-[16px] overflow-hidden relative border border-white/10 active:scale-95 transition-transform shadow-md bg-[#2c2c2e] flex flex-col items-center justify-center gap-2 hover:bg-[#323236]"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-[#1c1c1e] flex items-center justify-center">
                                                        <ChevronRight size={16} className="text-[#3390ec]" />
                                                    </div>
                                                    <span className="text-[11px] font-bold text-[#3390ec] text-center leading-tight">Показать<br />больше</span>
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <div className="w-full text-center text-gray-500 text-[13px] py-6 font-medium">Нет похожих шаблонов</div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="edit"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="relative h-full flex flex-col"
                                >
                                    <textarea
                                        value={customPrompt}
                                        onChange={(e) => setCustomPrompt(e.target.value)}
                                        placeholder="Опишите, что вы хотите получить..."
                                        className="w-full h-full min-h-[100px] bg-transparent text-white text-[14px] leading-relaxed resize-none outline-none placeholder:text-gray-600 font-mono"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* --- MODEL SELECTOR (Compact) --- */}
                <div>
                    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 ml-1">Модель нейросети</div>
                    <div className="bg-[#2c2c2e]/50 rounded-[20px] p-1.5 flex gap-2 overflow-x-auto no-scrollbar mb-3 border border-white/5">
                        {compatibleModels.map(model => (
                            <button
                                key={model.id}
                                onClick={() => { setSelectedModel(model.id); playClick(); }}
                                className={`px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all whitespace-nowrap flex items-center gap-2 flex-shrink-0
                                    ${selectedModel === model.id
                                        ? 'bg-[#3390ec] text-white shadow-lg shadow-[#3390ec]/20'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <span className="text-[16px]">{model.icon}</span>
                                {model.name}
                            </button>
                        ))}
                    </div>

                    {/* Selected Model Description + Cost */}
                    {compatibleModels.find(m => m.id === selectedModel) && (
                        <div className="px-1 flex justify-between items-center text-[12px] text-gray-400 bg-white/5 rounded-xl p-3 animate-in fade-in slide-in-from-top-1 border border-white/5">
                            <p className="flex-1 mr-4 leading-relaxed font-medium">
                                {compatibleModels.find(m => m.id === selectedModel).label}
                            </p>
                            <div className="flex items-center gap-1.5 bg-[#3390ec]/20 text-[#3390ec] px-3 py-1.5 rounded-full text-[11px] font-black flex-shrink-0 border border-[#3390ec]/20">
                                <Zap size={12} className="fill-current" />
                                {compatibleModels.find(m => m.id === selectedModel).cost}
                            </div>
                        </div>
                    )}
                </div>

                {/* --- SIZE SELECTOR (Hidden for Video) --- */}
                {template.mediaType !== 'video' && (
                    <div>
                        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 ml-1">Размер</div>
                        <div className="grid grid-cols-4 gap-3">
                            {['9:16', '3:4', '1:1', '16:9'].map(ratio => {
                                const isSelected = aspectRatio === ratio;
                                return (
                                    <button
                                        key={ratio}
                                        onClick={() => { setAspectRatio(ratio); playClick(); }}
                                        className={`py-3.5 rounded-xl text-[13px] font-bold transition-all border ${isSelected
                                            ? 'bg-white text-black border-white shadow-lg shadow-white/10 scale-105'
                                            : 'bg-[#2c2c2e] text-gray-400 border-transparent hover:bg-[#323236]'
                                            }`}
                                    >
                                        {ratio}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}


            </div>

            {/* --- FOOTER BUTTON --- */}
            <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-[#1c1c1e]/90 backdrop-blur-xl border-t border-white/5 z-40">
                <button
                    onClick={handleGenerate}
                    disabled={isProcessing}
                    className={`w-full py-4 rounded-[20px] flex items-center justify-center gap-2 text-[17px] font-bold transition-all shadow-xl ${isReady && !isProcessing
                        ? 'bg-[#3390ec] text-white shadow-[0_8px_30px_rgba(51,144,236,0.3)] hover:brightness-110 active:scale-[0.98]'
                        : 'bg-[#2c2c2e] text-white/30 shadow-none'
                        }`}
                >
                    {isProcessing ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Создаем...</span>
                        </>
                    ) : (
                        <>
                            <span>Сгенерировать</span>
                            <div className="flex items-center gap-1 bg-white/20 px-2.5 py-0.5 rounded-full text-[13px] font-bold">
                                <Zap size={12} className="fill-white" /> {currentCost}
                            </div>
                        </>
                    )}
                </button>
            </div>

            <InsufficientCreditsModal
                isOpen={showCreditModal}
                onClose={() => setShowCreditModal(false)}
                onTopUp={() => { navigate('/'); setTimeout(() => onOpenPayment?.(), 200); }}
            />
        </div>
    );
};

export default TemplateView;
