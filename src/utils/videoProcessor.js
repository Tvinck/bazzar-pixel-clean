/**
 * Utility for processing video files in the browser.
 * Focuses on scaling and 64-alignment for Kling 2.6 compatibility.
 */

export const processVideoTemplate = async (file) => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = URL.createObjectURL(file);
        video.muted = true;

        video.onloadedmetadata = async () => {
            const oldW = video.videoWidth;
            const oldH = video.videoHeight;
            const targetMin = 384; // Smallest multiple of 64 that is >= 340

            // 1. Calculate best scale to satisfy minimum
            let scale = Math.max(targetMin / oldW, targetMin / oldH, 1);

            // 2. Round dimensions to multiples of 64
            let newW = Math.round((oldW * scale) / 64) * 64;
            let newH = Math.round((oldH * scale) / 64) * 64;

            // 3. Ensure we didn't accidentally go below targetMin due to rounding
            if (newW < targetMin) newW = targetMin;
            if (newH < targetMin) newH = targetMin;

            console.log(`📹 Video Process: ${oldW}x${oldH} -> ${newW}x${newH}`);

            // If dimensions are already correct, we could skip processing, 
            // but usually we want to re-encode/normalize anyway if it's a template.
            // For now, let's just return the metadata so the UI can decide.
            // In a real production app, we'd use MediaRecorder + Canvas here.

            resolve({
                width: newW,
                height: newH,
                originalWidth: oldW,
                originalHeight: oldH,
                duration: video.duration,
                aspectRatio: (newW / newH).toFixed(2)
            });
            URL.revokeObjectURL(video.src);
        };

        video.onerror = () => reject(new Error('Failed to load video metadata'));
    });
};

/**
 * Normalizes any dimension to the nearest multiple of 64, with a minimum.
 */
export const alignTo64 = (dim, min = 384) => {
    return Math.max(min, Math.round(dim / 64) * 64);
};
