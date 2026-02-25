import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { HttpsProxyAgent } from 'https-proxy-agent';
dotenv.config();

// User Provided Key as Default, Fallback to Env
const API_KEY = process.env.ELEVENLABS_API_KEY || 'sk_dd94c7658b07fd84a188571cd9ad7077bd80e8e993a3e07e';
const BASE_URL = 'https://api.elevenlabs.io/v1';

// Voice IDs (Verified Popular IDs for better quality)
export const VOICES = {
    'durov': 'N2lVS1w4EtoT3dr4eOWO', // Callum (Default male)
    'elon': 'nPczCjzI2devNBz1zQrb', // Brian (Deep)
    'putin': 'b7gUa5ipnyJuAK6dZBQy', // Custom Putin Voice
    'zhirinovsky': 'y0kT8VZH4EdelQ1J8Wcg', // User provided custom voice (updated)
    'trump': 'onwK4e9ZLuTAKqWW03F9', // Daniel (News presenter style - placeholder)
    'statham': 'TxGEqnHWrfWFTfGW9XjX', // Josh (Deep/Rough)
    'default': '21m00Tcm4TlvDq8ikWAM' // Rachel
};

export const elevenLabsService = {
    /**
     * Generate Audio via Official ElevenLabs API
     * @param {string} text - Text to speak
     * @param {string} voiceKey - Mapped voice key ('durov', 'elon', etc.)
     * @returns {Promise<Buffer|null>} - Audio buffer
     */
    generateAudio: async (text, voiceKey = 'durov') => {
        const voiceId = VOICES[voiceKey] || VOICES['default'];
        console.log(`🗣️ [ElevenLabs] Generating Audio. Voice: ${voiceKey} (${voiceId})`);

        const proxyUrl = process.env.PROXY_URL || process.env.HTTPS_PROXY;
        const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

        try {
            const res = await fetch(`${BASE_URL}/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: {
                    'xi-api-key': API_KEY,
                    'Content-Type': 'application/json',
                    'Accept': 'audio/mpeg,application/json,text/plain,*/*',
                    'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
                    'Origin': 'https://elevenlabs.io',
                    'Referer': 'https://elevenlabs.io/',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                    'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"macOS"',
                    'Sec-Fetch-Dest': 'empty',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Site': 'same-site'
                },
                body: JSON.stringify({
                    text: text,
                    model_id: "eleven_multilingual_v2", // Best for languages including Russian
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75
                    }
                }),
                agent: agent
            });

            if (!res.ok) {
                const errText = await res.text();
                console.error(`❌ ElevenLabs API Error (${res.status}):`, errText);
                throw new Error(`ElevenLabs API Error: ${res.status} ${errText}`);
            }

            const arrayBuffer = await res.arrayBuffer();
            return Buffer.from(arrayBuffer);

        } catch (error) {
            console.error('ElevenLabs Logic Error:', error);
            throw error; // Throw to be caught by main loop
        }
    }
};
