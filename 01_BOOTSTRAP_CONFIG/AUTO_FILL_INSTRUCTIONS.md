# Auto-Fill Metadata & Smart Recommendations

Это руководство для Claude Code по автоматическому заполнению metadata.yaml и предоставлению умных рекомендаций.

---

## Process

### Step 1: Initial Scan

**Сканирование сырых данных:**

```
Действия:
1. Прочитать ВСЕ файлы в 00_RAW_DATA_TEMPLATE/
   - chats/*.txt, *.md, *.json
   - documents/*.md, *.txt, *.docx
   - notes/*.txt, *.md
   - code/* (если есть прототипы)

2. Подсчитать статистику:
   - Количество файлов по категориям
   - Общий объём (строки, слова)
   - Диапазон дат (из имён файлов или содержимого)

3. Извлечь ключевую информацию:
   - Название проекта (упоминания, контекст)
   - Тип проекта (web app, mobile, API, etc.)
   - Целевая аудитория (описания пользователей)
   - Ключевые фичи (что упоминается чаще всего)
   - Технологии (React, Node, PostgreSQL, etc.)
   - Даты и Timeline (упоминания сроков)
```

**Пример вывода внутреннего анализа:**
```markdown
SCAN RESULTS:
- Files: 5 chats, 3 documents, 2 notes
- Date range: 2024-09 to 2025-01
- Total words: ~35,000

Key Findings:
- Project Name: "TaskFlow" (15 упоминаний) vs "FlowTask" (2 упоминания)
  → Most likely: TaskFlow

- Project Type: Web Application (clear from context)

- Target Audience: "remote teams 5-15 people" (4 упоминания)

- Core Features (by frequency):
  1. Task board / Kanban (12 упоминаний)
  2. Team collaboration / comments (8 упоминаний)
  3. Time tracking (6 упоминаний)
  4. Notifications (5 упоминаний)
  5. Reports / Analytics (4 упоминания)

- Tech Stack Mentions:
  - Frontend: React 17 (early chats), React 18 (later chats)
  - Backend: Node.js + Express
  - Database: MongoDB (2024-09), PostgreSQL (2024-11, 2025-01)
    ⚠️ CONTRADICTION detected!
  - Hosting: Heroku (early), Railway (later)
```

### Step 2: Interactive Q&A

**Задавать вопросы для уточнения:**

#### Типы вопросов:

**1. Подтверждение очевидного:**
```
"Обнаружил название проекта: 'TaskFlow'. Подтверждаете?"
→ Если пользователь: "Да" → использовать "TaskFlow"
→ Если пользователь: "Нет, называется FlowManager" → использовать ввод пользователя
```

**2. Разрешение противоречий:**
```
"В ранних чатах (2024-09): MongoDB.
В поздних чатах (2024-11, 2025-01): PostgreSQL.
Какой финальный выбор для базы данных?"

→ Пользователь выбирает: MongoDB / PostgreSQL / Другое
```

**3. Уточнение приоритетов:**
```
"Обнаружил 5 ключевых фич:
1. Task board (Must Have)
2. Team collaboration (Must Have)
3. Time tracking (Should Have?)
4. Notifications (Should Have?)
5. Reports (Could Have?)

Подтверждаете приоритеты или изменить?"

→ Пользователь корректирует если нужно
```

**4. Заполнение пробелов:**
```
"Не обнаружил чёткого упоминания сроков MVP.
Планируемый срок разработки:
a) 1-2 месяца
b) 3-4 месяца
c) 6+ месяцев
d) Пока не определён"

→ Пользователь выбирает вариант
```

#### Правила формулирования вопросов:

✅ **Good Questions (краткие, специфичные):**
- "Проект называется 'TaskFlow'?" (да/нет)
- "Целевая аудитория: удалённые команды 5-15 человек?" (да/нет)
- "Финальный выбор БД: PostgreSQL? (в ранних чатах упоминался MongoDB)" (конкретика)
- "Приоритет фичи 'Notifications': Must Have или Should Have?" (выбор из 2 вариантов)

