import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ChevronDown, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useABTest } from '../hooks/useABTest';
import { useMarketing } from '../hooks/useMarketing';
import { useSound } from '../context/SoundContext';
import { useToast } from '../context/ToastContext';
import { useUser } from '../context/UserContext';
import { useCloudStorage } from '../hooks/useCloudStorage';
import InsufficientCreditsModal from '../components/InsufficientCreditsModal';
import { MODEL_FAMILIES, calculateModelCost, KIE_MODELS_FLAT } from '../kie-models';
import SEO from '../components/SEO/SEO';
import { GenerationErrorBoundary } from '../components/ErrorBoundary';

// Subcomponents
import PromptInput from '../components/generation/PromptInput';
import ModelSelector from '../components/generation/ModelSelector';
import PhotoUpload from '../components/generation/PhotoUpload';
import GenerationSettings from '../components/generation/GenerationSettings';
import GenerationButton from '../components/generation/GenerationButton';

const PRESET_STYLES = [
    { id: 'ghibli', label: 'Ghibli', prompt: 'Studio Ghibli style, anime, vibrant colors' },
    { id: 'vogue', label: 'Vogue', prompt: 'Vogue magazine style, fashion photography, high contrast' },
    { id: 'cyberpunk', label: 'Cyberpunk', prompt: 'Cyberpunk style, neon lights, futuristic' },
    { id: 'christmas', label: 'Christmas', prompt: 'Christmas theme, snow, warm lights, festive' },
    { id: '3d_render', label: '3D Render', prompt: '3D render, unreal engine 5, octane render' },
    { id: 'oil', label: 'Oil Painting', prompt: 'Oil painting style, brush strokes, texture' },
];

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

