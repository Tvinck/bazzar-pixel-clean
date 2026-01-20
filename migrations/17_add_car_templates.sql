-- Add Automobile Templates
INSERT INTO public.templates (id, title, description, type, likes, src, is_local_video, media_type, category, required_files_count, generation_prompt, model_id, configuration)
VALUES 
(
  'cyberpunk_car',
  'CYBERPUNK CAR',
  'Преврати свое авто в кибер-тачку!',
  'template',
  '45k',
  'https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=600&auto=format&fit=crop', -- Placeholder
  false,
  'image',
  'cars',
  1,
  'A futuristic cyberpunk car by Syd Mead, neon lights, night city background, rain, high detail, 8k resolution. The car structure matches the original photo.',
  'nano_banana_pro',
  '{"image_strength": 0.65, "style_preset": "cyberpunk"}'::jsonb
),
(
  'luxury_supercar',
  'SUPERCAR',
  'Сделай из своего авто суперкар!',
  'template',
  '30k',
  'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=600&auto=format&fit=crop', -- Placeholder
  false,
  'image',
  'cars',
  1,
  'A luxury golden supercar, parking lot in Dubai, expensive look, realistic lighting, 8k resolution, cinematic shot.',
  'nano_banana_pro',
  '{"image_strength": 0.55}'::jsonb
),
(
  'royal_pet',
  'КОРОЛЕВСКИЙ ПИТОМЕЦ',
  'Ваш питомец в королевском наряде',
  'template',
  '50k',
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=600&auto=format&fit=crop', -- Placeholder
  false,
  'image',
  'pets',
  1,
  'A cute pet wearing royal king clothes, crown, golden robe, sitting on a throne, oil painting style, highly detailed portrait.',
  'nano_banana_pro',
  '{"image_strength": 0.4}'::jsonb
),
(
  'christmas_elf',
  'ЭЛЬФ САНТЫ',
  'Стань помощником Санты!',
  'template',
  '35k',
  'https://images.unsplash.com/photo-1545625442-990886a87752?q=80&w=600&auto=format&fit=crop',
  false,
  'image',
  'christmas',
  1,
  'A cute christmas elf, green and red costume, north pole background, magical sparkles, 3d pixar style.',
  'nano_banana_pro',
  '{"image_strength": 0.5}'::jsonb
),
(
  'dark_angel',
  'ТЕМНЫЙ АНГЕЛ',
  'Готический ангел',
  'template',
  '40k',
  'https://images.unsplash.com/photo-1542385151-efd900078cd3?q=80&w=600&auto=format&fit=crop', -- Placeholder
  false,
  'image',
  'angels',
  1,
  'A dark gothic angel with black wings, dramatic lighting, foggy atmosphere, fantasy art.',
  'nano_banana_pro',
  '{"image_strength": 0.5}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    src = EXCLUDED.src,
    configuration = EXCLUDED.configuration;
