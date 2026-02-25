# Отчет о доработке системы генерации шаблонов (AI Template System)

## 1. Обзор проделанной работы

Мы успешно переработали архитектуру создания контента из шаблонов, превратив её из статического списка в динамическую систему на базе базы данных. Теперь каждый шаблон — это не просто картинка в интерфейсе, а полноценный объект с настроенной "инструкцией" (промтом) для нейросети.

### Ключевые изменения:
- **База данных**: Шаблоны теперь хранятся в PostgreSQL с полями `generation_prompt`, `model_id` и JSON-конфигурацией.
- **Промпт-инжиниринг**: Добавлены высококачественные английские промты для всех ключевых категорий (Тренды, Рождество, Танцы).
- **Интеграция**: Frontend теперь динамически собирает данные, проводит оплату и отправляет структурированный запрос в AI сервис.

---

## 2. Как работают шаблоны (Техническое описание)

Система работает по принципу "Заполнение слотов" (Slot Filling).

### Шаг 1: Выбор и Загрузка
Когда пользователь открывает шаблон (например, "Снежная Королева"):
1. Приложение загружает данные шаблона из БД.
2. В данных лежит "Скелет промта" (Skeleton Prompt).
   * *Пример:* `"Portrait of the person as the Snow Queen. Wearing an intricate crown..."`
   * *Конфиг:* `{"image_strength": 0.6}` (означает, что исходное лицо сохранится на 60%, а 40% уйдет на стилизацию).

### Шаг 2: Сбор данных
Пользователь загружает фото. Если шаблон требует ввода текста (например, "Действие"), пользователь вводит "Улыбается".

### Шаг 3: Сборка Промта (Prompt Assembly)
Фронтенд (`TemplateView.jsx`) берет скелет промта и подставляет переменные:
`"Animate this photo. ${anim_prompt}"` -> `"Animate this photo. Smiling"`

### Шаг 4: Отправка и Генерация
В `ai-service.js` формируется финальный JSON-пейпаод для отправки на GPU:
```json
{
  "prompt": "Portrait of the person as the Snow Queen...",
  "negative_prompt": "ugly, blurry, low quality",
  "config": {
    "style_preset": "cinematic",
    "aspect_ratio": "9:16"
  }
}
```
Нейросеть получает четкую инструкцию на английском языке, что гарантирует высокий результат.

---

## 3. Примеры Промтов (Добавленные в миграцию)

Мы добавили профессиональные промты для разных категорий. Вот несколько примеров:

### Танцы (Видео)
**Шаблон:** Трендовый Танец
**Модель:** Kling Video (Img2Video)
**Промт:**
> "Professional cinematic video of a person performing a trending tiktok dance. The person is enthusiastic, synchronized movement, smooth motion, high quality, 4k. Maintain character identity."
*(Акцент на сохранение лица и плавность движений)*

### Эффекты (Фото)
**Шаблон:** LEGO Эффект
**Модель:** Midjourney (Img2Img)
**Промт:**
> "Macro shot of a detailed LEGO minifigure looking exactly like the person. Plastic texture, lego connecting studs visible, depth of field, vibrant colors, lego city background. 3d render style."
*(Акцент на текстуру пластика и макро-съемку)*

**Шаблон:** Tokyo Drift (Машины)
**Промт:**
> "Street racing style photo of a BMW M3 GTR in Tokyo at night. Neon signs reflecting in puddles, rain, wet asphalt, cyberpunk vibes, drift smoke, dynamic angle."

---

## 4. Файловая структура и Документация

Мы добавили JSDoc документацию на русском языке в ключевые файлы:

1.  **`src/views/TemplateView.jsx`**:
    *   Описывает UI-логику: загрузка, валидация файлов, оплата, вызов генерации.
2.  **`src/lib/galleryAPI.js`**:
    *   Описывает методы получения данных из Supabase.
3.  **`src/ai-service.js`**:
    *   Описывает логику формирования запроса к нейросети (Payload Construction).

## 5. Итог

Система полностью готова к подключению реального AI-бэкенда.
- **Frontend**: Готов (UI, Оплата, Стейт-менеджмент).
- **Data Layer**: Готов (Промты, Конфиги, Модели).
- **Logic**: Готова (Сборка промта, Обработка ошибок).

Следующий шаг — заменить мок в `ai-service.js` на реальный `fetch` запрос к вашему GPU-кластеру или облачному API.
