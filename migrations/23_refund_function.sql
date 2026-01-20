-- Function to refund credits by UUID
CREATE OR REPLACE FUNCTION refund_transaction(
    p_user_id UUID,
    p_amount INTEGER,
    p_reason TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_new_balance INTEGER;
BEGIN
    UPDATE user_stats
    SET 
        current_balance = current_balance + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING current_balance INTO v_new_balance;

    INSERT INTO transactions (user_id, amount, type, description, created_at)
    VALUES (p_user_id, p_amount, 'refund', p_reason, NOW());

    RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
