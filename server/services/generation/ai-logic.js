import { supabase } from '../../shared/index.js';

const HARDCODED_KIE_KEY = '365b6afae3b952cef9297bbc5384ec8e';
const KIE_API_URL = 'https://api.kie.ai/api/v1';

export const aiService = {
    generateImage: async (prompt, modelId = 'nano_banana', options = {}) => {
        if (process.env.MOCK_AI === 'true') {
            await new Promise(r => setTimeout(r, 1000));
            return { success: true, imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1024&auto=format&fit=crop' };
        }

        const apiKey = process.env.KIE_API_KEY || HARDCODED_KIE_KEY;
        const KIE_MAP = {
            'nano_banana': 'nano-banana',
            'nano_banana_pro': 'nano-banana-pro',
            'flux_pro': 'flux-2/pro-text-to-image',
            'kling_2_6': 'kling-2.6/text-to-video',
            'wan_2_6': 'wan/2-6-text-to-video',
            'upscale': 'scu-net/image-upscale' // High quality real-esrgan based upscaler
        };

        let kieModelId = KIE_MAP[modelId] || 'nano-banana';

        // Image-to-Image / Video switching
        if (options.source_files?.length > 0) {
            if (modelId === 'flux_pro') kieModelId = 'flux-2/pro-image-to-image';
            if (modelId === 'kling_2_6') kieModelId = 'kling-2.6/image-to-video';
            if (modelId === 'wan_2_6') kieModelId = 'wan/2-6-image-to-video';
        }

        const requestBody = {
            model: kieModelId,
            input: {
                prompt,
                aspect_ratio: options.aspect_ratio || '1:1',
                ...(options.source_files?.length > 0 && { [kieModelId.includes('video') ? 'image_url' : 'image_input']: options.source_files })
            }
        };

        const createRes = await fetch(`${KIE_API_URL}/jobs/createTask`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!createRes.ok) throw new Error('Kie.ai task creation failed');
        const { data } = await createRes.json();
        const taskId = data?.task_id || data?.taskId;

        return await aiService.pollKieTask(taskId, apiKey);
    },

    upscaleImage: async (imageUrl, scale = 4) => {
        if (process.env.MOCK_AI === 'true') {
            await new Promise(r => setTimeout(r, 1000));
            return { success: true, imageUrl: imageUrl }; // Mock just returns same
        }

        const apiKey = process.env.KIE_API_KEY || HARDCODED_KIE_KEY;
        const kieModelId = 'scu-net/image-upscale';

        const requestBody = {
            model: kieModelId,
            input: {
                image_url: imageUrl,
                scale: parseInt(scale) || 4,
                face_enhance: true
            }
        };

        const createRes = await fetch(`${KIE_API_URL}/jobs/createTask`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!createRes.ok) throw new Error('Kie.ai upscale task creation failed');
        const { data } = await createRes.json();
        const taskId = data?.task_id || data?.taskId;

        return await aiService.pollKieTask(taskId, apiKey);
    },

    pollKieTask: async (taskId, apiKey) => {
        for (let i = 0; i < 300; i++) {
            await new Promise(r => setTimeout(r, 2000));
            const res = await fetch(`${KIE_API_URL}/jobs/recordInfo?taskId=${taskId}`, {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });
            const { data } = await res.json();
            const status = data?.state || data?.status;

            if (status === 'success' || status === 'completed') {
                let result = data.resultJson || data.result;
                if (typeof result === 'string') try { result = JSON.parse(result); } catch (e) { }
                const url = result?.resultUrls?.[0] || result?.url || (Array.isArray(result) && result[0]);
                if (url) return { success: true, imageUrl: url };
            }
            if (status === 'failed' || status === 'error') throw new Error('AI Generation failed');
        }
        throw new Error('AI Generation timeout');
    },

    /**
     * Generate greeting text using templates (simple offline approach)
     */
    generateText: async (prompt) => {
        // Parse star name and target name from prompt
        const TEMPLATES = {
            birthday: [
                (name, star) => `${name}, с днём рождения! Желаю тебе всего самого крутого! — ${star}`,
                (name, star) => `Дорогой ${name}! Пусть этот день будет полон радости и сюрпризов. С праздником! — ${star}`,
                (name, star) => `${name}, поздравляю с ДР! Будь счастлив и здоров! Обнимаю! — ${star}`
            ],
            roast: [
                (name, star) => `${name}, ну ты и кадр! Шучу, ты лучший! — ${star}`,
                (name, star) => `${name}, говорят, ты незаменимый… мы проверяли — заменимый, но нам лень. — ${star}`,
                (name, star) => `${name}! Ты уникален, как снежинка… которая упала в лужу. Шутка! — ${star}`
            ],
            motivation: [
                (name, star) => `${name}, ты можешь всё! Не сдавайся, впереди только победы! — ${star}`,
                (name, star) => `${name}, верь в себя! Ты уже на полпути к мечте! Не останавливайся! — ${star}`,
                (name, star) => `${name}! Каждый день — это шанс стать лучше. Вперёд и только вперёд! — ${star}`
            ],
            love: [
                (name, star) => `${name}, ты самый особенный человек! Ценю и люблю! — ${star}`,
                (name, star) => `Дорогой ${name}! Ты делаешь этот мир прекраснее! — ${star}`,
                (name, star) => `${name}, ты свет в моей жизни! С любовью — ${star}`
            ],
            greeting: [
                (name, star) => `Привет, ${name}! Это ${star}. Хочу пожелать тебе отличного дня!`,
                (name, star) => `${name}, салют! ${star} на связи! Желаю классного настроения!`,
                (name, star) => `Здорово, ${name}! Пусть всё у тебя будет супер! — ${star}`
            ]
        };

        // Try to extract occasion from prompt
        let occasion = 'greeting';
        if (prompt.includes('День рождения') || prompt.includes('birthday')) occasion = 'birthday';
        else if (prompt.includes('Прожарка') || prompt.includes('roast')) occasion = 'roast';
        else if (prompt.includes('Мотивация') || prompt.includes('motivation')) occasion = 'motivation';
        else if (prompt.includes('Признание') || prompt.includes('love')) occasion = 'love';

        const templates = TEMPLATES[occasion] || TEMPLATES.greeting;
        const template = templates[Math.floor(Math.random() * templates.length)];

        // Extract names from prompt
        const nameMatch = prompt.match(/для\s+([^\s.!,]+)/);
        const starMatch = prompt.match(/от лица\s+([^\s]+(?:\s+[^\s]+)?)\s+для/);
        const targetName = nameMatch?.[1] || 'Друг';
        const starName = starMatch?.[1] || 'Звезда';

        return template(targetName, starName);
    }
};
