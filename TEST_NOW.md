# 🧪 Тестирование In-App Notification Center - ПРЯМО СЕЙЧАС

## ✅ Сервер запущен!

Dev-сервер должен быть доступен на: **http://localhost:3000**

## 🚀 Быстрый старт (3 шага)

### 1️⃣ Откройте приложение
```
http://localhost:3000
```

### 2️⃣ Найдите кнопку с иконкой 🔔
- Расположена в header компонента `HabitTracker`
- Рядом с кнопками: Streaks, Heatmap, Analytics и т.д.

### 3️⃣ Создайте тестовое уведомление

**Способ 1: Через Firestore Console (рекомендуется)**

1. Откройте [Firebase Console](https://console.firebase.google.com)
2. Выберите ваш проект
3. Перейдите: **Firestore Database** → **Data**
4. Найдите: `users/{ваш_userId}/notifications`
5. Нажмите **"Add document"**
6. Вставьте следующие данные (скопируйте как есть):

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
  "userId": "ВАШ_USER_ID"
}
```

**ВАЖНО:** Замените `"ВАШ_USER_ID"` на ваш реальный userId!

**Как узнать userId?**
- Откройте DevTools (F12) → Console
- Введите: `localStorage.getItem('firebase:authUser')`
- Или посмотрите в Firestore: `users/{userId}` - это и есть ваш ID

### 4️⃣ Проверьте результат

1. **Обновите страницу** в браузере (F5)
2. **Кликните на кнопку 🔔**
3. Должно появиться:
   - ✅ Диалог NotificationCenter
   - ✅ Ваше тестовое уведомление в разделе "Unread"
   - ✅ Красный бейдж с "1" на кнопке Bell

## 🎯 Что проверить:

- [ ] Кнопка 🔔 отображается
- [ ] Бейдж "1" появляется после создания уведомления
- [ ] Диалог открывается при клике
- [ ] Уведомление видно в списке
- [ ] Клик на уведомление отмечает его как прочитанное
- [ ] Кнопка "Mark all read" работает
- [ ] Кнопка × удаляет уведомление
- [ ] Клик на уведомление с actionUrl перенаправляет

## 🔍 Проверка консоли

Откройте DevTools (F12) → Console:

**Ожидаемые логи:**
```
[NotificationCenter] Setup complete
```

**Не должно быть ошибок:**
- ❌ `Permission denied`
- ❌ `useFirebase must be used within a FirebaseProvider`
- ❌ Type errors

## 📊 Создайте больше тестовых уведомлений

Скопируйте и вставьте несколько разных типов:

### Уведомление 2: Workout Complete
```json
{
  "type": "workout_complete",
  "title": "💪 Workout Complete!",
  "message": "Great job completing 'Full Body Strength'!",
  "timestamp": "2024-01-15T11:00:00.000Z",
  "read": false,
  "actionUrl": "/programs",
  "actionLabel": "View Progress",
  "data": { "workoutId": "test-1" },
  "priority": 2,
  "createdAt": "2024-01-15T11:00:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z",
  "userId": "ВАШ_USER_ID"
}
```

### Уведомление 3: Streak Milestone
```json
{
  "type": "streak_milestone",
  "title": "🔥 30 Day Streak!",
  "message": "Amazing! You've maintained 'Meditation' for 30 days!",
  "timestamp": "2024-01-15T09:00:00.000Z",
  "read": false,
  "actionUrl": "/habits",
  "actionLabel": "View Streaks",
  "data": { "habitId": "test-1", "streakValue": 30 },
  "priority": 4,
  "createdAt": "2024-01-15T09:00:00.000Z",
  "updatedAt": "2024-01-15T09:00:00.000Z",
  "userId": "ВАШ_USER_ID"
}
```

После создания нескольких уведомлений:
- Бейдж должен показывать правильное количество (например, "3")
- В центре должны быть сгруппированы по "Unread" и "Earlier"

## ⚡ Real-time тест

1. Откройте приложение в **двух вкладках**
2. В первой вкладке откройте NotificationCenter
3. Во второй вкладке создайте новое уведомление в Firestore
4. **Первая вкладка должна автоматически обновиться!**

## 🐛 Если что-то не работает:

1. **Проверьте авторизацию:**
   - Убедитесь, что вы вошли в систему
   - Проверьте userId в Firestore

2. **Проверьте Firestore Rules:**
   - Правила должны разрешать read/write для `users/{userId}/notifications`

3. **Проверьте структуру данных:**
   - Все обязательные поля должны быть заполнены
   - `type` должен быть одним из: `habit_reminder`, `workout_complete`, `streak_milestone`, `streak_broken`, `ai_insight`, `program_reminder`, `achievement`, `system`

4. **Очистите кэш:**
   - Ctrl+Shift+R (hard refresh)
   - Или DevTools → Application → Clear storage

## ✅ Готово!

После успешного тестирования вы увидите:
- Полностью рабочий Notification Center
- Real-time синхронизацию
- Красивый UI с бейджем
- Все функции работают

**Удачи в тестировании!** 🚀

