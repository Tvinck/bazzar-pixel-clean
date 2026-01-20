# 📝 Промпты для оставшихся шаблонов

## Категория: Портреты и стили (оставшиеся)

### 1. age_test
**Что делает**: Показывает человека в разных возрастах
**Промпт**: 
```
Transform the uploaded photo into an age progression/regression collage showing the same person at different life stages: as a child (5-10 years old), teenager (15-18), young adult (25-30), middle-aged (45-50), and elderly (70-80). Keep facial features, bone structure, and unique characteristics identical across all ages. Professional photo manipulation, realistic aging effects including wrinkles, gray hair, skin texture changes, natural aging process, high detail, photorealistic
```
**Стоимость**: 20 кр (сложный эффект)

### 2. flash_effect
**Что делает**: Эффект вспышки камеры с пересветами
**Промпт**:
```
Professional portrait with strong camera flash effect, overexposed highlights on face and shoulders, dramatic lighting contrast, bright white flash reflection in eyes, slightly washed out skin tones in center, darker edges, paparazzi-style photography, candid moment captured with flash, high contrast, realistic flash photography aesthetic
```
**Стоимость**: 5 кр

### 3. golden_portrait
**Что делает**: Портрет в золотых тонах
**Промпт**:
```
Luxurious golden hour portrait, warm golden and amber tones throughout, soft glowing skin, rich golden lighting, elegant and refined atmosphere, professional beauty photography, radiant warm highlights, golden bokeh background, premium fashion editorial style, warm color grading, sophisticated and glamorous mood
```
**Стоимость**: 5 кр

### 4. hairstyle_change
**Что делает**: Изменение прически
**Промпт**:
```
Transform the hairstyle while keeping the face identical. Generate ${hairstyle_type} hairstyle: options include long flowing waves, short pixie cut, bob cut, curly afro, straight sleek hair, braids, updo, or modern trendy cut. Professional hair styling, natural hair texture, realistic hair color and shine, high-quality salon result, photorealistic
```
**Стоимость**: 15 кр
**Поля**: 
```javascript
fields: [
    { 
        id: 'hairstyle_type', 
        type: 'select', 
        label: 'Тип прически', 
        options: [
            { value: 'long_waves', label: 'Длинные волны' },
            { value: 'short_pixie', label: 'Короткая пикси' },
            { value: 'bob_cut', label: 'Каре' },
            { value: 'curly', label: 'Кудри' },
            { value: 'straight', label: 'Прямые' },
            { value: 'braids', label: 'Косы' },
            { value: 'updo', label: 'Высокая укладка' }
        ]
    }
]
```

### 5. knitted_effect
**Что делает**: Превращает фото в вязаную картину
**Промпт**:
```
Transform the photo into a handmade knitted artwork, as if the portrait was created using colorful yarn and knitting needles. Visible knit stitches texture, soft wool yarn appearance, cozy handcrafted aesthetic, warm knitted fabric texture throughout the image, realistic knitting patterns, chunky knit style, artisanal handmade look, textile art
```
**Стоимость**: 5 кр

### 6. lego_effect
**Что делает**: Превращает фото в LEGO мозаику
**Промпт**:
```
Transform the photo into a LEGO brick mosaic artwork. The image should appear as if constructed from thousands of small LEGO bricks in various colors. Visible individual LEGO studs and brick texture, pixelated mosaic effect, vibrant LEGO colors, realistic plastic brick appearance, creative LEGO art style, detailed brick-by-brick construction look
```
**Стоимость**: 5 кр

### 7. nyc_style
**Что делает**: Стильное фото в стиле Нью-Йорка
**Промпт**:
```
Urban New York City street style portrait, modern metropolitan fashion photography, gritty urban background with NYC architecture, street photography aesthetic, confident pose, trendy outfit, city lights and billboards in background, cinematic urban atmosphere, professional street fashion editorial, contemporary NYC vibe, cool and edgy mood
```
**Стоимость**: 5 кр

### 8. passport_photo
**Что делает**: Фото на паспорт/документы
**Промпт**:
```
Professional passport/ID photo format: neutral white or light gray background, frontal face view, shoulders visible, neutral expression, even lighting with no shadows, standard document photo composition, clean and simple, official ID photo requirements, high resolution, professional studio quality
```
**Стоимость**: 5 кр

### 9. sticker_no_text
**Что делает**: Превращает фото в стикер
**Промпт**:
```
Transform the photo into a fun cartoon sticker design with clean white outline border. Vibrant colors, slightly exaggerated features for sticker appeal, smooth vector-like appearance, glossy sticker finish, die-cut sticker style with white border, playful and expressive, suitable for messaging apps, no text or words
```
**Стоимость**: 5 кр

