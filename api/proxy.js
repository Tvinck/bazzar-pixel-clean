export default async function handler(req, res) {
    // Top-level Exception Boundary
    try {
        // CORS Headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') return res.status(200).end();

        // --- DYNAMIC FETCH POLYFILL ---
        // Ensures compatibility with both Node 16 and 18+ without breaking ESM
        let fetchImpl = globalThis.fetch;
        if (!fetchImpl) {
            try {
                const imported = await import('node-fetch');
                fetchImpl = imported.default || imported;
            } catch (err) {
                return res.status(500).json({
                    error: 'Fetch API Missing',
                    details: 'Could not load native fetch or node-fetch polyfill.',
                    nodeVersion: process.version
                });
            }
        }

        const { action } = req.query || {};
        const KIE_KEY_HARDCODED = '365b6afae3b952cef9297bbc5384ec8e';

        // --- CREATE TASK ---
        if (req.method === 'POST' && action === 'create') {
            const body = req.body || {};
            const { provider, model, input } = body;

            const apiKey = (provider === 'kie' ? KIE_KEY_HARDCODED : process.env.DEFAPI_KEY);
            if (!apiKey) return res.status(500).json({ error: 'Configuration Error: API Key missing' });

            const url = provider === 'kie'
                ? 'https://api.kie.ai/api/v1/jobs/createTask'
                : 'https://api.defapi.org/api/generate';

            const payload = provider === 'kie' ? { model, input } : input;

            const response = await fetchImpl(url, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const txt = await response.text();
                return res.status(response.status).json({
                    error: `Upstream Provider Error (${response.status})`,
                    details: txt
                });
            }
            return res.json(await response.json());
        }

        // --- CHECK STATUS ---
        if (req.method === 'GET' && action === 'check') {
            const { provider, taskId } = req.query || {};
            const apiKey = (provider === 'kie' ? KIE_KEY_HARDCODED : process.env.DEFAPI_KEY);

            if (!apiKey) return res.status(500).json({ error: 'Configuration Error: API Key missing' });

            const url = provider === 'kie'
                ? `https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`
                : `https://api.defapi.org/api/task/query?task_id=${taskId}`;

            const response = await fetchImpl(url, { headers: { 'Authorization': `Bearer ${apiKey}` } });

            if (!response.ok) {
                const txt = await response.text();
                return res.status(response.status).json({ error: txt });
            }
            return res.json(await response.json());
        }

        return res.status(400).json({ error: `Invalid Action: ${action}` });

    } catch (e) {
        console.error('Proxy Fatal Error:', e);
        return res.status(500).json({
            error: 'Internal Proxy Exception',
            message: e.message,
            stack: e.stack,
            nodeVersion: process.version
        });
    }
}
