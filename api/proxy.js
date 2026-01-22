import https from 'https';
import { URL, URLSearchParams } from 'url';
import crypto from 'crypto';

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
 * Validates Telegram Web App Data (Signature Verification)
 */
const validateTelegramData = (initData, botToken) => {
    if (!initData || !botToken) return { valid: false };

    try {
        const urlParams = new URLSearchParams(initData);
        const hash = urlParams.get('hash');
        if (!hash) return { valid: false };

        urlParams.delete('hash');

        const dataCheckArr = [];
        for (const [key, value] of urlParams.entries()) {
            dataCheckArr.push(`${key}=${value}`);
        }
        dataCheckArr.sort();
        const dataCheckString = dataCheckArr.join('\n');

        const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
        const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

        if (calculatedHash === hash) {
            // Extract user data
            const userStr = urlParams.get('user');
            if (userStr) {
                return { valid: true, user: JSON.parse(userStr) };
            }
        }
        return { valid: false };
    } catch (e) {
        console.error('Validation Error:', e);
        return { valid: false };
    }
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

        const KIE_KEY_HARDCODED = process.env.KIE_API_KEY;

        const { action } = req.query || {};

        // ============================================
        // CREATE TASK
        // ============================================
        if (req.method === 'POST' && action === 'create') {
            const { provider, model, input, userId } = req.body || {};

            if (!input) return res.status(400).json({ error: 'No input provided' });

            // --- 1. BILLING CHECK ---
            let cost = 0;
            let shouldCharge = true;
            let validatedUserId = null;

            // Security: Validate InitData if present
            const initData = req.headers['x-telegram-init-data'];
            if (initData) {
                const validation = validateTelegramData(initData, process.env.TELEGRAM_BOT_TOKEN);
                if (validation.valid && validation.user) {
                    validatedUserId = validation.user.id;
                    console.log(`✅ [Proxy] Authorized Request for User: ${validatedUserId}`);
                } else {
                    console.warn(`⚠️ [Proxy] Invalid InitData Signature! Potential spoofing.`);
                }
            }

            // Fallback for Dev/Browser ONLY
            if (!validatedUserId) {
                if (userId === 'browser_user' || !process.env.TELEGRAM_BOT_TOKEN) {
                    // LEGITIMATE DEV USE (No Charge)
                    shouldCharge = false;
                    console.log('[Proxy] Dev/Browser mode detected. Billing disabled.');
                } else {
                    // PRODUCTION SECURITY BLOCKS:
                    // If we are here, it means:
                    // 1. Not a dev user ('browser_user')
                    // 2. We HAVE a bot token (Production)
                    // 3. But InitData was missing or invalid.

                    // REJECT THE REQUEST. Do not trust body.userId.
                    console.error(`⛔ [Proxy] Security Block: User ${userId} tried to bypass signature check.`);
                    return res.status(401).json({
                        error: 'Authentication Failed. Missing or Invalid Telegram Signature (InitData).',
                        code: 'auth_failed'
                    });
                }
            }

            // Use the trusted ID if available
            const finalUserId = validatedUserId || userId;
            shouldCharge = !!(finalUserId && finalUserId !== 'browser_user');

            console.log(`[Proxy] Request: User=${finalUserId}, Model=${model}, Charge=${shouldCharge}`);

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
            const isError = (json.code !== undefined && json.code !== 0 && json.code !== 200) || (json.error);

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