❌ **Bad Questions (избегать):**
- "Расскажите о проекте" (слишком широко, уже есть в сырых данных)
- "Какие технологии хотите использовать?" (уже упоминается в чатах, должен быть конкретный вопрос)
- "Опишите целевую аудиторию" (должен быть конкретный вопрос с вариантами)

#### Количество вопросов:

**Рекомендация:** 5-10 вопросов максимум

**Приоритет вопросов:**
1. **Critical (всегда спрашивать):** Противоречия в данных
2. **High (почти всегда):** Финальные решения по tech stack
3. **Medium (если неясно):** Приоритизация фич
4. **Low (опционально):** Детали, которые можно infer

### Step 3: Tech Stack Analysis

**Анализ упоминаний технологий в сырых данных:**

#### Извлечение упоминаний:

```markdown
Сканировать сырые данные на упоминания:

**Frontend Frameworks:**
- React, Vue, Angular, Svelte, Next.js, Nuxt, Remix, Astro

**Backend:**
- Node.js, Express, Fastify, Nest.js, Python, Django, Flask, FastAPI,
  Ruby on Rails, Go, Rust, Java Spring, PHP Laravel

**Databases:**
- PostgreSQL, MySQL, MongoDB, Redis, SQLite, Supabase, Firebase,
  Cassandra, DynamoDB, etc.

**Cloud/Hosting:**
- AWS, GCP, Azure, Vercel, Netlify, Railway, Render, Fly.io,
  Heroku, DigitalOcean

**State Management:**
- Redux, Zustand, Jotai, Recoil, MobX, Context API

**Styling:**
- Tailwind CSS, CSS Modules, Styled Components, Emotion, Sass

**Других упоминаний:**
- TypeScript, Webpack, Vite, Docker, Kubernetes, GraphQL, tRPC, etc.
```

#### Проверка актуальности (текущая дата: November 2025):

Для каждой обнаруженной технологии:

**1. Извлечь версию (если упоминалась):**
```
Пример: "React 17" → версия 17
Пример: "PostgreSQL" → версия не указана
```

**2. Проверить current best practice (Nov 2025):**
```
React 17 (released: Oct 2020)
→ Latest: React 19 (released: Oct 2025)
→ Gap: 5 лет, 2 major versions behind
→ Recommendation: UPDATE to React 19

PostgreSQL (no version specified)
→ Latest: PostgreSQL 16 (released: Sep 2024)
→ Recommendation: USE PostgreSQL 16

MongoDB (no version)
→ Latest: MongoDB 7.x
→ But: Consider if relational DB better fits requirements
```

**3. Проанализировать fit с требованиями проекта:**
```
Требования (из сырых данных):
- Реляционные данные (users → projects → tasks → comments)
- Transactional consistency важна
- Аналитика и reports

MongoDB: ❌ Не оптимально (документо-ориентированная, слабее для joins)
PostgreSQL: ✅ Отлично (реляционная, поддержка транзакций, JSON тоже есть)

Recommendation: PostgreSQL
```

**4. Учесть размер команды и опыт:**
```
Из additional_context:
- team_size: 1-3
- User familiar with: React, JavaScript

Recommendation:
- Не брать слишком сложные технологии (Kubernetes для малой команды - overkill)
- Использовать знакомые технологии где возможно (React ✅)
- Предпочесть managed services (Vercel/Railway вместо AWS manual setup)
```

#### Генерация рекомендаций:

**Формат вывода в TECH_STACK.md:**

