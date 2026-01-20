// Google Gemini API Keys with Load Balancing
// These keys are used for text generation, prompt enhancement, and image generation (Nano Banana models).

export const GOOGLE_API_KEYS = [
    'AIzaSyBwPrkWTyJscjEtoaJpyI0onhSWAUoqnIA',
    'AIzaSyDZPUPqZ9jTrYsXaPntQ_rBzGkohaliP4E',
    'AIzaSyAcUPZ4suaGNaMpbSjIsziDpnQ4gPGduCU',
    'AIzaSyAUgOT1kb6p3Yv10fSfT5m3Rk-WEp4HRdw',
    'AIzaSyAm4FZXgxQMW-LAmd7Pkd-PtxoLiV0JLZs',
    'AIzaSyCe4cZitFW2U-s-0pFEZc6Iq07vFHOzP8M'
];

export const AI_MODELS = {
    // Current stable text model
    TEXT: 'gemini-1.5-flash',

    // "Nano Banana" - Fast Image Model
    // gemini-2.5-flash-image
    IMAGE_FAST: 'gemini-2.5-flash-image',

    // "Nano Banana Pro" - Pro Image Preview
    // gemini-3-pro-image-preview
    IMAGE_PRO: 'gemini-3-pro-image-preview'
};
