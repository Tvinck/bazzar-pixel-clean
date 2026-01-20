// CommonJS Format to prevent "SyntaxError" at load time on Vercel
module.exports = async (req, res) => {
    // 1. Top-level Error Handling Wrapper
    try {
        // 2. CORS Headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') return res.status(200).end();

        const { action } = req.query || {};
        const KIE_KEY_HARDCODED = '365b6afae3b952cef9297bbc5384ec8e';

        // --- CREATE TASK ---
        if (req.method === 'POST' && action === 'create') {
            const { provider, model, input } = req.body || {};

            // Validate Provider and Key
            const apiKey = (provider === 'kie' ? KIE_KEY_HARDCODED : process.env.DEFAPI_KEY);
            if (!apiKey) throw new Error(`${provider} API Key is missing configuration`);

            const url = provider === 'kie'
                ? 'https://api.kie.ai/api/v1/jobs/createTask'
                : 'https://api.defapi.org/api/generate';

            const payload = provider === 'kie' ? { model, input } : input;

            console.log(`[Proxy] Creating Task via ${provider}...`);

            // Use native fetch (Node 18+)
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const txt = await response.text();
                return res.status(response.status).json({
                    error: `Upstream Provider Error (${response.status})`,
                    details: txt
                });
            }

            const json = await response.json();
            return res.status(200).json(json);
        }

        // --- CHECK STATUS ---
        if (req.method === 'GET' && action === 'check') {
            const { provider, taskId } = req.query || {};
            const apiKey = (provider === 'kie' ? KIE_KEY_HARDCODED : process.env.DEFAPI_KEY);

            if (!apiKey) throw new Error('API Key missing');

            const url = provider === 'kie'
                ? `https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`
                : `https://api.defapi.org/api/task/query?task_id=${taskId}`;

            const response = await fetch(url, { headers: { 'Authorization': `Bearer ${apiKey}` } });

            if (!response.ok) {
                const txt = await response.text();
                return res.status(response.status).json({ error: txt });
            }

            const json = await response.json();
            return res.status(200).json(json);
        }

        return res.status(400).json({ error: `Invalid action: ${action}` });

    } catch (criticalError) {
        console.error('[Critical Proxy Error]', criticalError);
        return res.status(500).json({
            error: 'Internal Proxy Error',
            message: criticalError.message,
            stack: criticalError.stack
        });
    }
};
