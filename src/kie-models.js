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
            }
        ]
    },

    // ============================================
    // QWEN FAMILY
    // ============================================
    'qwen': {
        id: 'qwen',
        name: 'Qwen',
        icon: 'Q',
        description: 'Advanced editing capabilities',
        models: [
            {
                id: 'qwen_edit',
                name: 'Qwen Image Edit',
                base_cost: 8, // ~4 credits per image (approx) -> setting safe margin
                endpoint: 'qwen/image-edit',
                description: 'Natural language image editing',
                capabilities: ['edit', 'image-to-image']
            }
        ]
    },

    // ============================================
    // Z-IMAGE FAMILY
    // ============================================
    'z_image': {
        id: 'z_image',
        name: 'Z-Image',
        icon: 'Z',
        description: 'Fast photorealistic generation',
        models: [
            {
                id: 'z_image_turbo',
                name: 'Z-Image Turbo',
                base_cost: 15,
                endpoint: 'z-image',
                description: 'Low latency, high quality',
                capabilities: ['text-to-image']
            }
        ]
    },

    // ============================================
    // VIDEO FAMILY (Existing + New)
    // ============================================
    'video': {
        id: 'video',
        name: 'Video Gen',
        icon: 'V',
        description: 'Create videos from text or images',
        models: [
            {
                id: 'kling_2_6',
                name: 'Kling 2.6',
                base_cost: 100,
                endpoint: 'kling-2.6',
                description: 'Start of the art video generation',
                capabilities: ['text-to-video', 'image-to-video'],
                durations: ['5s', '10s'],
                qualities: ['720p', '1080p'] // 1080p costs extra
            },
            {
                id: 'wan_2_6',
                name: 'Wan 2.6',
                base_cost: 100,
                endpoint: 'wan/2-6',
                description: 'High coherence video',
                capabilities: ['text-to-video', 'image-to-video'],
                durations: ['5s']
            },
            {
                id: 'hailuo_2_3',
                name: 'Hailuo 2.3',
                base_cost: 120,
                endpoint: 'hailuo/2-3',
                description: 'Professional grade animation',
                capabilities: ['image-to-video'],
                durations: ['6s']
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
