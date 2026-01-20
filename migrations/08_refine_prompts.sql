-- Refine prompts with high-quality, detailed instruction for best AI results
-- We use '::jsonb ||' to merge new config with existing or default config

-- 1. DANCE / VIDEO TEMPLATES (Focus on motion & character consistency)
UPDATE public.templates
SET 
  generation_prompt = 'Professional cinematic video of a person performing a trending tiktok dance. The person is enthusiastic, synchronized movement, smooth motion, high quality, 4k, trending on artstation. Maintain character identity.',
  configuration = '{"motion_scale": 0.5, "preservation_scale": 0.8}'::jsonb
WHERE id = 'trend_dance';

UPDATE public.templates
SET 
  generation_prompt = 'Cinematic shot of a person dancing the Lezginka in traditional mountain setting. Fast energetic footwork, arms spread wide, eagle-like movements, dramatic mountain lighting, dust particles, 8k resolution.',
  configuration = '{"motion_scale": 0.8}'::jsonb
WHERE id = 'lezginka';

UPDATE public.templates
SET 
  generation_prompt = 'A person dancing the Macarena at a 90s retro party. Disco lights, colorful background, joyful expression, rhythmic movement, wide shot, dancefloor atmosphere.',
  configuration = '{"motion_scale": 0.6}'::jsonb
WHERE id = 'macarena';

-- 2. TRANSFORMATION / IMAGE TEMPLATES (Focus on lighting, texture, style)
UPDATE public.templates
SET 
  generation_prompt = 'Portrait of the person as the Snow Queen. Wearing an intricate crown made of ice crystals, pale skin, cold blue eyes, frost patterns on face, fur cloak. Winter fantasy background, magical glowing atmosphere, volumetric lighting, photorealistic, octane render, 8k.',
  configuration = '{"negative_prompt": "warm colors, fire, summer, cartoon, low quality, blurry", "image_strength": 0.6}'::jsonb
WHERE id = 'snow_queen';

UPDATE public.templates
SET 
  generation_prompt = 'The person as a Hogwarts student casting a Patronus charm. Wearing Gryffindor robes, holding a magic wand, glowing blue magical ethereal animal spirit forming, dark magical forest background. Cinematic lighting, magical particles, detailed face.',
  configuration = '{"negative_prompt": "muggle clothing, daytime, bright sun", "image_strength": 0.7}'::jsonb
WHERE id = 'patronus';

UPDATE public.templates
SET 
  generation_prompt = 'Macro shot of a detailed LEGO minifigure looking exactly like the person. Plastic texture, lego connecting studs visible, depth of field, vibrant colors, lego city background. 3d render style.',
  configuration = '{"style_preset": "3d-model"}'::jsonb
WHERE id = 'lego_effect';

UPDATE public.templates
SET 
  generation_prompt = 'Street racing style photo of a BMW M3 GTR in Tokyo at night. Neon signs reflecting in puddles, rain, wet asphalt, cyberbunk vibes, drift smoke, dynamic angle, speed lines. Need For Speed Underground aesthetic.',
  configuration = '{"aspect_ratio": "16:9"}'::jsonb
WHERE id = 'tokyo_style';

UPDATE public.templates
SET 
  generation_prompt = 'Vintage polaroid photo of the subject. Faded colors, film grain, vignette, handwritten date on the bottom white border, nostalgic atmosphere, flash photography style.',
  configuration = '{"style_preset": "analog-film"}'::jsonb
WHERE id IN ('polaroid_hugs', 'polaroid_tree', 'polaroid_cheburashka');

UPDATE public.templates
SET 
  generation_prompt = 'Oil painting of the person in the style of the Renaissance. Cracked paint texture, chiaroscuro lighting, heavy brushstrokes, gold leaf details, museum framing. Masterpiece.',
  configuration = '{"style_preset": "oil-painting"}'::jsonb
WHERE id = 'golden_portrait';

UPDATE public.templates
SET 
  generation_prompt = 'Glamorous fashion magazine cover shot. The person wearing high fashion Christmas couture, satin red dress/suit, sparkle backdrop, studio lighting, bokeh, professional retouching, sharp focus.',
  configuration = '{"aspect_ratio": "9:16", "negative_prompt": "ugly, text, watermark, bad anatomy"}'::jsonb
WHERE id IN ('christmas_glamour', 'festive_gloss', 'satin_gloss');

UPDATE public.templates
SET 
  generation_prompt = 'The person as a toy inside a glass Christmas snow globe. Falling snow, miniature winter village house, cozy warm light from windows, macro photography, reflection on glass.',
  configuration = '{"image_strength": 0.5}'::jsonb
WHERE id IN ('snow_globe', 'figure_in_sphere', 'photo_in_toy');
