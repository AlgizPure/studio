# Quick Start: New Project (CLI Claude Code)

**Вернуться к выбору сценария:** → **[00_START_HERE.md](../00_START_HERE.md)**

**Сценарий:** Новый проект из сырых данных, используя CLI Claude Code

---

## Prerequisites

Необходимые инструменты:
- ✅ Node.js (v18+)
- ✅ npm
- ✅ claude-code CLI установлен (`npm install -g @anthropic-ai/claude-code`)
- ✅ GitHub аккаунт (для создания проекта из template)

---

## Шаги Запуска

### 1. Создать проект из template

**Вариант A: Через GitHub UI (рекомендуется)**
```bash
# Перейти на: https://github.com/AlgizPure/project-management-template
# Нажать "Use this template" → "Create a new repository"
# Указать название: my-new-project
# Clone локально:
git clone https://github.com/ваш-username/my-new-project.git
cd my-new-project
```

**Вариант B: Прямое клонирование**
```bash
git clone https://github.com/AlgizPure/project-management-template.git my-new-project
cd my-new-project
rm -rf .git
git init
git add .
git commit -m "Initial commit from template"
```

### 2. Собрать сырые данные

Добавить все материалы проекта в `00_RAW_DATA_TEMPLATE/`:

```bash
# Переписки (ChatGPT, Claude, Telegram)
cp ~/Downloads/chatgpt-export.txt 00_RAW_DATA_TEMPLATE/chats/

# Документы (Google Docs, Notion, Word)
cp ~/Documents/project-ideas.md 00_RAW_DATA_TEMPLATE/documents/

# Заметки (любые текстовые файлы)
cp ~/Notes/features.txt 00_RAW_DATA_TEMPLATE/notes/

# Код (если есть прототипы)
cp -r ~/Code/prototype/ 00_RAW_DATA_TEMPLATE/code/
```

**Что можно добавить:**
- Экспорты чатов с AI (любой формат: txt, md, json)
- Google Docs/Notion экспорты
- Скриншоты дизайнов
- Существующий код (если есть)
- Любые текстовые заметки

**Минимум:** Хотя бы 1-2 файла с описанием идеи проекта (500+ слов).

### 3. Запустить Claude Code

```bash
claude
```

Откроется интерактивная сессия Claude Code в вашем проекте.

### 4. Использовать готовый промпт

**НЕ НУЖНО** придумывать промпт самостоятельно!

Используй готовый промпт из:
→ **@01_BOOTSTRAP_CONFIG/BOOTSTRAP_START_PROMPT.md**

Выбери нужный сценарий:
- **Сценарий 1:** CLI + Новый проект (только raw data)
- **Сценарий 2:** CLI + Существующий проект (есть код в ../src или других папках)

Скопируй промпт и вставь в Claude Code.

**Claude Code автоматически:**
- Прочитает все @ссылки из промпта
- Запустит процесс AUTO-FILL
- Задаст уточняющие вопросы
- Заполнит metadata.yaml

### 5. Отвечать на вопросы Claude во время bootstrap

Claude Code прочитает все файлы и задаст уточняющие вопросы:

**Примеры вопросов:**
```
Claude: "Обнаружил название проекта: 'TaskFlow'. Подтверждаете?"
Вы: "Да"

Claude: "Целевая аудитория: удалённые команды 5-15 человек?"
Вы: "Да, верно"

Claude: "В ранних чатах упоминался MongoDB, в поздних - PostgreSQL.
        Какой финальный выбор для базы данных?"
Вы: "PostgreSQL"

Claude: "Планируемый срок MVP: 2-3 месяца?"
Вы: "Да"
```

**Просто отвечайте кратко.** Claude Code:
- Извлечёт всю информацию из сырых данных
- Заполнит `metadata.yaml` автоматически
- Задаст вопросы только для уточнения противоречий

### 6. Tech Stack Verification & Recommendations

Claude Code автоматически:

**Анализирует упоминания технологий** в сырых данных:
- Базы данных
- Frontend/Backend фреймворки
- Инфраструктура
- Сторонние сервисы

**Проверяет актуальность** (текущая дата: November 2025):
- Технология всё ещё поддерживается?
- Есть ли более новые версии?
- Появились ли лучшие альтернативы?

**Даёт рекомендации** с обоснованием:

```
╔═══════════════════════════════════════════════════════════════╗
║  TECH STACK RECOMMENDATIONS                                   ║
╚═══════════════════════════════════════════════════════════════╝

📊 Анализ ваших данных:

| Компонент | Из сырых данных | Рекомендация (2025) | Причина           |
|-----------|-----------------|---------------------|-------------------|
| Database  | MongoDB         | PostgreSQL 16       | Реляционные данные|
|           | (2024-09)       |                     | + JSON support    |
|-----------|-----------------|---------------------|-------------------|
| Frontend  | React 17        | React 19            | Новый компилятор, |
|           |                 |                     | +30% performance  |
|-----------|-----------------|---------------------|-------------------|
| Hosting   | Heroku          | Railway / Vercel    | Дешевле, быстрее  |
|-----------|-----------------|---------------------|-------------------|

✅ Одобрить все рекомендации?
⚠️ Или выбрать вручную для каждого компонента?
```

