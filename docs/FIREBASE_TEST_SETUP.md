# 🔥 Firebase Test Environment Setup

## Зачем нужна отдельная тестовая база?

### ❌ Проблемы без раздельных окружений:
```
E2E тесты создают → Тестовые данные в prod → Нарушают реальные данные
```

### ✅ С раздельными окружениями:
```
Production: zenith-trainer → Реальные пользователи
Test: zenith-trainer-test → E2E тесты, можно удалять данные
```

---

## 📋 Шаг 1: Создание Test Firebase Project

### 1.1 Firebase Console
1. Откройте [Firebase Console](https://console.firebase.google.com/)
2. Нажмите **"Add project"**
3. Название: `zenith-trainer-test`
4. Analytics: Можно отключить для test проекта

### 1.2 Включите необходимые сервисы

#### Authentication
```
1. Build → Authentication → Get Started
2. Sign-in method → Email/Password → Enable
3. (Опционально) Anonymous → Enable для тестов без регистрации
```

#### Firestore Database
```
1. Build → Firestore Database → Create Database
2. Mode: Test mode (для начала)
3. Location: выберите ближайший регион
```

#### Storage (если используете)
```
1. Build → Storage → Get Started
2. Mode: Test mode
```

---

## 🔒 Шаг 2: Настройка Firestore Rules для Test

### 2.1 Relaxed Rules (Рекомендовано для test)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Разрешаем всё для аутентифицированных пользователей
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 2.2 Полностью открытые Rules (⚠️ ТОЛЬКО для локальных E2E)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ⚠️ НИКОГДА не используйте в production!
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Важно:** Эти rules подходят только для test проекта!

---

## 🔑 Шаг 3: Получение Test Firebase Credentials

### 3.1 Project Settings
```
1. Project Overview → Settings (⚙️)
2. General → Your apps → Web app (</>)
3. Register app: "Zenith Test"
4. Copy Firebase config
```

### 3.2 Создайте `.env.test.local`

```env
# Firebase Test Project (zenith-trainer-test)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=zenith-trainer-test.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=zenith-trainer-test
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=zenith-trainer-test.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123...
NEXT_PUBLIC_FIREBASE_APP_ID=1:123...

# Google AI (можно использовать тот же)
GOOGLE_GENAI_API_KEY=your_gemini_api_key

# Feature flags для тестов
NEXT_PUBLIC_REMINDER_SIMULATOR=0
```

---

## 📁 Структура Environment Files

```
.env.local                  → Production credentials (НЕ коммитим)
.env.test.local            → Test credentials (НЕ коммитим)
.env.example               → Шаблон для других разработчиков (коммитим)
```

### Проверка `.gitignore`:
```gitignore
.env*                      # Игнорирует .env.local
.env.test.local           # Явно игнорирует test конфиг
```

---

## 🚀 Шаг 4: Проверка Setup

### 4.1 Запустите E2E тесты
```bash
npm run test:e2e:ui
```

### 4.2 Проверьте логи
В консоли браузера должно появиться:
```
🔥 Firebase Environment: test
🔥 Firebase Project ID: zenith-trainer-test
```

### 4.3 Проверьте Firestore Console
- Откройте Firebase Console → Test Project
- Firestore → Data
- После запуска тестов должны появиться коллекции: `habits`, `users`, etc.

---

## 🎯 Best Practices

### 1. Naming Convention
```
Production:  zenith-trainer
Test:        zenith-trainer-test
Dev:         zenith-trainer-dev (опционально)
```

### 2. Firebase Plans
```
Production:  Blaze Plan (pay-as-you-go)
Test/Dev:    Spark Plan (free) - достаточно для тестов
```

### 3. Автоматическая очистка данных
```typescript
// e2e/utils/helpers.ts
export async function clearFirestoreData() {
  // Очистка тестовых данных после каждого теста
}
```

### 4. Environment Variables Strategy
```typescript
// src/firebase/config.ts
function getCurrentEnvironment(): 'test' | 'production' {
  if (process.env.PLAYWRIGHT_TEST === '1') return 'test';
  return 'production';
}
```

---

## 🔍 Troubleshooting

### Проблема: Тесты используют production базу
**Решение:**
1. Проверьте что `.env.test.local` существует
2. Проверьте что `playwright.config.ts` загружает его через `dotenv`
3. Проверьте логи в консоли: `Firebase Project ID` должен быть `zenith-trainer-test`

### Проблема: Permission Denied в тестах
**Решение:**
1. Проверьте Firestore Rules в test проекте
2. Убедитесь что правила не слишком строгие
3. Используйте relaxed rules (см. выше)

### Проблема: Тесты медленные
**Решение:**
1. Используйте `emulator` для локальной разработки:
```bash
firebase emulators:start
```
2. Настройте `playwright.config.ts` для использования эмулятора

---

## 📚 Дополнительные материалы

- [Firebase Console](https://console.firebase.google.com/)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Emulators](https://firebase.google.com/docs/emulator-suite)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

---

## ✅ Checklist

- [ ] Создан test Firebase project (`zenith-trainer-test`)
- [ ] Включены Authentication, Firestore, Storage
- [ ] Настроены relaxed Firestore Rules
- [ ] Создан `.env.test.local` с test credentials
- [ ] `.env.test.local` добавлен в `.gitignore`
- [ ] `playwright.config.ts` загружает `.env.test.local`
- [ ] Запущены E2E тесты и они работают
- [ ] В консоли видно `Firebase Project ID: zenith-trainer-test`
- [ ] Тестовые данные появляются в test Firestore, а не в production

🎉 **Готово! Теперь ваши E2E тесты изолированы от production базы!**

