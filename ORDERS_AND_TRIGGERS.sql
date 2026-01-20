-- =============================================
-- 1. ORDERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    status TEXT DEFAULT 'new', -- 'new', 'processing', 'completed', 'cancelled'
    service_name TEXT NOT NULL,
    amount NUMERIC(10, 2) DEFAULT 0,
    customer_info JSONB DEFAULT '{}', -- { "telegram": "@user", "name": "John" }
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view all orders" ON orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can update orders" ON orders FOR UPDATE TO authenticated USING (true);
CREATE POLICY "System can insert orders" ON orders FOR INSERT TO authenticated, service_role WITH CHECK (true);


-- =============================================
-- 2. AUTOMATION TRIGGERS
-- =============================================

-- A. NOTIFICATION TRIGGER (New Order -> Notify Staff)
CREATE OR REPLACE FUNCTION handle_new_order()
RETURNS TRIGGER AS $$
DECLARE
    staff_user RECORD;
BEGIN
    -- Notify all staff (simplified: notify specific user or multicast not supported well in simple rows, 
    -- so we insert for ALL 'admin' users or just rely on a broadcast topic? 
    -- For this MVP, let's insert a 'system' notification for the first available admin or just log it.)
    
    -- Better: Insert into a table that Bot Bridge listens to, OR insert for specific users.
    -- Let's notify ALL users with 'bot_users' mapping (active staff)
    
    INSERT INTO notifications (user_id, type, title, message)
    SELECT user_id, 'order', 'Новый заказ ' || NEW.service_name, 'Сумма: ' || NEW.amount || '₽. Клиент: ' || (NEW.customer_info->>'telegram')
    FROM bot_users; 
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_new_order ON orders;
CREATE TRIGGER on_new_order
AFTER INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION handle_new_order();


-- B. GAMIFICATION TRIGGER (Order Completed -> Give XP)
CREATE OR REPLACE FUNCTION handle_order_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
        -- Give XP to the user who updated it (auth.uid() is not available in trigger easily without extensions)
        -- Fallback: We assume the UI updates a 'processed_by' column. 
        -- If 'processed_by' doesn't exist, we can't credit specific user.
        -- Let's ADD 'processed_by' to orders.
        
        IF NEW.processed_by IS NOT NULL THEN
            INSERT INTO staff_xp_logs (user_id, amount, reason)
            VALUES (NEW.processed_by, 50, 'Выполнение заказа #' || NEW.id);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Add processed_by column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS processed_by UUID REFERENCES auth.users(id);

DROP TRIGGER IF EXISTS on_order_completion ON orders;
CREATE TRIGGER on_order_completion
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION handle_order_completion();
