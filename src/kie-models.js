// Kie.ai API Integration Module
// Unified interface for all Kie.ai models with Hierarchical Structure

export const KIE_API_URL = 'https://api.kie.ai/api/v1';

// Grouped by Family for UI Selection
export const MODEL_FAMILIES = {
    // ============================================
    // GOOGLE FAMILY
    // ============================================
    'google': {
        id: 'google',
        name: 'Google',
        icon: 'G',
        description: 'Photo-realistic & fast generation',
        models: [
            {
                id: 'nano_banana',
                name: 'Nano Banana',
                base_cost: 10,
                endpoint: 'nano-banana',
                description: 'Fastest generation',
                capabilities: ['text-to-image']
            },
            {
                id: 'nano_banana_pro',
                name: 'Nano Banana Pro',
                base_cost: 18, // 18 for <2K, 24 for 4K
                pricing_type: 'resolution',
                endpoint: 'nano-banana-pro',
                description: 'High-fidelity, structured typography, consistent scenes',
                capabilities: ['text-to-image', 'image-to-image', 'inpainting'],
                resolutions: ['1K', '2K', '4K'],
                default_res: '1K'
            },
            {
                id: 'nano_banana_edit',
                name: 'Nano Banana Edit',
                base_cost: 5,
                endpoint: 'nano-banana-edit',
                description: 'Fast editing & inpainting',
                capabilities: ['edit', 'image-to-image', 'inpainting'],
                max_images: 1
            },
            {
                id: 'imagen_4',
                name: 'Imagen 4',
                base_cost: 20, // Estimated
                endpoint: 'google/imagen4',
                description: 'Balanced quality & creativity',
                capabilities: ['text-to-image'],
                resolutions: ['1K']
            },
            {
                id: 'imagen_4_ultra',
                name: 'Imagen 4 Ultra',
                base_cost: 30,
                endpoint: 'google/imagen4-ultra',
                description: 'Maximum speed & fidelity (2K)',
                capabilities: ['text-to-image'],
                resolutions: ['2K']
            }
        ]
    },

    // ============================================
    // FLUX FAMILY
    // ============================================
    'flux': {
        id: 'flux',
        name: 'Flux',
        icon: 'F',
        description: 'Professional grade & flexible control',
        models: [
            {
                id: 'flux_pro',
                name: 'Flux 2 Pro',
                base_cost: 45,
                endpoint: 'flux-2/pro-text-to-image',
                description: 'Production-ready quality',
                capabilities: ['text-to-image', 'image-to-image']
            },
            {
                id: 'flux_flex',
                name: 'Flux 2 Flex',
                base_cost: 35,
                endpoint: 'flux-2/flex-text-to-image',
                description: 'Developer control & fine-tuning',
                capabilities: ['text-to-image', 'image-to-image']
            }
        ]
    },

    // ============================================
    // SEEDREAM FAMILY (Bytedance)
    // ============================================
    'seedream': {
        id: 'seedream',
        name: 'Seedream',
        icon: 'S',
        description: 'Multi-image fusion & detailed editing',
        models: [
            {
                id: 'seedream_4_5',
                name: 'Seedream 4.5',
                base_cost: 30, // Estimated
                endpoint: 'seedream/4.5-text-to-image',
                description: 'High detail & prompt adherence',
                capabilities: ['text-to-image']
            },
            {
                id: 'seedream_edit',
                name: 'Seedream Edit',
                base_cost: 30,
                endpoint: 'seedream/4.5-edit',
                description: 'Multi-image editing & fusion',
                capabilities: ['edit', 'image-to-image'],
                max_images: 10
            }
        ]
    },

    // ============================================
    // IDEOGRAM FAMILY
    // ============================================
    'ideogram': {
        id: 'ideogram',
        name: 'Ideogram',
        icon: 'I',
        description: 'Best for text rendering & design',
        models: [
            {
                id: 'ideogram_v3',
                name: 'Ideogram V3',
                base_cost: 30,
                endpoint: 'ideogram/v3',
                description: 'Text-heavy designs & posters',
                capabilities: ['text-to-image', 'remix', 'edit'],
                modes: ['turbo', 'default', 'quality']
            },
            {
                id: 'ideogram_char',
                name: 'Ideogram Character',
                base_cost: 30,
                endpoint: 'ideogram/character',
                description: 'Consistent character generation',
                capabilities: ['text-to-image']
            },
            {
                id: 'ideogram_char_edit',
                name: 'Ideogram Character Edit',
                base_cost: 35,
                endpoint: 'ideogram/character-edit',
                description: 'Edit characters while preserving identity',
                capabilities: ['edit']
            },
            {
                id: 'ideogram_reframe',
                name: 'Ideogram Reframe',
                base_cost: 20,
                endpoint: 'ideogram/v3-reframe',
                description: 'Change aspect ratio of existing images',
                capabilities: ['edit']
            }
        ]
    },

    // ============================================
    // RECRAFT FAMILY
    // ============================================
    'recraft': {
        id: 'recraft',
        name: 'Recraft Tools',
        icon: 'R',
        description: 'Essential utility tools',
        models: [
            {
                id: 'recraft_remove_bg',
                name: 'Remove Background',
                base_cost: 5,
                endpoint: 'recraft/remove-background',
                description: 'Automatically remove image background',
                capabilities: ['edit']
            },
            {
                id: 'recraft_upscale',
                name: 'Crisp Upscale',
                base_cost: 15,
                endpoint: 'recraft/crisp-upscale',
                description: 'High-quality vector-like upscale',
                capabilities: ['edit']
            }
        ]
    },

    // ============================================
    // SUNO FAMILY (Music)
    // ============================================
    'suno': {
        id: 'suno',
        name: 'Suno AI Music',
        icon: '🎵',
        description: 'Generate full tracks from text',
        models: [
            {
                id: 'suno_v4',
                name: 'Suno v4.5',
                base_cost: 80,
                endpoint: 'suno/music-generation',
                description: 'Full songs with lyrics and vocals',
                capabilities: ['text-to-audio']
            },
            {
                id: 'suno_video',
                name: 'Suno Music Video',
                base_cost: 120,
                endpoint: 'suno/create-music-video',
                description: 'Generates music + visualizer',
                capabilities: ['text-to-video']
            }
        ]
    },

    // ============================================
    // VIDEO FAMILY
    // ============================================
    'video': {
        id: 'video',
        name: 'Video Gen',
        icon: 'V',
        description: 'Create videos from text or images',
        models: [
            {
                id: 'veo_3_1',
                name: 'Veo 3.1',
                base_cost: 150,
                endpoint: 'veo-3.1/text-to-video',
                description: 'Google — video with synced audio, 1080p',
                capabilities: ['text-to-video', 'image-to-video'],
                has_audio: true,
                badge: 'С аудио 🔊'
            },
            {
                id: 'kling_2_6',
                name: 'Kling 2.6',
                base_cost: 100,
                endpoint: 'kling-2.6',
                description: 'State of the art video generation',
                capabilities: ['text-to-video', 'image-to-video']
            },
            {
                id: 'kling_avatar',
                name: 'Kling Talking Avatar',
                base_cost: 150,
                endpoint: 'kling/ai-avatar-pro',
                description: 'Talking avatar from photo + text/audio',
                capabilities: ['image-to-video']
            },
            {
                id: 'wan_2_6',
                name: 'Wan 2.6',
                base_cost: 100,
                endpoint: 'wan/2-6',
                description: 'High coherence video',
                capabilities: ['text-to-video', 'image-to-video', 'video-to-video']
            },
            {
                id: 'wan_animate',
                name: 'Wan Animate Move',
                base_cost: 80,
                endpoint: 'wan/2-2-animate-move',
                description: 'Animate objects on photos',
                capabilities: ['image-to-video']
            }
        ]
    },

    // ============================================
    // AUDIO FAMILY (ElevenLabs via Kie)
    // ============================================
    'audio': {
        id: 'audio',
        name: 'AI Audio',
        icon: '🎙️',
        description: 'Text to Speech & Sound Effects',
        models: [
            {
                id: 'eleven_tts',
                name: 'ElevenLabs TTS',
                base_cost: 10,
                endpoint: 'elevenlabs/text-to-speech-turbo-2-5',
                description: 'Ultra-fast, high-quality voice synthesis',
                capabilities: ['text-to-audio']
            },
            {
                id: 'eleven_sfx',
                name: 'ElevenLabs SFX',
                base_cost: 15,
                endpoint: 'elevenlabs/sound-effect-v2',
                description: 'Generate sound effects from text',
                capabilities: ['text-to-audio']
            }
        ]
    }
};

// Flattened list for backend logic by ID
export const KIE_MODELS_FLAT = Object.values(MODEL_FAMILIES).flatMap(f => f.models).reduce((acc, m) => {
    acc[m.id] = m;
    return acc;
}, {});

// Helper: Get Pricing for Dynamic Models
export function calculateModelCost(modelId, options = {}) {
    const model = KIE_MODELS_FLAT[modelId];
    if (!model) return 20; // Fallback

    let cost = model.base_cost;

    // 1. Resolution Pricing (Nano Banana Pro)
    if (model.pricing_type === 'resolution') {
        if (options.resolution === '4K') {
            cost = 24;
        } else if (options.resolution === '1K' || options.resolution === '2K') {
            cost = 18;
        }
    }

    // 2. Video Duration/Quality Modifiers (Example)
    if (modelId === 'kling_2_6') {
        if (options.quality === '1080p') cost += 50;
        if (options.duration === '10s') cost += 50;
    }

    return cost * (options.count || 1);
}

export default {
    MODEL_FAMILIES,
    KIE_MODELS_FLAT,
    calculateModelCost
};
