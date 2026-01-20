-- Increase default balance to 50 to allow testing of templates (cost ~15)
ALTER TABLE user_stats ALTER COLUMN current_balance SET DEFAULT 50;

-- Top up existing low-balance users to 50
UPDATE user_stats 
SET current_balance = 50 
WHERE current_balance < 50;
