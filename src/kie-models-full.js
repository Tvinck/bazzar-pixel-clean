// Полный каталог моделей Kie.ai на основе официальной документации
// Обновлено: 2026-01-17

export const KIE_MODELS_FULL = {
    // ============================================
    // ИЗОБРАЖЕНИЯ - GPT IMAGE (OpenAI)
    // ============================================
    'gpt_image_15_text': {
        name: 'GPT Image 1.5 Text-to-Image',
        kieId: 'gpt-image/1.5-text-to-image',
        credits: 30,
        type: 'image',
        speed: 'medium',
        quality: ['medium', 'high'],
        aspectRatios: ['1:1', '2:3', '3:2']
    },
    'gpt_image_15_edit': {
        name: 'GPT Image 1.5 Image-to-Image',
        kieId: 'gpt-image/1.5-image-to-image',
        credits: 35,
        type: 'image',
        speed: 'medium',
        quality: ['medium', 'high'],
        aspectRatios: ['1:1', '2:3', '3:2'],
        requiresImage: true
    },

    // ============================================
    // ИЗОБРАЖЕНИЯ - SEEDREAM (ByteDance)
    // ============================================
    'seedream_45_text': {
        name: 'Seedream 4.5 Text-to-Image',
        kieId: 'seedream/4.5-text-to-image',
        credits: 25,
        type: 'image',
        speed: 'fast',
        quality: ['basic', 'high'],
        aspectRatios: ['1:1', '4:3', '3:4', '16:9', '9:16', '2:3', '3:2', '21:9']
    },
    'seedream_45_edit': {
        name: 'Seedream 4.5 Edit',
        kieId: 'seedream/4.5-edit',
        credits: 30,
        type: 'image',
        speed: 'fast',
        quality: ['basic', 'high'],
        aspectRatios: ['1:1', '4:3', '3:4', '16:9', '9:16', '2:3', '3:2', '21:9'],
        requiresImage: true
    },
    'seedream_v4_text': {
        name: 'Seedream V4 Text-to-Image',
        kieId: 'bytedance/seedream-v4-text-to-image',
        credits: 25,
        type: 'image',
        speed: 'fast',
        quality: ['1K', '2K', '4K'],
        aspectRatios: ['square', 'square_hd', 'portrait_4_3', 'portrait_3_2', 'portrait_16_9', 'landscape_4_3', 'landscape_3_2', 'landscape_16_9', 'landscape_21_9']
    },
    'seedream_v4_edit': {
        name: 'Seedream V4 Edit',
        kieId: 'bytedance/seedream-v4-edit',
        credits: 30,
        type: 'image',
        speed: 'fast',
        quality: ['1K', '2K', '4K'],
        aspectRatios: ['square', 'square_hd', 'portrait_4_3', 'portrait_3_2', 'portrait_16_9', 'landscape_4_3', 'landscape_3_2', 'landscape_16_9', 'landscape_21_9'],
        requiresImage: true
    },
    'seedream_3': {
        name: 'Seedream 3.0',
        kieId: 'bytedance/seedream',
        credits: 20,
        type: 'image',
        speed: 'fast',
        quality: ['square_hd'],
        aspectRatios: ['square', 'square_hd', 'portrait_4_3', 'portrait_16_9', 'landscape_4_3', 'landscape_16_9']
    },

    // ============================================
    // ИЗОБРАЖЕНИЯ - FLUX (Black Forest Labs)
    // ============================================
    'flux_flex': {
        name: 'Flux 2 Flex',
        kieId: 'flux-2/flex-text-to-image',
        credits: 40,
        type: 'image',
        speed: 'medium',
        quality: ['1K', '2K'],
        aspectRatios: ['1:1', '4:3', '3:4', '16:9', '9:16', '3:2', '2:3', 'auto']
    },
    'flux_pro': {
        name: 'Flux 2 Pro',
        kieId: 'flux-2/pro-text-to-image',
        credits: 45,
        type: 'image',
        speed: 'slow',
        quality: ['1K', '2K'],
        aspectRatios: ['1:1', '4:3', '3:4', '16:9', '9:16', '3:2', '2:3', 'auto']
    },

    // ============================================
    // ИЗОБРАЖЕНИЯ - GROK IMAGINE (xAI)
    // ============================================
    'grok_text': {
        name: 'Grok Imagine Text-to-Image',
        kieId: 'grok-imagine/text-to-image',
        credits: 20,
        type: 'image',
        speed: 'fast',
        aspectRatios: ['2:3', '3:2', '1:1', '9:16', '16:9']
    },
    'grok_image': {
        name: 'Grok Imagine Image-to-Image',
        kieId: 'grok-imagine/image-to-image',
        credits: 25,
        type: 'image',
        speed: 'fast',
        requiresImage: true
    },
    'grok_upscale': {
        name: 'Grok Upscale',
        kieId: 'grok-imagine/upscale',
        credits: 15,
        type: 'image',
        speed: 'fast',
        requiresTaskId: true
    },

    // ============================================
    // ИЗОБРАЖЕНИЯ - ДРУГИЕ
    // ============================================
    'z_image': {
        name: 'Z-Image',
        kieId: 'z-image',
        credits: 30,
        type: 'image',
        speed: 'medium',
        aspectRatios: ['1:1', '4:3', '3:4', '16:9', '9:16']
    },
    'ideogram_reframe': {
        name: 'Ideogram V3 Reframe',
        kieId: 'ideogram/v3-reframe',
        credits: 25,
        type: 'image',
        speed: 'fast',
        quality: ['TURBO', 'BALANCED', 'QUALITY'],
        aspectRatios: ['square', 'square_hd', 'portrait_4_3', 'portrait_16_9', 'landscape_4_3', 'landscape_16_9'],
        requiresImage: true
    },
    'recraft_remove_bg': {
        name: 'Recraft Remove Background',
        kieId: 'recraft/remove-background',
        credits: 10,
        type: 'image',
        speed: 'very_fast',
        requiresImage: true
    },
    'recraft_upscale': {
        name: 'Recraft Crisp Upscale',
        kieId: 'recraft/crisp-upscale',
        credits: 15,
        type: 'image',
        speed: 'fast',
        requiresImage: true
    },

    // ============================================
    // ВИДЕО - GROK IMAGINE
    // ============================================
    'grok_text_video': {
        name: 'Grok Text-to-Video',
        kieId: 'grok-imagine/text-to-video',
        credits: 100,
        type: 'video',
        speed: 'very_slow',
        aspectRatios: ['2:3', '3:2', '1:1', '9:16', '16:9'],
        modes: ['fun', 'normal', 'spicy']
    },
    'grok_image_video': {
        name: 'Grok Image-to-Video',
        kieId: 'grok-imagine/image-to-video',
        credits: 120,
        type: 'video',
        speed: 'very_slow',
        requiresImage: true,
        modes: ['fun', 'normal', 'spicy']
    },

    // ============================================
    // ВИДЕО - KLING (для шаблонов!)
    // ============================================
    'kling_motion_control': {
        name: 'Kling Motion Control',
        kieId: 'kling-2.6/motion-control',
        credits: 80,
        type: 'video',
        speed: 'slow',
        requiresImage: true,
        requiresVideo: true,
        modes: ['720p', '1080p'],
        maxDuration: 30,
        description: 'Переносит движения из видео-шаблона на фото клиента'
    }
};

