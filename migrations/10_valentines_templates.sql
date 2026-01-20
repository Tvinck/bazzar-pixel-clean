-- Valentine's Day Templates (14 February) - REFINED with High-Quality Trending Prompts & Images
-- "Trending on Artstation" quality prompts to ensure the best possible generation results.

-- 1. PIXAR COUPLE (3D Animation Style)
INSERT INTO public.templates (id, title, description, type, likes, src, is_local_video, media_type, category, required_files_count, generation_prompt, model_id, configuration)
VALUES (
    'pixar_couple', 
    'PIXAR LOVE', 
    'Станьте героями 3D мультфильма! Загрузите ваше фото.', 
    'template', 
    '50k', 
    'https://images.unsplash.com/photo-1626245051326-ce22277d3396?q=80&w=800&auto=format&fit=crop', -- 3D/Toy vibe
    false, 
    'image', 
    'love', 
    2, -- Ideal for couples
    'A movie poster in the style of a modern 3D animation studio (Pixar/Disney). A cute couple standing back to back, smiling confidently. Person A (male/female) and Person B. Expressive big eyes, smooth skin texture, bright vibrant colors, 3d render, soft studio lighting, masterpiece, trending on artstation.',
    'midjourney_img2img',
    '{"image_strength": 0.55, "style_preset": "3d-model", "aspect_ratio": "4:5"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET 
    generation_prompt = EXCLUDED.generation_prompt, 
    src = EXCLUDED.src,
    configuration = EXCLUDED.configuration;

-- 2. VINTAGE VALENTINE (Retro Aesthetics)
INSERT INTO public.templates (id, title, description, type, likes, src, is_local_video, media_type, category, required_files_count, generation_prompt, model_id, configuration)
VALUES (
    'vintage_valentine', 
    'РЕТРО ВАЛЕНТИНКА', 
    'Ваше фото на открытке 50-х.', 
    'template', 
    '25k', 
    'https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?q=80&w=800&auto=format&fit=crop', -- Retro vibe
    false, 
    'image', 
    'love', 
    1,
    'A nostalgic 1950s Valentine Day greeting card illustration. The persons face incorporated into a vintage drawing with red roses, lace patterns, and cupid angels. Faded paper texture, retro typography, pastel pink and cream colors, victorian aesthetic, detailed.',
    'midjourney_img2img',
    '{"style_preset": "vintage", "image_strength": 0.65}'::jsonb
) ON CONFLICT (id) DO UPDATE SET 
    generation_prompt = EXCLUDED.generation_prompt, 
    src = EXCLUDED.src,
    configuration = EXCLUDED.configuration;

-- 3. HEART BOKEH (Glamour/Beauty - Trending)
INSERT INTO public.templates (id, title, description, type, likes, src, is_local_video, media_type, category, required_files_count, generation_prompt, model_id, configuration)
VALUES (
    'heart_bokeh', 
    'GLAMOUR BOKEH', 
    'Романтический вечерний люкс.', 
    'template', 
    '40k', 
    'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?q=80&w=800&auto=format&fit=crop', -- Bokeh light
    false, 
    'image', 
    'love', 
    1,
    'High fashion nightlife portrait of the person. Background city lights turned into heart-shaped bokeh. Soft pink and red ambient lighting (gel lighting), elegant styling, shallow depth of field, 85mm lens, romantic atmosphere, sharp focus on eyes.',
    'midjourney_img2img',
    '{"aspect_ratio": "9:16", "image_strength": 0.75}'::jsonb
) ON CONFLICT (id) DO UPDATE SET 
    generation_prompt = EXCLUDED.generation_prompt, 
    src = EXCLUDED.src,
    configuration = EXCLUDED.configuration;

-- 4. CYBERPUNK LOVE (Modern/Edgy)
INSERT INTO public.templates (id, title, description, type, likes, src, is_local_video, media_type, category, required_files_count, generation_prompt, model_id, configuration)
VALUES (
    'cyberpunk_love', 
    'NEON LOVE', 
    'Любовь в стиле киберпанк.', 
    'template', 
    '35k', 
    'https://images.unsplash.com/photo-1496449903678-68ddcb189a24?q=80&w=800&auto=format&fit=crop', -- Neon
    false, 
    'image', 
    'love', 
    1,
    'Futuristic cyberpunk portrait. The person illuminated by neon pink and blue heart signs. Rain falling, wet city streets reflection, high-tech fashion, synthwave aesthetic, cinematic composition, unreal engine 5 render, highly detailed.',
    'midjourney_img2img',
    '{"style_preset": "neon-punk", "image_strength": 0.7}'::jsonb
) ON CONFLICT (id) DO UPDATE SET 
    generation_prompt = EXCLUDED.generation_prompt, 
    src = EXCLUDED.src,
    configuration = EXCLUDED.configuration;

-- 5. CUPID (Fun/Cosplay)
INSERT INTO public.templates (id, title, description, type, likes, src, is_local_video, media_type, category, required_files_count, generation_prompt, model_id, configuration)
VALUES (
    'cupid_style', 
    'Я - КУПИДОН', 
    'Примерь крылья ангела.', 
    'template', 
    '30k', 
    'https://images.unsplash.com/photo-1596289945038-f14d8ac275b1?q=80&w=800&auto=format&fit=crop', -- Angel/Sky
    false, 
    'image', 
    'love', 
    1,
    'Fantasy portrait of the person as Cupid. Large white feathered wings, holding a golden bow and heart-arrow, floating in the sky with fluffy clouds. Renaissance painting style, soft brushstrokes, ethereal glow, angelic, dreamy, art museum quality.',
    'midjourney_img2img',
    '{"negative_prompt": "nudity, inappropriate, bad anatomy", "image_strength": 0.6}'::jsonb
) ON CONFLICT (id) DO UPDATE SET 
    generation_prompt = EXCLUDED.generation_prompt, 
    src = EXCLUDED.src,
    configuration = EXCLUDED.configuration;

-- 6. ANIME CONFESSION (Anime)
INSERT INTO public.templates (id, title, description, type, likes, src, is_local_video, media_type, category, required_files_count, generation_prompt, model_id, configuration)
VALUES (
    'anime_love_letter', 
    'ANIME LOVE', 
    'Сцена признания из аниме.', 
    'template', 
    '60k', 
    'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?q=80&w=800&auto=format&fit=crop', -- Anime/Japan
    false, 
    'image', 
    'love', 
    1,
    'Anime key visual style. The person standing under cherry blossom trees (sakura) at sunset, shy expression, holding a love letter. Lens flare, emotional atmosphere, detailed anime eyes, vibrant colors, Makoto Shinkai art style.',
    'midjourney_img2img',
    '{"style_preset": "anime", "image_strength": 0.6}'::jsonb
) ON CONFLICT (id) DO UPDATE SET 
    generation_prompt = EXCLUDED.generation_prompt, 
    src = EXCLUDED.src,
    configuration = EXCLUDED.configuration;
