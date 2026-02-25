# ☁️ Cloud Storage Integration

## Обзор

Telegram Cloud Storage интегрирован в приложение для автоматического сохранения пользовательских данных без необходимости сервера.

## ✅ Что уже работает

### 1. Автоматическое сохранение

Все данные автоматически сохраняются в Telegram Cloud Storage и синхронизируются между устройствами:

- **Последние промпты** (до 20 штук)
- **Избранные шаблоны**
- **Настройки пользователя** (готово к использованию)

### 2. Использование в компонентах

```jsx
import { useUser } from '../context/UserContext';

function MyComponent() {
  const { 
    recentPrompts,           // Массив последних промптов
    favoriteTemplates,       // Массив ID избранных шаблонов
    addRecentPrompt,         // Функция добавления промпта
    toggleFavoriteTemplate,  // Функция переключения избранного
    isFavoriteTemplate       // Проверка, является ли шаблон избранным
  } = useUser();

  // Добавить промпт после генерации
  const handleGenerate = async (prompt) => {
    await addRecentPrompt(prompt);
    // ... генерация
  };

  // Переключить избранное
  const handleToggleFavorite = async (templateId) => {
    await toggleFavoriteTemplate(templateId);
  };

  // Проверить, является ли избранным
  const isLiked = isFavoriteTemplate(templateId);

  return (
    <div>
      {/* Показать последние промпты */}
      <div>
        <h3>Последние промпты:</h3>
        {recentPrompts.map((prompt, i) => (
          <div key={i}>{prompt}</div>
        ))}
      </div>

      {/* Кнопка избранного */}
      <button onClick={() => handleToggleFavorite(template.id)}>
        {isLiked ? '❤️' : '🤍'}
      </button>
    </div>
  );
}
```

### 3. Прямое использование Cloud Storage

Если нужно сохранить другие данные:

```jsx
import { useCloudStorage, CLOUD_STORAGE_KEYS } from '../hooks/useCloudStorage';

function SettingsComponent() {
  const cloudStorage = useCloudStorage();

  // Сохранить настройки
  const saveSettings = async () => {
    await cloudStorage.setItem('my_settings', {
      theme: 'dark',
      language: 'ru'
    });
  };

  // Загрузить настройки
  const loadSettings = async () => {
    const settings = await cloudStorage.getItem('my_settings');
    console.log(settings);
  };

  return (
    <button onClick={saveSettings}>Сохранить</button>
  );
}
```

## 📋 Доступные ключи

```javascript
CLOUD_STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  RECENT_PROMPTS: 'recent_prompts',
  FAVORITE_TEMPLATES: 'favorite_templates',
  GENERATION_HISTORY: 'generation_history',
  THEME_SETTINGS: 'theme_settings',
  LANGUAGE: 'language',
  NOTIFICATIONS: 'notifications'
}
```

## 🎯 Примеры использования

### Пример 1: Добавление промпта после генерации

```jsx
// В GenerationView.jsx
const { addRecentPrompt } = useUser();

const handleSubmit = async () => {
  const prompt = inputRef.current.value;
  
  // Сохранить промпт в историю
  await addRecentPrompt(prompt);
  
  // Продолжить генерацию
  await generateImage(prompt);
};
```

### Пример 2: Показ последних промптов

```jsx
// В HomeView.jsx
const { recentPrompts } = useUser();

return (
  <div>
    <h3>Недавние промпты</h3>
    {recentPrompts.slice(0, 5).map((prompt, i) => (
      <button 
        key={i}
        onClick={() => setInputValue(prompt)}
      >
        {prompt}
      </button>
    ))}
  </div>
);
```

### Пример 3: Кнопка избранного на карточке шаблона

