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

// Templates are now imported from centralized data file
// Prompts are hidden from users - only used for generation
const HIDDEN_TEMPLATE_FIELDS = ['generation_prompt', 'prompt', 'configuration'];

const AVAILABLE_MODELS = [
    { id: 'nano_banana', name: '🍌 Nano Banana', desc: 'Быстро (Flux Flex)', credits: MODEL_CATALOG['nano_banana']?.cost || 1 },
    { id: 'nano_banana_pro', name: '🍌 Nano Banana PRO', desc: 'Качество (Flux Pro)', credits: MODEL_CATALOG['nano_banana_pro']?.cost || 2 },
    { id: 'grok-high', name: '🤖 Grok Quality', desc: 'Для обработки фото', credits: 25 }, // No mapping in catalog? Check later
    { id: 'flux_pro', name: '💠 Flux 1.1 Pro', desc: 'Top Tier', credits: MODEL_CATALOG['flux_pro']?.cost || 3 },
    { id: 'flux_flex', name: '💠 Flux Flex', desc: 'Balanced', credits: MODEL_CATALOG['flux_flex']?.cost || 3 },
    { id: 'kling_motion_control', name: '🎬 Kling Motion', desc: 'Image to Video', credits: MODEL_CATALOG['kling_motion_control']?.cost || 8 }
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
const TemplateView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();
    const { playClick, playSuccess } = useSound();
    const {
        user,
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
                // Default model logic: if template has specific model, use it.
                // If it's a VIDEO template, default to Kling Motion Control.
                // Otherwise default to nano_banana.
                const defaultModel = found.model_id || (found.mediaType === 'video' ? 'kling_motion_control' : 'nano_banana');
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
                        const MAX_SIZE = 1024;

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

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-white pb-safe flex flex-col"
        >
            {/* Header */}
            {/* ... keeping header structure via surrounding context usually, but here replacing full return body is safer to insert AnimatePresence properly at end */}
            <div className="px-4 py-4 pt-[calc(env(safe-area-inset-top)+10px)] flex items-center justify-between sticky top-0 bg-slate-50/95 dark:bg-[#09090b]/95 backdrop-blur z-20">
                <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                    <ChevronLeft size={24} /> <span className="font-medium">Назад</span>
                </button>
                <div className="font-bold text-lg pr-8">{template.title}</div>
                <div />
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-32">
                {/* Preview */}
                <div className="aspect-[9/16] w-full max-w-[240px] mx-auto rounded-3xl overflow-hidden shadow-2xl mb-8 bg-black relative ring-4 ring-white dark:ring-slate-800/50 mt-4">
                    {template.mediaType === 'image' ? (
                        <img src={template.src} className="w-full h-full object-cover" alt={template.title} />
                    ) : (
                        <video src={template.src} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                    )}
                </div>

                {/* Content */}
                <div className="space-y-8 max-w-sm mx-auto">
                    {/* Model Selection */}
                    {!template.lockModel && (
                        <div className="relative mb-6 z-40">
                            {/* ... keeping logic simple, relying on context matching ... */}
                            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">{t('model.label') || 'Модель генерации'}</h3>
                            <button onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)} className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-500 transition-colors shadow-sm">
                                <span className="font-medium">{AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name || 'Auto'}</span>
                                <ChevronDown size={18} className="text-slate-400" />
                            </button>
                            {/* Simplified dropdown render for replacement to fit block */}
                            {isModelDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1e1e24] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                                    {AVAILABLE_MODELS.map(m => (
                                        <button key={m.id} onClick={() => { setSelectedModel(m.id); setIsModelDropdownOpen(false); }} className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-white/5 flex justify-between">
                                            <span>{m.name}</span>
                                            <span className="text-xs text-slate-500">{m.credits} CR</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* File Uploads */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold flex items-center gap-2"><Upload size={16} className="text-indigo-500" /> {template.fileLabel || 'Ваше фото'}</label>
                            <span className="text-xs font-medium text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded-full">{selectedFiles.filter(Boolean).length}/{requiredFilesCount}</span>
                        </div>
                        <div className={`grid gap-3 ${requiredFilesCount > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                            {Array.from({ length: requiredFilesCount }).map((_, i) => (
                                <div key={i} className="relative aspect-square group">
                                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, i)} className="absolute inset-0 z-20 opacity-0 cursor-pointer" />
                                    <div className={`w-full h-full rounded-2xl border-2 border-dashed flex items-center justify-center ${previewUrls[i] ? 'border-indigo-500' : 'border-slate-300 dark:border-slate-700'}`}>
                                        {previewUrls[i] ? <img src={previewUrls[i]} className="w-full h-full object-cover rounded-2xl" /> : <Upload className="text-slate-400" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Fields */}
                    {fields.map(field => (
                        <div key={field.id} className="space-y-2">
                            <label className="text-sm font-bold ml-1">{field.label}</label>
                            <input type={field.type || 'text'} placeholder={field.placeholder} value={formValues[field.id] || ''} onChange={(e) => handleFieldChange(field.id, e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none text-sm" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-30 pb-safe-bottom">
                <AnimatedButton variant="primary" size="lg" fullWidth onClick={handleGenerate} disabled={!isReady || isProcessing} isLoading={isProcessing} icon={<Film size={20} />}>
                    {isProcessing ? 'Генерируем...' : 'Сгенерировать'}
                </AnimatedButton>
            </div>
        </motion.div>
    );
};

export default TemplateView;
