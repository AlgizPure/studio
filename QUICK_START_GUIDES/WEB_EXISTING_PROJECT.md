# Quick Start: Existing Project (Web Claude Code)

**Вернуться к выбору сценария:** → **[00_START_HERE.md](../00_START_HERE.md)**

**Сценарий:** Существующий проект на GitHub, используя claude.ai/code (браузер)

---

## Prerequisites

Необходимое:
- ✅ GitHub аккаунт
- ✅ Существующий проект в GitHub репозитории
- ✅ Доступ к https://claude.ai/code
- ✅ Браузер (Chrome, Firefox, Safari)

---

## ⚠️ Важные Ограничения

### Web Claude Code НЕ может:

❌ Читать файлы вне репозитория
❌ Анализировать код в parent directory (как в CLI версии)
❌ Работать с кодом в другом репозитории напрямую

### Web Claude Code МОЖЕТ:

✅ Анализировать код В ТОМ ЖЕ репозитории
✅ Читать код через GitHub API (если дать URL репозитория)
✅ Создавать документацию на основе кода + сырых данных

**Главное отличие от CLI:** Код и template должны быть в одном репозитории ИЛИ Claude работает через GitHub API (медленнее).

---

## Два Варианта Работы

### Вариант A: Одн репозиторий (Код + Документация)

**Структура:**
```
my-existing-project/          # Один репозиторий
├── src/                      # Ваш существующий код
├── docs/                     # Документация (из template)
├── .cursorrules              # Из template
├── .clauderules              # Из template
└── package.json
```

**Подходит для:**
- ✅ Небольших и средних проектов
- ✅ Когда документация часть основного repo
- ✅ Когда команда работает в одном месте

### Вариант B: Раздельные репозитории (Рекомендуется)

**Структура:**
```
my-project/                   # Репозиторий 1: Код
├── src/
└── package.json

my-project-docs/              # Репозиторий 2: Документация (из template)
├── 00_RAW_DATA_TEMPLATE/
├── 01_BOOTSTRAP_CONFIG/
├── 02_PROJECT_STRUCTURE/
└── metadata.yaml → ссылается на my-project
```

**Подходит для:**
- ✅ Больших проектов
- ✅ Когда документация и код эволюционируют отдельно
- ✅ Когда хочется держать docs отдельно
- ✅ **Лучше для Web Claude Code** (проще анализ через API)

---

## Вариант A: Один Репозиторий

### Шаги

#### 1. Клонировать существующий проект

```bash
git clone https://github.com/your-username/my-existing-project.git
cd my-existing-project
```

#### 2. Скачать template и скопировать файлы

```bash
# Скачать template во временную папку
cd /tmp
git clone https://github.com/AlgizPure/project-management-template.git

# Вернуться в ваш проект
cd ~/my-existing-project

# Скопировать нужные папки из template
cp -r /tmp/project-management-template/00_RAW_DATA_TEMPLATE ./
cp -r /tmp/project-management-template/01_BOOTSTRAP_CONFIG ./
cp -r /tmp/project-management-template/02_PROJECT_STRUCTURE ./
cp -r /tmp/project-management-template/03_AUTOMATION ./

# Скопировать AI правила
cp /tmp/project-management-template/02_PROJECT_STRUCTURE/AI_INSTRUCTIONS/.cursorrules ./
cp /tmp/project-management-template/02_PROJECT_STRUCTURE/AI_INSTRUCTIONS/.clauderules ./

# Очистить временную папку
rm -rf /tmp/project-management-template
```

**Структура после копирования:**
```
my-existing-project/
├── src/                          # Существующий код
├── 00_RAW_DATA_TEMPLATE/         # Новое (template)
├── 01_BOOTSTRAP_CONFIG/          # Новое (template)
├── 02_PROJECT_STRUCTURE/         # Новое (template)
├── 03_AUTOMATION/                # Новое (template)
├── .cursorrules                  # Новое (template)
├── .clauderules                  # Новое (template)
└── package.json                  # Существующее
```

#### 3. Добавить сырые данные

```bash
# Чаты о проекте
cp ~/Downloads/project-discussions.txt 00_RAW_DATA_TEMPLATE/chats/

# Существующая документация (если есть)
cp README.md 00_RAW_DATA_TEMPLATE/documents/existing-readme.md
cp docs/* 00_RAW_DATA_TEMPLATE/documents/ 2>/dev/null || true

# Заметки
cp ~/Notes/project-requirements.txt 00_RAW_DATA_TEMPLATE/notes/
```

