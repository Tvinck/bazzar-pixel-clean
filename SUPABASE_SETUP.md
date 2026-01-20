# 🚀 BAZZAR PIXEL - Supabase Integration Guide

## 📋 Что подключено

### 1. **База данных и аналитика**
- ✅ Полная схема БД (`supabase_schema.sql`)
- ✅ Отслеживание пользователей и сессий
- ✅ Статистика генераций
- ✅ События и взаимодействия
- ✅ Автоматические триггеры для обновления статистики

### 2. **Таблицы**

#### `users` - Пользователи
- Telegram ID, username, имя
- Уровень, XP, аватар
- Premium статус
- Дата регистрации и последней активности

#### `user_sessions` - Сессии
- Отслеживание каждого входа
- Длительность сессии
- Платформа и версия

#### `generations` - Генерации
- Тип (image/video/audio)
- Промпт и настройки
- Статус (started/processing/completed/failed)
- Время обработки
- Результат (URL)

#### `events` - События
- Клики по кнопкам
- Переключение табов
- Шеринг
- Любые кастомные события

#### `user_stats` - Статистика (агрегированная)
- Общее количество генераций
- Успешные/неудачные
- Разбивка по типам
- Время в приложении
- Социальная активность

#### `creations` - Сохраненные работы
- Публичная галерея
- Лайки, просмотры, шеры
- Теги и описания

---

## 🔧 Настройка

### Шаг 1: Создайте проект в Supabase
1. Перейдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Скопируйте **Project URL** и **anon public key**

### Шаг 2: Настройте переменные окружения
Создайте файл `.env` в корне проекта:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Шаг 3: Примените SQL схему
1. Откройте Supabase Dashboard → SQL Editor
2. Скопируйте содержимое `supabase_schema.sql`
3. Выполните SQL запрос
4. Проверьте, что все таблицы созданы

### Шаг 4: Настройте RLS (Row Level Security)
Схема уже включает политики безопасности:
- Пользователи видят только свои данные
- Публичные креации доступны всем
- Service role имеет полный доступ (для бота)

---

## 📊 Использование в коде

### Отслеживание сессии (уже подключено в App.jsx)
```javascript
import { analytics } from './lib/supabase';

// При входе пользователя
analytics.trackSession(userId, telegramUserData);
```

### Отслеживание генерации
```javascript
// При старте генерации
await analytics.trackGeneration(userId, 'image', prompt, 'started');

// При завершении
await analytics.trackGeneration(userId, 'image', prompt, 'completed');
```

### Отслеживание событий
```javascript
// Клик по кнопке
await analytics.trackEvent(userId, 'button_click', {
  button: 'create_image',
  page: 'home'
});

// Переключение таба
await analytics.trackEvent(userId, 'tab_switch', {
  from: 'home',
  to: 'profile'
});

// Шеринг
await analytics.trackEvent(userId, 'share', {
  type: 'story',
  creation_id: '...'
});
```

### Получение статистики пользователя
```javascript
const stats = await analytics.getUserStats(userId);
console.log(stats.total_generations); // 42
console.log(stats.successful_generations); // 38
```

---

## 📈 Мониторинг через Staff Panel

### Создайте админ-панель (будущая задача)
Можно создать отдельную страницу для просмотра аналитики:

```javascript
// Пример запроса статистики
const { data: dailyStats } = await supabase
  .from('daily_active_users')
  .select('*')
  .order('date', { ascending: false })
  .limit(30);

// Топ пользователей
const { data: topUsers } = await supabase
  .from('top_creators')
  .select('*')
  .limit(10);

// Статистика генераций
const { data: genStats } = await supabase
  .from('generation_stats')
  .select('*')
  .order('date', { ascending: false });
```

### Готовые Views для аналитики:
- `daily_active_users` - DAU по дням
- `generation_stats` - Статистика генераций
- `top_creators` - Топ создателей

---

## 🤖 Интеграция с ботом

Для бота используйте **Service Role Key** (не anon key!):

```javascript
// bot.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Секретный ключ!
);

// Бот может записывать данные напрямую
await supabase.from('users').upsert({
  telegram_id: ctx.from.id,
  username: ctx.from.username,
  first_name: ctx.from.first_name
});
```

---

## 🔐 Безопасность

1. **Никогда не коммитьте `.env`** - добавьте в `.gitignore`
2. **Service Role Key** - только на сервере, никогда в клиенте
3. **Anon Key** - безопасен для клиента, RLS защищает данные
4. **RLS политики** - уже настроены в схеме

---

## 📝 Следующие шаги

1. ✅ Установлен `@supabase/supabase-js`
2. ✅ Создана схема БД
3. ✅ Создан клиент Supabase
4. ✅ Подключена аналитика в App.jsx
5. ⏳ Примените схему в Supabase Dashboard
6. ⏳ Добавьте переменные окружения
7. ⏳ Интегрируйте в остальные компоненты
8. ⏳ Создайте админ-панель для мониторинга

---

## 🎯 Примеры использования

### В CreationDrawer.jsx
```javascript
const handleGenerate = async () => {
  // Трек старта
  await analytics.trackGeneration(userId, 'image', prompt, 'started');
  
  try {
    // ... генерация ...
    await analytics.trackGeneration(userId, 'image', prompt, 'completed');
  } catch (error) {
    await analytics.trackGeneration(userId, 'image', prompt, 'failed');
  }
};
```

### В ProfileView.jsx
```javascript
useEffect(() => {
  // Загрузить статистику пользователя
  analytics.getUserStats(userId).then(stats => {
    setUserStats(stats);
  });
}, [userId]);
```

### В HomeView.jsx
```javascript
const handleToolClick = async (toolName) => {
  await analytics.trackEvent(userId, 'tool_click', {
    tool: toolName,
    page: 'home'
  });
  onOpenCreation(toolName);
};
```

---

## 💡 Полезные запросы

### Получить все генерации пользователя
```javascript
const { data } = await supabase
  .from('generations')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

### Получить публичные креации
```javascript
const { data } = await supabase
  .from('creations')
  .select('*')
  .eq('is_public', true)
  .order('likes', { ascending: false })
  .limit(20);
```

### Обновить профиль
```javascript
await analytics.updateUserProfile(userId, {
  avatar_url: 'https://...',
  bio: 'AI Artist',
  level: 5,
  xp: 1250
});
```

---

**Готово!** 🎉 Теперь у вас полноценная аналитика и мониторинг пользователей через Supabase.
