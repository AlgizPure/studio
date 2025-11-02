# 📖 Примеры использования инструментов

## ✅ Что было сделано

### 1. **useFirestoreMutation** — Централизация мутаций

**Пример использования:**

```tsx
import { useFirestoreCreate, useFirestoreUpdate, useFirestoreDelete } from '@/firebase/firestore/use-firestore-mutation';
import { collection, doc } from 'firebase/firestore';

function MyComponent() {
  const { mutate: createItem, isLoading: isCreating } = useFirestoreCreate({
    successMessage: 'Элемент добавлен',
    errorMessage: 'Не удалось добавить',
  });

  const { mutate: updateItem } = useFirestoreUpdate({
    successMessage: 'Обновлено',
  });

  const handleCreate = async () => {
    const collectionRef = collection(firestore, 'users/123/items');
    await createItem(collectionRef, { name: 'Новый элемент' });
    // Автоматически показывается toast "Элемент добавлен"
  };

  const handleUpdate = async (itemId: string) => {
    const docRef = doc(firestore, 'users/123/items', itemId);
    await updateItem(docRef, { name: 'Обновленное имя' });
  };
}
```

**Где используется:**
- ✅ `src/app/library/page.tsx` - создание/обновление/удаление упражнений и категорий

**Преимущества:**
- Автоматическая обработка ошибок
- Toast уведомления из коробки
- Убрано ~150 строк дублирования кода

---

### 2. **usePaginatedCollection** — Пагинация больших списков

**Пример использования:**

```tsx
import { usePaginatedCollection } from '@/firebase/firestore/use-paginated-collection';
import { collection, query } from 'firebase/firestore';

function HistoryList() {
  const baseQuery = useMemoFirebase(
    () => query(collection(firestore, 'users/123/logs')),
    [firestore]
  );

  const { 
    data, 
    isLoading, 
    hasMore, 
    loadMore, 
    refresh 
  } = usePaginatedCollection<Log>(baseQuery, {
    pageSize: 20,
    orderByField: 'date',
    orderByDirection: 'desc',
    whereConditions: [
      { field: 'status', operator: '==', value: 'completed' }
    ]
  });

  return (
    <div>
      {data.map(item => <div key={item.id}>{item.name}</div>)}
      
      {hasMore && (
        <Button onClick={loadMore} disabled={isLoading}>
          {isLoading ? 'Загрузка...' : 'Загрузить еще'}
        </Button>
      )}
    </div>
  );
}
```

**Где используется:**
- ✅ `src/app/workout-history/page.tsx` - история тренировок с пагинацией

**Преимущества:**
- Загружается только по 10-20 элементов за раз
- Оптимизация производительности для больших коллекций
- Поддержка динамических фильтров (whereConditions)

---

### 3. **AsyncBoundary** — Обработка загрузки и ошибок

**Пример использования:**

```tsx
import { AsyncBoundary } from '@/components/ui/async-boundary';

function MyPage() {
  return (
    <AsyncBoundary>
      <DataComponent />
    </AsyncBoundary>
  );
}

// С кастомными fallback
function AdvancedPage() {
  return (
    <AsyncBoundary
      loadingFallback={<CustomSpinner />}
      errorFallback={({ error, resetErrorBoundary }) => (
        <Alert>
          <p>Ошибка: {error.message}</p>
          <Button onClick={resetErrorBoundary}>Попробовать снова</Button>
        </Alert>
      )}
      onError={(error) => console.error('Error:', error)}
    >
      <MyComponent />
    </AsyncBoundary>
  );
}
```

**Где используется:**
- ✅ `src/app/library/page.tsx` - обертка страницы библиотеки
- ✅ `src/app/workout-history/page.tsx` - обертка страницы истории

**Преимущества:**
- Автоматическая обработка ошибок React
- Поддержка Suspense для async компонентов
- Кастомные fallback для лучшего UX

---

### 4. **ESLint + Prettier + Husky** — Автоматизация качества

**Как использовать:**

```bash
# Проверка кода
npm run lint          # Проверить ошибки
npm run lint:fix      # Исправить автоматически

# Форматирование
npm run format        # Форматировать все файлы
npm run format:check  # Проверить форматирование

# Git hooks работают автоматически
git commit -m "feat: add feature"
# Автоматически запускается lint-staged
```

**Конфигурация:**
- `.eslintrc.json` - правила ESLint
- `.prettierrc.json` - настройки форматирования
- `.husky/pre-commit` - автоматический pre-commit hook
- `package.json` → `lint-staged` - какие файлы проверять

