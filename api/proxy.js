

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { action } = req.query;
    const KIE_KEY_HARDCODED = '365b6afae3b952cef9297bbc5384ec8e';

    try {
        // --- CREATE TASK ---
        if (req.method === 'POST' && action === 'create') {
            const { provider, model, input } = req.body || {};
            const apiKey = (provider === 'kie' ? KIE_KEY_HARDCODED : process.env.DEFAPI_KEY);

            if (!apiKey) return res.status(500).json({ error: 'API Key missing' });

            const url = provider === 'kie'
                ? 'https://api.kie.ai/api/v1/jobs/createTask'
                : 'https://api.defapi.org/api/generate';

            const payload = provider === 'kie' ? { model, input } : input;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const txt = await response.text();
                return res.status(response.status).json({ error: txt });
            }
            return res.json(await response.json());
        }

        // --- CHECK STATUS ---
        if (req.method === 'GET' && action === 'check') {
            const { provider, taskId } = req.query;
            const apiKey = (provider === 'kie' ? KIE_KEY_HARDCODED : process.env.DEFAPI_KEY);

            if (!apiKey) return res.status(500).json({ error: 'API Key missing' });

            const url = provider === 'kie'
                ? `https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`
                : `https://api.defapi.org/api/task/query?task_id=${taskId}`;

            const response = await fetch(url, { headers: { 'Authorization': `Bearer ${apiKey}` } });
            return res.json(await response.json());
        }

        return res.status(400).json({ error: 'Invalid action or method' });

    } catch (e) {
        console.error('Proxy Error:', e);
        return res.status(500).json({ error: e.message });
    }
}
