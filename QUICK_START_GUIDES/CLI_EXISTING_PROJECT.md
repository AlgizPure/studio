# Quick Start: Existing Project (CLI Claude Code)

**Вернуться к выбору сценария:** → **[00_START_HERE.md](../00_START_HERE.md)**

**Сценарий:** Существующий код в GitHub, добавление системы документации

---

## Prerequisites

Необходимые инструменты:
- ✅ Node.js (v18+)
- ✅ npm
- ✅ claude-code CLI установлен (`npm install -g @anthropic-ai/claude-code`)
- ✅ Существующий проект с кодом
- ✅ Git

---

## Шаги Запуска

### 1. Клонировать template В существующий проект

```bash
# Перейти в ваш существующий проект
cd ~/my-existing-project

# Клонировать template в подпапку
git clone https://github.com/AlgizPure/project-management-template.git .template-system

# Перейти в template систему
cd .template-system
```

**Структура после клонирования:**
```
my-existing-project/
├── src/                    # Ваш существующий код
├── package.json
├── README.md
└── .template-system/       # Система документации (template)
    ├── 00_RAW_DATA_TEMPLATE/
    ├── 01_BOOTSTRAP_CONFIG/
    ├── 02_PROJECT_STRUCTURE/
    └── 03_AUTOMATION/
```

### 2. Собрать сырые данные

Добавить материалы проекта в `.template-system/00_RAW_DATA_TEMPLATE/`:

```bash
# Переписки о проекте
cp ~/Downloads/project-chats.txt 00_RAW_DATA_TEMPLATE/chats/

# Существующая документация (если есть)
cp ../README.md 00_RAW_DATA_TEMPLATE/documents/existing-readme.md
cp ../docs/* 00_RAW_DATA_TEMPLATE/documents/

# Заметки и требования
cp ~/Notes/features-todo.txt 00_RAW_DATA_TEMPLATE/notes/
```

**Важно:** НЕ копируйте код в `00_RAW_DATA_TEMPLATE/code/`.
Claude Code будет анализировать код напрямую из родительской директории (`../`).

### 3. Обновить metadata.yaml для существующего проекта

Отредактировать `00_RAW_DATA_TEMPLATE/metadata.yaml`:

```yaml
# AUTO-FILL MODE
# Leave sections below empty or partially filled.
# Claude Code will read raw data AND existing code, then ask questions.

# EXISTING PROJECT MODE
existing_project:
  enabled: true  # ← Установить в true!
  github_repo: "https://github.com/username/my-existing-project"
  code_location: "../"  # Родительская директория
  # Claude Code will analyze existing code automatically

project:
  name: ""  # Will be filled during bootstrap
  type: ""  # Will be detected from code + raw data
  # ... остальное оставить пустым (AUTO-FILL)
```

**Ключевые параметры:**
- `existing_project.enabled: true` - включает режим анализа существующего кода
- `github_repo` - ссылка на GitHub репозиторий (опционально, для документации)
- `code_location: "../"` - путь к коду относительно `.template-system/`

### 4. Запустить Claude Code

```bash
# Находясь в .template-system/
claude
```

### 5. Использовать готовый промпт

**Используй ПОЛНЫЙ промпт из:**
→ **`01_BOOTSTRAP_CONFIG/BOOTSTRAP_START_PROMPT.md`** → **Сценарий 2** (CLI + Существующий проект)

**Как использовать:**
1. Открой файл `01_BOOTSTRAP_CONFIG/BOOTSTRAP_START_PROMPT.md`
2. Найди раздел "СЦЕНАРИЙ 2: CLI + СУЩЕСТВУЮЩИЙ ПРОЕКТ"
3. Скопируй ВСЁ от `---НАЧАЛО ПРОМПТА---` до `---КОНЕЦ ПРОМПТА---`
4. Вставь в терминал Claude Code
5. Отправь

