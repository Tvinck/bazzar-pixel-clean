const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'public/images');
const missingList = [
    'gender_swap.jpeg',
    'disintegration.jpeg',
    'winter_hateful_eight_1.jpeg',
    'winter_snowman.jpeg',
    'winter_skating.jpeg',
    'winter_hateful_eight_2.jpeg',
    'winter_umbrella_2.jpeg',
    'winter_flowers.jpeg',
    'winter_street.jpeg',
    'winter_hateful_eight_3.jpeg',
    'winter_umbrella_3.jpeg',
    'winter_umbrella.jpeg',
    'winter_car_2.jpeg',
    'winter_car_1.jpeg',
    'polaroid_cheburashka.png',
    'polaroid_tree.png',
    'snow_queen.png',
    'soviet_tree.png',
    'vintage_valentine.jpeg',
    'patronus.png',
    'tool_add.jpeg',
    'tool_remove.jpeg',
    'tool_replace.jpeg'
];

// Донор для зимних и праздничных
const winterDonor = path.join(imagesDir, 'christmas_card_custom.jpeg');
// Донор для остальных (нейтральный)
const neutralDonor = path.join(imagesDir, 'universal_portrait.jpeg');

// Проверим наличие доноров
if (!fs.existsSync(winterDonor)) {
    console.error('Донор winterDonor не найден!');
    process.exit(1);
}
if (!fs.existsSync(neutralDonor)) {
    console.log('Донор neutralDonor не найден, используем winterDonor');
}

let copiedCount = 0;

missingList.forEach(filename => {
    const dest = path.join(imagesDir, filename);
    let src = neutralDonor;

    // Выбираем донора по имени файла
    if (filename.includes('winter') || filename.includes('snow') || filename.includes('tree') || filename.includes('polaroid')) {
        src = winterDonor;
    }

    if (!fs.existsSync(src) && !fs.existsSync(neutralDonor)) {
        src = winterDonor; // Fallback
    }

    try {
        fs.copyFileSync(src, dest);
        console.log(`✅ Создана заглушка для: ${filename}`);
        copiedCount++;
    } catch (err) {
        console.error(`❌ Ошибка копирования для ${filename}:`, err.message);
    }
});

console.log(`\nВсего создано заглушек: ${copiedCount}`);
