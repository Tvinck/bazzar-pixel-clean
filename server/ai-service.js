import dotenv from 'dotenv';
import { supabase } from './lib/supabase.js';

dotenv.config();

const HARDCODED_KIE_KEY = '365b6afae3b952cef9297bbc5384ec8e';

// Node.js Model Info
const KIE_MODELS = {
    image: {
        'nano_banana': { name: 'Nano Banana', credits: 10 },
        'nano_banana_pro': { name: 'Nano Banana Pro', credits: 25 },
        'gpt4o_image': { name: 'GPT-4o Image', credits: 30 },
        'flux_kontext': { name: 'Flux Kontext', credits: 40 },
        'flux_pro': { name: 'Flux Pro', credits: 45 },
        'midjourney': { name: 'Midjourney', credits: 35 }
    }
};

const getModelInfo = (modelId) => {
    for (const category of Object.values(KIE_MODELS)) {
        if (category[modelId]) {
            return { ...category[modelId], id: modelId };
        }
    }
    return { name: modelId, credits: 20 }; // Default
};

// API URLs
const KIE_API_URL = 'https://api.kie.ai/api/v1';
const DEFAPI_URL = 'https://api.defapi.org/api';

const getEnv = (key) => process.env[key];

// Get current provider
const getProvider = () => {
    const provider = getEnv('AI_PROVIDER') || 'kie';
    return provider.toLowerCase();
};

// Legacy DefAPI Model Map (for fallback)
const DEFAPI_MODEL_MAP = {
    'nano_banana': 'google/nano-banana',
    'nano_banana_pro': 'google/nano-banana-pro',
    'gpt4o_image': 'openai/dalle-3',
    'midjourney': 'midjourney/imagine',
    'flux_kontext': 'flux/kontext',
    'flux_pro': 'flux/pro'
};

