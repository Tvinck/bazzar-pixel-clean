
import { aiService } from '../src/ai-service.js';

// Mock Browser Environment for AI Service
global.window = { Telegram: { WebApp: { initData: 'mock_data' } } };
global.fetch = async (url, options) => {
    console.log(`\n🌐 [Mock Fetch] ${url}`);
    if (options && options.body) {
        try {
            const body = JSON.parse(options.body);
            console.log('📦 Request Body:', JSON.stringify(body, null, 2));
            return {
                ok: true,
                headers: { get: () => 'application/json' },
                json: async () => ({ data: { task_id: 'mock_task_123' } })
            };
        } catch (e) {
            console.error('❌ Invalid JSON body');
        }
    }
    return {
        ok: true,
        json: async () => ({})
    };
};

async function testGeneration() {
    console.log('🧪 Testing Kie Generation Logic...\n');

    try {
        // Test 1: Nano Banana Pro with 4K Resolution
        console.log('--- Test 1: Nano Banana Pro (4K) ---');
        await aiService.generateWithKie('Test Prompt', 'nano_banana_pro', {
            resolution: '4K',
            aspect_ratio: '16:9',
            skipPolling: true
        });

        // Test 2: Seedream Edit (Multi-Image)
        console.log('\n--- Test 2: Seedream Edit (Multi-Image) ---');
        await aiService.generateWithKie('Edit Prompt', 'seedream_edit', {
            source_files: ['http://img1.jpg', 'http://img2.jpg'],
            skipPolling: true
        });

        // Test 3: Ideogram V3 (Remix/Image-to-Image)
        console.log('\n--- Test 3: Ideogram V3 (Remix) ---');
        await aiService.generateWithKie('Remix Prompt', 'ideogram_v3', {
            source_files: ['http://img.jpg'],
            mode: 'turbo',
            skipPolling: true
        });

        // Test 4: Kling Video (Text to Video)
        console.log('\n--- Test 4: Kling 2.6 (Text-to-Video) ---');
        await aiService.generateWithKie('Video Prompt', 'kling_2_6', {
            duration: '10s',
            quality: '1080p',
            skipPolling: true
        });

    } catch (e) {
        console.error('❌ Test Failed:', e);
    }
}

testGeneration();
