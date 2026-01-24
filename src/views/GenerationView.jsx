import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    X, ChevronLeft, ChevronDown, Sparkles, Trash2, Check, Upload, Flame,
    Image as ImageIcon, Video, Music, Wand2, Zap, Clock, Search, Sliders, Film, Camera,
    Eraser, Recycle, PlusCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSound } from '../context/SoundContext';
import { useToast } from '../context/ToastContext';
import { useUser } from '../context/UserContext';
import { aiService } from '../ai-service';
import galleryAPI from '../lib/galleryAPI';
import GenerationLoader from '../components/GenerationLoader';
import GenerationResult from '../components/GenerationResult';

// --- Visual Components ---
const RatioVisual = ({ ratio }) => {
    const getDims = (r) => {
        switch (r) {
            case '1:1': return { w: 40, h: 40, labelW: 1, labelH: 1 };
            case '3:4': return { w: 30, h: 40, labelW: 3, labelH: 4 };
            case '9:16': return { w: 24, h: 42, labelW: 9, labelH: 16 };
            case '4:3': return { w: 40, h: 30, labelW: 4, labelH: 3 };
            case '16:9': return { w: 42, h: 24, labelW: 16, labelH: 9 };
            default: return { w: 40, h: 40, labelW: 1, labelH: 1 };
        }
    };
    const { w, h, labelW, labelH } = getDims(ratio);

    return (
        <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="border-2 border-slate-400 dark:border-slate-500 rounded-md bg-slate-200/50 dark:bg-white/5 transition-all" style={{ width: w, height: h }} />
            <div className="absolute -bottom-2 w-full flex justify-center items-center gap-1">
                <span className="text-[8px] text-slate-400">←</span>
                <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400">{labelW}</span>
                <span className="text-[8px] text-slate-400">→</span>
            </div>
            <div className="absolute -right-2 h-full flex flex-col justify-center items-center gap-0.5">
                <span className="text-[8px] text-slate-400 rotate-90">←</span>
                <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 my-0.5">{labelH}</span>
                <span className="text-[8px] text-slate-400 rotate-90">→</span>
            </div>
        </div>
    );
};

