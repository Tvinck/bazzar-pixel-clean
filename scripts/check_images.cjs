const fs = require('fs');
const path = require('path');

// Пути
const templatesFile = path.join(__dirname, 'src/data/templates.js');
const imagesDir = path.join(__dirname, 'public/images');

// Читаем файл шаблонов
const content = fs.readFileSync(templatesFile, 'utf8');

// Извлекаем пути к картинкам регуляркой
// Ищем строки типа: src: "/images/filename.ext"
const regex = /src:\s*["']\/images\/([^"']+)["']/g;
let match;
const templateImages = [];

while ((match = regex.exec(content)) !== null) {
    templateImages.push(match[1]);
}

console.log(`Найдено ${templateImages.length} ссылок на изображения в templates.js`);

// Проверяем файлы
const missingFiles = [];
const existingFiles = [];

templateImages.forEach(filename => {
    const fullPath = path.join(imagesDir, filename);
    if (fs.existsSync(fullPath)) {
        existingFiles.push(filename);
    } else {
        missingFiles.push(filename);
    }
});

// Вывод результатов
console.log('✅ Существующие файлы:', existingFiles.length);
console.log('❌ Отсутствующие файлы:', missingFiles.length);

if (missingFiles.length > 0) {
    console.log('\nСписок отсутствующих файлов:');
    missingFiles.forEach(f => console.log(`- ${f}`));

    // Создадим файл отчета
    fs.writeFileSync('MISSING_IMAGES.md', '# ❌ Отсутствующие изображения\n\n' + missingFiles.map(f => `- [ ] ${f}`).join('\n'));
    console.log('\nСоздан файл MISSING_IMAGES.md');
} else {
    console.log('\n🎉 Все изображения на месте!');
}
