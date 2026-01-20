import { createClient } from '@supabase/supabase-js';
import { encode } from 'blurhash';
import sharp from 'sharp';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ktookvpqtmzfccojarwm.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
// Note: For writing to DB, we might need SERVICE_ROLE key if RLS blocks us. 
// But here we might rely on the user having full access or providing the key.
// Let's assume standard key works if RLS allows or we need service key.
// Ideally usage: node scripts/backfill_blurhash.js

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateBlurhash(imageUrl) {
    try {
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { data, info } = await sharp(buffer)
            .raw()
            .ensureAlpha()
            .resize(32, 32, { fit: 'inside' })
            .toBuffer({ resolveWithObject: true });

        return encode(new Uint8ClampedArray(data), info.width, info.height, 4, 4);
    } catch (error) {
        console.error(`Error hashing ${imageUrl}:`, error.message);
        return null;
    }
}

async function start() {
    console.log('Starting Blurhash Backfill...');

    // 1. Fetch creations without blurhash
    // We can't filter by 'blurhash is null' easily if column doesn't exist yet, 
    // strictly speaking we should assume column exists (user ran migration).

    // We use a safe query
    const { data: creations, error } = await supabase
        .from('creations')
        .select('id, image_url, blurhash')
        .is('blurhash', null)
        .limit(100);

    if (error) {
        console.error('Error fetching creations:', error);
        return;
    }

    console.log(`Found ${creations.length} creations needing blurhash.`);

    for (const creation of creations) {
        if (!creation.image_url) continue;

        console.log(`Processing ${creation.id}...`);
        const hash = await generateBlurhash(creation.image_url);

        if (hash) {
            const { error: updateError } = await supabase
                .from('creations')
                .update({ blurhash: hash })
                .eq('id', creation.id);

            if (updateError) {
                console.error(`Failed to update ${creation.id}:`, updateError);
            } else {
                console.log(`Updated ${creation.id} => ${hash}`);
            }
        }
    }

    console.log('Done (batch 100). Run again if more needed.');
}

start();
