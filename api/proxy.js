import https from 'https';
import { URL } from 'url';

export default async function handler(req, res) {
    // 1. CORS Headers (Critical)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const KIE_KEY_HARDCODED = '365b6afae3b952cef9297bbc5384ec8e';

    try {
        const { action } = req.query || {};
        let targetUrl = '';
        let method = 'GET';
        let bodyData = null;
        let apiKey = '';

        // --- CONFIGURATION LOGIC ---
        if (req.method === 'POST' && action === 'create') {
            const { provider, model, input } = req.body || {};
            apiKey = (provider === 'kie' ? KIE_KEY_HARDCODED : process.env.DEFAPI_KEY);

            targetUrl = provider === 'kie'
                ? 'https://api.kie.ai/api/v1/jobs/createTask'
                : 'https://api.defapi.org/api/generate';

            method = 'POST';
            bodyData = JSON.stringify(provider === 'kie' ? { model, input } : input);
        }
        else if (req.method === 'GET' && action === 'check') {
            const { provider, taskId } = req.query || {};
            apiKey = (provider === 'kie' ? KIE_KEY_HARDCODED : process.env.DEFAPI_KEY);

            targetUrl = provider === 'kie'
                ? `https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`
                : `https://api.defapi.org/api/task/query?task_id=${taskId}`;

            method = 'GET';
        }
        else {
            return res.status(400).json({ error: 'Invalid endpoints' });
        }

        if (!apiKey) return res.status(500).json({ error: 'API Key missing' });

        // --- LOW LEVEL HTTPS REQUEST (Zero Dependency) ---
        const parsedUrl = new URL(targetUrl);
        const options = {
            hostname: parsedUrl.hostname,
            port: 443,
            path: parsedUrl.pathname + parsedUrl.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'Content-Length': bodyData ? Buffer.byteLength(bodyData) : 0
            }
        };

        // Wrap https.request in a Promise
        const proxyResponse = await new Promise((resolve, reject) => {
            const proxyReq = https.request(options, (proxyRes) => {
                let data = '';

                proxyRes.on('data', (chunk) => {
                    data += chunk;
                });

                proxyRes.on('end', () => {
                    resolve({
                        statusCode: proxyRes.statusCode,
                        data: data
                    });
                });
            });

            proxyReq.on('error', (e) => {
                reject(e);
            });

            if (bodyData) {
                proxyReq.write(bodyData);
            }
            proxyReq.end();
        });

        // --- RESPONSE HANDLING ---
        try {
            // Try to parse JSON from upstream
            const json = JSON.parse(proxyResponse.data);
            return res.status(proxyResponse.statusCode || 200).json(json);
        } catch (parseErr) {
            // If upstream returned HTML/Text (error), return it safely in JSON
            return res.status(proxyResponse.statusCode || 500).json({
                error: 'Upstream Non-JSON Response',
                raw: proxyResponse.data
            });
        }

    } catch (e) {
        console.error('Zero-Dep Proxy Error:', e);
        return res.status(500).json({
            error: 'Internal Proxy Error',
            message: e.message
        });
    }
}