#### 4. Обновить metadata.yaml

Отредактировать `00_RAW_DATA_TEMPLATE/metadata.yaml`:

```yaml
# AUTO-FILL MODE
# Claude Code will read raw data AND existing code in src/

# EXISTING PROJECT MODE
existing_project:
  enabled: true
  github_repo: "https://github.com/your-username/my-existing-project"
  code_location: "src/"  # В том же репозитории
  # Claude Code will analyze existing code automatically

project:
  name: ""  # Will be auto-filled
  type: ""  # Will be detected from package.json + code
```

#### 5. Закоммитить и запушить

```bash
# Добавить все новые файлы
git add 00_RAW_DATA_TEMPLATE/ 01_BOOTSTRAP_CONFIG/ 02_PROJECT_STRUCTURE/ 03_AUTOMATION/
git add .cursorrules .clauderules

# Коммит
git commit -m "Add project management template system

- Template v1.0.1 from github.com/AlgizPure/project-management-template
- Added raw data for bootstrap
- Ready for documentation generation"

# Пуш
git push origin main
```

#### 6. Открыть Web Claude Code

1. https://claude.ai/code
2. "Connect repository"
3. Выбрать `your-username/my-existing-project`
4. Connect

#### 7. Использовать готовый промпт

**Используй ПОЛНЫЙ промпт из:**
→ **`01_BOOTSTRAP_CONFIG/BOOTSTRAP_START_PROMPT.md`** → **Сценарий 4** (Web + Существующий проект)

**Адаптация для Варианта A (один репозиторий):**
1. Открой `01_BOOTSTRAP_CONFIG/BOOTSTRAP_START_PROMPT.md` в репозитории
2. Найди "СЦЕНАРИЙ 4: WEB (GITHUB) + СУЩЕСТВУЮЩИЙ ПРОЕКТ"
3. Скопируй промпт от `---НАЧАЛО ПРОМПТА---` до `---КОНЕЦ ПРОМПТА---`
4. Вставь в Claude Code

**Что произойдет:**
Claude Code через GitHub API:
- Прочитает все @инструкции
- Проанализирует код в `src/` через GitHub API
- Извлечет tech stack из package.json
- Определит реализованные фичи из структуры файлов
- Запустит полный bootstrap с анализом кода

⚠️ **Примечание:** 
Анализ через GitHub API медленнее локального, но работает корректно.

#### 8. Claude анализирует и генерирует документацию

В чате увидите прогресс:
```
✓ Анализирую src/...
  - package.json: React 18, Express 4, Prisma 4
  - src/auth/: Authentication module found
  - src/users/: User CRUD found
  - src/dashboard/: Dashboard partial (no charts)

✓ Читаю сырые данные...
  - Обнаружено 5 файлов в chats/
  - Извлекаю требования...

✓ Сравниваю код vs требования...
  - Authentication: ✅ Done (в коде)
  - User Management: ✅ Done (в коде)
  - Dashboard Charts: ❌ Planned (в требованиях, не в коде)
  - Notifications: ❌ Planned (в требованиях, не в коде)

✓ Анализирую tech stack...
  - React 18.2 → React 19 recommended
  - Prisma 4.12 → Prisma 5 recommended
  - TypeScript 5.0 → 5.3 recommended

Claude: "Обнаружил 3 устаревшие зависимости.
        Рекомендации готовы. Одобрить обновления?"

Вы: "Одобрить TypeScript и Prisma, React отложить"

✓ Создаю документацию...
✓ Committed: "Add PROJECT_CORE documentation with code analysis"
✓ Committed: "Add TECH_STACK with modernization plan"
✓ Committed: "Add CONTEXT_MEMORY and status tracking"

Bootstrap complete! Документация готова.
```

#### 9. Проверить на GitHub

```
https://github.com/your-username/my-existing-project/tree/main/02_PROJECT_STRUCTURE
```

Должны появиться:
- ✅ Вся документация заполнена
- ✅ Отражает реальный код + планы
- ✅ Tech stack рекомендации в TECH_STACK.md
- ✅ Текущий статус в CONTEXT_MEMORY/state.md

---

## Вариант B: Раздельные Репозитории (Рекомендуется)

### Преимущества:

