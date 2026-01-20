-- 1. Create Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- Negative for spend, positive for add
    type VARCHAR(50) NOT NULL, -- 'generation', 'purchase', 'bonus', 'refund'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for history queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

-- 2. Create RPC function for Atomic Payment & XP Gain
CREATE OR REPLACE FUNCTION process_generation_payment(
    p_user_id UUID,
    p_cost INTEGER,
    p_xp_reward INTEGER,
    p_service_type VARCHAR DEFAULT 'generation'
) 
RETURNS JSONB AS $$
DECLARE
    v_current_balance INTEGER;
    v_new_balance INTEGER;
    v_current_xp INTEGER;
    v_new_xp INTEGER;
    v_current_level INTEGER;
    v_new_level INTEGER;
BEGIN
    -- Lock user_stats row for update to prevent race conditions
    SELECT current_balance, xp, level INTO v_current_balance, v_current_xp, v_current_level
    FROM user_stats
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'User stats not found');
    END IF;

    -- Check balance
    IF v_current_balance < p_cost THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient funds');
    END IF;

    -- Calculate new values
    v_new_balance := v_current_balance - p_cost;
    v_new_xp := v_current_xp + p_xp_reward;
    -- Level formula: 1 + floor(xp / 500)
    v_new_level := 1 + floor(v_new_xp / 500);

    -- Update stats
    UPDATE user_stats
    SET 
        current_balance = v_new_balance,
        xp = v_new_xp,
        level = v_new_level,
        total_generations = total_generations + 1,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Record transaction
    INSERT INTO transactions (user_id, amount, type, description, created_at)
    VALUES (
        p_user_id, 
        -p_cost, 
        'generation', 
        'Payment for ' || p_service_type,
        NOW()
    );

    -- Return result
    RETURN jsonb_build_object(
        'success', true, 
        'new_balance', v_new_balance,
        'new_xp', v_new_xp,
        'new_level', v_new_level,
        'level_up', (v_new_level > v_current_level)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Function to add credits (Top-up or Bonus)
CREATE OR REPLACE FUNCTION add_user_credits(
    p_telegram_id BIGINT,
    p_amount INTEGER,
    p_reason TEXT,
    p_source VARCHAR DEFAULT 'system'
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_new_balance INTEGER;
BEGIN
    -- Get UUID from telegram_id
    SELECT id INTO v_user_id FROM users WHERE telegram_id = p_telegram_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not found');
    END IF;

    UPDATE user_stats
    SET 
        current_balance = current_balance + p_amount,
        updated_at = NOW()
    WHERE user_id = v_user_id
    RETURNING current_balance INTO v_new_balance;

    -- Record transaction
    INSERT INTO transactions (user_id, amount, type, description, created_at)
    VALUES (v_user_id, p_amount, p_source, p_reason, NOW());

    RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
