// Test Generation Script
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testGeneration() {
    console.log('🧪 Testing generation API...\n');

    const formData = new FormData();
    formData.append('prompt', 'beautiful sunset over mountains');
    formData.append('type', 'nano_banana');
    formData.append('userId', '668d4825-99d9-43c2-ad8d-71b569e29548'); // ArtyKosh UUID
    formData.append('aspectRatio', '1:1');
    formData.append('options', JSON.stringify({ telegramId: 603207436 }));

    try {
        console.log('📤 Sending request to http://localhost:3000/api/generate');
        console.log('   Prompt: beautiful sunset over mountains');
        console.log('   Model: nano_banana');
        console.log('   User: 668d4825-99d9-43c2-ad8d-71b569e29548');
        console.log('   Telegram ID: 603207436\n');

        const response = await fetch('http://localhost:3000/api/generate', {
            method: 'POST',
            body: formData
        });

        console.log(`📥 Response status: ${response.status} ${response.statusText}\n`);

        const data = await response.json();

        if (response.ok) {
            console.log('✅ SUCCESS!');
            console.log('Response:', JSON.stringify(data, null, 2));
        } else {
            console.log('❌ ERROR!');
            console.log('Error:', JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.log('❌ REQUEST FAILED!');
        console.error('Error:', error.message);
    }
}

testGeneration();