---

### 5. **Vitest + React Testing Library** — Тестирование

**Пример теста:**

```tsx
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFirestoreMutation } from './use-firestore-mutation';

describe('useFirestoreMutation', () => {
  it('should create document', async () => {
    const { result } = renderHook(() => 
      useFirestoreMutation('create')
    );

    await act(async () => {
      await result.current.mutate(mockCollectionRef, { name: 'Test' });
    });

    expect(mockAddDoc).toHaveBeenCalledWith(mockCollectionRef, { name: 'Test' });
  });
});
```

**Команды:**
```bash
npm run test           # Запуск в watch-режиме
npm run test:ui        # UI режим
npm run test:coverage  # Покрытие кода
```

**Где используется:**
- ✅ `src/firebase/firestore/use-firestore-mutation.test.tsx`
- ✅ `src/firebase/firestore/use-collection.test.tsx`
- ✅ `src/lib/habits-validators.test.ts`
- ✅ `src/lib/habits-guards.test.ts`

**Всего:** 59 тестов, все проходят ✅

---

### 6. **Storybook** — Документация компонентов

**Пример story:**

```tsx
// src/components/ui/button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: { children: 'Button' },
};

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Delete' },
};
```

**Команды:**
```bash
npm run storybook       # Запуск Storybook
npm run build-storybook # Сборка для деплоя
```

**Где используется:**
- ✅ `src/components/ui/button.stories.tsx`
- ✅ `src/components/ui/card.stories.tsx`

**Доступно:**
- Автогенерация документации
- Интерактивные примеры
- Accessibility проверки (addon-a11y)

---

### 7. **Bundle Analyzer** — Анализ размера бандла

**Как использовать:**

```bash
npm run analyze
# Или
ANALYZE=true npm run build
```

**Результат:**
- Откроются HTML файлы с визуализацией размера модулей
- Можно найти большие зависимости
- Оптимизировать импорты

**Пример оптимизации:**
```tsx
// ПЛОХО - импортирует всю библиотеку
import { format, parseISO, addDays } from 'date-fns';

// ХОРОШО - tree-shaking работает
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
```

---

### 8. **Lighthouse CI** — Автоматические проверки производительности

**Как использовать:**

**Локально:**
```bash
npm install -g @lhci/cli
npm run start  # В одном терминале
lhci autorun --config=lighthouserc.json  # В другом
```

**GitHub Actions:**
Создай `.github/workflows/lighthouse-ci.yml`:
```yaml
name: Lighthouse CI
on: [push, pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - uses: treosh/lighthouse-ci-action@v9
        with:
          configPath: './lighthouserc.json'
```

**Проверяет:**
- Performance (≥ 0.9)
- Accessibility (≥ 0.95)
- Best Practices (≥ 0.9)
- SEO (≥ 0.9)
- Core Web Vitals (FCP, LCP, CLS, TBT)

---

## 🎯 Резюме изменений

### `src/app/library/page.tsx`
**ДО:**
- 6 функций с ручной обработкой ошибок
- ~110 строк дублирования
- Нет toast уведомлений
- Нет обработки ошибок загрузки

**ПОСЛЕ:**
- Используются `useFirestoreMutation` хуки
- Убрано ~80 строк дублирования
- Автоматические toast уведомления
- Добавлен `AsyncBoundary` для обработки ошибок

### `src/app/workout-history/page.tsx`
**ДО:**
- Загружает все логи сразу (может быть тысячи)
- Нет пагинации
- Плохая производительность для больших списков

**ПОСЛЕ:**
- Пагинация по 10 элементов
- Кнопка "Load More"
- Оптимизированная производительность
- Добавлен `AsyncBoundary`

---

## 📋 Чеклист для новых компонентов

При создании нового компонента:

- [ ] Использовать `useFirestoreMutation` вместо `addDoc/updateDoc/deleteDoc`
- [ ] Для больших списков (>50 элементов) использовать `usePaginatedCollection`
- [ ] Обернуть страницу/компонент в `AsyncBoundary` если загружаются данные
- [ ] Написать тесты для сложной логики
- [ ] Проверить линтером: `npm run lint`
- [ ] Отформатировать: `npm run format`

---

## 🚀 Следующие шаги

Можно применить те же паттерны к другим компонентам:
- `src/app/schedule/page.tsx` - использовать `useFirestoreMutation`
- `src/components/habit-tracker.tsx` - можно добавить пагинацию для логов
- Другие страницы с CRUD операциями

