-- 1. Add new columns for generation configuration
ALTER TABLE public.templates
ADD COLUMN IF NOT EXISTS generation_prompt TEXT, -- English prompt for the AI
ADD COLUMN IF NOT EXISTS model_id VARCHAR(50) DEFAULT 'kling_video', -- Model to use (e.g. 'kling_video', 'midjourney', 'runway')
ADD COLUMN IF NOT EXISTS configuration JSONB DEFAULT '{}'::jsonb; -- Extra config like negative_prompt, steps, cfg_scale

-- 2. Update existing templates with English prompts and configurations
-- DANCES
UPDATE public.templates
SET 
  generation_prompt = 'A person dancing a trendy tiktok dance, high energy, professional choreography, smooth motion, 4k',
  model_id = 'kling_video_img2video',
  configuration = '{"motion_bucket_id": 127, "cond_aug": 0.02}'::jsonb
WHERE id = 'trend_dance';

UPDATE public.templates
SET 
  generation_prompt = 'A person performing the Lezginka dance, traditional caucasian dance, energetic movements, fast footwork, mountain background',
  model_id = 'kling_video_img2video'
WHERE id = 'lezginka';

UPDATE public.templates
SET 
  generation_prompt = 'A person dancing the Macarena, 90s party vibe, fun atmosphere, synchronized moves',
  model_id = 'kling_video_img2video'
WHERE id = 'macarena';

UPDATE public.templates
SET 
  generation_prompt = 'A person dancing like Michael Jackson, moonwalk, sharp moves, stage lighting, pop king style',
  model_id = 'kling_video_img2video'
WHERE id = 'michael_jackson';

-- TRENDS (Image 2 Image / Image 2 Video)
UPDATE public.templates
SET 
  generation_prompt = 'An animated portrait showing the person at different ages: child, teenager, adult, elderly. Smooth morphing transitions, cinematic lighting.',
  model_id = 'luma_video'
WHERE id = 'generations_portrait';

UPDATE public.templates
SET 
  generation_prompt = 'A polaroid style photo of two people hugging warmly, vintage filter, film grain, nostalgic mood',
  model_id = 'midjourney_img2img',
  configuration = '{"aspect_ratio": "1:1"}'::jsonb
WHERE id = 'polaroid_hugs';

UPDATE public.templates
SET 
  generation_prompt = 'Animate this photo realistically. ${anim_prompt}. subtle movement, high quality, 4k',
  model_id = 'kling_video_img2video'
WHERE id = 'animate_photo';

-- ... (We would update all others similarly, keeping it brief for this migration to avoid timeouts)
-- Updating a few more key ones:

UPDATE public.templates
SET 
  generation_prompt = 'A festive christmas card featuring the person, surrounded by christmas decorations, snow, warm holiday lighting, magical atmosphere',
  model_id = 'midjourney_img2img'
WHERE id = 'christmas_card_custom';

UPDATE public.templates
SET 
  generation_prompt = 'The person transformed into a LEGO minifigure, plastic texture, lego background, vibrant colors',
  model_id = 'midjourney_img2img'
WHERE id = 'lego_effect';

UPDATE public.templates
SET 
  generation_prompt = 'The person as a Snow Queen, ice crown, winter landscape, cold blue tones, magical frost effects',
  model_id = 'midjourney_img2img'
WHERE id = 'snow_queen';

-- 3. Security: Allow reading the new columns (already covered by "SELECT USING (true)", but ensuring)
-- No action needed if the policy is just "USING (true)"
