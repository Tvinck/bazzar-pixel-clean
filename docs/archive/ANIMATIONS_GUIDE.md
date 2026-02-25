# 🎨 Библиотека Анимаций - Telegram Style

## 📚 Обзор

Мы используем **3 мощные библиотеки** для создания плавных, приятных анимаций как в Telegram:

1. **Framer Motion** - Декларативные React анимации
2. **GSAP** - Профессиональные timeline анимации
3. **React Spring** - Физические, пружинные анимации

---

## 🎯 1. Telegram Animations (Framer Motion)

### Готовые компоненты:

#### TelegramCard - Карточка с hover эффектом
```jsx
import { TelegramCard } from '../components/TelegramAnimations';

<TelegramCard onClick={() => console.log('clicked')}>
  <img src="image.jpg" />
  <h3>Заголовок</h3>
</TelegramCard>
```

#### TelegramButton - Кнопка с ripple эффектом
```jsx
import { TelegramButton } from '../components/TelegramAnimations';

<TelegramButton variant="primary" onClick={handleClick}>
  Создать
</TelegramButton>

<TelegramButton variant="secondary" onClick={handleClick}>
  Отмена
</TelegramButton>
```

#### TelegramModal - Модальное окно снизу
```jsx
import { TelegramModal } from '../components/TelegramAnimations';

<TelegramModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
  <div className="p-6">
    <h2>Настройки</h2>
    {/* Контент */}
  </div>
</TelegramModal>
```

#### TelegramListItem - Элемент списка с анимацией
```jsx
import { TelegramListItem } from '../components/TelegramAnimations';

{items.map((item, i) => (
  <TelegramListItem key={i} delay={i * 0.1}>
    <div>{item.name}</div>
  </TelegramListItem>
))}
```

#### TelegramFAB - Плавающая кнопка действия
```jsx
import { TelegramFAB } from '../components/TelegramAnimations';
import { Plus } from 'lucide-react';

<TelegramFAB icon={<Plus />} onClick={handleCreate} />
```

#### TelegramBadge - Значок уведомлений
```jsx
import { TelegramBadge } from '../components/TelegramAnimations';

<div className="relative">
  <button>Уведомления</button>
  <TelegramBadge count={5} />
</div>
```

#### TelegramProgress - Прогресс бар
```jsx
import { TelegramProgress } from '../components/TelegramAnimations';

<TelegramProgress progress={75} />
```

#### TelegramTyping - Индикатор печати
```jsx
import { TelegramTyping } from '../components/TelegramAnimations';

{isTyping && <TelegramTyping />}
```

#### TelegramSwipeCard - Свайпаемая карточка
```jsx
import { TelegramSwipeCard } from '../components/TelegramAnimations';

<TelegramSwipeCard
  onSwipeLeft={() => console.log('Dislike')}
  onSwipeRight={() => console.log('Like')}
>
  <img src="image.jpg" />
</TelegramSwipeCard>
```

### Готовые пресеты анимаций:

```jsx
import { telegramAnimations } from '../components/TelegramAnimations';
import { motion } from 'framer-motion';

// Fade in снизу
<motion.div {...telegramAnimations.fadeInUp}>
  Контент
</motion.div>

// Scale pop
<motion.div {...telegramAnimations.scalePop}>
  Контент
</motion.div>

// Slide справа
<motion.div {...telegramAnimations.slideFromRight}>
  Контент
</motion.div>

// Bounce
<motion.div {...telegramAnimations.bounce}>
  Контент
</motion.div>
```

---

## ⚡ 2. GSAP Animations

### Магнитная кнопка:
```jsx
import { useMagneticButton } from '../hooks/useGSAPAnimations';

function MyButton() {
  const buttonRef = useMagneticButton(0.3); // strength

  return (
    <button ref={buttonRef} className="magnetic-btn">
      Наведи на меня
    </button>
  );
}
```

### Stagger анимация для списков:
```jsx
import { useStaggerAnimation } from '../hooks/useGSAPAnimations';

function MyList({ items }) {
  const containerRef = useStaggerAnimation(items, 0.1); // delay

  return (
    <div ref={containerRef}>
      {items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

### Parallax scroll:
```jsx
import { useParallaxScroll } from '../hooks/useGSAPAnimations';

function ParallaxImage() {
  const imageRef = useParallaxScroll(0.5); // speed

  return (
    <img ref={imageRef} src="bg.jpg" />
  );
}
```

### Анимация текста (печать):
```jsx
import { useTextReveal } from '../hooks/useGSAPAnimations';

function TypedText() {
  const textRef = useTextReveal('Привет, мир!', 1); // duration

  return <h1 ref={textRef}></h1>;
}
```

### Плавающая анимация:
```jsx
import { useFloatingAnimation } from '../hooks/useGSAPAnimations';

