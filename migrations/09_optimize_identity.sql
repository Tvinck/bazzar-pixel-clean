-- OPTIMIZATION FOR IDENTITY PRESERVATION (Точность лица/персонажа)
-- Tuning configurations to ensure client photos/videos are used with maximum fidelity.

-- 1. VIDEO DANCES (Kling AI / Luma)
-- We increase 'preservation_scale' and add 'face_fix' flag.
UPDATE public.templates
SET 
  configuration = configuration || '{"preservation_scale": 0.9, "face_fix": true, "motion_scale": 0.55}'::jsonb
WHERE id IN ('trend_dance', 'lezginka', 'macarena', 'michael_jackson');

-- 2. PORTRAITS / STYLES (Midjourney / Stable Diffusion)
-- We use 'controlnet_args' to tell the backend to keep the structure/face.
-- 'image_strength' adjusted: 0.6-0.7 is the sweet spot (too high = no style change, too low = lost face).
UPDATE public.templates
SET 
  configuration = configuration || '{"image_strength": 0.7, "controlnet_module": "canny", "face_restore": true}'::jsonb
WHERE id IN ('snow_queen', 'golden_portrait', 'lego_effect', 'patronus');

-- 3. SPECIFIC COMPLEX TEMPLATES
-- 'animate_photo': Needs high fidelity to just animate, not change style.
UPDATE public.templates
SET 
  configuration = configuration || '{"image_strength": 0.95, "motion_bucket_id": 127}'::jsonb
WHERE id = 'animate_photo';

-- 'polaroid_hugs': Needs to merge two people.
UPDATE public.templates
SET 
  generation_prompt = 'A vintage polaroid photo of two people hugging. Person A (from first image) and Person B (from second image) together. Warm embrace, nostalgic film look.',
  configuration = configuration || '{"composite_mode": "best_fit", "face_restore": true}'::jsonb
WHERE id = 'polaroid_hugs';
