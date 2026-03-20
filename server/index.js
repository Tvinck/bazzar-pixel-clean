// --- ВХОДНАЯ ТОЧКА API GATEWAY ---
// Этот файл является "воротами" для всех запросов. Он управляет проксированием 
// в микросервисы (Payments, Users, Generation) и обрабатывает работу Telegram-бота.

import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import TelegramBot from 'node-telegram-bot-api';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PORTS } from './shared/index.js';
import { setupBotHandlers } from './bot/handlers.js';
import { registerRoutes } from './routes/index.js';
import authRoutes from './routes/auth.js';
import { setupAdminRoutes } from './routes/admin.js';
import kieRoutes from './routes/kie.js';
import { initCronJobs } from './cron.js';
import net from 'net';
import { WebSocketServer } from 'ws';

export let bot = null;

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({
    origin: [
        'https://bazzar-pixel-clean-4zm4.vercel.app',
        'https://t.me',
        process.env.NODE_ENV !== 'production' ? 'http://localhost:5173' : null
    ].filter(Boolean),
    credentials: true
}));
app.use(express.json({ limit: '15mb' }));

// Rate limiting for generation API
const generationLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute per IP
    message: { error: 'Слишком много запросов. Подождите минуту.' }
});

// --- CORE ROUTES ---
app.use('/api/auth', authRoutes);
setupAdminRoutes(app);
app.use('/api/kie', kieRoutes);

// --- HELPER: Check if a microservice port is listening ---
function isPortListening(port) {
    return new Promise((resolve) => {
        const sock = new net.Socket();
        sock.setTimeout(200);
        sock.on('connect', () => { sock.destroy(); resolve(true); });
        sock.on('error', () => { sock.destroy(); resolve(false); });
        sock.on('timeout', () => { sock.destroy(); resolve(false); });
        sock.connect(port, '127.0.0.1');
    });
}

// --- SETUP ROUTES ---
async function setupRouting() {
    // Always register proxies to avoid race conditions during startup.
    // Microservices will handle connections once they are up.
    app.use('/api/payments', createProxyMiddleware({ 
        target: `http://localhost:${PORTS.PAYMENTS}`, 
        changeOrigin: true, 
        on: { proxyReq: fixRequestBody },
        onError: (err, req, res) => res.status(503).json({ error: 'Payments service unavailable' })
    }));
    
    app.use('/api/user', createProxyMiddleware({ 
        target: `http://localhost:${PORTS.USERS}`, 
        changeOrigin: true, 
        on: { proxyReq: fixRequestBody },
        onError: (err, req, res) => res.status(503).json({ error: 'User service unavailable' })
    }));
    
    app.use('/api/generation', generationLimiter, createProxyMiddleware({ 
        target: `http://localhost:${PORTS.GENERATION}`, 
        changeOrigin: true, 
        on: { proxyReq: fixRequestBody },
        onError: (err, req, res) => res.status(503).json({ error: 'Generation service unavailable' })
    }));

    // Legacy compatibility proxies
    app.use('/api/experts', createProxyMiddleware({ target: `http://localhost:${PORTS.GENERATION}/api/generation/experts`, pathRewrite: { '^/api/experts': '' }, on: { proxyReq: fixRequestBody } }));
    app.use('/api/stickers', createProxyMiddleware({ target: `http://localhost:${PORTS.GENERATION}/api/generation/stickers`, pathRewrite: { '^/api/stickers': '' }, on: { proxyReq: fixRequestBody } }));
    app.use('/api/gallery', createProxyMiddleware({ target: `http://localhost:${PORTS.GENERATION}/api/generation/gallery`, pathRewrite: { '^/api/gallery': '' }, on: { proxyReq: fixRequestBody } }));
    app.use('/api/stars', createProxyMiddleware({ target: `http://localhost:${PORTS.GENERATION}/api/generation/stars`, pathRewrite: { '^/api/stars': '' }, on: { proxyReq: fixRequestBody } }));
    app.use('/api/preview-greeting', createProxyMiddleware({ target: `http://localhost:${PORTS.GENERATION}/api/generation/preview-greeting`, pathRewrite: { '^/api/preview-greeting': '' }, on: { proxyReq: fixRequestBody } }));
    app.use('/api/generate-greeting-v2', createProxyMiddleware({ target: `http://localhost:${PORTS.GENERATION}/api/generation/generate-greeting-v2`, pathRewrite: { '^/api/generate-greeting-v2': '' }, on: { proxyReq: fixRequestBody } }));

    // --- ALWAYS REGISTER GATEWAY-LEVEL ROUTES ---
    // Some routes (marketing, templates, experts, stickers) are still in the monolith routes 
    // and haven't been fully moved to microservices yet.
    console.log('   📦 Initializing gateway-level modular routes...');
    registerRoutes(app, bot);

    // --- TELEGRAM BOT (Gateway Level) ---
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const isPolling = process.env.POLLING === 'true' && !process.env.VERCEL;

    if (botToken) {
        bot = new TelegramBot(botToken, { polling: isPolling });
        console.log(`🤖 Bot Gateway initialized. Polling: ${isPolling}`);
        setupBotHandlers(bot);
        initCronJobs(bot);
    }

    // --- STATIC FRONTEND ---
    const distPath = path.resolve(__dirname, '../dist');
    app.use(express.static(distPath));
    app.get(/.*/, (req, res) => {
        if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Endpoint not found' });
        res.sendFile(path.join(distPath, 'index.html'));
    });

    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, () => {
        console.log(`📡 API Gateway running on port ${PORT}`);
    });

    // --- WEBSOCKET SERVER ---
    setupWebSocket(server);
}

// --- WEBSOCKET LOGIC ---
export const wsUsers = new Map(); // userId -> Set<WebSocket>

function setupWebSocket(server) {
    const wss = new WebSocketServer({ server, path: '/api/ws' });

    wss.on('connection', (ws) => {
        let connectedUserId = null;

        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                if (data.type === 'auth' && data.userId) {
                    connectedUserId = data.userId.toString();
                    if (!wsUsers.has(connectedUserId)) {
                        wsUsers.set(connectedUserId, new Set());
                    }
                    wsUsers.get(connectedUserId).add(ws);
                    ws.send(JSON.stringify({ type: 'auth_success' }));
                    console.log(`🔌 WS Client connected: ${connectedUserId}`);
                }
            } catch (e) {
                console.error('WS Parse Error:', e);
            }
        });

        ws.on('close', () => {
            if (connectedUserId && wsUsers.has(connectedUserId)) {
                wsUsers.get(connectedUserId).delete(ws);
                if (wsUsers.get(connectedUserId).size === 0) {
                    wsUsers.delete(connectedUserId);
                }
                console.log(`🔌 WS Client disconnected: ${connectedUserId}`);
            }
        });
    });

    console.log(`🚀 WebSocket server mapped to /api/ws`);
}

/**
 * Send WS event to specific user
 */
export function notifyUserViaWs(userId, event) {
    if (!userId) return;
    const uidStr = userId.toString();
    const connections = wsUsers.get(uidStr);
    if (connections) {
        const payload = JSON.stringify(event);
        connections.forEach(ws => {
            if (ws.readyState === 1 /* OPEN */) {
                ws.send(payload);
            }
        });
    }
}

setupRouting();

export default app;
