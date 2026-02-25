# T-Bank Payment Widgets Integration

## 📱 Новые способы оплаты

Добавлены официальные виджеты T-Bank для быстрой оплаты:

- **T-Pay** 🟡 - Оплата через приложение T-Bank
- **СБП** 🏦 - Система Быстрых Платежей
- **Mir Pay** 💳 - Оплата через Mir Pay (только Android)
- **SberPay** 🟢 - Оплата через SberPay (не работает в WebView)

## 🔧 Компоненты

### 1. TBankPaymentWidget (НОВЫЙ)
**Файл:** `src/components/TBankPaymentWidget.jsx`

Современный виджет с кнопками быстрой оплаты.

**Использование:**
```jsx
import TBankPaymentWidget from '../components/TBankPaymentWidget';

<TBankPaymentWidget
    amount={500}
    description="Пополнение баланса"
    userId={user.id}
    telegramId={user.telegram_id}
    userEmail={user.email}
    terminalKey={process.env.REACT_APP_TBANK_TERMINAL_KEY}
    widgetTypes={['tpay', 'sbp', 'mirpay', 'sberpay']}
    onSuccess={(status) => console.log('Payment success:', status)}
    onError={(error) => console.error('Payment error:', error)}
    displayParams={{
        gap: 0.5,
        height: 3.5,
        radius: 0.75,
        theme: {
            default: 'accent'
        }
    }}
/>
```

**Props:**
- `amount` (number, required) - Сумма в рублях
- `description` (string) - Описание платежа
- `userId` (string, required) - ID пользователя
- `telegramId` (number) - Telegram ID
- `userEmail` (string) - Email для чека
- `terminalKey` (string, required) - Terminal Key из личного кабинета T-Bank
- `widgetTypes` (array) - Массив типов виджетов: `['tpay', 'sbp', 'mirpay', 'sberpay']`
- `onSuccess` (function) - Callback при успешной оплате
- `onError` (function) - Callback при ошибке
- `displayParams` (object) - Параметры отображения кнопок

### 2. TBankWidget (СУЩЕСТВУЮЩИЙ)
**Файл:** `src/components/TBankWidget.jsx`

Классическая кнопка "Оплатить картой / СБП" с редиректом на платёжную форму.

**Использование:**
```jsx
import TBankWidget from '../components/TBankWidget';

<TBankWidget
    amount={500}
    description="Пополнение баланса"
    userId={user.id}
    telegramId={user.telegram_id}
    userEmail={user.email}
    recurrent={false}
/>
```

## 🔄 Backend API

### Endpoint: `/api/payment-init`

**Обновления:**
- ✅ Добавлен параметр `connectionType` (для виджетов должен быть `'Widget'`)
- ✅ Добавлен параметр `paymentType` (для аналитики)

**Request Body:**
```json
{
    "amount": 500,
    "description": "Пополнение баланса",
    "userId": "uuid-here",
    "telegramId": 123456789,
    "userEmail": "user@example.com",
    "connectionType": "Widget",
    "paymentType": "tpay"
}
```

**Response:**
```json
{
    "paymentUrl": "https://securepayments.tinkoff.ru/...",
    "paymentId": "123456",
    "orderId": "BZR_12345678"
}
```

## 📋 Интеграция в ProfileView

### Вариант 1: Только виджеты (рекомендуется)
```jsx
import TBankPaymentWidget from '../components/TBankPaymentWidget';

<TBankPaymentWidget
    amount={paymentAmount}
    description="Пополнение баланса Pixel AI"
    userId={user.id}
    telegramId={user.telegram_id}
    userEmail={user.email}
    onSuccess={() => {
        // Обновить баланс
        fetchBalance();
    }}
/>
```

