# 🎨 ПУБЛИЧНАЯ ГАЛЕРЕЯ - ДОКУМЕНТАЦИЯ

## 📋 Обзор

Публичная галерея позволяет пользователям:
- Просматривать творения других пользователей
- Лайкать понравившиеся работы
- Фильтровать по типу (изображения, видео, аудио)
- Сортировать (тренды, недавние, популярные)
- Делиться своими работами

---

## 🗄️ База данных

### Таблицы:

#### 1. `creations` (уже существует)
```sql
- id: UUID
- user_id: UUID
- title: TEXT
- description: TEXT
- image_url: TEXT
- thumbnail_url: TEXT
- type: TEXT (image/video/audio)
- prompt: TEXT
- tags: TEXT[]
- is_public: BOOLEAN
- is_featured: BOOLEAN
- views: INTEGER
- likes: INTEGER
- shares: INTEGER
- created_at: TIMESTAMP
```

#### 2. `creation_likes` (новая)
```sql
- id: UUID
- creation_id: UUID
- user_id: UUID
- created_at: TIMESTAMP
- UNIQUE(creation_id, user_id)
```

#### 3. `creation_comments` (новая, для будущего)
```sql
- id: UUID
- creation_id: UUID
- user_id: UUID
- comment_text: TEXT
- created_at: TIMESTAMP
```

---

## 📊 Views (представления)

### 1. `public_gallery_trending`
Сортировка по трендам (последние 7 дней):
```sql
trending_score = likes * 2 + views
ORDER BY trending_score DESC, created_at DESC
LIMIT 100
```

### 2. `public_gallery_recent`
Сортировка по дате создания:
```sql
ORDER BY created_at DESC
LIMIT 100
```

### 3. `public_gallery_popular`
Сортировка по популярности (все время):
```sql
ORDER BY likes DESC, views DESC
LIMIT 100
```

---

## 🔧 API Функции

### `galleryAPI.getPublicCreations(options)`
Получить список публичных творений.

**Параметры:**
```javascript
{
    sortBy: 'trending' | 'recent' | 'popular',
    filterType: 'all' | 'image' | 'video' | 'audio',
    page: number,
    limit: number
}
```

**Возвращает:**
```javascript
{
    creations: Creation[],
    hasMore: boolean,
    total: number
}
```

**Пример:**
```javascript
const { creations, hasMore } = await galleryAPI.getPublicCreations({
    sortBy: 'trending',
    filterType: 'image',
    page: 1,
    limit: 20
});
```

---

### `galleryAPI.likeCreation(creationId, userId)`
Поставить лайк.

**Возвращает:**
```javascript
{
    success: boolean,
    data?: object,
    error?: string
}
```

**Пример:**
```javascript
const result = await galleryAPI.likeCreation(creationId, userId);
if (result.success) {
    console.log('Liked!');
}
```

---

### `galleryAPI.unlikeCreation(creationId, userId)`
Убрать лайк.

---

### `galleryAPI.checkUserLiked(creationId, userId)`
Проверить, лайкнул ли пользователь.

**Возвращает:** `boolean`

---

### `galleryAPI.incrementViews(creationId)`
Увеличить счетчик просмотров.

---

### `galleryAPI.saveCreation(creation)`
Сохранить новое творение.

**Параметры:**
```javascript
{
    userId: UUID,
    generationId: UUID,
    title: string,
    description: string,
    imageUrl: string,
    thumbnailUrl: string,
    type: 'image' | 'video' | 'audio',
    prompt: string,
    tags: string[],
    isPublic: boolean
}
```

---

### `galleryAPI.searchCreations(query, filters)`
Поиск творений.

**Параметры:**
```javascript
{
    query: string,
    filters: {
        type?: string,
        tags?: string[],
        sortBy?: string,
        sortOrder?: 'asc' | 'desc',
        limit?: number
    }
}
```

---

## 🎨 Компоненты

### `GalleryView.jsx`
Главный компонент галереи.

