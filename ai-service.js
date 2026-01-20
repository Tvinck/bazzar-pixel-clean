import { GOOGLE_API_KEYS, AI_MODELS, DEFAPI_BASE_URL } from './src/config/ai_keys.js';
import apiClient from './src/utils/secureAPI.js';
import { validatePrompt } from './src/utils/validation.js';

class AIService {
    constructor() {
        this.currentKeyIndex = 0;
        console.log("🍌 AI Service Initialized.");

        // Configure API Client
        // Note: DEFAPI_BASE_URL might be full URL, but apiClient constructor handles base path.
        // We will override base URL for specific external calls or configure it here.
        // For this refactor, we'll keep the full URLs but use apiClient's secureFetch method which we'll expose or use wrapper methods.
        // Actually, secureAPI is designed to be the wrapper. Let's adapt it.
    }

    getActiveKey() {
        return GOOGLE_API_KEYS[this.currentKeyIndex];
    }

    async executeWithRetry(operation, retryCount = 0) {
        try {
            return await operation();
        } catch (error) {
            console.error('API execution failed:', error);
            if (retryCount < GOOGLE_API_KEYS.length - 1) {
                this.rotateKey();
                return this.executeWithRetry(operation, retryCount + 1);
            }
            throw error;
        }
    }

    rotateKey() {
        this.currentKeyIndex = (this.currentKeyIndex + 1) % GOOGLE_API_KEYS.length;
        console.log(`🔄 Rotating API Key to index: ${this.currentKeyIndex}`);
    }

    // Helper to get headers with current key
    _getHeaders() {
        return {
            'Authorization': `Bearer ${this.getActiveKey()}`
        };
    }

    async generateImage(prompt, type = 'Nano Banana', aspectRatio = '1:1') {
        const validation = validatePrompt(prompt);
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        const modelId = type === 'Nano Banana' ? AI_MODELS.IMAGE_FAST : AI_MODELS.IMAGE_PRO;

        return this.executeWithRetry(async () => {
            console.log(`🍌 Generating using ${modelId} (${aspectRatio}) via Secure API...`);

            // Using apiClient.post ensures CSRF, Rate Limiting, Sanitization
            const response = await apiClient.post(`${DEFAPI_BASE_URL}/image/gen`, {
                model: modelId,
                prompt: validation.sanitized,
                aspect_ratio: aspectRatio
            }, {
                headers: this._getHeaders(),
                rateLimitType: 'generation'
            });

            return this._handleResponseData(response);
        });
    }

    async editImage(prompt, initImage, maskImage) {
        const validation = validatePrompt(prompt);
        if (!validation.valid) throw new Error(validation.error);

        return this.executeWithRetry(async () => {
            console.log(`🎨 Editing image via Secure API...`);
            const response = await apiClient.post(`${DEFAPI_BASE_URL}/image/edit`, {
                prompt: validation.sanitized,
                image: initImage,
                mask: maskImage,
                model: 'inpainting-1.0'
            }, {
                headers: this._getHeaders(),
                rateLimitType: 'generation'
            });
            return this._handleResponseData(response);
        });
    }

    async swapFace(targetImage, sourceImage) {
        return this.executeWithRetry(async () => {
            console.log(`🎭 Swapping face via Secure API...`);
            const response = await apiClient.post(`${DEFAPI_BASE_URL}/image/face-swap`, {
                target_image: targetImage,
                source_image: sourceImage,
                model: 'faceswap-v2'
            }, {
                headers: this._getHeaders(),
                rateLimitType: 'generation'
            });
            return this._handleResponseData(response);
        });
    }

    async trainModel(images, triggerWord, modelType = 'person') {
        return this.executeWithRetry(async () => {
            console.log(`🏋️‍♀️ Starting Model Training for '${triggerWord}'...`);
            const response = await apiClient.post(`${DEFAPI_BASE_URL}/model/train`, {
                images: images,
                trigger_word: triggerWord,
                type: modelType,
                model_name: `lora_${Date.now()}_${triggerWord}`
            }, {
                headers: this._getHeaders(),
                rateLimitType: 'generation' // Should arguably be 'upload' or 'training'
            });
            return this._handleResponseData(response);
        });
    }

    _handleResponseData(data) {
        // apiClient already parses JSON and checks for ok status/throws errors
        if (data.code === 0 && data.data?.task_id) {
            return this.pollTaskStatus(data.data.task_id);
        } else {
            throw new Error(data.message || 'Unknown API Error');
        }
    }

    async pollTaskStatus(taskId) {
        console.log(`⏳ Polling task: ${taskId}`);
        const maxAttempts = 60;
        const delay = 2000;

        for (let i = 0; i < maxAttempts; i++) {
            await new Promise(r => setTimeout(r, delay));

            try {
                // Using secureFetch directly for GET with full URL control if needed, 
                // or apiClient.get if we can pass the full URL. 
                // apiClient.get expects endpoint relative to base usually, but if we pass full url starting with http...
                // Let's assume apiClient handles absolute URLs gracefully or we use secureFetch.

                // Note: apiClient.get() calls secureFetch which does validation.
                const data = await apiClient.get(`${DEFAPI_BASE_URL}/task/query?task_id=${taskId}`, {
                    headers: this._getHeaders()
                });

                if (data.code === 0) {
                    const status = data.data.status;
                    console.log(`📡 Status: ${status}`);

                    if (status === 'success') {
                        if (data.data.result?.image) {
                            return { success: true, imageUrl: data.data.result.image };
                        } else if (typeof data.data.result === 'string') {
                            return { success: true, imageUrl: data.data.result };
                        } else {
                            throw new Error('Image generation successful but no image URL found.');
                        }
                    } else if (status === 'failed') {
                        throw new Error(data.data.status_reason?.message || 'Generation failed');
                    }
                }
            } catch (err) {
                console.warn(`Polling error (attempt ${i}):`, err.message);
                if (i === maxAttempts - 1) throw err;
            }
        }
        throw new Error('Generation timed out');
    }
}

export const aiService = new AIService();