**Что произойдет:**
Claude Code автоматически:
- Прочитает все @ссылки на инструкции
- Обнаружит существующий код в `../src`, `../app` и т.д.
- Проанализирует tech stack, зависимости, реализованные фичи
- Сопоставит код с требованиями из raw data
- Запустит полный bootstrap с анализом существующего проекта

**Критически важно:**
Промпт включает автоматическое обнаружение кода - Claude сам найдет директории с кодом без явного указания.

### 6. Claude Code анализирует существующий код

**Что происходит автоматически:**

#### A. Сканирование кода

```
[→] Analyzing existing code in ../
    ├─ [✓] package.json → dependencies detected
    ├─ [✓] src/**/*.js → features detected
    ├─ [✓] src/**/*.ts → TypeScript setup detected
    ├─ [✓] Analyzing imports → architecture patterns
    └─ [✓] Reading config files (tsconfig, webpack, etc.)
```

**Claude Code определяет:**
- **Tech stack:** Из `package.json`, imports, конфигов
  ```
  Обнаружено:
  - React 18.2.0
  - Express 4.18.2
  - PostgreSQL (из pg library)
  - TypeScript 5.0
  ```

- **Реализованные фичи:** Из анализа кода
  ```
  Обнаружены модули:
  - ✅ Authentication (src/auth/) - IMPLEMENTED
  - ✅ User Management (src/users/) - IMPLEMENTED
  - ✅ Basic Dashboard (src/dashboard/) - PARTIAL (missing charts)
  - ❌ Notifications - NOT FOUND (но упоминается в сырых данных)
  ```

- **Архитектура:** Из структуры файлов
  ```
  Паттерн: MVC-like
  - Controllers: src/controllers/
  - Models: src/models/
  - Views: src/views/
  - Services: src/services/
  ```

- **Устаревшие зависимости:**
  ```
  ⚠️ Устаревшие:
  - React 18.2 → React 19 доступен (Oct 2025)
  - TypeScript 5.0 → 5.3 доступен
  - express 4.18 → 5.0 доступен (breaking changes!)
  ```

#### B. Сравнение с сырыми данными

```
Сырые данные (requirements) vs Код (reality):

✅ Authentication - MATCH (реализовано)
✅ User CRUD - MATCH (реализовано)
⚠️ Dashboard - PARTIAL (базовый UI есть, графики отсутствуют)
❌ Notifications - MISSING (в планах, но не начато)
❌ Export to PDF - MISSING (в сырых данных, не реализовано)
```

### 7. Отвечать на вопросы Claude

Claude задаст вопросы для уточнения:

**Примеры:**

```
Claude: "Обнаружил модуль Authentication уже реализован в src/auth/.
        В сырых данных упоминается OAuth2 интеграция.
        Она уже работает или в планах?"

Вы: "OAuth2 ещё нет, только email/password. OAuth2 в планах."

---

Claude: "В package.json: React 18.2.0 (Nov 2023).
        Доступен React 19 (Oct 2025) с улучшениями.
        Обновить или оставить текущую версию для стабильности?"

Вы: "Обновить до React 19. Мы готовы к миграции."

---

Claude: "Обнаружил Express 4.18. Express 5.0 доступен, но есть breaking changes.
        Рекомендация: остаться на 4.x для MVP, мигрировать позже.
        Согласны?"

Вы: "Да, согласен. Express 4.x достаточно сейчас."

---

Claude: "В сырых данных упоминается функция 'Notifications'.
        В коде не найдена. Приоритет для разработки?"

Вы: "Высокий приоритет. Должна быть в MVP."
```

### 8. Tech Stack Modernization & Recommendations

Claude Code анализирует существующий tech stack и даёт рекомендации:

**Пример вывода:**

