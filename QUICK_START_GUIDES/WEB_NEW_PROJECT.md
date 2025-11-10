# Quick Start: New Project (Web Claude Code)

**Вернуться к выбору сценария:** → **[00_START_HERE.md](../00_START_HERE.md)**

**Сценарий:** Новый проект, используя claude.ai/code (браузер)

---

## Prerequisites

Необходимое:
- ✅ GitHub аккаунт
- ✅ Доступ к https://claude.ai/code
- ✅ Сырые данные подготовлены (чаты, документы)
- ✅ Браузер (Chrome, Firefox, Safari)

---

## ⚠️ Важные Ограничения Web-версии

### Ключевые отличия от CLI:

| Возможность                     | CLI Claude Code | Web Claude Code |
|---------------------------------|-----------------|-----------------|
| Читать локальные файлы          | ✅ Да           | ❌ Нет          |
| Анализ кода вне репозитория     | ✅ Да (../)     | ❌ Нет          |
| Работа без интернета            | ✅ Да           | ❌ Нет          |
| Все данные в GitHub обязательно | ❌ Нет          | ✅ Да           |

**Главное правило:** ВСЕ сырые данные должны быть В GitHub репозитории!

**Не работает в Web версии:**
```bash
# ❌ НЕ РАБОТАЕТ:
"Прочитай файл ~/Downloads/chat-export.txt"
"Анализируй код в родительской директории ../"
"Используй данные из локальной папки"

# ✅ РАБОТАЕТ:
"Прочитай файл 00_RAW_DATA_TEMPLATE/chats/chat-export.txt"
"Анализируй код в src/ (в этом же репозитории)"
"Используй данные из 00_RAW_DATA_TEMPLATE/"
```

---

## Шаги Запуска

### 1. Создать проект из template на GitHub

1. Открыть: https://github.com/AlgizPure/project-management-template
2. Нажать **"Use this template"** → **"Create a new repository"**
3. Указать:
   - Repository name: `my-new-project`
   - Description: "My awesome project"
   - Visibility: Public или Private
4. Нажать **"Create repository"**

**Результат:** Новый репозиторий создан:
```
https://github.com/your-username/my-new-project
```

### 2. Клонировать локально и добавить сырые данные

```bash
# Клонировать
git clone https://github.com/your-username/my-new-project.git
cd my-new-project

# Добавить сырые данные
cp ~/Downloads/chatgpt-export.txt 00_RAW_DATA_TEMPLATE/chats/
cp ~/Documents/project-notes.md 00_RAW_DATA_TEMPLATE/documents/
cp ~/Notes/features.txt 00_RAW_DATA_TEMPLATE/notes/

# Если есть код-прототипы
cp -r ~/Code/prototype/ 00_RAW_DATA_TEMPLATE/code/
```

**Что можно добавить:**
- ✅ Экспорты чатов (txt, md, json)
- ✅ Google Docs экспорты (скачать как .md или .txt)
- ✅ Notion экспорты
- ✅ Скриншоты (.png, .jpg) - Claude может их читать!
- ✅ Любые текстовые файлы
- ✅ Код (если есть прототипы)

### 3. Закоммитить и запушить на GitHub

**КРИТИЧНО:** Без этого шага Web Claude Code не увидит файлы!

```bash
# Проверить, что файлы добавлены
ls -la 00_RAW_DATA_TEMPLATE/chats/
ls -la 00_RAW_DATA_TEMPLATE/documents/

# Добавить в git
git add 00_RAW_DATA_TEMPLATE/

# Коммит
git commit -m "Add raw data for bootstrap (chats, docs, notes)"

# Пуш на GitHub
git push origin main
```

**Проверка:** Открыть репозиторий на GitHub, убедиться что файлы появились:
```
https://github.com/your-username/my-new-project/tree/main/00_RAW_DATA_TEMPLATE
```

### 4. Открыть Claude Code (Web)

1. Перейти: https://claude.ai/code
2. Войти в аккаунт (если не вошли)
3. Нажать **"Connect repository"**
4. Выбрать **GitHub**
5. Авторизовать доступ Claude к GitHub
6. Выбрать репозиторий: `your-username/my-new-project`
7. Нажать **"Connect"**