function FloatingIcon() {
  const iconRef = useFloatingAnimation(10, 2); // distance, duration

  return <div ref={iconRef}>✨</div>;
}
```

### Пульсация:
```jsx
import { usePulseAnimation } from '../hooks/useGSAPAnimations';

function PulsingDot() {
  const dotRef = usePulseAnimation(1.2, 1); // scale, duration

  return <div ref={dotRef} className="w-4 h-4 bg-blue-500 rounded-full" />;
}
```

### Глитч эффект:
```jsx
import { useGlitchEffect } from '../hooks/useGSAPAnimations';
import { useState } from 'react';

function GlitchText() {
  const [trigger, setTrigger] = useState(false);
  const textRef = useGlitchEffect(trigger);

  return (
    <h1 ref={textRef} onClick={() => setTrigger(!trigger)}>
      Glitch!
    </h1>
  );
}
```

### Timeline анимации:
```jsx
import { createSuccessAnimation } from '../hooks/useGSAPAnimations';

function SuccessButton() {
  const handleSuccess = () => {
    const element = document.querySelector('.success-icon');
    createSuccessAnimation(element);
  };

  return (
    <button onClick={handleSuccess}>
      <span className="success-icon">✓</span>
    </button>
  );
}
```

---

## 🌊 3. React Spring Animations

### Упругая карточка:
```jsx
import { SpringCard } from '../components/SpringAnimations';

<SpringCard onClick={handleClick}>
  <img src="image.jpg" />
  <h3>Заголовок</h3>
</SpringCard>
```

### Перетаскиваемая карточка:
```jsx
import { DraggableCard } from '../components/SpringAnimations';

<DraggableCard onDismiss={() => console.log('Dismissed')}>
  <div>Потяни меня!</div>
</DraggableCard>
```

### Упругая кнопка:
```jsx
import { ElasticButton } from '../components/SpringAnimations';

<ElasticButton onClick={handleClick}>
  Нажми меня
</ElasticButton>
```

### Анимированный счетчик:
```jsx
import { SpringCounter } from '../components/SpringAnimations';

<SpringCounter value={1250} />
```

### Прогресс бар:
```jsx
import { SpringProgress } from '../components/SpringAnimations';

<SpringProgress progress={75} />
```

### Плавающий элемент:
```jsx
import { FloatingElement } from '../components/SpringAnimations';

<FloatingElement>
  <img src="icon.png" />
</FloatingElement>
```

### Пульсирующая точка:
```jsx
import { PulsingDot } from '../components/SpringAnimations';

<PulsingDot color="#3390ec" size={12} />
```

### Тряска (для ошибок):
```jsx
import { ShakeElement } from '../components/SpringAnimations';
import { useState } from 'react';

function ErrorInput() {
  const [error, setError] = useState(false);

  return (
    <ShakeElement trigger={error}>
      <input type="text" />
    </ShakeElement>
  );
}
```

### Аккордеон:
```jsx
import { SpringAccordion } from '../components/SpringAnimations';

<SpringAccordion isOpen={isOpen}>
  <div>Скрытый контент</div>
</SpringAccordion>
```

### Flip карточка:
```jsx
import { FlipCard } from '../components/SpringAnimations';

<FlipCard
  front={<div>Лицевая сторона</div>}
  back={<div>Обратная сторона</div>}
/>
```

### Уведомление:
```jsx
import { SlideNotification } from '../components/SpringAnimations';

<SlideNotification isVisible={showNotification}>
  <div className="bg-green-500 text-white px-4 py-2 rounded-lg">
    Успешно сохранено!
  </div>
</SlideNotification>
```

### Морфинг blob:
```jsx
import { MorphingBlob } from '../components/SpringAnimations';

<MorphingBlob className="absolute -z-10" />
```

---

## 🎯 Когда что использовать?

### Framer Motion (Telegram Animations)
✅ **Используй для:**
- Простых анимаций появления/исчезновения
- Модальных окон и drawer'ов
- Hover эффектов
- Базовых переходов между страницами

### GSAP
✅ **Используй для:**
- Сложных timeline анимаций
- Scroll-triggered анимаций
- Морфинга SVG
- Профессиональных эффектов
- Последовательных анимаций

### React Spring
✅ **Используй для:**
- Физических, естественных движений
- Перетаскивания элементов
- Упругих эффектов
- Интерактивных компонентов
- Плавных переходов чисел

---

## 🎨 Примеры комбинирования

### Пример 1: Карточка шаблона с полным набором анимаций

```jsx
import { TelegramCard, TelegramBadge } from '../components/TelegramAnimations';
import { useMagneticButton } from '../hooks/useGSAPAnimations';
import { SpringCounter } from '../components/SpringAnimations';

