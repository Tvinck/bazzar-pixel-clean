# 🎨 UI КОМПОНЕНТЫ - БИБЛИОТЕКА

## 📦 Созданные компоненты

### 1. Progress Components (`Progress.jsx`)

#### CircularProgress
Круговой прогресс-бар с анимацией.

```jsx
import { CircularProgress } from './components/ui/Progress';

<CircularProgress 
    progress={75} 
    size={120} 
    strokeWidth={8} 
    color="violet" 
/>
```

**Props:**
- `progress` (0-100) - процент выполнения
- `size` (px) - размер круга
- `strokeWidth` (px) - толщина линии
- `color` - violet | blue | green | amber | pink

#### LinearProgress
Линейный прогресс-бар.

```jsx
import { LinearProgress } from './components/ui/Progress';

<LinearProgress 
    progress={60} 
    height={8} 
    color="blue" 
    showLabel={true} 
/>
```

**Props:**
- `progress` (0-100) - процент выполнения
- `height` (px) - высота бара
- `color` - цвет градиента
- `showLabel` - показать процент

#### StepProgress
Пошаговый прогресс.

```jsx
import { StepProgress } from './components/ui/Progress';

<StepProgress 
    steps={['Upload', 'Process', 'Done']} 
    currentStep={1} 
/>
```

**Props:**
- `steps` - массив названий шагов
- `currentStep` - текущий шаг (0-based)

#### LoadingSpinner
Анимированный спиннер.

```jsx
import { LoadingSpinner } from './components/ui/Progress';

<LoadingSpinner size={40} color="violet" />
```

#### PulseLoader
Пульсирующий лоадер.

```jsx
import { PulseLoader } from './components/ui/Progress';

<PulseLoader color="blue" />
```

---

### 2. Animated Buttons (`AnimatedButtons.jsx`)

#### AnimatedButton
Основная кнопка с анимациями.

```jsx
import { AnimatedButton } from './components/ui/AnimatedButtons';
import { Sparkles } from 'lucide-react';

<AnimatedButton
    variant="primary"
    size="md"
    loading={false}
    icon={<Sparkles size={20} />}
    onClick={() => {}}
    fullWidth={false}
>
    Generate
</AnimatedButton>
```

**Variants:**
- `primary` - фиолетовый градиент
- `secondary` - черный/белый
- `outline` - обводка
- `ghost` - прозрачный
- `success` - зеленый
- `danger` - красный

**Sizes:**
- `sm` - маленькая
- `md` - средняя
- `lg` - большая

#### FloatingButton
Плавающая кнопка действия.

```jsx
import { FloatingButton } from './components/ui/AnimatedButtons';
import { Plus } from 'lucide-react';

<FloatingButton
    icon={<Plus size={24} />}
    onClick={() => {}}
    color="violet"
    position="bottom-right"
/>
```

**Positions:**
- `bottom-right`
- `bottom-left`
- `top-right`
- `top-left`

#### IconButton
Кнопка-иконка.

```jsx
import { IconButton } from './components/ui/AnimatedButtons';
import { Heart } from 'lucide-react';

<IconButton
    icon={<Heart size={20} />}
    onClick={() => {}}
    variant="ghost"
    size="md"
/>
```

#### ToggleButton
Переключатель.

```jsx
import { ToggleButton } from './components/ui/AnimatedButtons';

<ToggleButton
    checked={isEnabled}
    onChange={setIsEnabled}
    label="Enable Feature"
/>
```

#### ButtonGroup
Группа кнопок.

```jsx
import { ButtonGroup } from './components/ui/AnimatedButtons';

<ButtonGroup
    buttons={[
        { label: 'Day', value: 'day', icon: '☀️' },
        { label: 'Week', value: 'week', icon: '📅' },
        { label: 'Month', value: 'month', icon: '📆' }
    ]}
    selected={selected}
    onChange={setSelected}
/>
```

---

### 3. Animated Cards (`AnimatedCards.jsx`)

#### AnimatedCard
Базовая анимированная карточка.

```jsx
import { AnimatedCard } from './components/ui/AnimatedCards';

<AnimatedCard
    hover={true}
    gradient={false}
    glass={true}
    onClick={() => {}}
>
    <h3>Card Content</h3>
</AnimatedCard>
```

**Props:**
- `hover` - анимация при наведении
- `gradient` - градиентный фон
- `glass` - стеклянный эффект
- `onClick` - обработчик клика

#### FeatureCard
Карточка функции.

```jsx
import { FeatureCard } from './components/ui/AnimatedCards';
import { Sparkles } from 'lucide-react';

<FeatureCard
    icon={<Sparkles size={24} />}
    title="AI Generation"
    description="Create stunning images with AI"
    color="violet"
/>
```

