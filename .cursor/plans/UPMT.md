# Universal Project Management Template - Master Reference

**Версия:** 2.0.0  
**Дата:** 2025-11-10  
**Назначение:** Справочник ВСЕХ файлов UPMT для валидации полноты реализации

---

## 🎯 ЦЕЛЬ ДОКУМЕНТА

Этот документ - **MASTER REFERENCE** для проверки полноты реализации механик и архитектуры Universal Project Management Template.

**Используй для:**
- Валидации что все файлы созданы
- Проверки что нет дублирования информации
- Понимания зависимостей между файлами
- Проверки что проектные правила корректны

---

## 📊 МЕТРИКА ПОЛНОТЫ

```
Текущая реализация: 100% (v2.0.0)
Целевая полнота: 100%

Всего файлов в template: 60+
Файлов требующих правил: 15
Статических файлов: 45+
```

---

## 📁 СТРУКТУРА TEMPLATE

### Корневой уровень (11 файлов)
- README.md
- 00_START_HERE.md
- LICENSE
- VERSION_HISTORY.md
- RELEASE_NOTES_v1.0.0.md
- BOOTSTRAP_CHECKLIST.md
- FINAL_SETUP_INSTRUCTIONS.md
- GITHUB_REPOSITORY_SETTINGS.md
- SETUP_GUIDE.md
- TEMPLATE_COMPLETION_REPORT.md
- QUICK_START_GUIDES/ (4 файла)

### 00_RAW_DATA_TEMPLATE/ (6 файлов + 3 папки)
- README.md
- COLLECTION_CHECKLIST.md
- **metadata.yaml** ← RULE_01 (КРИТИЧНЫЙ)
- chats/ (примеры)
- documents/ (примеры)
- notes/ (примеры)

### 01_BOOTSTRAP_CONFIG/ (5 файлов)
- **BOOTSTRAP_START_PROMPT.md** (v2.0 - обновлён)
- BOOTSTRAP_INSTRUCTIONS.md
- AUTO_FILL_INSTRUCTIONS.md
- BOOTSTRAP_FLOW_DIAGRAM.md
- tech-stack-verification.md

### 02_PROJECT_STRUCTURE/ (50+ файлов)

#### PROJECT_CORE/ (6 файлов)
- **00_PROJECT_ESSENCE.md** ← RULE_02 (КРИТИЧНЫЙ)
- **01_PRD.md** ← RULE_03 (КРИТИЧНЫЙ)
- **02_ROADMAP.md** ← RULE_04 (КРИТИЧНЫЙ)
- **03_TECH_STACK.md** ← RULE_05 (КРИТИЧНЫЙ)
- **04_ARCHITECTURE.md** ← RULE_06 (КРИТИЧНЫЙ)
- 99_SYSTEM_GUIDE.md

#### MODULES_REQUIREMENTS/ (2+ файлов)
- _MODULE_TEMPLATE.md (template)
- README.md
- **[module]_requirements.md** ← RULE_07 (динамические, КРИТИЧНЫЕ)

#### CONTEXT_MEMORY/ (8 файлов)
- **state.md** ← RULE_08 (КРИТИЧНЫЙ, обновляется постоянно)
- state_TEMPLATE.md
- **decisions.md** ← RULE_09 (КРИТИЧНЫЙ)
- decisions_TEMPLATE.md
- **insights.md** ← RULE_10 (КРИТИЧНЫЙ)
- insights_TEMPLATE.md
- **changes_log.md** ← RULE_11 (КРИТИЧНЫЙ, обновляется при ЛЮБОМ изменении)
- changes_log_TEMPLATE.md

#### PROGRESS_TRACKING/ (3 файла)
- **modules_status.md** ← RULE_12 (КРИТИЧНЫЙ)
- **sprint_current.md** ← RULE_13 (КРИТИЧНЫЙ)
- **backlog.md** ← RULE_14 (КРИТИЧНЫЙ)

#### AI_INSTRUCTIONS/ (5+ файлов)
- **All_Project_rules.md** ← Мастер-файл правил (v2.0 - создан)
- **. cursorrules** ← RULE_15 (КРИТИЧНЫЙ, должен быть в КОРНЕ проекта)
- UPDATE_RULES.md (v1.0)
- CHANGE_SCENARIOS.md
- WORKFLOW_GUIDE.md
- EXAMPLES/ (примеры)

### 03_AUTOMATION/ (3 файла)
- setup.sh
- update-template.sh
- verify-tech-stack.sh

---

## 🔗 ГРАФ ЗАВИСИМОСТЕЙ

