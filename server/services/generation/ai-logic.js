import { supabase } from '../../shared/index.js';

// KIE API key must come from environment variables only
const KIE_API_URL = 'https://api.kie.ai/api/v1';

export const aiService = {
    /**
     * Creates a task on Kie.ai for any supported model (Image, Video, Audio)
     */
    generateTask: async (userId, modelId, prompt, options = {}) => {
        const apiKey = process.env.KIE_API_KEY;
        if (!apiKey) throw new Error('KIE_API_KEY is not set');

        // 1. Dynamic Model Endpoint
        const { KIE_MODELS_FLAT } = await import('../../../src/kie-models.js');
        const modelConfig = KIE_MODELS_FLAT[modelId];
        if (!modelConfig?.endpoint) throw new Error(`Unknown model: ${modelId}`);
        let kieModelId = modelConfig.endpoint;

        // 2. Handle File Inputs (Source Files)
        // If options.source_files contains local paths or buffers, we should upload them to Supabase Storage first
        // to get a Public URL for Kie.ai.
        let inputUrls = options.source_files || [];
        if (options.filesToUpload?.length > 0) {
            // Logic to upload buffers to Supabase Storage
            const uploaded = await Promise.all(options.filesToUpload.map(f =>
                aiService.uploadBufferToSupabase(userId, f.buffer, f.name || 'input.jpg')
            ));
            inputUrls = [...inputUrls, ...uploaded];
        }

        // 3. Create Record in Supabase 'creations' first to get an ID for the webhook
        const { data: creation, error: dbErr } = await supabase.from('creations').insert({
            user_id: userId,
            model_id: modelId,
            prompt: prompt,
            status: 'processing',
            media_type: modelConfig.capabilities?.includes('text-to-video') ? 'video' : 'image',
            metadata: { ...options, kie_model: kieModelId }
        }).select().single();

        if (dbErr) throw dbErr;

        // 4. Prepare Kie.ai Request
        const callbackUrl = `${process.env.API_BASE_URL || 'http://localhost:3001'}/api/kie/webhook/${creation.id}`;

        const requestBody = {
            model: kieModelId,
            callback_url: callbackUrl,
            input: {
                prompt,
                aspect_ratio: options.aspect_ratio || '1:1',
                ...(inputUrls.length > 0 && {
                    [kieModelId.includes('video') ? 'image_url' : 'image_input']: inputUrls[0] // Simplify for now
                }),
                ...options.extra_params // For things like audio: true for Veo
            }
        };

        const createRes = await fetch(`${KIE_API_URL}/jobs/createTask`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!createRes.ok) {
            const errBody = await createRes.text();
            await supabase.from('creations').update({ status: 'failed', error: errBody }).eq('id', creation.id);
            throw new Error(`Kie.ai failed: ${errBody}`);
        }

        const { data: kieData } = await createRes.json();
        const taskId = kieData?.task_id || kieData?.taskId;

        // Update creation with Kie Task ID
        await supabase.from('creations').update({
            generation_id: taskId,
            metadata: { ...creation.metadata, kie_task_id: taskId }
        }).eq('id', creation.id);

        return { success: true, creationId: creation.id, taskId };
    },

    uploadBufferToSupabase: async (userId, buffer, fileName) => {
        const path = `inputs/${userId}/${Date.now()}_${fileName}`;
        const { data, error } = await supabase.storage.from('uploads').upload(path, buffer);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(path);
        return publicUrl;
    },

    // Legacy support for polling if needed, though encouraged to use webhooks
    pollKieTask: async (taskId, apiKey) => {
        // ... (existing polling logic if needed as fallback)
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
