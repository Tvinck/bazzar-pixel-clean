-- Migration: Update templates to use Kie.ai models
-- Purpose: Sync template models with Kie.ai naming and optimize for speed/quality

-- Update Lego and similar templates to use Nano Banana Pro (fast + quality)
UPDATE templates 
SET model_id = 'nano_banana_pro'
WHERE id IN ('lego_effect', 'pixar_style', 'comic_style', 'anime_style');

-- Update artistic templates to use Midjourney
UPDATE templates 
SET model_id = 'midjourney'
WHERE category IN ('art', 'creative') OR id LIKE '%artistic%';

-- Update professional templates to use Flux Pro
UPDATE templates 
SET model_id = 'flux_pro'
WHERE category = 'professional' OR id LIKE '%professional%';

-- Update text-heavy templates to use GPT-4o Image
UPDATE templates 
SET model_id = 'gpt4o_image'
WHERE id LIKE '%text%' OR id LIKE '%poster%';

-- Update fast templates to use Nano Banana (cheapest)
UPDATE templates 
SET model_id = 'nano_banana'
WHERE id LIKE '%quick%' OR id LIKE '%fast%';

-- Log changes
SELECT 
    id, 
    title, 
    model_id, 
    category 
FROM templates 
ORDER BY category, id;