```
metadata.yaml (источник истины)
├── PROJECT_ESSENCE.md
│   ├── PRD.md
│   │   ├── ROADMAP.md
│   │   │   ├── sprint_current.md
│   │   │   └── backlog.md
│   │   └── module_requirements/*
│   │       └── modules_status.md
│   ├── TECH_STACK.md
│   │   └── ARCHITECTURE.md
│   └── state.md
├── decisions.md
│   └── insights.md
└── changes_log.md (логирует ВСЁ)
```

**Правило чтения:**
- Стрелка A → B означает "B читает данные из A"
- Изменение A может требовать обновления B
- changes_log.md читает ВСЕ файлы (универсальный логгер)

---

## 🚫 МАТРИЦА ДУБЛИРОВАНИЯ ИНФОРМАЦИИ

**Правило:** Каждая информация имеет ОДИН PRIMARY источник. Остальные ссылаются (reference only).

| Информация | Primary источник | Дублируется в (reference only) | Правило |
|------------|------------------|-------------------------------|---------|
| **Название проекта** | metadata.yaml | PROJECT_ESSENCE, PRD, README | Всегда sync |
| **Целевая аудитория (детально)** | PROJECT_ESSENCE | metadata.yaml (кратко), PRD | ESSENCE = полное описание |
| **Целевая аудитория (кратко)** | metadata.yaml | Везде reference | metadata = 1-2 предложения |
| **Vision statement** | PROJECT_ESSENCE | metadata.yaml (goal), PRD | ESSENCE = canonical source |
| **Tech stack (полный)** | TECH_STACK.md | metadata.yaml (список), .cursorrules (краткий) | TECH_STACK = с обоснованием |
| **Tech stack (список)** | metadata.yaml | Везде reference | metadata = simple list |
| **Features (полный список)** | extracted_features (PHASE 1) | PRD, module_requirements | extracted_features = source of truth |
| **Features (requirements)** | module_requirements/* | PRD (summary), backlog (tasks) | module_requirements = детали |
| **Features (summary)** | PRD.md | PROJECT_ESSENCE (core features only) | PRD = все фичи |
| **Архитектура** | ARCHITECTURE.md | Нет дублирования | ARCHITECTURE = единственный |
| **Roadmap** | ROADMAP.md | sprint_current (текущая фаза) | ROADMAP = master plan |
| **Текущий прогресс** | state.md | modules_status (детали по модулям) | state = overall |
| **Модули progress** | modules_status.md | state (summary) | modules_status = детали |
| **Решения** | decisions.md | insights (если привели к insight) | decisions = полный лог |
| **Изменения** | changes_log.md | Нет дублирования | changes_log = хронология ВСЕГО |

**Проверка дублирования:**
- Если информация в 2+ файлах БЕЗ explicit reference → ❌ ERROR
- Если информация отличается в разных файлах → ❌ CONFLICT
- Если reference указывает на неактуальный источник → ⚠️ WARNING

---

## 📋 ЧЕК-ЛИСТ ВАЛИДАЦИИ ПОЛНОТЫ

### 1. Bootstrap Completeness

**Файлы созданы (обязательные):**
- [ ] `metadata.yaml` - AUTO-FILLED (НЕ template)
- [ ] `analysis-report.md` (или `COMBINED_ANALYSIS_REPORT.md`)
- [ ] `synthesized-project-data.md`
- [ ] `BOOTSTRAP_REPORT.md`
- [ ] `verification/tech-stack-verification-summary.md` (или analysis)
- [ ] `FINAL_SETUP_INSTRUCTIONS.md`
- [ ] Все 6 файлов `PROJECT_CORE/*` - ПОЛНОСТЬЮ заполнены
- [ ] `state.md` - РЕАЛЬНЫЕ данные (НЕ template)
- [ ] `decisions.md` - минимум 5 records
- [ ] `changes_log.md` - начальная запись
- [ ] `modules_status.md` - ВСЕ модули
- [ ] `sprint_current.md` - планирование
- [ ] `backlog.md` - ВСЕ задачи
- [ ] `.cursorrules` - в КОРНЕ проекта

**Для новых проектов:**
- [ ] Все module_requirements/* созданы (1 файл = 1 модуль)
- [ ] Каждый requirements содержит ВСЕ функции модуля

**Для существующих проектов:**
- [ ] Code analysis выполнен
- [ ] Features помечены: ✅ Implemented / ⚠️ Partial / ❌ Planned
- [ ] Рекомендации по модернизации в TECH_STACK.md

### 2. Content Quality

**metadata.yaml:**
- [ ] 100% полей заполнено (НЕ default значения)
- [ ] `project.name` - реальное название (НЕ "Your Project Name")
- [ ] `project.target_audience` - детальное описание (НЕ "Brief description")
- [ ] `known_decisions` - минимум 3-5 решений
- [ ] `data_info.sources` - все источники перечислены

**PROJECT_ESSENCE:**
- [ ] Vision statement чёткий и inspiring
- [ ] Target audience - минимум 2-3 personas (детальные)
- [ ] Core features - минимум 5-8 Must Have
- [ ] Success metrics - measurable (НЕ "100 users", а как измеряем?)

**PRD:**
- [ ] Каждый модуль имеет секцию
- [ ] User stories в правильном формате (As a... I want... So that...)
- [ ] Acceptance criteria measurable

**ROADMAP:**
- [ ] Фазы имеют timeline
- [ ] Features распределены по фазам
- [ ] Dependencies между features учтены

**TECH_STACK:**
- [ ] Каждая технология имеет обоснование (Why chosen)
- [ ] Alternatives considered перечислены
- [ ] Risks identified
- [ ] Версии актуальны (проверены)

**ARCHITECTURE:**
- [ ] Диаграмма high-level (ASCII или description)
- [ ] Components breakdown
- [ ] Data flow описан
- [ ] Integration points перечислены

### 3. Rules & Automation

**Проектные правила:**
- [ ] `All_Project_rules.md` создан (v2.0)
- [ ] Содержит 15-16 правил (RULE_01 - RULE_15+)
- [ ] Каждое правило имеет триггеры
- [ ] `.cursorrules` создан и заполнен

**Activation система:**
- [ ] Промпты содержат систему уведомлений (👀 ACTIVE, ✅ COMPLETE)
- [ ] PHASE 7.5 VALIDATION добавлена

### 4. Completeness of Features

**Извлечение функций:**
- [ ] `extracted_features` создан в PHASE 1
- [ ] Количество функций = упоминаниям в чатах
- [ ] Функции сгруппированы по модулям

**Отражение в requirements:**
- [ ] Количество функций в module_requirements = extracted_features
- [ ] Каждая функция имеет:
  - Priority (Must/Should/Nice)
  - Status (❌ Not Started для новых проектов)
  - Description
  - User Story
  - Acceptance Criteria

**ЕСЛИ НЕСОВПАДЕНИЕ:**
```
❌ FEATURE COMPLETENESS FAILED
Expected: [N] functions
Found in requirements: [M] functions
Missing: [list]
→ FIX: Добавь недостающие функции в соответствующие module_requirements
```

---

## ✅ КРИТЕРИИ УСПЕХА

**100% Bootstrap Complete, если:**

1. ✅ Все файлы из чек-листа созданы
2. ✅ Ни один файл не является template (все заполнены реальными данными)
3. ✅ Все функции из raw data учтены в module_requirements
4. ✅ `.cursorrules` создан в корне проекта (НЕ в template)
5. ✅ COMPLETENESS VALIDATION PASSED
6. ✅ Нет противоречий между файлами
7. ✅ Все cross-references актуальны
8. ✅ Проектные правила активны (All_Project_rules.md)

**Готовность к разработке:**
- ✅ PROJECT_ESSENCE определяет vision
- ✅ PRD описывает все features
- ✅ ROADMAP определяет timeline
- ✅ TECH_STACK подобран и обоснован
- ✅ ARCHITECTURE спроектирована
- ✅ backlog.md приоритизирован
- ✅ sprint_current.md готов к старту
- ✅ .cursorrules активен в Cursor/Claude

---

## 🔍 ЧАСТЫЕ ОШИБКИ

### Ошибка 1: Template файлы не заполнены

**Симптомы:**
- `state.md` содержит "[Last Updated]" вместо реальной даты
- `PROJECT_ESSENCE.md` содержит "Your Project Name"
- `decisions.md` пустой или содержит только template

**Fix:**
- Вернись к PHASE 5, заполни файлы ПОЛНОСТЬЮ
- Используй данные из `synthesized-project-data.md`

### Ошибка 2: Функции потеряны

**Симптомы:**
- В чатах упомянуто 150+ функций
- В module_requirements только 50 функций
- VALIDATION FAILED

**Fix:**
- Вернись к PHASE 1
- Извлеки ВСЕ функции повторно (extracted_features)
- Вернись к PHASE 5
- Заполни module_requirements со ВСЕМИ функциями

### Ошибка 3: .cursorrules не в корне

**Симптомы:**
- `.cursorrules` создан в `02_PROJECT_STRUCTURE/AI_INSTRUCTIONS/`
- Cursor не видит правила

**Fix:**
- Скопируй `.cursorrules` в КОРЕНЬ проекта
- Проверь: файл должен быть рядом с `README.md`

### Ошибка 4: Дублирование без reference

**Симптомы:**
- Название проекта разное в `metadata.yaml` и `PROJECT_ESSENCE.md`
- Tech stack разный в `TECH_STACK.md` и `.cursorrules`

**Fix:**
- Определи PRIMARY источник (см. Матрицу дублирования)
- Обнови остальные файлы с explicit reference
- Example: "See PROJECT_ESSENCE.md for detailed vision"

---

## 📖 ПРИМЕРЫ ДЛЯ КЛЮЧЕВЫХ ФАЙЛОВ

### Пример: metadata.yaml (заполненный)

```yaml
project:
  name: "Ground Control"
  type: "Educational Web Application + SaaS Platform"
  status: "Planning Complete (Bootstrap finished)"
  target_audience: "Solo developers (beginners-intermediate), small teams, CS students"
  goal: "Teach professional development practices while building real projects"
  
known_decisions:
  - "Database: Supabase (managed PostgreSQL + Realtime)"
  - "AI: Claude Sonnet, platform-provided API key"
  - "Tech Stack: Next.js 16, React 19.2, Tailwind v4"
  
metadata_version: "1.0"
last_updated: "2025-11-10"
updated_by: "Claude Code (AUTO-FILL)"
```

### Пример: PROJECT_ESSENCE.md (секция Vision)

```markdown
## VISION

Transform programming education by integrating learning directly into the development workflow. 
Instead of watching tutorials, developers learn professional practices by building their own 
projects with real-time contextual guidance.

**Core Innovation:** Vibe Wizard - AI-powered learning assistant that teaches in the context 
of YOUR work, not generic examples.

**Impact:** Developers finish their projects while learning industry-standard practices.
```

### Пример: module_requirements (auth)

```markdown
# Authentication & Onboarding Requirements

## Features

### Feature 1: GitHub OAuth Login
**Priority:** Must Have
**Status:** ❌ Not Started
**Description:** Users sign in using GitHub OAuth for seamless integration.

**User Story:** 
As a developer
I want to sign in with my GitHub account
So that I can connect my repositories without additional setup

**Acceptance Criteria:**
- [ ] GitHub OAuth flow implemented
- [ ] User profile created on first login
- [ ] Session persists across page reloads
- [ ] Error handling for OAuth failures

**Dependencies:** None
```

---

## 🔗 ССЫЛКИ НА ДЕТАЛИ

**Полная инвентаризация всех файлов:**
- См. `.cursor/plans/INVENTORY.md` (60+ файлов с назначением и зависимостями)

**Все проектные правила:**
- См. `02_PROJECT_STRUCTURE/AI_INSTRUCTIONS/All_Project_rules.md` (16 правил)

**Промпты для bootstrap:**
- См. `01_BOOTSTRAP_CONFIG/BOOTSTRAP_START_PROMPT.md` (v2.0, 4 сценария)

---

## 🎯 КАК ИСПОЛЬЗОВАТЬ ЭТОТ ДОКУМЕНТ

### Для валидации bootstrap:

1. Открой UPMT.md
2. Пройдись по "ЧЕК-ЛИСТ ВАЛИДАЦИИ ПОЛНОТЫ"
3. Отметь каждый пункт
4. Если что-то не выполнено → см. "ЧАСТЫЕ ОШИБКИ"
5. Используй "ГРАФ ЗАВИСИМОСТЕЙ" для понимания связей
6. Проверь "МАТРИЦУ ДУБЛИРОВАНИЯ" на conflicts

### Для разработки:

1. Проверь "КРИТЕРИИ УСПЕХА"
2. Если все ✅ → готов к разработке
3. Если есть ❌ → доработай bootstrap
4. Используй "ПРИМЕРЫ" как reference

### Для обновления template:

1. При добавлении файла → обнови INVENTORY.md
2. Если файл критичный → добавь RULE в All_Project_rules.md
3. Обнови "ГРАФ ЗАВИСИМОСТЕЙ" если нужно
4. Обнови "МАТРИЦУ ДУБЛИРОВАНИЯ" если информация дублируется

---

**UPMT v2.0.0 - Master Reference Complete**

**Последнее обновление:** 2025-11-10  
**Документов проинвентаризировано:** 60+  
**Правил создано:** 16  
**Готовность:** 100%