**Результат:** Claude Code подключен к вашему GitHub репозиторию.

### 5. Использовать готовый промпт

**Используй ПОЛНЫЙ промпт из:**
→ **`01_BOOTSTRAP_CONFIG/BOOTSTRAP_START_PROMPT.md`** → **Сценарий 3** (Web + Новый проект)

**Как использовать:**
1. Открой файл `01_BOOTSTRAP_CONFIG/BOOTSTRAP_START_PROMPT.md` в репозитории
2. Найди раздел "СЦЕНАРИЙ 3: WEB (GITHUB) + НОВЫЙ ПРОЕКТ"
3. Скопируй ВСЁ от `---НАЧАЛО ПРОМПТА---` до `---КОНЕЦ ПРОМПТА---`
4. Вставь в чат Claude Code (https://claude.ai/code)
5. Отправь

**Что произойдет:**
Claude Code автоматически прочитает все @ссылки:
- `@01_BOOTSTRAP_CONFIG/BOOTSTRAP_INSTRUCTIONS.md` - главный процесс
- `@01_BOOTSTRAP_CONFIG/AUTO_FILL_INSTRUCTIONS.md` - автозаполнение
- `@01_BOOTSTRAP_CONFIG/tech-stack-verification.md` - верификация технологий

И запустит полный bootstrap с правильной последовательностью из 7 фаз.

⚠️ **Почему не упрощенный промпт:**
- ❌ Без @ссылок Claude может пропустить критические шаги
- ❌ Нет единообразия между сценариями
- ✅ Полный промпт гарантирует правильную последовательность

### 6. Отвечать на вопросы в чате

Claude задаст вопросы прямо в web интерфейсе:

**Примеры диалога:**

```
Claude: "Обнаружил название проекта: 'TaskFlow'. Подтверждаете?"

Вы: "Да"

Claude: "Целевая аудитория: удалённые команды 5-15 человек?"

Вы: "Да, верно"

Claude: "В ранних чатах (2024-09): MongoDB.
        В поздних чатах (2024-11): PostgreSQL.
        Какой финальный выбор?"

Вы: "PostgreSQL"

Claude: "Обнаружил 3 варианта названия фич:
        - 'Task management' (3 упоминания)
        - 'Project tracking' (2 упоминания)
        - 'Workflow automation' (1 упоминание)
        Все 3 фичи или это одно и то же?"

Вы: "Это одна фича: Task management. Остальное синонимы."
```

**Просто отвечайте кратко.** Claude работает как в обычном чате.

### 7. Наблюдать за автоматическими коммитами

Claude Code (Web) автоматически делает git commits:

**В чате увидите:**
```
✓ Создал файл metadata.yaml
✓ Committed: "Add auto-filled metadata.yaml"

✓ Создал PROJECT_ESSENCE.md
✓ Создал PRD.md
✓ Committed: "Add PROJECT_CORE documentation"

✓ Создал TECH_STACK.md с рекомендациями
✓ Committed: "Add tech stack analysis and recommendations"
...
```

**На GitHub автоматически появятся commits:**
```
https://github.com/your-username/my-new-project/commits/main

- Add auto-filled metadata.yaml
- Add PROJECT_CORE documentation (PROJECT_ESSENCE, PRD)
- Add ROADMAP and ARCHITECTURE
- Add TECH_STACK with modernization recommendations
- Add CONTEXT_MEMORY tracking files
- Bootstrap complete
```

### 8. Tech Stack Recommendations

Claude проанализирует технологии из сырых данных и даст рекомендации:

**В чате:**
```
Claude: "Проанализировал упоминания технологий в сырых данных.

Обнаружено:
- Frontend: React 17 (упоминание от 2024-09)
- Backend: Node.js + Express
- Database: MongoDB → PostgreSQL (изменилось в чатах)
- Hosting: Heroku

Рекомендации (актуально на November 2025):

1. React 17 → React 19 ✅
   Причина: Новый компилятор, +30% performance, stable release Oct 2025

2. PostgreSQL ✅ (ваш выбор корректен)
   Причина: Подходит для реляционных данных, JSON support есть

3. Heroku → Railway или Vercel ⚠️
   Причина: Heroku дорого, альтернативы дешевле и быстрее

4. Express 4 → оставить ✅
   Причина: Стабильно, Express 5 breaking changes не нужны сейчас

Одобрить рекомендации? (yes/no/custom)"

Вы: "yes"

Claude: "Отлично! Обновляю TECH_STACK.md с рекомендованным стеком..."
✓ Committed: "Update TECH_STACK.md with approved recommendations"
```

### 9. Проверить результат на GitHub

Открыть репозиторий на GitHub и проверить:

```
https://github.com/your-username/my-new-project
```

**Должны появиться:**
- ✅ `00_RAW_DATA_TEMPLATE/metadata.yaml` (заполнен)
- ✅ `02_PROJECT_STRUCTURE/PROJECT_CORE/00_PROJECT_ESSENCE.md`
- ✅ `02_PROJECT_STRUCTURE/PROJECT_CORE/01_PRD.md`
- ✅ `02_PROJECT_STRUCTURE/PROJECT_CORE/02_ROADMAP.md`
- ✅ `02_PROJECT_STRUCTURE/PROJECT_CORE/03_TECH_STACK.md`
- ✅ `02_PROJECT_STRUCTURE/PROJECT_CORE/04_ARCHITECTURE.md`
- ✅ `02_PROJECT_STRUCTURE/CONTEXT_MEMORY/*` (все 4 файла)
- ✅ Остальные файлы заполнены

**Посмотреть содержимое:**
```
https://github.com/your-username/my-new-project/blob/main/02_PROJECT_STRUCTURE/PROJECT_CORE/01_PRD.md
```

### 10. Начать разработку!

Теперь у вас есть полная документация в GitHub.

**Опция A: Продолжить в Web Claude Code**
```
# В чате claude.ai/code:
"Реализуй модуль Authentication согласно PRD.md.
Создай файлы в src/ directory."

# Claude создаст код и закоммитит на GitHub
```

**Опция B: Клонировать и работать локально**
```bash
git pull  # Получить изменения от Claude
# Теперь работать локально с полной документацией
```

---

## Особенности AUTO-FILL в Web-версии

### Идентично CLI версии:

✅ Автоматическое извлечение информации из сырых данных
✅ Уточняющие вопросы (5-10 штук)
✅ Заполнение metadata.yaml автоматически
✅ Анализ tech stack и рекомендации
✅ Генерация всей документации

### Дополнительно в Web:

✅ **Автоматические git commits** - не нужно коммитить вручную
✅ **Все изменения на GitHub сразу** - команда видит прогресс в реальном времени
✅ **Web интерфейс** - удобно для тех, кто не любит CLI

### Ограничения vs CLI:

❌ Нельзя читать файлы вне репозитория
❌ Нельзя анализировать код в parent directory
❌ Все данные должны быть в GitHub (privacy concerns для чувствительных данных)

---

## Ограничения vs CLI

### 1. Все данные в GitHub

**CLI версия:**
```bash
# Можно держать данные локально
~/Downloads/sensitive-chat.txt  # ✅ Работает, не в git
~/Documents/private-notes.md    # ✅ Работает, не в git
```

**Web версия:**
```bash
# Всё должно быть в репозитории
00_RAW_DATA_TEMPLATE/chats/chat.txt  # ✅ В git, на GitHub
~/Downloads/chat.txt                 # ❌ НЕ работает
```

**Решение для чувствительных данных:**
1. Использовать Private репозиторий на GitHub
2. Или: очистить данные перед добавлением (удалить имена, email, etc.)
3. Или: использовать CLI версию вместо Web

### 2. Нельзя читать файлы вне репозитория

**CLI версия:**
```bash
# Можно ссылаться на внешние файлы
../other-project/config.json  # ✅ Работает
~/Documents/specs.md          # ✅ Работает
```

**Web версия:**
```bash
# Только файлы в репозитории
../other-project/config.json  # ❌ НЕ работает
config.json                   # ✅ Если в репозитории
```

### 3. Нет анализа existing code в других репозиториях

**CLI версия:**
```bash
# Можно анализировать код в parent directory
cd .template-system
# Claude читает ../src/ (код вне template)  ✅
```

**Web версия:**
```bash
# Код должен быть в ТОМ ЖЕ репозитории
# Если код в другом репозитории → не анализируется  ❌
```

**Решение:** См. WEB_EXISTING_PROJECT.md для работы с существующим кодом.

### 4. Интернет обязателен

**CLI версия:**
```bash
# Работает офлайн (после установки)
claude  # ✅ Работает без интернета (кроме API вызовов)
```

**Web версия:**
```bash
# Интернет обязателен всегда
https://claude.ai/code  # ❌ Без интернета не работает
```

---

## Сравнение: CLI vs Web

| Аспект                       | CLI Claude Code       | Web Claude Code        |
|------------------------------|-----------------------|------------------------|
| **Установка**                | npm install           | Нет (браузер)          |
| **Доступ к локальным файлам**| ✅ Да                 | ❌ Нет                 |
| **Работа офлайн**            | ✅ Частично           | ❌ Нет                 |
| **Git commits**              | Вручную               | ✅ Автоматически       |
| **Анализ кода вне repo**     | ✅ Да (../)           | ❌ Нет                 |
| **Privacy (чувств. данные)** | ✅ Лучше (локально)   | ⚠️ Всё на GitHub       |
| **Скорость**                 | ✅ Быстрее            | ⚠️ Медленнее (сеть)    |
| **Удобство**                 | ⚠️ CLI опыт нужен     | ✅ Проще (UI)          |
| **Команда видит прогресс**   | ⚠️ После push         | ✅ Сразу (GitHub)      |
| **AUTO-FILL metadata**       | ✅ Да                 | ✅ Да                  |
| **Tech recommendations**     | ✅ Да                 | ✅ Да                  |

**Рекомендация:**
- **CLI:** Если есть чувствительные данные или код вне репозитория
- **Web:** Если всё можно положить в GitHub и хочется удобный UI

---

## Примеры Сценариев

### Сценарий 1: Простой проект (публичный)

**Данные:**
- 1 чат с ChatGPT (5000 слов)
- 1 Google Docs документ
- Нет чувствительной информации

**Процесс:**
```
1. "Use this template" на GitHub → my-project
2. Clone локально
3. Добавить chat.txt и doc.md в 00_RAW_DATA_TEMPLATE/
4. git push
5. Открыть claude.ai/code → connect repository
6. Bootstrap промпт
7. Ответить на вопросы
8. Готово за 1.5 часа!
```

**Результат:** Документация на GitHub, команда может сразу читать.

### Сценарий 2: Проект с конфиденциальными данными

**Данные:**
- Чаты с упоминаниями клиентов, доходов, стратегии
- Нельзя публично на GitHub

**Решение A: Private репозиторий**
```
1. "Use this template" → PRIVATE repository
2. Добавить данные (они будут видны только вам)
3. Bootstrap в Web Claude Code
4. Результат: документация в private repo
```

**Решение B: Очистка данных**
```
1. Удалить имена клиентов → "Client A", "Client B"
2. Удалить цифры доходов → "$$$"
3. Обобщить стратегию → убрать специфику
4. Добавить в public repo
5. Bootstrap
```

**Решение C: Использовать CLI версию**
```
# CLI позволяет держать данные локально
# См. CLI_NEW_PROJECT.md
```

### Сценарий 3: Командный проект

**Команда:** 3 человека
**Задача:** Создать проект с документацией, все должны видеть прогресс

**Процесс (Web версия идеальна):**
```
1. Team Lead: создать репозиторий из template
2. Team Lead: добавить всех в collaborators
3. Team Lead: собрать сырые данные от всех
4. Team Lead: push данных на GitHub
5. Team Lead: bootstrap в claude.ai/code

6. Вся команда ВИДИТ коммиты в реальном времени:
   https://github.com/team/project/commits/main

   10:00 - Add metadata.yaml
   10:15 - Add PROJECT_ESSENCE.md
   10:30 - Add PRD.md
   ...

7. После bootstrap: все читают документацию на GitHub
8. Начинают разработку с общего понимания
```

**Преимущество Web:** Прозрачность процесса для всей команды.

---

## Troubleshooting

### Проблема: Claude не видит файлы в 00_RAW_DATA_TEMPLATE/

**Причина:** Файлы не закоммичены на GitHub

**Решение:**
```bash
# Проверить локально
git status
# Должно показать "nothing to commit" (всё запушено)

# Если есть uncommitted файлы:
git add 00_RAW_DATA_TEMPLATE/
git commit -m "Add raw data"
git push

# В Claude Code:
"Refresh repository и прочитай 00_RAW_DATA_TEMPLATE/"
```

### Проблема: "Permission denied" при подключении репозитория

**Причина:** Claude не авторизован в GitHub

**Решение:**
```
1. Отключить репозиторий в Claude Code
2. Выйти из claude.ai
3. Войти заново
4. "Connect repository" → авторизовать GitHub снова
5. Выбрать репозиторий
```

### Проблема: Bootstrap слишком долгий (4+ часа)

**Причина:** Слишком много сырых данных (50+ файлов, 100K+ слов)

**Решение:**
```
Разбить на части:

1. Первый bootstrap: только core файлы (PROJECT_CORE)
   "Bootstrap только PROJECT_CORE файлы"

2. Второй bootstrap: context memory
   "Заполни CONTEXT_MEMORY файлы"

3. Третий bootstrap: остальное
```

### Проблема: Чувствительные данные случайно в public repo

**Решение (СРОЧНО):**
```
1. Удалить файлы:
   git rm 00_RAW_DATA_TEMPLATE/chats/sensitive.txt
   git commit -m "Remove sensitive data"
   git push

2. Очистить историю (если уже закоммичено):
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch 00_RAW_DATA_TEMPLATE/chats/sensitive.txt" \
     --prune-empty --tag-name-filter cat -- --all
   git push --force

3. ИЛИ: сделать репозиторий Private
   Settings → Danger Zone → Change visibility → Make private
```

---

## Следующие Шаги

После завершения bootstrap:

### 1. Проверить документацию на GitHub

```
https://github.com/your-username/my-new-project/tree/main/02_PROJECT_STRUCTURE
```

Прочитать:
- PROJECT_CORE/01_PRD.md (все фичи учтены?)
- PROJECT_CORE/03_TECH_STACK.md (tech stack правильный?)
- CONTEXT_MEMORY/state.md (starting state корректен?)

### 2. Поделиться с командой

```
# Добавить collaborators в GitHub
Settings → Collaborators → Add people

# Отправить ссылку на документацию
https://github.com/your-username/my-new-project/blob/main/02_PROJECT_STRUCTURE/PROJECT_CORE/01_PRD.md

# Команда может читать и комментировать
```

### 3. Начать разработку

**Вариант A: Продолжить в Web Claude Code**
```
# В claude.ai/code:
"Создай первый модуль: Authentication
Согласно PRD.md, создай:
- src/auth/login.ts
- src/auth/register.ts
- Используй рекомендованный tech stack"
```

**Вариант B: Локальная разработка**
```bash
git pull  # Получить всю документацию
# Работать локально с IDE
# Использовать .cursorrules для Cursor IDE
```

---

## Сравнение с CLI New Project

См. также: [CLI_NEW_PROJECT.md](CLI_NEW_PROJECT.md)

**Основные отличия:**

| Аспект                    | CLI                        | Web                          |
|---------------------------|----------------------------|------------------------------|
| Данные могут быть вне git | ✅ Да                      | ❌ Нет (всё в repo)          |
| Git commits               | Вручную                    | ✅ Автоматически             |
| Прогресс виден команде    | После push                 | ✅ Сразу (GitHub)            |
| Privacy                   | ✅ Лучше                   | ⚠️ Всё на GitHub             |
| Установка ПО              | ⚠️ Нужна (npm)             | ✅ Не нужна                  |
| Скорость                  | ✅ Быстрее                 | ⚠️ Зависит от сети           |

**Выбор:**
- **Web:** Если команда, public/private repo подходит, хочется UI
- **CLI:** Если одиночка, чувствительные данные локально, есть опыт с терминалом

---

**Готовы создать проект через Web Claude Code?** 🚀

```
1. GitHub: "Use this template" → my-new-project
2. Clone, добавить сырые данные, push
3. https://claude.ai/code → Connect repository
4. Bootstrap промпт
5. Ответить на вопросы
6. Готово!
```

**Время:** 1.5-3 часа (большую часть времени Claude работает сам)
**Результат:** Полная документация на GitHub, доступна всей команде!