**Состояние:**
```javascript
- creations: Creation[]
- sortBy: 'trending' | 'recent' | 'popular'
- filterType: 'all' | 'image' | 'video' | 'audio'
- page: number
- hasMore: boolean
- isLoading: boolean
```

**Функции:**
```javascript
- loadCreations() - загрузка творений
- handleLike(id) - лайк
- handleLoadMore() - загрузить еще
```

---

## 🎯 Использование

### 1. Добавить в App.jsx

```javascript
import GalleryView from './views/GalleryView';

// В роутинге
{activeTab === 'gallery' && <GalleryView />}
```

### 2. Добавить вкладку в навигацию

```javascript
<button onClick={() => setActiveTab('gallery')}>
    <Image size={24} />
    Gallery
</button>
```

### 3. Применить SQL схему

```bash
# В Supabase SQL Editor
# Выполнить supabase_gallery_extension.sql
```

---

## 🔐 Безопасность (RLS)

### Политики:

**Creations:**
- ✅ Публичные творения видны всем
- ✅ Пользователи могут создавать свои
- ✅ Пользователи могут редактировать свои

**Likes:**
- ✅ Лайки видны всем
- ✅ Пользователи могут лайкать
- ✅ Пользователи могут удалять свои лайки

**Comments:**
- ✅ Комментарии видны всем
- ✅ Пользователи могут комментировать
- ✅ Пользователи могут редактировать свои

---

## 📈 Оптимизация

### Индексы:
```sql
✅ idx_creations_is_public
✅ idx_creations_created_at
✅ idx_creations_likes
✅ idx_likes_creation_id
✅ idx_likes_user_id
```

### Кэширование:
```javascript
// Кэшировать trending на 5 минут
// Кэшировать popular на 1 час
// Recent - без кэша
```

### Пагинация:
```javascript
// Загружать по 20 элементов
// Infinite scroll или "Load More"
```

---

## 🎨 UI/UX

### Фильтры:
```
[Trending] [Recent] [Popular]
[All] [Images] [Videos] [Audio]
```

### Карточка творения:
```
┌─────────────────┐
│                 │
│   [Image]       │
│                 │
├─────────────────┤
│ Title           │
│ by @username    │
│ ❤️ 123  👁 456  │
└─────────────────┘
```

### Empty State:
```
    [Icon]
  No creations yet
Be the first to share!
  [Create Button]
```

---

## 🚀 Следующие шаги

### Фаза 1 (Готово):
- [x] SQL схема
- [x] API функции
- [x] Компонент GalleryView
- [x] Переводы
- [x] Документация

### Фаза 2 (TODO):
- [ ] Интеграция в App.jsx
- [ ] Модальное окно для просмотра
- [ ] Реальные данные из Supabase
- [ ] Тестирование

### Фаза 3 (Будущее):
- [ ] Комментарии
- [ ] Поделиться в соцсети
- [ ] Репорты
- [ ] Модерация
- [ ] Теги и поиск
- [ ] Коллекции

---

## 📊 Метрики

### Отслеживать:
- Количество просмотров
- Количество лайков
- CTR (клики / показы)
- Время на странице
- Популярные теги
- Топ авторы

---

## 🐛 Известные проблемы

### 1. Views не обновляются в реальном времени
**Решение:** Использовать RPC функцию `increment_creation_views`

### 2. Дубликаты лайков
**Решение:** UNIQUE constraint на (creation_id, user_id)

### 3. Производительность при большом количестве
**Решение:** Индексы + Views + Пагинация

---

## 💡 Советы

### Производительность:
- Использовать Views вместо сложных запросов
- Кэшировать популярные данные
- Lazy loading изображений

### UX:
- Skeleton loaders
- Optimistic updates для лайков
- Infinite scroll

### Безопасность:
- RLS политики
- Валидация на сервере
- Rate limiting для лайков

---

**Галерея готова к интеграции!** 🎉

**Следующий шаг:** Добавить в App.jsx и протестировать
