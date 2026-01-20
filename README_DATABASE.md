# База данных Supabase

Для корректной работы приложения (баланс, уровни, история), необходимо применить SQL миграции в вашем проекте Supabase.

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard) -> SQL Editor.
2. Скопируйте содержимое файлов из папки `migrations/` по порядку и выполните их.

### Порядок миграций:

1. `migrations/01_add_blurhash_column.sql` (если еще не применено)
2. `migrations/02_add_leveling.sql` (для базовых колонок, если еще не применено)
3. `migrations/03_social_features.sql` (опционально)
4. `migrations/04_economy_and_xp.sql` (**КРИТИЧНО** для экономики)

### Что делает `04_economy_and_xp.sql`:
- Создает таблицу `transactions` для истории платежей.
- Добавляет RPC функцию `process_generation_payment` для безопасного списания средств и начисления XP одной операцией.
- Добавляет функцию `add_user_credits` для начисления баланса.
