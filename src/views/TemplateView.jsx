import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Upload, Zap, Film, Check, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSound } from '../context/SoundContext';
import { AnimatedButton } from '../components/ui/AnimatedButtons';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { aiService } from '../ai-service';
import galleryAPI from '../lib/galleryAPI';
import templatesData from '../data/templates';
import { MODEL_CATALOG } from '../config/models';
import GenerationLoader from '../components/GenerationLoader';
import GenerationResult from '../components/GenerationResult';
import InsufficientCreditsModal from '../components/InsufficientCreditsModal';

// Templates are now imported from centralized data file
// Prompts are hidden from users - only used for generation
const HIDDEN_TEMPLATE_FIELDS = ['generation_prompt', 'prompt', 'configuration'];

const AVAILABLE_MODELS = [
    { id: 'nano_banana', name: '🍌 Nano Banana', desc: 'Быстро (Flux Flex)', type: 'image', credits: MODEL_CATALOG['nano_banana']?.cost || 10 },
    { id: 'nano_banana_pro', name: '🍌 Nano Banana PRO', desc: 'Качество (Flux Pro)', type: 'image', credits: MODEL_CATALOG['nano_banana_pro']?.cost || 20 },
    { id: 'grok_high', name: '🤖 Grok Quality', desc: 'Для обработки фото', type: 'image', credits: 25 },
    { id: 'flux_pro', name: '💠 Flux 1.1 Pro', desc: 'Top Tier', type: 'image', credits: MODEL_CATALOG['flux_pro']?.cost || 10 },
    { id: 'flux_flex', name: '💠 Flux Flex', desc: 'Balanced', type: 'image', credits: MODEL_CATALOG['flux_flex']?.cost || 10 },
    { id: 'kling_motion_control', name: '🎬 Kling Motion', desc: 'Image to Video', type: 'video', credits: MODEL_CATALOG['kling_motion_control']?.cost || 70 },
    { id: 'grok-imagine/image-to-video', name: '🤖 Grok Video', desc: 'Оживить фото', type: 'video', credits: 15 },
    { id: 'wan_2_6_image', name: '🌊 Wan 2.6', desc: 'Alibaba AI', type: 'video', credits: MODEL_CATALOG['wan_2_6_image']?.cost || 50 },
    { id: 'hailuo_2_3_image_pro', name: '🐚 Hailuo 2.1', desc: 'High Quality', type: 'video', credits: MODEL_CATALOG['hailuo_2_3_image_pro']?.cost || 50 }
];

/**
 * Представление шаблона (TemplateView)
 * 
 * Этот компонент отвечает за весь процесс генерации на основе шаблона:
 * 1. Загрузка данных шаблона (из БД или статического списка).
 * 2. Интерфейс загрузки файлов пользователем (фото/видео).
 * 3. Форма для ввода дополнительных параметров (динамические поля).
 * 4. Логика оплаты (списание кредитов через UserContext).
 * 5. Сборка финального промта (на английском) с подстановкой переменных.
 * 6. Отправка запроса в AI Service.
 */