// --- DATA CONFIGURATION ---
// MODES moved inside component or memoized hook
const getModes = (t) => ({
    'tools': {
        id: 'tools',
        label: t('toolsCard.tools'),
        icon: Sliders,
        isMenu: true,
        desc: t('toolsCard.utils')
    },
    'image-gen': {
        id: 'image-gen',
        label: t('toolsCard.image'),
        icon: ImageIcon,
        hasImages: true,
        hasRatio: true,
        hasCount: true,
        inputs: [
            { id: 'prompt', label: t('creation.describe'), placeholder: t('creation.placeholder'), type: 'textarea', required: true }
        ],
        models: [
            { id: 'seedream_45_text', name: 'Seedream 4.5', desc: 'Balanced & Fast', iconChar: 'S' },
            { id: 'gpt_image_15_text', name: 'GPT Image 1.5', desc: 'High Coherence', iconChar: 'G' },
            { id: 'flux_flex', name: 'Flux 2.1', desc: 'Realistic', iconChar: 'F' },
            { id: 'grok_text', name: 'Grok 2', desc: 'Creative', iconChar: 'X' },
            { id: 'seedream_3', name: 'Seedream 3.0', desc: 'Fastest', iconChar: 'S' }
        ]
    },
    'video-gen': {
        id: 'video-gen',
        label: t('toolsCard.video'),
        icon: Video,
        hasImages: true,
        hasRatio: true,
        hasCount: false,
        inputs: [
            { id: 'prompt', label: t('creation.describe'), placeholder: t('creation.placeholder'), type: 'textarea', required: true }
        ],
        models: [
            { id: 'wan_2_6_image', name: 'Wan 2.6', desc: 'Alibaba AI (Im2Vid)', iconChar: 'W', badge: { text: 'HIT', icon: '🔥' } },
            { id: 'kling_motion_control', name: 'Kling Motion', desc: 'Photo + Video Ref', iconChar: 'K', badge: { text: 'NEW', icon: '✨' } },
            { id: 'hailuo_2_3_image_pro', name: 'Hailuo 2.1', desc: 'Best Quality', iconChar: 'H' },
            { id: 'v1_pro_fast_image', name: 'Bytedance', desc: 'Fast & Fluid', iconChar: 'B' },
            { id: 'kling_2_5_turbo_image_pro', name: 'Kling Turbo', desc: 'High Speed', iconChar: 'K' },
            { id: 'veo_3', name: 'Veo 3.1', desc: 'Google Deepmind', iconChar: 'V' }
        ],
        customFields: [
            { id: 'resolution', label: 'Разрешение', type: 'selector', options: ['720p', '1080p'] },
            { id: 'duration', label: 'Длительность', type: 'selector', options: ['5s', '10s'] }
        ]
    },
    'animate-photo': {
        id: 'animate-photo',
        label: t('toolsCard.animate'),
        icon: Film,
        hasImages: true,
        uploadLabel: t('toolsCard.live'),
        hasRatio: false,
        hasCount: false,
        inputs: [
            { id: 'prompt', label: t('creation.describe'), placeholder: t('creation.placeholder'), type: 'textarea' }
        ],
        models: [
            { id: 'veo_3_1', name: 'Veo 3.1', desc: 'Animate', iconChar: 'V' }
        ],
        customFields: [
            { id: 'fixed_camera', label: 'Фиксированная камера', type: 'toggle', options: [t('profile.on'), t('profile.off')] }
        ]
    },
    'audio-gen': {
        id: 'audio-gen',
        label: t('toolsCard.audio'),
        icon: Music,
        inputs: [
            { id: 'prompt', label: t('creation.describe'), placeholder: t('creation.placeholder'), type: 'textarea', required: true }
        ],
        models: [
            { id: 'suno_v5', name: 'Suno V5', desc: 'Chip Kraunt', iconChar: 'S' },
            { id: 'chip_3_5', name: 'Chip 3.5', desc: 'Audio Gen', iconChar: 'C' },
            { id: 'chip_4_5', name: 'Chip 4.5', desc: 'Pro Audio', iconChar: 'C' }
        ],
        customFields: [
            { id: 'duration', label: 'Длительность', type: 'selector', options: ['30s', '1m'] },
            { id: 'instrumental', label: 'Инструментал', type: 'toggle', options: [t('profile.on'), t('profile.off')] }
        ]
    },
    'replace-object': {
        id: 'replace-object',
        label: 'Заменить',
        icon: Recycle,
        hasImages: true,
        uploadLabel: t('creation.newCreation'),
        hasRatio: false,
        inputs: [
            { id: 'old_object', label: 'Старый объект', placeholder: 'Опишите объект для замены', type: 'textarea', required: true, color: 'border-red-500/30' },
            { id: 'new_object', label: 'Новый объект', placeholder: 'Опишите новый объект', type: 'textarea', required: true, color: 'border-green-500/30' }
        ],
        models: [{ id: 'inpainting_v2', name: 'Smart Edit', desc: 'AI', iconChar: 'I' }]
    },
    'remove-object': {
        id: 'remove-object',
        label: 'Удалить',
        icon: Eraser,
        hasImages: true,
        uploadLabel: t('creation.newCreation'),
        hasRatio: false,
        inputs: [
            { id: 'remove_object', label: 'Объект для удаления', placeholder: 'Опишите объект для удаления', type: 'textarea', required: true, color: 'border-red-500/30' }
        ],
        models: [{ id: 'eraser_pro', name: 'Magic Eraser', desc: 'AI', iconChar: 'E' }]
    },
    'add-object': {
        id: 'add-object',
        label: 'Добавить',
        icon: PlusCircle,
        hasImages: true,
        uploadLabel: t('creation.newCreation'),
        hasRatio: true,
        inputs: [
            { id: 'new_object', label: 'Новый объект', placeholder: 'Опишите объект для добавления', type: 'textarea', required: true }
        ],
        models: [{ id: 'outpainting_v1', name: 'Object Adder', desc: 'AI', iconChar: 'A' }]
    },
    'describe': {
        id: 'describe',
        label: 'Описать',
        icon: Search,
        hasImages: true,
        uploadLabel: 'Загрузите фото',
        inputs: [],
        models: [{ id: 'describe_v1', name: 'Describer', desc: 'AI', iconChar: 'D' }]
    }
});

