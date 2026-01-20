-- 1. Add column to store who invited the user
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id);

-- Index for faster lookup of allocations
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);

-- 2. Function to process referral logic safely
CREATE OR REPLACE FUNCTION register_referral(
    p_new_user_id UUID,
    p_referrer_telegram_id BIGINT
) 
RETURNS JSONB AS $$
DECLARE
    v_referrer_id UUID;
    v_bonus_amount INTEGER := 10;
    v_new_referrer_balance INTEGER;
BEGIN
    -- 1. Find Referrer UUID
    SELECT id INTO v_referrer_id 
    FROM users 
    WHERE telegram_id = p_referrer_telegram_id;
    
    -- Validate Referrer
    IF v_referrer_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Referrer not found');
    END IF;

    IF v_referrer_id = p_new_user_id THEN
         RETURN jsonb_build_object('success', false, 'error', 'Cannot refer self');
    END IF;

    -- 2. Link User (Only if not already linked)
    UPDATE users 
    SET referred_by = v_referrer_id 
    WHERE id = p_new_user_id AND referred_by IS NULL;

    -- If no row updated, it means user already has a referrer
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Already referred');
    END IF;

    -- 3. Reward Referrer (+10 credits)
    UPDATE user_stats
    SET current_balance = current_balance + v_bonus_amount,
        updated_at = NOW()
    WHERE user_id = v_referrer_id
    RETURNING current_balance INTO v_new_referrer_balance;

    -- 4. Log Transaction for Referrer
    INSERT INTO transactions (user_id, amount, type, description, created_at)
    VALUES (
        v_referrer_id, 
        v_bonus_amount, 
        'referral', 
        'Bonus for inviting user', 
        NOW()
    );

    -- 5. Return success info
    RETURN jsonb_build_object(
        'success', true, 
        'referrer_id', v_referrer_id, 
        'bonus', v_bonus_amount,
        'new_referrer_balance', v_new_referrer_balance
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
