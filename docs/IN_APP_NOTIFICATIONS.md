# In-App Notification Center

## 📋 Обзор

Реализована полноценная система внутренних уведомлений (in-app notifications), которая:
- ✅ Показывает все уведомления внутри приложения
- ✅ Сохраняет историю уведомлений в Firestore
- ✅ Синхронизируется с push-уведомлениями (FCM)
- ✅ Показывает бейдж с количеством непрочитанных
- ✅ Позволяет отмечать уведомления как прочитанные
- ✅ Поддерживает клики и навигацию

## 🎯 Компоненты

### 1. NotificationCenter Component
**Файл:** `src/components/notification-center.tsx`

**Функции:**
- Кнопка с бейджем непрочитанных уведомлений
- Диалог с полным списком уведомлений
- Группировка: "Unread" и "Earlier"
- Real-time синхронизация через Firestore
- Отметка прочитанными (одиночные или все)
- Удаление уведомлений
- Клик для навигации по actionUrl

**Использование:**
```tsx
import { NotificationCenter } from '@/components/notification-center';

// В header компонента
<NotificationCenter />
```

### 2. Notification Helpers
**Файл:** `src/lib/notification-helpers.ts`

**Функции:**
- `createNotification()` - создание и сохранение уведомления
- `markNotificationAsRead()` - отметить как прочитанное
- `markAllNotificationsAsRead()` - отметить все как прочитанные
- `deleteNotification()` - удалить уведомление
- `getUnreadCount()` - получить количество непрочитанных
- `createNotificationFromPush()` - конвертировать FCM payload в уведомление
- Специализированные функции для разных типов:
  - `createHabitReminderNotification()`
  - `createStreakMilestoneNotification()`
  - `createWorkoutCompleteNotification()`
  - `createAIInsightNotification()`

## 🔔 Типы уведомлений

```typescript
type NotificationType = 
  | 'habit_reminder'       // Напоминание о привычке
  | 'workout_complete'     // Тренировка завершена
  | 'streak_milestone'     // Достижение streak (7, 30, 100 дней)
  | 'streak_broken'        // Streak прерван
  | 'ai_insight'           // AI инсайт доступен
  | 'program_reminder'     // Напоминание о программе
  | 'achievement'          // Достижение разблокировано
  | 'system';              // Системное уведомление
```

## 📊 Структура данных

### Firestore Collection
```
users/{userId}/notifications/{notificationId}
```

### Schema
```typescript
{
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;      // ISO timestamp
  read: boolean;
  readAt?: string;       // ISO timestamp
  actionUrl?: string;    // URL для навигации
  actionLabel?: string;   // Текст кнопки ("Complete", "View")
  data?: {                // Контекстные данные
    habitId?: string;
    workoutId?: string;
    programId?: string;
    streakValue?: number;
    achievementId?: string;
    [key: string]: any;
  };
  priority?: 1 | 2 | 3 | 4 | 5;
  expiresAt?: string;    // Автоудаление после этой даты
  createdAt: string;
  updatedAt: string;
}
```

## 🔗 Интеграция с Push-уведомлениями

### Автоматическое сохранение
Когда приходит FCM push-уведомление:
1. Показывается браузерное уведомление (если разрешено)
2. Одновременно сохраняется в Firestore для in-app центра
3. Появляется в NotificationCenter с бейджем

### Реализация
В `notification-permission-dialog.tsx`:
```typescript
useEffect(() => {
  const unsubscribe = onForegroundMessage(
    firebaseApp,
    (payload) => {
      // Показать браузерное уведомление
    },
    async (payload) => {
      // Сохранить в Firestore для in-app центра
      const notificationData = createNotificationFromPush(payload, user.uid);
      await createNotification(firestore, user.uid, notificationData);
    }
  );
  return () => unsubscribe();
}, [user, firebaseApp, firestore, permission]);
```

## 🎨 UI Features

### Бейдж
- Показывает количество непрочитанных
- Максимум "99+" для больших чисел
- Красный фон, белый текст

