// Bazzar Pixel - Template Data
// Централизованное хранилище всех шаблонов

export const TEMPLATE_CATEGORIES = {
    VIDEO: 'video',
    PHOTO: 'photo',
    DANCES: 'dances',
    WINTER: 'winter',
    PETS: 'pets',
    CARS: 'cars',
    EFFECTS: 'effects'
};

export const templatesData = [
    // ============================================
    // ВИДЕО ШАБЛОНЫ (Kling Motion Control)
    // ============================================
    {
        id: 'animate_photo',
        title: "ОЖИВИТЬ ФОТО",
        description: "Оживите ваши фотографии",
        category: TEMPLATE_CATEGORIES.DANCES,
        likes: "50k",
        src: "/videos/animate_photo.mp4",
        mediaType: 'video',
        model_id: 'grok-imagine/image-to-video',
        cost: 15,
        generation_prompt: 'Bring my photo to life with natural movements, realistic blinking, subtle head turns, and a lively expression. High quality, smooth animation, preserving original details.',
        configuration: {
            mode: '720p',
            character_orientation: 'video'
        }
    },
    {
        id: 'trend_dance',
        title: "ТРЕНДОВЫЙ ТАНЕЦ",
        description: "Сгенерируй танец из этих ваших Тиктоков!",
        category: TEMPLATE_CATEGORIES.DANCES,
        likes: "15k",
        src: "/videos/dance_trend.mp4",
        mediaType: 'video',
        model_id: 'kling_motion_control',
        cost: 15,
        generation_prompt: 'The character is performing a trendy TikTok dance with energetic movements, following the rhythm from the reference video. Dynamic, smooth, and synchronized choreography.',
        configuration: {
            mode: '720p',
            character_orientation: 'video'
        }
    },
    {
        id: 'lezginka',
        title: "ЛЕЗГИНКА",
        description: "Сгенерируй Лезгинку на любом фото!",
        category: TEMPLATE_CATEGORIES.DANCES,
        likes: "10k",
        src: "/videos/lezginka.mp4",
        mediaType: 'video',
        model_id: 'kling_motion_control',
        cost: 15,
        generation_prompt: 'The character is performing traditional Lezginka dance with characteristic fast footwork, arm movements, and energetic jumps. Traditional Caucasian dance style with authentic movements.',
        configuration: {
            mode: '720p',
            character_orientation: 'video'
        }
    },
    {
        id: 'macarena',
        title: "МАКАРЕНА",
        description: "Сгенерируй трендовый танец с любого фото",
        category: TEMPLATE_CATEGORIES.DANCES,
        likes: "12k",
        src: "/videos/macarena.mp4",
        mediaType: 'video',
        model_id: 'kling_motion_control',
        cost: 15,
        generation_prompt: 'The character is dancing the Macarena with classic arm and hip movements, following the iconic choreography. Fun, rhythmic, and synchronized dance moves.',
        configuration: {
            mode: '720p',
            character_orientation: 'video'
        }
    },
    {
        id: 'gosti',
        title: "Гости из Будущего",
        description: "Сгенерируй танец под Гости из Будущего!",
        category: TEMPLATE_CATEGORIES.DANCES,
        likes: "12k",
        src: "/videos/gosti.mp4",
        mediaType: 'video',
        model_id: 'kling_motion_control',
        cost: 15,
        generation_prompt: 'The character is performing an expressive dance with rhythmic arm movements and body swaying, following the nostalgic pop melody. Emotional and synchronized choreography.',
        configuration: {
            mode: '720p',
            character_orientation: 'video'
        }
    },
    {
        id: 'michael_jackson',
        title: "МАЙКЛ ДЖЕКСОН",
        description: "Сгенерируй трендовый танец с любого фото",
        category: TEMPLATE_CATEGORIES.DANCES,
        likes: "20k",
        src: "/videos/michael_jackson.mp4",
        mediaType: 'video',
        model_id: 'kling_motion_control',
        cost: 15,
        generation_prompt: 'The character is performing Michael Jackson signature moves including moonwalk, spins, and iconic poses. Smooth, precise, and legendary dance style.',
        configuration: {
            mode: '720p',
            character_orientation: 'video'
        }
    },
    {
        id: 'moscow',
        title: "MOSCOW",
        description: "Сгенерируй танец на любом фото!",
        category: TEMPLATE_CATEGORIES.DANCES,
        likes: "8k",
        src: "/videos/moscow.mp4",
        mediaType: 'video',
        model_id: 'kling_motion_control',
        cost: 15,
        generation_prompt: 'The character is dancing to Moscow song with energetic movements, characteristic Russian dance elements. Dynamic and rhythmic choreography.',
        configuration: {
            mode: '720p',
            character_orientation: 'video'
        }
    },
    {
        id: 'big_guy',
        title: "BIG GUY",
        description: "Превратись в большого парня!",
        category: TEMPLATE_CATEGORIES.DANCES,
        likes: "18k",
        src: "/videos/big_guy.mp4",
        mediaType: 'video',
        model_id: 'kling_motion_control',
        cost: 15,
        generation_prompt: 'The character is performing confident, powerful movements with strong presence. Masculine, bold body language and gestures.',
        configuration: {
            mode: '720p',
            character_orientation: 'video'
        }
    },
    {
        id: 'chanel',
        title: "CHANEL",
        description: "Модная фотосессия в стиле Chanel",
        category: TEMPLATE_CATEGORIES.DANCES,
        likes: "25k",
        src: "/videos/chanel.mp4",
        mediaType: 'video',
        model_id: 'kling_motion_control',
        cost: 15,
        generation_prompt: 'The character is posing elegantly like a fashion model, with graceful movements and sophisticated gestures. Luxurious, high-fashion style with refined poses.',
        configuration: {
            mode: '720p',
            character_orientation: 'video'
        }
    },
    {
        id: 'future_partner',
        title: "БУДУЩИЙ ПАРТНЕР",
        description: "Встреча с будущим партнером",
        category: TEMPLATE_CATEGORIES.DANCES,
        likes: "14k",
        src: "/videos/future_partner.mp4",
        mediaType: 'video',
        model_id: 'grok-imagine/image-to-video',
        cost: 15,
        generation_prompt: 'Imagine a suitable person of the opposite sex approaching me and hugging me. Romantic meeting, warm embrace, cinematic lighting, natural movements.',
        configuration: {
            mode: 'normal',
            character_orientation: 'video'
        }
    },
    {
        id: 'latina',
        title: "LATINA",
        description: "Латиноамериканский танец",
        category: TEMPLATE_CATEGORIES.DANCES,
        likes: "16k",
        src: "/videos/latina.mp4",
        mediaType: 'video',
        model_id: 'kling_motion_control',
        cost: 15,
        generation_prompt: 'The character is dancing Latin style with passionate hip movements, sensual gestures, and rhythmic body waves. Energetic salsa or bachata choreography.',
        configuration: {
            mode: '720p',
            character_orientation: 'video'
        }
    },
    {
        id: 'no_prada',
        title: "NO PRADA",
        description: "Дерзкий уличный стиль",
        category: TEMPLATE_CATEGORIES.DANCES,
        likes: "13k",
        src: "/videos/no_prada.mp4",
        mediaType: 'video',
        model_id: 'kling_motion_control',
        cost: 15,
        generation_prompt: 'The character is making bold, confident street-style movements with attitude. Urban, edgy gestures and poses.',
        configuration: {
            mode: '720p',
            character_orientation: 'video'
        }
    },
    {
        id: 'nobody',
        title: "NOBODY",
        description: "Танец Nobody",
        category: TEMPLATE_CATEGORIES.DANCES,
        likes: "19k",
        src: "/videos/nobody.mp4",
        mediaType: 'video',
        model_id: 'kling_motion_control',
        cost: 15,
        generation_prompt: 'The character is performing the Nobody dance challenge with characteristic moves. Trendy, viral dance choreography.',
        configuration: {
            mode: '720p',
            character_orientation: 'video'
        }
    },
    {
        id: 'reze',
        title: "REZE",
        description: "Аниме-стиль движения",
        category: TEMPLATE_CATEGORIES.DANCES,
        likes: "17k",
        src: "/videos/reze.mp4",
        mediaType: 'video',
        model_id: 'kling_motion_control',
        cost: 15,
        generation_prompt: 'The character is making anime-inspired movements and poses, dramatic gestures with character personality. Stylized, expressive animation.',
        configuration: {
            mode: '720p',
            character_orientation: 'video'
        }
    },
    {
        id: 'still_stern',
        title: "STILL STERN",
        description: "Серьезный и строгий образ",
        category: TEMPLATE_CATEGORIES.VIDEO,
        likes: "11k",
        src: "/videos/still_stern.mp4",
        mediaType: 'video',
        model_id: 'kling_motion_control',
        cost: 15,
        generation_prompt: 'The character maintains a serious, stern expression with minimal but powerful movements. Strong, authoritative presence.',
        configuration: {
            mode: '720p',
            character_orientation: 'video'
        }
    },

    // ============================================
    // ФОТО ШАБЛОНЫ - БАЗОВЫЕ
    // ============================================
    {
        id: 'generations_portrait',
        title: "ПОРТРЕТ ПОКОЛЕНИЙ",
        description: "Портрет поколений",
        category: TEMPLATE_CATEGORIES.PHOTO,
        likes: "25k",
        src: "/images/generations_portrait.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'A beautiful multi-generational family portrait showing ${gen_desc}, professional photography, warm lighting, emotional connection',
        fields: [
            { id: 'gen_desc', type: 'text', label: 'Описание поколений', placeholder: 'Например: Бабушка, Мама, Дочь' }
        ]
    },
    {
        id: 'polaroid_hugs',
        title: "ПОЛАРОЙД ОБНИМАШКИ",
        description: "нужно 2 фото",
        category: TEMPLATE_CATEGORIES.PHOTO,
        likes: "22k",
        src: "/images/polaroid_hugs.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Two people hugging warmly in a polaroid-style photo, vintage aesthetic, soft colors, nostalgic feeling, intimate moment, (use the face from uploaded photo for both characters or generate a suitable partner)',
        requiredFilesCount: 1
    },
    {
        id: 'universal_portrait',
        title: "УНИВЕРСАЛЬНЫЙ ПОРТРЕТ",
        description: "Универсальный портрет",
        category: TEMPLATE_CATEGORIES.PHOTO,
        likes: "30k",
        src: "/images/universal_portrait.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Professional portrait photography, clean background, perfect lighting, high quality, studio quality'
    },
    {
        id: 'old_year_card',
        title: "ОТКРЫТКА - СТАРЫЙ ГОД",
        description: "Открытка - старый год",
        category: TEMPLATE_CATEGORIES.PHOTO,
        likes: "18k",
        src: "/images/old_year_card.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Vintage New Year greeting card design, nostalgic Soviet style, warm colors, festive atmosphere'
    },
    {
        id: 'sun_rays',
        title: "СОЛНЕЧНЫЕ ЛУЧИ",
        description: "Красивая фотография в солнечных лучах",
        category: TEMPLATE_CATEGORIES.PHOTO,
        likes: "35k",
        src: "/images/sun_rays.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Beautiful portrait with golden sun rays streaming through, magical lighting, warm glow, dreamy atmosphere'
    },

    // ============================================
    // ПОРТРЕТЫ И ЭФФЕКТЫ - НОВЫЕ (21 шаблон)
    // ============================================
    {
        id: 'giant_sushi',
        title: "ГИГАНТСКИЙ СУШИ",
        description: "Высокая мода с юмором — нежные объятия с гигантским суши",
        category: TEMPLATE_CATEGORIES.EFFECTS,
        likes: "12k",
        src: "/images/giant_sushi.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'a surreal fashion editorial scene: a person on photo (keep face identical) in soft satin pajamas in warm neutral tones, sitting at a vivid orange table, gently resting her head and embracing an enormous salmon sushi roll as if it were a plush pillow, the roll is glossy, fresh, with visible layers of salmon, rice, and nori, she gazes directly into the camera, her expression serene and dreamy, minimalist studio background, soft natural light, poetic mood, LOEWE inspired surreal minimalism, food as emotional comfort, high-fashion elegance with a whimsical twist --ar 9:16'
    },
    {
        id: 'gender_swap',
        title: "СМЕНА ПОЛА",
        description: "Представьте, как бы вы выглядели в образе другого пола!",
        category: TEMPLATE_CATEGORIES.EFFECTS,
        likes: "45k",
        src: "/images/gender_swap.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Person rapidly transforms into opposite gender, same age, HD, ultra realistic, high detail, natural look. Smooth morphing of facial features (jawline, skin texture, eyes, lips), removal or growth of stubble, reshaping face, seamless change of hair and clothes, cinematic lighting. Similar facial features'
    },
    {
        id: 'dark_queen',
        title: "КОРОЛЕВА ТЬМЫ",
        description: "Сделай фото, будто правишь миром из тени. 👑",
        category: TEMPLATE_CATEGORIES.EFFECTS,
        likes: "22k",
        src: "/images/dark_queen.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Create a black-and-white image of a woman with a crown adorned with rhinestones and diamonds. Her eyes are completely white, and her face is turned slightly to the side, looking directly at the viewer. The woman\'s features should remain unchanged from the reference image. A man\'s hand, wearing a black glove with long, black nails, firmly grips her chin, pulling her attention towards him. The woman is looking at him, with an intense, haunting expression. The crown should be detailed, with the rhinestones and diamonds shining subtly in the dim lighting. The lighting should create strong contrasts between light and shadow, contributing to the dramatic and eerie atmosphere. The image should convey a sense of tension, with the film noir aesthetic highlighting the darkness and mystery of the scene.'
    },
    {
        id: 'scream_boy',
        title: "КРИК (ПАРНИ)",
        description: "Сделайте трендовый кадр из фильма Крик",
        category: TEMPLATE_CATEGORIES.EFFECTS,
        likes: "18k",
        src: "/images/scream_boy.png",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Use the uploaded selfie as the exact face and appearance of the main character — keep the likeness 1:1, realistic and true to the photo, without stylization or changes to facial features, hairstyle, or proportions. Create a cinematic, retro horror-inspired bedroom scene. The setting is a cozy 90s-style teen room with a checkered or striped bedspread. The guy (based on my selfie) is sitting on the bed, holding a vintage corded phone (dark red or black) to his ear. He wears a casual retro outfit (oversized t-shirt and jeans). In front of him is a large bowl of popcorn and scattered comic books, video game cartridges, or magazines. The room is softly lit by a bedside lamp, with retro posters on the wall (rock bands, video games, or cult horror movies). In the background, a shadowy figure wearing a Ghostface mask stands ominously in the doorway, adding suspense and contrast. Style: Cinematic, retro teen room meets 90s horror Color palette: Warm neutrals, muted reds, soft blues, warm lamp glow, deep shadows Emotion: Slight surprise or unease on the guy\'s face, as if sensing something behind him Camera angle: Frontal with a slight tilt, capturing both his expression and the doorway behind Texture: Slightly grainy, like a nostalgic VHS/film still Lighting: Soft and moody, with warm highlights and cool shadows Make sure the final image blends cozy and eerie elements, keeping the character (me) hyper-realistic, expressive, and identical to the uploaded selfie.'
    },
    {
        id: 'scream_girl',
        title: "КРИК (ДЕВУШКИ)",
        description: "Сделайте трендовый кадр из фильма Крик",
        category: TEMPLATE_CATEGORIES.EFFECTS,
        likes: "20k",
        src: "/images/scream_girl.png",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Use the uploaded selfie as the main character in the image. Create a cinematic, retro horror-inspired bedroom scene. The setting is a cozy 90s-style teen room with a soft pink bedspread. The girl (based on my selfie) is sitting on the bed, holding a vintage pink rotary phone to her ear. She has long wavy hair and wears a matching pink outfit. In front of her is a large bowl of popcorn and scattered comic books or magazines. The room is softly lit by a bedside lamp, with retro posters on the wall. In the background, a shadowy figure wearing a Ghostface mask stands ominously in the doorway, adding suspense and contrast. Style: Cinematic, pastel slumber party meets retro horror Color palette: Soft pinks, creamy whites, muted purples, warm lamp glow, deep shadows Emotion: Slight surprise or unease on the girl\'s face, as if sensing something behind her. Camera angle: Frontal with a slight tilt, capturing both her expression and the doorway behind Texture: Slightly grainy, like a nostalgic film still Lighting: Soft and moody, with warm highlights and cool shadows Make sure the final image blends cozy and eerie elements, keeping the character (me) realistic and expressive.'
    },
    {
        id: 'statue_style',
        title: "СТАТУЯ",
        description: "Преобразуйте ваши фотографии в впечатляющие статуи",
        category: TEMPLATE_CATEGORIES.EFFECTS,
        likes: "28k",
        src: "/images/statue_style.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Преобразуй моё изображение в гигантскую гиперреалистичную статую, основанную на данной фотографии, сохранив оригинальное лицо абсолютно без изменений. Статуя возвышается посреди кольцевой развязки в Нью-Йорке, рядом с известной исторической достопримечательностью. Статуя всё ещё находится в стадии строительства, окружена строительными лесами; вокруг много рабочих в жёлтых касках и оранжевых жилетах, которые карабкаются, сваривают и работают над ней. Часть тела статуи всё ещё представляет собой оголённый металлический каркас, в то время как другие участки уже проработаны и завершены. На фоне изображается реалистичная атмосфера Нью-Йорка: оживлённые улицы с жёлтыми такси, переполненные автобусы и множество машин, движущихся по кольцу. Уличные торговцы с хот-догами, кофейными тележками и красочными зонтиками стоят вдоль дороги. Неоновые вывески, огромные билборды и рекламные экраны сияют над улицами, создавая типичную атмосферу Нью-Йорка. Над всем этим простирается яркое дневное небо с небоскрёбами и характерным городским шумом, а вокруг царит оживлённая, динамичная обстановка. Стиль: фотореалистичный, яркий и полный жизни.'
    },
    {
        id: 'figure_style',
        title: "ФИГУРКА",
        description: "Как бы выглядела ваша фигурка?",
        category: TEMPLATE_CATEGORIES.EFFECTS,
        likes: "24k",
        src: "/images/figure_style.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Create a 1/7 scale commercialized figure of the character in the illustration, in a realistic style and environment. Place the figure on a computer desk, using a circular transparent acrylic base without any text. On the computer screen, display the Brush modeling process of the figure. Next to the computer screen, place a BANDAI-style toy packaging box printed with the original artwork.'
    },
    {
        id: 'trump_potato',
        title: "ТРАМП НА ОГОРОДЕ",
        description: "Получите ваше фото с Трампом, копающим картошку",
        category: TEMPLATE_CATEGORIES.EFFECTS,
        likes: "16k",
        src: "/images/trump_potato.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Копают картошку с трампом на вспаханном поле где много картошки, близкое фото, видно обоих, лицо один в один оставь, селфи, я на переднем плане'
    },
    {
        id: 'peephole',
        title: "ГЛАЗОК",
        description: "Стильное фото в дверной глазок",
        category: TEMPLATE_CATEGORIES.EFFECTS,
        likes: "14k",
        src: "/images/peephole.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Пересветы на светлых участках кадра от камеры. Жёсткий свет светит на лицо и тело от камеры. Окружение: очень узкий, тёмный и мрачный коридор внутри здания, с закрытыми дверями рядом с камерой и потолочной лампой прямо сверху. В центре переднего плана разместить людей на фото, очень близко к камере, занимающего большую часть кадра (видимая часть — все тело, близко к камере). Человек должен стоять строго по центру в полный рост, сточно таким же лицом. Одежда: тяжёлое застёгнутое пальто или куртка, простая и строгая. Освещение должно исходить от камеры и потолочной лампы сверху, создавая плоское освещение с мягкими тенями. Атмосфера должна напоминать подлинное винтажное фото: монохромные тона, лёгкая зернистость плёнки, эффект «рыбьего глаза» и характерное искажение «кошачий глаз». Итоговое изображение должно сильно напоминать старую фотографию из дверного глазка, где объект очень близко и строго по центру, как в референсном стиле. Добавь сильные искажения от глазка'
    },
    {
        id: 'figure_in_sphere',
        title: "ФИГУРКА В ШАРЕ",
        description: "Фигурка в стеклянном шаре",
        category: TEMPLATE_CATEGORIES.EFFECTS,
        likes: "26k",
        src: "/images/figure_in_sphere.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'A realistic close-up photo of a transparent glass Christmas ornament hanging on a Christmas tree. Inside the glass ball is a detailed miniature 3D figurine scene: a young couple sitting comfortably on white snow. The man has brown hair, wearing a blue denim jacket with a sherpa collar, dark pants, and a red scarf. The woman has blonde wavy hair, wearing a beige knit beanie, a red scarf, and blue jeans. A cute fluffy brown and white dog sits happily next to them. White snowflake patterns are painted on the glass surface. The background is a soft bokeh of pine branches and warm glowing golden Christmas lights. Cinematic lighting, cozy festive atmosphere, 8k resolution, photorealistic.'
    },
    {
        id: 'disintegration',
        title: "DISINTEGRATION",
        description: "Сгенерируйте эффект исчезновения, как по щелчку пальцев",
        category: TEMPLATE_CATEGORIES.EFFECTS,
        likes: "32k",
        src: "/images/disintegration.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Person disintegrating into particles and dust, Thanos snap effect, dramatic particle dispersion, cinematic lighting, photorealistic, high detail, body turning to ash and floating away, Marvel style disintegration'
    },
    {
        id: 'scream_style',
        title: "СТИЛЬ С КРИКОМ",
        description: "Мега стильная фотография с Криком на красном фоне",
        category: TEMPLATE_CATEGORIES.EFFECTS,
        likes: "19k",
        src: "/images/scream_style.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Фотореалистичная постановка по референсу с точным сохранением внешности: слева человек с фото с в чёрном наряде и длинных чёрных перчатках ; в правой руке маленькая металлическая зажигалка с ярким пламенем возле губ и тонкой сигареты. Справа рядом стоит персонаж в чёрном плаще с капюшоном и белой маской Ghostface. - Поза и кадрирование как в исходнике: кадр горизонтальный 4:3, верхняя часть туловища; человек в три четверти, рука с зажигалкой у лица; Ghostface чуть сзади и правее, повернут к камере, часть плаща спадает складками. - Одежда и реквизит: у человека минималистичный чёрный наряд свободного кроя из матовой ткани, длинные перчатки; у Ghostface длинный чёрный плащ/роба с капюшоном и белая маска. - Свет и сцена: однородный студийный фон с насыщенным тёплым красным слева и затемнением к правому краю; один жёсткий тёплый ключ слева‑спереди, глубокие мягкие тени; глянцевые блики на ткани перчаток и лёгкие акценты на складках плаща. Чистая студия, без лишних объектов, реалистичные цвета, лёгкое плёночное микрозерно. Без крови и агрессии. - Максимальный фотореализм, высокая детализация, 4K.'
    },
    {
        id: 'summer_corset',
        title: "ЛЕТНИЙ ЖЕНСКИЙ ПОРТРЕТ",
        description: "Летний легкий портрет в корсете",
        category: TEMPLATE_CATEGORIES.PHOTO,
        likes: "21k",
        src: "/images/summer_corset.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Летний портрет в саду, вертикальный кадр по пояс. Девушка стоит вполоборота вправо, спина прямая, плечи расслаблены, руки опущены; линия силуэта мягкая, элегантная S‑кривая. Освещение полуденное, тёплое, мягкие солнечные блики на коже и волосах; яркость высокая, контраст умеренно высокий, насыщенность натуральная. Палитра: сочные зелёные и оливковые фоны, пастельный голубой и чистый белый в одежде. Волосы светло‑каштановые, волнистые, до лопаток, с золотистыми прядями на свету. Топ корсетный пастельно‑голубой, открытая спина, плотная шнуровка сзади атласной лентой; короткие белые рукава‑ленточки спадают с плеч. Юбка белая, высокая посадка, лёгкая хлопковая ткань, мягкая оборка по поясу. Фон — размытый сад: кусты, газон, тёмные деревья, глубокое боке. Композиция со смещением вправо; объектив 85 мм, f/2, ISO низкое; баланс белого тёплый, тени глубокие, тон кожи золотистый; лёгкая плёночная зернистость, настроение — спокойная летняя романтика.'
    },
    {
        id: 'bw_man',
        title: "B&W MAN",
        description: "Создайте атмосферный черно-белый мужской портрет в стиле нуар",
        category: TEMPLATE_CATEGORIES.PHOTO,
        likes: "17k",
        src: "/images/bw_man.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Черно-белая атмосферная фотография в стиле нуар: мужчина сидит боком в кресле у открытого окна, профиль, расслабленная поза, в руке тонкая сигарета; изо рта и сигареты поднимаются мягкие завитки дыма, подсвеченные контровым светом. Сильный контраст, глубокие тени, low-key, легкий ободок контрового света по краю силуэта. Мужчина в фактурной рубашке, ослабленный галстук. Окно справа, за окном размытый городской квартал и кроны деревьев, мягкое боке. Композиция с акцентом на дым и геометрию оконной рамы, кадрирование по бедра, настроение спокойной задумчивости. Реалистичная фотография, монохром, 85mm, f/1.8, 1/200, ISO 200, естественный дневной свет, легкая кинопленочная зернистость, высокое разрешение.'
    },
    {
        id: 'ray_portrait',
        title: "ПОРТРЕТ С ЛУЧОМ",
        description: "Минималистичный портрет",
        category: TEMPLATE_CATEGORIES.PHOTO,
        likes: "23k",
        src: "/images/ray_portrait.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'A surreal, moody portrait of me (in the picture) exact the same face wearing a minimalist black outfit (based on uploaded portrait photo) is standing in profile with my head gently tilted back and eyes closed, facing upward. The background is deep gradient of cinematic blue,evoking mystery and serenity. A single sharp beam of warm white light cuts horizontally across him or her (based on uploaded portrait photo) face passing directly over my features are distinctly, with subtle shadows highlighting the contours of my (based on uploaded portrait photo) face. The highlighting is soft yet high-contrast, emphasizing texture while keeping the rest of the body in silhouette. Minimalist, cinematic composition with surreal lighting and a calm emotional tone. Inspired by fine art portraiture and ambient photography'
    },
    {
        id: 'beach_portrait',
        title: "НА ПЛЯЖЕ",
        description: "Перенеситесь на пляж в золотой час",
        category: TEMPLATE_CATEGORIES.PHOTO,
        likes: "27k",
        src: "/images/beach_portrait.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Оставь лицо, выражение лица, позу головы неизменным. Лицо и внешность перенеси с прикрепленного фото. Красивая молодая девушка на пляже в золотой час, окутанная солнечным светом, песком и летним спокойствием. Одета в длинное вязаное пляжное платье, сидит обхватив руками колени. Атмосфера мечтательных и умиротворённых моментов у моря. Мягкий тёплый естественный свет, высокая детализация'
    },
    {
        id: 'sunset_field',
        title: "ПОЛЕ НА ЗАКАТЕ",
        description: "Романтичный портрет в поле на закате",
        category: TEMPLATE_CATEGORIES.PHOTO,
        likes: "29k",
        src: "/images/sunset_field.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Оставь лицо, выражение лица, позу головы неизменным. Человека перенеси с прикрепленного фото. Портрет в открытом поле на золотом часе, тёплый контровый свет низкого солнца. Камера ниже уровня плеч, лёгкий правый профиль; композиция по правилу третей, горизонт низкий, вверху кадра солнце мягкими лучами и золотыми ореолами вокруг волос. Модель сидит на колене, корпус в три четверти, спина вытянута, шея удлинена; правая рука касается травы, левая опирается на колено, подол складывается в мягкие складки на земле. Волосы сияют янтарным римлайтом. Одежда: однотонное бежево‑песочное платье в пол из мягкого трикотажа, облегающий силуэт, глубокая спинка, рельефы на талии, удлинённые рукава‑колокола; на шее тонкое металлическое колье. Палитра — карамель, мёд, . Яркость средняя, контраст высокий; тени бархатные, насыщенность тёплая.: передний план и даль — кремовое боке. Цветокор WB 6000K, приподнятые чёрные, приглушённая зелень, лёгкое плёночное зерно. Атмосфера — тишина, ветерок, бархатный свет позднего лета.'
    },
    {
        id: 'bw_lady',
        title: "B&W LADY",
        description: "Создайте атмосферный черно-белый женский портрет в стиле нуар",
        category: TEMPLATE_CATEGORIES.PHOTO,
        likes: "19k",
        src: "/images/bw_lady.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Черно-белая атмосферная фотография в стиле нуар: девушка сидит боком в кресле у открытого окна, профиль, расслабленная поза, в руке бокал вина. Сильный контраст, глубокие тени, low-key, легкий ободок контрового света по краю силуэта. Девушка в шелковом платье. Окно справа, за окном размытый городской квартал и кроны деревьев, мягкое боке. Композиция с акцентом на дым и геометрию оконной рамы, кадрирование по бедра, настроение спокойной задумчивости. Реалистичная фотография, монохром, 85mm, f/1.8, 1/200, ISO 200, естественный дневной свет, легкая кинопленочная зернистость, высокое разрешение.'
    },
    {
        id: 'monster_high',
        title: "КУКЛА MONSTER HIGH",
        description: "Превратите человека на фото в куклу Monster High",
        category: TEMPLATE_CATEGORIES.EFFECTS,
        likes: "15k",
        src: "/images/monster_high.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Transform the uploaded person into a Monster High style collectible doll. The doll must keep the same gender, facial structure, clothes, hairstyle, hair color, and other recognizable features of the uploaded person, so it is clearly identifiable as them. Apply Monster High aesthetics: large expressive eyes, gothic-glam details, bold makeup or face paint, stylized proportions, and a slightly dramatic look. Place the doll inside an official Monster High retail box with transparent plastic window, Monster High branding, and decorative gothic packaging. Show the boxed doll as if it is a real collector\'s item on a shelf, under soft light, photographed like a product shot. Style: hyper-realistic toy photography, vibrant colors, premium packaging design.'
    },
    {
        id: 'beard_style',
        title: "БОРОДА И УСЫ",
        description: "Экспериментируйте с различными стилями бороды и усов",
        category: TEMPLATE_CATEGORIES.EFFECTS,
        likes: "13k",
        src: "/images/beard_style.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Three variations: 1. Change beard and mustache to classic dark beard. 2. Change beard and mustache to curled long mustache and small goatee. 3. Change beard and mustache to curled long mustache only. Professional portrait photography, same face, different facial hair styles.',
        fields: [
            {
                id: 'beard_variant',
                type: 'select',
                label: 'Вариант бороды',
                options: [
                    { value: '1', label: 'Классическая борода' },
                    { value: '2', label: 'Усы и бородка' },
                    { value: '3', label: 'Только усы' }
                ]
            }
        ]
    },
    {
        id: 'motion_crowd',
        title: "МОУШН В ТОЛПЕ",
        description: "Вы стоите неподвижно, а толпа размыта вокруг",
        category: TEMPLATE_CATEGORIES.EFFECTS,
        likes: "11k",
        src: "/images/motion_crowd.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Cinematic overhead shot of me standing still a brick city sidewalk, motion-blurred crowd rushes past around me moody lighting 35mm film look. Shallow depth of field, sharp focus on me. Ration portrait 4:3.'
    },

    // ============================================
    // ПИТОМЦЫ (4 шаблона)
    // ============================================
    {
        id: 'pet_vogue',
        title: "НА ОБЛОЖКЕ VOGUE",
        description: "Ваш питомец на пафосной обложке журнала VOGUE",
        category: TEMPLATE_CATEGORIES.PETS,
        likes: "38k",
        src: "/images/pet_vogue.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Transform the uploaded animal into a hyper-realistic high-fashion portrait on the cover of Vogue magazine. Show the animal only from the chest up, centered in the frame, with its unique markings and features preserved. Dress the animal in luxurious haute couture clothing and ornate jewelry, styled as if it were a celebrity photoshoot. Place the Vogue magazine masthead behind the dog, making it look like an authentic glossy magazine cover. Lighting should be dramatic and cinematic, with premium studio photography style, ultra-sharp focus, and an elegant editorial look.'
    },
    {
        id: 'pet_office',
        title: "ПИТОМЕЦ В ОФИСЕ",
        description: "Ваш питомец в роли уставшего офисного работника",
        category: TEMPLATE_CATEGORIES.PETS,
        likes: "31k",
        src: "/images/pet_office.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'The animal (from the uploaded photo) must appear in the foreground, very close to the camera, holding a large plastic cup of iced coffee or soda with a straw as if taking a selfie. Keep the animal\'s face recognizable but give it a tired, unamused expression with half-closed eyes, just like a burned-out employee. The paw should be stretched forward toward the camera, holding the cup naturally. Background: a dull open-space office with fluorescent lights, piles of paperwork, and tired human coworkers working or yawning at their desks. The style should be realistic and humorous, perfectly imitating the feel of a sarcastic office meme photo.'
    },
    {
        id: 'pet_bath',
        title: "ПИТОМЕЦ В ВАННОЙ",
        description: "Забавная и милая сцена с вашим питомцем в ванной",
        category: TEMPLATE_CATEGORIES.PETS,
        likes: "29k",
        src: "/images/pet_bath.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Transform the uploaded animal photo into a cozy cinematic bathroom scene. The animal must stay instantly recognizable (same face, fur pattern, and details). Place the animal sitting inside a bathtub, with a white towel wrapped like a turban around the head. Add warm candlelight around the bathtub, soft ambient glow, and a playful yellow rubber duck on the bathtub edge. The atmosphere should be warm, relaxing, and photorealistic — like a luxury spa moment. High detail, realistic textures, cinematic lighting.'
    },
    {
        id: 'pet_moon',
        title: "ПИТОМЕЦ С ЛУНОЙ",
        description: "Ваш питомец в волшебной сцене с луной",
        category: TEMPLATE_CATEGORIES.PETS,
        likes: "34k",
        src: "/images/pet_moon.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Transform the uploaded animal photo into a hyper-realistic cinematic night photograph. The animal is sitting on natural grass in a dark park or forest clearing under a tree. In front of the animal is a glowing full moon on the ground like a luminous sphere, and the animal touches it gently with one paw. Use real moonlight and cinematic lighting, natural shadows, and realistic reflections on the fur. Add subtle mist, light rays through the trees, and glowing fireflies. Style it as a photorealistic cinematic DSLR photo, shot with a 50mm lens, shallow depth of field, natural bokeh, and high-resolution textures. Do not paint, do not draw, not digital art — it must look like a real high-quality photo captured at night.'
    },

    // ============================================
    // АВТОМОБИЛИ (7 шаблонов)
    // ============================================
    {
        id: 'zombie_car',
        title: "ЗОМБИ ВОКРУГ АВТО",
        description: "Ваш автомобиль в тумане в окружении зомби",
        category: TEMPLATE_CATEGORIES.CARS,
        likes: "22k",
        src: "/images/zombie_car.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Нарисуй авто на фото в мрачном поле, сильный туман. Реалистично. Вечер. Вокруг и рядом с машиной много зловещих зомб. Фары горят, создавая красивый кинемотографичный glow эффект'
    },
    {
        id: 'car_paparazzi',
        title: "ФОТКАЮТ ТАЧКУ",
        description: "Ваш автомобиль в центре внимания и восхищенных взглядов",
        category: TEMPLATE_CATEGORIES.CARS,
        likes: "25k",
        src: "/images/car_paparazzi.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'реалистичное фото. машина на фото cтоит на фоне города с многоэтажками, на заднем плане закат. вокруг люди, которые восторженно смотрят на машину и фотографируют ее.'
    },
    {
        id: 'car_flower_street',
        title: "АВТО НА КРАСИВОЙ УЛОЧКЕ",
        description: "Ваш автомобиль на красивой улице с цветами",
        category: TEMPLATE_CATEGORIES.CARS,
        likes: "28k",
        src: "/images/car_flower_street.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Ich möchte ein ultra-realistisches Foto von meinem as on photo zentriert in einer engen alten Stein-Gasse. Die Kamera ist frontal auf niedriger Höhe und zeigt die komplette Front des Fahrzeugs. Über dem Auto hängt eine große Decke aus kräftig pinken Bougainvillea-Blüten mit dezenten Lichterketten. Blütenblätter fallen nach unten und liegen auf der Motorhaube, Windschutzscheibe und dem Kopfsteinpflaster. Die Gasse ist warm und romantisch beleuchtet durch Wandlampen im Hintergrund. Fokus scharf auf Auto und Blüten, Hintergrund leicht verschwommen. Das Bild soll eine magische, cineastische und ästhetische Stimmung haben – sehr detailreich und ultra fotorealistisch'
    },
    {
        id: 'street_car',
        title: "STREET CAR",
        description: "Ваш автомобиль под дождем на ночных улицах города",
        category: TEMPLATE_CATEGORIES.CARS,
        likes: "30k",
        src: "/images/street_car.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'На фоне ночного города машина с прикрепленного фото привлекает внимание, словно воплощение силы и элегантности. Капли дождя безжалостно падают на его гладкий кузов, подчеркивая каждую линию и изгиб, создавая эффектный контраст с темным окружением. Фары автомобиля горят, излучая теплый свет, который отражается на мокром асфальте, образуя абстрактные узоры, словно художник разливает краски на холсте. Струйки дождя, скользящие по лобовому стеклу, добавляют динамики и создают ощущение движения, словно машина готова в любой момент рвануть вперед. Темный фон лишь усиливает мощное присутствие автомобиля, делая его центром внимания. Эта сцена — не просто изображение; это захватывающее зрелище, где каждый элемент, от капель дождя до отражений на земле, работает в гармонии, создавая атмосферу драмы и напряжения.'
    },
    {
        id: 'hot_wheels_hand',
        title: "HOT WHEELS В РУКЕ",
        description: "Ваш автомобиль в виде модельки Hot Wheels",
        category: TEMPLATE_CATEGORIES.CARS,
        likes: "26k",
        src: "/images/hot_wheels_hand.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Мужская рука на переднем фоне держит авто с фото в упаковке хот вилс, как модельку. на упаковке под машинкой должна быть надпись названия машины. на заднем плане та же фотография, но слабо размытая в расфокусе. Фото должно выглядеть натурально'
    },
    {
        id: 'car_crush',
        title: "АВТО КРУШИТ ГОРОД",
        description: "Огромный автомобиль посреди мегаполиса",
        category: TEMPLATE_CATEGORIES.CARS,
        likes: "24k",
        src: "/images/car_crush.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Ultra-realistic cinematic scene of the uploaded car photo, transformed into a colossal giant car, driving down a moscow city street. Use the input photo car exactly 1:1 as the assembled centerpiece (same shape, details, and design). Camera angle from slightly above street level, tilted for drama, capturing the car in motion as it crushes smaller vehicles and cracks the asphalt beneath its wheels. On the foreground: people running in panic from the car facing the camera In the foreground: people run in panic, blurred by motion, adding scale and realism. Background: moscow city towering on both sides, glass reflecting the chaos. Flying debris, smoke, sparks, and shattered cars scattered along the road. Lighting is natural daylight but cinematic, with dramatic shadows and dust illuminated by the sun. The scene feels like a still frame from a high-budget disaster movie — Негативный промпт. No poster-style gloss, no cartoon, no surreal distortions, no car floating inside buildings, no boring static top-down view'
    },
    {
        id: 'car_model',
        title: "МОДЕЛЬКА АВТОМОБИЛЯ",
        description: "Как бы выглядела ваша модель автомобиля?",
        category: TEMPLATE_CATEGORIES.CARS,
        likes: "21k",
        src: "/images/car_model.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Ultra-realistic 3D render of a plastic model kit. Use the input photo car exactly 1:1 as the assembled centerpiece (same shape, details, and design). Place it on a wooden table. Surround it with sprues containing unassembled parts (wheels, bumpers, mirrors, spoilers). Add a branded model kit box with the same car printed on it. Include hobby tools and materials like glue, paint, pliers. Cinematic studio lighting, high detail, sharp textures, realistic hobby workshop atmosphere.'
    },

    // ============================================
    // ЗИМНИЕ КОЛЛАЖИ (12 шаблонов)
    // Все по 20 кредитов - сложные многокадровые композиции
    // ============================================
    {
        id: 'winter_hateful_eight_1',
        title: "ОМЕРЗИТЕЛЬНАЯ ВОСЬМЕРКА 1",
        description: "Сгенерируйте зимний коллаж в стиле Омерзительной восьмерки",
        category: TEMPLATE_CATEGORIES.WINTER,
        likes: "42k",
        src: "/images/winter_hateful_eight_1.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Описание общей сцены: Триптих, три кадра, связанных одной историей — мужчина в старинном зимнем пейзаже 19 века, в окружении снега, лошадей и экипажа. Фотореализм, снято будто на широкоформатную кинокамеру, холодное освещение, глубокие синие и серые тона. Лицо мужчины с фото сохранено на 100% без изменений: те же черты, кожа, глаза, выражение, борода, текстура волос, мимика и пропорции. Сцена выглядит как из исторического фильма — суровая, холодная, с ощущением одиночества и силы. 🔹 Верхняя панель (панель 1) Крупный портрет мужчины по плечи, лицо в лёгком три четверти повороте, взгляд напряжённый и сосредоточенный, на губах трубка, из которой поднимается лёгкий дым. Он носит тёмное пальто старого фасона с золотыми кантиками, толстый серый шарф, широкополую шляпу, покрытую снежинками. На лице — следы инея, ресницы и борода слегка в снегу. Снег идёт густыми крупными хлопьями, ветер чуть отклоняет их в сторону. Освещение мягкое, холодное, отражающее белизну снега вокруг, акцент на лице. Фон размытый, холодный пейзаж зимнего леса. 🔹 Средняя панель (панель 2) Общий план: мужчина стоит по колено в снегу напротив другого путника в меховой шубе. Позади — запряжённая упряжка из двух лошадей и дилижанс, на котором сидит возница. Окружение — редкий зимний лес из стройных белых берёз, их стволы уходят вглубь симметрично, снег глубокий и чистый. Мужчина в центре композиции, повернут влево, шляпа и плащ обметаны снегом, шарф колышется от ветра. Цветовая палитра — ледяная, голубовато-серая, с контрастом чёрных силуэтов одежды и коричневых лошадей. Атмосфера спокойная, но напряжённая, ощущение диалога в морозном воздухе. 🔹 Нижняя панель (панель 3) Средний план, мужчина идёт вперёд по снегу, взгляд устремлён прямо, лицо частично прикрыто шляпой и снегом. Снежинки оседают на ресницах и бровях, изо рта идёт пар. Ветер развевает края шарфа, позади виднеется экипаж и линии берёз. Камера расположена низко, слегка снизу-вверх, создавая чувство величия и суровой силы. Контрастный свет: холодный отражённый снег внизу, мягкое рассеянное небо сверху.'
    },
    {
        id: 'winter_snowman',
        title: "СО СНЕГОВИКОМ",
        description: "Сгенерируйте зимний коллаж со снеговиком",
        category: TEMPLATE_CATEGORIES.WINTER,
        likes: "38k",
        src: "/images/winter_snowman.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Стиль Y2K Коллаж из трёх горизонтальных фотографий, расположенных одна над другой, как единое изображение. Реалистичные зимние фото, естественная кожа и черты лица без глянцевой ретуши, сохранить моё реальное лицо. Съёмка днём на заснеженном поле/парке, вокруг много белого снега и слепленных снеговиков, лёгкий снег падает в кадре. Верхний кадр: я лежу на животе в снегу, опираясь на локти и сложив руки перед собой в белых пушистых варежках. На мне тёмное пальто или куртка, распущенные волосы рассыпаны по плечам. Я смотрю прямо в камеру спокойным мягким взглядом. На заднем плане видны несколько снеговиков, немного размытые. Средний кадр: я стою в полный рост, опираясь спиной или плечом на большого снеговика. На мне тёмный верх и клетчатая тёмная юбка до колен, белые гольфы и светлые зимние ботинки. Рядом в линию стоят еще несколько одинаковых снеговиков, уходящих вдаль, отбрасывают длинные тени на снег. На заднем плане деревья без листьев и здания, зимний парк. Нижний кадр: крупный план сбоку, я в белых варежках прикрепляю к снеговику морковку вместо носа, держу её рукой. Лицо снеговика крупно: круглый белый шар, маленькие чёрные глазки. Рядом в кадре моё лицо, я смотрю в камеру, волосы слегка покрыты снежинками. Освещение во всех кадрах — мягкий зимний дневной свет с тёплым солнечным отблеском сбоку или сзади, лёгкий контровый свет, из-за которого вокруг волос и снега появляется мягкое сияние.'
    },
    {
        id: 'winter_skating',
        title: "НА КАТКЕ",
        description: "Сгенерируйте свой зимний коллаж на катке",
        category: TEMPLATE_CATEGORIES.WINTER,
        likes: "35k",
        src: "/images/winter_skating.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Не меняй черты лица, оставь их точь в точь как на загруженном фото. Фото в стиле триптиха, на котором изображена женщина ночью на катке, среди других катающих людей . Другие люди находятся в моушен , размыты, в движении. На верхней панели — девушка по грудь, в профиль, расположена в правой части кадра. Она словно движется по льду на коньках на ночном катке среди мягко падающего снега, слегка запрокинула голову назад, глаза закрыты, губы расслаблены, руки разведены в стороны. Вокруг светятся фонари и люди. Атмосфера — спокойная, немного меланхоличная. На средней панели — тот же персонаж, вид со спины. Она так же на коньках на льду , фонари отражаются на льду. Ветер развевает её длинные волосы, в которых застряли снежинки. Её фигура немного подсвечена жёлтым светом фонарей. На фоне —, каток, огни, полупрозрачный туман от мороза. На нижней панели — крупный план лица той же девушки, с сохранением всех черт и выражения оригинала. Волосы развеваются, часть лица прикрыта прядями, на ресницах и в волосах блестят снежинки. Она смотрит прямо на зрителя, в глазах отражается мягкий свет фонарей. Правая рука придерживает волосы, чтобы ветер не закрыл полностью лицо. Использовать лицо с фото на 100% , не изменяя черты лица'
    },
    {
        id: 'winter_hateful_eight_2',
        title: "ОМЕРЗИТЕЛЬНАЯ ВОСЬМЕРКА 2",
        description: "Сгенерируйте зимний коллаж в стиле Омерзительной восьмерки",
        category: TEMPLATE_CATEGORIES.WINTER,
        likes: "40k",
        src: "/images/winter_hateful_eight_2.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Создай реалистичный портрет человека, без изменения внешности лица. Максимально точно сохрани лицо мужчины. Используй внешность лица Максимально точно как в референсе(если есть очки - добавь, если их нет - не добавляй) Общее описание: Гиперреалистичный триптих (три вертикальные панели 9:16), объединённый общей историей — мужчина с фото, чьи черты лица полностью сохранены без изменений: форма, пропорции, , волосы, кожа, взгляд, мимика и текстура. мужчина в меховом пальто и широкополой шляпе, с суровым выражением лица. Атмосфера снежной зимы, холодная хижина в горах Дикого Запада. Внутри — тёплый свет от керосиновой лампы, деревянные стены, меховые одежды и старинные предметы интерьера. Детали — пар изо рта, кружка с виски, винтовка на столе, старые бутылки и свечи. Освещение тёплое и контрастное, с мягкими тенями, как в фильмах Квентина Тарантино. Текстура изображения напоминает старую киноплёнку: винтажные тона, зернистость, реалистичный стиль. 🔹 Верхняя панель (панель 1) Портрет крупным планом: мужчина с фото в зимней одежде старого Запада, персонаж закуривает сигару, глаза прикрыты, дым окутывает лицо. На нём широкополая чёрная шляпа, плотное пальто с золотым кантом и толстый шерстяной шарф серого цвета.. 🔹 Средняя панель (панель 2) Общий план: мужчина стоит посреди хижины с Он одет в тот же тёмный плащ, в руках держит два револьвера, направленные в стороны, поза напряжённая, решительная. 🔹 Нижняя панель (панель 3) герой сидит за барной стойкой, в напряжённой беседе, с кружкой виски в руке. Переход от первой панели к последней — как постепенный переход от напряжения к спокойствию.'
    },
    {
        id: 'winter_umbrella_2',
        title: "С ЗОНТИКОМ 2",
        description: "Сгенерируйте зимний коллаж с зонтиком",
        category: TEMPLATE_CATEGORIES.WINTER,
        likes: "33k",
        src: "/images/winter_umbrella_2.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Создайте вертикальную рамку размер 2160x3840 пикселей 4K Не меняя внешнего вида. качество разделено на три горизонтальных изображения одинакового размера, расположенных вместе. Главный герой основан на эталонной прическе лица и тела молодой фигуре с выражением грусти и ностальгии глубокими глазами, излучающими одиночество Наряд представляет собой свободный зимний пуховик с широкими штанами и черным шарфом Общая атмосфера покрыта белым снегом с холодной цветовой палитрой, которая вызывает меланхолию и одиночество Изображение 1.портрет Персона дерджита прозрачный зонтик, слегка поворачивая голову назад, глядя прямо на кадр Выражение печально с душевными глазами Фон размыт снежной белизной Изображение 2. всё тело с зонтом. стоит один на огромном снежном поле, идя, глядя на небо. Угол камеры смотрит сверху вниз это выглядит так, как будто персонаж поднимает руку, чтобы поймать падающие снежинки. Вдалеке стоят несколько голых деревьев. Эта сцена создает впечатление малости и изолированности на фоне бескрайней природы. Изображение 3.Увеличенный снимок глаз персонажей крупным планом с отстраненным печальным взглядом, вызывающим чувство одиночества и тоски'
    },
    {
        id: 'winter_flowers',
        title: "С ЦВЕТАМИ",
        description: "Сгенерируйте свой зимний коллаж с цветами",
        category: TEMPLATE_CATEGORIES.WINTER,
        likes: "31k",
        src: "/images/winter_flowers.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Стиль Y2K Коллаж из двух горизонтальных фотографий, одно над другим, как единое изображение. Реалистичные зимние фото, без глянцевой ретуши, естественная текстура кожи, сохранить мои реальные черты лица. Съёмка на фоне заснеженного пейзажа у замёрзшей реки или озера, вдали тёмный лес и горы, небо холодное, вечернее, в оттенках голубого и бледно-розового. Верхнее фото: я в полупрофиль по пояс, стою на снегу, в руках букет полевых цветов (мелкие белые и жёлтые цветы с зелёными стеблями). На мне тёмное длинное пальто в клетку, бордовый шарф в клетку и бордовые вязаные перчатки. Длинные распущенные волосы, на плечах и волосах лежит снег. Я смотрю вверх, к небу, одной рукой в перчатке прижимаю пальцы к губам, поза спокойная и немного мечтательная. Нижнее фото: крупный план моего лица в профиль или три четверти, фон размытый синим снегом и горой. Видны длинные ресницы, аккуратный макияж, румянец от холода на щеках, немного покрасневший кончик носа, губы с лёгким влажным блеском. Тот же бордовый шарф плотно обвивает шею, на волосах и шарфе лежат снежинки. Несколько снежинок в воздухе перед объективом, лёгкий боке-эффект.'
    },
    {
        id: 'winter_street',
        title: "НА УЛИЦЕ",
        description: "Сгенерируйте свой зимний коллаж на улице",
        category: TEMPLATE_CATEGORIES.WINTER,
        likes: "36k",
        src: "/images/winter_street.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Не меняй черты лица, оставь их точь в точь как на загруженном фото. Фото в стиле триптиха, на котором изображена женщина в ночном зимнем городе где сверкает множество фонарей , она идет по трассе . На верхней панели изображена женщина по грудь, в профиль, расположенная в правой части кадра. Она запрокинула голову назад и закрыв глаза будто смотрит в небо разведя руки в стороны. На ней белая свободная куртка, белые спортивные оверсайз джоггеры. Ее волосы развеваются на ветру закрывая лицо. На заднем плане ночной город полный ярких фонарей , где спокойно и нет людей в небе идут хлопья снега, На средней панели изображена всё та же женщина со спины, смотрящая в кадр . На фоне все усыпано снегом по ночному городу. Её волосы сильно развеваются на ветру в них запутались снежинки . На заднем плане нижней панели, крупным планом, изображено лицо всё той же женщины, частично скрытое развевающимися на ветру волосами в них немного снежинок , которая смотрит прямо на зрителя. Правой рукой она придерживает волосы Ночной Город и небо создают ( нейтральный, угрюмый фон для фотографии в натуралистическом стиле и при мягком освещении. Использовать лицо с фото на 100% , не изменяя черты лица'
    },
    {
        id: 'winter_hateful_eight_3',
        title: "ОМЕРЗИТЕЛЬНАЯ ВОСЬМЕРКА 3",
        description: "Сгенерируйте зимний коллаж в стиле Омерзительной восьмерки",
        category: TEMPLATE_CATEGORIES.WINTER,
        likes: "39k",
        src: "/images/winter_hateful_eight_3.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Общее описание: Гиперреалистичный триптих (три вертикальные панели 9:16), объединённый общей историей — мужчина с фото, чьи черты лица полностью сохранены без изменений: форма, пропорции, , волосы, кожа, взгляд, мимика и текстура. Сцена в духе старого вестерна, разворачивается в горах под снегопадом, с ощущением одиночества, холода и внутренней силы. Кинематографический стиль, реалистичный свет, высокая детализация, атмосфера как в фильмах Квентина Тарантино. 🔹 Верхняя панель (панель 1) Портрет крупным планом: мужчина с фото в зимней одежде старого Запада, крупные снежинки падают на его шляпу . На нём широкополая чёрная шляпа, плотное пальто с золотым кантом и толстый шерстяной шарф серого цвета. Снег осел на воротнике и плечах, дыхание превращается в лёгкий пар. Фон — размытый снежный лес и силуэты лошадей вдалеке. Взгляд серьёзный, сосредоточенный, холодное боковое освещение подчёркивает текстуру кожи и снега. 🔹 Средняя панель (панель 2) Общий план: мужчина стоит посреди заснеженного леса, в окружении берёз и сугробов. Он одет в тот же тёмный плащ, в руках держит два револьвера, направленные в стороны, поза напряжённая, решительная. Снегопад усиливается, плотные хлопья закрывают часть фигуры. Позади виден деревянный домик и дилижанс, запряжённый лошадьми. Цветовая палитра — холодная, с приглушённым золотисто-коричневым контрастом на ткани и коже. Свет рассеянный, дневной, реалистичный, без пересветов. 🔹 Нижняя панель (панель 3) Полуоборот сбоку, мужчина идёт по снегу, шляпа слегка опущена, взгляд направлен вниз. Рука с револьвером прижата к телу, на пальцах снежинки и иней. На фоне виднеются берёзы и горный склон, лёгкий пар от дыхания, снег сыплется крупными хлопьями. Шарф развевается на ветру, пальто частично открыто, подол покрыт снегом. Освещение мягкое, естественное, отражённое от снега, подчёркивающее текстуру ткани и кожи.'
    },
    {
        id: 'winter_umbrella_3',
        title: "С ЗОНТИКОМ 3",
        description: "Сгенерируйте зимний коллаж с зонтиком",
        category: TEMPLATE_CATEGORIES.WINTER,
        likes: "34k",
        src: "/images/winter_umbrella_3.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Create a vertical composition of 2160×3840 px 4K, divided into three equal horizontal parts. The girl (face from the uploaded photo without changes), with a sad, nostalgic expression, looks deeply with a sense of loneliness. The atmosphere is white snow, a cold color scheme that evokes melancholy and solitude. Image 1 portrait: the character holds a transparent umbrella, silently turning her head back. The background is blurred and covered with the white snow. Image 2 full-length: the character is alone, standing with their back to the camera in a vast snowy field. The camera is shot from above at a downward angle, and the character raises their hand to catch falling snowflakes. In the background, there are bare, leafless trees. The scene conveys a sense of smallness and isolation against the backdrop of nature. Image 3 close-up: a close-up of the character\'s eyes, distant gaze that evokes feelings of loneliness and longing.'
    },
    {
        id: 'winter_umbrella',
        title: "С ЗОНТИКОМ",
        description: "Сгенерируйте свой зимний коллаж с зонтиком",
        category: TEMPLATE_CATEGORIES.WINTER,
        likes: "32k",
        src: "/images/winter_umbrella.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Стиль Y2K Коллаж из двух горизонтальных фотографий, одно над другим, как единое изображение. Реалистичные зимние фото, без глянцевой ретуши и фильтров, кожа с естественной текстурой, мои реальные черты лица полностью сохранены. Верхнее фото: я по грудь в кадре, стою на улице во время снегопада, держу над собой прозрачный зонт. На мне объёмная чёрная пуховая куртка и очень толстый тёмный вязаный шарф, плотно намотанный вокруг шеи. Волосы средней длины, немного растрёпанные, на лице лёгкий естественный макияж, румянец от холода и заметные веснушки. В ухе маленькие серебряные кольца-серьги и белый наушник. Я смотрю в сторону, немного задумчиво. На зонте и волосах лежит снег, вокруг падают снежинки. Фон размытый, всё в мягком серо-белом тумане зимнего дня. Нижнее фото: крупный план моего лица, почти весь кадр занимает лицо и верх шарфа. Тот же чёрный вязаный шарф закрывает подбородок, на нём лежит много снежинок. Волосы и ресницы слегка покрыты снегом. Хорошо видны глаза, длинные ресницы, румянец на щеках, маленькие веснушки, губы натурального оттенка. Выражение спокойное, немного меланхоличное.'
    },
    {
        id: 'winter_car_2',
        title: "В МАШИНЕ 2",
        description: "Сгенерируйте зимний коллаж в машине",
        category: TEMPLATE_CATEGORIES.WINTER,
        likes: "37k",
        src: "/images/winter_car_2.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Hyper-realistic 8K portrait of one woman, three horizontal frames stacked vertically (~33% each), seamless collage, no borders or lines The same woman in all frames, identical to the reference 1:1 — same face, proportions, bone structure, natural beauty. Hyper-realistic glowing skin with fully visible pores, radiant microtexture, zero smoothing General model details (all frames) Long, thick, luxurious loose waves, always fully loose (STRICT: absolutely no buns, no pranks, no partial tying, no clips, no lifting, no pinning — hair MUST remain 100% fully down in every frame), soft natural shine, realistic strands Soft luxury makeup: luminous skin, subtle contour, warm blush, natural long lashes, nude satin lips, winter blush from cold Fur coat: luxurious premium ivory, extremely fluffy, soft, voluminous, fully closed, no buttons, no belts, no other clothing visible Cinematic winter fashion photography, quiet luxury, calm, soft dawn winter light, pastel white–pink–light blue–beige palette, gentle frosty accents, fine snowfall, delicate mist Top Frame — Ultra Close-Up Portrait (Mega Zoom, STRICT CLOSE-UP, Eye-Level) Face fills the frame from chin to top of head, shot at eye level, very close (STRICT) Super-realistic face, alive-like accuracy, exact facial features matching reference (STRICT). Expression calm, confident, feminine Eyes sharply looking directly into the camera (STRICT, IMPORTANT) Hair fully loose, strictly 100% down, soft natural flow on both sides; STRICT: no buns, pranks, partial tying, clips, missing strands, no lifting or pinning Fur hood extremely voluminous, deep, soft, plush, fully surrounding the face (STRICT, IMPORTANT) Background: muted evergreen forest, softly blurred; STRICTLY no car Soft dawn sunlight with pastel pink, white, light blue, beige tint, brighter golden-pink sunrise light illuminating her face, warm shimmering gold–rose highlights Atmosphere intimate, premium, cohesive Middle Frame — Frozen Lake (Mid-Leg Shot) Woman standing fully back to camera, face not visible Hair completely loose — STRICT: 100% fully down, long, thick, flowing naturally down the back; no buns, no pranks, no tying, no clips, no partial lifts; hood removed, lying flat Ivory fur coat fully closed. Snow clearly visible in foreground Background: frozen reflective lake; snow-capped alpine mountains; expansive evergreen forest; wooden cabin on left shoreline Soft snowfall, subtle mist/fog, pastel white–pink–light blue–beige highlights, gentle stronger dawn sunlight with gold–rose glow, airy sunrise light Atmosphere cinematic, slightly mystical, cohesive. Posture serene and elegant Bottom Frame — Maybach Interior (Close-Medium Portrait) Woman seated in rear left passenger seat Tight frame: only her face in close-up profile, white headrest behind her, white luxury Maybach interior, and the window No other interior visible Hair fully loose — STRICT: 100% fully down, naturally flowing; no buns, pranks, partial tying, clips, no snow, no pinning or lifting Soft profile gaze out of the window; view: snow-covered evergreen forest blurred by frost Natural side light with soft pink dawn sunlight illuminating her face, gentle warm-pink highlights Expression calm, thoughtful, elegant Atmosphere intimate, premium, quiet luxury'
    },
    {
        id: 'winter_car_1',
        title: "В МАШИНЕ 1",
        description: "Сгенерируйте зимний коллаж в машине",
        category: TEMPLATE_CATEGORIES.WINTER,
        likes: "41k",
        src: "/images/winter_car_1.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: "Hyper-realistic 8K portrait collage, three vertical stacked frames. Top Frame: Ultra Close-Up Portrait, face fills frame, eye-level, snow hood, winter forest background. Middle Frame: Woman standing back to camera on frozen lake, pine forest background, ivory fur coat. Bottom Frame: Woman inside Maybach car, profile view looking out window at snowy forest. Consistent style: cinematic winter fashion, soft lighting, ivory fur coat, loose hair, quiet luxury atmosphere."
    },

    // ============================================
    // ПОРТРЕТЫ И СТИЛИ - ДОПОЛНИТЕЛЬНЫЕ (10 шаблонов)
    // ============================================
    {
        id: 'age_test',
        title: "ТЕСТ ВОЗРАСТА",
        description: "Посмотрите как вы будете выглядеть в разном возрасте",
        category: TEMPLATE_CATEGORIES.PHOTO,
        likes: "55k",
        src: "/images/age_test.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Transform the uploaded photo into an age progression/regression collage showing the same person at different life stages: as a child (5-10 years old), teenager (15-18), young adult (25-30), middle-aged (45-50), and elderly (70-80). Keep facial features, bone structure, and unique characteristics identical across all ages. Professional photo manipulation, realistic aging effects including wrinkles, gray hair, skin texture changes, natural aging process, high detail, photorealistic'
    },
    {
        id: 'flash_effect',
        title: "ЭФФЕКТ ВСПЫШКИ",
        description: "Эффект яркой камерной вспышки",
        category: TEMPLATE_CATEGORIES.PHOTO,
        likes: "18k",
        src: "/images/flash_effect.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Professional portrait with strong camera flash effect, overexposed highlights on face and shoulders, dramatic lighting contrast, bright white flash reflection in eyes, slightly washed out skin tones in center, darker edges, paparazzi-style photography, candid moment captured with flash, high contrast, realistic flash photography aesthetic'
    },
    {
        id: 'golden_portrait',
        title: "ЗОЛОТОЙ ПОРТРЕТ",
        description: "Роскошный портрет в золотых тонах",
        category: TEMPLATE_CATEGORIES.PHOTO,
        likes: "32k",
        src: "/images/golden_portrait.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Luxurious golden hour portrait, warm golden and amber tones throughout, soft glowing skin, rich golden lighting, elegant and refined atmosphere, professional beauty photography, radiant warm highlights, golden bokeh background, premium fashion editorial style, warm color grading, sophisticated and glamorous mood'
    },
    {
        id: 'hairstyle_change',
        title: "СМЕНА ПРИЧЕСКИ",
        description: "Примерьте новую прическу",
        category: TEMPLATE_CATEGORIES.PHOTO,
        likes: "48k",
        src: "/images/hairstyle_change.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Transform the hairstyle while keeping the face identical. Generate modern trendy hairstyle with natural hair texture, realistic hair color and shine, high-quality salon result, photorealistic. Professional hair styling with volume and movement, contemporary fashion-forward look',
        fields: [
            {
                id: 'hairstyle_desc',
                type: 'text',
                label: 'Опишите прическу',
                placeholder: 'Например: длинные волны, короткая пикси, каре...'
            }
        ]
    },
    {
        id: 'knitted_effect',
        title: "ВЯЗАНЫЙ ЭФФЕКТ",
        description: "Превратите фото в вязаную картину",
        category: TEMPLATE_CATEGORIES.EFFECTS,
        likes: "21k",
        src: "/images/knitted_effect.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Transform the photo into a handmade knitted artwork, as if the portrait was created using colorful yarn and knitting needles. Visible knit stitches texture, soft wool yarn appearance, cozy handcrafted aesthetic, warm knitted fabric texture throughout the image, realistic knitting patterns, chunky knit style, artisanal handmade look, textile art'
    },
    {
        id: 'lego_effect',
        title: "LEGO ЭФФЕКТ",
        description: "Превратите фото в LEGO мозаику",
        category: TEMPLATE_CATEGORIES.EFFECTS,
        likes: "27k",
        src: "/images/lego_effect.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Transform the photo into a LEGO brick mosaic artwork. The image should appear as if constructed from thousands of small LEGO bricks in various colors. Visible individual LEGO studs and brick texture, pixelated mosaic effect, vibrant LEGO colors, realistic plastic brick appearance, creative LEGO art style, detailed brick-by-brick construction look'
    },
    {
        id: 'nyc_style',
        title: "NYC СТИЛЬ",
        description: "Стильное фото в духе Нью-Йорка",
        category: TEMPLATE_CATEGORIES.PHOTO,
        likes: "36k",
        src: "/images/nyc_style.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Urban New York City street style portrait, modern metropolitan fashion photography, gritty urban background with NYC architecture, street photography aesthetic, confident pose, trendy outfit, city lights and billboards in background, cinematic urban atmosphere, professional street fashion editorial, contemporary NYC vibe, cool and edgy mood'
    },
    {
        id: 'passport_photo',
        title: "ФОТО НА ДОКУМЕНТЫ",
        description: "Профессиональное фото на паспорт",
        category: TEMPLATE_CATEGORIES.PHOTO,
        likes: "42k",
        src: "/images/passport_photo.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Professional passport/ID photo format: neutral white or light gray background, frontal face view, shoulders visible, neutral expression, even lighting with no shadows, standard document photo composition, clean and simple, official ID photo requirements, high resolution, professional studio quality'
    },
    {
        id: 'sticker_no_text',
        title: "СТИКЕР",
        description: "Превратите фото в забавный стикер",
        category: TEMPLATE_CATEGORIES.EFFECTS,
        likes: "39k",
        src: "/images/sticker_no_text.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Transform the photo into a fun cartoon sticker design with clean white outline border. Vibrant colors, slightly exaggerated features for sticker appeal, smooth vector-like appearance, glossy sticker finish, die-cut sticker style with white border, playful and expressive, suitable for messaging apps, no text or words'
    },
    {
        id: 'tokyo_style',
        title: "TOKYO СТИЛЬ",
        description: "Стильное фото в духе Токио",
        category: TEMPLATE_CATEGORIES.PHOTO,
        likes: "33k",
        src: "/images/tokyo_style.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Tokyo street fashion portrait, Japanese urban style photography, neon lights and Shibuya/Harajuku atmosphere, trendy Japanese fashion, vibrant city night background, modern Tokyo aesthetic, colorful neon signs, contemporary Japanese street culture, stylish and cool vibe, urban Tokyo nightlife atmosphere'
    },

    // ============================================
    // АНГЕЛЫ И ДУХОВНОЕ
    // ============================================
    {
        id: 'angels_inspire',
        title: "АНГЕЛ ВДОХНОВЕНИЯ",
        description: "Ангел с мягким светом вдохновения",
        category: TEMPLATE_CATEGORIES.ART,
        likes: "25k",
        src: "/images/angels_inspire.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Ethereal angelic portrait with soft glowing wings of light behind the person, divine inspiration theme, heavenly atmosphere, soft golden and white light rays, peaceful and uplifting mood, celestial glow, gentle angel wings made of light and feathers, spiritual and inspiring energy, dreamy heavenly background, warm divine light'
    },
    {
        id: 'angels_pulse',
        title: "ЭНЕРГИЯ АНГЕЛА",
        description: "Ангел с пульсирующей энергией",
        category: TEMPLATE_CATEGORIES.ART,
        likes: "22k",
        src: "/images/angels_pulse.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Dynamic angelic portrait with pulsing energy waves and light, vibrant spiritual aura, glowing energy radiating from the person, angel wings with flowing energy particles, powerful and energetic atmosphere, bright light pulses, divine power visualization, ethereal energy field, celestial force, radiant and alive feeling'
    },
    {
        id: 'angels_sign',
        title: "ЗНАК АНГЕЛА",
        description: "Ангел, передающий послание",
        category: TEMPLATE_CATEGORIES.ART,
        likes: "19k",
        src: "/images/angels_sign.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Mystical angelic portrait with symbolic divine signs and sacred geometry, angel delivering a message, soft ethereal wings, spiritual symbols floating around, heavenly light beams, peaceful messenger atmosphere, celestial communication theme, gentle and wise expression, divine guidance visualization, sacred and meaningful mood'
    },
    {
        id: 'angels_silence',
        title: "АНГЕЛ ТИШИНЫ",
        description: "Ангел в безмятежной тишине",
        category: TEMPLATE_CATEGORIES.ART,
        likes: "24k",
        src: "/images/angels_silence.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Serene angelic portrait in peaceful silence, soft white angel wings, calm and tranquil atmosphere, gentle misty background, quiet contemplation mood, pure white and soft blue tones, peaceful meditation energy, silent prayer feeling, ethereal calmness, divine peace and serenity, whisper-quiet heavenly scene'
    },
    {
        id: 'angels_whisper',
        title: "ШЕПОТ АНГЕЛА",
        description: "Ангел, шепчущий тайны",
        category: TEMPLATE_CATEGORIES.ART,
        likes: "20k",
        src: "/images/angels_whisper.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Intimate angelic portrait with angel whispering divine secrets, delicate feathered wings close to face, soft mysterious atmosphere, gentle whisper visualization with light particles, ethereal and secretive mood, close-up intimate composition, soft glowing light, mystical communication, tender and personal angelic moment'
    },

    // ============================================
    // АНИМЕ И МУЛЬТЯШНЫЕ
    // ============================================
    {
        id: 'anime_love',
        title: "АНИМЕ РОМАНТИКА",
        description: "Романтический портрет в аниме стиле",
        category: TEMPLATE_CATEGORIES.ART,
        likes: "45k",
        src: "/images/anime_love.png",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Transform the photo into beautiful anime art style, romantic shoujo manga aesthetic, large expressive anime eyes, soft pastel colors, cherry blossoms or sparkles in background, dreamy romantic atmosphere, Japanese anime illustration style, detailed anime hair with highlights, cute and lovely expression, manga-style romance scene'
    },
    {
        id: 'pixar_couple',
        title: "В СТИЛЕ PIXAR",
        description: "Вы как персонажи мультфильма Pixar",
        category: TEMPLATE_CATEGORIES.ART,
        likes: "52k",
        src: "/images/pixar_couple.png", // Предполагаемое имя
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Transform two people into adorable Pixar 3D animated characters, cute and charming Pixar animation style, big expressive eyes, smooth 3D rendering, warm and colorful Pixar aesthetic, friendly and lovable character design, Disney Pixar quality, heartwarming couple portrait, professional 3D character art, vibrant and joyful mood'
    },

    // ============================================
    // АВТОМОБИЛИ - ДОПОЛНИТЕЛЬНЫЕ
    // ============================================
    {
        id: 'car_in_snow',
        title: "АВТО В СНЕГУ",
        description: "Ваш автомобиль в зимней сказке",
        category: TEMPLATE_CATEGORIES.CARS,
        likes: "31k",
        src: "/images/car_in_snow.png",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'The car from the uploaded photo in a beautiful winter wonderland scene, heavy snowfall, car covered with fresh snow, snowy forest or mountain road background, winter tires visible, cold blue-white color palette, peaceful winter atmosphere, snowflakes falling, frosty windows, winter driving scene, cinematic winter photography'
    },
    {
        id: 'christmas_car',
        title: "НОВОГОДНЕЕ АВТО",
        description: "Праздничный декор для вашего авто",
        category: TEMPLATE_CATEGORIES.CARS,
        likes: "28k",
        src: "/images/christmas_car.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'The car from the uploaded photo decorated for Christmas, festive holiday decorations on the car, Christmas lights wrapped around, wreath on the front grille, red bow on hood, snowy Christmas Eve setting, warm holiday lights, Christmas tree in background, festive and joyful atmosphere, holiday spirit, cozy winter night'
    },
    {
        id: 'garage_tale',
        title: "ИСТОРИЯ В ГАРАЖЕ",
        description: "Атмосферное фото в гараже",
        category: TEMPLATE_CATEGORIES.CARS,
        likes: "24k",
        src: "/images/garage_tale.png",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Cinematic scene of the car from the uploaded photo in a vintage mechanic garage, classic car workshop atmosphere, tools and equipment around, warm garage lighting, nostalgic automotive story mood, detailed garage interior, oil stains on floor, vintage posters on walls, authentic car enthusiast space, storytelling automotive photography'
    },
    {
        id: 'nfs_race',
        title: "СТРИТРЕЙСИНГ",
        description: "В стиле Need for Speed",
        category: TEMPLATE_CATEGORIES.CARS,
        likes: "37k",
        src: "/images/nfs_race.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'The car from the uploaded photo in an intense street racing scene, Need for Speed video game aesthetic, motion blur and speed effects, neon city lights at night, dramatic racing atmosphere, modified street racer look, urban night racing, high-speed action, cinematic racing game style, adrenaline and excitement, vibrant neon colors'
    },

    // ============================================
    // ПРАЗДНИКИ И НОВЫЙ ГОД
    // ============================================
    {
        id: 'christmas_card_custom',
        title: "РОЖДЕСТВЕНСКАЯ ОТКРЫТКА",
        description: "Персональная новогодняя открытка",
        category: TEMPLATE_CATEGORIES.HOLIDAYS,
        likes: "33k",
        src: "/images/christmas_card_custom.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Beautiful personalized Christmas greeting card design featuring the person from the uploaded photo, festive holiday background with Christmas tree, snow, ornaments, warm cozy atmosphere, professional holiday card layout, space for custom text, elegant Christmas design, family-friendly, joyful holiday spirit, premium greeting card quality'
    },
    {
        id: 'christmas_glamour',
        title: "ГЛАМУРНОЕ РОЖДЕСТВО",
        description: "Роскошный праздничный портрет",
        category: TEMPLATE_CATEGORIES.HOLIDAYS,
        likes: "29k",
        src: "/images/christmas_glamour.png",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Glamorous Christmas fashion portrait, luxurious holiday outfit with sequins or velvet, elegant festive styling, sparkling Christmas lights bokeh background, sophisticated holiday glamour, professional fashion photography, rich red and gold colors, premium holiday aesthetic, elegant and festive mood, high-end Christmas photoshoot'
    },
    {
        id: 'christmas_toy',
        title: "ЕЛОЧНАЯ ИГРУШКА",
        description: "Вы как украшение на елке",
        category: TEMPLATE_CATEGORIES.HOLIDAYS,
        likes: "26k",
        src: "/images/christmas_toy.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Transform the person into a charming Christmas tree ornament or holiday figurine, cute miniature toy appearance, glossy ceramic or glass ornament finish, festive colors (red, green, gold), hanging on a decorated Christmas tree, magical holiday toy aesthetic, collectible ornament style, whimsical and festive'
    },
    {
        id: 'festive_gloss',
        title: "ПРАЗДНИЧНЫЙ ГЛЯНЕЦ",
        description: "Фото как для обложки журнала",
        category: TEMPLATE_CATEGORIES.HOLIDAYS,
        likes: "31k",
        src: "/images/festive_gloss.png",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Festive glossy magazine-style portrait, high-gloss finish, vibrant holiday colors, professional editorial photography, glamorous festive makeup and styling, shiny and polished aesthetic, celebration mood, premium fashion magazine quality, bright and joyful atmosphere, party-ready look'
    },
    {
        id: 'festive_portrait',
        title: "ПРАЗДНИЧНЫЙ ПОРТРЕТ",
        description: "Элегантное праздничное фото",
        category: TEMPLATE_CATEGORIES.HOLIDAYS,
        likes: "35k",
        src: "/images/festive_portrait.png",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Elegant festive portrait photography, celebration atmosphere, warm golden lighting, joyful and cheerful expression, festive outfit or accessories, professional studio quality, happy celebration mood, special occasion photography, refined and polished look, timeless festive elegance'
    },
    {
        id: 'new_year_card',
        title: "НОВОГОДНЯЯ КАРТОЧКА",
        description: "Стильная открытка с шампанским",
        category: TEMPLATE_CATEGORIES.HOLIDAYS,
        likes: "38k",
        src: "/images/new_year_card.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Professional New Year greeting card design, person from uploaded photo in festive setting, champagne, fireworks, clock showing midnight, elegant New Year mood, celebratory atmosphere, gold and silver accents, Happy New Year theme, premium greeting card layout, sophisticated celebration design'
    },
    {
        id: 'nutcracker',
        title: "ЩЕЛКУНЧИК",
        description: "В образе из сказки Щелкунчик",
        category: TEMPLATE_CATEGORIES.HOLIDAYS,
        likes: "27k",
        src: "/images/nutcracker.png",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Transform into a character from The Nutcracker ballet, magical Christmas fairy tale aesthetic, ornate toy soldier or sugar plum fairy costume, theatrical and whimsical style, rich colors and gold details, enchanted Christmas story atmosphere, classical ballet costume design, festive and magical mood'
    },
    {
        id: 'old_year_card_2',
        title: "РЕТРО ОТКРЫТКА 2",
        description: "Винтажная советская открытка",
        category: TEMPLATE_CATEGORIES.HOLIDAYS,
        likes: "23k",
        src: "/images/generations_portrait.jpeg", // Используем заглушку, если нет точного соответствия
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Nostalgic vintage New Year postcard design, retro Soviet-era aesthetic, warm sepia or muted colors, classic typography style, traditional New Year symbols (fir tree, snowflakes, clock), vintage postcard texture, nostalgic and sentimental mood, old-fashioned greeting card charm'
    },
    {
        id: 'polaroid_cheburashka',
        title: "ФОТО С ЧЕБУРАШКОЙ",
        description: "Милое фото с Чебурашкой",
        category: TEMPLATE_CATEGORIES.HOLIDAYS,
        likes: "58k",
        src: "/images/polaroid_cheburashka.png", // Предполагаемое имя
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Nostalgic Polaroid-style photo with the person and Cheburashka character, vintage instant camera aesthetic, soft faded colors, white Polaroid frame border, cozy and friendly atmosphere, Soviet cartoon nostalgia, warm childhood memories feeling, retro 70s-80s vibe, cute and heartwarming scene'
    },
    {
        id: 'polaroid_tree',
        title: "ПОЛАРОИД У ЕЛКИ",
        description: "Уютное домашнее фото у елки",
        category: TEMPLATE_CATEGORIES.HOLIDAYS,
        likes: "40k",
        src: "/images/polaroid_tree.png", // Предполагаемое имя
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Cozy Polaroid instant photo by the Christmas tree, vintage camera aesthetic, warm indoor lighting, decorated tree with lights and ornaments in background, soft nostalgic colors, white Polaroid frame, intimate holiday moment, family Christmas memories, retro holiday photography, warm and nostalgic mood'
    },
    {
        id: 'snow_queen',
        title: "СНЕЖНАЯ КОРОЛЕВА",
        description: "Магический зимний образ",
        category: TEMPLATE_CATEGORIES.HOLIDAYS,
        likes: "34k",
        src: "/images/snow_queen.png", // Предполагаемое имя
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Transform into the Snow Queen character, icy elegant costume with crystals and frost patterns, cold blue and white color palette, majestic and regal pose, frozen winter palace background, magical ice powers visualization, ethereal and powerful atmosphere, fairy tale royalty, crystalline ice crown, winter magic aesthetic'
    },
    {
        id: 'soviet_tree',
        title: "У СОВЕТСКОЙ ЕЛКИ",
        description: "Ностальгия по Новому году в СССР",
        category: TEMPLATE_CATEGORIES.HOLIDAYS,
        likes: "44k",
        src: "/images/soviet_tree.png", // Предполагаемое имя
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Nostalgic Soviet-era New Year celebration scene, vintage USSR apartment interior, classic Soviet Christmas tree decorations (glass ornaments, tinsel, star on top), retro 1970s-1980s atmosphere, warm indoor lighting, vintage furniture and wallpaper, nostalgic childhood New Year memories, authentic Soviet aesthetic'
    },

    // ============================================
    // РОМАНТИКА И ДЕНЬ СВЯТОГО ВАЛЕНТИНА
    // ============================================
    {
        id: 'bordeaux_couture',
        title: "БОРДО КУТЮР",
        description: "Элегантный образ в стиле Vogue",
        category: TEMPLATE_CATEGORIES.LOVE,
        likes: "30k",
        src: "/images/bordeaux_couture.png",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Luxurious haute couture fashion portrait in rich bordeaux wine tones, elegant deep red and burgundy colors, sophisticated high-fashion styling, premium fabric textures (velvet, silk), dramatic fashion photography, refined and elegant atmosphere, editorial fashion magazine quality, romantic and luxurious mood'
    },
    {
        id: 'cupid_style',
        title: "КУПИДОН",
        description: "Романтический образ со стрелами",
        category: TEMPLATE_CATEGORIES.LOVE,
        likes: "28k",
        src: "/images/cupid_style.png",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Romantic Cupid-inspired portrait, soft angel wings, Valentine theme, holding bow and arrow of love, floating hearts and rose petals, dreamy pink and red color palette, romantic and playful atmosphere, love and romance symbolism, whimsical Valentine aesthetic, sweet and charming mood'
    },
    {
        id: 'cyberpunk_love',
        title: "КИБЕРПАНК ЛАВ",
        description: "Романтика будущего",
        category: TEMPLATE_CATEGORIES.LOVE,
        likes: "36k",
        src: "/images/cyberpunk_love.png",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Futuristic cyberpunk romance scene, neon lights and holographic hearts, sci-fi urban night setting, vibrant pink and blue neon colors, high-tech romantic atmosphere, cyberpunk aesthetic with love theme, digital rain and glowing effects, modern dystopian romance, edgy and stylish mood'
    },
    {
        id: 'heart_bokeh',
        title: "В СЕРДЦАХ",
        description: "Романтическое фото с боке",
        category: TEMPLATE_CATEGORIES.LOVE,
        likes: "41k",
        src: "/images/heart_bokeh.png",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Romantic portrait with heart-shaped bokeh lights in background, soft out-of-focus heart lights, Valentine Day photography, warm romantic lighting, dreamy and magical atmosphere, professional bokeh effect, love and romance theme, soft pink and warm tones, enchanting and sweet mood'
    },
    {
        id: 'satin_gloss',
        title: "АТЛАСНЫЙ БЛЕСК",
        description: "Роскошное фото в атласе",
        category: TEMPLATE_CATEGORIES.LOVE,
        likes: "29k",
        src: "/images/festive_gloss.png", // Используем похожее если нет
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Luxurious portrait with satin fabric textures and glossy finish, smooth silky appearance, rich satin colors (deep reds, purples, or blacks), elegant and sensual atmosphere, high-gloss professional photography, premium fabric aesthetic, sophisticated and refined mood, fashion editorial quality'
    },
    {
        id: 'vintage_valentine',
        title: "ВИНТАЖНАЯ ВАЛЕНТИНКА",
        description: "Открытка в стиле ретро",
        category: TEMPLATE_CATEGORIES.LOVE,
        likes: "25k",
        src: "/images/vintage_valentine.jpeg", // Предполагаемое имя
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Vintage Valentine Day card design, retro 1950s-60s aesthetic, classic romantic imagery (roses, lace, ribbons), soft pastel colors, nostalgic Valentine postcard style, old-fashioned romance, vintage typography and ornaments, sweet and sentimental mood, timeless love theme'
    },

    // ============================================
    // ФАНТАЗИЯ И МАГИЯ
    // ============================================
    {
        id: 'harry_potter_card',
        title: "КАРТОЧКА ВОЛШЕБНИКА",
        description: "Как коллекционная карта из ГП",
        category: TEMPLATE_CATEGORIES.ART,
        likes: "49k",
        src: "/images/harry_potter_card.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Transform into a Harry Potter wizard trading card, Hogwarts student or character style, magical wand, house robes (Gryffindor, Slytherin, Hufflepuff, or Ravenclaw), ornate card frame with magical symbols, vintage wizard card aesthetic, magical atmosphere with sparkles, fantasy wizard portrait, collectible card design'
    },
    {
        id: 'irony_of_fate',
        title: "ИРОНИЯ СУДЬБЫ",
        description: "Атмосфера любимого фильма",
        category: TEMPLATE_CATEGORIES.ART,
        likes: "37k",
        src: "/images/irony_of_fate.jpeg",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Nostalgic scene inspired by Soviet film The Irony of Fate, cozy apartment interior, New Year Eve atmosphere, vintage 1970s USSR aesthetic, warm indoor lighting, retro furniture and decor, romantic comedy mood, classic Soviet cinema style, intimate and nostalgic feeling, traditional Russian New Year celebration'
    },
    {
        id: 'patronus',
        title: "ЭКСПЕКТО ПАТРОНУМ",
        description: "Вы вызываете патронуса",
        category: TEMPLATE_CATEGORIES.ART,
        likes: "43k",
        src: "/images/patronus.png", // Предполагаемое имя
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Magical Patronus charm visualization, glowing ethereal animal spirit emerging from wand, bright silver-blue magical light, Harry Potter universe magic, protective spell energy, mystical and powerful atmosphere, magical particles and light trails, spiritual guardian animal, enchanting magical effect'
    },
    {
        id: 'photo_in_toy',
        title: "ВНУТРИ ИГРУШКИ",
        description: "Вы внутри стеклянного шара",
        category: TEMPLATE_CATEGORIES.ART,
        likes: "32k",
        src: "/images/photo_in_toy.jpeg", // Предполагаемое имя
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Creative scene where the person appears miniaturized inside a glass toy or snow globe, tiny figure in a magical miniature world, whimsical and surreal perspective, detailed miniature environment, glass reflection and refraction effects, playful and imaginative concept, fantasy toy world aesthetic'
    },

    // ============================================
    // ГОРОДСКОЙ СТИЛЬ
    // ============================================
    {
        id: 'mnogoetazhki',
        title: "МНОГОЭТАЖКИ",
        description: "Эстетика спальных районов",
        category: TEMPLATE_CATEGORIES.ART,
        likes: "39k",
        src: "/images/mnogoetazhki.png",
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Urban portrait with Soviet-era apartment buildings (khrushchyovka) in background, post-Soviet aesthetic, concrete panel buildings, urban residential area, nostalgic post-USSR atmosphere, overcast sky, authentic Eastern European urban landscape, documentary street photography style, realistic urban environment, contemporary post-Soviet life'
    },

    /*
    {
        id: 'tool_add',
        title: "ДОБАВИТЬ ОБЪЕКТ",
        description: "Добавьте любой объект на фото",
        category: TEMPLATE_CATEGORIES.EFFECTS,
        likes: "15k",
        src: "/images/tool_add.jpeg", // Заглушка
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Add ${object_description} to the photo naturally and realistically. The added object should blend seamlessly with the existing scene, matching lighting, shadows, perspective, and color tone. Professional photo manipulation, realistic integration, natural placement, high-quality compositing',
        fields: [
            {
                id: 'object_description',
                type: 'text',
                label: 'Что добавить?',
                placeholder: 'Например: собаку, цветы, машину...'
            }
        ]
    },
    {
        id: 'tool_remove',
        title: "УДАЛИТЬ ОБЪЕКТ",
        description: "Удалите лишнее с фото",
        category: TEMPLATE_CATEGORIES.EFFECTS,
        likes: "18k",
        src: "/images/tool_remove.jpeg", // Заглушка
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Remove ${object_to_remove} from the photo cleanly and naturally. Fill the removed area with appropriate background content, matching textures, colors, and patterns. Professional object removal, seamless inpainting, no visible artifacts, natural-looking result',
        fields: [
            {
                id: 'object_to_remove',
                type: 'text',
                label: 'Что удалить?',
                placeholder: 'Например: человека, провода, мусор...'
            }
        ]
    },
    {
        id: 'tool_replace',
        title: "ЗАМЕНИТЬ ОБЪЕКТ",
        description: "Замените один объект на другой",
        category: TEMPLATE_CATEGORIES.EFFECTS,
        likes: "12k",
        src: "/images/tool_replace.jpeg", // Заглушка
        mediaType: 'image',
        model_id: 'nano_banana', cost: 10,
        generation_prompt: 'Replace ${object_to_replace} with ${new_object} in the photo. The replacement should look natural and realistic, matching the lighting, perspective, scale, and overall scene aesthetics. Professional object replacement, seamless integration, photorealistic result',
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
    }
    */
];

export default templatesData;
