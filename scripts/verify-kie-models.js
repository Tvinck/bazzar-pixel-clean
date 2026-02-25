
import { calculateModelCost, KIE_MODELS_FLAT } from '../src/kie-models.js';

console.log('🔍 Verifying Kie Models Logic...\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`✅ PASS: ${message}`);
        passed++;
    } else {
        console.error(`❌ FAIL: ${message}`);
        failed++;
    }
}

// 1. Verify Nano Banana Pro Pricing
const nanoId = 'nano_banana_pro';
assert(calculateModelCost(nanoId, { resolution: '1K' }) === 18, 'Nano Banana Pro 1K should be 18');
assert(calculateModelCost(nanoId, { resolution: '2K' }) === 18, 'Nano Banana Pro 2K should be 18');
assert(calculateModelCost(nanoId, { resolution: '4K' }) === 24, 'Nano Banana Pro 4K should be 24');

// 2. Verify Flux Pro
assert(calculateModelCost('flux_pro') === 45, 'Flux Pro base cost should be 45');

// 3. Verify Video Pricing (Kling 2.6)
const klingId = 'kling_2_6';
assert(calculateModelCost(klingId) === 100, 'Kling 2.6 base cost should be 100');
assert(calculateModelCost(klingId, { duration: '10s' }) === 150, 'Kling 2.6 10s should be 150 (+50)');
assert(calculateModelCost(klingId, { quality: '1080p' }) === 150, 'Kling 2.6 1080p should be 150 (+50)');
assert(calculateModelCost(klingId, { duration: '10s', quality: '1080p' }) === 200, 'Kling 2.6 10s + 1080p should be 200');

// 4. Verify Batch Count
assert(calculateModelCost('nano_banana', { count: 3 }) === 30, 'Nano Banana x3 should be 30');

// 5. Verify Metadata Integrity
assert(KIE_MODELS_FLAT['seedream_edit'].max_images === 10, 'Seedream Edit should max 10 images');
assert(KIE_MODELS_FLAT['ideogram_v3'].capabilities.includes('remix'), 'Ideogram V3 should support remix');

console.log(`\nTests Completed: ${passed} Passed, ${failed} Failed`);

if (failed > 0) process.exit(1);
