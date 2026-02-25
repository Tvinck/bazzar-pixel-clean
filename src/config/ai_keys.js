const getEnv = (key, fallback = '') => {
    if (typeof process !== 'undefined' && process.env && process.env[key]) return process.env[key];
    return fallback;
};

export const GOOGLE_API_KEYS = [
    getEnv('DEFAPI_KEY', 'dk-ceccbc588eb13ca32f6f6e72eaa8ebf7') // DefAPI Key
];

// Key for Kie.ai (Video Generation)
export const KIE_API_KEY = getEnv('KIE_API_KEY');

export const AI_MODELS = {
    TEXT: 'gemini-1.5-flash',
    IMAGE_FAST: 'nano-banana',
    IMAGE_PRO: 'nano-banana-pro'
};

export const DEFAPI_BASE_URL = 'https://api.defapi.org/api';
