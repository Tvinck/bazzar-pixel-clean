-- =============================================
-- 1. CREATE PROFILES TABLE (IF MISSING)
-- =============================================
create table if not exists public.profiles (
  id uuid not null references auth.users(id) on delete cascade primary key,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  username text,
  full_name text,
  avatar_url text,
  website text,
  
  -- Wallet & Gamification
  balance integer default 0,
  telegram_id bigint, 
  
  -- Access Control
  role text default 'user',  -- 'admin', 'moderator', 'user'

  constraint username_length check (char_length(username) >= 3)
);

-- Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );
  
-- =============================================
-- 2. AI MODELS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS ai_models (
    id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    cost INTEGER DEFAULT 4 NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    category TEXT DEFAULT 'image',
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can read models" ON ai_models FOR SELECT USING (true);
CREATE POLICY "Admins can update models" ON ai_models FOR ALL USING (
    -- Check if user is admin via profiles table
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Seed Data
INSERT INTO ai_models (id, display_name, cost, category, description) VALUES
('flux-pro', 'Flux Pro (Realism)', 4, 'image', 'Top quality realism'),
('flux-schnell', 'Flux Schnell', 1, 'image', 'Fast generation'),
('kling', 'Kling AI', 45, 'video', 'Video generation'),
('runway-gen3', 'Runway Gen-3', 80, 'video', 'Cinematic video'),
('midjourney', 'Midjourney V6', 8, 'image', 'Artistic style')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 3. AUTO-CREATE PROFILE TRIGGER
-- =============================================
-- This ensures every new user gets a profile automatically
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role, balance)
  values (
      new.id, 
      new.raw_user_meta_data->>'full_name', 
      new.raw_user_meta_data->>'avatar_url', 
      'user', 
      10 -- Give 10 free credits on sign up
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
