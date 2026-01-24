// Bazzar Pixel Model Catalog
// Single Source of Truth for Models and Pricing

export const MODEL_CATALOG = {
    // ============================================
    // ИЗОБРАЖЕНИЯ - GPT IMAGE (OpenAI)
    // ============================================
    'gpt_image_15_text': {
        name: 'GPT Image 1.5 Text',
        type: 'image',
        cost: 2,
        preview: 'https://placehold.co/150x150/10b981/ffffff?text=GPT+1.5' // Example Preview
    },
    'gpt_image_15_edit': { name: 'GPT Image 1.5 Edit', type: 'image', cost: 2 },

    // ============================================
    // ИЗОБРАЖЕНИЯ - SEEDREAM (ByteDance)
    // ============================================
    'seedream_45_text': {
        name: 'Seedream 4.5 Text',
        type: 'image',
        cost: 2,
        preview: 'https://placehold.co/150x150/f59e0b/ffffff?text=Seedream+4.5'
    },
    'seedream_45_edit': { name: 'Seedream 4.5 Edit', type: 'image', cost: 2 },
    'seedream_v4_text': { name: 'Seedream V4 Text', type: 'image', cost: 2 },
    'seedream_v4_edit': { name: 'Seedream V4 Edit', type: 'image', cost: 2 },
    'seedream_3': { name: 'Seedream 3.0', type: 'image', cost: 1 },

    // ============================================
    // ИЗОБРАЖЕНИЯ - FLUX (Black Forest Labs)
    // ============================================
    'flux_flex': {
        name: 'Flux 2 Flex',
        type: 'image',
        cost: 3,
        preview: 'https://placehold.co/150x150/6366f1/ffffff?text=Flux+Flex'
    },
    'flux_pro': {
        name: 'Flux 2 Pro',
        type: 'image',
        cost: 3,
        preview: 'https://placehold.co/150x150/4f46e5/ffffff?text=Flux+Pro'
    },

    // ============================================
    // ИЗОБРАЖЕНИЯ - GROK IMAGINE (xAI)
    // ============================================
    'grok_text': {
        name: 'Grok Text-to-Image',
        type: 'image',
        cost: 1,
        preview: 'https://placehold.co/150x150/000000/ffffff?text=Grok+2'
    },
    'grok_image': { name: 'Grok Image-to-Image', type: 'image', cost: 2 },
    'grok_upscale': { name: 'Grok Upscale', type: 'image', cost: 1 },

    // ============================================
    // ИЗОБРАЖЕНИЯ - ДРУГИЕ
    // ============================================
    'z_image': { name: 'Z-Image', type: 'image', cost: 2 },
    'ideogram_reframe': { name: 'Ideogram V3 Reframe', type: 'image', cost: 2 },
    'recraft_remove_bg': { name: 'Remove Background', type: 'image', cost: 1 },
    'recraft_upscale': { name: 'Crisp Upscale', type: 'image', cost: 1 },

    // ============================================
    // ВИДЕО - GROK IMAGINE
    // ============================================
    'grok_text_video': {
        name: 'Grok Text-to-Video',
        type: 'video',
        cost: 10,
        preview: 'https://placehold.co/150x150/111827/ffffff?text=Grok+Video'
    },
    'grok_image_video': { name: 'Grok Image-to-Video', type: 'video', cost: 12 },

    // ============================================
    // ВИДЕО - KLING (для шаблонов!)
    // ============================================
    'kling_motion_control': {
        name: 'Kling Motion Control',
        type: 'video',
        cost: 8,
        preview: 'https://placehold.co/150x150/ec4899/ffffff?text=Kling+Motion'
    },

    // ============================================
    // VIDEO - WAN FAMILY (Alibaba)
    // ============================================
    'wan_2_6_text': { name: 'Wan 2.6 Text-to-Video', type: 'video', cost: 10 },
    'wan_2_6_image': { name: 'Wan 2.6 Image-to-Video', type: 'video', cost: 12 },
    'wan_2_6_video': { name: 'Wan 2.6 Video-to-Video', type: 'video', cost: 15 },
    'wan_2_5_text': { name: 'Wan 2.5 Text-to-Video', type: 'video', cost: 8 },
    'wan_2_5_image': { name: 'Wan 2.5 Image-to-Video', type: 'video', cost: 10 },
    'wan_2_2_animate_move': { name: 'Wan Animate Move', type: 'video', cost: 10 },
    'wan_2_2_animate_replace': { name: 'Wan Animate Replace', type: 'video', cost: 10 },

    // ============================================
    // VIDEO - KLING TURBO
    // ============================================
    'kling_2_5_turbo_text_pro': { name: 'Kling 2.5 Turbo Text', type: 'video', cost: 12 },
    'kling_2_5_turbo_image_pro': { name: 'Kling 2.5 Turbo Image', type: 'video', cost: 14 },
    'kling_ai_avatar_std': { name: 'Kling AI Avatar Std', type: 'video', cost: 8 },

    // ============================================
    // VIDEO - HAILUO & OTHERS
    // ============================================
    'hailuo_2_3_image_pro': { name: 'Hailuo 2.3 Pro', type: 'video', cost: 12 },
    'hailuo_2_3_image_std': { name: 'Hailuo 2.3 Standard', type: 'video', cost: 10 },
    'v1_pro_fast_image': { name: 'Bytedance Fast Img2Vid', type: 'video', cost: 8 },
    'sora_2_pro_storyboard': { name: 'Sora 2 Pro Storyboard', type: 'video', cost: 20 },

    // ============================================
    // LEGACY MODELS
    // ============================================
    'nano_banana': { name: 'Nano Banana', type: 'image', cost: 1 },
    'nano_banana_pro': { name: 'Nano Banana Pro', type: 'image', cost: 2 },
    'gpt4o_image': { name: 'GPT-4o Image', type: 'image', cost: 2 },
    'midjourney': { name: 'Midjourney', type: 'image', cost: 2 },
    'flux_kontext': { name: 'Flux Kontext', type: 'image', cost: 3 },
    'sora_2': { name: 'Sora 2', type: 'video', cost: 15 },
    'veo_3_1': { name: 'Veo 3.1', type: 'video', cost: 10 },
    'kling_motion': { name: 'Kling Motion', type: 'video', cost: 8 },
    'suno_v5': { name: 'Suno v5', type: 'audio', cost: 5 },
    'chirp_4_5': { name: 'Chirp v4.5', type: 'audio', cost: 5 }
};

export const PRICING = {};
Object.keys(MODEL_CATALOG).forEach(k => PRICING[k] = MODEL_CATALOG[k].cost);
PRICING['default'] = 5;