```markdown
## 🔍 Tech Stack Analysis & Recommendations

### Упоминания из сырых данных:

| Component       | Mentioned (Date)       | Version | Status      |
|-----------------|------------------------|---------|-------------|
| Frontend        | React (2024-09)        | 17      | ⚠️ Outdated |
| Frontend        | React (2025-01)        | 18      | ⚠️ Update   |
| Backend         | Express (2024-09)      | 4.x     | ✅ OK       |
| Database        | MongoDB (2024-09)      | -       | ⚠️ Review   |
| Database        | PostgreSQL (2024-11)   | -       | ✅ Better   |
| Hosting         | Heroku (2024-09)       | -       | ⚠️ Expensive|
| Hosting         | Railway (2024-11)      | -       | ✅ Good     |

### Рекомендации (November 2025):

#### 1. Frontend: React 19 ✅ RECOMMENDED

**Из сырых данных:** React 17 → React 18

**Рекомендация:** React 19 (stable since Oct 2025)

**Причины:**
- Новый React Compiler (автоматическая оптимизация, не нужен useMemo/useCallback)
- +30% performance improvement
- Улучшенный Suspense и Server Components
- Backward compatible API (лёгкий upgrade от React 18)

**Migration:** `npm install react@19 react-dom@19`

**Усилия:** LOW (1-2 часа testing)
**Риск:** LOW
**Приоритет:** MEDIUM (можно после MVP, но рекомендуем сразу)

---

#### 2. Database: PostgreSQL 16 ✅ RECOMMENDED

**Из сырых данных:** MongoDB (early) vs PostgreSQL (later)

**Рекомендация:** PostgreSQL 16

**Причины:**
- Ваши данные: реляционная структура (users → projects → tasks)
  ```
  User (1) → Projects (N) → Tasks (N) → Comments (N)
  ```
  → Лучше подходит реляционная БД

- PostgreSQL поддерживает JSON (если нужна гибкость как в MongoDB)
  ```sql
  CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    data JSONB  -- Гибкие данные как в Mongo
  );
  ```

- Transactional consistency (важно для consistency)
- Лучше для analytics и reports
- Более зрелая экосистема

**Альтернатива:** MongoDB подходит ТОЛЬКО если:
- Схема данных очень гибкая и меняется часто
- Нет сложных отношений между сущностями
- Не нужны сложные транзакции

**Ваш случай:** PostgreSQL явно лучше

**Migration:** Н/А (новый проект, выбрать с самого начала)

**Приоритет:** HIGH (фундаментальное решение)

---

#### 3. Hosting: Railway ✅ RECOMMENDED

**Из сырых данных:** Heroku (early) → Railway (later)

**Рекомендация:** Railway ИЛИ Vercel (зависит от архитектуры)

**Сравнение:**

| Критерий           | Heroku         | Railway        | Vercel          |
|--------------------|----------------|----------------|-----------------|
| Цена (месяц)       | $7-25          | $5-20          | $20 (Pro)       |
| PostgreSQL         | ❌ Addon ($9+) | ✅ Встроенный  | ❌ External     |
| Node.js Backend    | ✅ Да          | ✅ Да          | ⚠️ Serverless   |
| Best for           | Fullstack      | Fullstack      | Frontend + API  |
| Free Tier          | ❌ Удалён 2022 | ✅ $5 credit   | ✅ Limited      |

**Рекомендация для вашего проекта:**
- Railway (fullstack monolith с PostgreSQL)
- Vercel (если Frontend + отдельный API / Serverless)

**Ваш случай:** Railway (упоминается в поздних чатах, подходит лучше)

**Migration:** Н/А

**Приоритет:** MEDIUM

---

### Summary:

✅ **Одобрить все рекомендации?**

Рекомендуемый stack:
- Frontend: React 19
- Backend: Node.js + Express 4.x
- Database: PostgreSQL 16
- Hosting: Railway
- Language: TypeScript (если не упоминался → спросить)

**ИЛИ**

⚠️ **Обсудить каждый пункт отдельно?**

**ИЛИ**

❌ **Оставить исходные выборы из сырых данных?**
```

### Step 4: Existing Code Analysis (if applicable)

**Если `existing_project.enabled: true` в metadata.yaml:**

#### A. Сканирование существующего кода:

**Локации кода:**
```
CLI: code_location = "../" (родительская директория)
Web: code_location = URL (GitHub API)
```