// Функция для получения информации о модели
export function getKieModelInfo(modelId) {
    return KIE_MODELS_FULL[modelId] || null;
}

// Функция для получения всех моделей по типу
export function getKieModelsByType(type) {
    return Object.entries(KIE_MODELS_FULL)
        .filter(([_, model]) => model.type === type)
        .reduce((acc, [id, model]) => {
            acc[id] = model;
            return acc;
        }, {});
}

// Маппинг старых ID на новые
export const MODEL_ID_MAPPING = {
    // Старые nano banana модели
    'nano_banana': 'grok_text',
    'nano_banana_pro': 'seedream_v4_text',

    // Старые модели
    'gpt4o_image': 'gpt_image_15_text',
    'midjourney': 'grok_text',
    'flux_kontext': 'flux_flex',

    // Прямой маппинг для новых
    'gpt_image_15_text': 'gpt_image_15_text',
    'gpt_image_15_edit': 'gpt_image_15_edit',
    'seedream_45_text': 'seedream_45_text',
    'seedream_45_edit': 'seedream_45_edit',
    'flux_flex': 'flux_flex',
    'flux_pro': 'flux_pro',
    'grok_text': 'grok_text',
    'grok_image': 'grok_image',
    'z_image': 'z_image'
};

export default {
    KIE_MODELS_FULL,
    getKieModelInfo,
    getKieModelsByType,
    MODEL_ID_MAPPING
};