### Вариант 2: Виджеты + классическая кнопка
```jsx
import TBankPaymentWidget from '../components/TBankPaymentWidget';
import TBankWidget from '../components/TBankWidget';

{/* Быстрая оплата */}
<TBankPaymentWidget
    amount={paymentAmount}
    userId={user.id}
    telegramId={user.telegram_id}
    userEmail={user.email}
    widgetTypes={['tpay', 'sbp']} // Только T-Pay и СБП
/>

{/* Разделитель */}
<div className="relative my-6">
    <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
    </div>
    <div className="relative flex justify-center text-xs">
        <span className="bg-white dark:bg-slate-900 px-3 text-slate-500">или</span>
    </div>
</div>

{/* Классическая оплата */}
<TBankWidget
    amount={paymentAmount}
    description="Пополнение баланса"
    userId={user.id}
    telegramId={user.telegram_id}
    userEmail={user.email}
/>
```

## 🎨 Кастомизация виджетов

### Темы кнопок
```javascript
displayParams: {
    theme: {
        default: 'accent',      // Все кнопки accent
        tpay: 'accent-black',   // T-Pay черная
        sbp: 'filled',          // СБП заполненная
        mirpay: 'outlined',     // Mir Pay контурная
        sberpay: 'accent'       // SberPay accent
    }
}
```

**Доступные темы:**
- `accent` - Акцентная (желтая для T-Pay)
- `accent-black` - Черная акцентная (только T-Pay)
- `filled` - Заполненная
- `outlined` - Контурная

### Размеры и отступы
```javascript
displayParams: {
    gap: 0.5,      // Расстояние между кнопками (rem)
    height: 3.5,   // Высота кнопки (rem)
    radius: 0.75   // Закругление углов (rem)
}
```

## 🔐 Environment Variables

Добавьте в `.env`:
```bash
REACT_APP_TBANK_TERMINAL_KEY=your_terminal_key_here
```

## 📊 Статусы платежей

Виджет автоматически отслеживает статусы:

- `SUCCESS` - Оплата успешна
- `CANCELED` - Отменено пользователем
- `REJECTED` - Отклонено банком
- `PROCESSING` - В обработке
- `PROCESSING_ERROR` - Ошибка обработки
- `EXPIRED` - Истек срок
- `REFUNDED` - Возврат
- `NEW` - Новый платеж

## 🧪 Тестирование

### Demo режим
По умолчанию используются demo credentials:
```javascript
TERMINAL_KEY = '1768938209941DEMO'
PASSWORD = 'DFgxaoJ38xAjUrsJ'
```

### Тестовые карты
- **Успешная оплата:** `4300000000000777`
- **Отклонение:** `4300000000000002`
- **3DS:** `4300000000000431`

## 📱 Особенности платформ

### Telegram WebApp
- ✅ T-Pay работает
- ✅ СБП работает
- ✅ Mir Pay работает (только Android)
- ❌ SberPay НЕ работает в WebView

### Web Browser
- ✅ Все виджеты работают

## 🚀 Deployment

1. Убедитесь что T-Bank Integration Script загружается:
```html
<script src="https://integrationjs.tbank.ru/integration.js"></script>
```

2. Включите нужные способы оплаты в личном кабинете T-Bank

3. Настройте webhook URL:
```
https://your-domain.com/api/webhook
```

4. Добавьте Success/Fail URLs:
```
Success: https://t.me/Pixel_ai_bot?startapp=payment_success__{orderId}
Fail: https://t.me/Pixel_ai_bot?startapp=payment_fail
```

## 📚 Документация T-Bank

- [Виджеты оплаты](https://www.tbank.ru/kassa/dev/payments/widget/)
- [API Инициализации](https://www.tbank.ru/kassa/dev/payments/init/)
- [Webhook уведомления](https://www.tbank.ru/kassa/dev/notifications/)

## ✅ Checklist интеграции

- [ ] Создан компонент `TBankPaymentWidget.jsx`
- [ ] Обновлен `api/payment-init.js` (добавлен `connectionType`)
- [ ] Добавлен Terminal Key в `.env`
- [ ] Включены способы оплаты в личном кабинете T-Bank
- [ ] Настроен webhook
- [ ] Протестированы все виджеты
- [ ] Добавлена обработка статусов
- [ ] Проверена работа в Telegram WebApp

---

**Дата создания:** 25 января 2026  
**Статус:** ✅ Готово к использованию
