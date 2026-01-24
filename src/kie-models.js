// Kie.ai API Integration Module
// Unified interface for all Kie.ai models

const KIE_API_URL = 'https://api.kie.ai/api/v1';

// Model Categories and Pricing (in credits)
export const KIE_MODELS = {
    // ============================================
    // IMAGE GENERATION MODELS
    // ============================================
    image: {
        // Google Nano Banana (Fast, High Quality)
        'nano_banana': {
            name: 'Nano Banana',
            endpoint: '/nano-banana/generate',
            credits: 10,
            speed: 'fast', // 3-5 seconds
            description: 'Google Gemini-based fast photorealistic generation'
        },
        'nano_banana_pro': {
            name: 'Nano Banana Pro',
            endpoint: '/nano-banana-pro/generate',
            credits: 25,
            speed: 'fast',
            description: 'Enhanced version with better quality'
        },

        // GPT-4o Image (OpenAI)
        'gpt4o_image': {
            name: 'GPT-4o Image',
            endpoint: '/gpt4o-image/generate',
            credits: 30,
            speed: 'medium',
            description: 'OpenAI multimodal model, excellent for text in images'
        },

        // Flux Series (Professional Quality)
        'flux_kontext': {
            name: 'Flux Kontext',
            endpoint: '/flux-kontext/generate',
            credits: 40,
            speed: 'medium',
            description: 'Professional-grade photorealism'
        },
        'flux_pro': {
            name: 'Flux Pro',
            endpoint: '/flux-pro/generate',
            credits: 45,
            speed: 'slow',
            description: 'Top-tier professional quality'
        },

        // Midjourney (Artistic)
        'midjourney': {
            name: 'Midjourney',
            endpoint: '/midjourney/imagine',
            credits: 35,
            speed: 'slow',
            description: 'Artistic and stylized image generation'
        },

        // Grok Imagine (xAI)
        'grok_imagine': {
            name: 'Grok Imagine',
            endpoint: '/grok-imagine/generate',
            credits: 20,
            speed: 'fast',
            description: 'Image-to-image transformation by xAI'
        },

        // Specialized Models
        'ideogram': {
            name: 'Ideogram',
            endpoint: '/ideogram/generate',
            credits: 30,
            speed: 'medium',
            description: 'Best for text rendering in images'
        },
        'qwen_image': {
            name: 'Qwen Image',
            endpoint: '/qwen-image/generate',
            credits: 25,
            speed: 'fast',
            description: 'Alibaba model, great for ads and posters'
        },
        'recraft': {
            name: 'Recraft',
            endpoint: '/recraft/generate',
            credits: 30,
            speed: 'medium',
            description: 'Vector-style and design-focused'
        }
    },

    // ============================================
    // VIDEO GENERATION MODELS
    // ============================================
    video: {
        // --- Wan Series (Alibaba) ---
        'wan_2_6_text': {
            name: 'Wan 2.6 Text-to-Video',
            endpoint: '/wan/generate',
            credits: 100,
            speed: 'medium',
            description: 'Latest Alibaba model, high coherence'
        },
        'wan_2_6_image': {
            name: 'Wan 2.6 Image-to-Video',
            endpoint: '/wan/generate',
            credits: 120,
            speed: 'medium',
            description: 'Image animation with Wan 2.6'
        },
        'wan_2_2_animate_move': {
            name: 'Wan Animate Move',
            endpoint: '/wan/animate',
            credits: 100,
            speed: 'fast',
            description: 'Character movement animation'
        },

        // --- Kling Series ---
        'kling_2_5_turbo_text_pro': {
            name: 'Kling 2.5 Turbo Text',
            endpoint: '/kling/generate',
            credits: 120,
            speed: 'fast',
            description: 'Fast high-quality generation'
        },
        'kling_2_5_turbo_image_pro': {
            name: 'Kling 2.5 Turbo Image',
            endpoint: '/kling/generate',
            credits: 140,
            speed: 'fast',
            description: 'Pro image to video'
        },
        'kling': {
            name: 'Kling 2.6 Standard',
            endpoint: '/kling/generate',
            credits: 80,
            speed: 'slow',
            description: 'Classic Kling model'
        },

        // --- Hailuo & Others ---
        'hailuo_2_3_image_pro': {
            name: 'Hailuo 2.3 Pro',
            endpoint: '/hailuo/generate',
            credits: 120,
            speed: 'medium',
            description: 'Professional grade animation'
        },
        'v1_pro_fast_image': {
            name: 'Bytedance Fast',
            endpoint: '/bytedance/generate',
            credits: 80,
            speed: 'fast',
            description: 'Quick image to video'
        },
        'sora_2_pro_storyboard': {
            name: 'Sora 2 Pro Storyboard',
            endpoint: '/sora/generate',
            credits: 200,
            speed: 'very_slow',
            description: 'Advanced storyboard generation'
        },

        // --- Google & Runway ---
        'veo_3': {
            name: 'Google Veo 3.1',
            endpoint: '/veo/generate',
            credits: 100,
            speed: 'very_slow',
            description: 'Google latest video model'
        },
        'runway': {
            name: 'Runway Aleph',
            endpoint: '/runway/generate',
            credits: 120,
            speed: 'very_slow',
            description: 'Professional video generation'
        }
    },

    // ============================================
    // AUDIO/MUSIC GENERATION MODELS
    // ============================================
    audio: {
        'suno_v4': {
            name: 'Suno V4',
            endpoint: '/suno/generate',
            credits: 50,
            speed: 'medium',
            description: 'Music generation with lyrics'
        },
        'suno_v4_plus': {
            name: 'Suno V4.5 Plus',
            endpoint: '/suno-plus/generate',
            credits: 70,
            speed: 'medium',
            description: 'Enhanced music quality'
        },
        'elevenlabs': {
            name: 'ElevenLabs',
            endpoint: '/elevenlabs/generate',
            credits: 40,
            speed: 'fast',
            description: 'Voice synthesis and audio generation'
        }
    },

    // ============================================
    // CHAT/LLM MODELS
    // ============================================
    chat: {
        'gemini_3_pro': {
            name: 'Gemini 3 Pro',
            endpoint: '/gemini/chat',
            credits: 5,
            speed: 'fast',
            description: 'Google latest LLM'
        },
        'deepseek': {
            name: 'DeepSeek',
            endpoint: '/deepseek/chat',
            credits: 3,
            speed: 'fast',
            description: 'Cost-effective reasoning model'
        }
    }
};

// Helper: Get model info by ID
export function getModelInfo(modelId) {
    for (const category of Object.values(KIE_MODELS)) {
        if (category[modelId]) {
            return { ...category[modelId], id: modelId };
        }
    }
    return null;
}

// Helper: Get all models by category
export function getModelsByCategory(category) {
    return KIE_MODELS[category] || {};
}

// Helper: Get recommended model for task
export function getRecommendedModel(task) {
    const recommendations = {
        'photo': 'nano_banana_pro',
        'art': 'midjourney',
        'text_in_image': 'gpt4o_image',
        'professional': 'flux_pro',
        'fast': 'nano_banana',
        'video': 'kling',
        'music': 'suno_v4',
        'voice': 'elevenlabs'
    };
    return recommendations[task] || 'nano_banana';
}

export default {
    KIE_MODELS,
    getModelInfo,
    getModelsByCategory,
    getRecommendedModel
};
