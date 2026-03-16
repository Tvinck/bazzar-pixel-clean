import { supabase } from './lib/supabase';

/**
 * СЕРВИС ГЕНЕРАЦИИ (Frontend)
 * Этот модуль отвечает за взаимодействие фронтенда с API генерации.
 * Большинство запросов делегируется асинхронной очереди (Job Queue) для 
 * избежания таймаутов браузера при долгих генерациях.
 */
const aiService = {
    // Основная функция генерации — ставит задачу в очередь на бэкенд
    generateImage: async (prompt, modelId = 'nano_banana', options = {}) => {
        console.log('🌐 Browser Mode: Delegating to Async Job Queue...');
        try {
            // Pass modelId as separate option for explicit server-side handling
            return await aiService.generateImageAsync(prompt, modelId, { ...options, modelId });
        } catch (e) {
            console.error('Async Generation Error:', e);
            return { success: false, error: e.message };
        }
    },

    // ============================================
    // INPAINTING (Mask Based) - Browser Only
    // ============================================
    editImage: async (prompt, imageBase64, maskBase64) => {
        // Convert base64s to data URIs for generateImageAsync to handle
        const imageUri = `data:image/png;base64,${imageBase64}`;
        const maskUri = `data:image/png;base64,${maskBase64}`;

        console.log('🎨 Sending Inpainting Request...');

        return await aiService.generateImageAsync(prompt, 'inpainting', {
            modelId: 'flux_img_pro', // Default inpainting model
            source_files: [imageUri, maskUri],
            mask_image: maskUri, // Explicit option just in case
            mode: 'inpainting'
        });
    },

    // ============================================
    // ASYNC JOB QUEUE (Browser / Proxy)
    // ============================================
    generateImageAsync: async (prompt, type = 'image', options = {}) => {
        // Prepare FormData for /api/generate
        const formData = new FormData();
        formData.append('prompt', prompt);
        formData.append('type', type);
        formData.append('userId', options.userId || 'browser_user');
        formData.append('initData', window.Telegram?.WebApp?.initData || '');

        // Handle source files
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
                    } catch (e) {
                        console.warn(`⚠️ Failed to parse file ${i} as base64:`, e.message);
                    }
                }
            });
        }

        // Handle Video/Audio files similarly if needed (ommited for brevity if not strictly utilized yet, but copying from original is safer)
        if (options.video_files && Array.isArray(options.video_files)) {
            options.video_files.forEach((file, i) => {
                if (file instanceof File) {
                    formData.append('files', file, file.name);
                } else if (typeof file === 'string') {
                    try {
                        let base64 = file;
                        let mime = 'video/mp4';
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
                        while (n--) u8arr[n] = bstr.charCodeAt(n);
                        const blob = new Blob([u8arr], { type: mime });
                        const extension = mime.split('/')[1] || 'mp4';
                        formData.append('files', blob, `video_${i}.${extension}`);
                    } catch (e) { console.warn('Video parse error', e); }
                }
            });
        }

        // Pass other options as JSON string
        const cleanOptions = { ...options };
        // Remove large files from JSON options
        delete cleanOptions.source_files;
        delete cleanOptions.video_files;
        delete cleanOptions.audio_files;

        formData.append('options', JSON.stringify(cleanOptions));

        const createRes = await fetch('/api/generation/generate', {
            method: 'POST',
            body: formData
        });

        if (!createRes.ok) {
            let errorMsg = 'Generation request failed';
            try {
                const err = await createRes.json();
                errorMsg = err.error || errorMsg;
            } catch {
                errorMsg = `Server Error (${createRes.status})`;
            }
            throw new Error(errorMsg);
        }

        const data = await createRes.json();
        const newBalance = data.newBalance;

        // Extract jobId defensively — backend may return string UUID or { id, imageUrl } object
        const rawJobId = data.jobId;
        const jobId = typeof rawJobId === 'object' && rawJobId !== null ? rawJobId.id : rawJobId;

        // If the server already completed the job synchronously (Vercel fallback), return immediately
        const immediateUrl = data.imageUrl || (typeof rawJobId === 'object' ? rawJobId?.imageUrl : null);
        if (immediateUrl) {
            console.log('⚡ Sync result received, skipping poll.');
            return { success: true, imageUrl: immediateUrl, id: jobId, newBalance };
        }

        if (!jobId) {
            if (data.data?.imageUrl) return { success: true, imageUrl: data.data.imageUrl, newBalance };
            throw new Error('No Job ID returned from server');
        }

        // Poll for completion
        const maxAttempts = 400; // 20 minutes
        for (let i = 0; i < maxAttempts; i++) {
            await new Promise(r => setTimeout(r, 3000));

            const statusRes = await fetch(`/api/generation/jobs/${jobId}`);
            if (!statusRes.ok) continue;

            const { job } = await statusRes.json();
            // console.log(`⏳ Job ${jobId} status: ${job.status}`);

            if (job.status === 'completed') {
                return {
                    success: true,
                    imageUrl: job.result_url,
                    meta: { jobId: jobId },
                    newBalance
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
        try {
            const { data } = await supabase.from('ai_models').select('*').eq('is_active', true).order('cost', { ascending: true });
            return data || [];
        } catch (e) {
            console.error('⚠️ Failed to load models from DB', e);
            return [];
        }
    },

    // Stub for training
    trainModel: async (images, triggerWord) => {
        console.log(`🚂 Training Stub: ${triggerWord}`);
        await new Promise(r => setTimeout(r, 2000));
        return { success: true, taskId: 'mock_train_' + Date.now() };
    },

    // Poll logic for browser (reused if needed, though mostly handled by jobs now)
    pollKieTask: async () => {
        // Implementation via proxy if needed
        // For now, job system handles polling
        return { success: false, error: 'Legacy poll called' };
    }
};

export { aiService };
