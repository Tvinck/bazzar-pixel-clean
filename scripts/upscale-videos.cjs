const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const ffprobePath = require('ffprobe-static').path;

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const VIDEOS_DIR = path.join(__dirname, '../public/videos');
const TEMP_DIR = path.join(__dirname, '../public/videos/temp_upscale');

if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

async function processVideos() {
    console.log('Scanning videos directory:', VIDEOS_DIR);
    const files = fs.readdirSync(VIDEOS_DIR).filter(f => f.endsWith('.mp4'));

    console.log(`Found ${files.length} videos. Checking resolution...`);

    for (const file of files) {
        const filePath = path.join(VIDEOS_DIR, file);

        await new Promise((resolve) => {
            ffmpeg.ffprobe(filePath, (err, metadata) => {
                if (err) {
                    console.error(`Error probing ${file}:`, err);
                    resolve();
                    return;
                }

                // Find video stream
                const stream = metadata.streams.find(s => s.codec_type === 'video');
                if (!stream) {
                    console.log(`Skipping ${file} (no video stream)`);
                    resolve();
                    return;
                }

                const width = stream.width;
                const height = stream.height;
                const rotation = stream.tags?.rotate; // Check rotation metadata

                // Effective width/height considering rotation doesn't change pixel buffer usually unless displayed
                // But let's assume raw dimensions.

                // Kie demands >= 340. We target 360 minimum for safety.
                const MIN_SIZE = 360;

                // Check min dimension (usually width for portrait)
                const minDim = Math.min(width, height);

                console.log(`${file}: ${width}x${height} (min: ${minDim})`);

                if (minDim < MIN_SIZE) {
                    console.log(`⚠️  Too small! Upscaling ${file}...`);
                    upscaleVideo(file, width, height, MIN_SIZE).then(resolve);
                } else {
                    console.log(`✅  OK`);
                    resolve();
                }
            });
        });
    }
}

async function upscaleVideo(filename, oldW, oldH, minTarget) {
    const inputPath = path.join(VIDEOS_DIR, filename);
    const outputPath = path.join(TEMP_DIR, filename);

    // Calculate scale factor
    // We want the smallest dimension to be at least minTarget
    // e.g. 270x480 -> target 360x(480*360/270)

    let scale = 1;
    if (oldW < minTarget || oldH < minTarget) {
        const scaleW = minTarget / oldW;
        const scaleH = minTarget / oldH;
        scale = Math.max(scaleW, scaleH); // Scale by the factor needed to bring the smallest side up
    }

    let newW = Math.round(oldW * scale);
    let newH = Math.round(oldH * scale);

    // Ensure even dimensions (h264 req)
    if (newW % 2 !== 0) newW++;
    if (newH % 2 !== 0) newH++;

    console.log(`   -> New size: ${newW}x${newH}`);

    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .output(outputPath)
            .videoCodec('libx264')
            .size(`${newW}x${newH}`)
            .outputOptions([
                '-crf 23',
                '-preset fast',
                '-movflags +faststart', // Optimize for web
                '-pix_fmt yuv420p' // Ensure compatibility
            ])
            .on('end', () => {
                console.log(`   ✨ Upscaled saved to temp.`);
                // Replace original
                try {
                    fs.unlinkSync(inputPath); // Delete old
                    fs.renameSync(outputPath, inputPath); // Move new
                    console.log(`   📝 Replaced original file.`);
                } catch (e) {
                    console.error(`Error replacing file:`, e);
                }
                resolve();
            })
            .on('error', (err) => {
                console.error(`   ❌ Error upscaling ${filename}:`, err);
                resolve(); // Continue anyway
            })
            .run();
    });
}

processVideos().then(() => {
    console.log('-----------------------------------');
    console.log('All videos processed!');
    try {
        if (fs.existsSync(TEMP_DIR)) fs.rmdirSync(TEMP_DIR);
    } catch (e) { }
    process.exit(0);
});