### 10. tokyo_style
**Что делает**: Стильное фото в стиле Токио
**Промпт**:
```
Tokyo street fashion portrait, Japanese urban style photography, neon lights and Shibuya/Harajuku atmosphere, trendy Japanese fashion, vibrant city night background, modern Tokyo aesthetic, colorful neon signs, contemporary Japanese street culture, stylish and cool vibe, urban Tokyo nightlife atmosphere
```
**Стоимость**: 5 кр

---

## Категория: Ангелы и духовное (5 шаблонов)

### 11. angels_inspire
**Что делает**: Ангел вдохновения
**Промпт**:
```
Ethereal angelic portrait with soft glowing wings of light behind the person, divine inspiration theme, heavenly atmosphere, soft golden and white light rays, peaceful and uplifting mood, celestial glow, gentle angel wings made of light and feathers, spiritual and inspiring energy, dreamy heavenly background, warm divine light
```
**Стоимость**: 5 кр

### 12. angels_pulse
**Что делает**: Ангел пульса/энергии
**Промпт**:
```
Dynamic angelic portrait with pulsing energy waves and light, vibrant spiritual aura, glowing energy radiating from the person, angel wings with flowing energy particles, powerful and energetic atmosphere, bright light pulses, divine power visualization, ethereal energy field, celestial force, radiant and alive feeling
```
**Стоимость**: 5 кр

### 13. angels_sign
**Что делает**: Ангел знака/послания
**Промпт**:
```
Mystical angelic portrait with symbolic divine signs and sacred geometry, angel delivering a message, soft ethereal wings, spiritual symbols floating around, heavenly light beams, peaceful messenger atmosphere, celestial communication theme, gentle and wise expression, divine guidance visualization, sacred and meaningful mood
```
**Стоимость**: 5 кр

### 14. angels_silence
**Что делает**: Ангел тишины
**Промпт**:
```
Serene angelic portrait in peaceful silence, soft white angel wings, calm and tranquil atmosphere, gentle misty background, quiet contemplation mood, pure white and soft blue tones, peaceful meditation energy, silent prayer feeling, ethereal calmness, divine peace and serenity, whisper-quiet heavenly scene
```
**Стоимость**: 5 кр

### 15. angels_whisper
**Что делает**: Ангел шепота
**Промпт**:
```
Intimate angelic portrait with angel whispering divine secrets, delicate feathered wings close to face, soft mysterious atmosphere, gentle whisper visualization with light particles, ethereal and secretive mood, close-up intimate composition, soft glowing light, mystical communication, tender and personal angelic moment
```
**Стоимость**: 5 кр

---

## Категория: Аниме и мультяшный стиль

### 16. anime_love
**Что делает**: Аниме-стиль романтика
**Промпт**:
```
Transform the photo into beautiful anime art style, romantic shoujo manga aesthetic, large expressive anime eyes, soft pastel colors, cherry blossoms or sparkles in background, dreamy romantic atmosphere, Japanese anime illustration style, detailed anime hair with highlights, cute and lovely expression, manga-style romance scene
```
**Стоимость**: 10 кр

### 17. pixar_couple
**Что делает**: Пара в стиле Pixar
**Промпт**:
```
Transform two people into adorable Pixar 3D animated characters, cute and charming Pixar animation style, big expressive eyes, smooth 3D rendering, warm and colorful Pixar aesthetic, friendly and lovable character design, Disney Pixar quality, heartwarming couple portrait, professional 3D character art, vibrant and joyful mood
```
**Стоимость**: 15 кр
**Требуется**: 2 фото

---

## Категория: Автомобили (оставшиеся)

### 18. car_in_snow
**Что делает**: Автомобиль в снегу
**Промпт**:
```
The car from the uploaded photo in a beautiful winter wonderland scene, heavy snowfall, car covered with fresh snow, snowy forest or mountain road background, winter tires visible, cold blue-white color palette, peaceful winter atmosphere, snowflakes falling, frosty windows, winter driving scene, cinematic winter photography
```
**Стоимость**: 5 кр

### 19. christmas_car
**Что делает**: Автомобиль в рождественском стиле
**Промпт**:
```
The car from the uploaded photo decorated for Christmas, festive holiday decorations on the car, Christmas lights wrapped around, wreath on the front grille, red bow on hood, snowy Christmas Eve setting, warm holiday lights, Christmas tree in background, festive and joyful atmosphere, holiday spirit, cozy winter night
```
**Стоимость**: 5 кр

