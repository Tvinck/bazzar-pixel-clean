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
                }
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

    if (!sbUrl || !sbKey) {
        console.warn('⚠️ [API] Supabase Env Variables missing for billing checks.');
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
                return { data: data }; // Pure text/boolean
            }
        } else {
            return { error: data, status: statusCode };
        }
    } catch (e) {
        return { error: e.message };
    }
};


export default async function handler(req, res) {
    // 1. CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // HARDCODED KIE KEY (Fallback)
    const KIE_KEY_HARDCODED = '365b6afae3b952cef9297bbc5384ec8e';

    try {
        const { action } = req.query || {};

        // ============================================
        // CREATE TASK (Secure Billing)
        // ============================================
        if (req.method === 'POST' && action === 'create') {
            const { provider, model, input, userId } = req.body || {};

            // --- 1. BILLING CHECK ---
            let cost = 0;
            let shouldCharge = !!(userId && userId !== 'browser_user' && action === 'create');

            if (shouldCharge) {
                // Get Dynamic Cost
                const costRes = await callRpc('get_model_cost', { p_model_id: model });
                // If RPC fails (e.g. missing function), fallback to safe default 4
                cost = (costRes.data && typeof costRes.data === 'number') ? costRes.data : 4;

                console.log(`💰 [Billing] Charging user ${userId} - ${cost} credits for ${model}`);

                // Charge atomically
                const chargeRes = await callRpc('charge_user_credits', { p_user_id: userId, p_amount: cost });

                // Check if specifically FALSE (funds insufficient)
                if (chargeRes.data === false) {
                    console.warn(`⛔ [Billing] Insufficient funds for ${userId}`);
                    return res.status(402).json({
                        error: 'Недостаточно средств на балансе. Пожалуйста, пополните счет.',
                        code: 'insufficient_funds',
                        current_balance: 'low'
                    });
                }

                // Ignore other errors (like missing table) to avoid blocking generation
                if (chargeRes.error) {
                    console.error('⚠️ [Billing] Charge RPC Error:', chargeRes.error);
                    return res.status(500).json({ error: 'Ошибка транзакции (Сбой системы)' });
                }
            }

            // --- 2. EXECUTE AI ---
            const apiKey = (provider === 'kie' ? KIE_KEY_HARDCODED : process.env.DEFAPI_KEY);
            const targetUrl = provider === 'kie'
                ? 'https://api.kie.ai/api/v1/jobs/createTask'
                : 'https://api.defapi.org/api/generate';

            const payload = provider === 'kie' ? { model, input } : input;

            let proxyRes;
            try {
                proxyRes = await makeRequest(
                    targetUrl,
                    'POST',
                    JSON.stringify(payload),
                    { 'Authorization': `Bearer ${apiKey}` }
                );
            } catch (netErr) {
                // Network failed before response -> Refund
                if (shouldCharge) await callRpc('refund_user_credits', { p_user_id: userId, p_amount: cost });
                throw netErr;
            }

            // --- 3. HANDLE RESULT / REFUND ---
            let json;
            try {
                json = JSON.parse(proxyRes.data);
            } catch (e) {
                // Garbage response -> Refund
                if (shouldCharge) await callRpc('refund_user_credits', { p_user_id: userId, p_amount: cost });
                return res.status(502).json({ error: 'Ошибка нейросети: получен некорректный ответ' });
            }

            // Check specific provider error codes
            const isError = (json.code !== undefined && json.code !== 0) || (json.error);

            if (isError && shouldCharge) {
                console.log(`💸 [Billing] Upstream Error, refunding ${cost} credits.`);
                await callRpc('refund_user_credits', { p_user_id: userId, p_amount: cost });

                const msg = json.error || json.message || 'Ошибка генерации';
                return res.status(400).json({ error: `Ошибка генерации: ${msg}` });
            }

            return res.status(proxyRes.statusCode || 200).json(json);
        }

        // ============================================
        // CHECK STATUS (Free)
        // ============================================
        else if (req.method === 'GET' && action === 'check') {
            const { provider, taskId } = req.query || {};
            const apiKey = (provider === 'kie' ? KIE_KEY_HARDCODED : process.env.DEFAPI_KEY);

            const targetUrl = provider === 'kie'
                ? `https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`
                : `https://api.defapi.org/api/task/query?task_id=${taskId}`;

            const proxyRes = await makeRequest(targetUrl, 'GET', null, { 'Authorization': `Bearer ${apiKey}` });
            return res.status(proxyRes.statusCode || 200).send(proxyRes.data);
        }

        else {
            return res.status(404).json({ error: 'Неизвестное действие' });
        }

    } catch (e) {
        console.error('Proxy Fatal Error:', e);
        return res.status(500).json({ error: 'Внутренняя ошибка сервера: ' + e.message });
    }
}
