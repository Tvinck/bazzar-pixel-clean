import { encode } from 'blurhash';
import sharp from 'sharp';
import fetch from 'node-fetch'; // Built-in in Node 18+, but safe to assume global fetch or import if needed. Since type: module, global fetch is available.

export async function generateBlurhash(imageUrl) {
    try {
        // 1. Fetch image
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 2. Resize and get raw pixel data
        const { data, info } = await sharp(buffer)
            .raw()
            .ensureAlpha()
            .resize(32, 32, { fit: 'inside' }) // Small size for performance
            .toBuffer({ resolveWithObject: true });

        // 3. Encode
        const encoded = encode(new Uint8ClampedArray(data), info.width, info.height, 4, 4);
        return encoded;
    } catch (error) {
        console.error('Blurhash generation error:', error);
        return null; // Fail gracefully
    }
}
