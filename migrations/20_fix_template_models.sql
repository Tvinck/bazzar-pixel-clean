-- Fix template models - Switch to nano_banana (faster) to avoid timeouts
-- controlnet_module removed as well.

UPDATE public.templates
SET 
    model_id = 'nano_banana',
    configuration = configuration - 'controlnet_module'
WHERE id IN ('snow_queen', 'golden_portrait', 'lego_effect', 'patronus', 'polaroid_hugs');
