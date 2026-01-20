-- 1. UPDATE VALENTINE TEMPLATES WITH REAL GENERATED IMAGES
-- We now use local paths to the high-quality images we just generated.

UPDATE public.templates
SET src = '/images/pixar_couple.png'
WHERE id = 'pixar_couple';

UPDATE public.templates
SET src = '/images/vintage_valentine.png'
WHERE id = 'vintage_valentine';

UPDATE public.templates
SET src = '/images/heart_bokeh.png'
WHERE id = 'heart_bokeh';

UPDATE public.templates
SET src = '/images/cyberpunk_love.png'
WHERE id = 'cyberpunk_love';

UPDATE public.templates
SET src = '/images/cupid_style.png'
WHERE id = 'cupid_style';

UPDATE public.templates
SET src = '/images/anime_love.png'
WHERE id = 'anime_love_letter';

-- 2. INSERT NEW "MNOGOETAZHKI" (High-Rises) TEMPLATE
-- Based on the "Russian Doomer / Panelki" trend.
INSERT INTO public.templates (id, title, description, type, likes, src, is_local_video, media_type, category, required_files_count, generation_prompt, model_id, configuration)
VALUES (
    'mnogoetazhki_love', 
    'МНОГОЭТАЖКИ', 
    'Романтика спальных районов. Тренд "Панельки". Загрузите 2 фото.', 
    'template', 
    '77k', 
    '/images/mnogoetazhki.png', -- The generated preview
    false, 
    'image', 
    'love', 
    2, -- Requires 2 photos (Couple)
    'Cinematic wide shot of a romantic couple standing on a snowy roof of a soviet high-rise panel building (panelka). Sunset light, orange sky, nostalgic atmosphere, post-soviet aesthetics, urban romance, sleeping district background. Person A and Person B holding hands. High textured concrete, 8k resolution, raw photo style.',
    'midjourney_img2img',
    '{"image_strength": 0.5, "composite_mode": "best_fit", "style_preset": "cinematic"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET 
    src = EXCLUDED.src,
    generation_prompt = EXCLUDED.generation_prompt,
    configuration = EXCLUDED.configuration;
