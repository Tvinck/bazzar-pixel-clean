# 🎬 Видео-шаблоны Bazzar Pixel

## Обзор

Все видео-шаблоны используют **Kling Motion Control** - мощную нейросеть для генерации видео с контролем движений персонажа.

### Технические характеристики:
- **Модель**: `kling_motion_control` (Kie.ai API)
- **Разрешение**: 720p
- **Время генерации**: 2-5 минут
- **Стоимость**: 8 кредитов за генерацию
- **Входные данные**: 
  - Фото пользователя (source_files)
  - Референсное видео с движениями (video_files)
  - Текстовый промпт с описанием действия

---

## 📋 Список шаблонов

### 1. **ОЖИВИТЬ ФОТО** (`animate_photo`)
- **Описание**: Оживите ваши фотографии
- **Промпт**: "The character in the photo is smiling, blinking naturally, and making subtle head movements. Smooth, realistic animation with natural facial expressions."
- **Особенности**: Пользователь может указать конкретное действие (улыбнуться, подмигнуть и т.д.)
- **Популярность**: 50k лайков

### 2. **ТРЕНДОВЫЙ ТАНЕЦ** (`trend_dance`)
- **Описание**: Сгенерируй танец из этих ваших Тиктоков!
- **Промпт**: "The character is performing a trendy TikTok dance with energetic movements, following the rhythm from the reference video. Dynamic, smooth, and synchronized choreography."
- **Популярность**: 15k лайков

### 3. **ЛЕЗГИНКА** (`lezginka`)
- **Описание**: Сгенерируй Лезгинку на любом фото!
- **Промпт**: "The character is performing traditional Lezginka dance with characteristic fast footwork, arm movements, and energetic jumps. Traditional Caucasian dance style with authentic movements."
- **Популярность**: 10k лайков

### 4. **МАКАРЕНА** (`macarena`)
- **Описание**: Сгенерируй трендовый танец с любого фото
- **Промпт**: "The character is dancing the Macarena with classic arm and hip movements, following the iconic choreography. Fun, rhythmic, and synchronized dance moves."
- **Популярность**: 12k лайков

### 5. **МАЙКЛ ДЖЕКСОН** (`michael_jackson`)
- **Описание**: Сгенерируй трендовый танец с любого фото
- **Промпт**: "The character is performing Michael Jackson signature moves including moonwalk, spins, and iconic poses. Smooth, precise, and legendary dance style."
- **Популярность**: 20k лайков

### 6. **MOSCOW** (`moscow`)
- **Описание**: Сгенерируй танец на любом фото!
- **Промпт**: "The character is dancing to Moscow song with energetic movements, characteristic Russian dance elements. Dynamic and rhythmic choreography."
- **Популярность**: 8k лайков

### 7. **BIG GUY** (`big_guy`)
- **Описание**: Превратись в большого парня!
- **Промпт**: "The character is performing confident, powerful movements with strong presence. Masculine, bold body language and gestures."
- **Популярность**: 18k лайков

### 8. **CHANEL** (`chanel`)
- **Описание**: Модная фотосессия в стиле Chanel
- **Промпт**: "The character is posing elegantly like a fashion model, with graceful movements and sophisticated gestures. Luxurious, high-fashion style with refined poses."
- **Популярность**: 25k лайков

### 9. **БУДУЩИЙ ПАРТНЕР** (`future_partner`)
- **Описание**: Встреча с будущим партнером
- **Промпт**: "The character is making romantic, gentle gestures as if meeting someone special. Soft, warm expressions and inviting body language."
- **Популярность**: 14k лайков

### 10. **LATINA** (`latina`)
- **Описание**: Латиноамериканский танец
- **Промпт**: "The character is dancing Latin style with passionate hip movements, sensual gestures, and rhythmic body waves. Energetic salsa or bachata choreography."
- **Популярность**: 16k лайков

### 11. **NO PRADA** (`no_prada`)
- **Описание**: Дерзкий уличный стиль
- **Промпт**: "The character is making bold, confident street-style movements with attitude. Urban, edgy gestures and poses."
- **Популярность**: 13k лайков

### 12. **NOBODY** (`nobody`)
- **Описание**: Танец Nobody
- **Промпт**: "The character is performing the Nobody dance challenge with characteristic moves. Trendy, viral dance choreography."
- **Популярность**: 19k лайков

### 13. **REZE** (`reze`)
- **Описание**: Аниме-стиль движения
- **Промпт**: "The character is making anime-inspired movements and poses, dramatic gestures with character personality. Stylized, expressive animation."
- **Популярность**: 17k лайков

### 14. **STILL STERN** (`still_stern`)
- **Описание**: Серьезный и строгий образ
- **Промпт**: "The character maintains a serious, stern expression with minimal but powerful movements. Strong, authoritative presence."
- **Популярность**: 11k лайков

---

## 🔧 Техническая реализация

### Структура шаблона:
```javascript
{
    id: 'template_id',
    title: "НАЗВАНИЕ",
    description: "Описание",
    type: "template",
    likes: "количество",
    src: "/videos/filename.mp4",
    isLocalVideo: true,
    mediaType: 'video',
    model_id: 'kling_motion_control',
    generation_prompt: 'English prompt for AI',
    configuration: {
        mode: '720p',
        character_orientation: 'video'
    },
    fields: [] // Опциональные поля для пользователя
}
```

### Процесс генерации:

1. **Пользователь загружает фото** → `source_files`
2. **Система добавляет референсное видео** → `video_files` (из `template.src`)
3. **Формируется промпт** → `generation_prompt` + пользовательские поля
4. **Отправка в Kling Motion Control** через Kie.ai API
5. **Ожидание 2-5 минут** (асинхронная очередь)
6. **Результат приходит в бот** и сохраняется в истории

### Конфигурация AI Service:

```javascript
// В ai-service.js
if (modelId === 'kling_motion_control') {
    input = {
        prompt: prompt || 'The character is performing the action from the reference video.',
        input_urls: options.source_files || [],
        video_urls: options.video_files || [],
        character_orientation: options.character_orientation || 'video',
        mode: options.mode || '720p'
    };
}
```

---

## 📱 UX Улучшения

### 1. **Предупреждение о времени генерации**
```javascript
if (isVideoTemplate) {
    toaster.info('Генерация видео займет 2-5 минут. Результат придет в бот и появится в истории.');
}
```

### 2. **Визуальный индикатор в футере**
- Желтый блок с иконкой Film
- Текст: "Генерация видео: 2-5 минут"

### 3. **Динамический текст кнопки**
- Обычное состояние: "Сгенерировать"
- Во время генерации: "Генерируем видео..."

### 4. **Уведомления в Telegram**
- Автоматическая отправка готового видео
- Подпись с названием шаблона и промптом
- Ссылка на бота

---

## 🎯 Следующие шаги

### Для фото-шаблонов:
- [ ] Добавить промпты для всех 83 фото-шаблонов
- [ ] Использовать Flux Pro для качественной генерации
- [ ] Добавить категории (портреты, праздники, эффекты и т.д.)

### Для видео-шаблонов:
- [x] Все 14 видео-шаблонов настроены
- [x] Kling Motion Control интегрирован
- [x] Асинхронная очередь работает
- [x] Уведомления в бот настроены

### Общие улучшения:
- [ ] Добавить предпросмотр результатов других пользователей
- [ ] Система рейтингов и отзывов
- [ ] Рекомендации похожих шаблонов
- [ ] Избранные шаблоны