const GenerationView = ({ onOpenPayment }) => {
    const navigate = useNavigate();
    const { type: paramType } = useParams();
    const location = useLocation();

    const { t } = useLanguage();
    const MODES = React.useMemo(() => getModes(t), [t]);

    // Type Handling
    const rawType = decodeURIComponent(paramType || 'image-gen');
    const currentModeKey = Object.keys(MODES).find(k => k === rawType) || 'image-gen';
    const modeConfig = MODES[currentModeKey];

    const { playClick, playSuccess } = useSound();

    // State
    const [inputs, setInputs] = useState({});
    const [model, setModel] = useState(modeConfig.models ? modeConfig.models[0].id : '');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [genCount, setGenCount] = useState(1);
    const [selectedImages, setSelectedImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [customValues, setCustomValues] = useState({});
    const [isPublicResult, setIsPublicResult] = useState(false);

    const [isTypeOpen, setIsTypeOpen] = useState(false);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [isRatioOpen, setIsRatioOpen] = useState(false);

    const fileInputRef = useRef(null);

    // --- CONFIG LOADING ---
    const [serverConfig, setServerConfig] = useState({ models: {} });
    useEffect(() => {
        const loadConfig = async () => {
            try {
                const modelsList = await aiService.getModels();
                const modelsMap = {};
                if (Array.isArray(modelsList)) {
                    modelsList.forEach(m => {
                        modelsMap[m.id] = m;
                    });
                }
                setServerConfig({ models: modelsMap });
            } catch (err) {
                console.error('Failed to load config:', err);
            }
        };
        loadConfig();
    }, []);

    // --- KLING MOTION SPECIAL STATE ---
    const [klingFiles, setKlingFiles] = useState({ image: null, video: null });
    const refImageInput = useRef(null);
    const refVideoInput = useRef(null);

    useEffect(() => {
        if (model === 'kling_motion_control') {
            const files = [];
            if (klingFiles.image) files.push(klingFiles.image);
            if (klingFiles.video) files.push(klingFiles.video);
            if (files.length !== selectedImages.length || files[0] !== selectedImages[0]) {
                setSelectedImages(files);
                const urls = files.map(f => URL.createObjectURL(f));
                setPreviewUrls(urls);
            }
        }
    }, [klingFiles, model]);

    useEffect(() => {
        const targetModel = location.state?.model;
        const validModel = modeConfig.models?.find(m => m.id === targetModel);

        if (validModel) {
            setModel(validModel.id);
        } else if (modeConfig.models) {
            setModel(modeConfig.models[0].id);
        }

        if (!modeConfig.isMenu) {
            setSelectedImages([]);
            setPreviewUrls([]);
        }
        setGenCount(1);
        setCustomValues({});
        if (location.state?.prompt) {
            setInputs({ prompt: location.state.prompt });
        } else {
            setInputs({});
        }

        if (modeConfig.customFields) {
            const defaults = {};
            modeConfig.customFields.forEach(f => defaults[f.id] = f.options[0]);
            setCustomValues(defaults);
        }
    }, [currentModeKey, location.state]);

    const handleTypeChange = (newType) => {
        playClick();
        setIsTypeOpen(false);
        navigate(`/generate/${encodeURIComponent(newType)}`);
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            playClick();
            setSelectedImages(prev => [...prev, ...files]);
            const newUrls = files.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newUrls]);
        }
    };

    const handleRemoveImage = (index) => {
        playClick();
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => {
            const urlToRemove = prev[index];
            if (urlToRemove) URL.revokeObjectURL(urlToRemove);
            return prev.filter((_, i) => i !== index);
        });
    };

    const toast = useToast();
    const [isProcessing, setIsProcessing] = useState(false);

    const fileToBase64 = (blobUrl) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = blobUrl;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_SIZE = 1024;
                if (width > height) {
                    if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
                } else {
                    if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                resolve(dataUrl.split(',')[1]);
            };
            img.onerror = reject;
        });
    };

    const {
        user: apiUser,
        pay,
        addBalance,
        stats: userStats,
        telegramId,
        startGlobalGen,
        setGlobalGenResult,
        closeGlobalGen
    } = useUser();

    // Cost Calculation Logic
    const getCost = () => {
        if (serverConfig && serverConfig.models && serverConfig.models[model]) {
            let cost = serverConfig.models[model].cost;
            return cost * genCount;
        }
        let cost = 1;
        if (currentModeKey === 'replace-object' || currentModeKey === 'remove-object' || currentModeKey === 'add-object') return 2;
        if (currentModeKey === 'describe') return 1;

        const mId = model.toLowerCase();
        if (['seedream_3', 'grok_text', 'recraft_remove_bg', 'recraft_upscale', 'grok_upscale'].includes(mId)) cost = 1;
        else if (['seedream_45_text', 'gpt_image_15_text', 'gpt_image_15_edit', 'z_image', 'ideogram_reframe', 'seedream_v4_text', 'seedream_v4_edit', 'seedream_45_edit', 'grok_image'].includes(mId)) cost = 2;
        else if (['flux_flex', 'flux_pro'].includes(mId)) cost = 3;
        else if (mId === 'kling_motion_control') cost = 8;
        else if (mId === 'grok_text_video') cost = 10;
        else if (mId === 'grok_image_video') cost = 12;
        else if (mId.includes('veo') || mId.includes('sora')) cost = 15;
        else if (mId.includes('suno') || mId.includes('chip')) cost = 5;
        return cost * genCount;
    };

    const cost = getCost();
    const canAfford = (userStats?.current_balance || 0) >= cost;

    const handleGenerate = async () => {
        const requiredInputs = modeConfig.inputs?.filter(i => i.required) || [];
        for (const input of requiredInputs) {
            if (!inputs[input.id]?.trim()) {
                toast.error(`Пожалуйста, заполните ${input.label}`);
                return;
            }
        }

        if (modeConfig.hasImages && selectedImages.length === 0) {
            toast.error('Пожалуйста, загрузите изображение');
            return;
        }

        if (!canAfford) {
            playClick();
            toast.error(`Недостаточно кредитов! Нужно: ${cost}`, {
                icon: '⚡',
                duration: 4000
            });
            onOpenPayment?.();
            return;
        }

        playClick();
        setIsProcessing(true);

        startGlobalGen(
            currentModeKey.includes('video') ? 'video' : 'image',
            currentModeKey.includes('video') ? (model.includes('kling') ? 120 : 60) : 15
        );

        try {
            let result;
            if (['Replace Object', 'Remove Object', 'Add Object'].includes(currentModeKey)) {
                const base64Img = await fileToBase64(previewUrls[0]);
                const instructions = { ...inputs, ...customValues, mode: currentModeKey };
                result = await aiService.instructEdit(base64Img, instructions);
            }
            else {
                const promptText = inputs['prompt'] || '';
                let sourceFiles = selectedImages.length > 0 ? selectedImages : null;
                let videoFiles = null;

                if (model === 'kling_motion_control') {
                    if (sourceFiles) {
                        const images = sourceFiles.filter(f => f.type.startsWith('image/'));
                        const videos = sourceFiles.filter(f => f.type.startsWith('video/'));
                        if (images.length === 0 || videos.length === 0) {
                            toast.error('Для Kling Motion нужно загрузить 1 фото и 1 видео!');
                            setIsProcessing(false); closeGlobalGen(); return;
                        }
                        sourceFiles = images; videoFiles = videos;
                    } else {
                        toast.error('Загрузите фото и видео для Kling Motion!');
                        setIsProcessing(false); closeGlobalGen(); return;
                    }
                }

                result = await aiService.generateImage(promptText, model, {
                    aspectRatio, count: genCount, source_files: sourceFiles, video_files: videoFiles,
                    userId: apiUser?.id, telegramId: telegramId, ...customValues
                });
            }

            if (result.success) {
                let savedRecordId = result.id;
                if (!savedRecordId) {
                    const savedRecord = await galleryAPI.saveCreation({
                        userId: apiUser.id, generationId: result.id || 'gen_' + Date.now(),
                        title: inputs['prompt'] ? inputs['prompt'].slice(0, 30) + '...' : 'Generated',
                        description: inputs['prompt'] || 'Generated Content',
                        imageUrl: result.imageUrl, thumbnailUrl: result.imageUrl,
                        type: currentModeKey.includes('Video') ? 'video' : 'image',
                        prompt: inputs['prompt'], tags: [currentModeKey, model],
                        isPublic: isPublicResult, aspectRatio: aspectRatio
                    });
                    savedRecordId = savedRecord?.data?.id || savedRecord?.id;
                }
                playSuccess();
                setGlobalGenResult({ url: result.imageUrl, id: savedRecordId || result.id, prompt: inputs['prompt'] });

            } else {
                closeGlobalGen();
                const errorMsg = result.error || 'Unknown error';
                if (errorMsg.toLowerCase().includes('credit') || errorMsg.toLowerCase().includes('balance')) {
                    toast.error('⚠️ Недостаточно средств.', { duration: 5000 });
                } else {
                    toast.error(`Генерация не удалась: ${errorMsg}`);
                }
            }

        } catch (e) {
            console.error(e);
            closeGlobalGen();
            const errorMsg = e.message || 'Unknown error';
            if (errorMsg.toLowerCase().includes('credit') || errorMsg.toLowerCase().includes('balance')) {
                toast.error('⚠️ Ошибка оплаты.', { duration: 5000 });
            } else {
                toast.error('Произошла ошибка.');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const selectedModelData = modeConfig.models?.find(m => m.id === model) || (modeConfig.models ? modeConfig.models[0] : null);

    const ratios = [
        { id: '1:1', label: 'Квадрат' },
        { id: '3:4', label: 'Портрет' },
        { id: '9:16', label: 'Сторис' },
        { id: '4:3', label: 'Классика' },
        { id: '16:9', label: 'Кино' },
    ];

    // --- RENDER MENU VIEW (TOOLS GRID) ---
    if (modeConfig.isMenu) {
        const toolsList = [
            { id: 'replace-object', label: 'ЗАМЕНИТЬ', sub: 'Inpaint', img: '/images/tool_replace.png' },
            { id: 'remove-object', label: 'УДАЛИТЬ', sub: 'Eraser', img: '/images/tool_remove.png' },
            { id: 'add-object', label: 'ДОБАВИТЬ', sub: 'Outpaint', img: '/images/tool_add.png' },
            { id: 'describe', label: 'ОПИСАТЬ', sub: 'Describe', img: '/images/tool_add.png' } // Reuse img for now
        ];

        return (
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-white p-4 pt-16"
            >
                <div className="absolute top-4 right-4 z-50">
                    <button onClick={() => navigate('/')} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
                        <X size={20} className="text-white" />
                    </button>
                </div>

                <h1 className="text-2xl font-black mb-1 uppercase tracking-wide">{t('toolsCard.tools')}</h1>
                <p className="text-slate-500 mb-6 text-sm max-w-xs leading-tight">{modeConfig.desc}</p>

                <div className="grid grid-cols-2 gap-3">
                    {toolsList.map((tool) => (
                        <motion.div
                            key={tool.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleTypeChange(tool.id)}
                            className="relative aspect-[4/5] rounded-3xl overflow-hidden cursor-pointer group shadow-lg"
                        >
                            <img src={tool.img} alt={tool.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                            <div className="absolute bottom-4 left-4 right-4 text-center">
                                <div className="inline-block bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-bold text-white/80 mb-1 uppercase tracking-wider">
                                    {tool.sub}
                                </div>
                                <div className="text-white font-black text-sm uppercase tracking-wider leading-none">{tool.label}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        );
    }

    // --- RENDER FORM VIEW ---
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-white transition-colors duration-300"
        >
            {/* Header */}
            {/* ... (Header remains same, not touching it here as we are replacing footer wrapper largely or just inserting into footer) */}

            {/* ... (We need to keep the structure valid, so I will target specific blocks if possible or just the footer area) */}
            <div className="px-4 py-4 pt-[calc(env(safe-area-inset-top)+10px)] flex items-center justify-between bg-slate-50 dark:bg-[#09090b] sticky top-0 z-40 transition-colors duration-300">
                <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <ChevronLeft size={24} />
                </button>

                <div className="relative">
                    <button
                        onClick={() => setIsTypeOpen(!isTypeOpen)}
                        className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-white bg-slate-100 dark:bg-white/5 py-1.5 px-3 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                    >
                        <modeConfig.icon size={18} className="text-indigo-500 dark:text-indigo-400" />
                        {modeConfig.label}
                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isTypeOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isTypeOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white dark:bg-[#151517] rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden z-50 origin-top h-auto max-h-[60vh] overflow-y-auto"
                            >
                                {Object.values(MODES).filter(m => !m.isMenu).map(mode => (
                                    <button
                                        key={mode.id}
                                        onClick={() => handleTypeChange(mode.id)}
                                        className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${currentModeKey === mode.id ? 'bg-indigo-50 dark:bg-white/5' : ''}`}
                                    >
                                        <mode.icon size={18} className={currentModeKey === mode.id ? 'text-indigo-500' : 'text-slate-400'} />
                                        <span className={`text-sm font-bold ${currentModeKey === mode.id ? 'text-indigo-600 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                            {mode.label}
                                        </span>
                                        {currentModeKey === mode.id && <Check size={14} className="ml-auto text-indigo-500" />}
                                    </button>
                                ))}
                                <div className="border-t border-slate-100 dark:border-white/5 mt-1 pt-1">
                                    <button onClick={() => handleTypeChange('Tools')} className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white">
                                        <Sliders size={18} /> <span className="text-sm font-bold">{t('toolsCard.tools')}</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-36">

                {/* 1. Model Selector (Conditional) */}
                {modeConfig.models && modeConfig.models.length > 1 && (
                    <div className="mb-6 mt-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 block uppercase tracking-wide">Модель</label>
                        <div
                            onClick={() => { setIsModelOpen(!isModelOpen); playClick(); }}
                            className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-4 flex items-center justify-between border border-slate-200 dark:border-white/5 active:scale-[0.98] transition-all cursor-pointer shadow-sm relative overflow-hidden"
                        >
                            <div className="flex items-center gap-3">
                                {selectedModelData && (
                                    <>
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5 overflow-hidden">
                                            {serverConfig?.models?.[model]?.preview ? (
                                                <img src={serverConfig.models[model].preview} className="w-full h-full object-cover" alt="Selected" />
                                            ) : (
                                                selectedModelData.iconChar
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                                {selectedModelData.name}
                                                {selectedModelData.badge && (
                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-yellow-400 text-black flex items-center gap-0.5">
                                                        {selectedModelData.badge.text} {selectedModelData.badge.icon}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 max-w-[200px]">
                                                {selectedModelData.desc}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            <ChevronDown size={16} className={`text-slate-400 dark:text-slate-500 transition-transform ${isModelOpen ? 'rotate-180' : ''}`} />
                        </div>
                        <AnimatePresence>
                            {isModelOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden bg-white dark:bg-[#151517] border border-slate-200 dark:border-white/5 rounded-2xl mt-2 shadow-xl origin-top"
                                >
                                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                                        {modeConfig.models.map(m => (
                                            <div
                                                key={m.id}
                                                onClick={() => { setModel(m.id); setIsModelOpen(false); playClick(); }}
                                                className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${model === m.id ? 'bg-indigo-50/50 dark:bg-indigo-500/10' : ''}`}
                                            >
                                                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5 overflow-hidden relative">
                                                    {serverConfig?.models?.[m.id]?.preview ? (
                                                        <img
                                                            src={serverConfig.models[m.id].preview}
                                                            alt={m.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        m.iconChar
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className={`font-bold text-sm ${model === m.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
                                                            {m.name}
                                                        </span>
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                                                        {m.desc}
                                                    </div>
                                                </div>
                                                {model === m.id && <Check size={16} className="text-indigo-500 flex-shrink-0" />}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* 2. Images (Upload) */}
                {modeConfig.hasImages && (
                    <div className="mb-6">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 block uppercase tracking-wide">
                            {model === 'kling_motion_control' ? 'Исходные файлы' : (modeConfig.uploadLabel || 'Изображения')} <span className="text-amber-500">*</span>
                        </label>

                        {model === 'kling_motion_control' ? (
                            <div className="grid grid-cols-2 gap-3">
                                {/* IMAGE UPLOAD */}
                                <div
                                    onClick={() => refImageInput.current?.click()}
                                    className="h-32 rounded-2xl bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-white/5 border-dashed flex flex-col items-center justify-center p-2 cursor-pointer relative hover:brightness-105 transition-all overflow-hidden"
                                >
                                    <input type="file" accept="image/*" ref={refImageInput} className="hidden" onChange={(e) => e.target.files[0] && setKlingFiles(p => ({ ...p, image: e.target.files[0] }))} />
                                    {klingFiles.image ? (
                                        <>
                                            <img src={URL.createObjectURL(klingFiles.image)} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="ref" />
                                            <div className="z-10 flex flex-col items-center">
                                                <div className="p-1 bg-green-500 rounded-full mb-1"><Check size={12} className="text-white" /></div>
                                                <span className="text-[10px] font-bold text-slate-900 dark:text-white">Фото готово</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-slate-800 flex items-center justify-center mb-2 text-indigo-500">
                                                <div className="font-bold text-lg">📸</div>
                                            </div>
                                            <span className="text-[10px] text-center text-slate-500 dark:text-slate-400">1. Фото<br />Персонажа</span>
                                        </>
                                    )}
                                </div>

                                {/* VIDEO UPLOAD */}
                                <div
                                    onClick={() => refVideoInput.current?.click()}
                                    className="h-32 rounded-2xl bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-white/5 border-dashed flex flex-col items-center justify-center p-2 cursor-pointer relative hover:brightness-105 transition-all overflow-hidden"
                                >
                                    <input type="file" accept="video/*" ref={refVideoInput} className="hidden" onChange={(e) => e.target.files[0] && setKlingFiles(p => ({ ...p, video: e.target.files[0] }))} />
                                    {klingFiles.video ? (
                                        <>
                                            <video src={URL.createObjectURL(klingFiles.video)} className="absolute inset-0 w-full h-full object-cover opacity-50" muted />
                                            <div className="z-10 flex flex-col items-center">
                                                <div className="p-1 bg-green-500 rounded-full mb-1"><Check size={12} className="text-white" /></div>
                                                <span className="text-[10px] font-bold text-slate-900 dark:text-white">Видео готово</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-slate-800 flex items-center justify-center mb-2 text-pink-500">
                                                <div className="font-bold text-lg">🎬</div>
                                            </div>
                                            <span className="text-[10px] text-center text-slate-500 dark:text-slate-400">2. Видео<br />Движения</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* STANDARD UPLOAD */
                            <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-28 h-32 flex-shrink-0 rounded-2xl bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-white/5 border-dashed flex flex-col items-center justify-center text-center p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-[#252528] transition-colors shadow-sm relative group"
                                >
                                    <input type="file" multiple accept={currentModeKey.includes('video') ? "image/*,video/*" : "image/*"} ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-slate-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                        <Upload size={18} className="text-indigo-500 dark:text-slate-400" />
                                    </div>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-500 leading-tight font-medium">Загрузить<br />фото</span>
                                </div>
                                {previewUrls.map((url, idx) => (
                                    <div key={idx} className="w-24 h-32 flex-shrink-0 rounded-2xl bg-slate-200 dark:bg-slate-800 relative overflow-hidden border border-slate-200 dark:border-white/10 group shadow-sm">
                                        {/* Video Preview Support */}
                                        {(url.match(/\.(mp4|mov|webm)$/i) || url.includes('video')) ? (
                                            <video src={url} className="w-full h-full object-cover" muted />
                                        ) : (
                                            <img src={url} className="w-full h-full object-cover" alt="upload" />
                                        )}
                                        <button onClick={(e) => { e.stopPropagation(); handleRemoveImage(idx); }} className="absolute top-1 right-1 bg-white/90 dark:bg-black/90 text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 3. Dynamic Inputs (Prompts) */}
                {modeConfig.inputs && modeConfig.inputs.map(input => (
                    <div key={input.id} className="mb-6">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 block uppercase tracking-wide">
                            {input.label} {input.required && <span className="text-amber-500">*</span>}
                        </label>
                        <div className="relative">
                            <textarea
                                className={`w-full h-32 bg-white dark:bg-[#1c1c1e] rounded-2xl border p-4 text-sm leading-relaxed focus:outline-none focus:border-indigo-500 dark:focus:border-amber-500/50 focus:ring-2 focus:ring-indigo-500/10 dark:focus:ring-amber-500/10 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-900 dark:text-white resize-none shadow-sm ${input.color ? input.color : 'border-slate-200 dark:border-white/5'}`}
                                placeholder={input.placeholder}
                                value={inputs[input.id] || ''}
                                onChange={(e) => setInputs(prev => ({ ...prev, [input.id]: e.target.value }))}
                            />
                            <button className="absolute bottom-3 right-3 text-slate-400 hover:text-indigo-500 dark:text-slate-500 dark:hover:text-white transition-colors">
                                <Sparkles size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {/* 4. Custom Fields */}
                {modeConfig.customFields && (
                    <div className="flex flex-wrap gap-4 mb-8">
                        {modeConfig.customFields.map(field => (
                            <div key={field.id} className="flex-1 min-w-[45%]">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 block uppercase tracking-wide">{field.label}</label>
                                <div className="bg-slate-100 dark:bg-[#1c1c1e] h-[52px] rounded-2xl p-1 flex items-center border border-slate-200 dark:border-white/5">
                                    {field.options.map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => { setCustomValues(prev => ({ ...prev, [field.id]: opt })); playClick(); }}
                                            className={`flex-1 h-full rounded-xl text-xs font-bold transition-all px-1 ${customValues[field.id] === opt ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 5. Ratio & Count */}
                {(modeConfig.hasRatio || modeConfig.hasCount) && (
                    <div className="flex gap-4 mb-8">
                        {modeConfig.hasRatio && (
                            <div className="flex-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 block uppercase tracking-wide">Формат</label>
                                <div
                                    onClick={() => { setIsRatioOpen(!isRatioOpen); playClick(); }}
                                    className="bg-white dark:bg-[#1c1c1e] h-[52px] rounded-2xl px-4 flex items-center justify-between border border-slate-200 dark:border-white/5 active:scale-[0.98] transition-all cursor-pointer shadow-sm relative"
                                >
                                    <span className="font-medium text-sm text-slate-900 dark:text-white">{aspectRatio}</span>
                                    <ChevronDown size={16} className={`text-slate-400 dark:text-slate-500 transition-transform ${isRatioOpen ? 'rotate-180' : ''}`} />
                                </div>
                                <AnimatePresence>
                                    {isRatioOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden bg-white dark:bg-[#151517] border border-slate-200 dark:border-white/5 rounded-2xl mt-2 shadow-xl absolute z-20 w-[90%] left-0"
                                            style={{ width: 'calc(100vw - 40px)' }}
                                        >
                                            <div className="p-2">
                                                {ratios.map(r => (
                                                    <div
                                                        key={r.id}
                                                        onClick={() => { setAspectRatio(r.id); setIsRatioOpen(false); playClick(); }}
                                                        className={`p-3 rounded-xl flex items-center gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${aspectRatio === r.id ? 'bg-indigo-50 dark:bg-white/5' : ''}`}
                                                    >
                                                        <div className="flex-shrink-0 w-12 flex justify-center"><RatioVisual ratio={r.id} /></div>
                                                        <span className={`text-sm font-bold flex-1 ${aspectRatio === r.id ? 'text-indigo-600 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{r.id}</span>
                                                        {aspectRatio === r.id && <Check size={16} className="text-indigo-500" />}
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {modeConfig.hasCount && (
                            <div className="flex-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 block uppercase tracking-wide">Количество</label>
                                <div className="bg-slate-100 dark:bg-[#1c1c1e] h-[52px] rounded-2xl p-1 flex items-center border border-slate-200 dark:border-white/5">
                                    {[1, 2, 4].map(num => (
                                        <button
                                            key={num}
                                            onClick={() => { setGenCount(num); playClick(); }}
                                            className={`flex-1 h-full rounded-xl text-sm font-bold transition-all ${genCount === num ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe-bottom bg-slate-50 dark:bg-[#09090b] border-t border-slate-200 dark:border-white/5 z-[100] pointer-events-auto transition-colors duration-300">

                {/* Public Toggle & Compact Balance */}
                <div className="flex items-center justify-between mb-3 px-2">
                    <div onClick={() => { setIsPublicResult(!isPublicResult); playClick(); }} className="flex items-center gap-2 cursor-pointer opacity-80 hover:opacity-100 transition-opacity group">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isPublicResult ? 'bg-indigo-500 border-indigo-500' : 'border-slate-400 dark:border-slate-500 group-hover:border-indigo-400'}`}>
                            {isPublicResult && <Check size={10} className="text-white" strokeWidth={4} />}
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide group-hover:text-indigo-500 transition-colors">В ленту</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    {/* Cost Pill */}
                    <div className={`px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border flex-shrink-0 min-w-[80px] ${canAfford ? 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400' : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-500'}`}>
                        {cost} <Zap size={16} className={canAfford ? "text-indigo-500 fill-indigo-500" : "fill-current"} />
                    </div>

                    {/* Generate / Pay Button */}
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        disabled={isProcessing}
                        onClick={handleGenerate}
                        className={`flex-1 h-14 rounded-2xl flex items-center justify-center gap-2 shadow-lg font-bold text-base transition-all
                                ${canAfford
                                ? 'bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 shadow-amber-500/20 text-[#321805]'
                                : 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-lg'}
                            `}
                    >
                        {isProcessing ? (
                            <span className="animate-pulse">Creating...</span>
                        ) : canAfford ? (
                            <>
                                <Sparkles size={20} className="text-[#321805]" strokeWidth={2.5} />
                                <span>Генерировать</span>
                            </>
                        ) : (
                            <>
                                <Zap size={20} className="fill-current" />
                                <span>Пополнить</span>
                            </>
                        )}
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

export default GenerationView;