const TemplateView = ({ onOpenPayment }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    const location = useLocation();
    const { t } = useLanguage();
    const { playClick, playSuccess } = useSound();
    const {
        user,
        stats,
        updateStats,
        refreshUser,
        pay,
        addBalance,
        startGlobalGen,
        setGlobalGenResult,
        closeGlobalGen
    } = useUser();
    const toaster = useToast();

    const [template, setTemplate] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // Multi-file support
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [showCreditModal, setShowCreditModal] = useState(false);

    // Dynamic fields support
    const [formValues, setFormValues] = useState({});
    const [generationsCount, setGenerationsCount] = useState(1);
    const [selectedModel, setSelectedModel] = useState(null);
    const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

    useEffect(() => {
        const loadTemplate = async () => {
            setIsLoading(true);

            // 1. Try static list
            let found = templatesData.find(t => t.id === id);

            // 2. Try location state
            if (!found && location.state?.template) {
                found = location.state.template;
            }

            // 3. Fetch from API
            if (!found) {
                found = await galleryAPI.getTemplate(id);
            }

            if (found) {
                setTemplate(found);

                // Initialize form
                const reqCount = found.requiredFilesCount || 1;
                setSelectedFiles(new Array(reqCount).fill(null));
                setPreviewUrls(new Array(reqCount).fill(null));
                setFormValues({});
                setGenerationsCount(1);
                // Default model logic:
                // 1. Use template's model_id if specified and exists in AVAILABLE_MODELS
                // 2. Otherwise, pick first model matching template type
                let defaultModel = found.model_id;

                // Validate model exists in AVAILABLE_MODELS
                const modelExists = AVAILABLE_MODELS.find(m => m.id === defaultModel);

                if (!modelExists) {
                    // Pick first model matching template type
                    const templateType = found.mediaType === 'video' ? 'video' : 'image';
                    const firstMatchingModel = AVAILABLE_MODELS.find(m => m.type === templateType);
                    defaultModel = firstMatchingModel?.id || AVAILABLE_MODELS[0].id;

                    console.warn(`Template ${found.id} model_id "${found.model_id}" not found in AVAILABLE_MODELS. Using ${defaultModel} instead.`);
                }

                setSelectedModel(defaultModel);
            }
            setIsLoading(false);
        };

        loadTemplate();

        return () => {
            // Cleanup
            previewUrls.forEach(url => { if (url) URL.revokeObjectURL(url); });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!template) {
        return <div className="min-h-screen flex items-center justify-center text-slate-500">Template not found</div>;
    }

    const requiredFilesCount = template.requiredFilesCount || 1;
    const fields = template.fields || [];

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

    const handleRemoveFile = (index) => {
        playClick();
        const newFiles = [...selectedFiles];
        newFiles[index] = null;
        setSelectedFiles(newFiles);

        const newUrls = [...previewUrls];
        if (newUrls[index]) URL.revokeObjectURL(newUrls[index]);
        newUrls[index] = null;
        setPreviewUrls(newUrls);
    };

    const handleFieldChange = (id, value) => {
        setFormValues(prev => ({ ...prev, [id]: value }));
    };

    const handleGenerate = async () => {
        const currentModelId = selectedModel || template.model_id || (template.mediaType === 'video' ? 'kling_motion_control' : 'nano_banana');
        const cost = AVAILABLE_MODELS.find(m => m.id === currentModelId)?.credits || 15;

        // 1. Check Credits Immediately
        const currentBalance = stats?.current_balance || 0;
        if (currentBalance < cost) {
            setShowCreditModal(true);
            return;
        }

        const validFiles = selectedFiles.filter(f => f).length;
        if (validFiles < requiredFilesCount) return;

        playClick();

        // Show warning for video generation
        const isVideoTemplate = template.mediaType === 'video';

        playSuccess();
        setIsProcessing(true);

        // Trigger GLOBAL LOADER
        startGlobalGen(
            isVideoTemplate ? 'video' : 'image',
            isVideoTemplate ? 120 : 15
        );

        // Optimistic Deduction for UI immediate feedback
        if (stats) {
            updateStats({ current_balance: stats.current_balance - cost });
        }

        try {
            // 2. Prepare Prompt
            let finalPrompt = template.prompt || template.generation_prompt || template.title;

            // Replace variables in prompt (e.g. ${anim_prompt})
            if (template.fields) {
                Object.entries(formValues).forEach(([key, value]) => {
                    finalPrompt = finalPrompt.replace(`\${${key}}`, value);
                });
            }

            // 3. Prepare options for AI Service
            // Convert files to Base64 with compression to prevent 413 errors
            const validFilesList = selectedFiles.filter(Boolean);
            const sourceFilesBase64 = await Promise.all(validFilesList.map(file => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    const url = URL.createObjectURL(file);
                    img.src = url;

                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;
                        const MAX_SIZE = 1280; // Allow slightly larger max
                        const MIN_SIZE = 340; // Reverted to 340 per user request

                        // 1. Upscale if too small
                        if (width < MIN_SIZE || height < MIN_SIZE) {
                            const scale = Math.max(MIN_SIZE / width, MIN_SIZE / height);
                            width = Math.round(width * scale);
                            height = Math.round(height * scale);
                        }

                        // 2. Downscale if too big
                        if (width > height) {
                            if (width > MAX_SIZE) {
                                height *= MAX_SIZE / width;
                                width = MAX_SIZE;
                            }
                        } else {
                            if (height > MAX_SIZE) {
                                width *= MAX_SIZE / height;
                                height = MAX_SIZE;
                            }
                        }

                        // Round for canvas
                        width = Math.round(width);
                        height = Math.round(height);

                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);

                        // Clean up
                        URL.revokeObjectURL(url);

                        // Get base64 (jpeg 0.8 quality)
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                        resolve(dataUrl.split(',')[1]);
                    };
                    img.onerror = (e) => {
                        URL.revokeObjectURL(url);
                        reject(e);
                    };
                });
            }));

            const generationOptions = {
                userId: user?.id,
                ...template.configuration,
                source_files: sourceFilesBase64
            };

            const currentModel = selectedModel || template.model_id || 'nano_banana';
            if (currentModel === 'kling_motion_control' && template.src && template.mediaType === 'video') {
                let videoSrc = template.src;
                // If relative path, make it absolute so server/Kie can download it
                if (videoSrc.startsWith('/')) {
                    videoSrc = window.location.origin + videoSrc;
                }
                generationOptions.video_files = [videoSrc];
            }

            // 4. Call AI Service
            const result = await aiService.generateImageAsync(
                finalPrompt,
                selectedModel || template.model_id || 'nano_banana',
                generationOptions
            );
            if (result.success) {
                console.log('✅ Generation flow complete.');
                if (result.newBalance !== undefined) updateStats({ current_balance: result.newBalance });

                if (isVideoTemplate) {
                    closeGlobalGen();
                    toaster.success('Видео генерируется! Результат придет в бот.');
                    navigate('/history');
                } else {
                    // Show GLOBAL RESULT
                    setGlobalGenResult({
                        url: result.imageUrl,
                        id: result.id || ('gen_' + Date.now()),
                        prompt: finalPrompt
                    });
                }
            } else {
                throw new Error(result.error || 'Generation failed');
            }

        } catch (error) {
            console.error('Generation Error:', error);
            closeGlobalGen();
            refreshUser(); // Sync balance back
            const errMsg = error.message || '';

            if (errMsg.includes('Insufficient') || errMsg.includes('Payment Required') || errMsg.includes('402')) {
                toaster.error('Not enough credits! Please top up.');
                navigate('/profile');
            } else {
                toaster.error('Generation failed. Please try again.');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const isFilesReady = selectedFiles.filter(f => f).length >= requiredFilesCount;
    const isReady = isFilesReady;

    const currentModelId = selectedModel || template.model_id || (template.mediaType === 'video' ? 'kling_motion_control' : 'nano_banana');
    const cost = AVAILABLE_MODELS.find(m => m.id === currentModelId)?.credits || 15;

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="min-h-screen bg-[#0f0f10] text-white pb-safe flex flex-col relative overflow-hidden"
        >
            {/* Background Blobs (Optional for depth) */}
            <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none" />

            {/* Header (Glassy) */}
            <div className="px-4 py-4 pt-[calc(env(safe-area-inset-top)+10px)] flex items-center justify-between sticky top-0 bg-[#0f0f10]/80 backdrop-blur-xl z-50 border-b border-white/5">
                <div className="w-10" />
                <div className="font-black text-sm uppercase tracking-widest text-white/90 pr-10">{template.title}</div>
                <div />
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-40 z-10 relative">
                {/* Preview */}
                <div className="aspect-[9/16] w-full max-w-[260px] mx-auto rounded-[2rem] overflow-hidden shadow-2xl mb-10 bg-black relative ring-1 ring-white/10 mt-6 group">
                    {template.mediaType === 'image' ? (
                        <img src={template.src} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700" alt={template.title} />
                    ) : (
                        <video src={template.src} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Content */}
                <div className="space-y-8 max-w-sm mx-auto">

                    {/* Model Selection Logic */}
                    {!template.lockModel && template.category !== 'dances' && (
                        <div className="relative mb-6 z-30">
                            <h3 className="text-xs font-bold text-white/50 mb-3 uppercase tracking-wide ml-1">{t('model.label') || 'Модель генерации'}</h3>
                            <button onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)} className="w-full flex items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-[1.2rem] hover:bg-white/10 transition-colors shadow-lg shadow-black/5 backdrop-blur-sm">
                                <span className="font-bold text-sm tracking-wide">{AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name || 'Выберите модель'}</span>
                                <ChevronDown size={18} className={`text-white/50 transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isModelDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-3 bg-[#151517]/95 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto ring-1 ring-black/50 backdrop-blur-xl">
                                    {AVAILABLE_MODELS.filter(m => {
                                        if (template.category === 'photo') return m.type === 'image';
                                        if (template.category === 'video') return m.type === 'video';
                                        if (template.category === 'dances') return false;
                                        return true;
                                    }).map(m => (
                                        <button key={m.id} onClick={() => { setSelectedModel(m.id); setIsModelDropdownOpen(false); playClick(); }} className="w-full text-left p-3.5 hover:bg-white/10 flex justify-between items-center bg-transparent border-b border-white/5 last:border-0">
                                            <div>
                                                <div className="font-bold text-xs uppercase tracking-wide text-white/90">{m.name}</div>
                                                <div className="text-[10px] text-white/40 mt-0.5">{m.desc}</div>
                                            </div>
                                            <span className="text-[10px] font-bold text-white/30 bg-white/5 px-2 py-1 rounded-lg border border-white/5">{m.credits} CR</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* File Uploads (Glassy) */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-xs font-bold flex items-center gap-2 text-white/50 uppercase tracking-wide">
                                <Upload size={14} className="text-indigo-400" /> {template.fileLabel || 'Ваше фото'}
                            </label>
                            <span className="text-[10px] font-bold text-white/60 bg-white/10 px-2 py-0.5 rounded-full border border-white/5">{selectedFiles.filter(Boolean).length}/{requiredFilesCount}</span>
                        </div>
                        <div className={`grid gap-3 ${requiredFilesCount > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                            {Array.from({ length: requiredFilesCount }).map((_, i) => (
                                <div key={i} className="relative aspect-square group">
                                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, i)} className="absolute inset-0 z-20 opacity-0 cursor-pointer" />
                                    <div className={`w-full h-full rounded-[1.5rem] border border-dashed flex items-center justify-center transition-all duration-300 ${previewUrls[i] ? 'border-indigo-500/50 bg-black' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                                        {previewUrls[i] ? (
                                            <>
                                                <img src={previewUrls[i]} className="w-full h-full object-cover rounded-[1.4rem] opacity-80" />
                                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemoveFile(i); }} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white/70 hover:text-white hover:bg-red-500/80 transition-all z-30">
                                                    <Trash2 size={12} />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="text-center p-4">
                                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-2 border border-white/10 group-hover:scale-110 transition-transform">
                                                    <Upload size={18} className="text-white/40 group-hover:text-indigo-400" />
                                                </div>
                                                <span className="text-[10px] text-white/30 font-bold uppercase tracking-wide">Загрузить</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Fields (Glassy) */}
                    {fields.map(field => (
                        <div key={field.id} className="space-y-2">
                            <label className="text-xs font-bold ml-1 text-white/50 uppercase tracking-wide">{field.label}</label>
                            <input
                                type={field.type || 'text'}
                                placeholder={field.placeholder}
                                value={formValues[field.id] || ''}
                                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                                className="w-full px-4 py-4 rounded-[1.2rem] bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:bg-white/10 outline-none text-sm text-white placeholder:text-white/20 transition-all shadow-inner"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer (Dock) */}
            <div className="fixed bottom-0 left-0 right-0 p-5 pb-safe-bottom bg-[#0f0f10]/80 backdrop-blur-2xl border-t border-white/5 z-40 transition-all">
                <AnimatedButton
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleGenerate}
                    disabled={!isReady || isProcessing}
                    isLoading={isProcessing}
                    className="h-14 rounded-[1.2rem] shadow-xl shadow-amber-500/10 font-black text-base tracking-wide"
                >
                    <span className="flex items-center gap-2">
                        {isProcessing ? 'Генерируем...' : (
                            <>
                                <Film size={20} className="fill-current" /> СГЕНЕРИРОВАТЬ ({cost})
                            </>
                        )}
                    </span>
                </AnimatedButton>
            </div>
            <InsufficientCreditsModal
                isOpen={showCreditModal}
                onClose={() => setShowCreditModal(false)}
                onTopUp={() => {
                    navigate('/');
                    setTimeout(() => onOpenPayment?.(), 100);
                }}
            />
        </motion.div >
    );
};

export default TemplateView;