```markdown
## 🔍 Existing Tech Stack Analysis

### Current Setup (detected from code):

| Component       | Current Version    | Status          |
|-----------------|--------------------|-----------------|
| Runtime         | Node.js 18.16      | ✅ OK (LTS)     |
| Framework (BE)  | Express 4.18.2     | ✅ OK (stable)  |
| Framework (FE)  | React 18.2.0       | ⚠️ Outdated     |
| Language        | TypeScript 5.0     | ⚠️ Minor update |
| Database        | PostgreSQL 14      | ⚠️ Update avail |
| ORM             | Prisma 4.12        | ⚠️ Outdated     |

### Recommendations (November 2025):

#### 1. React 18.2 → React 19 ✅ RECOMMENDED

**Причины:**
- New React Compiler (автоматическая оптимизация)
- Улучшенный Suspense и transitions
- +30% performance в большинстве случаев
- Breaking changes минимальны (compatible API)

**Миграция:**
```bash
npm install react@19 react-dom@19
npm install @types/react@19 @types/react-dom@19
```

**Усилия:** LOW (1-2 часа тестирования)
**Приоритет:** MEDIUM (можно после MVP)

---

#### 2. TypeScript 5.0 → 5.3 ✅ RECOMMENDED

**Причины:**
- Улучшенный type inference
- Faster compilation
- New features (isolated declarations)

**Миграция:**
```bash
npm install typescript@5.3
```

**Усилия:** MINIMAL (backward compatible)
**Приоритет:** HIGH (быстрая победа)

---

#### 3. Express 4.18 → Express 5.0 ⚠️ POSTPONE

**Причины НЕ обновлять сейчас:**
- Breaking changes (middleware signatures)
- Ecosystem libs могут быть несовместимы
- Express 4.x всё ещё actively maintained

**Рекомендация:** Остаться на Express 4.x до post-MVP
**Приоритет:** LOW (не критично)

---

#### 4. PostgreSQL 14 → PostgreSQL 16 ✅ RECOMMENDED

**Причины:**
- Улучшенная производительность (query parallelism)
- Better monitoring tools
- Security updates

**Миграция:** Обновить Docker image / cloud database version
**Усилия:** MINIMAL (no schema changes needed)
**Приоритет:** MEDIUM

---

#### 5. Prisma 4.12 → Prisma 5.x ✅ RECOMMENDED

**Причины:**
- Better performance (query optimization)
- jsonProtocol enabled by default
- Improved TypeScript types

**Миграция:**
```bash
npm install prisma@latest @prisma/client@latest
npx prisma migrate dev  # Проверить миграции
```

**Усилия:** LOW-MEDIUM (may need migration testing)
**Приоритет:** MEDIUM
```

**Ваше решение:**

```
Claude: "Рекомендую 5 обновлений (см. выше).
        Применить все / выборочно / отложить?"

Вы: "Применить: TypeScript 5.3, Prisma 5.x (быстрые победы)
     Отложить: React 19, PostgreSQL 16 (после MVP)
     Пропустить: Express 5.0 (не нужно)"
```

Claude обновит `TECH_STACK.md` с выбранными решениями + обоснованиями.

### 9. Дождаться завершения bootstrap

Claude Code заполнит документацию, отражающую:

**Документация будет включать:**

#### PROJECT_ESSENCE.md
```markdown
## Current Status

Проект в активной разработке. MVP на 60%.

### Реализованные фичи (✅):
- User authentication (email/password)
- User management (CRUD)
- Basic dashboard UI

### В разработке (🔄):
- Dashboard charts and analytics
- OAuth2 integration

### Запланированные (📋):
- Push notifications
- Export to PDF
- Mobile app
```

#### PRD.md
```markdown
## Features Status

| Feature            | Priority | Status        | Implementation |
|--------------------|----------|---------------|----------------|
| Authentication     | Must     | ✅ DONE       | src/auth/      |
| User Management    | Must     | ✅ DONE       | src/users/     |
| Dashboard (basic)  | Must     | ✅ DONE       | src/dashboard/ |
| Dashboard (charts) | Must     | 🔄 IN PROGRESS| Planned        |
| Notifications      | Must     | 📋 PLANNED    | Not started    |
| Export PDF         | Should   | 📋 PLANNED    | Not started    |
| OAuth2             | Should   | 📋 PLANNED    | Not started    |
```

