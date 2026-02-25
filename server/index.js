import { createProxyMiddleware } from 'http-proxy-middleware';
import TelegramBot from 'node-telegram-bot-api';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PORTS } from './shared/index.js';
import { setupBotHandlers } from './bot/handlers.js';
import { registerRoutes } from './routes/index.js';
import authRoutes from './routes/auth.js';
import net from 'net';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// --- CORE ROUTES ---
app.use('/api/auth', authRoutes);

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
    const [paymentsUp, usersUp, generationUp] = await Promise.all([
        isPortListening(PORTS.PAYMENTS),
        isPortListening(PORTS.USERS),
        isPortListening(PORTS.GENERATION)
    ]);

    console.log(`📊 Service discovery:`);
    console.log(`   💳 Payments (${PORTS.PAYMENTS}): ${paymentsUp ? '✅ UP' : '❌ DOWN'}`);
    console.log(`   👤 Users (${PORTS.USERS}):    ${usersUp ? '✅ UP' : '❌ DOWN'}`);
    console.log(`   🚀 Generation (${PORTS.GENERATION}):  ${generationUp ? '✅ UP' : '❌ DOWN'}`);

    if (paymentsUp) {
        app.use('/api/payments', createProxyMiddleware({ target: `http://localhost:${PORTS.PAYMENTS}`, changeOrigin: true }));
        console.log('   → Proxying /api/payments');
    }

    if (usersUp) {
        app.use('/api/user', createProxyMiddleware({ target: `http://localhost:${PORTS.USERS}`, changeOrigin: true }));
        console.log('   → Proxying /api/user');
    }

    if (generationUp) {
        app.use('/api/generation', createProxyMiddleware({ target: `http://localhost:${PORTS.GENERATION}`, changeOrigin: true }));
        // Legacy compatibility proxies
        app.use('/api/experts', createProxyMiddleware({ target: `http://localhost:${PORTS.GENERATION}/api/generation/experts`, pathRewrite: { '^/api/experts': '' } }));
        app.use('/api/stickers', createProxyMiddleware({ target: `http://localhost:${PORTS.GENERATION}/api/generation/stickers`, pathRewrite: { '^/api/stickers': '' } }));
        app.use('/api/gallery', createProxyMiddleware({ target: `http://localhost:${PORTS.GENERATION}/api/generation/gallery`, pathRewrite: { '^/api/gallery': '' } }));
        app.use('/api/stars', createProxyMiddleware({ target: `http://localhost:${PORTS.GENERATION}/api/generation/stars`, pathRewrite: { '^/api/stars': '' } }));
        app.use('/api/preview-greeting', createProxyMiddleware({ target: `http://localhost:${PORTS.GENERATION}/api/generation/preview-greeting`, pathRewrite: { '^/api/preview-greeting': '' } }));
        app.use('/api/generate-greeting-v2', createProxyMiddleware({ target: `http://localhost:${PORTS.GENERATION}/api/generation/generate-greeting-v2`, pathRewrite: { '^/api/generate-greeting-v2': '' } }));
        console.log('   → Proxying /api/generation + legacy routes');
    }

    // --- FALLBACK: Mount modular routes for any services not running ---
    // This makes the gateway work as a monolith when microservices are down
    if (!paymentsUp || !usersUp || !generationUp) {
        console.log('   ⚡ Mounting modular routes as fallback for offline services...');
        registerRoutes(app, null);
    }

    // --- TELEGRAM BOT (Gateway Level) ---
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const isPolling = process.env.POLLING === 'true' && !process.env.VERCEL;

    if (botToken) {
        const bot = new TelegramBot(botToken, { polling: isPolling });
        console.log(`🤖 Bot Gateway initialized. Polling: ${isPolling}`);
        setupBotHandlers(bot);
    }

    // --- STATIC FRONTEND ---
    const distPath = path.resolve(__dirname, '../dist');
    app.use(express.static(distPath));
    app.get(/.*/, (req, res) => {
        if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Endpoint not found' });
        res.sendFile(path.join(distPath, 'index.html'));
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`📡 API Gateway running on port ${PORT}`);
    });
}

setupRouting();

export default app;