#### StatsCard
Карточка статистики.

```jsx
import { StatsCard } from './components/ui/AnimatedCards';
import { Users } from 'lucide-react';

<StatsCard
    label="Total Users"
    value="1,234"
    icon={<Users size={20} />}
    trend={12}
    color="blue"
/>
```

**Props:**
- `trend` - процент изменения (положительный/отрицательный)

#### ImageCard
Карточка с изображением.

```jsx
import { ImageCard } from './components/ui/AnimatedCards';

<ImageCard
    image="https://..."
    title="Amazing Art"
    subtitle="By @username"
    badge="NEW"
    onClick={() => {}}
/>
```

#### NotificationCard
Карточка уведомления.

```jsx
import { NotificationCard } from './components/ui/AnimatedCards';

<NotificationCard
    type="success"
    title="Success!"
    message="Your image has been generated"
    onClose={() => {}}
/>
```

**Types:**
- `success` - зеленый
- `error` - красный
- `warning` - оранжевый
- `info` - синий

---

## 🎯 Примеры использования

### Генерация с прогрессом:

```jsx
import { LinearProgress, AnimatedButton } from './components/ui';

function GenerationView() {
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        // Симуляция прогресса
        for (let i = 0; i <= 100; i += 10) {
            setProgress(i);
            await new Promise(r => setTimeout(r, 200));
        }
        setLoading(false);
    };

    return (
        <div>
            <AnimatedButton
                variant="primary"
                loading={loading}
                onClick={handleGenerate}
            >
                Generate
            </AnimatedButton>
            
            {loading && (
                <LinearProgress 
                    progress={progress} 
                    showLabel={true} 
                />
            )}
        </div>
    );
}
```

### Галерея с карточками:

```jsx
import { ImageCard } from './components/ui/AnimatedCards';

function Gallery() {
    const images = [...]; // ваши изображения

    return (
        <div className="grid grid-cols-2 gap-4">
            {images.map(img => (
                <ImageCard
                    key={img.id}
                    image={img.url}
                    title={img.title}
                    subtitle={img.author}
                    badge={img.isNew ? 'NEW' : null}
                    onClick={() => openImage(img)}
                />
            ))}
        </div>
    );
}
```

### Статистика профиля:

```jsx
import { StatsCard } from './components/ui/AnimatedCards';
import { Image, Heart, Trophy } from 'lucide-react';

function ProfileStats() {
    return (
        <div className="grid grid-cols-3 gap-3">
            <StatsCard
                label="Creations"
                value="128"
                icon={<Image size={20} />}
                trend={15}
                color="violet"
            />
            <StatsCard
                label="Likes"
                value="4.2k"
                icon={<Heart size={20} />}
                trend={8}
                color="pink"
            />
            <StatsCard
                label="Level"
                value="12"
                icon={<Trophy size={20} />}
                color="amber"
            />
        </div>
    );
}
```

### Уведомления:

```jsx
import { NotificationCard } from './components/ui/AnimatedCards';
import { AnimatePresence } from 'framer-motion';

function Notifications() {
    const [notifications, setNotifications] = useState([]);

    const addNotification = (type, title, message) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, type, title, message }]);
        setTimeout(() => removeNotification(id), 5000);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            <AnimatePresence>
                {notifications.map(notif => (
                    <NotificationCard
                        key={notif.id}
                        type={notif.type}
                        title={notif.title}
                        message={notif.message}
                        onClose={() => removeNotification(notif.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}
```

---

## 🎨 Цветовая палитра

Все компоненты поддерживают единую цветовую схему:

- **violet** - `#8B5CF6` → `#A855F7`
- **blue** - `#3B82F6` → `#06B6D4`
- **green** - `#10B981` → `#059669`
- **amber** - `#F59E0B` → `#F97316`
- **pink** - `#EC4899` → `#F43F5E`

---

## ⚡ Производительность

### Оптимизация:
- Используйте `React.memo` для карточек в списках
- Lazy loading для изображений
- Виртуализация для больших списков

### Пример:
```jsx
import { memo } from 'react';

const MemoizedImageCard = memo(ImageCard);

// В списке
{images.map(img => (
    <MemoizedImageCard key={img.id} {...img} />
))}
```

---

## 🚀 Следующие шаги

1. Интегрировать в существующие компоненты
2. Добавить в CreationDrawer
3. Использовать в ProfileView
4. Добавить в HistoryView
5. Создать примеры в Storybook (опционально)

---

**Библиотека готова к использованию!** 🎉