#### TECH_STACK.md
```markdown
## Current Tech Stack

### Backend
- **Runtime:** Node.js 18.16 (LTS)
- **Framework:** Express 4.18.2 ✅
- **Language:** TypeScript 5.0 → **Updating to 5.3** ⬆️
- **Database:** PostgreSQL 14
- **ORM:** Prisma 4.12 → **Updating to 5.x** ⬆️

### Frontend
- **Framework:** React 18.2.0 (postpone update to 19)
- **State:** Redux Toolkit 1.9
- **Styling:** Tailwind CSS 3.3

### Modernization Plan
1. ✅ TypeScript 5.3 (immediate)
2. ✅ Prisma 5.x (immediate)
3. ⏸️ React 19 (post-MVP)
4. ⏸️ PostgreSQL 16 (post-MVP)
5. ❌ Express 5.0 (not needed)
```

#### ROADMAP.md
```markdown
## Current Phase: MVP Completion

### Already Done (from code analysis):
- ✅ Phase 0: Foundation (authentication, users)
- ✅ Phase 1a: Basic Dashboard UI

### In Progress:
- 🔄 Phase 1b: Dashboard Analytics (charts, metrics)

### Next:
- 📋 Phase 2: Notifications System
- 📋 Phase 3: Export & Reporting
```

#### CONTEXT_MEMORY/state.md
```markdown
## 📍 CURRENT FOCUS

**Phase:** MVP Completion
**Module:** Dashboard Analytics
**Working On:** Charts integration (Chart.js)

## 💾 IMPLEMENTED FEATURES

- ✅ Authentication system (src/auth/)
  - Email/password login
  - JWT tokens
  - Password reset

- ✅ User management (src/users/)
  - CRUD operations
  - Role-based access
  - Profile management

- ✅ Basic dashboard (src/dashboard/)
  - Layout and navigation
  - User stats display
  - ⚠️ Charts NOT YET implemented

## 📋 NEXT TASKS

1. Integrate Chart.js for dashboard analytics
2. Implement notifications system
3. Add PDF export functionality
```

### 10. Проверить и скопировать документацию

```bash
# Проверить сгенерированную документацию
cat 02_PROJECT_STRUCTURE/PROJECT_CORE/01_PRD.md
cat 02_PROJECT_STRUCTURE/CONTEXT_MEMORY/state.md

# Скопировать документацию в основной проект
cd ..  # Вернуться в my-existing-project/

# Создать папку для документации
mkdir -p docs

# Скопировать ключевые файлы
cp .template-system/02_PROJECT_STRUCTURE/PROJECT_CORE/* docs/
cp .template-system/02_PROJECT_STRUCTURE/AI_INSTRUCTIONS/.cursorrules .
cp .template-system/02_PROJECT_STRUCTURE/AI_INSTRUCTIONS/.clauderules .

# Опционально: скопировать систему трекинга
cp -r .template-system/02_PROJECT_STRUCTURE/CONTEXT_MEMORY docs/
cp -r .template-system/02_PROJECT_STRUCTURE/PROGRESS_TRACKING docs/
```

**Структура после копирования:**
```
my-existing-project/
├── src/                    # Ваш код
├── docs/                   # Новая документация
│   ├── 00_PROJECT_ESSENCE.md
│   ├── 01_PRD.md
│   ├── 02_ROADMAP.md
│   ├── 03_TECH_STACK.md
│   ├── 04_ARCHITECTURE.md
│   ├── CONTEXT_MEMORY/
│   └── PROGRESS_TRACKING/
├── .cursorrules            # AI integration для Cursor
├── .clauderules            # AI integration для Claude Code
├── package.json
└── .template-system/       # Можно оставить для обновлений
```

### 11. Коммит документации