**Что читать:**

**1. package.json (обязательно):**
```json
{
  "dependencies": {
    "react": "^18.2.0",        → Frontend: React 18
    "express": "^4.18.2",      → Backend: Express 4
    "prisma": "^4.12.0"        → ORM: Prisma 4
  },
  "devDependencies": {
    "typescript": "^5.0.0"     → Language: TypeScript
  }
}
```

→ Tech stack detected автоматически

**2. Структура папок:**
```
src/
├── auth/          → Authentication module found
├── users/         → User management found
├── dashboard/     → Dashboard module found
└── config/
```

→ Модули detected

**3. Ключевые файлы (выборочно):**
```typescript
// src/auth/login.ts
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export async function loginUser(email, password) {
  // JWT authentication detected
}
```

→ Паттерны detected (JWT auth, bcrypt for passwords)

**4. README.md / docs:**
```markdown
# TaskFlow

User management platform for remote teams.
Features: auth, task board, analytics.
```

→ Описание проекта, уже реализованные фичи

#### B. Сравнение код vs сырые данные:

**Сопоставление:**

```markdown
Сырые данные (requirements):
1. Authentication (email/password + OAuth2)
2. User Management (CRUD)
3. Task Board (Kanban)
4. Team Collaboration (comments)
5. Notifications
6. Time Tracking
7. Analytics / Reports

Существующий код (reality):
1. Authentication (src/auth/) ✅ IMPLEMENTED
   - Email/password: ✅
   - OAuth2: ❌ NOT FOUND
2. User Management (src/users/) ✅ IMPLEMENTED
3. Task Board: ❌ NOT FOUND (возможно в других модулях?)
4. Team Collaboration: ❌ NOT FOUND
5. Notifications: ❌ NOT FOUND
6. Time Tracking: ❌ NOT FOUND
7. Analytics (src/dashboard/) ⚠️ PARTIAL
   - Basic UI: ✅
   - Charts: ❌ NOT FOUND

**Сопоставление:**
- Done: Authentication (partial), User CRUD, Dashboard (basic UI)
- In Progress: Dashboard (missing charts)
- Planned: OAuth2, Task Board, Collaboration, Notifications, Time Tracking, Reports

**Статус проекта:** ~30% готовности (3 из 10 под-фич реализовано)
```

#### C. Проверка устаревших зависимостей:

**Текущая дата: November 2025**

```markdown
Обнаруженные зависимости:

| Package    | Current | Released | Latest (2025) | Gap     | Status      |
|------------|---------|----------|---------------|---------|-------------|
| react      | 18.2.0  | Jun 2022 | 19.0 (Oct 25) | 3 года  | ⚠️ Outdated |
| typescript | 5.0.0   | Mar 2023 | 5.3 (Aug 25)  | 2 года  | ⚠️ Minor    |
| express    | 4.18.2  | Oct 2022 | 5.0 (Jan 25)  | 3 года  | ⚠️ Breaking |
| prisma     | 4.12.0  | Mar 2023 | 5.7 (Nov 25)  | 2+ года | ⚠️ Outdated |
| bcrypt     | 5.1.0   | -        | 5.1.1         | OK      | ✅ Current  |

⚠️ 4 пакета устарели

Recommendations:
1. TypeScript 5.0 → 5.3 (LOW effort, backward compatible)
2. Prisma 4.12 → 5.7 (MEDIUM effort, breaking changes in config)
3. React 18.2 → 19.0 (MEDIUM effort, minimal breaking changes)
4. Express 4.18 → 5.0 (HIGH effort, middleware API changed - отложить)
```

### Step 5: Recommendations Report

**Генерация секции в TECH_STACK.md:**

**Формат:**

````markdown
## 📊 Existing Project Analysis

### Current State (from code analysis):

**Tech Stack in use:**
- Frontend: React 18.2.0
- Backend: Express 4.18.2
- Database: PostgreSQL 14
- ORM: Prisma 4.12.0
- Language: TypeScript 5.0.0

