# Testing In-App Notification Center

## 🚀 Быстрое тестирование в браузере

### Шаг 1: Запуск приложения

```bash
npm run dev
```

Приложение должно запуститься на `http://localhost:3000`

### Шаг 2: Проверка UI компонента

1. Откройте главную страницу (`/`)
2. В header компонента `HabitTracker` найдите кнопку с иконкой 🔔 (Bell)
3. Проверьте:
   - ✅ Кнопка отображается
   - ✅ При клике открывается диалог NotificationCenter
   - ✅ Если нет уведомлений, показывается "No notifications"

### Шаг 3: Создание тестовых уведомлений

#### Вариант A: Через консоль браузера (DevTools)

1. Откройте DevTools (F12) → Console
2. Войдите в систему (если не авторизованы)
3. Выполните:

```javascript
// Получить userId из localStorage или из консоли
const userId = 'your-user-id'; // Замени на реальный ID

// Импорт функций (в консоли не работает напрямую)
// Используйте API route для создания уведомлений
```

#### Вариант B: Через Firestore Console

1. Откройте Firebase Console → Firestore
2. Перейдите в `users/{yourUserId}/notifications`
3. Создайте новый документ с данными:

```json
{
  "type": "habit_reminder",
  "title": "⏰ Habit Reminder",
  "message": "Time to complete: Drink Water",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "read": false,
  "actionUrl": "/habits",
  "actionLabel": "Complete",
  "data": {
    "habitId": "test-habit-1"
  },
  "priority": 3,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "userId": "your-user-id"
}
```

#### Вариант C: Через тестовый API route (создать)

Создайте `/api/test/notifications/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdminApp } from '@/firebase/admin';
import { getFirestore } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  // В production это должно быть защищено!
  const { userId, type } = await req.json();
  
  const adminApp = getFirebaseAdminApp();
  const firestore = getFirestore(adminApp);
  
  // Создать тестовое уведомление
  // ...
  
  return NextResponse.json({ success: true });
}
```

### Шаг 4: Проверка функций

#### ✅ Тест 1: Отображение уведомлений
1. Создайте несколько тестовых уведомлений в Firestore
2. Обновите страницу
3. Откройте NotificationCenter (клик на Bell)
4. Проверьте:
   - Уведомления отображаются
   - Группировка работает (Unread / Earlier)
   - Иконки и цвета соответствуют типам

#### ✅ Тест 2: Бейдж непрочитанных
1. Создайте 3 уведомления с `read: false`
2. На кнопке Bell должен появиться красный бейдж с "3"
3. Откройте центр, отметьте одно как прочитанное
4. Бейдж должен обновиться до "2"

#### ✅ Тест 3: Real-time обновления
1. Откройте приложение в двух вкладках
2. В первой вкладке откройте NotificationCenter
3. Во второй вкладке создайте новое уведомление в Firestore
4. Первая вкладка должна автоматически обновиться (через onSnapshot)

#### ✅ Тест 4: Отметка прочитанными
1. Откройте NotificationCenter
2. Кликните на уведомление → должно отметиться как прочитанное
3. Кликните "Mark all read" → все непрочитанные должны отметиться

#### ✅ Тест 5: Удаление
1. Откройте NotificationCenter
2. Наведите на уведомление (появится кнопка ×)
3. Кликните × → уведомление должно удалиться

#### ✅ Тест 6: Навигация
1. Создайте уведомление с `actionUrl: "/habits"`
2. Откройте NotificationCenter
3. Кликните на уведомление → должно произойти перенаправление на `/habits`

### Шаг 5: Проверка консоли браузера

Откройте DevTools → Console:

**Ожидаемые логи:**
- ✅ Нет ошибок Firestore permission
- ✅ `[NotificationCenter]` логи при загрузке
- ✅ Нет ошибок типов TypeScript

**Не должно быть:**
- ❌ `Permission denied` ошибок (если авторизованы)
- ❌ Ошибок `useFirebase must be used within a FirebaseProvider`
- ❌ Ошибок валидации типов

### Шаг 6: Проверка интеграции с Push

1. Убедитесь, что VAPID ключ настроен
2. Разрешите push-уведомления в браузере
3. Отправьте тестовое FCM сообщение через Firebase Console:
   - Firebase Console → Cloud Messaging → Send test message
   - Введите FCM token (можно получить из консоли браузера)
   - Отправьте сообщение
4. Проверьте:
   - Браузерное уведомление появилось
   - Уведомление сохранено в Firestore
   - Отображается в NotificationCenter

## 🐛 Troubleshooting

### Проблема: Бейдж не обновляется

**Решение:**
- Проверьте консоль на ошибки
- Убедитесь, что real-time listener работает
- Проверьте Firestore rules

### Проблема: Уведомления не загружаются

**Решение:**
- Проверьте авторизацию пользователя
- Проверьте Firestore rules для `notifications` коллекции
- Проверьте структуру данных в Firestore

### Проблема: Real-time не работает

**Решение:**
- Проверьте, что `onSnapshot` правильно подключен
- Проверьте сеть в DevTools → Network tab
- Убедитесь, что Firestore rules разрешают read

## 📝 Чеклист тестирования

- [ ] Кнопка Bell отображается в header
- [ ] Диалог открывается при клике
- [ ] Пустое состояние ("No notifications") работает
- [ ] Уведомления отображаются после создания
- [ ] Бейдж показывает правильное количество непрочитанных
- [ ] Группировка (Unread/Earlier) работает
- [ ] Отметка прочитанными работает
- [ ] "Mark all read" работает
- [ ] Удаление уведомлений работает
- [ ] Навигация по actionUrl работает
- [ ] Real-time обновления работают
- [ ] Иконки и цвета соответствуют типам
- [ ] Консоль без ошибок

## 🎯 Тестовые данные

### Типы уведомлений для теста:

```json
// 1. Habit Reminder
{
  "type": "habit_reminder",
  "title": "⏰ Habit Reminder",
  "message": "Time to complete: Drink Water",
  "read": false
}

// 2. Workout Complete
{
  "type": "workout_complete",
  "title": "💪 Workout Complete!",
  "message": "Great job completing 'Full Body Strength'!",
  "read": false
}

// 3. Streak Milestone
{
  "type": "streak_milestone",
  "title": "🔥 30 Day Streak!",
  "message": "Amazing! You've maintained 'Meditation' for 30 days!",
  "read": false
}

// 4. AI Insight
{
  "type": "ai_insight",
  "title": "🤖 AI Insight Available",
  "message": "New progression suggestions for your training program",
  "read": false
}

// 5. Achievement
{
  "type": "achievement",
  "title": "🏆 Achievement Unlocked!",
  "message": "You've completed 100 workouts!",
  "read": false
}
```

---

**Готово к тестированию!** 🚀