```jsx
// В TemplateCard.jsx
const { isFavoriteTemplate, toggleFavoriteTemplate } = useUser();

const isLiked = isFavoriteTemplate(template.id);

return (
  <div className="template-card">
    <img src={template.image} />
    <button 
      onClick={() => toggleFavoriteTemplate(template.id)}
      className="favorite-btn"
    >
      {isLiked ? '❤️ В избранном' : '🤍 Добавить'}
    </button>
  </div>
);
```

## 🔧 API Reference

### useCloudStorage()

Основной хук для работы с Cloud Storage.

```javascript
const {
  isAvailable,      // boolean - доступен ли Cloud Storage
  setItem,          // (key, value) => Promise<boolean>
  getItem,          // (key, parseJSON?) => Promise<any>
  getItems,         // (keys[]) => Promise<Object>
  removeItem,       // (key) => Promise<boolean>
  removeItems,      // (keys[]) => Promise<boolean>
  getKeys           // () => Promise<string[]>
} = useCloudStorage();
```

### useUserPreferences()

Хук для работы с настройками пользователя.

```javascript
const {
  preferences,      // Object - текущие настройки
  isLoading,        // boolean - загружаются ли настройки
  savePreferences,  // (newPrefs) => Promise<void>
  updatePreference  // (key, value) => Promise<void>
} = useUserPreferences();
```

### useRecentPrompts()

Хук для работы с последними промптами.

```javascript
const {
  prompts,          // string[] - массив промптов
  isLoading,        // boolean - загружаются ли промпты
  addPrompt,        // (prompt) => Promise<void>
  clearPrompts      // () => Promise<void>
} = useRecentPrompts(maxPrompts = 20);
```

### useFavoriteTemplates()

Хук для работы с избранными шаблонами.

```javascript
const {
  favorites,        // number[] - массив ID шаблонов
  isLoading,        // boolean - загружаются ли избранные
  toggleFavorite,   // (templateId) => Promise<void>
  isFavorite,       // (templateId) => boolean
  clearFavorites    // () => Promise<void>
} = useFavoriteTemplates();
```

## 📊 Ограничения

- **Максимум элементов**: 1024 на пользователя
- **Длина ключа**: 1-128 символов
- **Длина значения**: до 4096 символов
- **Формат**: Только строки (используйте JSON.stringify/parse для объектов)

## ✨ Преимущества

- ✅ **Бесплатно** - не нужен сервер
- ✅ **Синхронизация** - данные доступны на всех устройствах
- ✅ **Быстро** - мгновенный доступ
- ✅ **Надежно** - хранится в Telegram
- ✅ **Просто** - легкий API

## 🚀 Что дальше?

### Рекомендуемые улучшения:

1. **Добавить UI для последних промптов** в HomeView
2. **Добавить кнопки избранного** на карточки шаблонов
3. **Сохранять настройки генерации** (модель, размер, стиль)
4. **Кэшировать результаты генерации** для быстрого доступа
5. **Сохранять черновики** незавершенных генераций

### Пример: Сохранение настроек генерации

```jsx
// Сохранить последние использованные настройки
await cloudStorage.setItem('last_gen_settings', {
  model: 'flux-pro',
  size: '1024x1024',
  style: 'realistic'
});

// Загрузить при следующем запуске
const settings = await cloudStorage.getItem('last_gen_settings');
if (settings) {
  setModel(settings.model);
  setSize(settings.size);
  setStyle(settings.style);
}
```

## 🐛 Отладка

Все операции Cloud Storage логируются в консоль:

```
✅ Telegram Cloud Storage available
✅ Loaded 5 recent prompts from cloud
✅ Saved to cloud: recent_prompts
✅ Loaded 3 favorite templates from cloud
✅ Added to favorites
```

Если Cloud Storage недоступен (например, в браузере):
```
⚠️ Telegram Cloud Storage not available
```

## 📝 Заметки

- Cloud Storage работает только в Telegram Mini Apps
- В режиме разработки (браузер) данные не сохраняются
- Данные привязаны к боту и пользователю
- При удалении бота данные удаляются
