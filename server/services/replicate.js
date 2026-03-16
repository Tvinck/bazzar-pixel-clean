import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

// KIE API key from environment only
const KIE_API_KEY = process.env.KIE_API_KEY;
const BASE_URL = 'https://api.kie.ai/api/v1';

export const replicateService = {
    /**
     * Generate Lip-Sync Video via Kie.ai (Hallo Model)
     * @param {string} sourceUrl - URL of the avatar image
     * @param {string} text - (Unused in Hallo, kept for signature)
     * @param {string} audioUrl - URL of the driving audio (REQUIRED for Hallo)
     * @returns {Promise<object>}
     */
    generateLipSync: async (sourceUrl, text, audioUrl) => {
        console.log('🎬 [Kie.ai] Starting Video Generation (Hallo)...');
        console.log('   Source:', sourceUrl);
        console.log('   Audio:', audioUrl);

        if (!audioUrl) {
            return { success: false, error: 'Audio URL is required for Hallo model' };
        }

        try {
            // 1. Create Task
            const createRes = await fetch(`${BASE_URL}/jobs/createTask`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${KIE_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'kling/ai-avatar-standard',
                    input: {
                        image_url: sourceUrl,
                        audio_url: audioUrl,
                        prompt: "A photorealistic video of a person talking, natural movements, high quality"
                    }
                })
            });

            const createData = await createRes.json();

            // Error Handling for Create
            if (createData.code !== 200 || !createData.data?.taskId) {
                console.error('Kie.ai Video Create Failed:', createData);
                return { success: false, error: createData.msg || 'Video Task Failed' };
            }

            const taskId = createData.data.taskId;
            console.log(`⏳ Video Task Created: ${taskId}. Polling...`);

            // 2. Poll for Completion (Video takes longer, ~30-60s, sometimes up to 5 mins)
            let attempts = 0;
            const maxAttempts = 180; // 180 * 2s = 360s (6 mins) timeout

            while (attempts < maxAttempts) {
                await new Promise(r => setTimeout(r, 2000));

                const checkRes = await fetch(`${BASE_URL}/jobs/recordInfo?taskId=${taskId}`, {
                    headers: { 'Authorization': `Bearer ${KIE_API_KEY}` }
                });
                const checkData = await checkRes.json();

                if (checkData.code === 200) {
                    const status = checkData.data.state;

                    if (status === 'success') {
                        console.log('✅ Video Task Success!');
                        let resultObj;
                        try {
                            resultObj = JSON.parse(checkData.data.resultJson);
                        } catch (e) {
                            return { success: false, error: 'Invalid Result JSON' };
                        }

                        // Kie video results usually in resultUrls array
                        const videoUrl = resultObj.resultUrls?.[0] || resultObj.url;
                        if (!videoUrl) return { success: false, error: 'No video URL returned' };

                        return { success: true, videoUrl: videoUrl };

                    } else if (status === 'fail') {
                        return { success: false, error: checkData.data.failMsg };
                    }
                }
                attempts++;
            }

            return { success: false, error: 'Timeout waiting for video' };

        } catch (error) {
            console.error('Kie.ai Service Error:', error);
            return { success: false, error: error.message };
        }
    }
};
