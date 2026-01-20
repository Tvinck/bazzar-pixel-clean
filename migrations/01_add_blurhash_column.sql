-- Add blurhash column to creations table
ALTER TABLE creations ADD COLUMN IF NOT EXISTS blurhash TEXT;

-- Update view to include blurhash (if views select * it handles it, but good to check)
-- Usually views update automatically if using SELECT * FROM ...

-- Optional: Create index if needed? No, blurhash is just data.