### Группировка
- **Unread** - непрочитанные (с индикатором точки)
- **Earlier** - прочитанные (последние 10)

### Иконки по типам
- ⏰ `habit_reminder`
- 💪 `workout_complete`
- 🔥 `streak_milestone`
- 💔 `streak_broken`
- 🤖 `ai_insight`
- 📅 `program_reminder`
- 🏆 `achievement`
- 🔔 `system`

### Цветовая схема
Каждый тип имеет свою цветовую схему для карточек:
- Blue: habit_reminder
- Green: workout_complete
- Orange: streak_milestone
- Red: streak_broken
- Purple: ai_insight
- Indigo: program_reminder
- Yellow: achievement
- Gray: system

## 📝 Примеры использования

### Создать уведомление о напоминании привычки
```typescript
import { createHabitReminderNotification, createNotification } from '@/lib/notification-helpers';

const notification = createHabitReminderNotification(
  'habit-123',
  'Drink Water',
  '08:00'
);

await createNotification(firestore, userId, notification);
```

### Создать уведомление о milestone streak
```typescript
try {
  const notification = createStreakMilestoneNotification(
    'habit-123',
    'Meditation',
    30  // 30-day streak
  );
  await createNotification(firestore, userId, notification);
} catch (error) {
  // Not a milestone day
}
```

### Получить количество непрочитанных
```typescript
const unreadCount = await getUnreadCount(firestore, userId);
console.log(`${unreadCount} unread notifications`);
```

## 🔒 Firestore Security Rules

```javascript
match /notifications/{notificationId} {
  allow read, write: if request.auth != null && request.auth.uid == userId
    && (request.resource == null || request.resource.data.type in [
      'habit_reminder', 'workout_complete', 'streak_milestone', 
      'streak_broken', 'ai_insight', 'program_reminder', 
      'achievement', 'system'
    ]);
}
```

## 🚀 Будущие улучшения

### Возможные фичи:
- [ ] Фильтрация по типам
- [ ] Поиск в уведомлениях
- [ ] Категории уведомлений
- [ ] Настройки для каждого типа (отключить/включить)
- [ ] Автоудаление старых уведомлений (более 30 дней)
- [ ] Push-уведомления на мобильных устройствах
- [ ] Звуковые сигналы для важных уведомлений
- [ ] Экспорт истории уведомлений

## 📱 Мобильная поддержка

### Текущая реализация (Web/PWA)
- Работает в браузере
- Push-уведомления через Service Worker
- In-app центр доступен всегда

### Для нативных приложений (будущее)
При портировании на React Native:
1. Использовать `@react-native-firebase/messaging`
2. Адаптировать `notification-helpers.ts` для React Native
3. Хранить уведомления в Firestore (без изменений)
4. Нативный компонент NotificationCenter

## ⚙️ Настройка

### Обязательные шаги:
1. ✅ Firestore правила добавлены
2. ✅ Компоненты интегрированы
3. ✅ Helpers реализованы

### Опционально:
- Настроить VAPID ключ для push-уведомлений
- Добавить больше типов уведомлений
- Кастомизировать иконки/цвета

## 🐛 Отладка

### Проверить уведомления в Firestore:
```
Firebase Console → Firestore → users/{userId}/notifications
```

### Проверить бейдж:
- Откройте NotificationCenter
- Создайте тестовое уведомление вручную
- Бейдж должен обновиться в реальном времени

### Проверить real-time синхронизацию:
- Откройте приложение в двух вкладках
- Создайте уведомление в одной вкладке
- Другая вкладка должна обновиться автоматически

## 📖 Связанные файлы

- `src/components/notification-center.tsx` - главный компонент
- `src/lib/notification-helpers.ts` - вспомогательные функции
- `src/lib/types.ts` - типы InAppNotification
- `src/firebase/messaging.ts` - интеграция с FCM
- `src/components/notification-permission-dialog.tsx` - диалог разрешений
- `firestore.rules` - правила безопасности

---

**Статус:** ✅ Полностью реализовано и готово к использованию

