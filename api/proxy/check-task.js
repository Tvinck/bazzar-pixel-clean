export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { provider, taskId } = req.query || {};
        const KIE_KEY_HARDCODED = '365b6afae3b952cef9297bbc5384ec8e';
        const apiKey = (provider === 'kie' ? KIE_KEY_HARDCODED : process.env.DEFAPI_KEY);

        if (!apiKey) {
            return res.status(500).json({ error: 'API Key not configured' });
        }

        const KIE_API_URL = 'https://api.kie.ai/api/v1';
        const DEFAPI_URL = 'https://api.defapi.org/api';

        let response;
        if (provider === 'kie') {
            response = await fetch(`${KIE_API_URL}/jobs/recordInfo?taskId=${taskId}`, {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });
        } else if (provider === 'defapi') {
            response = await fetch(`${DEFAPI_URL}/task/query?task_id=${taskId}`, {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });
        } else {
            return res.status(400).json({ error: 'Unknown provider' });
        }

        const data = await response.json();
        return res.json(data);

    } catch (error) {
        console.error('Proxy Check Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