✅ Документация не засоряет код репозиторий
✅ Можно держать docs private, а код public (или наоборот)
✅ Проще для Web Claude Code (один repo = один фокус)
✅ Docs и код эволюционируют независимо

### Шаги

#### 1. Создать documentation репозиторий из template

1. https://github.com/AlgizPure/project-management-template
2. "Use this template" → "Create a new repository"
3. Название: `my-project-docs`
4. Visibility: Public или Private
5. Create repository

**Результат:**
```
https://github.com/your-username/my-project-docs
```

#### 2. Клонировать docs репозиторий

```bash
git clone https://github.com/your-username/my-project-docs.git
cd my-project-docs
```

#### 3. Обновить metadata.yaml для cross-repository анализа

Отредактировать `00_RAW_DATA_TEMPLATE/metadata.yaml`:

```yaml
# AUTO-FILL MODE
# Claude Code will analyze code via GitHub API

# EXISTING PROJECT MODE (cross-repository)
existing_project:
  enabled: true
  github_repo: "https://github.com/your-username/my-existing-project"
  code_location: "https://github.com/your-username/my-existing-project"
  # Claude will analyze via GitHub API (slower but works)

project:
  name: ""  # Will be auto-filled
  type: ""  # Will be detected
```

**Важно:** `code_location` теперь полный GitHub URL (не относительный путь).

#### 4. Добавить сырые данные

```bash
# Скопировать чаты, документы, заметки
cp ~/Downloads/project-chats.txt 00_RAW_DATA_TEMPLATE/chats/
cp ~/Documents/requirements.md 00_RAW_DATA_TEMPLATE/documents/

# Можно добавить ссылки на код
echo "https://github.com/your-username/my-existing-project/blob/main/src/auth/login.ts" > 00_RAW_DATA_TEMPLATE/notes/existing-code-links.txt
```

#### 5. Закоммитить и запушить

```bash
git add 00_RAW_DATA_TEMPLATE/
git commit -m "Add raw data for bootstrap (existing project)"
git push origin main
```

#### 6. Открыть Web Claude Code

1. https://claude.ai/code
2. "Connect repository"
3. Выбрать `your-username/my-project-docs` (НЕ основной проект!)
4. Connect

#### 7. Использовать готовый промпт

**Используй тот же промпт:**
→ **`01_BOOTSTRAP_CONFIG/BOOTSTRAP_START_PROMPT.md`** → **Сценарий 4** (Web + Существующий проект)

**Адаптация для Варианта B (раздельные репозитории):**

В `metadata.yaml` уже указан `code_location` на другой репозиторий:
```yaml
existing_project:
  enabled: true
  code_location: "https://github.com/your-username/my-existing-project"
```

Claude Code автоматически поймет что нужно анализировать код через GitHub API из другого репозитория.

**Используй тот же полный промпт - он работает для обоих вариантов!**

#### 8. Claude анализирует через GitHub API

**Процесс (медленнее чем локальный анализ):**

```
✓ Читаю основной проект через GitHub API...
  GET https://github.com/your-username/my-existing-project/blob/main/package.json
  - Dependencies: React 18, Express 4, ...

✓ Анализирую структуру src/...
  GET https://github.com/your-username/my-existing-project/tree/main/src
  - src/auth/ found
  - src/users/ found
  - src/dashboard/ found

✓ Читаю ключевые файлы...
  GET .../src/auth/login.ts
  - JWT authentication detected

✓ Читаю сырые данные из my-project-docs...

✓ Сравниваю...
  - Authentication: ✅ (код) + JWT (обнаружено в login.ts)
  - Notifications: ❌ (только в планах)

Claude: "Анализ завершён. Обнаружено 3 модуля в коде.
        В сырых данных упоминается 5 модулей.
        2 модуля не реализованы: Notifications, Export PDF.
        Подтверждаете?"

Вы: "Да, эти 2 в планах"

✓ Генерирую документацию в my-project-docs...
✓ Committed: "Add documentation reflecting my-existing-project code"
```

#### 9. Проверить документацию

```
https://github.com/your-username/my-project-docs/blob/main/02_PROJECT_STRUCTURE/PROJECT_CORE/01_PRD.md
```

**Документация будет включать:**

