/**
 * Sticker Packs Configuration
 * Prompt-based AI sticker generation categories.
 * Each sticker has a prompt that will be used with the user's face photo
 * to generate a unique sticker via nano-banana-pro model.
 */

export const STICKER_PACKS = [
    {
        id: 'meme_pack',
        name: 'Мемы',
        description: 'Мемные стикеры с вашим лицом',
        emoji: '😂',
        type: 'static',
        category: 'static',
        stickers: [
            { id: 'meme_1', title: 'Шок', emoji: '😱', prompt: 'Shocked surprised face meme sticker, exaggerated expression, white background, sticker art style, bold outline', preview: '😱' },
            { id: 'meme_2', title: 'Смех до слёз', emoji: '🤣', prompt: 'Laughing crying face meme sticker, tears of joy, comic style, white background, bold outline, sticker art', preview: '🤣' },
            { id: 'meme_3', title: 'Думаю...', emoji: '🤔', prompt: 'Thinking pose meme sticker, hand on chin, questioning look, sticker art style, white background, bold outline', preview: '🤔' },
            { id: 'meme_4', title: 'Одобряю', emoji: '👍', prompt: 'Thumbs up approval meme sticker, confident smile, sticker art style, white background, bold outline', preview: '👍' },
            { id: 'meme_5', title: 'Фейспалм', emoji: '🤦', prompt: 'Facepalm meme sticker, hand covering face in disappointment, sticker art style, white background, bold outline', preview: '🤦' },
            { id: 'meme_6', title: 'Злой', emoji: '😤', prompt: 'Angry rage face meme sticker, red cheeks, steam from ears, sticker art style, white background, bold outline', preview: '😤' }
        ]
    },
    {
        id: 'business_pack',
        name: 'Бизнес',
        description: 'Профессиональные стикеры для работы',
        emoji: '💼',
        type: 'static',
        category: 'static',
        stickers: [
            { id: 'biz_1', title: 'Босс', emoji: '🤵', prompt: 'Professional businessman portrait sticker in suit, confident pose, corporate style, sticker art, white background, bold outline', preview: '🤵' },
            { id: 'biz_2', title: 'Сделка', emoji: '🤝', prompt: 'Celebrating a business deal sticker, happy handshake gesture, money flying around, sticker art style, white background', preview: '🤝' },
            { id: 'biz_3', title: 'Гений', emoji: '🧠', prompt: 'Genius big brain moment sticker, lightbulb above head, smart expression, sticker art style, white background, bold outline', preview: '🧠' },
            { id: 'biz_4', title: 'Деньги', emoji: '💰', prompt: 'Money rain celebration sticker, throwing cash in the air, excited expression, sticker art style, white background', preview: '💰' },
            { id: 'biz_5', title: 'Кофе', emoji: '☕', prompt: 'Tired office worker drinking coffee sticker, sleepy eyes, big coffee mug, sticker art style, white background, bold outline', preview: '☕' },
            { id: 'biz_6', title: 'Дедлайн', emoji: '⏰', prompt: 'Panic deadline sticker, stressed face, clock showing midnight, papers flying, sticker art style, white background', preview: '⏰' }
        ]
    },
    {
        id: 'art_pack',
        name: 'Арт',
        description: 'Художественные стили',
        emoji: '🎨',
        type: 'static',
        category: 'static',
        stickers: [
            { id: 'art_1', title: 'Аниме', emoji: '🌸', prompt: 'Anime style portrait sticker, big sparkling eyes, kawaii expression, Japanese animation style, white background, bold outline', preview: '🌸' },
            { id: 'art_2', title: 'Пиксель', emoji: '👾', prompt: 'Pixel art retro character portrait sticker, 8-bit style, pixelated, retro game aesthetic, white background', preview: '👾' },
            { id: 'art_3', title: 'Акварель', emoji: '🎨', prompt: 'Watercolor artistic portrait sticker, soft pastel colors, artistic brush strokes, dreamy style, white background', preview: '🎨' },
            { id: 'art_4', title: 'Поп-Арт', emoji: '🟡', prompt: 'Pop art portrait sticker in Roy Lichtenstein style, bold colors, halftone dots, comic book style, white background', preview: '🟡' },
            { id: 'art_5', title: 'Граффити', emoji: '🎤', prompt: 'Street graffiti style portrait sticker, spray paint effect, urban art, bold colors, hip hop aesthetic, white background', preview: '🎤' },
            { id: 'art_6', title: 'Киберпанк', emoji: '🌆', prompt: 'Cyberpunk neon portrait sticker, glowing neon lights, futuristic visor, sci-fi aesthetic, dark background with neon accents', preview: '🌆' }
        ]
    },
    {
        id: 'gamer_pack',
        name: 'Геймер',
        description: 'Стикеры для геймеров',
        emoji: '🎮',
        type: 'static',
        category: 'static',
        stickers: [
            { id: 'game_1', title: 'GG', emoji: '🏆', prompt: 'Victory celebration gamer sticker, holding trophy, GG text, gaming headset, sticker art style, white background', preview: '🏆' },
            { id: 'game_2', title: 'Rage Quit', emoji: '🎮', prompt: 'Rage quit gamer sticker, angry face, broken controller, flames in background, sticker art style, white background', preview: '🎮' },
            { id: 'game_3', title: 'АФК', emoji: '😴', prompt: 'AFK sleeping gamer sticker, sleeping on keyboard, ZZZ above head, gaming setup, sticker art style, white background', preview: '😴' },
            { id: 'game_4', title: 'Буст', emoji: '⚡', prompt: 'Power-up boost gamer sticker, glowing aura, level up effect, excited face, sticker art style, white background', preview: '⚡' },
            { id: 'game_5', title: 'Нуб', emoji: '🐣', prompt: 'Noob gamer sticker, confused expression, question marks above head, holding controller wrong, cute style, white background', preview: '🐣' },
            { id: 'game_6', title: 'MVP', emoji: '⭐', prompt: 'MVP champion gamer sticker, crown on head, star effects, confident smirk, esports style, white background', preview: '⭐' }
        ]
    },
    {
        id: 'emotions_pack',
        name: 'Эмоции',
        description: 'Стикеры всех настроений',
        emoji: '❤️',
        type: 'static',
        category: 'static',
        stickers: [
            { id: 'emo_1', title: 'Люблю', emoji: '😍', prompt: 'Love eyes heart sticker, heart-shaped eyes, floating hearts around, romantic expression, sticker art style, white background', preview: '😍' },
            { id: 'emo_2', title: 'Грусть', emoji: '😢', prompt: 'Sad crying sticker, single tear drop, rainy mood, blue tones, emotional expression, sticker art style, white background', preview: '😢' },
            { id: 'emo_3', title: 'Радость', emoji: '🥳', prompt: 'Party celebration sticker, party hat, confetti flying, huge smile, birthday vibes, sticker art style, white background', preview: '🥳' },
            { id: 'emo_4', title: 'Спокойствие', emoji: '😌', prompt: 'Zen relaxed meditation sticker, peaceful expression, lotus pose, calm aura, sticker art style, white background', preview: '😌' },
            { id: 'emo_5', title: 'Огонь', emoji: '🔥', prompt: 'Fire hot sticker, flames around, sunglasses, cool confident pose, everything is fire, sticker art style, white background', preview: '🔥' },
            { id: 'emo_6', title: 'Ок', emoji: '👌', prompt: 'OK hand gesture sticker, winking face, everything is fine, calm expression, sticker art style, white background, bold outline', preview: '👌' }
        ]
    },
    {
        id: 'cool_pack',
        name: 'Крутой',
        description: 'Когда ты на стиле',
        emoji: '😎',
        type: 'static',
        category: 'static',
        stickers: [
            { id: 'cool_1', title: 'Thug Life', emoji: '🕶️', prompt: 'Thug life sticker, pixel sunglasses dropping down, gold chain, deal with it pose, sticker art style, white background', preview: '🕶️' },
            { id: 'cool_2', title: 'Рок', emoji: '🤘', prompt: 'Rock and roll sticker, heavy metal horns gesture, electric guitar, lightning bolts, sticker art style, white background', preview: '🤘' },
            { id: 'cool_3', title: 'Супергерой', emoji: '🦸', prompt: 'Superhero portrait sticker, cape flowing, heroic pose, mask on face, comic book style, sticker art, white background', preview: '🦸' },
            { id: 'cool_4', title: 'Король', emoji: '👑', prompt: 'King with crown sticker, royal throne, majestic pose, golden crown, royal robe, sticker art style, white background', preview: '👑' },
            { id: 'cool_5', title: 'Космонавт', emoji: '🚀', prompt: 'Astronaut space helmet sticker, floating in space, stars and planets, space suit, sticker art style, dark space background', preview: '🚀' },
            { id: 'cool_6', title: 'Ниндзя', emoji: '🥷', prompt: 'Ninja warrior sticker, black mask, throwing stars, martial arts pose, sticker art style, white background', preview: '🥷' }
        ]
    }
];

