import https from 'https';
import { URL } from 'url';

/**
 * Zero-Dependency Helper for HTTP(S) Requests
 */
const makeRequest = (url, method, body, headers = {}) => {
    return new Promise((resolve, reject) => {
        try {
            const parsedUrl = new URL(url);
            const options = {
                hostname: parsedUrl.hostname,
                port: 443,
                path: parsedUrl.pathname + parsedUrl.search,
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                },
                timeout: 25000 // 25s timeout (Vercel hobby limit is 10s usually, but safety first)
            };

            if (body) {
                options.headers['Content-Length'] = Buffer.byteLength(body);
            }

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve({ statusCode: res.statusCode, data }));
            });

            req.on('error', (e) => reject(e));
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request Timeout'));
            });

            if (body) req.write(body);
            req.end();
        } catch (e) {
            reject(e);
        }
    });
};

/**
 * Helper to call Supabase RPC via REST (Zero Deps)
 */
const callRpc = async (funcName, params) => {
    const sbUrl = process.env.PROD_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const sbKey = process.env.PROD_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Graceful fallback if envs missing
    if (!sbUrl || !sbKey) {
        console.warn('⚠️ [API] Supabase Env Variables missing. Skipping billing.');
        return { error: 'Missing Config' };
    }

    try {
        const { statusCode, data } = await makeRequest(
            `${sbUrl}/rest/v1/rpc/${funcName}`,
            'POST',
            JSON.stringify(params),
            {
                'apikey': sbKey,
                'Authorization': `Bearer ${sbKey}`,
                'Prefer': 'return=representation'
            }
        );

        if (statusCode >= 200 && statusCode < 300) {
            try {
                return { data: JSON.parse(data) };
            } catch {
                return { data: data };
            }
        } else {
            console.error(`[RPC Error] ${funcName}: ${statusCode} - ${data}`);
            return { error: data, status: statusCode };
        }
    } catch (e) {
        return { error: e.message };
    }
};

export default async function handler(req, res) {
    // Global Error Handler Wrapper
    try {
        // 1. CORS Headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

        if (req.method === 'OPTIONS') return res.status(200).end();

        const KIE_KEY_HARDCODED = '365b6afae3b952cef9297bbc5384ec8e';

        const { action } = req.query || {};

        // ============================================
        // CREATE TASK
        // ============================================
        if (req.method === 'POST' && action === 'create') {
            const { provider, model, input, userId } = req.body || {};

            if (!input) return res.status(400).json({ error: 'No input provided' });

            // --- 1. BILLING CHECK ---
            let cost = 0;
            let shouldCharge = !!(userId && userId !== 'browser_user');

            // Log for debugging
            console.log(`[Proxy] Request: User=${userId}, Model=${model}, Charge=${shouldCharge}`);

            if (shouldCharge) {
                // Get Dynamic Cost
                const costRes = await callRpc('get_model_cost', { p_model_id: model });

                // If get_model_cost Missing -> Default to 4
                if (costRes.error) {
                    console.warn('[Billing] get_model_cost RPC failed (likely missing SQL). Using default cost 4.');
                    cost = 4;
                } else {
                    cost = (typeof costRes.data === 'number') ? costRes.data : 4;
                }

                // Charge
                const chargeRes = await callRpc('charge_user_credits', { p_user_id: userId, p_amount: cost });

                // If RPC missing/error -> Fail Securely (or Allow if you prefer dev mode)
                if (chargeRes.error) {
                    console.error('⚠️ [Billing] charge_user_credits Failed:', chargeRes.error);

                    // IF SQL IS MISSING, SERVER SHOULD NOT CRASH, BUT SHOULD WE BLOCK?
                    // Let's block to filter 'freeloaders' unless it's a known dev config issue.
                    // Returning readable error
                    return res.status(500).json({
                        error: 'Billing System Error. Please contact support. (SQL RPC missing?)',
                        details: chargeRes.error
                    });
                }

                if (chargeRes.data === false) {
                    return res.status(402).json({
                        error: 'Недостаточно средств. Пополните баланс.',
                        code: 'insufficient_funds'
                    });
                }
            }

            // --- 2. EXECUTE AI ---
            const apiKey = (provider === 'kie' ? KIE_KEY_HARDCODED : process.env.DEFAPI_KEY);
            const targetUrl = provider === 'kie'
                ? 'https://api.kie.ai/api/v1/jobs/createTask'
                : 'https://api.defapi.org/api/generate';

            // Ensure Input is valid
            const payload = provider === 'kie' ? { model, input } : input;

            let proxyRes;
            try {
                proxyRes = await makeRequest(
                    targetUrl,
                    'POST',
                    JSON.stringify(payload),
                    { 'Authorization': `Bearer ${apiKey || ''}` }
                );
            } catch (netErr) {
                // Refund if charged
                if (shouldCharge) await callRpc('refund_user_credits', { p_user_id: userId, p_amount: cost });
                console.error('[Proxy] Network Error:', netErr);
                return res.status(502).json({ error: 'Ошибка сети при запросе к нейросети.' });
            }

            // --- 3. HANDLE RESULT ---
            let json;
            try {
                json = JSON.parse(proxyRes.data);
            } catch (e) {
                // Refund
                if (shouldCharge) await callRpc('refund_user_credits', { p_user_id: userId, p_amount: cost });
                console.error('[Proxy] Invalid JSON from upstream:', proxyRes.data);
                return res.status(502).json({ error: 'Ошибка нейросети: получен некорректный ответ (Not JSON)' });
            }

            // Upstream Error Check
            const isError = (json.code !== undefined && json.code !== 0) || (json.error);

            if (isError && shouldCharge) {
                await callRpc('refund_user_credits', { p_user_id: userId, p_amount: cost });
                const msg = json.error || json.message || 'Ошибка генерации';
                return res.status(400).json({ error: `Ошибка генерации: ${msg}`, upstream: json });
            }

            return res.status(proxyRes.statusCode || 200).json(json);
        }

        // ============================================
        // CHECK STATUS
        // ============================================
        else if (req.method === 'GET' && action === 'check') {
            const { provider, taskId } = req.query || {};
            if (!taskId) return res.status(400).json({ error: 'Missing taskId' });

            const apiKey = (provider === 'kie' ? KIE_KEY_HARDCODED : process.env.DEFAPI_KEY);
            const targetUrl = provider === 'kie'
                ? `https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`
                : `https://api.defapi.org/api/task/query?task_id=${taskId}`;

            try {
                const proxyRes = await makeRequest(targetUrl, 'GET', null, { 'Authorization': `Bearer ${apiKey || ''}` });
                res.status(proxyRes.statusCode || 200);
                res.send(proxyRes.data); // Send raw data (JSON string)
                return;
            } catch (e) {
                return res.status(502).json({ error: 'Check Status Failed: ' + e.message });
            }
        }

        return res.status(404).json({ error: 'Unknown Action' });

    } catch (fatalError) {
        console.error('FATAL PROXY ERROR:', fatalError);
        return res.status(500).json({
            error: 'Внутренняя ошибка сервера (Fatal)',
            message: fatalError.message
        });
    }
}