**Вы решаете:**
- Принять все рекомендации → Claude обновит TECH_STACK.md
- Оставить исходные выборы → Claude задокументирует причины
- Смешанный подход → Выбрать для каждого компонента отдельно

### 7. Дождаться завершения bootstrap (~1.5 часа)

Claude Code автоматически заполнит:

**Файлы, которые будут созданы:**
- ✅ `metadata.yaml` (AUTO-FILL)
- ✅ `PROJECT_CORE/00_PROJECT_ESSENCE.md`
- ✅ `PROJECT_CORE/01_PRD.md`
- ✅ `PROJECT_CORE/02_ROADMAP.md`
- ✅ `PROJECT_CORE/03_TECH_STACK.md` (+ recommendations)
- ✅ `PROJECT_CORE/04_ARCHITECTURE.md`
- ✅ `CONTEXT_MEMORY/state.md`
- ✅ `CONTEXT_MEMORY/decisions.md`
- ✅ Все остальные файлы системы

**Прогресс отображается в консоли:**
```
[✓] Phase 1: Analysis complete (15 min)
[✓] Phase 2: Interview complete (5 min)
[→] Phase 3: Synthesis in progress... (60 min)
    ├─ [✓] PROJECT_ESSENCE.md
    ├─ [✓] PRD.md
    ├─ [→] ROADMAP.md (50% done)
    └─ [ ] TECH_STACK.md
```

### 8. Проверить сгенерированную документацию

После завершения:

```bash
# Прочитать основные файлы
cat 02_PROJECT_STRUCTURE/PROJECT_CORE/00_PROJECT_ESSENCE.md
cat 02_PROJECT_STRUCTURE/PROJECT_CORE/01_PRD.md

# Проверить tech stack рекомендации
cat 02_PROJECT_STRUCTURE/PROJECT_CORE/03_TECH_STACK.md

# Проверить текущий статус
cat 02_PROJECT_STRUCTURE/CONTEXT_MEMORY/state.md
```

**Что проверить:**
- ✅ Все ключевые фичи из сырых данных учтены
- ✅ Целевая аудитория описана корректно
- ✅ Tech stack соответствует требованиям
- ✅ Roadmap реалистичен

**Если нужны корректировки:**
```
Claude, обнови PRD: добавь фичу "экспорт в PDF" в раздел "Must Have"
Claude, измени в ROADMAP: MVP срок 3 месяца → 2 месяца
```

### 9. Начать разработку!

Теперь у вас есть:
- 📋 Полная документация требований
- 🗺️ Roadmap с приоритетами
- 🏗️ Архитектурные решения
- 💾 Выбранный и проверенный tech stack
- 📊 Система трекинга прогресса

**Следующие шаги:**
```bash
# Создать первый модуль
cd 02_PROJECT_STRUCTURE/MODULES_REQUIREMENTS/
cp _module_template.md authentication.md

# Использовать Claude Code для разработки
claude
# "Реализуй модуль Authentication согласно requirements в authentication.md"
```

### 10. Финальная настройка (ОБЯЗАТЕЛЬНО!)

После завершения bootstrap:

**Прочитай и выполни:**
→ **@FINAL_SETUP_INSTRUCTIONS.md**

Это критически важно для:
- Настройки Cursor project rules
- Активации AI ассистентов
- Правильной работы системы

⚠️ **Без этого шага система работать не будет корректно!**

**Что включено:**
- Копирование .cursorrules в корень проекта
- Настройка Cursor Settings
- Добавление дополнительных Project Rules
- Правила обновления при изменениях
- Ежедневный рабочий процесс

**Время:** 10-15 минут

---

## ✅ Готово - Что Дальше?

После ответа на вопросы и tech stack verification, Claude Code автоматически:
- Сгенерирует всю документацию (2-4 часа)
- Создаст все необходимые файлы в правильном порядке
- Заполнит PROJECT_CORE, MODULES_REQUIREMENTS, CONTEXT_MEMORY
- Создаст BOOTSTRAP_REPORT.md

**Пока Claude работает (2-4 часа):**
- Можешь заниматься другими делами
- Claude информирует о прогрессе каждые 30 минут
- Весь процесс автономный

**После завершения:** См. шаг 10 (Финальная настройка - ОБЯЗАТЕЛЬНО!)
- `.cursorrules` / `.clauderules` - автоматический трекинг

---

**Готовы начать?** 🚀

```bash
cd my-new-project
# Добавьте сырые данные
claude
# "Bootstrap с AUTO-FILL режимом метаданных"
```

**Ожидаемое время:** 1.5-3 часа (большую часть времени Claude работает автономно)

**Результат:** Полная документация проекта, готовая к разработке!
