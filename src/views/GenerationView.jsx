import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    X, ChevronLeft, ChevronDown, Sparkles, Trash2, Check, Upload, Flame,
    Image as ImageIcon, Video, Music, Wand2, Zap, Clock, Search, Sliders, Film, Camera,
    Eraser, Recycle, PlusCircle, User
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSound } from '../context/SoundContext';
import { useToast } from '../context/ToastContext';
import { useUser } from '../context/UserContext';
import { aiService } from '../ai-service';
import galleryAPI from '../lib/galleryAPI';
import GenerationLoader from '../components/GenerationLoader';
import GenerationResult from '../components/GenerationResult';
import InsufficientCreditsModal from '../components/InsufficientCreditsModal';

import { MODEL_CATALOG } from '../config/models';

// --- Visual Components ---
const RatioVisual = ({ ratio }) => {
    const getDims = (r) => {
        switch (r) {
            case '1:1': return { w: 32, h: 32, labelW: 1, labelH: 1 };
            case '3:4': return { w: 24, h: 32, labelW: 3, labelH: 4 };
            case '9:16': return { w: 18, h: 32, labelW: 9, labelH: 16 };
            case '4:3': return { w: 32, h: 24, labelW: 4, labelH: 3 };
            case '16:9': return { w: 32, h: 18, labelW: 16, labelH: 9 };
            default: return { w: 32, h: 32, labelW: 1, labelH: 1 };
        }
    };
    const { w, h, labelW, labelH } = getDims(ratio);

    return (
        <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="border border-white/60 rounded-sm bg-white/10 transition-all shadow-[0_0_10px_rgba(255,255,255,0.1)]" style={{ width: w, height: h }} />
            <div className="absolute -bottom-1.5 w-full flex justify-center items-center gap-1">
                <span className="text-[6px] font-bold text-white/40">{labelW}</span>
            </div>
            <div className="absolute -right-1.5 h-full flex flex-col justify-center items-center gap-0.5">
                <span className="text-[6px] font-bold text-white/40 my-0.5">{labelH}</span>
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
    'avatar-gen': {
        id: 'avatar-gen',
        label: 'AI Avatar',
        icon: User,
        hasImages: true,
        hasAudio: true,
        hasRatio: false,
        inputs: [
            { id: 'prompt', label: t('creation.describe'), placeholder: 'Введите текст или оставьте пустым', type: 'textarea' }
        ],
        models: [
            { id: 'ai_avatar_standard', name: 'Avatar Standard', desc: 'Talking Head', iconChar: 'A', badge: { text: 'NEW', icon: '✨' } },
            { id: 'ai_avatar_pro', name: 'Avatar Pro', desc: 'High Fidelity', iconChar: 'P', badge: { text: 'PRO', icon: '💎' } }
        ]
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
            { id: 'nano_banana', name: 'Nano Banana', desc: 'Fastest', iconChar: '🍌' },
            { id: 'nano_banana_pro', name: 'Nano Banana Pro', desc: 'Fast & Sharp', iconChar: '🍌', badge: { text: 'PRO', icon: '⚡' } },
            { id: 'seedream_45_text', name: 'Seedream 4.5', desc: 'Balanced', iconChar: 'S' },
            { id: 'gpt_image_15_text', name: 'GPT Image 1.5', desc: 'Coherence', iconChar: 'G' },
            { id: 'flux_flex', name: 'Flux 2.1', desc: 'Realistic', iconChar: 'F' },
            { id: 'grok_text', name: 'Grok 2', desc: 'Creative', iconChar: 'X' }
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
            { id: 'prompt', label: t('creation.describe'), placeholder: t('creation.placeholder'), type: 'textarea', required: false }
        ],
        families: [
            {
                id: 'wan',
                name: 'Wan (Alibaba)',
                desc: 'Cinematic Quality',
                iconChar: 'W',
                tasks: [
                    {
                        id: 'wan_2_6_text', label: '2.6 Text to Video',
                        req: { text: true },
                        pricing: (res, dur) => (dur === '10s' ? 140 : 70)
                    },
                    {
                        id: 'wan_2_6_video', label: '2.6 Video to Video',
                        req: { text: true, video: true },
                        pricing: (res, dur) => (dur === '10s' ? 140 : 70)
                    },
                    {
                        id: 'wan_2_5_image', label: '2.5 Image to Video',
                        req: { text: true, image: true },
                        pricing: (res, dur) => {
                            const sec = parseInt(dur) || 5;
                            const rate = res === '1080p' ? 20 : 12.5;
                            return Math.ceil(rate * sec);
                        }
                    },
                    {
                        id: 'wan_2_5_text', label: '2.5 Text to Video',
                        req: { text: true },
                        pricing: (res, dur) => {
                            const sec = parseInt(dur) || 5;
                            const rate = res === '1080p' ? 20 : 12.5;
                            return Math.ceil(rate * sec);
                        }
                    },
                    {
                        id: 'wan_turbo_text', label: '2.2 Text Turbo',
                        req: { text: true },
                        pricing: (res, dur) => {
                            const sec = parseInt(dur) || 5;
                            let rate = 8;
                            if (res === '720p') rate = 16;
                            return Math.ceil(rate * sec);
                        }
                    },
                    {
                        id: 'wan_turbo_image', label: '2.2 Image Turbo',
                        req: { text: true, image: true },
                        pricing: (res, dur) => {
                            const sec = parseInt(dur) || 5;
                            let rate = 8;
                            if (res === '720p') rate = 16;
                            return Math.ceil(rate * sec);
                        }
                    },
                    {
                        id: 'wan_turbo_speech', label: '2.2 Speech Turbo',
                        req: { text: false, image: true, audio: true },
                        pricing: (res, dur) => {
                            const sec = parseInt(dur) || 5;
                            let rate = 12; // 480p default
                            if (res === '720p') rate = 24;
                            return Math.ceil(rate * sec);
                        }
                    }
                ]
            },
            {
                id: 'kling',
                name: 'Kling AI',
                desc: 'Realism & Motion',
                iconChar: 'K',
                tasks: [
                    // ВРЕМЕННО ОТКЛЮЧЕНО: Kling 2.6 не работает через Kie.ai API
                    // {
                    //     id: 'kling_2_6_text', label: '2.6 Text to Video',
                    //     req: { text: true },
                    //     pricing: (res, dur) => (dur === '10s' ? 120 : 60)
                    // },
                    // {
                    //     id: 'kling_2_6_image', label: '2.6 Image to Video',
                    //     req: { text: true, image: true },
                    //     pricing: (res, dur) => (dur === '10s' ? 120 : 60)
                    // },
                    {
                        id: 'kling_2_5_turbo_image_pro', label: 'Turbo Image to Video',
                        req: { text: true, image: true },
                        pricing: (res, dur) => (dur === '10s' ? 100 : 50)
                    },
                ]
            },
            {
                id: 'seedance',
                name: 'Seedance / BD',
                desc: 'Creative & Fast',
                iconChar: 'S',
                tasks: [
                    {
                        id: 'seedance_pro', label: 'Seedance 1.5 Pro',
                        req: { text: true, audio_toggle: true },
                        pricing: (res, dur, extra) => {
                            const sec = parseInt(dur) || 5;
                            let base = sec <= 5 ? 55 : 110;
                            if (extra?.generate_audio) base *= 2;
                            return base;
                        }
                    },
                    {
                        id: 'bytedance_fast', label: 'Fast Image to Video',
                        req: { text: false, image: true },
                        pricing: (res, dur) => {
                            const is1080 = res === '1080p';
                            const is10s = dur === '10s';
                            if (is1080) return is10s ? 72 : 36;
                            return is10s ? 36 : 16;
                        }
                    }
                ]
            },
            {
                id: 'hailuo',
                name: 'Hailuo',
                desc: 'Minimax',
                iconChar: 'H',
                tasks: [
                    {
                        id: 'hailuo_2_3_image_pro', label: '2.1 Image to Video',
                        req: { text: true, image: true },
                        pricing: () => 50
                    }
                ]
            },
            {
                id: 'google',
                name: 'Google Veo',
                desc: 'Cinematic',
                iconChar: 'V',
                tasks: [
                    {
                        id: 'veo_3', label: 'Veo 3.1',
                        req: { text: true },
                        pricing: () => 70
                    }
                ]
            }
        ],
        customFields: [
            {
                id: 'resolution',
                label: 'Разрешение',
                type: 'selector',
                options: ['720p', '1080p'],
                condition: (modelId) => !modelId.includes('hailuo') // Hailuo doesn't support resolution
            },
            { id: 'duration', label: 'Длительность', type: 'selector', options: ['5s', '10s'] },
            { id: 'generate_audio', label: 'Генерировать звук', type: 'toggle', options: [t('profile.on'), t('profile.off')], condition: (m) => m === 'seedance_pro' }
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
    const [showCreditModal, setShowCreditModal] = useState(false);

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
    const [avatarFiles, setAvatarFiles] = useState({ image: null, audio: null });
    const refImageInput = useRef(null);
    const refVideoInput = useRef(null);
    const refAudioInput = useRef(null);

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
        updateStats,
        refreshUser,
        startGlobalGen,
        setGlobalGenResult,
        closeGlobalGen
    } = useUser();

    // Helper to find selected task in families
    const activeFamily = modeConfig.families?.find(f => f.tasks.some(t => t.id === model));
    const activeTask = activeFamily?.tasks?.find(t => t.id === model);

    // Cost Calculation Logic
    const getCost = () => {
        // 1. Video Gen Dynamic Pricing
        if (currentModeKey === 'video-gen' && activeTask?.pricing) {
            return activeTask.pricing(
                customValues.resolution || '720p',
                customValues.duration || '5s',
                customValues // Pass full custom values for extras like audio
            ) * genCount;
        }

        // 2. Try server/loaded config first (dynamic overrides from DB)
        if (serverConfig && serverConfig.models && serverConfig.models[model]) {
            let cost = serverConfig.models[model].cost;
            return cost * genCount;
        }

        // 3. Try Local Config
        if (MODEL_CATALOG[model]) {
            return MODEL_CATALOG[model].cost * genCount;
        }

        // 4. Fallbacks
        if (['replace-object', 'remove-object', 'add-object'].includes(currentModeKey)) return (MODEL_CATALOG['replace_object']?.cost || 20) * genCount;
        if (currentModeKey === 'describe') return 1;

        return 5 * genCount;
    };

    const cost = getCost();
    const canAfford = (userStats?.current_balance || 0) >= cost;

    // Derived flags for UI
    const showPrompt = activeTask ? activeTask.req?.text !== false : true; // Default true if no specific req
    const showImageUpload = activeTask ? activeTask.req?.image : modeConfig.hasImages;
    const showVideoUpload = activeTask ? activeTask.req?.video : (model === 'kling_motion_control');
    const showAudioUpload = activeTask ? activeTask.req?.audio : false;

    const handleGenerate = async () => {
        const requiredInputs = modeConfig.inputs?.filter(i => i.required) || [];
        for (const input of requiredInputs) {
            // Skip prompt check if prompt is hidden
            if (input.id === 'prompt' && !showPrompt) continue;

            if (!inputs[input.id]?.trim()) {
                toast.error(`Пожалуйста, заполните ${input.label}`);
                return;
            }
        }

        if (showImageUpload && selectedImages.length === 0 && !klingFiles.image && !avatarFiles.image) {
            // Strict check only if "req: { image: true }"
            // But some modes like Seedance Pro image is optional? No, in my config I set it.
            // If Seedance has req:{text:true}, then image is NOT required unless req:{image:true}.
            if (activeTask?.req?.image) {
                toast.error('Пожалуйста, загрузите изображение');
                return;
            }
        }

        if (activeTask?.req?.video && !klingFiles.video) {
            toast.error('Пожалуйста, загрузите видео');
            return;
        }

        if (!canAfford) {
            playClick();
            setShowCreditModal(true);
            return;
        }

        playClick();
        setIsProcessing(true);
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('success'); // "Magic" feel start
        }

        startGlobalGen(
            currentModeKey.includes('video') ? 'video' : 'image',
            currentModeKey.includes('video') ? (model.includes('kling') ? 120 : 60) : 15
        );

        // Optimistic Deduction for immediate feedback
        if (userStats) {
            updateStats({ current_balance: userStats.current_balance - cost });
        }

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
                let audioFiles = null;

                // Handle Special File Inputs
                if (showVideoUpload && klingFiles.video) {
                    videoFiles = [klingFiles.video];
                }
                if (showImageUpload && klingFiles.image) {
                    // If we used the special uploader
                    sourceFiles = [klingFiles.image];
                }

                // Kling Motion Specifics (Legacy/Specific check)
                if (model === 'kling_motion_control') {
                    if (klingFiles.image && klingFiles.video) {
                        sourceFiles = [klingFiles.image];
                        videoFiles = [klingFiles.video];
                    } else {
                        toast.error('Загрузите фото и видео!');
                        setIsProcessing(false); closeGlobalGen(); return;
                    }
                } else if (currentModeKey === 'avatar-gen') {
                    if (avatarFiles.image && avatarFiles.audio) {
                        sourceFiles = [avatarFiles.image];
                        audioFiles = [avatarFiles.audio];
                    } else {
                        toast.error('Загрузите фото и аудио для Аватара!');
                        setIsProcessing(false); closeGlobalGen(); return;
                    }
                }

                result = await aiService.generateImage(promptText, model, {
                    aspectRatio, count: genCount, source_files: sourceFiles, video_files: videoFiles, audio_files: audioFiles,
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
                if (result.newBalance !== undefined) updateStats({ current_balance: result.newBalance });
                setGlobalGenResult({ url: result.imageUrl, id: savedRecordId || result.id, prompt: inputs['prompt'] });

            } else {
                closeGlobalGen();
                refreshUser();
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
            refreshUser();
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
                className="min-h-screen bg-[#0f0f10] text-white p-4 pt-16 relative overflow-hidden"
            >
                {/* Background Blobs */}
                <div className="fixed -top-20 -left-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="fixed top-40 -right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />

                <div className="absolute top-4 right-4 z-50">
                    <button onClick={() => navigate('/')} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors">
                        <X size={20} className="text-white" />
                    </button>
                </div>

                <h1 className="text-3xl font-black mb-2 uppercase tracking-tight bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">{t('toolsCard.tools')}</h1>
                <p className="text-white/50 mb-8 text-sm max-w-xs leading-relaxed font-medium">{modeConfig.desc}</p>

                <div className="grid grid-cols-2 gap-4">
                    {toolsList.map((tool) => (
                        <motion.div
                            key={tool.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleTypeChange(tool.id)}
                            className="relative aspect-[4/5] rounded-[2rem] overflow-hidden cursor-pointer group shadow-2xl shadow-black/20 border border-white/10"
                        >
                            <img src={tool.img} alt={tool.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-80" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                            <div className="absolute bottom-5 left-5 right-5">
                                <div className="inline-block bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold text-white/90 mb-2 uppercase tracking-widest border border-white/10">
                                    {tool.sub}
                                </div>
                                <div className="text-white font-black text-xl uppercase tracking-wide leading-none">{tool.label}</div>
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
            <div className="px-4 py-4 pt-[calc(env(safe-area-inset-top)+10px)] flex items-center justify-between sticky top-0 z-40 backdrop-blur-xl bg-[#0f0f10]/80 border-b border-white/5">
                <div className="w-10" />

                <div className="relative">
                    <button
                        onClick={() => setIsTypeOpen(!isTypeOpen)}
                        className="flex items-center gap-2.5 font-bold text-sm text-white bg-white/5 py-2 px-4 rounded-2xl hover:bg-white/10 transition-all border border-white/5 backdrop-blur-md shadow-lg shadow-black/10"
                    >
                        <modeConfig.icon size={16} className="text-indigo-400" />
                        <span className="tracking-wide uppercase text-[11px]">{modeConfig.label}</span>
                        <ChevronDown size={12} className={`text-white/40 transition-transform ${isTypeOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isTypeOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 bg-[#151517]/95 rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50 origin-top h-auto max-h-[60vh] overflow-y-auto backdrop-blur-2xl ring-1 ring-black/50"
                            >
                                {Object.values(MODES).filter(m => !m.isMenu).map(mode => (
                                    <button
                                        key={mode.id}
                                        onClick={() => handleTypeChange(mode.id)}
                                        className={`w-full text-left px-4 py-3.5 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${currentModeKey === mode.id ? 'bg-indigo-500/10' : ''}`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentModeKey === mode.id ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-white/40'}`}>
                                            <mode.icon size={16} />
                                        </div>
                                        <span className={`text-xs font-bold uppercase tracking-wide ${currentModeKey === mode.id ? 'text-indigo-400' : 'text-white/70'}`}>
                                            {mode.label}
                                        </span>
                                        {currentModeKey === mode.id && <Check size={14} className="ml-auto text-indigo-500" />}
                                    </button>
                                ))}
                                <div className="bg-white/5 mt-0">
                                    <button onClick={() => handleTypeChange('Tools')} className="w-full text-left px-4 py-3.5 flex items-center gap-3 hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                            <Sliders size={16} />
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-wide">{t('toolsCard.tools')}</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all border border-white/5">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-36">

                {/* 1. Model Selector (Hierarchical or Simple) */}
                {modeConfig.families ? (
                    <div className="mb-6 mt-2 space-y-4">
                        {/* Family Selector */}
                        <div>
                            <label className="text-xs font-bold text-white/50 mb-2.5 block uppercase tracking-wide ml-1">Провайдер</label>
                            <div className="grid grid-cols-2 gap-2">
                                {modeConfig.families.map(fam => {
                                    const isActive = (modeConfig.families.find(f => f.tasks.some(t => t.id === model))?.id === fam.id) || (model === '' && fam.id === 'wan');
                                    return (
                                        <div
                                            key={fam.id}
                                            onClick={() => {
                                                // Select first task of this family
                                                setModel(fam.tasks[0].id);
                                                playClick();
                                            }}
                                            className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 relative overflow-hidden ${isActive ? 'bg-indigo-500/20 border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg ${isActive ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white/40'}`}>
                                                {fam.iconChar}
                                            </div>
                                            <div>
                                                <div className={`text-xs font-bold uppercase ${isActive ? 'text-indigo-300' : 'text-white/80'}`}>{fam.name}</div>
                                                <div className="text-[9px] text-white/40">{fam.desc}</div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Task Selector (Based on active family) */}
                        <div>
                            <label className="text-xs font-bold text-white/50 mb-2.5 block uppercase tracking-wide ml-1">Режим генерации</label>
                            <div className="flex flex-col gap-2">
                                {modeConfig.families.find(f => f.tasks.some(t => t.id === model))?.tasks.map(task => {
                                    // Use new dynamic cost
                                    const calcCost = task.pricing ? task.pricing(customValues?.resolution, customValues?.duration, customValues) : task.cost;
                                    return (
                                        <div
                                            key={task.id}
                                            onClick={() => { setModel(task.id); playClick(); }}
                                            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${model === task.id ? 'bg-white/10 border-indigo-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${model === task.id ? 'border-indigo-500' : 'border-white/20'}`}>
                                                    {model === task.id && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                                                </div>
                                                <span className={`text-xs font-medium ${model === task.id ? 'text-white' : 'text-white/60'}`}>{task.label}</span>
                                            </div>
                                            {task.req?.image && <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded uppercase font-bold tracking-wider">Image</span>}
                                            <div className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded text-[10px] font-mono text-white/50">
                                                <Zap size={10} className={model === task.id ? 'text-amber-400' : 'text-white/20'} />
                                                {calcCost} CR
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Standard Dropdown for non-video modes (Image/Audio/etc) */
                    (modeConfig.models && modeConfig.models.length > 1) && (
                        <div className="mb-6 mt-2">
                            <label className="text-xs font-bold text-white/50 mb-2.5 block uppercase tracking-wide ml-1">Модель</label>
                            <div
                                onClick={() => { setIsModelOpen(!isModelOpen); playClick(); }}
                                className="bg-white/5 backdrop-blur-xl rounded-[1.2rem] p-3 flex items-center justify-between border border-white/10 active:scale-[0.99] transition-all cursor-pointer shadow-lg shadow-black/5 relative overflow-hidden group hover:bg-white/10"
                            >
                                <div className="flex items-center gap-3.5">
                                    {selectedModelData && (
                                        <>
                                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-lg font-bold text-white border border-white/10 overflow-hidden shadow-inner">
                                                {serverConfig?.models?.[model]?.preview ? (
                                                    <img src={serverConfig.models[model].preview} className="w-full h-full object-cover" alt="Selected" />
                                                ) : (
                                                    selectedModelData.iconChar
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-white flex items-center gap-2">
                                                    {selectedModelData.name}
                                                    {selectedModelData.badge && (
                                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500 text-black flex items-center gap-0.5 shadow-sm shadow-amber-500/20">
                                                            {selectedModelData.badge.text} {selectedModelData.badge.icon}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-white/40 leading-tight mt-0.5 max-w-[200px]">
                                                    {selectedModelData.desc}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                                    <ChevronDown size={16} className={`text-white/50 transition-transform duration-300 ${isModelOpen ? 'rotate-180' : ''}`} />
                                </div>
                            </div>
                            <AnimatePresence>
                                {isModelOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0, y: -10 }}
                                        animate={{ height: 'auto', opacity: 1, y: 0 }}
                                        exit={{ height: 0, opacity: 0, y: -10 }}
                                        className="overflow-hidden bg-[#151517]/95 backdrop-blur-2xl border border-white/10 rounded-2xl mt-2 shadow-2xl origin-top ring-1 ring-black/50"
                                    >
                                        <div className="max-h-[300px] overflow-y-auto p-1.5 space-y-1">
                                            {modeConfig.models.map(m => (
                                                <div
                                                    key={m.id}
                                                    onClick={() => { setModel(m.id); setIsModelOpen(false); playClick(); }}
                                                    className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all border border-transparent ${model === m.id ? 'bg-indigo-500/20 border-indigo-500/30' : 'hover:bg-white/5 hover:border-white/5'}`}
                                                >
                                                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold border overflow-hidden relative ${model === m.id ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/20' : 'bg-white/5 text-white/50 border-white/5'}`}>
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
                                                            <span className={`font-bold text-xs uppercase tracking-wide ${model === m.id ? 'text-indigo-400' : 'text-white/90'}`}>
                                                                {m.name}
                                                            </span>
                                                        </div>
                                                        <div className="text-[9px] text-white/40 leading-tight">
                                                            {m.desc}
                                                        </div>
                                                    </div>
                                                    {model === m.id && <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center"><Check size={10} className="text-white" /></div>}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )
                )}

                {/* 2. Images (Upload) - Glassy */}
                {modeConfig.hasImages && (
                    <div className="mb-6">
                        <label className="text-xs font-bold text-white/50 mb-2.5 block uppercase tracking-wide ml-1">
                            {model === 'kling_motion_control' ? 'Исходные файлы' : (modeConfig.uploadLabel || 'Изображения')} <span className="text-amber-500">*</span>
                        </label>

                        {model === 'kling_motion_control' ? (
                            <div className="grid grid-cols-2 gap-3">
                                {/* IMAGE UPLOAD */}
                                <div
                                    onClick={() => refImageInput.current?.click()}
                                    className="h-32 rounded-[1.2rem] bg-white/5 border border-white/10 border-dashed flex flex-col items-center justify-center p-2 cursor-pointer relative hover:bg-white/10 transition-all overflow-hidden group"
                                >
                                    <input type="file" accept="image/*" ref={refImageInput} className="hidden" onChange={(e) => e.target.files[0] && setKlingFiles(p => ({ ...p, image: e.target.files[0] }))} />
                                    {klingFiles.image ? (
                                        <>
                                            <img src={URL.createObjectURL(klingFiles.image)} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" alt="ref" />
                                            <div className="z-10 flex flex-col items-center">
                                                <div className="p-1 bg-green-500 rounded-full mb-1 shadow-lg shadow-green-500/20"><Check size={12} className="text-white" /></div>
                                                <span className="text-[10px] font-bold text-white shadow-black/50 drop-shadow-md">Фото готово</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 text-indigo-400 border border-white/5">
                                                <Camera size={20} />
                                            </div>
                                            <span className="text-[10px] text-center text-white/40 group-hover:text-white/70 transition-colors">1. Фото<br />Персонажа</span>
                                        </>
                                    )}
                                </div>

                                {/* VIDEO UPLOAD */}
                                <div
                                    onClick={() => refVideoInput.current?.click()}
                                    className="h-32 rounded-[1.2rem] bg-white/5 border border-white/10 border-dashed flex flex-col items-center justify-center p-2 cursor-pointer relative hover:bg-white/10 transition-all overflow-hidden group"
                                >
                                    <input type="file" accept="video/*" ref={refVideoInput} className="hidden" onChange={(e) => e.target.files[0] && setKlingFiles(p => ({ ...p, video: e.target.files[0] }))} />
                                    {klingFiles.video ? (
                                        <>
                                            <video src={URL.createObjectURL(klingFiles.video)} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" muted />
                                            <div className="z-10 flex flex-col items-center">
                                                <div className="p-1 bg-green-500 rounded-full mb-1 shadow-lg shadow-green-500/20"><Check size={12} className="text-white" /></div>
                                                <span className="text-[10px] font-bold text-white shadow-black/50 drop-shadow-md">Видео готово</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 text-pink-400 border border-white/5">
                                                <Video size={20} />
                                            </div>
                                            <span className="text-[10px] text-center text-white/40 group-hover:text-white/70 transition-colors">2. Видео<br />Движения</span>
                                        </>
                                    )}
                                </div>
                            </div>

                        ) : currentModeKey === 'avatar-gen' ? (
                            /* AVATAR UPLOAD UI */
                            <div className="grid grid-cols-2 gap-3">
                                {/* IMAGE UPLOAD */}
                                <div
                                    onClick={() => refImageInput.current?.click()}
                                    className="h-32 rounded-[1.2rem] bg-white/5 border border-white/10 border-dashed flex flex-col items-center justify-center p-2 cursor-pointer relative hover:bg-white/10 transition-all overflow-hidden group"
                                >
                                    <input type="file" accept="image/*" ref={refImageInput} className="hidden" onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setAvatarFiles(p => ({ ...p, image: file }));
                                            setSelectedImages([file]);
                                            setPreviewUrls([URL.createObjectURL(file)]);
                                        }
                                    }} />
                                    {avatarFiles.image ? (
                                        <>
                                            <img src={URL.createObjectURL(avatarFiles.image)} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="avatar" />
                                            <div className="z-10 flex flex-col items-center">
                                                <div className="p-1 bg-green-500 rounded-full mb-1"><Check size={12} className="text-white" /></div>
                                                <span className="text-[10px] font-bold text-white">Аватар готов</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 text-indigo-400 border border-white/5">
                                                <User size={20} />
                                            </div>
                                            <span className="text-[10px] text-center text-white/40 group-hover:text-white/70 transition-colors">1. Лицо<br />Аватара</span>
                                        </>
                                    )}
                                </div>

                                {/* AUDIO UPLOAD */}
                                <div
                                    onClick={() => refAudioInput.current?.click()}
                                    className="h-32 rounded-[1.2rem] bg-white/5 border border-white/10 border-dashed flex flex-col items-center justify-center p-2 cursor-pointer relative hover:bg-white/10 transition-all overflow-hidden group"
                                >
                                    <input type="file" accept="audio/*" ref={refAudioInput} className="hidden" onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const audio = new Audio(URL.createObjectURL(file));
                                            audio.onloadedmetadata = () => {
                                                if (audio.duration > 15) {
                                                    toast.error('Audio cannot exceed 15s');
                                                    return;
                                                }
                                                setAvatarFiles(p => ({ ...p, audio: file }));
                                            };
                                        }
                                    }} />
                                    {avatarFiles.audio ? (
                                        <>
                                            <div className="absolute inset-0 bg-indigo-500/10 flex items-center justify-center">
                                                <div className="w-full h-1 bg-indigo-500/20 mx-4 overflow-hidden rounded-full">
                                                    <div className="h-full bg-indigo-500 w-1/2 animate-pulse" />
                                                </div>
                                            </div>
                                            <div className="z-10 flex flex-col items-center">
                                                <div className="p-1 bg-green-500 rounded-full mb-1"><Check size={12} className="text-white" /></div>
                                                <span className="text-[10px] font-bold text-white">Аудио готово</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 text-pink-400 border border-white/5">
                                                <Music size={20} />
                                            </div>
                                            <span className="text-[10px] text-center text-white/40 group-hover:text-white/70 transition-colors">2. Голос<br />(Аудио)</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* STANDARD UPLOAD */
                            <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-28 h-32 flex-shrink-0 rounded-[1.2rem] bg-white/5 border border-white/10 border-dashed flex flex-col items-center justify-center text-center p-3 cursor-pointer hover:bg-white/10 transition-colors shadow-sm relative group"
                                >
                                    <input type="file" multiple accept={currentModeKey.includes('video') ? "image/*,video/*" : "image/*"} ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform border border-white/5">
                                        <Upload size={18} className="text-indigo-400" />
                                    </div>
                                    <span className="text-[10px] text-white/40 leading-tight font-medium group-hover:text-white/70 transition-colors">Загрузить<br />файлы</span>
                                </div>
                                {previewUrls.map((url, idx) => (
                                    <div key={idx} className="w-24 h-32 flex-shrink-0 rounded-[1.2rem] bg-white/5 relative overflow-hidden border border-white/10 group shadow-sm">
                                        {/* Video Preview Support */}
                                        {(url.match(/\.(mp4|mov|webm)$/i) || url.includes('video')) ? (
                                            <video src={url} className="w-full h-full object-cover opacity-80" muted />
                                        ) : (
                                            <img src={url} className="w-full h-full object-cover opacity-80" alt="upload" />
                                        )}
                                        <button onClick={(e) => { e.stopPropagation(); handleRemoveImage(idx); }} className="absolute top-1 right-1 bg-black/50 backdrop-blur-md text-white/70 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 hover:bg-red-500 hover:text-white">
                                            <Trash2 size={10} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 3. Dynamic Inputs (Prompts) */}
                {/* 3. Dynamic Inputs (Prompts) - premium glass style */}
                {modeConfig.inputs && modeConfig.inputs.map(input => (
                    <div key={input.id} className="mb-6">
                        <label className="text-xs font-bold text-white/50 mb-2.5 block uppercase tracking-wide ml-1">
                            {input.label} {input.required && <span className="text-amber-500">*</span>}
                        </label>
                        <div className="relative group">
                            <textarea
                                className={`w-full h-32 bg-white/5 backdrop-blur-md rounded-[1.2rem] border p-4 text-sm leading-relaxed focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all placeholder:text-white/20 text-white resize-none shadow-inner ${input.color ? input.color : 'border-white/10'}`}
                                placeholder={input.placeholder}
                                value={inputs[input.id] || ''}
                                onChange={(e) => setInputs(prev => ({ ...prev, [input.id]: e.target.value }))}
                            />
                            <div className="absolute -bottom-px -left-px -right-px h-12 bg-gradient-to-t from-black/20 to-transparent pointer-events-none rounded-b-[1.2rem]" />
                            <button className="absolute bottom-3 right-3 text-white/30 hover:text-indigo-400 transition-colors bg-white/5 p-2 rounded-lg border border-white/5 hover:bg-white/10">
                                <Sparkles size={16} />
                            </button>
                        </div>
                    </div>
                ))}


                {/* 4. Custom Fields (Glassy Pills) */}
                {modeConfig.customFields && (
                    <div className="flex flex-wrap gap-4 mb-8">
                        {modeConfig.customFields
                            .filter(field => !field.condition || field.condition(model))
                            .map(field => (
                                <div key={field.id} className="flex-1 min-w-[45%]">
                                    <label className="text-xs font-bold text-white/50 mb-2.5 block uppercase tracking-wide ml-1">{field.label}</label>
                                    <div className="bg-white/5 h-[52px] rounded-[1.2rem] p-1 flex items-center border border-white/5 backdrop-blur-md">
                                        {field.options.map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => { setCustomValues(prev => ({ ...prev, [field.id]: opt })); playClick(); }}
                                                className={`flex-1 h-full rounded-[1rem] text-[10px] sm:text-xs font-bold transition-all px-1 ${customValues[field.id] === opt ? 'bg-white/10 text-white shadow-sm border border-white/5' : 'text-white/30 hover:text-white/60'}`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                    </div>
                )}

                {/* 5. Ratio & Count (Glassy) */}
                {(modeConfig.hasRatio || modeConfig.hasCount) && (
                    <div className="flex gap-4 mb-8">
                        {modeConfig.hasRatio && (
                            <div className="flex-1 relative">
                                <label className="text-xs font-bold text-white/50 mb-2.5 block uppercase tracking-wide ml-1">Формат</label>
                                <div
                                    onClick={() => { setIsRatioOpen(!isRatioOpen); playClick(); }}
                                    className="bg-white/5 h-[52px] rounded-[1.2rem] px-4 flex items-center justify-between border border-white/10 active:scale-[0.98] transition-all cursor-pointer shadow-sm hover:bg-white/10 backdrop-blur-md"
                                >
                                    <span className="font-bold text-sm text-white/90">{aspectRatio}</span>
                                    <ChevronDown size={16} className={`text-white/50 transition-transform ${isRatioOpen ? 'rotate-180' : ''}`} />
                                </div>
                                <AnimatePresence>
                                    {isRatioOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0, y: -10 }}
                                            animate={{ height: 'auto', opacity: 1, y: 0 }}
                                            exit={{ height: 0, opacity: 0, y: -10 }}
                                            className="overflow-hidden bg-[#151517]/95 backdrop-blur-2xl border border-white/10 rounded-2xl mt-2 shadow-2xl absolute z-50 left-0 right-0 ring-1 ring-black/50"
                                        >
                                            <div className="p-2 grid grid-cols-1 divide-y divide-white/5">
                                                {ratios.map(r => (
                                                    <div
                                                        key={r.id}
                                                        onClick={() => { setAspectRatio(r.id); setIsRatioOpen(false); playClick(); }}
                                                        className={`p-3.5 rounded-xl flex items-center gap-4 cursor-pointer transition-colors ${aspectRatio === r.id ? 'bg-indigo-500/20' : 'hover:bg-white/5'}`}
                                                    >
                                                        <div className="flex-shrink-0 w-8 flex justify-center opacity-60"><RatioVisual ratio={r.id} /></div>
                                                        <span className={`text-sm font-bold flex-1 uppercase tracking-wide ${aspectRatio === r.id ? 'text-indigo-400' : 'text-white/70'}`}>{r.id}</span>
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
                                <label className="text-xs font-bold text-white/50 mb-2 block uppercase tracking-wide ml-1">Количество</label>
                                <div className="bg-white/5 h-[52px] rounded-[1.2rem] p-1 flex items-center border border-white/10 backdrop-blur-md">
                                    {[1, 2, 4].map(num => (
                                        <button
                                            key={num}
                                            onClick={() => { setGenCount(num); playClick(); }}
                                            className={`flex-1 h-full rounded-[1rem] text-sm font-bold transition-all ${genCount === num ? 'bg-white/10 text-white shadow-sm border border-white/5' : 'text-white/30 hover:text-white/60'}`}
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
            {/* Footer (Premium Glass Dock) */}
            <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe-bottom bg-[#0f0f10]/90 backdrop-blur-2xl border-t border-white/5 z-[100] transition-colors duration-300">

                {/* Action Bar */}
                <div className="flex items-center gap-3">
                    {/* Cost Indicator & Balance */}
                    <div className="flex flex-col gap-1">
                        <div className={`h-14 px-5 rounded-[1.2rem] font-black text-sm flex items-center justify-center gap-2 border min-w-[90px] backdrop-blur-md transition-colors ${canAfford ? 'bg-white/5 border-white/10 text-white/80' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                            <span className="text-lg">{cost}</span>
                            <Zap size={18} className={canAfford ? "fill-indigo-400 text-indigo-400" : "fill-current"} />
                        </div>
                    </div>

                    {/* Generate Button (Gradient Glass) */}
                    {/* Generate Button (Gradient Glass) */}
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        whileHover={{ scale: 1.02 }}
                        disabled={isProcessing}
                        onClick={handleGenerate}
                        className={`flex-1 h-14 rounded-[1.2rem] flex items-center justify-center gap-3 shadow-xl font-black text-base transition-all relative overflow-hidden
                            ${canAfford
                                ? 'bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 shadow-amber-500/20 text-[#321805]'
                                : 'bg-white/5 text-white/40 border border-white/5 cursor-not-allowed'}
                        `}
                    >
                        {/* Shimmer Effect */}
                        {canAfford && !isProcessing && (
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000" />
                        )}

                        {isProcessing ? (
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-3 border-current border-t-transparent rounded-full animate-spin" />
                                <span>Creating...</span>
                            </div>
                        ) : canAfford ? (
                            <>
                                <Sparkles size={20} className="text-[#321805]" strokeWidth={2.5} />
                                <span className="tracking-wide">ГЕНЕРИРОВАТЬ ({cost})</span>
                            </>
                        ) : (
                            <>
                                <Zap size={20} className="fill-current" />
                                <span>ПОПОЛНИТЬ ({cost})</span>
                            </>
                        )}
                    </motion.button>
                </div>

                {/* Public Toggle (Below) */}
                <div className="mt-3 flex justify-center">
                    <div onClick={() => { setIsPublicResult(!isPublicResult); playClick(); }} className="flex items-center gap-2 cursor-pointer group py-2 px-4 rounded-full hover:bg-white/5 transition-colors">
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all duration-300 ${isPublicResult ? 'bg-indigo-500 border-indigo-500 scale-110' : 'border-white/30 group-hover:border-indigo-400'}`}>
                            {isPublicResult && <Check size={10} className="text-white" strokeWidth={4} />}
                        </div>
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">
                            Опубликовать в ленту
                        </span>
                    </div>
                </div>
            </div>
            <InsufficientCreditsModal
                isOpen={showCreditModal}
                onClose={() => setShowCreditModal(false)}
                onTopUp={() => onOpenPayment?.()}
            />
        </motion.div >
    );
};

export default GenerationView;
