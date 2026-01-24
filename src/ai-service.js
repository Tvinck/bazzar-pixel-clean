const isBrowser = typeof window !== 'undefined';
const HARDCODED_KIE_KEY = '365b6afae3b952cef9297bbc5384ec8e';

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
        // 1. Browser: Use Async Job Queue (Vercel Friendly)
        if (isBrowser) {
            console.log('🌐 Browser Mode: Delegating to Async Job Queue...');
            // We delegate to generateImageAsync which handles FormData upload (File -> URL)
            // This is critical for Video templates where Base64 is too large for Proxy.
            // It also ensures consistent behavior with the backend queue.
            try {
                // Pass modelId as 'type' or in options, generateImageAsync signature is (prompt, type, options)
                // We treat modelId as the specific model, type is broadly 'image' or 'video' but routes.js handles cost via modelKey.
                // Let's pass modelId as type to ensure pricing lookup works, or pass it in options.modelId
                return await aiService.generateImageAsync(prompt, modelId, { ...options, modelId });
            } catch (e) {
                console.error('Async Generation Error:', e);
                return { success: false, error: e.message };
            }
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

        const apiKey = !isBrowser ? (getEnv('KIE_API_KEY') || HARDCODED_KIE_KEY) : null;
        if (!isBrowser && !apiKey) throw new Error('KIE_API_KEY not set');

        // KIE MODEL MAPPING - Strictly based on Documentation
        const KIE_MAP = {
            // Google Family
            'nano_banana': 'nano-banana',
            'nano_banana_pro': 'nano-banana-pro',
            'nano_banana_edit': 'nano-banana-edit',
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
                input.input_urls = options.source_files;
                input.output_format = 'png';
                if (!hasSourceFiles) throw new Error('Nano Banana Edit requires a source image.');
            } else if (kieModelId === 'nano-banana-pro') {
                input.aspect_ratio = aspectRatio;
                input.resolution = options.resolution || '1K';
                input.output_format = options.output_format || 'png';
                if (hasSourceFiles) {
                    input.image_input = options.source_files;
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
                // Docs example shows array for 'image_urls' or 'input_urls'
                input.input_urls = [options.source_files[0]];
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
            // Kling usually doesn't need a prompt if driving with video, but we provide a default
            input.prompt = prompt || 'Animate this character matching the reference video';
            input.aspect_ratio = aspectRatio;

            // Kling Motion Control specific inputs
            if (modelId === 'kling_motion_control' && options.video_files?.length > 0) {
                const img = options.source_files?.[0];
                const vid = options.video_files?.[0];

                if (!img) throw new Error(`Kling Motion Control missing source image. Source files: ${JSON.stringify(options.source_files)}`);
                if (!vid) throw new Error(`Kling Motion Control missing reference video. Video files: ${JSON.stringify(options.video_files)}`);

                // Schema fix based on DOCUMENTATION provided by User
                // Must be arrays: input_urls, video_urls
                input.input_urls = [img];
                input.video_urls = [vid];

                // Specific Params
                input.character_orientation = 'video';
                input.mode = '720p'; // Doc says "720p" or "1080p", not "std"

                // Ensure we don't have conflicting keys that might confuse the validator
                // delete input.input_video; // Keep them now, maybe needed?
                // delete input.input_image;
            } else if (hasSourceFiles) {
                // Standard Image-to-Video
                input.input_image = options.source_files[0]; // Explicit single input
                input.input_urls = options.source_files;
            }
        }
        // --- GPT FAMILY ---
        else if (kieModelId.startsWith('gpt-image/')) {
            if (kieModelId.includes('image-to-image')) {
                if (!hasSourceFiles) throw new Error('GPT Image-to-Image requires input images.');
                input.input_urls = options.source_files;
            }
        }
        // 3. Final Regularization for Kie.ai API quirks
        const normalizeKieInput = (targetInput, targetModel) => {
            // SPECIAL CASE: Kling Motion Control (Strict Schema)
            // We manually constructed the perfect payload above. Do not touch it.
            if (targetModel.includes('motion-control') || targetModel === 'kling_motion_control') {
                return targetInput;
            }

            const normalized = { ...targetInput };
            const files = options.source_files || [];

            if (files.length > 0) {
                // For nano-banana-pro, use only image_input to be safe.
                if (targetModel === 'nano-banana-pro') {
                    normalized.image_input = files;
                } else {
                    // For most other models, provide BOTH image_urls and input_urls 
                    // to satisfy different schema versions on internal KIE runners.
                    normalized.image_urls = files;
                    normalized.input_urls = files;

                    if (files.length === 1) {
                        normalized.image_url = files[0];
                        normalized.input_url = files[0];
                    }
                }
            }

            return normalized;
        };

        const finalInput = normalizeKieInput(input, kieModelId);

        // 4. Create Task
        const requestBody = {
            model: kieModelId,
            input: finalInput
        };

        // 3. Create Task
        /*
        const createRes = await fetch(`${KIE_API_URL}/jobs/createTask`, {
             // ...
        });
        */

        if (!isBrowser) {
            console.log(`📡 [Kie Worker] Target Model: ${kieModelId}`);
            console.log(`📡 [Kie Worker] Final Input Body:`, JSON.stringify(finalInput, null, 2));
            console.log(`📡 [Kie Worker] Full Request Body:`, JSON.stringify(requestBody, null, 2));
        } else {
            console.log('📤 Kie.ai Request:', JSON.stringify(requestBody, null, 2));
        }

        // Create task
        // Create task (Proxy or Direct)
        let createRes;

        if (isBrowser) {
            createRes = await fetch('/api/proxy?action=create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider: 'kie',
                    model: requestBody.model,
                    input: requestBody.input,
                    userId: options.userId // Pass User ID for Billing
                })
            });
        } else {
            createRes = await fetch(`${KIE_API_URL}/jobs/createTask`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
        }

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

            const debugInfo = {
                model: kieModelId,
                keys: Object.keys(finalInput),
                input_urls: finalInput.input_urls,
                video_urls: finalInput.video_urls,
                mode: finalInput.mode
            };

            throw new Error(`Kie.ai error: ${errorText}. Debug: ${JSON.stringify(debugInfo)}`);
        }

        // Validate JSON content type
        const contentType = createRes.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const textRaw = await createRes.text();
            console.error('❌ Server returned non-JSON:', textRaw);
            throw new Error(`Server Error (Not JSON): ${textRaw.substring(0, 50)}...`);
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

        if (options.skipPolling) {
            console.log('⏩ Skipping polling (Async Mode)');
            return { success: true, taskId, status: 'pending', provider: 'kie' };
        }

        // Poll for result
        return await aiService.pollKieTask(taskId, apiKey);
    },

    // Poll Kie.ai Task
    pollKieTask: async (taskId, apiKey) => {
        // Polling logic
        const maxAttempts = 600;

        for (let i = 0; i < maxAttempts; i++) {
            // Adaptive Polling: Check every 1s for first 15s (fast models), then 3s
            const delay = i < 15 ? 1000 : 3000;
            await new Promise(r => setTimeout(r, delay));

            let data;
            try {

                let res;
                if (isBrowser) {
                    res = await fetch(`/api/proxy?action=check&provider=kie&taskId=${taskId}`);
                } else {
                    res = await fetch(`${KIE_API_URL}/jobs/recordInfo?taskId=${taskId}`, {
                        headers: { 'Authorization': `Bearer ${apiKey}` }
                    });
                }
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
    // TOOLS / EDIT
    // ============================================
    instructEdit: async (base64Img, instructions) => {
        console.log('✨ instructEdit called', instructions);

        let modelId = 'nano_banana_edit'; // Default edit model
        let prompt = '';

        // Map mode to Prompt/Model logic
        if (instructions.mode === 'replace-object') {
            prompt = `Replace ${instructions.old_object} with ${instructions.new_object}`;
        } else if (instructions.mode === 'remove-object') {
            prompt = `Remove ${instructions.remove_object}`;
        } else if (instructions.mode === 'add-object') {
            prompt = `Add ${instructions.new_object}`;
        } else {
            prompt = instructions.prompt || 'Edit image';
        }

        // Use 'generateWithKie' logic but with specific params
        // We pass the base64 string directly as a source file
        // The API expects URL or Base64. generateWithKie handles raw 'source_files'

        // Construct a data URI since generateWithKie/proxy might expect it or handles raw?
        // Let's pass full data URI to be safe as 'input_urls' often need scheme.
        const dataUri = `data:image/jpeg;base64,${base64Img}`;

        return await aiService.generateWithKie(prompt, modelId, {
            source_files: [dataUri],
            aspect_ratio: '1:1' // Usually preserves input ratio, but required param
        });
    },

    // ============================================
    // ASYNC JOB QUEUE (Browser)
    // ============================================
    generateImageAsync: async (prompt, type = 'image', options = {}) => {
        if (!isBrowser) {
            throw new Error('generateImageAsync is only available in browser mode');
        }

        // Prepare FormData for /api/generate
        const formData = new FormData();
        formData.append('prompt', prompt);
        formData.append('type', type);
        formData.append('userId', options.userId || 'browser_user');
        formData.append('initData', window.Telegram?.WebApp?.initData || '');

        // Handle source files if they are File objects or base64 strings
        if (options.source_files && Array.isArray(options.source_files)) {
            options.source_files.forEach((file, i) => {
                if (file instanceof File) {
                    formData.append('files', file, file.name);
                } else if (typeof file === 'string') {
                    try {
                        let base64 = file;
                        let mime = 'image/jpeg';

                        if (file.startsWith('data:')) {
                            const parts = file.split(',');
                            if (parts.length > 1) {
                                const match = parts[0].match(/:(.*?);/);
                                mime = match ? match[1] : 'image/jpeg';
                                base64 = parts[1];
                            }
                        }

                        // Convert base64 to Blob
                        const bstr = atob(base64);
                        let n = bstr.length;
                        const u8arr = new Uint8Array(n);
                        while (n--) {
                            u8arr[n] = bstr.charCodeAt(n);
                        }
                        const blob = new Blob([u8arr], { type: mime });
                        const extension = mime.split('/')[1] || 'jpg';
                        formData.append('files', blob, `source_${i}.${extension}`);
                        console.log(`📎 Appended file ${i} (${mime}) from base64`);
                    } catch (e) {
                        console.warn(`⚠️ Failed to parse file ${i} as base64:`, e.message);
                        // If it's not base64, maybe it's a URL. We'll let the backend handle it via options if needed.
                    }
                }
            });
        }

        // Handle VIDEO files (Same logic to support FormData upload)
        if (options.video_files && Array.isArray(options.video_files)) {
            options.video_files.forEach((file, i) => {
                // Logic mostly mirrors source_files but ensures video MIME types
                if (file instanceof File) {
                    formData.append('files', file, file.name);
                } else if (typeof file === 'string') {
                    try {
                        let base64 = file;
                        let mime = 'video/mp4'; // guess

                        if (file.startsWith('data:')) {
                            const parts = file.split(',');
                            if (parts.length > 1) {
                                const match = parts[0].match(/:(.*?);/);
                                mime = match ? match[1] : 'video/mp4';
                                base64 = parts[1];
                            }
                        }

                        const bstr = atob(base64);
                        let n = bstr.length;
                        const u8arr = new Uint8Array(n);
                        while (n--) {
                            u8arr[n] = bstr.charCodeAt(n);
                        }
                        const blob = new Blob([u8arr], { type: mime });
                        const extension = mime.split('/')[1] || 'mp4';
                        formData.append('files', blob, `video_${i}.${extension}`);
                        console.log(`📎 Appended VIDEO file ${i} (${mime}) from base64`);
                    } catch (e) {
                        console.warn(`⚠️ Failed to parse video ${i} as base64`, e);
                    }
                }
            });
        }

        // Pass other options as JSON string
        // CRITICAL FIX: We must KEEP http URLs in the JSON options (e.g. from templates)
        // while removing Base64/Files (which are uploaded via FormData).
        const cleanOptions = { ...options };

        if (Array.isArray(cleanOptions.source_files)) {
            cleanOptions.source_files = cleanOptions.source_files.filter(f => typeof f === 'string' && f.startsWith('http'));
        } else {
            delete cleanOptions.source_files;
        }

        if (Array.isArray(cleanOptions.video_files)) {
            cleanOptions.video_files = cleanOptions.video_files.filter(f => typeof f === 'string' && f.startsWith('http'));
        } else {
            delete cleanOptions.video_files;
        }

        formData.append('options', JSON.stringify(cleanOptions));

        const createRes = await fetch('/api/generate', {
            method: 'POST',
            body: formData
        });

        if (!createRes.ok) {
            let errorMsg = 'Generation request failed';
            try {
                const err = await createRes.json();
                errorMsg = err.error || errorMsg;
            } catch (jsonErr) {
                // If not JSON, it might be a 404/500 HTML page from Vercel/Express
                errorMsg = `Server Error (${createRes.status}): ${createRes.statusText}`;
            }
            throw new Error(errorMsg);
        }

        const data = await createRes.json();
        const jobId = data.jobId;

        if (!jobId) {
            if (data.data?.imageUrl) return { success: true, imageUrl: data.data.imageUrl };
            throw new Error('No Job ID returned from server');
        }

        console.log(`📋 Job started: ${jobId}`);

        // Poll for completion
        const maxAttempts = 400; // 20 minutes
        for (let i = 0; i < maxAttempts; i++) {
            await new Promise(r => setTimeout(r, 3000));

            const statusRes = await fetch(`/api/jobs/${jobId}`);
            if (!statusRes.ok) {
                // For polling, we might be more lenient or throw
                console.warn(`Polling status failed (${statusRes.status})`);
                continue;
            }

            const { job } = await statusRes.json();
            console.log(`⏳ Job ${jobId} status: ${job.status}`);

            if (job.status === 'completed') {
                return {
                    success: true,
                    imageUrl: job.result_url,
                    meta: { jobId: jobId }
                };
            }

            if (job.status === 'failed') {
                throw new Error(job.error_message || 'Generation failed');
            }
        }

        throw new Error('Job timeout - took longer than 20 minutes');
    },

    // Helper for Templates (Frontend)
    generateFromTemplate: async (config) => {
        return aiService.generateImage(config.prompt, config.modelId, {
            ...config.configuration,
            source_files: config.files
        });
    },

    // Get Dynamic Models Configuration
    getModels: async () => {
        if (!isBrowser) return [];

        try {
            const { supabase } = await import('./lib/supabase');
            const { data } = await supabase.from('ai_models').select('*').eq('is_active', true).order('cost', { ascending: true });
            return data || [];
        } catch (e) {
            console.error('⚠️ Failed to load models from DB', e);
            return [];
        }
    },

    // Model Training (Stub/Placeholder)
    trainModel: async (images, triggerWord, type) => {
        console.log(`🚂 Training Stub: ${triggerWord} with ${images.length} images`);
        await new Promise(r => setTimeout(r, 2000));
        return { success: true, taskId: 'mock_train_' + Date.now() };
    },

    // ============================================
    // MAGIC PROMPT (LLM Enhancement)
    // ============================================
    enhancePrompt: async (originalPrompt) => {
        if (!originalPrompt || originalPrompt.length > 300) return originalPrompt; // Don't touch long prompts

        const apiKey = !isBrowser ? (getEnv('KIE_API_KEY') || HARDCODED_KIE_KEY) : null;
        if (!apiKey) return originalPrompt;

        console.log(`✨ Enhancing prompt: "${originalPrompt}"...`);

        try {
            // Using KIE's OpenAI-compatible endpoint
            const res = await fetch('https://api.kie.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini', // Fast & Cheap
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

            if (!res.ok) {
                const errText = await res.text();
                // If 404, maybe KIE doesn't support chat at this endpoint.
                if (res.status === 404) console.warn('⚠️ KIE Chat API 404. Skipping enhancement.');
                else console.warn(`⚠️ Prompt enhancement failed (${res.status}): ${errText}`);
                return originalPrompt;
            }

            const data = await res.json();
            const enhanced = data.choices?.[0]?.message?.content?.trim();

            if (enhanced) {
                console.log(`✨ Enhanced: "${enhanced}"`);
                return enhanced;
            }
        } catch (e) {
            console.error('⚠️ Enhancement error:', e.message);
        }

        return originalPrompt;
    }
};

export { aiService };
