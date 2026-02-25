import ffmpeg from 'fluent-ffmpeg';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { supabase } from '../lib/supabase.js';

/**
 * Adds branding (@Pixel_ai_bot) to an image or video/GIF.
 * @param {string} inputUrl - The URL of the input file.
 * @param {string} type - 'image' or 'video' (includes GIF).
 * @returns {Promise<string>} - The URL of the branded file.
 */
export async function addBranding(inputUrl, type) {
    console.log(`🏷️ Adding branding to ${type}: ${inputUrl}`);

    const tempDir = os.tmpdir();
    const inputPath = path.join(tempDir, `input_${Date.now()}_${path.basename(inputUrl)}`);
    const outputPath = path.join(tempDir, `branded_${Date.now()}_${path.basename(inputUrl)}`);

    try {
        // 1. Download the file
        const res = await fetch(inputUrl);
        const buffer = await res.arrayBuffer();
        fs.writeFileSync(inputPath, Buffer.from(buffer));

        if (type === 'image') {
            await brandImage(inputPath, outputPath);
        } else {
            await brandVideo(inputPath, outputPath);
        }

        // 2. Upload to Supabase
        const fileContent = fs.readFileSync(outputPath);
        const fileName = `branded/${path.basename(outputPath)}`;
        const { error } = await supabase.storage
            .from('uploads')
            .upload(fileName, fileContent, {
                contentType: type === 'image' ? 'image/jpeg' : 'video/mp4',
                upsert: true
            });

        if (error) throw error;

        const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
        return data.publicUrl;

    } catch (err) {
        console.error('Branding Error:', err);
        return inputUrl; // Fallback to original
    } finally {
        // Cleanup
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    }
}

async function brandImage(input, output) {
    const watermarkText = '@Pixel_ai_bot';

    // Create a text overlay using Sharp
    const svg = `
        <svg width="400" height="60">
            <style>
                .text { fill: white; font-size: 24px; font-weight: bold; font-family: sans-serif; filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.5)); }
            </style>
            <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" class="text">${watermarkText}</text>
        </svg>
    `;

    const svgBuffer = Buffer.from(svg);

    await sharp(input)
        .composite([{
            input: svgBuffer,
            gravity: 'southeast',
            top: 20,
            left: 20
        }])
        .jpeg()
        .toFile(output);
}

async function brandVideo(input, output) {
    return new Promise((resolve, reject) => {
        const watermarkText = '@Pixel_ai_bot';

        // Use ffmpeg to draw text
        // Note: Needs libfreetype enabled in ffmpeg
        ffmpeg(input)
            .videoFilters({
                filter: 'drawtext',
                options: {
                    text: watermarkText,
                    fontcolor: 'white',
                    fontsize: 24,
                    shadowcolor: 'black',
                    shadowx: 2,
                    shadowy: 2,
                    x: 'w-tw-20',
                    y: 'h-th-20'
                }
            })
            .on('end', () => resolve())
            .on('error', (err) => reject(err))
            .save(output);
    });
}