```bash
git add docs/ .cursorrules .clauderules
git commit -m "docs: Add project documentation system

- Generated via project-management-template v1.0.1
- Reflects existing code + planned features
- Includes tech stack modernization plan
- AI integration configured (.cursorrules, .clauderules)"

git push
```

---

## Understanding Existing Code Analysis

### Что Claude Code анализирует автоматически:

#### 1. Tech Stack Detection

**Источники:**
- `package.json` → dependencies, devDependencies
- `tsconfig.json` / `jsconfig.json` → language setup
- Dockerfile → runtime environment
- Config files → framework choices (webpack, vite, next.config, etc.)

**Пример анализа:**
```json
// package.json
{
  "dependencies": {
    "react": "^18.2.0",      → Frontend: React 18
    "express": "^4.18.2",    → Backend: Express 4
    "prisma": "^4.12.0",     → ORM: Prisma 4
    "@prisma/client": "^4.12.0"
  }
}
```

→ Claude: "Обнаружен fullstack проект (React + Express + Prisma)"

#### 2. Features Detection

**Анализ структуры:**
```
src/
├── auth/           → Claude: "Authentication module found"
│   ├── login.ts
│   ├── register.ts
│   └── jwt.ts      → "JWT-based auth"
├── users/          → "User management found"
├── dashboard/      → "Dashboard module found"
└── config/
```

**Анализ кода:**
```typescript
// src/auth/login.ts
export async function loginUser(email: string, password: string) {
  // ... bcrypt password check
  // ... JWT generation
}
```

→ Claude: "Email/password authentication implemented. No OAuth detected."

#### 3. Architecture Patterns

**Из структуры файлов:**
```
src/
├── controllers/    → "MVC pattern detected"
├── models/
├── views/
├── services/       → "Service layer present"
└── utils/
```

**Из imports:**
```typescript
import { PrismaClient } from '@prisma/client'
// → "Repository pattern via Prisma"

import { Router } from 'express'
// → "Express routing"

import { createSlice } from '@reduxjs/toolkit'
// → "Redux for state management"
```

#### 4. Gaps & Missing Features

**Сравнение сырых данных и кода:**

Сырые данные говорят: "Push notifications для алертов"
Код: `grep -r "notification" src/` → NOT FOUND

→ Claude: "Notifications упоминаются в requirements, но отсутствуют в коде. Добавить в TODO?"

---

## Modernization Recommendations

### Процесс анализа устаревших технологий:

#### Шаг 1: Инвентаризация

Claude Code собирает:
```yaml
Current Stack:
  - React: 18.2.0 (released: Nov 2023)
  - TypeScript: 5.0.0 (released: Mar 2023)
  - Express: 4.18.2 (released: Oct 2022)
  - Prisma: 4.12.0 (released: Mar 2023)
  - PostgreSQL: 14.x (released: Sep 2021)
```

#### Шаг 2: Проверка актуальности (текущая дата: Nov 2025)

```yaml
Latest Versions (Nov 2025):
  - React: 19.0.0 (released: Oct 2025) ⚠️ 2 года разницы
  - TypeScript: 5.3.0 (released: Aug 2025) ⚠️ Minor update
  - Express: 5.0.0 (released: Jan 2025) ⚠️ Breaking changes
  - Prisma: 5.x (released: Jul 2024) ⚠️ 1+ год разницы
  - PostgreSQL: 16.x (released: Sep 2024) ⚠️ 3 версии разницы
```

#### Шаг 3: Анализ усилий миграции

```yaml
Migration Effort Assessment:

React 18 → 19:
  Breaking Changes: Minimal (API compatible)
  Effort: LOW (testing mostly)
  Benefit: HIGH (performance, new features)
  Risk: LOW

Express 4 → 5:
  Breaking Changes: Significant (middleware API)
  Effort: MEDIUM (refactor middleware)
  Benefit: MEDIUM (better async support)
  Risk: MEDIUM (ecosystem compatibility)

Prisma 4 → 5:
  Breaking Changes: Minor (config changes)
  Effort: LOW (migration script available)
  Benefit: MEDIUM (performance)
  Risk: LOW
```