```markdown
## Features Status

| Feature        | Status      | Implementation                              |
|----------------|-------------|---------------------------------------------|
| Authentication | ✅ DONE     | [src/auth/](https://github.com/your-username/my-existing-project/tree/main/src/auth) |
| User CRUD      | ✅ DONE     | [src/users/](https://github.com/your-username/my-existing-project/tree/main/src/users) |
| Dashboard      | 🔄 PARTIAL  | [src/dashboard/](https://github.com/your-username/my-existing-project/tree/main/src/dashboard) (missing charts) |
| Notifications  | 📋 PLANNED  | Not started                                 |
| Export PDF     | 📋 PLANNED  | Not started                                 |
```

**Ссылки на код** в основном репозитории!

#### 10. Связать репозитории

**В основном проекте (my-existing-project):**

Обновить `README.md`:
```markdown
## Documentation

Full project documentation available in separate repository:
📚 [Project Documentation](https://github.com/your-username/my-project-docs)

- [Product Requirements](https://github.com/your-username/my-project-docs/blob/main/02_PROJECT_STRUCTURE/PROJECT_CORE/01_PRD.md)
- [Tech Stack](https://github.com/your-username/my-project-docs/blob/main/02_PROJECT_STRUCTURE/PROJECT_CORE/03_TECH_STACK.md)
- [Architecture](https://github.com/your-username/my-project-docs/blob/main/02_PROJECT_STRUCTURE/PROJECT_CORE/04_ARCHITECTURE.md)
```

**В docs репозитории (my-project-docs):**

`README.md` уже ссылается на основной проект через metadata.yaml.

---

## Cross-Repository Analysis

### Как работает анализ через GitHub API:

#### Что Claude может анализировать:

✅ **package.json** - dependencies, scripts
✅ **README.md** - описание проекта
✅ **Структура папок** - какие модули существуют
✅ **Отдельные файлы** - если указать конкретные пути
✅ **Public репозитории** - полный доступ через API
✅ **Private репозитории** - если Claude авторизован

#### Ограничения vs локальный анализ (CLI):

⚠️ **Медленнее** - каждый запрос к API ~1-2 секунды
⚠️ **Не все файлы** - Claude выбирает ключевые (package.json, основные модули)
⚠️ **Нет deep анализа** - не читает все 500 файлов, только важные
⚠️ **Rate limits** - GitHub API ограничивает запросы (5000/час для authenticated)

#### Когда работает хорошо:

✅ Проект структурирован (src/moduleName/ pattern)
✅ package.json информативен
✅ README.md актуален
✅ Public репозиторий ИЛИ Private с авторизацией

#### Когда НЕ работает хорошо:

❌ Огромный проект (1000+ файлов) - слишком долго
❌ Монолитный код (всё в одном файле) - сложно анализировать
❌ Private без авторизации

### Пример анализа через API:

**Запрос Claude:**
```
"Анализируй https://github.com/user/my-project"
```

**Что делает Claude:**

1. **GET /repos/user/my-project**
   - Название, описание, язык
   - → "Project: TaskFlow, Language: TypeScript"

2. **GET /repos/user/my-project/contents/package.json**
   - Dependencies
   - → "React 18, Express 4, Prisma 4 detected"

3. **GET /repos/user/my-project/contents/src**
   - Список папок
   - → "Modules: auth, users, dashboard, config"

4. **GET /repos/user/my-project/contents/src/auth/login.ts**
   - Чтение ключевого файла
   - → "JWT authentication implementation found"

5. **GET /repos/user/my-project/contents/README.md**
   - Описание проекта
   - → "User management platform for remote teams"

**Результат:**
```
Tech Stack: React 18, Express 4, TypeScript, Prisma 4, PostgreSQL
Modules: Authentication (✅), Users (✅), Dashboard (🔄), ...
Description: User management platform for remote teams
```

---

## Ограничения vs CLI Version

### CLI Existing Project:

```bash
# CLI может читать локальные файлы напрямую
cd my-project/.template-system/
# Claude читает ../src/* напрямую (быстро, все файлы)
```

### Web Existing Project:

```bash
# Web читает через GitHub API (медленно, выборочно)
# ИЛИ код в том же репозитории (быстрее)
```

### Сравнение:

| Аспект                      | CLI              | Web (Same Repo)  | Web (Cross-Repo) |
|-----------------------------|------------------|------------------|------------------|
| Скорость анализа            | ✅ Быстро        | ✅ Быстро        | ⚠️ Медленно      |
| Полнота анализа             | ✅ Все файлы     | ✅ Все файлы     | ⚠️ Выборочно     |
| Нужен git push              | ❌ Нет           | ✅ Да            | ✅ Да            |
| Работа с private repo       | ✅ Да (локально) | ✅ Да            | ⚠️ С авторизацией|
| Чувствительные данные       | ✅ Локально      | ⚠️ На GitHub     | ⚠️ На GitHub     |
| Раздельные repos (code/docs)| ✅ Легко         | ❌ Сложно        | ✅ Легко         |