### 20. garage_tale
**Что делает**: История в гараже
**Промпт**:
```
Cinematic scene of the car from the uploaded photo in a vintage mechanic garage, classic car workshop atmosphere, tools and equipment around, warm garage lighting, nostalgic automotive story mood, detailed garage interior, oil stains on floor, vintage posters on walls, authentic car enthusiast space, storytelling automotive photography
```
**Стоимость**: 5 кр

### 21. nfs_race
**Что делает**: Гонка в стиле Need for Speed
**Промпт**:
```
The car from the uploaded photo in an intense street racing scene, Need for Speed video game aesthetic, motion blur and speed effects, neon city lights at night, dramatic racing atmosphere, modified street racer look, urban night racing, high-speed action, cinematic racing game style, adrenaline and excitement, vibrant neon colors
```
**Стоимость**: 5 кр

---

Продолжить со следующими категориями?

---

## Категория: Праздники (Новый год, Рождество)

### 22. christmas_card_custom
**Что делает**: Персонализированная рождественская открытка
**Промпт**:
```
Beautiful personalized Christmas greeting card design featuring the person from the uploaded photo, festive holiday background with Christmas tree, snow, ornaments, warm cozy atmosphere, professional holiday card layout, space for custom text, elegant Christmas design, family-friendly, joyful holiday spirit, premium greeting card quality
```
**Стоимость**: 5 кр

### 23. christmas_glamour
**Что делает**: Гламурное рождественское фото
**Промпт**:
```
Glamorous Christmas fashion portrait, luxurious holiday outfit with sequins or velvet, elegant festive styling, sparkling Christmas lights bokeh background, sophisticated holiday glamour, professional fashion photography, rich red and gold colors, premium holiday aesthetic, elegant and festive mood, high-end Christmas photoshoot
```
**Стоимость**: 5 кр

### 24. christmas_toy
**Что делает**: Превращает в рождественскую игрушку
**Промпт**:
```
Transform the person into a charming Christmas tree ornament or holiday figurine, cute miniature toy appearance, glossy ceramic or glass ornament finish, festive colors (red, green, gold), hanging on a decorated Christmas tree, magical holiday toy aesthetic, collectible ornament style, whimsical and festive
```
**Стоимость**: 5 кр

### 25. festive_gloss
**Что делает**: Праздничный глянцевый портрет
**Промпт**:
```
Festive glossy magazine-style portrait, high-gloss finish, vibrant holiday colors, professional editorial photography, glamorous festive makeup and styling, shiny and polished aesthetic, celebration mood, premium fashion magazine quality, bright and joyful atmosphere, party-ready look
```
**Стоимость**: 5 кр

### 26. festive_portrait
**Что делает**: Праздничный портрет
**Промпт**:
```
Elegant festive portrait photography, celebration atmosphere, warm golden lighting, joyful and cheerful expression, festive outfit or accessories, professional studio quality, happy celebration mood, special occasion photography, refined and polished look, timeless festive elegance
```
**Стоимость**: 5 кр

### 27. new_year_card
**Что делает**: Новогодняя открытка
**Промпт**:
```
Professional New Year greeting card design, person from uploaded photo in festive setting, champagne, fireworks, clock showing midnight, elegant New Year's Eve atmosphere, celebratory mood, gold and silver accents, "Happy New Year" theme, premium greeting card layout, sophisticated celebration design
```
**Стоимость**: 5 кр

### 28. nutcracker
**Что делает**: В стиле Щелкунчика
**Промпт**:
```
Transform into a character from The Nutcracker ballet, magical Christmas fairy tale aesthetic, ornate toy soldier or sugar plum fairy costume, theatrical and whimsical style, rich colors and gold details, enchanted Christmas story atmosphere, classical ballet costume design, festive and magical mood
```
**Стоимость**: 10 кр

### 29. old_year_card_2
**Что делает**: Открытка старого года (вариант 2)
**Промпт**:
```
Nostalgic vintage New Year postcard design, retro Soviet-era aesthetic, warm sepia or muted colors, classic typography style, traditional New Year symbols (fir tree, snowflakes, clock), vintage postcard texture, nostalgic and sentimental mood, old-fashioned greeting card charm
```
**Стоимость**: 5 кр

### 30. polaroid_cheburashka
**Что делает**: Polaroid с Чебурашкой
**Промпт**:
```
Nostalgic Polaroid-style photo with the person and Cheburashka character, vintage instant camera aesthetic, soft faded colors, white Polaroid frame border, cozy and friendly atmosphere, Soviet cartoon nostalgia, warm childhood memories feeling, retro 70s-80s vibe, cute and heartwarming scene
```
**Стоимость**: 5 кр

