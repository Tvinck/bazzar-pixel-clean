# 🎨 UX/UI Компоненты - Руководство по использованию

## ✅ Реализовано:

### 1. **Toast Notifications (Тосты)**

```javascript
import { useToast } from './context/ToastContext';

function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success('Изображение успешно создано!');
  };

  const handleError = () => {
    toast.error('Произошла ошибка при генерации');
  };

  const handleWarning = () => {
    toast.warning('У вас заканчиваются кредиты');
  };

  const handleInfo = () => {
    toast.info('Новое обновление доступно!', 5000); // 5 секунд
  };
}
```

### 2. **Skeletons (Скелетоны загрузки)**

```javascript
import { 
  Skeleton, 
  CardSkeleton, 
  ImageCardSkeleton,
  GalleryGridSkeleton,
  ListSkeleton 
} from './components/ui/Skeletons';

function MyComponent() {
  const { isLoading, data } = useQuery();

  if (isLoading) {
    return <GalleryGridSkeleton count={6} />;
  }

  return <div>{/* Ваш контент */}</div>;
}
```

### 3. **Empty States (Пустые состояния)**

```javascript
import { 
  EmptyHistory, 
  EmptyGallery, 
  EmptyNotifications,
  EmptySearch 
} from './components/ui/EmptyStates';

function HistoryView() {
  const { creations } = useCreations();

  if (creations.length === 0) {
    return <EmptyHistory onCreateClick={() => openCreation()} />;
  }

  return <div>{/* Список творений */}</div>;
}
```

### 4. **Error Boundary (Обработка ошибок)**

```javascript
// Уже интегрирован в App.jsx
// Автоматически ловит все ошибки в приложении

// Для использования в компонентах:
import { useErrorHandler } from './components/ErrorBoundary';

function MyComponent() {
  const { error, handleError, clearError } = useErrorHandler();

  const fetchData = async () => {
    try {
      const data = await api.getData();
    } catch (err) {
      handleError(err, { context: 'fetching data' });
    }
  };
}
```

### 5. **Progress Indicators (Индикаторы прогресса)**

```javascript
import { 
  LinearProgress, 
  CircularProgress,
  GenerationProgress,
  Spinner,
  DotsLoader 
} from './components/ui/Progress';

// Линейный прогресс
<LinearProgress value={60} max={100} showLabel />

// Круговой прогресс
<CircularProgress value={75} max={100} size={64} />

// Прогресс генерации с шагами
<GenerationProgress 
  currentStep={2}
  steps={[
    'Инициализация...',
    'Обработка промпта...',
    'Генерация изображения...',
    'Финализация...'
  ]}
  message="Создаем ваш шедевр..."
/>

// Простой спиннер
<Spinner size={24} />

// Точки загрузки
<DotsLoader />
```

## 📝 Примеры интеграции:

### Пример 1: GalleryView с скелетонами

```javascript
function GalleryView() {
  const { data: creations, isLoading } = useQuery('creations');
  const toast = useToast();

  if (isLoading) {
    return <GalleryGridSkeleton count={6} />;
  }

  if (!creations || creations.length === 0) {
    return <EmptyGallery onExploreClick={() => navigate('/explore')} />;
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {creations.map(creation => (
        <ImageCard key={creation.id} {...creation} />
      ))}
    </div>
  );
}
```

### Пример 2: Генерация с прогрессом

```javascript
function CreationDrawer() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const toast = useToast();

  const steps = [
    'Инициализация AI...',
    'Анализ промпта...',
    'Генерация изображения...',
    'Применение стилей...',
    'Финализация...'
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(i);
        setProgress((i + 1) / steps.length * 100);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      toast.success('Изображение успешно создано!');
    } catch (error) {
      toast.error('Ошибка при генерации');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <GenerationProgress 
        currentStep={currentStep}
        steps={steps}
        message="Создаем ваш шедевр..."
      />
    );
  }

  return <div>{/* Форма создания */}</div>;
}
```

### Пример 3: Поиск с empty state

```javascript
function SearchView() {
  const [query, setQuery] = useState('');
  const { data: results, isLoading } = useSearch(query);

  if (isLoading) {
    return <ListSkeleton count={5} />;
  }

  if (query && results.length === 0) {
    return <EmptySearch query={query} />;
  }

  return (
    <div>
      {results.map(item => (
        <SearchResultItem key={item.id} {...item} />
      ))}
    </div>
  );
}
```

## 🎯 Best Practices:

1. **Всегда показывайте скелетоны** вместо пустого экрана при загрузке
2. **Используйте тосты** для feedback пользователю
3. **Показывайте прогресс** для длительных операций
4. **Empty states** должны быть дружелюбными и с CTA
5. **Error boundary** ловит критические ошибки автоматически

## 🚀 Что дальше:

- [ ] Добавить анимации для empty states
- [ ] Создать библиотеку иллюстраций
- [ ] Добавить звуковые эффекты для тостов
- [ ] A/B тестирование сообщений
- [ ] Аналитика взаимодействий

---

*Все компоненты уже интегрированы и готовы к использованию!*