// New Animated Packs (Face Swap)
const ANIMATED_PACKS = [
    {
        id: 'gif_standard',
        name: 'Standard',
        description: 'Базовый набор анимированных стикеров',
        emoji: '🧢',
        type: 'animated',
        category: 'animated',
        stickers: [
            { id: 'anim_1', title: 'Sticker 1', videoUrl: '/stickers/standard/sticker1.webm', preview: '/stickers/standard/sticker1.webm' },
            { id: 'anim_2', title: 'Sticker 2', videoUrl: '/stickers/standard/sticker2.webm', preview: '/stickers/standard/sticker2.webm' },
            { id: 'anim_3', title: 'Sticker 3', videoUrl: '/stickers/standard/sticker3.webm', preview: '/stickers/standard/sticker3.webm' },
            { id: 'anim_4', title: 'Sticker 4', videoUrl: '/stickers/standard/sticker4.webm', preview: '/stickers/standard/sticker4.webm' },
            { id: 'anim_5', title: 'Sticker 5', videoUrl: '/stickers/standard/sticker5.webm', preview: '/stickers/standard/sticker5.webm' }
        ]
    },
    {
        id: 'gif_medium',
        name: 'Medium',
        description: 'Расширенный набор анимаций',
        emoji: '🌟',
        type: 'animated',
        category: 'animated',
        stickers: [
            { id: 'anim_6', title: 'Sticker 6', videoUrl: '/stickers/standard/sticker6.webm', preview: '/stickers/standard/sticker6.webm' },
            { id: 'anim_7', title: 'Sticker 7', videoUrl: '/stickers/standard/sticker7.webm', preview: '/stickers/standard/sticker7.webm' },
            { id: 'anim_8', title: 'Sticker 8', videoUrl: '/stickers/standard/sticker8.webm', preview: '/stickers/standard/sticker8.webm' },
            { id: 'anim_9', title: 'Sticker 9', videoUrl: '/stickers/standard/sticker9.webm', preview: '/stickers/standard/sticker9.webm' },
            { id: 'anim_10', title: 'Sticker 10', videoUrl: '/stickers/standard/sticker10.webm', preview: '/stickers/standard/sticker10.webm' }
        ]
    },
    {
        id: 'gif_pro',
        name: 'Pro',
        description: 'Полный набор эксклюзивных стикеров',
        emoji: '🔥',
        type: 'animated',
        category: 'animated',
        stickers: [
            { id: 'anim_11', title: 'Sticker 11', videoUrl: '/stickers/standard/sticker11.webm', preview: '/stickers/standard/sticker11.webm' },
            { id: 'anim_12', title: 'Sticker 12', videoUrl: '/stickers/standard/sticker12.webm', preview: '/stickers/standard/sticker12.webm' },
            { id: 'anim_13', title: 'Sticker 13', videoUrl: '/stickers/standard/sticker13.webm', preview: '/stickers/standard/sticker13.webm' },
            { id: 'anim_14', title: 'Sticker 14', videoUrl: '/stickers/standard/sticker14.webm', preview: '/stickers/standard/sticker14.webm' },
            { id: 'anim_15', title: 'Sticker 15', videoUrl: '/stickers/standard/sticker15.webm', preview: '/stickers/standard/sticker15.webm' },
            { id: 'anim_16', title: 'Sticker 16', videoUrl: '/stickers/standard/sticker16.webm', preview: '/stickers/standard/sticker16.webm' },
            { id: 'anim_17', title: 'Sticker 17', videoUrl: '/stickers/standard/sticker17.webm', preview: '/stickers/standard/sticker17.webm' },
            { id: 'anim_0', title: 'Bonus', videoUrl: '/stickers/standard/sticker.webm', preview: '/stickers/standard/sticker.webm' }
        ]
    }
];

// Combine all packs
STICKER_PACKS.push(...ANIMATED_PACKS);


export const getPackById = (id) => STICKER_PACKS.find(p => p.id === id);
