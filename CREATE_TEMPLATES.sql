-- 1. Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add columns safely
DO $$
BEGIN
    -- title
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='templates' AND column_name='title') THEN
        ALTER TABLE templates ADD COLUMN title TEXT;
    END IF;

    -- description
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='templates' AND column_name='description') THEN
        ALTER TABLE templates ADD COLUMN description TEXT;
    END IF;

    -- category
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='templates' AND column_name='category') THEN
        ALTER TABLE templates ADD COLUMN category TEXT DEFAULT 'all';
    END IF;

    -- src
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='templates' AND column_name='src') THEN
        ALTER TABLE templates ADD COLUMN src TEXT;
    END IF;

    -- media_type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='templates' AND column_name='media_type') THEN
        ALTER TABLE templates ADD COLUMN media_type TEXT DEFAULT 'image';
    END IF;

    -- is_local_video
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='templates' AND column_name='is_local_video') THEN
        ALTER TABLE templates ADD COLUMN is_local_video BOOLEAN DEFAULT FALSE;
    END IF;

    -- required_files_count
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='templates' AND column_name='required_files_count') THEN
        ALTER TABLE templates ADD COLUMN required_files_count INTEGER DEFAULT 1;
    END IF;

    -- file_label
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='templates' AND column_name='file_label') THEN
        ALTER TABLE templates ADD COLUMN file_label TEXT DEFAULT 'Upload Photo';
    END IF;

    -- fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='templates' AND column_name='fields') THEN
        ALTER TABLE templates ADD COLUMN fields JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- is_active
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='templates' AND column_name='is_active') THEN
        ALTER TABLE templates ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- 2.5 Fix ID Default Value (if missing)
ALTER TABLE templates ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- 3. Create Indices (Safe)
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_is_active ON templates(is_active);

-- 4. Enable RLS
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- 5. Policies
DROP POLICY IF EXISTS "Templates are viewable by everyone" ON templates;
CREATE POLICY "Templates are viewable by everyone" ON templates
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Service role key has full access" ON templates;
CREATE POLICY "Service role key has full access" ON templates
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 6. Insert Demo Data (Explicitly generate UUIDs to be safe)
INSERT INTO templates (id, title, description, category, src, media_type, required_files_count, file_label, fields, is_active)
SELECT uuid_generate_v4(), 'Crazy Frog Dance', 'Become the famous frog!', 'dances', 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDNoYnJ5a3J5YnJ5a3J5YnJ5a3J5YnJ5a3J5YnJ5a3J5YnJ5/kHfA6k5y5e5y5/giphy.gif', 'video', 1, 'Загрузи свое фото', '[]'::jsonb, true
WHERE NOT EXISTS (SELECT 1 FROM templates WHERE title = 'Crazy Frog Dance');

INSERT INTO templates (id, title, description, category, src, media_type, required_files_count, file_label, fields, is_active)
SELECT uuid_generate_v4(), 'Cyberpunk Angel', 'Futuristic wings implementation', 'angels', 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 'image', 1, 'Upload Portrait', 
'[{"id": "wing_color", "label": "Wing Color", "type": "select", "options": ["Neon Blue", "Cyber Pink", "Gold"]}]'::jsonb, true
WHERE NOT EXISTS (SELECT 1 FROM templates WHERE title = 'Cyberpunk Angel');

INSERT INTO templates (id, title, description, category, src, media_type, required_files_count, file_label, fields, is_active)
SELECT uuid_generate_v4(), 'New Year Vibez', 'Add festive mood to your photo', 'christmas', 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 'image', 1, 'Upload Photo', '[]'::jsonb, true
WHERE NOT EXISTS (SELECT 1 FROM templates WHERE title = 'New Year Vibez');

INSERT INTO templates (id, title, description, category, src, media_type, required_files_count, file_label, fields, is_active)
SELECT uuid_generate_v4(), 'Retro Filter', 'Old school 90s style', 'oldTrends', 'https://images.unsplash.com/photo-1605106702734-205df224ecce?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 'image', 1, 'Upload Photo', '[]'::jsonb, true
WHERE NOT EXISTS (SELECT 1 FROM templates WHERE title = 'Retro Filter');
