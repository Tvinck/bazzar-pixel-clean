const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = path.join(__dirname, '../node_modules/ffmpeg-static/ffmpeg');

ffmpeg.setFfmpegPath(ffmpegPath);

const tasks = [
    {
        src: '/Users/macbookpro/Desktop/BAZZAR PRODJECT\'S/85a0f6d1-5e36-4a5f-9be4-dacaac87e1fb_360 (2).mp4',
        dest: path.join(__dirname, '../public/videos/dance_trend.mp4'),
        size: '384x512'
    },
    {
        src: '/Users/macbookpro/Desktop/BAZZAR PRODJECT\'S/2a0bf439-8d5d-4f83-861b-262c92412887_360.mp4',
        dest: path.join(__dirname, '../public/videos/moscow.mp4'),
        size: '384x512'
    },
    {
        src: '/Users/macbookpro/Desktop/BAZZAR PRODJECT\'S/9c0bd334-5473-4e22-a93f-1996aaff6b96_360.mp4',
        dest: path.join(__dirname, '../public/videos/crazy_frog.mp4'),
        size: '384x512'
    },
    {
        src: path.join(__dirname, '../public/videos/nobody.mp4'),
        dest: path.join(__dirname, '../public/videos/nobody_fixed.mp4'),
        size: '384x704'
    },
    {
        src: path.join(__dirname, '../public/videos/big_guy.mp4'),
        dest: path.join(__dirname, '../public/videos/big_guy_fixed.mp4'),
        size: '384x704'
    }
];

async function processVideo(task) {
    console.log(`Processing: ${task.src} -> ${task.dest} (${task.size})`);
    return new Promise((resolve, reject) => {
        ffmpeg(task.src)
            .output(task.dest)
            .videoCodec('libx264')
            .size(task.size)
            .outputOptions([
                '-crf 23',
                '-preset fast',
                '-movflags +faststart',
                '-pix_fmt yuv420p'
            ])
            .on('end', () => {
                console.log(`Finished: ${task.dest}`);
                if (task.dest.endsWith('_fixed.mp4')) {
                    const original = task.dest.replace('_fixed.mp4', '.mp4');
                    fs.unlinkSync(original);
                    fs.renameSync(task.dest, original);
                    console.log(`Replaced original: ${original}`);
                }
                resolve();
            })
            .on('error', (err) => {
                console.error(`Error processing ${task.src}:`, err);
                reject(err);
            })
            .run();
    });
}

async function main() {
    for (const task of tasks) {
        await processVideo(task);
    }
    console.log('All tasks finished!');
}

main().catch(console.error);
