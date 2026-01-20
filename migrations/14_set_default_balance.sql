-- Set default balance for new users to 10 credits
ALTER TABLE user_stats ALTER COLUMN current_balance SET DEFAULT 10;

-- Optional: If there is a 'balance' column in 'profiles' table (legacy), set default there too
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'balance') THEN
        ALTER TABLE profiles ALTER COLUMN balance SET DEFAULT 10;
    END IF;
END $$;
