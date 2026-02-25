const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { createClient } = require('@supabase/supabase-js');
const ffmpegPath = path.join(__dirname, '../node_modules/ffmpeg-static/ffmpeg');

ffmpeg.setFfmpegPath(ffmpegPath);

const supabaseUrl = 'https://ktookvpqtmzfccojarwm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0b29rdnBxdG16ZmNjb2phcndtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxMzc2NSwiZXhwIjoyMDgzODg5NzY1fQ.L99oEJS40e0R_l05Jm2kZkItJKdaPAEYrGM0WQ0y08Y';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const danceVideos = [
    'dance_trend', 'lezginka', 'macarena', 'gosti',
    'michael_jackson', 'moscow', 'latina', 'nobody',
    'big_guy', 'crazy_frog'
];

async function processAndUpload() {
    for (const name of danceVideos) {
        const srcPath = path.join(__dirname, `../public/videos/${name}.mp4`);
        const tempPath = path.join(__dirname, `../public/videos/${name}_res.mp4`);

        console.log(`Processing ${name}...`);

        // 1. Resize
        await new Promise((resolve, reject) => {
            ffmpeg(srcPath)
                .output(tempPath)
                .videoCodec('libx264')
                .size('384x512') // Default portrait size, multiples of 64
                .outputOptions(['-crf 23', '-preset fast', '-pix_fmt yuv420p'])
                .on('end', resolve)
                .on('error', reject)
                .run();
        });

        // 2. Upload to Storage
        console.log(`Uploading ${name} to Supabase...`);
        const fileContent = fs.readFileSync(tempPath);
        const { data, error } = await supabase.storage
            .from('uploads')
            .upload(`videos/${name}_v2.mp4`, fileContent, {
                contentType: 'video/mp4',
                upsert: true
            });

        if (error) {
            console.error(`Upload error for ${name}:`, error);
            continue;
        }

        const publicUrl = `${supabaseUrl}/storage/v1/object/public/uploads/videos/${name}_v2.mp4`;

        // 3. Update Database
        console.log(`Updating DB for ${name}...`);
        const { error: dbError } = await supabase
            .from('templates')
            .update({
                category: 'dances',
                src: publicUrl
            })
            .eq('id', name);

        if (dbError) console.error(`DB Update error for ${name}:`, dbError);

        // Clean up
        fs.unlinkSync(srcPath);
        fs.renameSync(tempPath, srcPath);
    }
    console.log('Done!');
    process.exit(0);
}

processAndUpload().catch(console.error);