#### Шаг 4: Приоритизация

Claude Code рекомендует порядок:

```markdown
## Recommended Modernization Roadmap

### Immediate (This Sprint):
1. ✅ TypeScript 5.0 → 5.3
   - Effort: 10 minutes
   - Risk: None
   - Benefit: Free performance + features

2. ✅ Prisma 4.12 → 5.x
   - Effort: 1-2 hours (testing)
   - Risk: Low
   - Benefit: Better performance, improved types

### Post-MVP (Next Month):
3. ⏸️ React 18 → 19
   - Effort: 4-8 hours (testing, validation)
   - Risk: Low
   - Benefit: Performance improvement

4. ⏸️ PostgreSQL 14 → 16
   - Effort: 2-4 hours (cloud upgrade + testing)
   - Risk: Low
   - Benefit: Performance, new features

### Later (Post-Launch):
5. ⏸️ Express 4 → 5 (Optional)
   - Effort: 2-3 days (refactoring)
   - Risk: Medium
   - Benefit: Better async support
   - Note: Express 4.x still maintained, not urgent
```

---

## Примеры Сценариев

### Сценарий 1: Проект в активной разработке (50% готовности)

**Исходная ситуация:**
- Код: 5,000 строк
- Фичи: 3 из 8 реализованы
- Документация: README.md (базовый)

**Процесс:**
```bash
1. Clone template в .template-system/
2. Добавить сырые данные (чаты о будущих фичах)
3. Настроить metadata.yaml (existing_project.enabled: true)
4. Bootstrap

Результат:
- Документация отражает 3 готовые + 5 запланированных фич
- Tech stack проанализирован, есть рекомендации
- Roadmap показывает прогресс 50%
- state.md точно описывает текущее состояние
```

### Сценарий 2: Legacy проект (3 года, нужна модернизация)

**Исходная ситуация:**
- Код: 50,000 строк
- React 16, Node 14, устаревшие библиотеки
- Документация: нет или устарела

**Процесс:**
```bash
1. Clone template в .template-system/
2. Собрать старые доки + планы по модернизации
3. Bootstrap с анализом кода

Результат:
- Claude обнаружит ДЕСЯТКИ устаревших зависимостей
- Приоритизирует: critical (security) → high (performance) → low
- Создаст план модернизации на 3-6 месяцев
- Задокументирует текущую архитектуру (для onboarding)
```

**Пример вывода:**
```markdown
## Legacy Tech Stack Modernization

### Critical Updates (Security Risks):
⛔ Node.js 14 → 20 LTS (Node 14 EOL reached!)
⛔ React 16 → 19 (security patches stopped)
⛔ lodash 4.17.15 → 4.17.21 (CVE fixes)

### High Priority (Performance & Features):
⚠️ Webpack 4 → Vite (10x faster builds)
⚠️ Redux → Zustand (simpler, smaller bundle)

### Medium Priority (DX Improvements):
💡 JavaScript → TypeScript (gradual migration)
💡 Enzyme → React Testing Library

Estimated Effort: 3-6 months (with careful planning)
```

### Сценарий 3: Только начали (1 месяц разработки)

**Исходная ситуация:**
- Код: 500 строк (proof of concept)
- Фичи: 1 из 10 реализована
- Документация: нет

**Процесс:**
```bash
1. Clone template
2. Добавить все чаты и планы
3. Bootstrap

Результат:
- Структурированная документация для оставшихся 9 фич
- Tech stack validation (современные ли выборы?)
- Roadmap на 6-12 месяцев
- Чистый старт с правильной базой
```

---

## Troubleshooting

### Проблема: Claude не видит код в родительской директории

