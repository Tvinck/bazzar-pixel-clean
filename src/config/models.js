// Bazzar Pixel Model Catalog
// Single Source of Truth for Models and Pricing

export const MODEL_CATALOG = {
    // ============================================
    // ИЗОБРАЖЕНИЯ - GPT IMAGE (OpenAI)
    // ============================================
    // ============================================
    // ИЗОБРАЖЕНИЯ - GPT IMAGE (OpenAI)
    // ============================================
    'gpt_image_15_text': {
        name: 'GPT Image 1.5 Text',
        type: 'image',
        cost: 20,
        preview: 'https://placehold.co/150x150/10b981/ffffff?text=GPT+1.5'
    },
    'gpt_image_15_edit': { name: 'GPT Image 1.5 Edit', type: 'image', cost: 20 },

    // ============================================
    // ИЗОБРАЖЕНИЯ - SEEDREAM (ByteDance)
    // ============================================
    'seedream_45_text': {
        name: 'Seedream 4.5 Text',
        type: 'image',
        cost: 10,
        preview: 'https://placehold.co/150x150/f59e0b/ffffff?text=Seedream+4.5'
    },
    'seedream_45_edit': { name: 'Seedream 4.5 Edit', type: 'image', cost: 10 },
    'seedream_v4_text': { name: 'Seedream V4 Text', type: 'image', cost: 10 },
    'seedream_v4_edit': { name: 'Seedream V4 Edit', type: 'image', cost: 10 },
    'seedream_3': { name: 'Seedream 3.0', type: 'image', cost: 5 }, // Presumed lower than 4.5

    // ============================================
    // ИЗОБРАЖЕНИЯ - FLUX (Black Forest Labs)
    // ============================================
    'flux_flex': {
        name: 'Flux 2.1 Flex',
        type: 'image',
        cost: 10,
        preview: 'https://placehold.co/150x150/6366f1/ffffff?text=Flux+Flex'
    },
    'flux_pro': {
        name: 'Flux 1.1 Pro',
        type: 'image',
        cost: 10,
        preview: 'https://placehold.co/150x150/4f46e5/ffffff?text=Flux+Pro'
    },
    'flux_2_1': { name: 'Flux 2.1', type: 'image', cost: 10 },

    // ============================================
    // ИЗОБРАЖЕНИЯ - GROK (xAI)
    // ============================================
    'grok_text': {
        name: 'Grok 2 Text-to-Image',
        type: 'image',
        cost: 10,
        preview: 'https://placehold.co/150x150/000000/ffffff?text=Grok+2'
    },
    'grok_image': { name: 'Grok 2 Image-to-Image', type: 'image', cost: 10 },
    'grok_upscale': { name: 'Grok 2 Upscale', type: 'image', cost: 10 },

    // ============================================
    // ИЗОБРАЖЕНИЯ - ДРУГИЕ
    // ============================================
    'nano_banana': { name: 'Nano Banana', type: 'image', cost: 5 },
    'nano_banana_pro': { name: 'Nano Banana Pro', type: 'image', cost: 20 },
    'z_image': { name: 'Z-Image', type: 'image', cost: 20 }, // Assuming aligned with high tier
    'ideogram_reframe': { name: 'Ideogram V3 Reframe', type: 'image', cost: 20 }, // Assuming high tier
    'recraft_remove_bg': { name: 'Remove Background', type: 'image', cost: 20 }, // Per user request (remove object)
    'recraft_upscale': { name: 'Crisp Upscale', type: 'image', cost: 10 },

    // ============================================
    // TOOLS (EDITING)
    // ============================================
    'replace_object': { name: 'Replace Object', type: 'image', cost: 20 },
    'remove_object': { name: 'Remove Object', type: 'image', cost: 20 },
    'add_object': { name: 'Add Object', type: 'image', cost: 20 },
    'inpainting_v2': { name: 'Smart Edit', type: 'image', cost: 20 }, // Alias for replace
    'outpainting_v1': { name: 'Object Adder', type: 'image', cost: 20 }, // Alias for add
    'eraser_pro': { name: 'Magic Eraser', type: 'image', cost: 20 }, // Alias for remove

    // ============================================
    // ВИДЕО
    // ============================================
    'wan_2_6_image': { name: 'Wan 2.6 Image-to-Video', type: 'video', cost: 210 },
    'kling_motion_control': { name: 'Kling 2.6 Motion Control', type: 'video', cost: 60 },
    'sora_2_pro_storyboard': { name: 'Sora Turbo', type: 'video', cost: 30 },
    'ai_avatar_standard': { name: 'AI Avatar Standard', type: 'video', cost: 60 },
    'ai_avatar_pro': { name: 'AI Avatar Pro', type: 'video', cost: 170 },
    'veo_3_1': { name: 'Veo 3.1', type: 'video', cost: 70 },
    'veo_3': { name: 'Veo 3.1', type: 'video', cost: 70 }, // Alias
    'kling_2_5_turbo_image_pro': { name: 'Kling Turbo', type: 'video', cost: 50 },
    'v1_pro_fast_image': { name: 'Bytedance', type: 'video', cost: 50 },
    'hailuo_2_3_image_pro': { name: 'Hailuo 2.1', type: 'video', cost: 50 },

    // ============================================
    // AUDIO
    // ============================================
    'suno_v5': { name: 'Suno V5', type: 'audio', cost: 20 },
    'chip_3_5': { name: 'Chip 3.5', type: 'audio', cost: 20 }, // Renamed from chirpv3
    'chirp_4_5': { name: 'Chirp 4.5', type: 'audio', cost: 25 },
    'chip_4_5': { name: 'Chip 4.5', type: 'audio', cost: 25 }, // Alias

    // ============================================
    // VIDEO TEMPLATES
    // ============================================
    'video_template': { name: 'Video Template', type: 'video', cost: 100 },

    // ============================================
    // LEGACY / UNSPECIFIED
    // ============================================
    'gpt4o_image': { name: 'GPT-4o Image', type: 'image', cost: 5 }, // Override to 5 as per user latest instruction (was 20 in prev request, but 5 in latest lines)
    'midjourney': { name: 'Midjourney', type: 'image', cost: 20 },
    'grok_text_video': { name: 'Grok Text-to-Video', type: 'video', cost: 100 },
    'grok_image_video': { name: 'Grok Image-to-Video', type: 'video', cost: 100 },
    'flux_kontext': { name: 'Flux Kontext', type: 'image', cost: 20 },
    'sora_2': { name: 'Sora 2', type: 'video', cost: 50 }
};

export const PRICING = {};
Object.keys(MODEL_CATALOG).forEach(k => PRICING[k] = MODEL_CATALOG[k].cost);
PRICING['default'] = 5;
