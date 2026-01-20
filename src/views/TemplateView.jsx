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

// Templates are now imported from centralized data file
// Prompts are hidden from users - only used for generation
const HIDDEN_TEMPLATE_FIELDS = ['generation_prompt', 'configuration'];

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
    const { user, pay, addBalance } = useUser();
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
        console.log('🎬 Generate clicked. Files:', selectedFiles.length);
        const validFiles = selectedFiles.filter(f => f).length;
        if (validFiles < requiredFilesCount) return;

        playClick();

        // Show warning for video generation
        const isVideoTemplate = template.mediaType === 'video';
        if (isVideoTemplate) {
            toaster.info('Генерация видео займет 2-5 минут. Результат придет в бот и появится в истории.');
        }

        playSuccess();
        setIsProcessing(true);

        try {
            // 2. Prepare Prompt
            let finalPrompt = template.generation_prompt || template.title;

            // Replace variables in prompt (e.g. ${anim_prompt})
            if (template.fields) {
                Object.entries(formValues).forEach(([key, value]) => {
                    finalPrompt = finalPrompt.replace(`\${${key}}`, value);
                });
            }

            // 3. Prepare options for AI Service

            // Convert files to Base64 (Server expects base64 strings, not File objects)
            const validFilesList = selectedFiles.filter(Boolean);
            const sourceFilesBase64 = await Promise.all(validFilesList.map(file => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = error => reject(error);
                });
            }));

            const generationOptions = {
                userId: user?.id,
                ...template.configuration,
                source_files: sourceFilesBase64
            };

            // For Kling Motion Control: add video_files (reference video from template)
            const currentModel = selectedModel || template.model_id || 'nano_banana';
            if (currentModel === 'kling_motion_control' && template.src && template.mediaType === 'video') {
                generationOptions.video_files = [template.src];
            }

            // 4. Call AI Service (Async Job Queue - Prevents Timeouts)
            // Backend handles payment deduction (and refund on AI failure)
            const result = await aiService.generateImageAsync(
                finalPrompt,
                selectedModel || template.model_id || 'nano_banana',
                generationOptions
            );

            if (result.success) {
                // DB Save is handled by Backend (bot.js) to ensure reliability and avoid duplicates
                console.log('✅ Generation flow complete. Result saved by server.');

                if (isVideoTemplate) {
                    toaster.success('Видео генерируется! Результат придет в бот через несколько минут.');
                } else {
                    toaster.success('Generation successful! Check your history.');
                }
                navigate('/history');
            } else {
                throw new Error(result.error || 'Generation failed');
            }

        } catch (error) {
            console.error('Generation Error:', error);
            const errMsg = error.message || '';

            if (errMsg.includes('Insufficient') || errMsg.includes('Payment Required') || errMsg.includes('402')) {
                toaster.error('Not enough credits! Please top up.');
                navigate('/profile');
            } else {
                toaster.error('Generation failed. Please try again.');
            }
            // Backend handles refunds automatically
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
                    {/* Model Selection Dropdown */}
                    {/* Model Selection Dropdown (Unlocked for all unless locked) */}
                    {!template.lockModel && (
                        <div className="relative mb-6 z-40">
                            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">{t('model.label') || 'Модель генерации'}</h3>

                            <button
                                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                                className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-500 dark:hover:border-slate-600 transition-colors shadow-sm"
                            >
                                <div className="flex flex-col items-start text-left">
                                    <span className="font-medium text-slate-900 dark:text-slate-200">
                                        {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name || 'Выберите модель'}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.desc || '...'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 rounded text-xs font-mono bg-slate-700 text-slate-400">
                                        {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.credits} CR
                                    </span>
                                    <ChevronDown size={18} className={`text-slate-400 transition-transform duration-200 ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
                                </div>
                            </button>

                            {isModelDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1e1e24] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
                                    {AVAILABLE_MODELS.map((model) => (
                                        <button
                                            key={model.id}
                                            onClick={() => {
                                                setSelectedModel(model.id);
                                                setIsModelDropdownOpen(false);
                                                playClick();
                                            }}
                                            className={`w-full flex items-center justify-between p-3 border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${selectedModel === model.id ? 'bg-indigo-50 dark:bg-indigo-500/10' : ''
                                                }`}
                                        >
                                            <div className="flex flex-col items-start text-left">
                                                <span className={`font-medium ${selectedModel === model.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-slate-200'}`}>
                                                    {model.name}
                                                </span>
                                                <span className="text-xs text-slate-500">{model.desc}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-500 font-mono">{model.credits} CR</span>
                                                {selectedModel === model.id && <Check size={16} className="text-indigo-400" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {/* File Upload Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold flex items-center gap-2">
                                <Upload size={16} className="text-indigo-500" />
                                {template.fileLabel || `Загрузите фото`} {requiredFilesCount > 1 ? `(${requiredFilesCount})` : ''}
                            </label>
                            <span className="text-xs font-medium text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded-full">
                                {selectedFiles.filter(Boolean).length}/{requiredFilesCount}
                            </span>
                        </div>
                        <div className={`grid gap-3 ${requiredFilesCount > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                            {Array.from({ length: requiredFilesCount }).map((_, i) => (
                                <div key={i} className={`relative group ${requiredFilesCount > 1 ? 'aspect-square' : 'aspect-[2/1]'}`}>
                                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, i)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" disabled={!!previewUrls[i]} />
                                    <div className={`w-full h-full rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 ${previewUrls[i] ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10' : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50'}`}>
                                        {previewUrls[i] ? (
                                            <div className="relative w-full h-full">
                                                <img src={previewUrls[i]} className="w-full h-full object-cover rounded-2xl" />
                                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemoveFile(i); }} className="absolute top-2 right-2 bg-white text-red-500 p-1 rounded-full z-30 shadow-md">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-indigo-500"><Upload size={18} /></div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Фото #{i + 1}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Fields */}
                    {fields.length > 0 && (
                        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                            {fields.map(field => (
                                <div key={field.id} className="space-y-2">
                                    <label className="text-sm font-bold ml-1">{field.label}</label>
                                    <input type={field.type || 'text'} placeholder={field.placeholder} value={formValues[field.id] || ''} onChange={(e) => handleFieldChange(field.id, e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none text-sm" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-30 pb-safe-bottom">
                {/* Video Generation Time Warning */}
                {template.mediaType === 'video' && (
                    <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                        <div className="flex items-start gap-2">
                            <Film size={16} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-amber-700 dark:text-amber-300">
                                <strong>Генерация видео:</strong> 2-5 минут. Результат придет в бот и появится в истории.
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center mb-4 px-1">
                    <span className="text-sm font-medium text-slate-500">Стоимость</span>
                    <div className="flex items-center gap-1.5 font-bold text-xl">
                        <Zap size={20} className="text-amber-400 fill-amber-400" />
                        {generationsCount * ((selectedModel && MODEL_CATALOG[selectedModel]?.cost) || template?.cost || 15)}
                    </div>
                </div>
                <AnimatedButton variant="primary" size="lg" fullWidth onClick={handleGenerate} disabled={!isReady || isProcessing} isLoading={isProcessing} icon={<Film size={20} />}>
                    {isProcessing ? (template.mediaType === 'video' ? 'Генерируем видео...' : 'Генерируем...') : 'Сгенерировать'}
                </AnimatedButton>
            </div>
        </motion.div>
    );
};

export default TemplateView;