**Решение:**
```bash
# Проверить путь в metadata.yaml
cat 00_RAW_DATA_TEMPLATE/metadata.yaml

existing_project:
  code_location: "../"  # Должно быть относительно .template-system/

# Явно указать в промпте
"Читай код в родительской директории: ../src/, ../package.json"
```

### Проблема: Слишком много устаревших зависимостей

**Решение:**
```
"Claude, приоритизируй обновления:
1. Security-критичные (MUST)
2. Breaking changes в библиотеках, которые мы используем (HIGH)
3. Performance improvements (MEDIUM)
4. Nice-to-have (LOW)

Дай план на 3 спринта."
```

### Проблема: Код не соответствует сырым данным

**Причина:** Проект эволюционировал, старые планы неактуальны

**Решение:**
```
"Claude, приоритет: КОД > сырые данные.
Используй сырые данные только для контекста.
Документируй:
1. Что реально есть в коде (главное)
2. Из сырых данных: только то, что всё ещё актуально
3. Устаревшие идеи: пометь как 'deprecated' или удали"
```

---

## Следующие Шаги

После завершения bootstrap:

### 1. Проверить документацию (1 час)

```bash
# Основные файлы
cat docs/01_PRD.md          # Все фичи (готовые + planned)?
cat docs/03_TECH_STACK.md   # Modernization plan согласен?
cat docs/CONTEXT_MEMORY/state.md  # Текущий статус правильный?
```

### 2. Синхронизировать с командой

```bash
# Создать PR с документацией
git checkout -b docs/add-project-documentation
git add docs/ .cursorrules .clauderules
git commit -m "docs: Add comprehensive project documentation"
git push -u origin docs/add-project-documentation

# Создать PR на GitHub
# Пригласить команду на review
```

### 3. Применить tech stack рекомендации

```bash
# Immediate updates (TypeScript, Prisma)
npm install typescript@5.3
npm install prisma@latest @prisma/client@latest

# Test
npm run build
npm test

# Commit
git commit -am "chore: Update TypeScript to 5.3 and Prisma to 5.x"
```

### 4. Начать работу по новой системе

```bash
# Использовать Claude Code с новыми правилами
claude

# При любом изменении кода:
# - .cursorrules обеспечит обновление state.md
# - .clauderules обеспечит обновление decisions.md
# - Документация всегда синхронизирована
```

---

## Особенности vs New Project

### Отличия от нового проекта:

| Аспект                  | New Project              | Existing Project            |
|-------------------------|--------------------------|------------------------------|
| Анализ кода             | ❌ Нет кода              | ✅ Автоматический анализ     |
| Metadata AUTO-FILL      | Только из сырых данных   | Из кода + сырых данных       |
| Tech Stack              | Выбор с нуля             | Анализ текущего + модерниз.  |
| PRD.md                  | Все фичи "planned"       | Разделение done/in prog/plan |
| ROADMAP.md              | С фазы 0                 | Текущая фаза + остаток       |
| state.md                | Пустой (начало)          | Отражает реальный прогресс   |
| Время bootstrap         | 1.5-3 часа               | 2-4 часа (больше анализа)    |

### Преимущества для существующего проекта:

✅ **Быстрое onboarding:** Новые разработчики читают документацию, а не гадают по коду
✅ **Актуальность:** Документация генерируется из реального кода, не устаревает
✅ **Модернизация:** Автоматический анализ устаревших зависимостей
✅ **Планирование:** Roadmap отражает реальный прогресс, не фантазии
✅ **AI integration:** .cursorrules и .clauderules поддерживают документацию актуальной автоматически

---

**Готовы добавить документацию в существующий проект?** 🚀

```bash
cd my-existing-project
git clone https://github.com/AlgizPure/project-management-template.git .template-system
cd .template-system
# Настроить metadata.yaml (existing_project.enabled: true)
# Добавить сырые данные
claude
# "Bootstrap existing project с анализом кода в ../src/"
```

**Ожидаемое время:** 2-4 часа
**Результат:** Полная документация, отражающая реальное состояние + планы!