function TemplateCard({ template }) {
  const cardRef = useMagneticButton(0.2);

  return (
    <TelegramCard className="relative">
      <div ref={cardRef}>
        <img src={template.image} />
        <h3>{template.name}</h3>
        <div className="flex items-center gap-2">
          <span>Использований:</span>
          <SpringCounter value={template.uses} />
        </div>
        <TelegramBadge count={template.newCount} />
      </div>
    </TelegramCard>
  );
}
```

### Пример 2: Страница с параллаксом и stagger анимацией

```jsx
import { useParallaxScroll, useStaggerAnimation } from '../hooks/useGSAPAnimations';
import { TelegramListItem } from '../components/TelegramAnimations';

function GalleryPage({ items }) {
  const bgRef = useParallaxScroll(0.3);
  const listRef = useStaggerAnimation(items, 0.1);

  return (
    <div className="relative">
      <div ref={bgRef} className="absolute inset-0 bg-gradient-to-b from-blue-500 to-purple-600" />
      
      <div ref={listRef} className="relative z-10">
        {items.map((item, i) => (
          <TelegramListItem key={i} delay={i * 0.1}>
            <div>{item.name}</div>
          </TelegramListItem>
        ))}
      </div>
    </div>
  );
}
```

### Пример 3: Кнопка генерации с полным feedback

```jsx
import { TelegramButton } from '../components/TelegramAnimations';
import { createSuccessAnimation } from '../hooks/useGSAPAnimations';
import { ElasticButton } from '../components/SpringAnimations';
import { useState } from 'react';

function GenerateButton() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Haptic feedback
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium');
    
    // Generate...
    await generateImage();
    
    // Success animation
    const icon = document.querySelector('.success-icon');
    createSuccessAnimation(icon);
    
    setIsGenerating(false);
  };

  return (
    <ElasticButton onClick={handleGenerate} disabled={isGenerating}>
      {isGenerating ? (
        <TelegramTyping />
      ) : (
        <>
          <span className="success-icon">✨</span>
          Создать
        </>
      )}
    </ElasticButton>
  );
}
```

---

## 📊 Performance Tips

1. **Используй `will-change`** для элементов с анимациями:
```css
.animated-element {
  will-change: transform, opacity;
}
```

2. **Ограничивай количество одновременных анимаций** (макс 3-5)

3. **Используй `transform` и `opacity`** вместо `width`, `height`, `top`, `left`

4. **Отключай анимации на слабых устройствах**:
```jsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

5. **Используй `AnimatePresence`** для unmount анимаций:
```jsx
import { AnimatePresence } from 'framer-motion';

<AnimatePresence>
  {isVisible && <Component />}
</AnimatePresence>
```

---

## 🚀 Готовые паттерны

### Loading State:
```jsx
import { TelegramSkeleton, TelegramTyping } from '../components/TelegramAnimations';

{isLoading ? (
  <div className="space-y-4">
    <TelegramSkeleton height="200px" />
    <TelegramSkeleton height="100px" />
    <TelegramTyping />
  </div>
) : (
  <Content />
)}
```

### Success Feedback:
```jsx
import { SlideNotification } from '../components/SpringAnimations';
import { createSuccessAnimation } from '../hooks/useGSAPAnimations';

// Show notification
<SlideNotification isVisible={success}>
  <div className="bg-green-500 text-white px-4 py-2 rounded-lg">
    ✓ Успешно!
  </div>
</SlideNotification>

// Animate icon
createSuccessAnimation(iconElement);

// Haptic
window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
```

### Error Feedback:
```jsx
import { ShakeElement } from '../components/SpringAnimations';

<ShakeElement trigger={error}>
  <input className="border-red-500" />
</ShakeElement>

// Haptic
window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
```

---

## 🎨 Цвета Telegram

```css
/* Primary Blue */
--tg-blue: #3390ec;
--tg-blue-dark: #2b7fd1;

/* Background */
--tg-bg: #0f0f0f;
--tg-bg-secondary: #1c1c1e;

/* Text */
--tg-text: #ffffff;
--tg-text-secondary: rgba(255, 255, 255, 0.6);

/* Accent */
--tg-accent: #8a2be2;
--tg-accent-pink: #ec4899;
```

---

## ✨ Итого

Теперь у нас есть **полный набор инструментов** для создания **плавных, приятных анимаций** как в Telegram! 🎉

- ✅ 20+ готовых компонентов
- ✅ 15+ хуков для анимаций
- ✅ 3 мощные библиотеки
- ✅ Физические, естественные движения
- ✅ Профессиональные эффекты
- ✅ Оптимизированная производительность
