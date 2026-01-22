-- Fix for UUID type error in creations table
-- Change generation_id to TEXT to allow various job ID formats (job_..., sync_..., etc.)

ALTER TABLE creations DROP CONSTRAINT IF EXISTS creations_generation_id_fkey;
ALTER TABLE creations ALTER COLUMN generation_id TYPE TEXT;

-- Update existing records if any (though they probably failed anyway)
-- UPDATE creations SET generation_id = NULL WHERE generation_id !~ '^[0-9a-fA-F-]{36}$'; 