**Implemented Features:**
- ✅ Authentication (email/password, JWT)
- ✅ User Management (CRUD, roles)
- ⚠️ Dashboard (UI only, no charts)

**Missing Features (from requirements):**
- ❌ OAuth2 integration
- ❌ Task Board
- ❌ Notifications
- ❌ Time Tracking
- ❌ Full Analytics

**Progress:** ~30% (3 of 10 sub-features implemented)

---

## 🔄 Current vs Recommended

### Modernization Opportunities (November 2025):

| Component      | Currently Used | Latest Available | Recommendation | Reason                        |
|----------------|----------------|------------------|----------------|-------------------------------|
| React          | 18.2.0 (2022)  | 19.0 (Oct 2025)  | ✅ UPDATE      | New compiler, +30% perf       |
| TypeScript     | 5.0 (2023)     | 5.3 (Aug 2025)   | ✅ UPDATE      | Better inference, faster      |
| Express        | 4.18 (2022)    | 5.0 (Jan 2025)   | ⏸️ POSTPONE   | Breaking changes, not urgent  |
| Prisma         | 4.12 (2023)    | 5.7 (Nov 2025)   | ✅ UPDATE      | Better performance, types     |
| PostgreSQL     | 14 (2021)      | 16 (Sep 2024)    | ⚠️ CONSIDER   | New features, perf            |

### Recommended Actions:

#### Immediate (This Sprint):
1. **TypeScript 5.0 → 5.3** ✅
   - Effort: 10 minutes (`npm install typescript@5.3`)
   - Risk: None (backward compatible)
   - Benefit: Free performance + features

2. **Prisma 4.12 → 5.7** ✅
   - Effort: 1-2 hours (update config, test migrations)
   - Risk: Low (config changes documented)
   - Benefit: Better query performance, improved types

#### Post-MVP (After Launch):
3. **React 18.2 → 19.0** ⏸️
   - Effort: 4-8 hours (testing, validation)
   - Risk: Low (minimal breaking changes)
   - Benefit: React Compiler, better Suspense

4. **PostgreSQL 14 → 16** ⏸️
   - Effort: 2-4 hours (database upgrade, testing)
   - Risk: Low
   - Benefit: Performance improvements, new features

#### Later (Optional):
5. **Express 4 → 5** ⏸️
   - Effort: 2-3 days (middleware refactoring)
   - Risk: Medium (API changes)
   - Benefit: Better async/await support
   - Note: Express 4.x still maintained, not urgent

---

## 🎯 Next Steps:

1. Apply immediate updates (TypeScript, Prisma)
2. Continue development on missing features
3. Plan modernization for post-MVP
4. Keep dependencies up-to-date going forward
````

### Step 6: Fill metadata.yaml

**После сбора всей информации и ответов на вопросы:**

