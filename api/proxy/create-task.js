export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { provider, model, input } = req.body || {};
        const KIE_KEY_HARDCODED = '365b6afae3b952cef9297bbc5384ec8e';
        const apiKey = (provider === 'kie' ? KIE_KEY_HARDCODED : process.env.DEFAPI_KEY);

        if (!apiKey) {
            return res.status(500).json({ error: 'API Key not configured' });
        }

        const KIE_API_URL = 'https://api.kie.ai/api/v1';
        const DEFAPI_URL = 'https://api.defapi.org/api';

        let response;
        if (provider === 'kie') {
            response = await fetch(`${KIE_API_URL}/jobs/createTask`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ model, input })
            });
        } else if (provider === 'defapi') {
            response = await fetch(`${DEFAPI_URL}/generate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(input)
            });
        } else {
            return res.status(400).json({ error: 'Unknown provider' });
        }

        if (!response.ok) {
            const txt = await response.text();
            return res.status(response.status).json({ error: txt });
        }

        const data = await response.json();
        return res.json(data);

    } catch (error) {
        console.error('Proxy Create Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
