const isBrowser = typeof window !== 'undefined';

// Dynamic import for Node.js
let getModelInfo = null;
if (!isBrowser) {
    // In Node.js, we'll inline the model info
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

    getModelInfo = (modelId) => {
        for (const category of Object.values(KIE_MODELS)) {
            if (category[modelId]) {
                return { ...category[modelId], id: modelId };
            }
        }
        return { name: modelId, credits: 20 }; // Default
    };
}

// API URLs
const KIE_API_URL = 'https://api.kie.ai/api/v1';
const DEFAPI_URL = 'https://api.defapi.org/api';

const getEnv = (key) => {
    if (typeof process !== 'undefined' && process.env) return process.env[key];
    return null;
};

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
    // Main Generation Function
    generateImage: async (prompt, modelId = 'nano_banana', options = {}) => {
        // 1. Browser: Proxy to Backend
        if (isBrowser) {
            const formData = new FormData();

            // SECURITY: Get Telegram Init Data
            const initData = window.Telegram?.WebApp?.initData || '';
            formData.append('initData', initData);

            formData.append('prompt', prompt);
            formData.append('type', modelId);
            formData.append('userId', options.userId || 'browser_user');
            formData.append('aspectRatio', options.aspect_ratio || '1:1');
            if (options.source_files && Array.isArray(options.source_files)) {
                options.source_files.forEach(file => { if (file instanceof File) formData.append('files', file); });
                delete options.source_files;
            }
            if (options.video_files && Array.isArray(options.video_files)) {
                options.video_files.forEach(file => { if (file instanceof File) formData.append('video_files', file); });
                delete options.video_files;
            }
            formData.append('options', JSON.stringify(options));
            const res = await fetch('/api/generate', { method: 'POST', body: formData });
            if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Generation Failed'); }
            return (await res.json()).data;
        }

        // 2. Node.js: Direct API Call
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
    // ============================================
    // KIE.AI PROVIDER
    // ============================================
    generateWithKie: async (prompt, modelId, options = {}) => {
        console.log(`🔍 DEBUG: generateWithKie START. Prompt: ${prompt?.substring(0, 20)}... Model: '${modelId}'`);
        const apiKey = getEnv('KIE_API_KEY');
        if (!apiKey) throw new Error('KIE_API_KEY not set');

        // KIE MODEL MAPPING - Strictly based on Documentation
        const KIE_MAP = {
            // Google Family
            'nano_banana': 'google/nano-banana',
            'nano_banana_pro': 'nano-banana-pro',
            'nano_banana_edit': 'google/nano-banana-edit',
            'imagen4_fast': 'google/imagen4-fast',
            'imagen4': 'google/imagen4',
            'imagen4_ultra': 'google/imagen4-ultra',

            // Flux Family
            'flux_pro': 'flux-2/pro-text-to-image',
            'flux_flex': 'flux-2/flex-text-to-image',
            'flux_img_pro': 'flux-2/pro-image-to-image',
            'flux_img_flex': 'flux-2/flex-image-to-image',

            // Grok Family
            'grok_fast': 'grok-imagine/text-to-image',
            'grok_high': 'grok-imagine/text-to-image', // Default to text, switch if img provided
            'grok_img': 'grok-imagine/image-to-image',
            'grok_upscale': 'grok-imagine/upscale',

            // GPT
            'gpt_img': 'gpt-image/1.5-image-to-image',
            'gpt4o_image': 'gpt-image/1.5-text-to-image', // Assuming text variant exists or mapping to generic

            // Legacy / UI Mappings
            'flux-flex': 'flux-2/flex-text-to-image',
            'flux-pro': 'flux-2/pro-text-to-image',
            'seedream': 'seedream/4.5-text-to-image',

            // Video
            'kling_video': 'kling-v1.6/image-to-video',
            'kling_motion_control': 'kling-2.6/motion-control' // Uses control video param
        };

        // 1. Determine Correct Model ID
        let kieModelId = KIE_MAP[modelId];

        // Special handling for Kling Motion Control (not just mapping, preserving generic ID for logic)
        if (modelId === 'kling_motion_control') kieModelId = 'kling-2.6/motion-control';
        const hasSourceFiles = options.source_files && options.source_files.length > 0;

        // Auto-switch for generic model selections if images are present
        if (hasSourceFiles) {
            if (modelId === 'flux_pro' || modelId === 'flux-pro') kieModelId = 'flux-2/pro-image-to-image';
            if (modelId === 'flux_flex' || modelId === 'flux-flex') kieModelId = 'flux-2/flex-image-to-image';
            if (modelId === 'grok_high') kieModelId = 'grok-imagine/image-to-image';
            if (modelId === 'nano_banana') kieModelId = 'google/nano-banana-edit'; // Switch regular nano to edit if file present? Or maybe keep it separate.
        }

        if (!kieModelId) {
            // Fallback logic
            if (modelId.includes('video') || modelId.includes('kling')) {
                kieModelId = 'grok-imagine/image-to-video';
            } else if (hasSourceFiles) {
                kieModelId = 'grok-imagine/image-to-image';
            } else {
                kieModelId = 'grok-imagine/text-to-image';
            }
            console.log(`ℹ️ Auto-mapped '${modelId}' to '${kieModelId}'`);
        }

        console.log(`🚀 Using KIE Model: ${kieModelId}`);

        // 2. Prepare Input Object based on Model Family
        let input = { prompt: prompt };

        // Common params
        const aspectRatio = options.aspect_ratio || '1:1';

        // --- GOOGLE FAMILY ---
        if (kieModelId.startsWith('google/') || kieModelId === 'nano-banana-pro') {
            if (kieModelId === 'google/nano-banana') {
                input.image_size = aspectRatio; // Uses 'image_size' enum
                input.output_format = 'png';
            } else if (kieModelId === 'google/nano-banana-edit') {
                input.image_urls = options.source_files;
                // Docs don't show aspect ratio for edit, but maybe output_format
                input.output_format = 'png';
                // Prompt is required
                if (!hasSourceFiles) throw new Error('Nano Banana Edit requires a source image.');
            } else if (kieModelId === 'nano-banana-pro') {
                // Docs say: prompt, image_input (array), aspect_ratio, resolution
                input.aspect_ratio = aspectRatio;
                input.resolution = '1K'; // Default
                if (hasSourceFiles) {
                    input.image_input = options.source_files; // Note: 'image_input' not 'image_urls'
                } else {
                    input.image_input = [];
                }
            } else {
                // Imagen Models
                input.aspect_ratio = aspectRatio;
                input.num_images = '1';
            }
        }
        // --- FLUX FAMILY ---
        else if (kieModelId.startsWith('flux-2/')) {
            input.aspect_ratio = aspectRatio;
            input.resolution = '1K';

            if (kieModelId.includes('image-to-image')) {
                // Flex and Pro img2img use 'input_urls'
                if (!hasSourceFiles) throw new Error(`${kieModelId} requires input images.`);
                input.input_urls = options.source_files;
            }
        }
        // --- GROK FAMILY ---
        else if (kieModelId.startsWith('grok-imagine/')) {
            if (kieModelId === 'grok-imagine/text-to-image') {
                input.aspect_ratio = aspectRatio;
            } else if (kieModelId === 'grok-imagine/image-to-image') {
                if (!hasSourceFiles) throw new Error('Grok Image-to-Image requires an input image.');
                // Docs example shows array for 'image_urls' with maxItems: 1
                input.image_urls = [options.source_files[0]];
                // Docs DO NOT show aspect_ratio for Grok Img2Img in example, but schema might allow it. 
                // Let's omit it to be safe as per strict example.
            } else if (kieModelId === 'grok-imagine/upscale') {
                // Upscale takes task_id, handled separately usually, but if called via generate...
                // This flow primarily creates new tasks. Upscale might need a separate method.
                if (options.taskId) {
                    input = { task_id: options.taskId };
                }
            }
        }
        // --- KLING / VIDEO FAMILY ---
        else if (modelId === 'kling_motion_control' || kieModelId.includes('kling')) {
            input.prompt = prompt || 'Animate this image';
            input.aspect_ratio = aspectRatio;

            // Kling Motion Control specific inputs
            if (modelId === 'kling_motion_control' && options.video_files?.length > 0) {
                // Image (input_urls) + Driver Video (video_urls)
                input.input_urls = options.source_files; // Correct parameter for Image
                input.video_urls = options.video_files;
                input.character_orientation = 'video';
                input.mode = '720p';

                // Remove generic prompt if empty, but docs say prompt is string max 2500.
                if (!input.prompt) input.prompt = 'animate';
            } else if (hasSourceFiles) {
                // Standard Image-to-Video
                input.image_urls = options.source_files;
            }
        }
        // --- GPT FAMILY ---
        else if (kieModelId.startsWith('gpt-image/')) {
            if (kieModelId.includes('image-to-image')) {
                if (!hasSourceFiles) throw new Error('GPT Image-to-Image requires input images.');
                input.input_urls = options.source_files; // Docs say 'input_urls'
            }
        }
        // --- FALLBACK / GENERIC ---
        else {
            // For unknown models, send best-guess standard params
            input.aspect_ratio = aspectRatio;
            if (hasSourceFiles) {
                input.image_urls = options.source_files;
            }
        }

        // 3. Create Task
        /*
        const createRes = await fetch(`${KIE_API_URL}/jobs/createTask`, {
             // ...
        });
        */

        // Create task with correct Kie.ai structure
        const requestBody = {
            model: kieModelId,
            input: input
        };

        console.log('📤 Kie.ai Request:', JSON.stringify(requestBody, null, 2));

        // Create task
        const createRes = await fetch(`${KIE_API_URL}/jobs/createTask`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!createRes.ok) {
            const errorText = await createRes.text();
            console.error('❌ Kie.ai API Error:', errorText);
            throw new Error(`Kie.ai API error: ${createRes.status} - ${errorText}`);
        }

        const responseData = await createRes.json();
        console.log('📦 Kie.ai Response:', JSON.stringify(responseData, null, 2));

        // Parse task ID (multiple possible formats)
        let taskId = null;

        // Try different response structures
        if (responseData.data?.task_id) {
            taskId = responseData.data.task_id;
        } else if (responseData.data?.taskId) {
            taskId = responseData.data.taskId;
        } else if (responseData.task_id) {
            taskId = responseData.task_id;
        } else if (responseData.taskId) {
            taskId = responseData.taskId;
        } else if (responseData.id) {
            taskId = responseData.id;
        }

        if (!taskId) {
            console.error('❌ No task ID found in response:', responseData);

            // Check for specific error codes
            if (responseData.code === 402) {
                throw new Error('Недостаточно кредитов на Kie.ai. Пополните баланс на https://kie.ai/dashboard');
            } else if (responseData.code === 422) {
                throw new Error(`Модель не поддерживается: ${responseData.msg}`);
            } else if (responseData.msg) {
                throw new Error(`Kie.ai error: ${responseData.msg}`);
            } else {
                throw new Error('Kie.ai did not return a task ID. Check API key and model availability.');
            }
        }

        console.log(`📋 Kie.ai Task created: ${taskId}`);

        // Poll for result
        return await aiService.pollKieTask(taskId, apiKey);
    },

    // Poll Kie.ai Task
    pollKieTask: async (taskId, apiKey) => {
        // Polling logic
        const maxAttempts = 400; // 400 * 3s = 20 minutes (Kling Video takes time)

        for (let i = 0; i < maxAttempts; i++) {
            await new Promise(r => setTimeout(r, 3000)); // Wait 3 seconds

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

            // Log full response for debugging
            if (i === 0 || i % 10 === 0) {
                console.log(`�� Poll Response:`, JSON.stringify(data, null, 2));
            }

            // Parse status (Kie.ai uses 'state' not 'status')
            const status = data.data?.state || data.state || data.data?.state || data.state || data.data?.status || data.status;
            console.log(`⏳ Kie.ai Task ${taskId}: ${status}`);

            if (status === 'success' || status === 'completed') {
                // Kie.ai returns resultJson as a JSON STRING, not object
                let resultData = data.data?.resultJson || data.resultJson || data.data?.result || data.result;

                // Parse if it's a string
                if (typeof resultData === 'string') {
                    try {
                        resultData = JSON.parse(resultData);
                    } catch (e) {
                        console.warn('⚠️ Failed to parse resultJson:', e);
                    }
                }

                let imageUrl = null;

                // Parse result (multiple formats)
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
                } else {
                    console.error('❌ No image URL found in result:', resultData);
                }
            }

            if (status === 'failed' || status === 'error') {
                const error = data.data?.error || data.error || 'Unknown error';
                throw new Error(`Kie.ai generation failed: ${error}`);
            }
        }

        throw new Error('Kie.ai task timeout (6 minutes)');
    },

    // ============================================
    // DEFAPI PROVIDER (Fallback)
    // ============================================
    generateWithDefAPI: async (prompt, modelId, options = {}) => {
        const apiKey = getEnv('DEFAPI_KEY');
        if (!apiKey) throw new Error('DEFAPI_KEY not set');

        const apiModel = DEFAPI_MODEL_MAP[modelId] || DEFAPI_MODEL_MAP['nano_banana'];
        console.log(`🚀 DefAPI: ${apiModel}`);

        // Prepare payload
        const payload = {
            model: apiModel,
            prompt: prompt,
            aspect_ratio: options.aspect_ratio || '1:1',
            ...options
        };

        // Submit task
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

    // Poll DefAPI Task
    pollDefAPITask: async (taskId, apiKey) => {
        const maxAttempts = 300;

        for (let i = 0; i < maxAttempts; i++) {
            await new Promise(r => setTimeout(r, 2000));

            let data;
            try {
                const res = await fetch(`${DEFAPI_URL}/task/query?task_id=${taskId}`, {
                    headers: { 'Authorization': `Bearer ${apiKey}` }
                });
                data = await res.json();
            } catch (err) {
                console.warn(`⚠️ DefAPI polling attempt ${i} failed, retrying...`);
                continue;
            }

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

                if (resultUrl) {
                    return { success: true, imageUrl: resultUrl };
                }
            }

            if (data.data?.status === 'failed' || data.data?.status === 'error') {
                throw new Error(data.data.message || 'DefAPI failed');
            }
        }

        throw new Error('DefAPI timeout');
    },

    // ============================================
    // ASYNC JOB QUEUE (Browser)
    // ============================================
    generateImageAsync: async (prompt, modelId = 'nano_banana', options = {}) => {
        if (!isBrowser) {
            throw new Error('generateImageAsync is only available in browser mode');
        }

        const createRes = await fetch('/api/jobs/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: options.userId || 'browser_user',
                prompt: prompt,
                modelId: modelId,
                configuration: options,
                sourceFiles: options.source_files || [],
                jobType: 'image'
            })
        });

        if (!createRes.ok) {
            const err = await createRes.json();
            throw new Error(err.error || 'Failed to create job');
        }

        const { jobId } = await createRes.json();
        console.log(`📋 Job created: ${jobId}`);

        // Poll for completion
        const maxAttempts = 400; // 400 * 3s = 20 minutes
        for (let i = 0; i < maxAttempts; i++) {
            await new Promise(r => setTimeout(r, 3000));

            const statusRes = await fetch(`/api/jobs/${jobId}`);
            if (!statusRes.ok) {
                throw new Error('Failed to fetch job status');
            }

            const { job } = await statusRes.json();
            console.log(`⏳ Job ${jobId} status: ${job.status}`);

            if (job.status === 'completed') {
                return {
                    success: true,
                    result: [job.result_url],
                    imageUrl: job.result_url,
                    meta: { jobId: jobId }
                };
            }

            if (job.status === 'failed') {
                throw new Error(job.error_message || 'Generation failed');
            }
        }

        throw new Error('Job timeout - took longer than 3 minutes');
    },

    // Helper for Templates (Frontend)
    generateFromTemplate: async (config) => {
        return aiService.generateImage(config.prompt, config.modelId, {
            ...config.configuration,
            source_files: config.files
        });
    },

    // Model Training (Stub/Placeholder)
    trainModel: async (images, triggerWord, type) => {
        console.log(`🚂 Training Stub: ${triggerWord} with ${images.length} images`);
        await new Promise(r => setTimeout(r, 2000));
        return { success: true, taskId: 'mock_train_' + Date.now() };
    }
};

export { aiService };
