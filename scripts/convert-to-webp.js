import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname, basename } from 'path';

const IMAGES_DIR = './public/images';
const MIN_SIZE = 50 * 1024; // конвертируем файлы > 50KB

async function convertToWebP(dir) {
  const files = await readdir(dir);
  
  for (const file of files) {
    const filePath = join(dir, file);
    const fileStat = await stat(filePath);
    
    if (fileStat.isDirectory()) {
      await convertToWebP(filePath); // рекурсия
      continue;
    }
    
    const ext = extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;
    if (fileStat.size < MIN_SIZE) continue;
    
    const webpPath = filePath.replace(ext, '.webp');
    
    await sharp(filePath)
      .webp({ quality: 80 })
      .toFile(webpPath);
      
    console.log(
      `✅ ${file} → ${basename(webpPath)} ` +
      `(${Math.round(fileStat.size/1024)}KB → ` +
      `${Math.round((await stat(webpPath)).size/1024)}KB)`
    );
  }
}

convertToWebP(IMAGES_DIR)
  .then(() => console.log('🎉 Конвертация завершена!'));