```yaml
# AUTO-FILLED by Claude Code on 2025-11-09

existing_project:
  enabled: true
  github_repo: "https://github.com/user/my-project"
  code_location: "../"

project:
  name: "TaskFlow"
  type: "Web Application - Task Management SaaS"
  status: "In Progress (30% MVP complete)"
  target_audience: "Remote teams of 5-15 people"

data_info:
  total_chats: 5
  total_documents: 3
  total_notes: 2
  date_range: "2024-09 to 2025-01"

  sources:
    - name: "ChatGPT - Initial Vision"
      files: ["chatgpt-vision-2024-09.txt"]
      topics: ["Project idea", "Target audience", "Core features"]
      date: "2024-09"
      word_count: 8500
      quality: "High"

    - name: "Claude - Tech Stack Discussion"
      files: ["claude-tech-2024-11.md"]
      topics: ["Database choice", "Frontend framework", "Hosting"]
      date: "2024-11"
      word_count: 6200
      quality: "High"

    # ... etc

known_decisions:
  - "Project Name: TaskFlow"
  - "Target Audience: Remote teams 5-15 people"
  - "Database: PostgreSQL (final decision, replaces earlier MongoDB mentions)"
  - "Frontend: React 19 (updated from React 17/18)"
  - "Backend: Node.js + Express"
  - "Hosting: Railway"
  - "Timeline: MVP in 3 months"

known_contradictions:
  - "Database: MongoDB (2024-09) vs PostgreSQL (2024-11, 2025-01) - RESOLVED: PostgreSQL"
  - "React version: 17 vs 18 vs 19 - RESOLVED: React 19"

questions_to_resolve:
  - "OAuth2 priority: Must Have or Should Have? - ANSWERED: Should Have (Phase 2)"
  - "Time Tracking: MVP or Phase 2? - ANSWERED: Phase 2"

additional_context:
  team_size: 2
  timeline_pressure: "Medium"
  budget_constraints: "Minimal hosting (<$50/month)"
  technical_constraints: "None"
  user_research_done: true
  competitor_analysis_done: true

bootstrap_preferences:
  detail_level: "high"
  allow_inference: true
  question_style: "batches"
  focus_areas:
    - "Tech stack verification"
    - "Feature prioritization"
    - "Realistic timeline"

metadata_version: "1.0"
last_updated: "2025-11-09"
updated_by: "Claude Code (Auto-filled)"
```

---

## Questions Format

### Good Questions (concise, specific):

✅ **Confirmation (yes/no):**
```
"Проект называется 'TaskFlow'?"
"Целевая аудитория: удалённые команды 5-15 человек?"
"OAuth2 в приоритете Should Have (не MVP)?"
```

✅ **Conflict Resolution (choice between 2-3 options):**
```
"База данных - финальный выбор:
a) MongoDB (упоминалась в 2024-09)
b) PostgreSQL (упоминалась в 2024-11, 2025-01)
c) Другое (указать)"
```

✅ **Prioritization (ordered list):**
```
"Обнаружил 7 фич. Подтверждаете приоритеты?

Must Have (MVP):
1. Authentication
2. User Management
3. Task Board

Should Have (Phase 2):
4. Notifications
5. Time Tracking

Could Have (Later):
6. Analytics
7. Mobile app

Изменить приоритеты? (yes/no)"
```

✅ **Gap Filling (specific missing info):**
```
"Не обнаружил упоминание аутентификации.
Планируете:
a) Email/password only
b) Email/password + OAuth2 (Google, GitHub)
c) Пока не решено"
```

### Bad Questions (avoid):

❌ **Too broad:**
```
"Расскажите о проекте"
→ Информация уже есть в сырых данных! Должен быть конкретный вопрос.
```

❌ **Already in data:**
```
"Какие технологии хотите использовать?"
→ Уже есть упоминания в чатах! Должен спросить о противоречиях или пробелах.
```

❌ **Open-ended:**
```
"Опишите целевую аудиторию"
→ Должен быть вариант: "Целевая аудитория: X? (yes/no/correct to:)"
```

❌ **Too many at once:**
```
"Уточните: название, аудиторию, фичи, tech stack, timeline, бюджет, команду..."
→ Разбить на несколько вопросов по очереди (batches of 2-3)
```

---

## Examples

### Example 1: New Project, No Code

**Input:** 3 chats, 2 documents, 1 note (total: ~20,000 words)

**Claude Process:**

1. **Scan:**
   - Project name: "FlowTask" (consistent across all files)
   - Type: Web application (task management)
   - Audience: "small remote teams" (vague)
   - Features: 8 mentioned
   - Tech: React 18, Node, "database TBD"

2. **Questions (5 total):**
   ```
   Q1: "Проект называется 'FlowTask'?"
   A1: "Да"

   Q2: "Целевая аудитория: 'small remote teams' - это команды какого размера?
       a) 2-5 человек
       b) 5-15 человек
       c) 15-50 человек"
   A2: "b) 5-15"

   Q3: "База данных не определена. Тип данных: реляционный (users→projects→tasks).
       Рекомендация: PostgreSQL.
       Одобрить?"
   A3: "Да"

   Q4: "React 18 упоминался в чате (2024). Обновить до React 19 (2025)?
       Минимальные breaking changes, +30% performance."
   A4: "Да"

   Q5: "Приоритеты фич:
       Must: Auth, Task Board, Team collaboration
       Should: Notifications, Time Tracking
       Could: Analytics, Mobile
       Подтверждаете?"
   A5: "Да"
   ```

