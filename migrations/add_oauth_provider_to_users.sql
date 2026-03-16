-- Add OAuth provider support to users table
-- Allows users to sign in via Yandex ID, VK ID, or Telegram

ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_provider TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_provider_id TEXT;

-- Unique constraint to prevent duplicate OAuth accounts
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_oauth_provider_id
ON users (oauth_provider, oauth_provider_id)
WHERE oauth_provider IS NOT NULL AND oauth_provider_id IS NOT NULL;

-- Comment
COMMENT ON COLUMN users.oauth_provider IS 'OAuth provider: yandex, vk, telegram';
COMMENT ON COLUMN users.oauth_provider_id IS 'User ID from the OAuth provider';
