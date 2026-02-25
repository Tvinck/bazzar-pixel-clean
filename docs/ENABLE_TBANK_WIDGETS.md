# 🚀 Как включить виджеты T-Bank (T-Pay, СБП, Mir Pay)

## ⚠️ Текущее состояние

**Виджеты НЕ отображаются** потому что используются **DEMO credentials**.

Виджеты T-Bank **НЕ работают с demo Terminal Key**. Они требуют production ключи.

## ✅ Что нужно сделать:

### 1. Получить Production Terminal Key

1. Зайдите в личный кабинет T-Bank Касса: https://www.tbank.ru/kassa/
2. Перейдите в раздел **"Настройки"** → **"Терминалы"**
3. Скопируйте **Terminal Key** (НЕ demo!)

### 2. Добавить Terminal Key в проект

Создайте/обновите файл `.env` в корне проекта:

```bash
REACT_APP_TBANK_TERMINAL_KEY=ваш_production_terminal_key
```

**Важно:** Не коммитьте `.env` в git! Добавьте в `.gitignore`:
```
.env
.env.local
```

### 3. Включить способы оплаты в личном кабинете

В личном кабинете T-Bank включите нужные способы:
- ✅ T-Pay
- ✅ СБП (Система Быстрых Платежей)
- ✅ Mir Pay
- ✅ SberPay (опционально)

### 4. Настроить Webhook

В настройках терминала укажите:
```
Notification URL: https://bazzar-pixel-clean-4zm4.vercel.app/api/webhook
```

### 5. Перезапустить приложение

```bash
npm run dev
```

Или пересобрать для production:
```bash
npm run build
```

## 🔍 Проверка

После настройки откройте консоль браузера (F12) и проверьте:

```javascript
// Должно быть true
console.log(!!window.PaymentIntegration);

// Должен быть ваш production key (не DEMO)
console.log(process.env.REACT_APP_TBANK_TERMINAL_KEY);
```

## 📱 Что увидят пользователи

### С production ключом:
```
┌─────────────────────────────────┐
│  [T-Pay]                        │ ← Желтая кнопка
├─────────────────────────────────┤
│  [СБП]                          │ ← Кнопка СБП
├─────────────────────────────────┤
│  [Mir Pay]                      │ ← Кнопка Mir Pay
└─────────────────────────────────┘

        ───── или ─────

┌─────────────────────────────────┐
│  💳 Оплатить картой / СБП       │ ← Классическая
└─────────────────────────────────┘
```

### С demo ключом (сейчас):
```
┌─────────────────────────────────┐
│  💳 Оплатить картой / СБП       │ ← Только классическая
└─────────────────────────────────┘
```

## 🐛 Troubleshooting

### Виджеты не появляются

1. **Проверьте Terminal Key:**
   ```javascript
   // В консоли браузера
   console.log(process.env.REACT_APP_TBANK_TERMINAL_KEY);
   // Не должно быть undefined или содержать 'DEMO'
   ```

2. **Проверьте загрузку скрипта:**
   ```javascript
   console.log(window.PaymentIntegration);
   // Должен быть объект, не undefined
   ```

3. **Проверьте Network tab:**
   - Должен загружаться `https://integrationjs.tbank.ru/integration.js`
   - Статус 200 OK

4. **Проверьте Console:**
   - Не должно быть ошибок от T-Bank Integration

### Ошибка "No Terminal Key"

Это нормально для demo режима. Виджет автоматически скрывается.

Решение: Добавьте production Terminal Key (см. шаг 1-2 выше).

## 📚 Дополнительная информация

- [Документация T-Bank Widgets](https://www.tbank.ru/kassa/dev/payments/widget/)
- [Полная документация интеграции](./TBANK_WIDGETS_INTEGRATION.md)

## ✅ Checklist

- [ ] Получен production Terminal Key
- [ ] Добавлен в `.env` файл
- [ ] `.env` добавлен в `.gitignore`
- [ ] Включены способы оплаты в личном кабинете
- [ ] Настроен Webhook URL
- [ ] Приложение перезапущено
- [ ] Виджеты отображаются в интерфейсе

---

**Текущий статус:** ⏳ Ожидает production Terminal Key  
**После настройки:** ✅ Виджеты будут работать автоматически
