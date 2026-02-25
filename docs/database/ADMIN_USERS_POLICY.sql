-- =============================================
-- GRANT ADMIN ACCESS TO PROFILES
-- =============================================

-- 1. Разрешаем Админам просматривать все данные (включая скрытые, если будут)
-- (Обычно profiles и так public read, но на всякий случай)
-- CREATE POLICY "Admins read all" ON profiles FOR SELECT USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' );

-- 2. ГЛАВНОЕ: Разрешаем Админам ИЗМЕНЯТЬ чужие профили (Баланс, Роль и т.д.)
CREATE POLICY "Admins update all" ON profiles 
FOR UPDATE 
USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- 3. Индекс для быстрого поиска по username/telegram_id
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles (username);
CREATE INDEX IF NOT EXISTS profiles_telegram_id_idx ON profiles (telegram_id);