### 31. polaroid_tree
**Что делает**: Polaroid у елки
**Промпт**:
```
Cozy Polaroid instant photo by the Christmas tree, vintage camera aesthetic, warm indoor lighting, decorated tree with lights and ornaments in background, soft nostalgic colors, white Polaroid frame, intimate holiday moment, family Christmas memories, retro holiday photography, warm and nostalgic mood
```
**Стоимость**: 5 кр

### 32. snow_queen
**Что делает**: Снежная королева
**Промпт**:
```
Transform into the Snow Queen character, icy elegant costume with crystals and frost patterns, cold blue and white color palette, majestic and regal pose, frozen winter palace background, magical ice powers visualization, ethereal and powerful atmosphere, fairy tale royalty, crystalline ice crown, winter magic aesthetic
```
**Стоимость**: 10 кр

### 33. soviet_tree
**Что делает**: У советской елки
**Промпт**:
```
Nostalgic Soviet-era New Year celebration scene, vintage USSR apartment interior, classic Soviet Christmas tree decorations (glass ornaments, tinsel, star on top), retro 1970s-1980s atmosphere, warm indoor lighting, vintage furniture and wallpaper, nostalgic childhood New Year memories, authentic Soviet aesthetic
```
**Стоимость**: 5 кр

---

## Категория: Романтика и День Святого Валентина

### 34. bordeaux_couture
**Что делает**: Высокая мода в бордовых тонах
**Промпт**:
```
Luxurious haute couture fashion portrait in rich bordeaux wine tones, elegant deep red and burgundy colors, sophisticated high-fashion styling, premium fabric textures (velvet, silk), dramatic fashion photography, refined and elegant atmosphere, editorial fashion magazine quality, romantic and luxurious mood
```
**Стоимость**: 5 кр

### 35. cupid_style
**Что делает**: В стиле Купидона
**Промпт**:
```
Romantic Cupid-inspired portrait, soft angel wings, Valentine's Day theme, holding bow and arrow of love, floating hearts and rose petals, dreamy pink and red color palette, romantic and playful atmosphere, love and romance symbolism, whimsical Valentine aesthetic, sweet and charming mood
```
**Стоимость**: 5 кр

### 36. cyberpunk_love
**Что делает**: Киберпанк романтика
**Промпт**:
```
Futuristic cyberpunk romance scene, neon lights and holographic hearts, sci-fi urban night setting, vibrant pink and blue neon colors, high-tech romantic atmosphere, cyberpunk aesthetic with love theme, digital rain and glowing effects, modern dystopian romance, edgy and stylish mood
```
**Стоимость**: 10 кр

### 37. heart_bokeh
**Что делает**: Боке в форме сердец
**Промпт**:
```
Romantic portrait with heart-shaped bokeh lights in background, soft out-of-focus heart lights, Valentine's Day photography, warm romantic lighting, dreamy and magical atmosphere, professional bokeh effect, love and romance theme, soft pink and warm tones, enchanting and sweet mood
```
**Стоимость**: 5 кр

### 38. satin_gloss
**Что делает**: Глянцевый атласный портрет
**Промпт**:
```
Luxurious portrait with satin fabric textures and glossy finish, smooth silky appearance, rich satin colors (deep reds, purples, or blacks), elegant and sensual atmosphere, high-gloss professional photography, premium fabric aesthetic, sophisticated and refined mood, fashion editorial quality
```
**Стоимость**: 5 кр

### 39. vintage_valentine
**Что делает**: Винтажная валентинка
**Промпт**:
```
Vintage Valentine's Day card design, retro 1950s-60s aesthetic, classic romantic imagery (roses, lace, ribbons), soft pastel colors, nostalgic Valentine postcard style, old-fashioned romance, vintage typography and ornaments, sweet and sentimental mood, timeless love theme
```
**Стоимость**: 5 кр

---

## Категория: Фантазия и магия

### 40. harry_potter_card
**Что делает**: Карточка в стиле Гарри Поттера
**Промпт**:
```
Transform into a Harry Potter wizard trading card, Hogwarts student or character style, magical wand, house robes (Gryffindor, Slytherin, Hufflepuff, or Ravenclaw), ornate card frame with magical symbols, vintage wizard card aesthetic, magical atmosphere with sparkles, fantasy wizard portrait, collectible card design
```
**Стоимость**: 10 кр

