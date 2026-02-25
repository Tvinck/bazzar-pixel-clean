-- Migration 28: Prompt Marketplace
-- Showcase of proven prompts from top creators

-- Create prompt_marketplace table
CREATE TABLE IF NOT EXISTS prompt_marketplace (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title_ru TEXT NOT NULL,
    title_en TEXT,
    description_ru TEXT,
    description_en TEXT,
    prompt TEXT NOT NULL,
    preview_url TEXT, -- Link to an example generated image
    category TEXT CHECK (category IN ('photo', 'art', '3d', 'video', 'anime', 'cinematic')),
    is_featured BOOLEAN DEFAULT false,
    price_credits INTEGER DEFAULT 0, -- 0 means free to use
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE prompt_marketplace ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read for prompt_marketplace" ON prompt_marketplace
    FOR SELECT USING (true);

-- Functions
-- Track usage when a prompt is applied
CREATE OR REPLACE FUNCTION increment_prompt_usage(prompt_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE prompt_marketplace
    SET usage_count = usage_count + 1
    WHERE id = prompt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Initial data (seed)
-- Note: Replace with actual creator IDs if known, or leave as NULL for system prompts
INSERT INTO prompt_marketplace (title_ru, title_en, prompt, category, is_featured, preview_url)
VALUES 
('Киберпанк Самурай', 'Cyberpunk Samurai', 'Cyberpunk samurai in neon city, high detail, katana glowing, futuristic armor, 8k', 'art', true, 'https://example.com/previews/cyber_samurai.jpg'),
('Милый Кот Астронавт', 'Cute Cat Astronaut', 'Cute fluffy cat in a space suit, floating in space, moon background, cinematic lighting', '3d', true, 'https://example.com/previews/cat_astro.jpg'),
('Студия Гибли пейзаж', 'Studio Ghibli Landscape', 'Studio Ghibli style landscape, rolling hills, blue sky with fluffy clouds, vibrant colors, peaceful atmosphere', 'anime', true, 'https://example.com/previews/ghibli_hills.jpg');