const GenerationView = ({ onOpenPayment }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [isCanceling, setIsCanceling] = useState(false);
    const [cancelCountdown, setCancelCountdown] = useState(0);
    const timeoutRef = useRef(null);
    const intervalRef = useRef(null);

    const { playClick, playSuccess } = useSound();
    const { user, stats, updateStats, startBackgroundGeneration, refreshUser } = useUser();
    const { trackFunnel } = useMarketing(user);
    const { t } = useLanguage();
    const toaster = useToast();
    const { getItem, setItem } = useCloudStorage();

    const { type: paramType } = useParams();
    const isVideoMode = paramType === 'video-gen';

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
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [showRefine, setShowRefine] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isVisionAnalyzing, setIsVisionAnalyzing] = useState(false);
    const [refineInput, setRefineInput] = useState('');
    const [isRefining, setIsRefining] = useState(false);

    const [openDropdown, setOpenDropdown] = useState(null);
    const [recentPrompts, setRecentPrompts] = useState([]);
    const [showPromptHistory, setShowPromptHistory] = useState(false);

    const currentFamily = MODEL_FAMILIES[selectedFamilyId];
    const currentModel = KIE_MODELS_FLAT[selectedModelId];

    const cost = useMemo(() => {
        return calculateModelCost(selectedModelId, {
            resolution: customValues.resolution || '1K',
            quality: customValues.quality,
            duration: customValues.duration,
            count: genCount
        });
    }, [selectedModelId, customValues, genCount]);

    useEffect(() => {
        if (location.state?.model) {
            const fam = Object.values(MODEL_FAMILIES).find(f => f.models.some(m => m.id === location.state.model));
            if (fam) {
                setSelectedFamilyId(fam.id);
                setSelectedModelId(location.state.model);
            }
        }
        if (location.state?.prompt) setInputs(p => ({ ...p, prompt: location.state.prompt }));

        const loadPrompts = async () => {
            const saved = await getItem('bazzar_recent_prompts');
            if (saved) {
                try {
                    setRecentPrompts(JSON.parse(saved));
                } catch (e) { console.error(e) }
            }
        };
        loadPrompts();

        return () => previewUrls.forEach(u => URL.revokeObjectURL(u));
    }, [location.state, getItem, previewUrls]);

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

    useEffect(() => {
        trackFunnel('generation', 'view');
        return () => {
            previewUrls.forEach(url => URL.revokeObjectURL(url));
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [trackFunnel, previewUrls]);

    const handleAddPreset = (presetPrompt) => {
        const current = inputs.prompt || '';
        setInputs({ ...inputs, prompt: current ? `${current}, ${presetPrompt}` : presetPrompt });
        playClick();
        trackFunnel('generation', 'preset_apply', { preset: presetPrompt });
    };

    const handleEnhancePrompt = async () => {
        const currentPrompt = inputs.prompt?.trim();
        if (!currentPrompt) {
            toaster.error('Введите промпт для улучшения');
            return;
        }
        setIsEnhancing(true);
        try {
            const res = await fetch('/api/generation/enhance-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: currentPrompt })
            });
            const data = await res.json();
            if (data.enhanced) {
                setInputs(prev => ({ ...prev, prompt: data.enhanced }));
                toaster.success('✨ Промпт улучшен!');
                playSuccess();
            } else {
                throw new Error(data.error || 'Enhancement failed');
            }
        } catch (e) {
            console.error('Enhance error:', e);
            toaster.error('Не удалось улучшить промпт');
        } finally {
            setIsEnhancing(false);
        }
    };

    const handleVoiceInput = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toaster.error('Браузер не поддерживает голосовой ввод');
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'ru-RU';
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInputs(prev => ({ ...prev, prompt: (prev.prompt || '') + ' ' + transcript }));
            playSuccess();
        };
        recognition.onerror = () => toaster.error('Ошибка микрофона');
        recognition.onend = () => setIsListening(false);

        recognition.start();
        playClick();
    };

    const handleVisionAnalyze = async (index) => {
        const file = selectedImages[index];
        if (!file) return;
        setIsVisionAnalyzing(true);
        playClick();
        try {
            const res = await fetch('/api/generation/vision-describe', {
                method: 'POST',
                body: JSON.stringify({ image_index: index })
            });
            const data = await res.json();
            if (data.description) {
                setInputs(prev => ({ ...prev, prompt: data.description }));
                playSuccess();
                toaster.success('ИИ проанализировал изображение');
            }
        } catch (e) {
            console.error(e);
            toaster.error('Не удалось проанализировать фото');
        } finally {
            setIsVisionAnalyzing(false);
        }
    };

    const handleRefinePrompt = async () => {
        const currentPrompt = inputs.prompt?.trim();
        const refinement = refineInput.trim();
        if (!currentPrompt || !refinement) return;

        setIsRefining(true);
        try {
            const res = await fetch('/api/generation/enhance-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    prompt: currentPrompt,
                    instruction: refinement,
                    mode: 'refine'
                })
            });
            const data = await res.json();
            if (data.enhanced) {
                setInputs(prev => ({ ...prev, prompt: data.enhanced }));
                setRefineInput('');
                setShowRefine(false);
                toaster.success('✨ Промпт обновлен!');
                playSuccess();
            } else {
                throw new Error(data.error || 'Refinement failed');
            }
        } catch (e) {
            console.error('Refine error:', e);
            toaster.error('Не удалось изменить промпт');
        } finally {
            setIsRefining(false);
        }
    };

    const cancelGeneration = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsCanceling(false);
        setCancelCountdown(0);
        setIsProcessing(false);
        toaster.success('Генерация отменена');
    };

    const handleGenerate = async () => {
        if (isCanceling) {
            cancelGeneration();
            return;
        }
        if (!inputs['prompt']?.trim() && !selectedImages.length) {
            toaster.error(t('creation.promptEmpty'));
            return;
        }

        const finalCost = Math.max(1, cost);

        if ((stats?.current_balance || 0) < finalCost) {
            setShowCreditModal(true);
            return;
        }

        setIsCanceling(true);
        setIsProcessing(true);
        setCancelCountdown(3);
        playClick();

        intervalRef.current = setInterval(() => {
            setCancelCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        timeoutRef.current = setTimeout(async () => {
            setIsCanceling(false);
            playSuccess();

            try {
                const payload = {
                    mode: 'kie-gen',
                    type: selectedFamilyId === 'video' ? 'video' : 'image',
                    estimatedTime: selectedFamilyId === 'video' ? 120 : 15,
                    inputs: { ...inputs },
                    model: selectedModelId,
                    cost: finalCost,
                    callbackData: {
                        ...customValues,
                        source_files: selectedImages,
                        count: genCount,
                        resolution: customValues.resolution || '1K',
                        aspect_ratio: customValues.aspect_ratio || '1:1',
                        quality: customValues.quality,
                        format: customValues.format,
                        duration: customValues.duration,
                    }
                };

                await startBackgroundGeneration(payload);

                const pText = inputs.prompt?.trim();
                if (pText) {
                    const updatedPrompts = [pText, ...recentPrompts.filter(p => p !== pText)].slice(0, 5);
                    setRecentPrompts(updatedPrompts);
                    setItem('bazzar_recent_prompts', JSON.stringify(updatedPrompts));
                }

                if (stats) updateStats({ current_balance: stats.current_balance - finalCost });
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
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col md:max-w-3xl md:mx-auto relative overflow-x-hidden selection:bg-[#3390ec]/30">
            {isVideoMode ? (
                <SEO 
                    title="Генерация видео — Bazzar Pixel"
                    description="Создавай видео-поздравления и анимации с помощью AI"
                />
            ) : (
                <SEO 
                    title="Генерация изображений — Bazzar Pixel"
                    description="Text-to-Image, Face Swap, Magic Eraser и другие AI инструменты"
                />
            )}
            
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-[#3390ec]/5 to-transparent" />
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3], x: [0, 50, 0], y: [0, 30, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-[#3390ec]/10 blur-[120px]"
                />
                <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2], x: [0, -40, 0], y: [0, -50, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute top-[20%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-purple-500/10 blur-[100px]"
                />
            </div>
            
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

            <GenerationErrorBoundary>
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="flex-1 overflow-y-auto pb-44 pt-4 space-y-6 relative z-10"
                >
                    <PromptInput 
                        inputs={inputs}
                        setInputs={setInputs}
                        t={t}
                        showPromptHistory={showPromptHistory}
                        setShowPromptHistory={setShowPromptHistory}
                        recentPrompts={recentPrompts}
                        handleVoiceInput={handleVoiceInput}
                        isListening={isListening}
                        handleEnhancePrompt={handleEnhancePrompt}
                        isEnhancing={isEnhancing}
                        showRefine={showRefine}
                        setShowRefine={setShowRefine}
                        PRESET_STYLES={PRESET_STYLES}
                        handleAddPreset={handleAddPreset}
                        playClick={playClick}
                        itemVariants={itemVariants}
                    />

                    <ModelSelector 
                        t={t}
                        filteredFamilies={filteredFamilies}
                        selectedFamilyId={selectedFamilyId}
                        setSelectedFamilyId={setSelectedFamilyId}
                        setSelectedModelId={setSelectedModelId}
                        playClick={playClick}
                        currentFamily={currentFamily}
                        selectedModelId={selectedModelId}
                        currentModel={currentModel}
                        maxImagesForModel={maxImagesForModel}
                        itemVariants={itemVariants}
                    />

                    <PhotoUpload 
                        maxImagesForModel={maxImagesForModel}
                        selectedImages={selectedImages}
                        previewUrls={previewUrls}
                        handleVisionAnalyze={handleVisionAnalyze}
                        isVisionAnalyzing={isVisionAnalyzing}
                        handleRemoveImage={handleRemoveImage}
                        handleFileChange={handleFileChange}
                        t={t}
                        itemVariants={itemVariants}
                    />

                    <GenerationSettings 
                        t={t}
                        currentModel={currentModel}
                        currentFamily={currentFamily}
                        customValues={customValues}
                        setCustomValues={setCustomValues}
                        openDropdown={openDropdown}
                        setOpenDropdown={setOpenDropdown}
                        itemVariants={itemVariants}
                    />

                    <GenerationButton 
                        cost={cost}
                        handleGenerate={handleGenerate}
                        isProcessing={isProcessing}
                        isCanceling={isCanceling}
                        cancelCountdown={cancelCountdown}
                        t={t}
                    />
                </motion.div>
            </GenerationErrorBoundary>

            <AnimatePresence>
                {showCreditModal && (
                    <InsufficientCreditsModal
                        isOpen={showCreditModal}
                        onClose={() => setShowCreditModal(false)}
                        onOpenPayment={onOpenPayment}
                        required={cost}
                        current={stats?.current_balance || 0}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default GenerationView;