**Рекомендация:**
- **CLI:** Если можете - используйте CLI (быстрее, полнее)
- **Web (Same Repo):** Если код + docs в одном repo - работает хорошо
- **Web (Cross-Repo):** Если хотите раздельные repos - работает, но медленнее

---

## Примеры Сценариев

### Сценарий 1: Небольшой проект (одни repo)

**Проект:** 3,000 строк кода, 5 модулей, public repo

**Подход:** Вариант A (один репозиторий)

**Процесс:**
```
1. Скопировать template файлы в существующий проект
2. Добавить сырые данные
3. git push
4. Web Claude Code → bootstrap
5. Документация в том же repo: docs/
```

**Время:** 2 часа (анализ быстрый, всё в одном месте)

### Сценарий 2: Средний проект (раздельные repos)

**Проект:** 20,000 строк, 15 модулей, private repo, команда 5 человек

**Подход:** Вариант B (раздельные репозитории)

**Процесс:**
```
1. Создать my-project-docs из template
2. Настроить metadata.yaml с ссылкой на my-project
3. Добавить сырые данные
4. git push docs
5. Web Claude Code → bootstrap (анализ через API)
6. Команда читает docs в отдельном repo
```

**Преимущества:**
- Docs и code не смешиваются
- Можно настроить разные permissions (кто видит docs vs code)
- Docs эволюционируют отдельно

**Время:** 3-4 часа (анализ через API медленнее)

### Сценарий 3: Большой проект (ручная помощь)

**Проект:** 100,000 строк, 50 модулей, monorepo

**Подход:** Комбинированный

**Проблема:** Автоматический анализ через API слишком долгий (rate limits)

**Решение:**
```
1. Создать my-project-docs (раздельный repo)
2. ВРУЧНУЮ добавить key files в 00_RAW_DATA_TEMPLATE/code/:
   - package.json
   - src/index.ts
   - src/core-modules/ (только ключевые)
3. Добавить текстовое описание архитектуры в documents/
4. Bootstrap - Claude использует эти файлы вместо API анализа
5. После bootstrap: дополнить документацию вручную (специфика больших проектов)
```

**Время:** 4-6 часов (частично автоматически, частично вручную)

---

## Troubleshooting

### Проблема: Claude не может прочитать private repo через API

**Причина:** Нет авторизации для доступа к private репозиториям

**Решение:**
```
Вариант 1: Сделать repo public (временно)
- Settings → Danger Zone → Change visibility → Public
- После bootstrap → обратно Private

Вариант 2: Добавить key файлы вручную
- Скопировать package.json, key files в docs repo
- 00_RAW_DATA_TEMPLATE/code/package.json
- 00_RAW_DATA_TEMPLATE/code/src/key-file.ts
- Claude анализирует эти файлы вместо API

Вариант 3: Использовать CLI версию (рекомендуется)
- См. CLI_EXISTING_PROJECT.md
```

### Проблема: Анализ через API слишком долгий

**Причина:** Слишком много файлов в проекте

**Решение:**
```
"Claude, не анализируй весь проект через API.
Используй только:
- package.json
- README.md
- src/auth/ (основной модуль)
- src/users/ (основной модуль)

Для остальных модулей используй сырые данные из 00_RAW_DATA_TEMPLATE/."
```

### Проблема: GitHub API rate limit exceeded

**Причина:** Слишком много запросов к GitHub API

**Решение:**
```
Подождать 1 час (rate limit reset)

ИЛИ:

Авторизоваться в GitHub (повышает лимит с 60 до 5000 запросов/час):
- Claude Code обычно использует ваш GitHub token автоматически
- Проверить: Settings → Connected accounts → GitHub
```

### Проблема: Документация не отражает последние изменения в коде

**Причина:** Код обновился после bootstrap

**Решение:**
```
Re-bootstrap (partial):

"Claude, обнови только CONTEXT_MEMORY/state.md и PRD.md.
Прочитай последние изменения в:
https://github.com/user/my-project/commits/main

Обнови статус модулей:
- Что изменилось с последнего bootstrap?"

ИЛИ:

Использовать .cursorrules в основном проекте:
- Копировать .cursorrules из template в код repo
- При каждом изменении кода AI обновит state.md автоматически
```

