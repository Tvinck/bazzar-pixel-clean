#!/usr/bin/env node

import localtunnel from 'localtunnel';

(async () => {
    try {
        const tunnel = await localtunnel({
            port: 5174,
            subdomain: 'bazzar-pixel-test',
            allow_invalid_cert: true
        });

        console.log('🌐 Tunnel URL:', tunnel.url);
        console.log('');
        console.log('📱 Используйте этот URL в BotFather для Mini App:');
        console.log('   ' + tunnel.url);
        console.log('');
        console.log('⚠️  ВАЖНО: Обновите WEB_APP_URL в .env:');
        console.log('   WEB_APP_URL=' + tunnel.url);
        console.log('');
        console.log('💡 Если видите страницу с паролем - это нормально для localtunnel.');
        console.log('   Telegram WebApp обойдёт её автоматически.');
        console.log('');
        console.log('🔄 Туннель активен. Нажмите Ctrl+C для остановки.');

        tunnel.on('close', () => {
            console.log('Tunnel closed');
        });
    } catch (err) {
        console.error('Ошибка создания туннеля:', err.message);
        console.log('');
        console.log('💡 Попробуйте использовать ngrok вместо localtunnel:');
        console.log('   1. Скачайте: https://ngrok.com/download');
        console.log('   2. Запустите: ngrok http 5174');
    }
})();