3. **Tech Stack Recommendations:**
   - React 19 ✅ (updated from 18)
   - PostgreSQL 16 ✅ (filled gap)
   - Express 4.x ✅ (from mentions)
   - TypeScript ✅ (recommended, ask to confirm)

4. **Fill metadata.yaml** (auto-completed)

5. **Generate all docs** (PROJECT_ESSENCE, PRD, TECH_STACK, etc.)

**Time:** ~1.5 hours (mostly autonomous)

### Example 2: Existing Project with Code

**Input:**
- 2 chats (newer requirements)
- 1 document
- Existing code: 5,000 lines, React 18, Express, Prisma, PostgreSQL 14

**Claude Process:**

1. **Scan raw data + code:**
   - Raw data: 5 features planned
   - Code: 2 features implemented (Auth, Users)
   - Tech stack: React 18, Express 4, Prisma 4, PostgreSQL 14

2. **Compare:**
   ```
   Planned (raw data):     Implemented (code):
   1. Authentication       ✅ DONE (src/auth/)
   2. User Management      ✅ DONE (src/users/)
   3. Task Board           ❌ MISSING
   4. Notifications        ❌ MISSING
   5. Analytics            ⚠️ PARTIAL (UI only, no data)
   ```

3. **Questions (8 total):**
   ```
   Q1: "Обнаружил Authentication реализован в src/auth/.
       OAuth2 упоминался в планах, но в коде только email/password.
       OAuth2 статус:
       a) Уже работает (я не нашёл файлы)
       b) В разработке
       c) Запланирован на Phase 2"
   A1: "c) Phase 2"

   Q2: "Dashboard найден (src/dashboard/), но charts и data отсутствуют.
       Это:
       a) В процессе (активно разрабатывается)
       b) Заблокировано (ждёт других фич)
       c) Отложено"
   A2: "a) В процессе"

   Q3-Q8: (tech stack modernization, priorities, timeline)
   ```

4. **Tech Stack Analysis:**
   ```
   Current:                Latest:            Recommendation:
   React 18.2 (2022)       React 19 (2025)    ✅ UPDATE
   Prisma 4.12 (2023)      Prisma 5.7 (2025)  ✅ UPDATE
   TypeScript 5.0 (2023)   TypeScript 5.3 (2025) ✅ UPDATE
   Express 4.18            Express 5.0        ⏸️ POSTPONE
   PostgreSQL 14           PostgreSQL 16      ⚠️ CONSIDER
   ```

5. **Generate docs:**
   - PRD: Features marked ✅ Done, 🔄 In Progress, ❌ Planned
   - TECH_STACK: Current + Modernization Plan
   - ROADMAP: Shows 40% progress
   - state.md: Current focus = Dashboard (charts)

**Time:** ~2-3 hours (code analysis takes longer)

---

## Summary

**AUTO-FILL процесс:**

1. ✅ Читает ВСЕ сырые данные автоматически
2. ✅ Извлекает ключевую информацию
3. ✅ Задаёт 5-10 уточняющих вопросов (не больше!)
4. ✅ Анализирует tech stack vs 2025 best practices
5. ✅ Анализирует существующий код (если есть)
6. ✅ Даёт рекомендации по модернизации
7. ✅ Заполняет metadata.yaml автоматически
8. ✅ Генерирует всю документацию

**Пользователь делает:**
- Добавляет сырые данные
- Отвечает на 5-10 вопросов
- Одобряет/корректирует рекомендации

**Экономия времени:** 4-6 часов → 10-15 минут активной работы
