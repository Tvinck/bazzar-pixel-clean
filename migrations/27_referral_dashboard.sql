-- 1. Enhance user_stats with referral metrics
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0;
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS total_earned_referrals INTEGER DEFAULT 0;

-- 2. Function to get current referral reward amount based on invite count
CREATE OR REPLACE FUNCTION get_referral_reward_amount(p_invite_count INTEGER)
RETURNS INTEGER AS $$
BEGIN
    IF p_invite_count < 5 THEN
        RETURN 10;
    ELSIF p_invite_count < 15 THEN
        RETURN 15;
    ELSIF p_invite_count < 50 THEN
        RETURN 20;
    ELSE
        RETURN 25;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. Update register_referral to use progressive scale and update stats
CREATE OR REPLACE FUNCTION register_referral(
    p_new_user_id UUID,
    p_referrer_telegram_id BIGINT
) 
RETURNS JSONB AS $$
DECLARE
    v_referrer_id UUID;
    v_invite_count INTEGER;
    v_bonus_amount INTEGER;
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

    -- 3. Get current invite count to determine bonus
    SELECT total_referrals INTO v_invite_count FROM user_stats WHERE user_id = v_referrer_id;
    v_bonus_amount := get_referral_reward_amount(COALESCE(v_invite_count, 0));

    -- 4. Reward Referrer
    UPDATE user_stats
    SET current_balance = current_balance + v_bonus_amount,
        total_referrals = total_referrals + 1,
        total_earned_referrals = total_earned_referrals + v_bonus_amount,
        updated_at = NOW()
    WHERE user_id = v_referrer_id
    RETURNING current_balance INTO v_new_referrer_balance;

    -- 5. Log Transaction for Referrer
    INSERT INTO transactions (user_id, amount, type, description, created_at)
    VALUES (
        v_referrer_id, 
        v_bonus_amount, 
        'referral', 
        'Bonus for inviting user (Tier Bonus)', 
        NOW()
    );

    -- 6. Return success info
    RETURN jsonb_build_object(
        'success', true, 
        'referrer_id', v_referrer_id, 
        'bonus', v_bonus_amount,
        'new_referrer_balance', v_new_referrer_balance,
        'new_invite_count', v_invite_count + 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create a function to get detailed referral analytics for a user
CREATE OR REPLACE FUNCTION get_user_referral_analytics(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_total_invites INTEGER;
    v_active_referrals INTEGER;
    v_total_earned INTEGER;
    v_current_tier INTEGER;
    v_next_tier_progress INTEGER;
    v_next_tier_limit INTEGER;
BEGIN
    SELECT 
        total_referrals, 
        total_earned_referrals 
    INTO v_total_invites, v_total_earned
    FROM user_stats 
    WHERE user_id = p_user_id;

    -- Active referrals: those who have at least 1 creation
    SELECT COUNT(*) INTO v_active_referrals
    FROM users u
    JOIN user_stats s ON u.id = s.user_id
    WHERE u.referred_by = p_user_id AND s.total_generations > 0;

    -- Tiers: 5, 15, 50
    IF v_total_invites < 5 THEN
        v_current_tier := 1;
        v_next_tier_limit := 5;
    ELSIF v_total_invites < 15 THEN
        v_current_tier := 2;
        v_next_tier_limit := 15;
    ELSIF v_total_invites < 50 THEN
        v_current_tier := 3;
        v_next_tier_limit := 50;
    ELSE
        v_current_tier := 4;
        v_next_tier_limit := 50; -- Max tier
    END IF;

    RETURN jsonb_build_object(
        'total_invites', COALESCE(v_total_invites, 0),
        'active_referrals', COALESCE(v_active_referrals, 0),
        'total_earned', COALESCE(v_total_earned, 0),
        'current_tier', v_current_tier,
        'next_tier_limit', v_next_tier_limit,
        'reward_per_invite', get_referral_reward_amount(COALESCE(v_total_invites, 0))
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