---

## Следующие Шаги

После завершения bootstrap:

### 1. Проверить документацию

**Одни repo (Вариант A):**
```
https://github.com/your-username/my-existing-project/tree/main/02_PROJECT_STRUCTURE
```

**Раздельные repos (Вариант B):**
```
https://github.com/your-username/my-project-docs/tree/main/02_PROJECT_STRUCTURE
```

**Проверить:**
- ✅ PRD отражает реальные фичи (done vs planned)
- ✅ TECH_STACK показывает текущие технологии
- ✅ Рекомендации по modernization есть
- ✅ state.md показывает текущий прогресс

### 2. Применить tech stack рекомендации (опционально)

```bash
# В основном проекте (код)
cd my-existing-project

# Применить безопасные обновления
npm install typescript@5.3
npm install prisma@latest @prisma/client@latest

# Тестировать
npm run build
npm test

# Коммит
git commit -am "chore: Update TypeScript and Prisma (from modernization plan)"
```

### 3. Связать репозитории (если раздельные)

**Обновить README основного проекта:**
```markdown
## 📚 Documentation

Complete project documentation:
[my-project-docs](https://github.com/your-username/my-project-docs)

Key documents:
- [Requirements (PRD)](https://github.com/your-username/my-project-docs/blob/main/02_PROJECT_STRUCTURE/PROJECT_CORE/01_PRD.md)
- [Tech Stack](https://github.com/your-username/my-project-docs/blob/main/02_PROJECT_STRUCTURE/PROJECT_CORE/03_TECH_STACK.md)
- [Current Status](https://github.com/your-username/my-project-docs/blob/main/02_PROJECT_STRUCTURE/CONTEXT_MEMORY/state.md)
```

### 4. Настроить AI helpers в основном проекте

```bash
# Скопировать .cursorrules и .clauderules в код repo
cd my-existing-project
cp ../my-project-docs/02_PROJECT_STRUCTURE/AI_INSTRUCTIONS/.cursorrules ./
cp ../my-project-docs/02_PROJECT_STRUCTURE/AI_INSTRUCTIONS/.clauderules ./

git add .cursorrules .clauderules
git commit -m "Add AI helpers for context preservation"
git push
```

**Результат:** AI будет обновлять state.md при изменениях кода.

### 5. Поделиться с командой

```
"Команда! Документация проекта готова:
https://github.com/your-username/my-project-docs

Прочитайте:
1. PROJECT_ESSENCE - зачем проект
2. PRD - что делаем (готово vs в планах)
3. TECH_STACK - на чём строим + plan модернизации

Questions welcome в Discussions!"
```

---

## Сравнение с CLI Existing Project

См. также: [CLI_EXISTING_PROJECT.md](CLI_EXISTING_PROJECT.md)

**Основные отличия:**

| Аспект                         | CLI                      | Web                        |
|--------------------------------|--------------------------|----------------------------|
| Анализ кода                    | ✅ Локально (быстро)     | ⚠️ GitHub API (медленно)   |
| Доступ к private code          | ✅ Всегда                | ⚠️ Требует авторизации     |
| Код вне репозитория (../)      | ✅ Да                    | ❌ Нет                     |
| Раздельные repos               | ✅ Легко                 | ✅ Да (через API)          |
| Чувствительные данные локально | ✅ Да                    | ❌ Всё на GitHub           |
| Автоматические commits         | ❌ Вручную               | ✅ Да                      |
| Прогресс виден команде         | После push               | ✅ Сразу                   |

**Выбор:**
- **CLI:** Большие проекты, private code, чувствительные данные
- **Web:** Средние проекты, public/private на GitHub, командная работа

---

**Готовы добавить документацию к существующему проекту через Web?** 🚀

**Вариант A (один repo):**
```
1. Скопировать template файлы в проект
2. Добавить сырые данные, push
3. https://claude.ai/code → connect
4. Bootstrap
```

**Вариант B (раздельные repos):**
```
1. "Use template" → my-project-docs
2. metadata.yaml → ссылка на основной проект
3. Добавить сырые данные, push docs
4. https://claude.ai/code → connect docs
5. Bootstrap (анализ через API)
```

**Время:** 2-4 часа
**Результат:** Документация, отражающая реальный код + планы!
