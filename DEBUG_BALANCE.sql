-- Check profile with telegram_id
SELECT id, telegram_id, username, balance, created_at
FROM profiles
WHERE telegram_id = '50823401';

-- Check all profiles with balance = 50
SELECT id, telegram_id, username, balance, created_at
FROM profiles
WHERE balance = 50;

-- Check if there's a profile without telegram_id but with 50 credits
SELECT id, telegram_id, username, balance, created_at
FROM profiles
WHERE telegram_id IS NULL AND balance > 0
ORDER BY created_at DESC
LIMIT 5;
