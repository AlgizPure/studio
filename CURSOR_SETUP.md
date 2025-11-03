# Быстрая настройка Cursor 2.0 для проекта

## ✅ Что уже готово

1. **`.cursorrules`** - Правила для AI ассистента ✅
2. **`MCP_SERVERS_GUIDE.md`** - Полное руководство по MCP серверам ✅
3. **`.cursor/mcp.example.json`** - Пример конфигурации MCP ✅
4. **`.gitignore`** - Обновлен для безопасности токенов ✅

---

## 🚀 Быстрый старт (5 минут)

### Шаг 1: Откройте проект в Cursor

```bash
cursor /home/user/studio
```

Или через File → Open Folder → выберите `/home/user/studio`

---

### Шаг 2: Проверьте что .cursorrules работает

1. Откройте любой файл TypeScript
2. Нажмите `Cmd/Ctrl + K`
3. Напишите: "Create a new React component"
4. AI должен следовать правилам из `.cursorrules`

✅ **Ожидаемый результат:** AI создаст функциональный компонент с TypeScript типами, использующий Tailwind CSS

---

### Шаг 3: Настройте MCP серверы (опционально)

#### Минимальная настройка (рекомендуется):

1. Скопируйте пример:
   ```bash
   cp .cursor/mcp.example.json .cursor/mcp.json
   ```

2. Получите GitHub токен:
   - Перейдите: https://github.com/settings/tokens
   - Generate new token (classic)
   - Выберите scopes: `repo`, `read:org`
   - Скопируйте токен

3. Вставьте токен в `.cursor/mcp.json`:
   ```json
   {
     "mcpServers": {
       "github": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-github"],
         "env": {
           "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_ваш_токен_здесь"
         }
       },
       "filesystem": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-filesystem", "${workspaceFolder}"]
       }
     }
   }
   ```

4. Перезапустите Cursor: `Cmd/Ctrl + Shift + P` → "Reload Window"

---

### Шаг 4: Проверьте работу MCP

В Cursor Chat напишите:

```
List all TypeScript files in src/components
```

Или:

```
Find all TODO comments in the project
```

✅ **Если работает:** AI будет использовать filesystem MCP для поиска

---

## 📋 Что делать дальше?

### Ежедневное использование

#### 1. **Создание компонентов**
```
Create a new habit tracking card component with
TypeScript types and Tailwind styling
```

#### 2. **Рефакторинг**
```
Refactor src/components/workout-builder.tsx to use
composition pattern and extract reusable hooks
```

#### 3. **Исправление багов**
```
Fix the TypeScript error in src/app/page.tsx line 91
```

#### 4. **Добавление функций**
```
Add a new feature to export workout data as JSON
following the existing export patterns
```

#### 5. **Работа с Firebase**
```
Create a new Firebase hook to fetch user's workout
history for the last 30 days
```

---

## 💡 Полезные команды Cursor

### Генерация кода
- `Cmd/Ctrl + K` - Inline генерация кода
- `Cmd/Ctrl + L` - Открыть Chat
- `Cmd/Ctrl + I` - Composer mode (многофайловое редактирование)

### Навигация
- `Cmd/Ctrl + P` - Быстрый поиск файлов
- `Cmd/Ctrl + Shift + F` - Поиск по всем файлам
- `Cmd/Ctrl + Click` - Перейти к определению

### AI помощь
- `Cmd/Ctrl + Shift + L` - Объяснить выделенный код
- `Tab` - Принять AI предложение
- `Esc` - Отклонить AI предложение

---

## 🎯 Примеры промптов для вашего проекта

### Создание компонентов

```
Create a WorkoutCard component that displays:
- Workout name and description
- Estimated duration
- Target muscles
- Edit and delete buttons
Use existing UI components from @/components/ui
```

### Работа с Firebase

```
Create a custom hook useWorkoutStats that:
- Fetches workout completion data for current month
- Returns total workouts, completed count, and percentage
- Uses useCollection from Firebase hooks
- Handles loading and error states
```

### Добавление AI функций

```
Create a new Genkit flow in src/ai/flows/ that:
- Analyzes user's workout patterns
- Suggests optimal rest days
- Returns structured suggestions
- Follows existing AI flow patterns
```

