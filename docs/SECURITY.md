# 🔒 Руководство по безопасности Pixel AI

## ✅ Реализованные меры безопасности:

### 1. **Rate Limiting (Ограничение частоты запросов)**

Защита от спама и DDoS атак.

```javascript
import rateLimiter, { useRateLimit } from './utils/rateLimiter';

// В компоненте
function MyComponent() {
  const { checkLimit } = useRateLimit(userId, 'generation');

  const handleGenerate = () => {
    const limit = checkLimit();
    
    if (!limit.allowed) {
      toast.error(`Слишком много запросов. Попробуйте через ${limit.retryAfter}с`);
      return;
    }

    // Продолжаем генерацию
  };
}
```

**Лимиты:**
- Генерация: 10 запросов/минуту
- Поиск: 30 запросов/минуту
- Загрузка: 5 файлов/минуту
- Авторизация: 5 попыток/5 минут
- По умолчанию: 60 запросов/минуту

### 2. **Input Validation & XSS Protection**

Валидация и санитизация всех пользовательских данных.

```javascript
import { 
  validatePrompt, 
  sanitizeHTML, 
  validateEmail,
  useFormValidation 
} from './utils/validation';

// Валидация промпта
const handleSubmit = (prompt) => {
  const validation = validatePrompt(prompt);
  
  if (!validation.valid) {
    toast.error(validation.error);
    return;
  }

  // Используем sanitized промпт
  generateImage(validation.sanitized);
};

// Валидация формы
const { values, errors, handleChange, validate } = useFormValidation(
  { email: '', username: '' },
  {
    email: {
      required: true,
      validator: (value) => {
        if (!validateEmail(value)) {
          return { valid: false, error: 'Некорректный email' };
        }
        return { valid: true };
      }
    },
    username: {
      required: true,
      minLength: 3,
      maxLength: 20,
      pattern: /^[a-zA-Z0-9_]+$/,
      message: 'Только буквы, цифры и подчеркивание'
    }
  }
);
```

**Защита от:**
- XSS (Cross-Site Scripting)
- SQL Injection
- HTML Injection
- JavaScript Injection

### 3. **CSRF Protection**

Защита от подделки межсайтовых запросов.

```javascript
import csrfProtection, { useCSRF } from './utils/csrf';

// Автоматически добавляется ко всем запросам через secureAPI
// Токен ротируется после каждого успешного запроса

// Ручное использование
const { token, getToken } = useCSRF();

<form>
  <input type="hidden" name="csrf_token" value={token} />
</form>
```

**Особенности:**
- Уникальный токен для каждой сессии
- Автоматическая ротация после запросов
- Хранение в sessionStorage
- Валидация на сервере

### 4. **Secure API Client**

Централизованный клиент с всеми защитами.

```javascript
import apiClient, { useSecureAPI } from './utils/secureAPI';

// Установка userId для rate limiting
apiClient.setUserId(user.id);

// Безопасная генерация
const result = await apiClient.generateImage(prompt, {
  style: 'anime',
  aspectRatio: '16:9'
});

// React Hook
const { loading, error, post } = useSecureAPI();

const handleGenerate = async () => {
  try {
    const result = await post('/generate', { prompt });
    toast.success('Готово!');
  } catch (err) {
    toast.error(error);
  }
};
```

**Включает:**
- Rate Limiting
- CSRF Protection
- Input Sanitization
- Output Sanitization
- Error Handling

## 🛡️ Best Practices:

### 1. **Всегда валидируйте ввод**

```javascript
// ❌ Плохо
const handleSubmit = (data) => {
  api.post('/endpoint', data);
};

// ✅ Хорошо
const handleSubmit = (data) => {
  const validation = validateForm(data, rules);
  
  if (!validation.isValid) {
    setErrors(validation.errors);
    return;
  }

  api.post('/endpoint', validation.sanitized);
};
```

### 2. **Используйте sanitizeHTML для отображения**

```javascript
// ❌ Плохо
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ Хорошо
<div dangerouslySetInnerHTML={{ __html: sanitizeHTML(userContent) }} />
```

### 3. **Проверяйте rate limits**

```javascript
// ✅ Хорошо
const handleAction = () => {
  const limit = checkLimit();
  
  if (!limit.allowed) {
    toast.warning(`Подождите ${limit.retryAfter}с`);
    return;
  }

  performAction();
};
```

### 4. **Валидируйте файлы**

```javascript
const handleFileUpload = (file) => {
  const validation = validateFile(file, {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png']
  });

  if (!validation.valid) {
    toast.error(validation.error);
    return;
  }

  uploadFile(file);
};
```

## 🚨 Что НЕ делать:

### ❌ **Никогда не доверяйте пользовательскому вводу**

```javascript
// ❌ ОПАСНО!
const userInput = getUserInput();
eval(userInput); // НИКОГДА!
new Function(userInput)(); // НИКОГДА!
```

### ❌ **Не храните секреты в frontend**

```javascript
// ❌ ОПАСНО!
const API_KEY = 'sk-1234567890'; // Видно всем!

// ✅ Используйте backend
const response = await api.post('/generate'); // API ключ на сервере
```

### ❌ **Не отключайте CORS**

```javascript
// ❌ ОПАСНО!
fetch(url, { mode: 'no-cors' }); // Отключает защиту!

// ✅ Настройте CORS на сервере
```

## 📋 Checklist безопасности:

- [x] Rate Limiting для всех API endpoints
- [x] CSRF токены для всех форм
- [x] XSS санитизация всех инпутов
- [x] Валидация всех пользовательских данных
- [x] Безопасный API клиент
- [x] Error Boundary для отлова ошибок
- [ ] HTTPS в продакшене
- [ ] Content Security Policy (CSP)
- [ ] Secure cookies (httpOnly, secure, sameSite)
- [ ] Backend валидация (дублирование frontend)
- [ ] SQL Injection защита на backend
- [ ] Регулярные security audits

## 🔐 Дополнительные рекомендации:

### 1. **Content Security Policy (CSP)**

Добавить в `index.html`:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               font-src 'self' data:;">
```

### 2. **Secure Headers**

Настроить на сервере:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### 3. **Environment Variables**

```javascript
// .env.local (НЕ коммитить!)
VITE_API_URL=https://api.example.com
VITE_PUBLIC_KEY=pk_xxx

// Использование
const apiUrl = import.meta.env.VITE_API_URL;
```

### 4. **Dependency Security**

```bash
# Регулярно проверяйте зависимости
npm audit

# Автоматическое исправление
npm audit fix

# Обновление зависимостей
npm update
```

## 📊 Мониторинг безопасности:

1. **Логирование подозрительной активности**
2. **Алерты при превышении rate limits**
3. **Отслеживание неудачных попыток входа**
4. **Мониторинг необычных паттернов**

---

**Безопасность - это процесс, а не состояние. Регулярно обновляйте и проверяйте защиту!**

*Последнее обновление: 14 января 2026*
