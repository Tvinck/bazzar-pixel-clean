import { KIE_MODELS_FLAT } from '../../../src/kie-models.js';

export const MODEL_CATALOG = {};
export const PRICING = {};

// Build Dynamic Catalog & Pricing from single-source-of-truth
Object.values(KIE_MODELS_FLAT).forEach(model => {
    MODEL_CATALOG[model.id] = {
        name: model.name,
        type: model.capabilities?.includes('text-to-video') ? 'video' : 'image',
        cost: model.base_cost || 10
    };
    PRICING[model.id] = model.base_cost || 10;
});

// Hardcoded legacy / fallback models
const LEGACY_MODELS = {
    'gpt_image_15_text': { name: 'GPT Image 1.5 Text', type: 'image', cost: 20 },
    'gpt_image_15_edit': { name: 'GPT Image 1.5 Edit', type: 'image', cost: 20 },
    'video_template': { name: 'Video Template', type: 'video', cost: 100 },
    'upscale': { name: 'Super Resolution HD', type: 'upscale', cost: 10 }
};

Object.entries(LEGACY_MODELS).forEach(([id, model]) => {
    MODEL_CATALOG[id] = model;
    PRICING[id] = model.cost;
});

PRICING['default'] = 5;
