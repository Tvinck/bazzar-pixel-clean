export const MODEL_CATALOG = {
    'gpt_image_15_text': { name: 'GPT Image 1.5 Text', type: 'image', cost: 20 },
    'gpt_image_15_edit': { name: 'GPT Image 1.5 Edit', type: 'image', cost: 20 },
    'seedream_45_text': { name: 'Seedream 4.5 Text', type: 'image', cost: 10 },
    'seedream_45_edit': { name: 'Seedream 4.5 Edit', type: 'image', cost: 10 },
    'flux_flex': { name: 'Flux 2.1 Flex', type: 'image', cost: 10 },
    'flux_pro': { name: 'Flux 1.1 Pro', type: 'image', cost: 10 },
    'grok_text': { name: 'Grok 2 Text-to-Image', type: 'image', cost: 10 },
    'nano_banana': { name: 'Nano Banana', type: 'image', cost: 5 },
    'nano_banana_pro': { name: 'Nano Banana Pro', type: 'image', cost: 20 },
    'nano_banana_edit': { name: 'Nano Banana Edit', type: 'image', cost: 5 },
    'replace_object': { name: 'Replace Object', type: 'image', cost: 20 },
    'remove_object': { name: 'Remove Object', type: 'image', cost: 20 },
    'add_object': { name: 'Add Object', type: 'image', cost: 20 },
    'kling_2_6_text': { name: 'Kling 2.6 Text', type: 'video', cost: 60 },
    'kling_2_6_image': { name: 'Kling 2.6 Image', type: 'video', cost: 60 },
    'wan_2_6_text': { name: 'Wan 2.6 Text', type: 'video', cost: 70 },
    'video_template': { name: 'Video Template', type: 'video', cost: 100 },
    'upscale': { name: 'Super Resolution HD', type: 'upscale', cost: 10 }
};

export const PRICING = {};
Object.keys(MODEL_CATALOG).forEach(k => PRICING[k] = MODEL_CATALOG[k].cost);
PRICING['default'] = 5;