### Тестирование

```
Create Playwright E2E test for user authentication:
- Test login flow
- Test signup flow
- Test protected route access
- Use existing test setup from e2e/
```

---

## 📚 Документация проекта

- **`.cursorrules`** - Правила кодирования для AI
- **`MCP_SERVERS_GUIDE.md`** - Настройка MCP серверов
- **`CURSOR_TASKS.md`** - Список оставшихся задач
- **`README.md`** - Общая информация о проекте

---

## 🔧 Настройка Cursor Settings

### Рекомендованные настройки:

1. **Settings → Cursor → Features**
   - ✅ Enable Cursor Tab (автодополнение)
   - ✅ Enable Chat (AI чат)
   - ✅ Enable Composer (многофайловое редактирование)

2. **Settings → Cursor → Models**
   - Primary: **Claude Sonnet 4.5** (лучшая модель для кода)
   - Fast: **Claude Haiku** (для быстрых задач)

3. **Settings → Cursor → Privacy**
   - ⚠️ Privacy Mode: OFF (для лучших результатов)
   - Или: Privacy Mode: ON (если работаете с чувствительными данными)

---

## ⚠️ Важные напоминания

### ✅ DO (Делайте так):

1. **Используйте конкретные промпты:**
   ```
   ✅ "Create a Button component with primary/secondary variants using CVA"
   ❌ "Create a button"
   ```

2. **Ссылайтесь на существующий код:**
   ```
   ✅ "Add error handling like in src/firebase/auth.ts"
   ❌ "Add error handling"
   ```

3. **Проверяйте генерируемый код:**
   - Запускайте `npm run typecheck`
   - Проверяйте в браузере
   - Читайте генерируемый код

### ❌ DON'T (Не делайте так):

1. **Не принимайте код вслепую** - всегда проверяйте
2. **Не забывайте про .env.local** - AI не видит секретов
3. **Не игнорируйте TypeScript ошибки** - исправляйте сразу
4. **Не коммитьте AI генерацию без ревью** - проверьте качество

---

## 🐛 Troubleshooting

### AI не следует .cursorrules?

1. Перезапустите Cursor
2. Проверьте что `.cursorrules` в корне проекта
3. Попробуйте явно указать: "Following the project .cursorrules..."

### MCP серверы не работают?

1. Проверьте `.cursor/mcp.json` - должен быть валидный JSON
2. Проверьте токены - должны быть актуальными
3. Перезапустите Cursor
4. Проверьте логи: Help → Toggle Developer Tools

### AI генерирует плохой код?

1. Уточните промпт
2. Покажите пример: "Like in src/components/..."
3. Используйте более мощную модель (Claude Sonnet)
4. Разбейте задачу на несколько шагов

---

## 📈 Прогресс по задачам

Смотрите актуальный список задач в **`CURSOR_TASKS.md`**

**Текущий статус:**
- ✅ TypeScript ошибки исправлены
- ✅ Security vulnerabilities исправлены
- ✅ Next.js обновлен до 15.5.6
- ⏳ Нужно создать .env.local
- ⏳ Нужно заменить console.log на logger
- ⏳ Нужны unit тесты

---

## 🎓 Обучающие ресурсы

### Cursor AI:
- Official Docs: https://docs.cursor.com
- Community Forum: https://forum.cursor.com
- YouTube Channel: https://www.youtube.com/@cursor

### Ваш стек:
- Next.js 15: https://nextjs.org/docs
- Firebase: https://firebase.google.com/docs
- Genkit AI: https://firebase.google.com/docs/genkit
- TypeScript: https://www.typescriptlang.org/docs/

---

## 🆘 Нужна помощь?

1. **Cursor Community:** https://forum.cursor.com
2. **Discord:** https://discord.gg/cursor
3. **GitHub Issues:** https://github.com/getcursor/cursor/issues

---

**Готово! Теперь вы готовы к продуктивной работе с Cursor 2.0! 🚀**

---

*Последнее обновление: 2025-01-03*
*Версия проекта: Zenith Trainer v0.1.0*