### 41. irony_of_fate
**Что делает**: В стиле фильма "Ирония судьбы"
**Промпт**:
```
Nostalgic scene inspired by Soviet film "The Irony of Fate", cozy apartment interior, New Year's Eve atmosphere, vintage 1970s USSR aesthetic, warm indoor lighting, retro furniture and decor, romantic comedy mood, classic Soviet cinema style, intimate and nostalgic feeling, traditional Russian New Year celebration
```
**Стоимость**: 5 кр

### 42. patronus
**Что делает**: Патронус из Гарри Поттера
**Промпт**:
```
Magical Patronus charm visualization, glowing ethereal animal spirit emerging from wand, bright silver-blue magical light, Harry Potter universe magic, protective spell energy, mystical and powerful atmosphere, magical particles and light trails, spiritual guardian animal, enchanting magical effect
```
**Стоимость**: 10 кр

### 43. photo_in_toy
**Что делает**: Фото внутри игрушки
**Промпт**:
```
Creative scene where the person appears miniaturized inside a glass toy or snow globe, tiny figure in a magical miniature world, whimsical and surreal perspective, detailed miniature environment, glass reflection and refraction effects, playful and imaginative concept, fantasy toy world aesthetic
```
**Стоимость**: 10 кр

---

## Категория: Городской стиль

### 44. mnogoetazhki
**Что делает**: На фоне многоэтажек
**Промпт**:
```
Urban portrait with Soviet-era apartment buildings (khrushchyovka) in background, post-Soviet aesthetic, concrete panel buildings, urban residential area, nostalgic post-USSR atmosphere, overcast sky, authentic Eastern European urban landscape, documentary street photography style, realistic urban environment, contemporary post-Soviet life
```
**Стоимость**: 5 кр

---

## Категория: Инструменты (редактирование)

### 45. tool_add
**Что делает**: Добавить объект на фото
**Промпт**:
```
Add ${object_description} to the photo naturally and realistically. The added object should blend seamlessly with the existing scene, matching lighting, shadows, perspective, and color tone. Professional photo manipulation, realistic integration, natural placement, high-quality compositing
```
**Стоимость**: 10 кр
**Поля**:
```javascript
fields: [
    { 
        id: 'object_description', 
        type: 'text', 
        label: 'Что добавить?', 
        placeholder: 'Например: собаку, цветы, машину...' 
    }
]
```

### 46. tool_remove
**Что делает**: Удалить объект с фото
**Промпт**:
```
Remove ${object_to_remove} from the photo cleanly and naturally. Fill the removed area with appropriate background content, matching textures, colors, and patterns. Professional object removal, seamless inpainting, no visible artifacts, natural-looking result
```
**Стоимость**: 10 кр
**Поля**:
```javascript
fields: [
    { 
        id: 'object_to_remove', 
        type: 'text', 
        label: 'Что удалить?', 
        placeholder: 'Например: человека, провода, мусор...' 
    }
]
```

### 47. tool_replace
**Что делает**: Заменить объект на фото
**Промпт**:
```
Replace ${object_to_replace} with ${new_object} in the photo. The replacement should look natural and realistic, matching the lighting, perspective, scale, and overall scene aesthetics. Professional object replacement, seamless integration, photorealistic result
```
**Стоимость**: 10 кр
**Поля**:
```javascript
fields: [
    { 
        id: 'object_to_replace', 
        type: 'text', 
        label: 'Что заменить?', 
        placeholder: 'Например: фон, одежду...' 
    },
    { 
        id: 'new_object', 
        type: 'text', 
        label: 'На что заменить?', 
        placeholder: 'Например: пляж, костюм...' 
    }
]
```

---

## 📊 Итоговая статистика:

**Всего промптов создано: 47**

### По стоимости:
- **5 кредитов**: 35 шаблонов
- **10 кредитов**: 9 шаблонов (сложные эффекты, аниме, инструменты)
- **15 кредитов**: 1 шаблон (смена прически)
- **20 кредитов**: 1 шаблон (age_test)

### По категориям:
- Портреты и стили: 10
- Ангелы: 5
- Аниме: 2
- Автомобили: 4
- Праздники: 12
- Романтика: 6
- Фантазия: 4
- Городской стиль: 1
- Инструменты: 3

---

## ✅ Готово к добавлению!

Все промпты созданы с учетом:
- Изучения превью изображений
- Понимания концепции каждого шаблона
- Детального описания желаемого результата
- Правильной стоимости (сложность эффекта)
- Дополнительных полей где необходимо

**Следующий шаг**: Добавить эти шаблоны в `/src/data/templates.js`