const aiService = {
    getModelInfo,

    // Main Generation Function
    generateImage: async (prompt, modelId = 'nano_banana', options = {}) => {
        // Node.js: Direct API Call
        const provider = getProvider();
        console.log(`🖥️ Node Mode: ${provider.toUpperCase()} API...`);

        // Mock Mode
        if (getEnv('MOCK_AI') === 'true') {
            console.log('🎭 MOCK AI: Simulating generation...');
            await new Promise(r => setTimeout(r, 1000));
            return {
                success: true,
                imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1024&auto=format&fit=crop'
            };
        }

        // Route to provider
        if (provider === 'kie') {
            return await aiService.generateWithKie(prompt, modelId, options);
        } else {
            return await aiService.generateWithDefAPI(prompt, modelId, options);
        }
    },

    // ============================================
    // KIE.AI PROVIDER
    // ============================================
    generateWithKie: async (prompt, modelId, options = {}) => {
        console.log(`🔍 DEBUG: generateWithKie START. Prompt: ${prompt?.substring(0, 20)}... Model: '${modelId}'`);

        const apiKey = getEnv('KIE_API_KEY') || HARDCODED_KIE_KEY;
        if (!apiKey) throw new Error('KIE_API_KEY not set');

        // Normalize imageUrl to source_files for unified handling
        if (options.imageUrl && (!options.source_files || options.source_files.length === 0)) {
            options.source_files = [options.imageUrl];
        }

        // KIE MODEL MAPPING - Strictly based on Documentation
        const KIE_MAP = {
            // --- GOOGLE FAMILY ---
            'nano_banana': 'nano-banana',
            'nano_banana_pro': 'nano-banana-pro',
            'nano_banana_edit': 'nano-banana-edit',
            'google/nano-banana-edit': 'nano-banana-edit',
            'imagen_4': 'google/imagen4',
            'imagen_4_ultra': 'google/imagen4-ultra',

            // --- FLUX FAMILY ---
            'flux_pro': 'flux-2/pro-text-to-image',
            'flux_flex': 'flux-2/flex-text-to-image',

            // --- SEEDREAM FAMILY ---
            'seedream_4_5': 'seedream/4.5-text-to-image',
            'seedream_edit': 'seedream/4.5-edit',

            // --- IDEOGRAM FAMILY ---
            'ideogram_v3': 'ideogram/v3',
            'ideogram_char': 'ideogram/character',

            // --- QWEN FAMILY ---
            'qwen_edit': 'qwen/image-edit',

            // --- Z-IMAGE FAMILY ---
            'z_image_turbo': 'z-image',

            // --- VIDEO FAMILY (Existing + New) ---
            'kling_2_6': 'kling-2.6/text-to-video',
            'wan_2_6': 'wan/2-6-text-to-video',
            'hailuo_2_3': 'hailuo/2-3-image-to-video-pro',
            'video': 'kling-2.6/text-to-video', // Default mapping for generic 'video' type

            // --- LEGACY MAPPINGS ---
            'kling_video': 'kling-v1.6/image-to-video',
            'kling_motion_control': 'kling-2.6/motion-control',
            'midjourney': 'midjourney/imagine',
            'gpt4o_image': 'gpt-image/1.5-text-to-image'
        };

        // 1. Determine Correct Model ID
        let kieModelId = KIE_MAP[modelId];

        if (modelId === 'kling_motion_control') kieModelId = 'kling-2.6/motion-control';
        const hasSourceFiles = options.source_files && options.source_files.length > 0;

        // Auto-switch logic for Image 2 Image variants
        if (hasSourceFiles) {
            if (modelId === 'flux_pro') kieModelId = 'flux-2/pro-image-to-image';
            if (modelId === 'flux_flex') kieModelId = 'flux-2/flex-image-to-image';

            // Video Models Switching
            if (modelId === 'kling_2_6' || modelId === 'video') kieModelId = 'kling-2.6/image-to-video';
            if (modelId === 'wan_2_6') kieModelId = 'wan/2-6-image-to-video';
        }

        if (!kieModelId) {
            console.warn(`⚠️ Unknown model '${modelId}', defaulting to Nano Banana Pro`);
            kieModelId = 'nano-banana-pro';
        }

        console.log(`🚀 Using KIE Model: ${kieModelId}`);

        // 2. Prepare Input Object based on Model Family
        let input = { prompt: prompt };

        // Common params
        const aspectRatio = options.aspect_ratio || '1:1';

        // --- GOOGLE FAMILY ---
        if (modelId === 'nano_banana_pro') {
            input.aspect_ratio = aspectRatio;
            input.output_format = 'png';
            input.resolution = options.resolution || '1K';
            if (hasSourceFiles) input.image_input = options.source_files;
        } else if (modelId === 'google/nano-banana-edit' || modelId === 'nano_banana_edit') {
            input.output_format = 'png';
            input.resolution = options.resolution || '1K';
            input.guidance_scale = options.guidance_scale || 7.5;
            input.num_inference_steps = 30;
            if (hasSourceFiles) input.image_urls = options.source_files;
        } else if (modelId === 'imagen_4' || modelId === 'imagen_4_ultra') {
            input.aspect_ratio = aspectRatio;
            if (options.negative_prompt) input.negative_prompt = options.negative_prompt;
        }

        // --- FLUX FAMILY ---
        else if (modelId === 'flux_pro' || modelId === 'flux_flex') {
            input.aspect_ratio = aspectRatio;
            input.resolution = '1K';
            if (hasSourceFiles) input.input_urls = options.source_files;
        }

        // --- SEEDREAM FAMILY ---
        else if (modelId === 'seedream_edit') {
            input.input_urls = options.source_files;
            if (options.strength) input.strength = options.strength;
        }

        // --- IDEOGRAM FAMILY ---
        else if (modelId === 'ideogram_v3') {
            input.aspect_ratio = aspectRatio;
            if (options.mode) input.mode = options.mode;
            if (hasSourceFiles) {
                input.image_url = options.source_files[0];
            }
        }

        // --- QWEN FAMILY ---
        else if (modelId === 'qwen_edit') {
            if (!hasSourceFiles) throw new Error('Qwen Edit requires an input image');
            input.image_url = options.source_files[0];
        }

        // --- Z-IMAGE ---
        else if (modelId === 'z_image_turbo') {
            input.aspect_ratio = aspectRatio;
        }

        // --- VIDEO FAMILY ---
        else if (modelId === 'kling_2_6' || modelId === 'wan_2_6' || modelId === 'hailuo_2_3' || modelId === 'video') {
            input.aspect_ratio = options.aspect_ratio || '16:9';
            if (options.duration) input.duration = options.duration;
            if (options.quality) input.quality = options.quality;
            if (options.camera_motion) input.camera_motion = options.camera_motion;

            // For Image-to-Video models in Kling/Wan/Hailuo, the field is often 'image' or 'image_url'
            if (hasSourceFiles) {
                const sourceImg = options.source_files[0];
                input.image = sourceImg;
                input.image_url = sourceImg;
            }
            if (!input.duration) input.duration = 5;
        }

        const normalizeKieInput = (targetInput, targetModel) => {
            if (targetModel.includes('kling') || targetModel.includes('wan/') || targetModel.includes('hailuo')) {
                return targetInput;
            }
            return targetInput;
        };

        const finalInput = normalizeKieInput(input, kieModelId);

        // 3. Create Task
        const requestBody = {
            model: kieModelId,
            input: finalInput
        };

        console.log(`📡 [Kie Check] Target Model: ${kieModelId}`);
        console.log(`📡 [Kie Check] Final Input Body:`, JSON.stringify(finalInput, null, 2));

        const createRes = await fetch(`${KIE_API_URL}/jobs/createTask`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!createRes.ok) {
            let errorText;
            try {
                const errJson = await createRes.json();
                errorText = errJson.error || errJson.message || JSON.stringify(errJson);
            } catch (e) {
                errorText = await createRes.text();
            }
            console.error('❌ Kie.ai API Error Status:', createRes.status);
            console.error('❌ Kie.ai API Error Body:', errorText);
            throw new Error(`Kie.ai error: ${errorText}`);
        }

        const responseData = await createRes.json();
        console.log('📦 Kie.ai Response:', JSON.stringify(responseData, null, 2));

        // Parse task ID - expanded detection
        let taskId = null;
        if (responseData.data) {
            taskId = responseData.data.task_id || responseData.data.taskId || responseData.data.id || responseData.data.taskid;
        }
        if (!taskId) {
            taskId = responseData.task_id || responseData.taskId || responseData.id || responseData.taskid || responseData.task_no;
        }

        if (!taskId) {
            console.error('❌ No task ID found in response:', responseData);
            const errMsg = responseData.msg || responseData.message || responseData.error || 'Unknown error';

            if (responseData.code === 402 || errMsg.toLowerCase().includes('balance')) {
                throw new Error('Недостаточно кредитов на Kie.ai (Баланс исчерпан)');
            }
            throw new Error(`Kie.ai did not return a task ID. Response: ${JSON.stringify(responseData)}`);
        }

        console.log(`📋 Kie.ai Task created: ${taskId}`);

        if (options.skipPolling) {
            return { success: true, taskId, status: 'pending', provider: 'kie' };
        }

        // Poll for result
        return await aiService.pollKieTask(taskId, apiKey);
    },

    // Poll Kie.ai Task
    pollKieTask: async (taskId, apiKey) => {
        const maxAttempts = 600;

        for (let i = 0; i < maxAttempts; i++) {
            const delay = i < 15 ? 1000 : 3000;
            await new Promise(r => setTimeout(r, delay));

            let data;
            try {
                const res = await fetch(`${KIE_API_URL}/jobs/recordInfo?taskId=${taskId}`, {
                    headers: { 'Authorization': `Bearer ${apiKey}` }
                });
                data = await res.json();
            } catch (err) {
                console.warn(`⚠️ Kie.ai polling attempt ${i} failed, retrying...`);
                continue;
            }

            if (i === 0 || i % 10 === 0) {
                console.log(`📡 Poll Response:`, JSON.stringify(data, null, 2));
            }

            const status = data.data?.state || data.state || data.data?.status || data.status;
            console.log(`⏳ Kie.ai Task ${taskId}: ${status}`);

            if (status === 'success' || status === 'completed') {
                let resultData = data.data?.resultJson || data.resultJson || data.data?.result || data.result;
                if (typeof resultData === 'string') {
                    try { resultData = JSON.parse(resultData); } catch (e) { }
                }

                let imageUrl = null;
                if (resultData?.resultUrls && Array.isArray(resultData.resultUrls)) {
                    imageUrl = resultData.resultUrls[0];
                } else if (Array.isArray(resultData) && resultData.length > 0) {
                    imageUrl = typeof resultData[0] === 'string' ? resultData[0] : resultData[0].url;
                } else if (typeof resultData === 'string') {
                    imageUrl = resultData;
                } else if (resultData?.url) {
                    imageUrl = resultData.url;
                }

                if (imageUrl) {
                    console.log(`✅ Kie.ai completed: ${imageUrl}`);
                    return { success: true, imageUrl };
                }
            }

            if (status === 'failed' || status === 'error') {
                throw new Error(`Kie.ai generation failed: ${data.data?.error || data.error || 'Unknown error'}`);
            }
        }

        throw new Error('Kie.ai task timeout (6 minutes)');
    },

    // ============================================
    // DEFAPI PROVIDER
    // ============================================
    generateWithDefAPI: async (prompt, modelId, options = {}) => {
        const apiKey = getEnv('DEFAPI_KEY');
        if (!apiKey) throw new Error('DEFAPI_KEY not set');

        const apiModel = DEFAPI_MODEL_MAP[modelId] || DEFAPI_MODEL_MAP['nano_banana'];
        console.log(`🚀 DefAPI: ${apiModel}`);

        const payload = {
            model: apiModel,
            prompt: prompt,
            aspect_ratio: options.aspect_ratio || '1:1',
            ...options
        };

        const res = await fetch(`${DEFAPI_URL}/generate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.code !== 0 || !data.data?.task_id) {
            throw new Error(data.message || 'DefAPI validation failed');
        }

        return aiService.pollDefAPITask(data.data.task_id, apiKey);
    },

    pollDefAPITask: async (taskId, apiKey) => {
        const maxAttempts = 300;
        for (let i = 0; i < maxAttempts; i++) {
            await new Promise(r => setTimeout(r, 2000));
            try {
                const res = await fetch(`${DEFAPI_URL}/task/query?task_id=${taskId}`, {
                    headers: { 'Authorization': `Bearer ${apiKey}` }
                });
                const data = await res.json();

                if (data.data?.status === 'succeeded' || data.data?.status === 'success') {
                    const res = data.data.result;
                    let resultUrl = null;
                    if (Array.isArray(res) && res.length > 0) {
                        resultUrl = typeof res[0] === 'string' ? res[0] : res[0].url;
                    } else if (typeof res === 'string') {
                        resultUrl = res;
                    } else if (res?.url) {
                        resultUrl = res.url;
                    }
                    if (resultUrl) return { success: true, imageUrl: resultUrl };
                }

                if (data.data?.status === 'failed' || data.data?.status === 'error') {
                    throw new Error(data.data.message || 'DefAPI failed');
                }
            } catch (err) {
                console.warn(`DefAPI poll failed: ${err.message}`);
                continue;
            }
        }
        throw new Error('DefAPI timeout');
    },

    instructEdit: async (base64Img, instructions) => {
        let modelId = 'nano_banana_edit';
        let prompt = '';

        if (instructions.mode === 'replace-object') {
            prompt = `Replace ${instructions.old_object} with ${instructions.new_object}`;
        } else if (instructions.mode === 'remove-object') {
            prompt = `Remove ${instructions.remove_object}`;
        } else if (instructions.mode === 'add-object') {
            prompt = `Add ${instructions.new_object}`;
        } else {
            prompt = instructions.prompt || 'Edit image';
        }

        const dataUri = `data:image/jpeg;base64,${base64Img}`;
        return await aiService.generateWithKie(prompt, modelId, {
            source_files: [dataUri],
            aspect_ratio: '1:1'
        });
    },

    enhancePrompt: async (originalPrompt) => {
        if (!originalPrompt || originalPrompt.length > 300) return originalPrompt;

        const apiKey = getEnv('KIE_API_KEY') || HARDCODED_KIE_KEY;
        if (!apiKey) return originalPrompt;

        try {
            const res = await fetch('https://api.kie.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: "system",
                            content: "You are an expert AI art prompter. Take the user's simple concept and rewrite it into a detailed, high-quality image generation prompt. Include details about lighting, style (photorealistic/cinematic), camera angles, and rendering engine (Unreal Engine 5, Octane Render). Keep it under 40 words. Output ONLY the raw prompt text, no intro/outro."
                        },
                        {
                            role: "user",
                            content: originalPrompt
                        }
                    ],
                    max_tokens: 150,
                    temperature: 0.7
                })
            });
            if (!res.ok) return originalPrompt;
            const data = await res.json();
            return data.choices?.[0]?.message?.content?.trim() || originalPrompt;
        } catch (e) {
            return originalPrompt;
        }
    },

    // Generic Text Generation
    generateText: async (prompt) => {
        const apiKey = getEnv('KIE_API_KEY') || HARDCODED_KIE_KEY;
        if (!apiKey) return null;

        try {
            const res = await fetch('https://api.kie.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: 'You are a helpful assistant.' },
                        { role: 'user', content: prompt }
                    ],
                    max_tokens: 500,
                    temperature: 0.7
                })
            });
            if (!res.ok) {
                console.error(`❌ Kie.ai Text API Error: ${res.status}`);
                return null;
            }
            const data = await res.json();
            return data.choices?.[0]?.message?.content?.trim() || null;
        } catch (e) {
            console.error('❌ Kie.ai Text Generation Error:', e);
            return null;
        }
    },

    // Server-side model loader
    getModels: async () => {
        try {
            const { data } = await supabase.from('ai_models').select('*').eq('is_active', true).order('cost', { ascending: true });
            return data || [];
        } catch (e) {
            console.error('⚠️ Failed to load models from DB', e);
            return [];
        }
    },

    trainModel: async (images, triggerWord, type) => {
        console.log(`🚂 Training Stub: ${triggerWord} with ${images.length} images`);
        await new Promise(r => setTimeout(r, 2000));
        return { success: true, taskId: 'mock_train_' + Date.now() };
    }
};

export { aiService };
