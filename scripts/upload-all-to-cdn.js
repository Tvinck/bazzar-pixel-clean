import { createClient } from '@supabase/supabase-js';
import { readFile, readdir, stat } from 'fs/promises';
import { join, extname } from 'path';

import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY
);

const BUCKET = 'assets';
const UPLOAD_DIRS = ['./public/images', './public/videos'];

async function uploadToCDN(dir, prefix = '') {
  try {
    const files = await readdir(dir);
    for (const file of files) {
      const filePath = join(dir, file);
      const fileStat = await stat(filePath);
      
      if (fileStat.isDirectory()) {
        await uploadToCDN(filePath, `${prefix}${file}/`);
        continue;
      }
      
      const fileBuffer = await readFile(filePath);
      let storagePath = filePath.replace('public/', '');
      
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, fileBuffer, {
          upsert: true,
          contentType: getContentType(file),
        });
        
      if (error) {
        console.error(`❌ ${file}: ${error.message}`);
      } else {
        const { data } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(storagePath);
        console.log(`✅ ${file} → ${data.publicUrl}`);
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(`Failed reading dir ${dir}`, err);
    }
  }
}

function getContentType(filename) {
  const ext = extname(filename).toLowerCase();
  const types = {
    '.webp': 'image/webp',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.mp4': 'video/mp4',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
  };
  return types[ext] || 'application/octet-stream';
}

async function run() {
  for (const dir of UPLOAD_DIRS) {
    await uploadToCDN(dir);
  }
}

run().then(() => console.log('🎉 Все файлы загружены в CDN!'));
