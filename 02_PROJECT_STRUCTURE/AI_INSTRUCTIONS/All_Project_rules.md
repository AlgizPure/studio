# All Project Rules - Проектные Правила для Всех Файлов

**Версия:** 2.0.0  
**Дата:** 2025-11-10  
**Назначение:** Мастер-файл всех проектных правил с индивидуальным правилом для каждого файла

---

## 📋 КАК ИСПОЛЬЗОВАТЬ ЭТОТ ФАЙЛ

### Для пользователя:
1. **Этот файл НЕ нужно редактировать** - он справочный
2. Cursor автоматически использует эти правила при работе с проектом
3. Правила срабатывают по триггерам (см. каждое правило)
4. В начале работы правила выведут: "👀 ACTIVE: [RULE_NAME]"
5. В конце работы: "✅ [RULE_NAME]: обновлены [файлы] по триггеру [X]"

### Для Claude/Cursor:
- При начале работы с файлом → проверь его правило
- Выведи "👀 ACTIVE: [RULE_NAME]" в начале
- Следуй триггерам и действиям
- В конце выведи "✅ [RULE_NAME]: результат"

---

## 🎯 ОГЛАВЛЕНИЕ ПРАВИЛ

1. [RULE_01: metadata.yaml](#rule_01-metadatayaml)
2. [RULE_02: PROJECT_ESSENCE.md](#rule_02-project_essencemd)
3. [RULE_03: PRD.md](#rule_03-prdmd)
4. [RULE_04: ROADMAP.md](#rule_04-roadmapmd)
5. [RULE_05: TECH_STACK.md](#rule_05-tech_stackmd)
6. [RULE_06: ARCHITECTURE.md](#rule_06-architecturemd)
7. [RULE_07: module_requirements](#rule_07-module_requirements)
8. [RULE_08: state.md](#rule_08-statemd)
9. [RULE_09: decisions.md](#rule_09-decisionsmd)
10. [RULE_10: insights.md](#rule_10-insightsmd)
11. [RULE_11: changes_log.md](#rule_11-changes_logmd)
12. [RULE_12: modules_status.md](#rule_12-modules_statusmd)
13. [RULE_13: sprint_current.md](#rule_13-sprint_currentmd)
14. [RULE_14: backlog.md](#rule_14-backlogmd)
15. [RULE_15: .cursorrules](#rule_15-cursorrules)
16. [RULE_16: VERSION_HISTORY.md](#rule_16-version_historymd)

---

## RULE_01: metadata.yaml

### 👀 Активация в начале
```
"👀 ACTIVE: RULE_01_METADATA - Проверяю триггеры для metadata.yaml"
```

### 📁 Файл
`00_RAW_DATA_TEMPLATE/metadata.yaml`

### 🎯 Назначение
Метаданные проекта, AUTO-FILLED при bootstrap, источник истины для основной информации.

### ⚡ Триггеры (когда правило срабатывает)

1. **Bootstrap PHASE 2** - AUTO-FILL режим
2. **Изменение PROJECT_ESSENCE.md** (секции: vision, audience, core features)
3. **Добавление новой технологии в TECH_STACK.md**
4. **Изменение названия проекта**
5. **Изменение целевой аудитории**
6. **Добавление/удаление core feature**
7. **Изменение timeline проекта**

### ✅ Проверки перед обновлением

```yaml
- Проверить: metadata.yaml существует
- Проверить: изменения не конфликтуют с existing_project.enabled
- Проверить: все обязательные поля заполнены
- Проверить: формат YAML корректен
```

### 🔄 Действия при срабатывании

#### При триггере 1 (Bootstrap PHASE 2):
```markdown
1. Прочитать все raw data (chats/, documents/, notes/)
2. Извлечь:
   - project.name
   - project.type
   - project.target_audience
   - tech stack упоминания
   - известные решения
3. Заполнить metadata.yaml полностью
4. Установить last_updated: текущая дата
5. Установить updated_by: "Claude Code (AUTO-FILL)"
```

#### При триггере 2 (Изменение PROJECT_ESSENCE):
```markdown
1. Прочитать PROJECT_ESSENCE.md
2. Извлечь изменения:
   - vision → project.goal
   - target audience → project.target_audience
   - core features → добавить в known_decisions
3. Обновить соответствующие секции metadata.yaml
4. Обновить last_updated
5. Добавить запись в notes_for_claude о изменении
```

#### При триггере 3 (Добавление технологии):
```markdown
1. Прочитать TECH_STACK.md
2. Извлечь новые технологии
3. Добавить в known_decisions секцию "Tech Stack"
4. Обновить metadata_version если major изменение
5. Обновить last_updated
```

### 🔗 Зависимые файлы (могут требовать обновления)

- `PROJECT_ESSENCE.md` - читает name, audience из metadata
- `PRD.md` - может ссылаться на metadata
- `TECH_STACK.md` - синхронизация tech stack
- `BOOTSTRAP_REPORT.md` - использует metadata при генерации

### 🚫 Не трогать

- `existing_project.enabled` - только при bootstrap
- `data_info` секция - только при AUTO-FILL
- `bootstrap_preferences` - пользовательские настройки

### ✅ Уведомление в конце
```
"✅ RULE_01_METADATA: обновлены секции [project/known_decisions/notes_for_claude] по триггеру [название триггера]"
```

---

## RULE_02: PROJECT_ESSENCE.md

### 👀 Активация в начале
```
"👀 ACTIVE: RULE_02_PROJECT_ESSENCE - Проверяю триггеры для PROJECT_ESSENCE.md"
```

### 📁 Файл
`02_PROJECT_STRUCTURE/PROJECT_CORE/00_PROJECT_ESSENCE.md`

### 🎯 Назначение
Видение, цели, целевая аудитория, core value proposition проекта. Фундаментальный документ.

### ⚡ Триггеры

1. **Bootstrap PHASE 5** - создание документа
2. **Изменение vision проекта** (явное обсуждение "давай изменим vision")
3. **Изменение целевой аудитории** (добавление/удаление персон)
4. **Добавление/удаление Must Have feature**
5. **Изменение core value proposition**
6. **Pivot проекта** (major изменение direction)

### ✅ Проверки перед обновлением

```yaml
- Проверить: изменение действительно фундаментальное (не тактическое)
- Проверить: новое vision не противоречит existing tech stack
- Проверить: целевая аудитория реалистична
- Спросить пользователя: "Это изменение vision проекта?"
```

### 🔄 Действия при срабатывании

#### При триггере 1 (Bootstrap):
```markdown
1. Прочитать metadata.yaml и synthesized-project-data.md
2. Извлечь:
   - Vision statement
   - Target audience (3 personas)
   - Core features (Must Have)
   - Value proposition
   - Success metrics
3. Заполнить PROJECT_ESSENCE полностью по template
4. Добавить CHANGELOG entry
5. Установить version 1.0
```

#### При триггере 2-6 (Изменение vision/audience/features):
```markdown
1. Прочитать текущий PROJECT_ESSENCE
2. Определить что изменилось конкретно
3. Обновить соответствующую секцию
4. ОБЯЗАТЕЛЬНО добавить CHANGELOG entry:
   ## CHANGELOG
   ### v[X.Y] - [date]
   - Changed [что] from "[старое]" to "[новое]"
   - Rationale: [почему]
   - Impact: [влияние на проект]
5. Увеличить version:
   - MAJOR bump если vision изменено
   - MINOR bump если audience/features изменены
6. Обновить last_updated
```

### 🔗 Зависимые файлы (КРИТИЧНО обновить)

**ОБЯЗАТЕЛЬНО после изменения PROJECT_ESSENCE:**

1. **PRD.md** - CRITICAL
   ```
   - Проверить: секция "OBJECTIVES & GOALS" aligned с vision
   - Проверить: USER PERSONAS соответствуют audience
   - Проверить: FEATURES включают все Must Have из ESSENCE
   - Добавить CHANGELOG: "Aligned with PROJECT_ESSENCE v[X.Y]"
   ```

2. **ROADMAP.md** - HIGH
   ```
   - Если Must Have feature добавлен → добавить в MVP/Phase 1
   - Если feature удалён → переместить в Backlog или удалить
   - Пересчитать timeline если scope изменился
   ```

3. **metadata.yaml** - MEDIUM
   ```
   - Обновить project.goal
   - Обновить project.target_audience
   - Добавить decision в known_decisions
   ```

4. **Все module_requirements/** - MEDIUM
   ```
   - Проверить: модули still aligned с новым vision
   - Обновить "Module Overview" если нужно
   ```

### 🚫 Не трогать

- Примеры и шаблоны
- Секции которые не изменились
- References на внешние ресурсы (если не устарели)

### ✅ Уведомление в конце
```
"✅ RULE_02_PROJECT_ESSENCE: обновлён vision/audience/features, version bumped to [X.Y], 
зависимые файлы [PRD.md, ROADMAP.md, metadata.yaml] помечены для обновления по триггеру [название]"
```

---

## RULE_03: PRD.md

### 👀 Активация в начале
```
"👀 ACTIVE: RULE_03_PRD - Проверяю триггеры для PRD.md"
```

### 📁 Файл
`02_PROJECT_STRUCTURE/PROJECT_CORE/01_PRD.md`

### 🎯 Назначение
Product Requirements Document - детальные требования, user stories, acceptance criteria.

### ⚡ Триггеры

1. **Bootstrap PHASE 5** - создание документа
2. **Добавление новой фичи** ("Добавь функцию X", "Хочу чтобы можно было Y")
3. **Изменение требований существующей фичи**
4. **Добавление/изменение user story**
5. **Изменение acceptance criteria**
6. **Изменение приоритета фичи** (Must Have ↔ Should Have ↔ Nice to Have)
7. **Выравнивание с PROJECT_ESSENCE** (после его изменения)

### ✅ Проверки перед обновлением

```yaml
- Проверить: фича соответствует vision из PROJECT_ESSENCE
- Проверить: есть ли нужные технологии в TECH_STACK
- Проверить: вписывается ли в текущую архитектуру
- Проверить: не дублирует ли существующую фичу
- Проверить: user story в правильном формате
```

### 🔄 Действия при срабатывании

#### При триггере 1 (Bootstrap):
```markdown
1. Прочитать extracted_features из PHASE 1 (analysis)
2. Прочитать PROJECT_ESSENCE (vision, audience)
3. Группировать features по модулям
4. Для каждого модуля создать секцию:
   ### [N]. [Module Name]
   **Priority:** [Must/Should/Nice]
   **Phase:** [MVP/Phase 1/etc]
   
   **Description:**
   [2-3 sentences]
   
   **User Stories:**
   [list]
   
   **Acceptance Criteria:**
   [list]
5. Установить version 1.0
6. Добавить CHANGELOG entry
```

#### При триггере 2 (Добавление новой фичи):
```markdown
**PROCESS:**
1. Задать пользователю вопросы:
   - "Опиши фичу подробнее: что она должна делать?"
   - "Для кого эта фича? (какой user persona)"
   - "Зачем нужна? (какую проблему решает)"
   - "Когда нужна? (MVP / Phase 1 / Phase 2 / Future)"
   - "Must Have / Should Have / Nice to Have?"

2. Проверить feasibility:
   - Vision aligned? (PROJECT_ESSENCE)
   - Tech available? (TECH_STACK)
   - Architecture fit? (ARCHITECTURE)
   - Timeline ok? (ROADMAP)

3. Показать пользователю Impact Analysis:
   📊 FEATURE IMPACT ANALYSIS
   Feature: [name]
   Priority: [Must/Should/Nice]
   Phase: [MVP/P1/P2]
   
   ✅ FEASIBILITY:
   - Vision aligned: YES/NO
   - Tech available: YES/NO
   - Architecture fit: YES/NO
   - Timeline: [estimate] days
   
   ⚠️ CONCERNS:
   - [list]
   
   📝 DEPENDENCIES:
   - Requires: [list]
   
   Continue? (yes/no)

4. После одобрения:
   - Найти последний номер секции (например, 4.8)
   - Добавить новую секцию 4.9
   - Использовать template (см. ниже)
   - Version MINOR bump (1.5 → 1.6)
   - CHANGELOG: "Added feature: [name] (section 4.9)"

**TEMPLATE для новой фичи:**
### 4.[N] [Feature Name]
**Priority:** [Must/Should/Nice]
**Phase:** [MVP/Phase 1/etc]
**Effort:** [estimate]

**Description:**
[2-3 sentences explaining what and why]

**User Stories:**

#### US-[MODULE]-XXX: [Story Title]
**As a** [user type]
**I want** [action]
**So that** [benefit]

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

**Dependencies:**
- [list if any]

**Success Criteria:**
- [measurable outcomes]
```

#### При триггере 7 (Выравнивание с PROJECT_ESSENCE):
```markdown
1. Прочитать CHANGELOG из PROJECT_ESSENCE (что изменилось)
2. Определить impact на PRD:
   - Vision changed → update OBJECTIVES & GOALS
   - Audience changed → update USER PERSONAS
   - Features changed → add/remove features
3. Обновить affected секции
4. CHANGELOG: "Aligned with PROJECT_ESSENCE v[X.Y]"
5. Version MINOR bump
```

### 🔗 Зависимые файлы (обновить после изменения PRD)

**После добавления новой фичи:**

1. **ROADMAP.md** - CRITICAL
   ```
   - Определить phase из PRD Priority
   - Добавить в соответствующую фазу
   - Если MVP → пересчитать % completion
   - Добавить в MODULES BREAKDOWN table
   ```

2. **module_requirements/[module]_requirements.md** - CRITICAL
   ```
   - Если новый модуль → создать файл
   - Если существующий модуль → добавить фичу в список
   - Детализировать requirements
   ```

3. **backlog.md** - HIGH
   ```
   - Добавить фичу в соответствующий priority раздел
   - Установить effort estimate
   ```

4. **PROJECT_ESSENCE.md** - MEDIUM (если Must Have)
   ```
   - Если фича Must Have → добавить в CORE FEATURES (MVP)
   ```

### 🚫 Не трогать

- Существующие user stories (если не изменяются явно)
- Секции других модулей (если не related)
- Executive Summary (только если major change)

### ✅ Уведомление в конце
```
"✅ RULE_03_PRD: добавлена фича [name] в секцию 4.[N], priority [X], 
зависимые файлы [ROADMAP.md, module_requirements, backlog.md] обновлены по триггеру [добавление фичи]"
```

---

## RULE_04: ROADMAP.md

### 👀 Активация в начале
```
"👀 ACTIVE: RULE_04_ROADMAP - Проверяю триггеры для ROADMAP.md"
```

### 📁 Файл
`02_PROJECT_STRUCTURE/PROJECT_CORE/02_ROADMAP.md`

### 🎯 Назначение
Фазы разработки, timeline, приоритеты features по фазам, milestones.

### ⚡ Триггеры

1. **Bootstrap PHASE 5** - создание
2. **Добавление feature в PRD.md**
3. **Изменение приоритета feature**
4. **Изменение timeline проекта**
5. **Завершение фазы/спринта**
6. **Изменение PRD.md** (новые требования)
7. **Изменение PROJECT_ESSENCE.md** (Must Have features)

### ✅ Проверки перед обновлением

```yaml
- Проверить: новая фича вписывается в timeline
- Проверить: phase не перегружена (не более X features)
- Проверить: dependencies между features учтены
- Проверить: timeline реалистичен
- WARN если MVP overloaded
```

### 🔄 Действия при срабатывании

#### При триггере 2 (Добавление feature из PRD):
```markdown
1. Прочитать feature из PRD.md (Priority, Phase, Effort)
2. Определить целевую фазу:
   - Must Have → MVP или Phase 1
   - Should Have → Phase 1 или Phase 2
   - Nice to Have → Phase 2 или Backlog
3. Добавить в секцию фазы:
   
### PHASE X: [Name]
**Key Features:**
- [ ] [Existing feature 1]
- [ ] [Existing feature 2]
- [ ] [NEW: Feature Name] (Priority: Must) - Status: Not Started

4. Добавить в MODULES BREAKDOWN table:
| [Feature] | Phase X | Must | 0% | Not Started | TBD | [date] | New |

5. Если добавляем в текущую фазу (MVP):
   - Пересчитать % completion
   - Если перегрузка → WARN:
     "⚠️ WARNING: MVP now has [N] features. Consider moving to Phase 1?"
   - Предложить timeline adjustment

6. Version MINOR bump
7. CHANGELOG: "Added [feature] to Phase X (Priority: [Y])"
```

#### При триггере 5 (Завершение фазы):
```markdown
1. Прочитать текущую фазу из state.md
2. Обновить статус фазы:
   - Phase X: ✅ COMPLETE
   - Set completion date
3. Пересчитать overall progress
4. Обновить "Current Phase" в документе
5. Добавить MILESTONE entry:
   ### Milestone: Phase X Complete
   - Date: [date]
   - Features delivered: [N]
   - Lessons learned: [summary]
6. Version MINOR bump
7. CHANGELOG: "Phase X completed. Moved to Phase Y."
```

### 🔗 Зависимые файлы

**После обновления ROADMAP:**

1. **sprint_current.md** - CRITICAL
   ```
   - Если текущая фаза изменилась → update sprint planning
   - Если priorities изменились → re-prioritize sprint backlog
   ```

2. **backlog.md** - HIGH
   ```
   - Features moved between phases → update backlog sections
   - Re-prioritize based on new roadmap
   ```

3. **modules_status.md** - MEDIUM
   ```
   - If phase complete → update module completion %
   ```

4. **state.md** - CRITICAL
   ```
   - Update "Current Phase"
   - Update progress %
   - Note any blockers
   ```

### 🚫 Не трогать

- Completed phases (архивные данные)
- Dependencies graph (если не изменились dependencies)
- Timeline assumptions (если не изменился scope)

### ✅ Уведомление в конце
```
"✅ RULE_04_ROADMAP: добавлена фича [name] в Phase X, timeline пересчитан, 
зависимые файлы [sprint_current.md, backlog.md, state.md] обновлены по триггеру [добавление feature]"
```

---

## RULE_05: TECH_STACK.md

### 👀 Активация в начале
```
"👀 ACTIVE: RULE_05_TECH_STACK - Проверяю триггеры для TECH_STACK.md"
```

### 📁 Файл
`02_PROJECT_STRUCTURE/PROJECT_CORE/03_TECH_STACK.md`

### 🎯 Назначение
Технологический стек проекта с обоснованием выбора каждой технологии.

### ⚡ Триггеры

1. **Bootstrap PHASE 5** - создание
2. **Добавление новой технологии**
3. **Обновление версии технологии**
4. **Удаление технологии**
5. **Tech stack verification** (PHASE 3)
6. **Изменение PROJECT_ESSENCE** (новые требования → новые технологии)

### ✅ Проверки перед обновлением

```yaml
- Проверить: технология актуальна (не deprecated)
- Проверить: совместимость с existing stack
- Проверить: лицензия подходит
- Проверить: community support есть
- Проверить: обоснование добавления ясно
```

### 🔄 Действия при срабатывании

#### При триггере 2 (Добавление технологии):
```markdown
1. Задать вопросы:
   - "Зачем нужна эта технология?"
   - "Какую проблему решает?"
   - "Рассматривали ли альтернативы?"
   - "Какие риски?"

2. Провести quick verification:
   - Latest version?
   - Actively maintained?
   - License ok?
   - Fits budget?

3. Добавить в соответствующую секцию:
   
## [Category] Stack

### [Technology Name]
- **Version:** [X.Y.Z]
- **Purpose:** [why we use it]
- **Alternatives Considered:** [list]
- **Why Chosen:** [rationale]
- **Risks:** [list]
- **Cost:** [free/paid/enterprise]

4. Обновить Stack Summary (YAML):
tech_stack:
  [category]:
    - name: [Technology]
      version: [X.Y.Z]
      purpose: [one-liner]

5. Version MINOR bump
6. CHANGELOG: "Added [technology] to [category] stack"
```

#### При триггере 3 (Обновление версии):
```markdown
1. Определить:
   - Current version
   - Target version
   - Breaking changes?
   - Migration effort

2. Создать Migration Plan:
## Migration: [Tech] [old] → [new]
- **Breaking Changes:** [list]
- **Migration Steps:** [numbered]
- **Effort Estimate:** [hours/days]
- **Risk Level:** [LOW/MEDIUM/HIGH]
- **Recommended:** [YES/NO/WAIT]

3. Обновить version в документе
4. Добавить note в Changes section
5. Version MINOR bump (or MAJOR if breaking)
6. CHANGELOG: "Updated [tech] from [old] to [new]"
```

### 🔗 Зависимые файлы

**После обновления TECH_STACK:**

1. **ARCHITECTURE.md** - HIGH
   ```
   - Если новая технология → добавить в architecture diagram
   - Если новый component → update system overview
   ```

2. **metadata.yaml** - MEDIUM
   ```
   - Обновить known_decisions (tech stack section)
   - Добавить в notes_for_claude
   ```

3. **module_requirements/** - MEDIUM
   ```
   - Если технология для specific модуля → update module requirements
   ```

### 🚫 Не трогать

- Deprecated technologies (если не удаляем явно)
- Cost analysis (если цены не изменились)
- References (если актуальны)

### ✅ Уведомление в конце
```
"✅ RULE_05_TECH_STACK: добавлена технология [name] v[X.Y] в [category], 
зависимые файлы [ARCHITECTURE.md, metadata.yaml] обновлены по триггеру [добавление технологии]"
```

---

## RULE_06: ARCHITECTURE.md

### 👀 Активация в начале
```
"👀 ACTIVE: RULE_06_ARCHITECTURE - Проверяю триггеры для ARCHITECTURE.md"
```

### 📁 Файл
`02_PROJECT_STRUCTURE/PROJECT_CORE/04_ARCHITECTURE.md`

### 🎯 Назначение
Архитектура системы, компоненты, data flow, интеграции.

### ⚡ Триггеры

1. **Bootstrap PHASE 5** - создание
2. **Добавление крупной фичи** (требует новых компонентов)
3. **Изменение TECH_STACK.md** (новая технология → новый component)
4. **Изменение PROJECT_ESSENCE.md** (новые requirements → архитектурные изменения)
5. **Масштабирование системы** (добавление layers, services)

### ✅ Проверки перед обновлением

```yaml
- Проверить: изменение не ломает existing архитектуру
- Проверить: новый component вписывается в pattern
- Проверить: dependencies не создают circular refs
- Проверить: масштабируемость решения
```

### 🔄 Действия при срабатывании

#### При триггере 2 (Добавление крупной фичи):
```markdown
1. Проанализировать фичу:
   - Требует ли новые components?
   - Изменяет ли data flow?
   - Добавляет ли integrations?

2. Если требует изменений:
   - Обновить High-Level Architecture diagram
   - Добавить новые components в Component Breakdown
   - Обновить Data Flow если нужно
   - Добавить в Integration Points если external API

3. Добавить секцию:
## [Feature Name] Architecture

### Components
- **[Component 1]:** [purpose]
- **[Component 2]:** [purpose]

### Data Flow
[diagram or description]

### Integration Points
[if external]

4. Version:
   - MAJOR bump если фундаментальное изменение
   - MINOR bump если добавление component

5. CHANGELOG: "Added architecture for [feature]: [components]"
```

#### При триггере 3 (Изменение TECH_STACK):
```markdown
1. Прочитать что добавлено в TECH_STACK
2. Определить где это вписывается в архитектуру
3. Обновить diagram:
   - Добавить новый component/layer
   - Показать connections
4. Обновить Technology Mapping:
Component → Technology
[Component] → [New Technology]

5. Version MINOR bump
6. CHANGELOG: "Updated architecture to include [technology]"
```

### 🔗 Зависимые файлы

**После обновления ARCHITECTURE:**

1. **module_requirements/** - HIGH
   ```
   - Если архитектура модуля изменилась → update requirements
   - Добавить Technical Constraints секцию
   ```

2. **TECH_STACK.md** - MEDIUM (обратная связь)
   ```
   - Если архитектура требует новую технологию → note в TECH_STACK
   ```

### 🚫 Не трогать

- Existing components (если не изменяются)
- Security section (если не related)
- Performance considerations (если не affected)

### ✅ Уведомление в конце
```
"✅ RULE_06_ARCHITECTURE: добавлены components [list] для фичи [name], 
diagram обновлён, зависимые файлы [module_requirements] помечены по триггеру [добавление фичи]"
```

---

## RULE_07: module_requirements

### 👀 Активация в начале
```
"👀 ACTIVE: RULE_07_MODULE_REQUIREMENTS - Проверяю триггеры для module requirements"
```

### 📁 Файлы
`02_PROJECT_STRUCTURE/MODULES_REQUIREMENTS/[module_name]_requirements.md`

### 🎯 Назначение
Детальные требования для конкретного модуля со ВСЕМИ его функциями.

### ⚡ Триггеры

1. **Bootstrap PHASE 5** - создание ВСЕХ module requirements
2. **Добавление функции в модуль** (в PRD или в обсуждении)
3. **Изменение требований модуля**
4. **Изменение PRD.md** (секция модуля)
5. **Изменение ARCHITECTURE.md** (архитектура модуля)

### ✅ Проверки перед обновлением

```yaml
- Проверить: модуль существует в PRD.md
- Проверить: функция не дублирует существующую
- Проверить: требования реалистичны
- Проверить: dependencies учтены
- CRITICAL: ВСЕ функции из extracted_features учтены
```

### 🔄 Действия при срабатывании

#### При триггере 1 (Bootstrap - создание):
```markdown
**КРИТИЧНО ВАЖНО:**
Этот триггер должен создать файл для КАЖДОГО модуля со ВСЕМИ функциями.

1. Прочитать extracted_features из PHASE 1
2. Прочитать PRD.md (список модулей)
3. Для КАЖДОГО модуля:
   
   a. Создать файл [module_name]_requirements.md
   
   b. Использовать _MODULE_TEMPLATE.md
   
   c. Заполнить:
      - Module Overview (из PRD)
      - **ALL Features (ВСЕ функции из extracted_features):**
        ## Features
        
        ### Feature 1: [Name]
        **Priority:** [Must/Should/Nice]
        **Description:** [detail]
        **User Story:** [format]
        **Acceptance Criteria:**
        - [ ] Criterion 1
        - [ ] Criterion 2
        
        [REPEAT для КАЖДОЙ функции модуля]
   
   d. Dependencies (другие модули)
   e. Technical Requirements
   f. Success Criteria

4. ПРОВЕРКА полноты:
   - Подсчитать функции в requirements
   - Сравнить с extracted_features
   - Если не совпадает → ERROR:
     "⚠️ INCOMPLETE: Module [X] has [N] functions in requirements 
     but [M] in extracted_features. Missing: [list]"

5. Version 1.0 для каждого файла
```

#### При триггере 2 (Добавление функции):
```markdown
1. Определить модуль (из обсуждения или PRD)
2. Найти файл [module]_requirements.md
3. Прочитать текущие features
4. Добавить новую feature:
   
### Feature [N]: [Name]
**Priority:** [Must/Should/Nice]
**Status:** ❌ Not Started
**Description:** 
[2-3 sentences]

**User Story:**
As a [user type]
I want [action]
So that [benefit]

**Acceptance Criteria:**
- [ ] [criterion 1]
- [ ] [criterion 2]
- [ ] [criterion 3]

**Dependencies:**
- [module/feature if any]

**Technical Notes:**
- [implementation hints]

5. Обновить Module Status в начале файла:
   - Total Features: [N+1]
   - Completed: [X]
   - In Progress: [Y]
   - Not Started: [Z+1]

6. Version MINOR bump
7. CHANGELOG: "Added feature: [name] to module [module]"
```

### 🔗 Зависимые файлы

**После обновления module_requirements:**

1. **modules_status.md** - CRITICAL
   ```
   - Обновить status модуля
   - Пересчитать % completion
   - Update total features count
   ```

2. **backlog.md** - HIGH
   ```
   - Добавить новые features в backlog
   - Set priorities
   ```

3. **PRD.md** - MEDIUM (обратная связь)
   ```
   - Если детали противоречат PRD → note в PRD
   ```

### 🚫 Не трогать

- Completed features (только status меняется)
- Module metadata (если не related)
- Dependencies (если не изменились)

### ✅ Уведомление в конце
```
"✅ RULE_07_MODULE_REQUIREMENTS: добавлена функция [name] в модуль [module], 
total features now [N], зависимые файлы [modules_status.md, backlog.md] обновлены 
по триггеру [добавление функции]"
```

---

## RULE_08: state.md

### 👀 Активация в начале
```
"👀 ACTIVE: RULE_08_STATE - Проверяю триггеры для state.md"
```

### 📁 Файл
`02_PROJECT_STRUCTURE/CONTEXT_MEMORY/state.md`

### 🎯 Назначение
Текущее состояние проекта, что делается сейчас, что дальше, блокеры.

### ⚡ Триггеры

1. **Завершение любой задачи**
2. **Начало новой задачи**
3. **Изменение фазы проекта**
4. **Появление блокера**
5. **Разрешение блокера**
6. **Завершение спринта**
7. **Обновление прогресса** (любое значимое изменение)
8. **Изменение фокуса разработки**

### ✅ Проверки перед обновлением

```yaml
- Проверить: state.md не template (должен быть заполнен)
- Проверить: Last Updated не старше 1 дня (если активная разработка)
- Проверить: Current Focus актуален
- Проверить: Progress % реалистичен
```

### 🔄 Действия при срабатывании

#### При триггере 1 (Завершение задачи):
```markdown
1. Обновить LAST COMPLETED:
**[Date]:** Завершена [Task Name]
- [Details]
- Files changed: [list]
- Impact: [description]

2. Обновить NEXT STEPS:
- Удалить завершённую задачу из Immediate
- Передвинуть задачи из Short-term → Immediate если нужно

3. Обновить PROGRESS SUMMARY:
**Overall Project:** [X+N]% complete  
**Current Phase:** [Y+M]% complete

**Module Progress:**
- [Module]: [████████░░] [Z+P]%

4. Обновить Last Updated: [current date and time]
```

#### При триггере 3 (Изменение фазы):
```markdown
1. Обновить CURRENT FOCUS:
**Phase:** [New Phase]  
**Module:** [Current Module]  
**Working On:** [Current Task]

2. Добавить в LAST COMPLETED:
**[Date]:** Завершена Phase [Old Phase]
- Milestone reached
- Features delivered: [N]
- Moving to Phase [New Phase]

3. Пересчитать PROGRESS:
- Phase complete → Overall progress bump

4. Обновить NEXT STEPS для новой фазы

5. Добавить CHANGELOG entry:
| [Date] | Moved to Phase [New] | [Author] |
```

#### При триггере 4 (Появление блокера):
```markdown
1. Добавить в BLOCKERS & ISSUES:

### Current Blockers

**[BLOCKER-ID]:** [Title]
- **Impact:** [HIGH/MEDIUM/LOW]
- **Affected:** [modules/features]
- **Description:** [details]
- **Possible Solutions:** [list]
- **Owner:** [person]
- **Status:** Open
- **Created:** [date]

2. Обновить state.md header:
⚠️ BLOCKER ACTIVE - see BLOCKERS section

3. Если HIGH impact → также update sprint_current.md
```

#### При триггере 5 (Разрешение блокера):
```markdown
1. Переместить из Current Blockers → Recently Resolved:

**[BLOCKER-ID]:** [Title] ✅ RESOLVED
- **Resolution:** [how it was fixed]
- **Duration:** [date created] → [date resolved]
- **Learnings:** [insights]

2. Убрать warning из header если нет других блокеров
```

### 🔗 Зависимые файлы

**После обновления state.md:**

1. **changes_log.md** - CRITICAL
   ```
   - Добавить entry о изменении state
   - Log каждое значимое изменение
   ```

2. **sprint_current.md** - HIGH (если sprint-related)
   ```
   - Обновить статус задач в спринте
   - Update sprint progress
   ```

3. **modules_status.md** - MEDIUM
   ```
   - Если module progress изменился → sync
   ```

### 🚫 Не трогать

- Recent Context (если не related к текущему изменению)
- CHANGELOG таблица (только append новые записи)

### ✅ Уведомление в конце
```
"✅ RULE_08_STATE: обновлены [LAST COMPLETED/NEXT STEPS/PROGRESS/BLOCKERS], 
Last Updated: [timestamp], зависимые файлы [changes_log.md] обновлены 
по триггеру [завершение задачи]"
```

---

## RULE_09: decisions.md

### 👀 Активация в начале
```
"👀 ACTIVE: RULE_09_DECISIONS - Проверяю триггеры для decisions.md"
```

### 📁 Файл
`02_PROJECT_STRUCTURE/CONTEXT_MEMORY/decisions.md`

### 🎯 Назначение
Лог всех принятых решений с обоснованием и контекстом.

### ⚡ Триггеры

1. **Принятие технического решения**
2. **Выбор между альтернативами**
3. **Изменение архитектуры**
4. **Выбор технологии**
5. **Разрешение противоречия**
6. **Изменение scope/приоритетов**
7. **Принятие design decision**

### ✅ Проверки перед обновлением

```yaml
- Проверить: это действительно решение (не просто change)
- Проверить: есть ли обоснование
- Проверить: альтернативы рассмотрены
- Проверить: impact понятен
```

### 🔄 Действия при срабатывании

#### При триггере 1-7 (Любое решение):
```markdown
1. Создать Decision ID:
DEC-[YYYY]-[MM]-[NNN]
Example: DEC-2025-11-001

2. Добавить entry (в хронологическом порядке, свежие сверху):

## DEC-[YYYY]-[MM]-[NNN]: [Short Title]

**Date:** [YYYY-MM-DD]  
**Context:** [Phase/Module/Feature]  
**Decision Maker:** [Person/Team]  
**Status:** ✅ Approved / ⏳ Pending / ❌ Rejected / 🔄 Revised

### Problem
[What problem are we solving?]

### Decision
[What did we decide to do?]

### Alternatives Considered
1. **[Alternative 1]:**
   - Pros: [list]
   - Cons: [list]
   - Why not chosen: [reason]

2. **[Alternative 2]:**
   - Pros: [list]
   - Cons: [list]
   - Why not chosen: [reason]

### Rationale
[Why this decision was made]

### Impact
- **Technical:** [impact on code/architecture]
- **Timeline:** [+/- days/weeks]
- **Cost:** [if applicable]
- **Risk:** [LOW/MEDIUM/HIGH]

### Consequences
**Positive:**
- [benefit 1]
- [benefit 2]

**Negative:**
- [drawback 1]
- [drawback 2]

### Related Decisions
- Links to: [DEC-XXX, DEC-YYY]
- Supersedes: [DEC-ZZZ] (if applicable)

### Follow-up Actions
- [ ] [Action 1]
- [ ] [Action 2]

---

3. Обновить Summary в начале файла:
## Summary
**Total Decisions:** [N]
**Critical Decisions:** [X]
**Pending Review:** [Y]
**Revised:** [Z]

4. Если решение CRITICAL → также update metadata.yaml:
known_decisions:
  - "[Decision summary]"
```

### 🔗 Зависимые файлы

**После обновления decisions.md:**

1. **insights.md** - MEDIUM
   ```
   - Если решение привело к важному insight → log в insights
   ```

2. **changes_log.md** - HIGH
   ```
   - Log принятие решения
   ```

3. **metadata.yaml** - MEDIUM (если critical)
   ```
   - Добавить в known_decisions
   ```

### 🚫 Не трогать

- Старые решения (архив)
- Superseded decisions (помечать но не удалять)

### ✅ Уведомление в конце
```
"✅ RULE_09_DECISIONS: добавлено решение DEC-[ID]: [title], 
status [Approved/Pending], impact [level], зависимые файлы [insights.md, changes_log.md] 
обновлены по триггеру [принятие решения]"
```

---

## RULE_10: insights.md

### 👀 Активация в начале
```
"👀 ACTIVE: RULE_10_INSIGHTS - Проверяю триггеры для insights.md"
```

### 📁 Файл
`02_PROJECT_STRUCTURE/CONTEXT_MEMORY/insights.md`

### 🎯 Назначение
Ключевые инсайты, learnings, паттерны, открытия в процессе разработки.

### ⚡ Триггеры

1. **Обнаружение важного паттерна**
2. **Важное обучение из ошибки**
3. **Инсайт из code analysis**
4. **Обнаружение во время разработки**
5. **Важное решение в decisions.md** (с learnings)
6. **Неожиданное открытие**

### ✅ Проверки перед обновлением

```yaml
- Проверить: это действительно insight (не просто fact)
- Проверить: есть ли actionable вывод
- Проверить: это не дублирует existing insight
- Проверить: insight полезен для future decisions
```

### 🔄 Действия при срабатывании

#### При триггерах 1-6 (Любой insight):
```markdown
1. Определить категорию:
- User Insights (про пользователей)
- Technical Insights (про код/архитектуру)
- Process Insights (про workflow)
- Product Insights (про product decisions)

2. Добавить entry в соответствующую секцию:

### [Date]: [Insight Title]

**Category:** [User/Technical/Process/Product]  
**Source:** [где обнаружили: code review/user feedback/analysis/etc]  
**Confidence:** ⭐⭐⭐ (HIGH) / ⭐⭐ (MEDIUM) / ⭐ (LOW)

**Observation:**
[Что мы заметили/обнаружили]

**Analysis:**
[Почему это важно/что это значит]

**Implications:**
[Что это означает для проекта]

**Actionable Items:**
- [ ] [Action 1]
- [ ] [Action 2]

**Related:**
- Decisions: [DEC-XXX]
- Features: [Feature Y]

---

3. Если insight HIGH confidence → также:
   - Update metadata.yaml (notes_for_claude)
   - Consider creating decision в decisions.md
```

### 🔗 Зависимые файлы

**После обновления insights.md:**

1. **decisions.md** - MEDIUM
   ```
   - Если insight ведёт к решению → create decision
   ```

2. **metadata.yaml** - LOW
   ```
   - Если critical insight → add to notes_for_claude
   ```

### 🚫 Не трогать

- Старые insights (архив, но можно reference)

### ✅ Уведомление в конце
```
"✅ RULE_10_INSIGHTS: добавлен insight [title] (Category: [X], Confidence: [Y]), 
actionable items: [N], зависимые файлы [decisions.md] помечены 
по триггеру [обнаружение паттерна]"
```

---

## RULE_11: changes_log.md

### 👀 Активация в начале
```
"👀 ACTIVE: RULE_11_CHANGES_LOG - Проверяю триггеры для changes_log.md"
```

### 📁 Файл
`02_PROJECT_STRUCTURE/CONTEXT_MEMORY/changes_log.md`

### 🎯 Назначение
Хронологический лог ВСЕХ изменений в проекте.

### ⚡ Триггеры

**КРИТИЧНО: Этот файл обновляется при ЛЮБОМ изменении:**

1. Любое изменение в PROJECT_CORE/*
2. Любое изменение в CONTEXT_MEMORY/* (кроме самого changes_log)
3. Любое изменение в PROGRESS_TRACKING/*
4. Создание/обновление module_requirements
5. Обновление кода проекта
6. Принятие решения (decisions.md)
7. Завершение задачи
8. Изменение фазы
9. **БУКВАЛЬНО ЛЮБОЕ значимое изменение**

### ✅ Проверки перед обновлением

```yaml
- Проверить: изменение действительно значимое (не typo fix)
- Проверить: entry в хронологическом порядке
- Проверить: все required поля заполнены
```

### 🔄 Действия при срабатывании

#### При ЛЮБОМ триггере:
```markdown
1. Добавить entry В НАЧАЛО файла (reverse chronological):

## [YYYY-MM-DD HH:MM] - [Change Type]

**Changed:** [File(s) changed]  
**Type:** [Created/Updated/Deleted/Refactored]  
**By:** [Claude Code/User/Developer]  
**Trigger:** [What caused this change]

**Changes:**
- [Change 1 description]
- [Change 2 description]

**Reason:**
[Why this change was made]

**Impact:**
[What this affects]

**Related:**
- Decision: [DEC-XXX if any]
- Feature: [Feature name if any]
- Sprint: [Sprint # if any]

---

2. Обновить Summary в начале файла:
## Summary
**Total Changes:** [N+1]
**Last Updated:** [timestamp]
**Most Active Files:** [top 3]

3. CHANGE TYPES:
- 🆕 Created - новый файл/feature
- ✏️ Updated - изменение existing
- 🗑️ Deleted - удаление
- 🔄 Refactored - рефакторинг
- 🐛 Fixed - bug fix
- 📝 Documented - documentation change
- 🚀 Released - release/deploy
```

### 🔗 Зависимые файлы

**changes_log.md сам ЧИТАЕТ все файлы, но не влияет на них.**

Это "read-only" зависимость (log только).

### 🚫 Не трогать

- Старые entries (архив)
- Summary statistics (только update)

### ✅ Уведомление в конце
```
"✅ RULE_11_CHANGES_LOG: добавлена запись [timestamp] - [type] для файла [name], 
total changes: [N] по триггеру [название триггера]"
```

---

## RULE_12: modules_status.md

### 👀 Активация в начале
```
"👀 ACTIVE: RULE_12_MODULES_STATUS - Проверяю триггеры для modules_status.md"
```

### 📁 Файл
`02_PROJECT_STRUCTURE/PROGRESS_TRACKING/modules_status.md`

### 🎯 Назначение
Статус completion каждого модуля, процент готовности, текущий status.

### ⚡ Триггеры

1. **Bootstrap PHASE 5** - инициализация (0% для всех модулей)
2. **Завершение фичи в модуле**
3. **Изменение статуса модуля** (Not Started → In Progress → Complete)
4. **Обновление из code analysis** (для existing projects)
5. **Изменение module_requirements** (новые features)

### ✅ Проверки перед обновлением

```yaml
- Проверить: % completion реалистичен
- Проверить: status соответствует % (100% = Complete)
- Проверить: все модули из PRD учтены
- Проверить: dependencies учтены (нельзя завершить модуль если зависимости не готовы)
```

### 🔄 Действия при срабатывании

#### При триггере 1 (Bootstrap):
```markdown
1. Прочитать PRD.md (список модулей)
2. Создать таблицу:

| Module | Progress | Doc Status | Code Status | Priority |
|--------|----------|------------|-------------|----------|
| 1. [Module Name] | 0% | Specified | Not Started | P0 |
| 2. [Module Name] | 0% | Specified | Not Started | P1 |
...

3. Добавить секцию Overall:
**Overall:** 0% (Planning: 100%)

4. Добавить Next Actions:
**Start with:** Module 1 ([Name])
**Then:** Module 2 ([Name])
```

#### При триггере 2 (Завершение фичи):
```markdown
1. Определить модуль завершённой фичи
2. Прочитать module_requirements для модуля
3. Подсчитать:
   - Total features: [N]
   - Completed features: [X+1]
   - New % = (X+1) / N * 100

4. Обновить таблицу:
| [Module] | [NEW%] | Specified | [NEW STATUS] | [Priority] |

5. STATUS rules:
   - 0% → Not Started
   - 1-99% → In Progress (🔄)
   - 100% → Complete (✅)

6. Пересчитать Overall Progress:
   - Average всех модулей

7. Добавить в Recent Updates:
**[Date]:** Module [X] - Completed feature [name]. Now [Y]% complete.
```

#### При триггере 4 (Code analysis - existing projects):
```markdown
1. Прочитать code analysis results
2. Для каждого модуля:
   - Found features: [list]
   - Status: [Implemented/Partial/Missing]
3. Обновить таблицу с реальными %:
   - ✅ Complete (100%)
   - 🔄 In Progress (X%)
   - ❌ Not Started (0%)
4. Добавить note:
   **Source:** Code analysis ([date])
```

### 🔗 Зависимые файлы

**После обновления modules_status:**

1. **state.md** - CRITICAL
   ```
   - Обновить Progress Summary
   - Обновить Module Progress bars
   ```

2. **sprint_current.md** - MEDIUM
   ```
   - Если module progress изменился → может affect sprint planning
   ```

3. **ROADMAP.md** - LOW
   ```
   - Если module complete → может trigger phase completion
   ```

### 🚫 Не трогать

- Historical data (previous sprint data)
- Module priorities (если не изменились явно)

### ✅ Уведомление в конце
```
"✅ RULE_12_MODULES_STATUS: обновлён модуль [name] до [X]%, 
status: [In Progress/Complete], overall progress: [Y]%, 
зависимые файлы [state.md] обновлены по триггеру [завершение фичи]"
```

---

## RULE_13: sprint_current.md

### 👀 Активация в начале
```
"👀 ACTIVE: RULE_13_SPRINT_CURRENT - Проверяю триггеры для sprint_current.md"
```

### 📁 Файл
`02_PROJECT_STRUCTURE/PROGRESS_TRACKING/sprint_current.md`

### 🎯 Назначение
Текущий спринт, задачи, прогресс, velocity.

### ⚡ Триггеры

1. **Начало нового спринта**
2. **Завершение спринта**
3. **Добавление задачи в спринт**
4. **Завершение задачи в спринте**
5. **Изменение приоритетов в спринте**
6. **Блокер в спринте**

### ✅ Проверки перед обновлением

```yaml
- Проверить: sprint capacity не превышен
- Проверить: задачи aligned с ROADMAP
- Проверить: dependencies учтены
- Проверить: velocity реалистичен
```

### 🔄 Действия при срабатывании

#### При триггере 1 (Начало спринта):
```markdown
1. Создать новый sprint:

# CURRENT SPRINT

**Sprint:** #[N]  
**Duration:** [Start Date] → [End Date]  
**Goal:** [Sprint goal - specific and measurable]

## SPRINT BACKLOG

### High Priority
- [ ] [Task 1] ([Module]) - [Estimate: X hours]
- [ ] [Task 2] ([Module]) - [Estimate: Y hours]

### Medium Priority
- [ ] [Task 3] ([Module]) - [Estimate: Z hours]

### Low Priority
- [ ] [Task 4] ([Module]) - [Estimate: W hours]

**Total Capacity:** [N] hours  
**Committed:** [M] hours  
**Buffer:** [N-M] hours

2. Прочитать backlog.md (pull top priority items)
3. Установить Sprint Goal
4. Commit задачи
```

#### При триггере 2 (Завершение спринта):
```markdown
1. Подсчитать результаты:

## SPRINT [N] RESULTS

**Completed:** [X] tasks  
**Incomplete:** [Y] tasks  
**Velocity:** [Z] points

### Completed Tasks
- ✅ [Task 1] - [Module] - [Actual: X hours]
- ✅ [Task 2] - [Module] - [Actual: Y hours]

### Incomplete Tasks
- ❌ [Task 3] - [Module] - [Reason]
  **Action:** Moving to Sprint [N+1]

### Metrics
- **Planned:** [N] hours
- **Actual:** [M] hours
- **Efficiency:** [M/N * 100]%

### Learnings
- [Learning 1]
- [Learning 2]

### Retrospective
**What went well:**
- [Item 1]

**What to improve:**
- [Item 2]

**Action items:**
- [ ] [Action 1]

2. Переместить incomplete задачи в backlog
3. Архивировать sprint в sprint_history.md (если есть)
4. Очистить sprint_current для нового спринта
```

#### При триггере 4 (Завершение задачи):
```markdown
1. Найти задачу в sprint backlog
2. Обновить статус:
- [X] → ✅
- Добавить actual time spent

3. Обновить sprint progress:
**Progress:** [X/N] tasks complete ([%]%)

4. Если задача была blocker для других → notify
```

### 🔗 Зависимые файлы

**После обновления sprint_current:**

1. **state.md** - CRITICAL
   ```
   - Обновить Current Sprint view
   - Update Last Completed если task done
   ```

2. **backlog.md** - HIGH
   ```
   - Удалить задачи committed в sprint
   - Добавить incomplete tasks после завершения sprint
   ```

3. **modules_status.md** - MEDIUM
   ```
   - Если задача завершена → update module %
   ```

4. **changes_log.md** - LOW
   ```
   - Log sprint начало/завершение
   ```

### 🚫 Не трогать

- Sprint history (если в отдельном файле)
- Velocity calculations (автоматические)

### ✅ Уведомление в конце
```
"✅ RULE_13_SPRINT_CURRENT: [начат Sprint #N / завершена задача X / завершён Sprint #N], 
progress: [Y]%, зависимые файлы [state.md, backlog.md, modules_status.md] обновлены 
по триггеру [начало спринта]"
```

---

## RULE_14: backlog.md

### 👀 Активация в начале
```
"👀 ACTIVE: RULE_14_BACKLOG - Проверяю триггеры для backlog.md"
```

### 📁 Файл
`02_PROJECT_STRUCTURE/PROGRESS_TRACKING/backlog.md`

### 🎯 Назначение
Приоритизированный список всех задач проекта.

### ⚡ Триггеры

1. **Добавление новой фичи в PRD.md**
2. **Изменение приоритетов**
3. **Перемещение задачи в sprint_current.md**
4. **Завершение задачи** (удаление из backlog)
5. **Изменение ROADMAP.md** (репризация задач)
6. **Добавление задачи из incomplete sprint**

### ✅ Проверки перед обновлением

```yaml
- Проверить: приоритеты aligned с ROADMAP
- Проверить: нет дубликатов
- Проверить: effort estimates реалистичны
- Проверить: dependencies учтены
```

### 🔄 Действия при срабатывании

#### При триггере 1 (Добавление фичи из PRD):
```markdown
1. Прочитать новую фичу из PRD.md:
   - Priority (Must/Should/Nice)
   - Phase (MVP/P1/P2)
   - Effort estimate

2. Определить раздел в backlog:
   - Must Have (P0) → MVP section
   - Should Have (P1) → Phase 1 section
   - Nice to Have (P2) → Phase 2 section

3. Добавить в соответствующий раздел:

### P0 (Critical - Must Have for MVP)

**[Module]: [Feature Name]**
- **Priority:** P0
- **Effort:** [estimate]
- **Dependencies:** [list]
- **User Story:** [summary]
- **Acceptance Criteria:** [summary]
- **Status:** 📝 Ready
- **Added:** [date]

4. Пересортировать раздел по приоритету
5. Обновить counts:
**Total Items:** [N]
**P0:** [X]
**P1:** [Y]
**P2:** [Z]
```

#### При триггере 2 (Изменение приоритетов):
```markdown
1. Прочитать изменения в ROADMAP
2. Определить affected задачи
3. Переместить между разделами:
   - P1 → P0 (promoted)
   - P0 → P1 (deprioritized)
4. Обновить Priority field в задачах
5. Пересортировать разделы
6. Добавить note:
**[Date]:** Reprioritized [N] items due to [reason]
```

#### При триггере 3 (Перемещение в sprint):
```markdown
1. Найти задачу в backlog
2. Обновить Status:
   - 📝 Ready → 🏃 In Sprint #[N]
3. Или удалить из backlog (опционально)
4. Обновить counts
```

#### При триггере 4 (Завершение задачи):
```markdown
1. Найти задачу в backlog
2. Удалить или переместить в Done section
3. Обновить counts
4. Добавить в Completed section:
**[Module]: [Feature Name]** ✅
- Completed: [date]
- Sprint: #[N]
```

### 🔗 Зависимые файлы

**После обновления backlog:**

1. **sprint_current.md** - HIGH
   ```
   - Если задачи moved to sprint → sync
   ```

2. **state.md** - MEDIUM
   ```
   - Update Next Steps based on backlog priorities
   ```

3. **ROADMAP.md** - LOW (обратная связь)
   ```
   - Если backlog слишком большой → может требовать roadmap adjustment
   ```

### 🚫 Не трогать

- Completed tasks (архив)
- Deferred section (явно отложенные)
- Out of Scope section (rejected items)

### ✅ Уведомление в конце
```
"✅ RULE_14_BACKLOG: добавлена задача [name] в [P0/P1/P2] section, 
total items: [N], зависимые файлы [sprint_current.md, state.md] синхронизированы 
по триггеру [добавление фичи из PRD]"
```

---

## RULE_15: .cursorrules

### 👀 Активация в начале
```
"👀 ACTIVE: RULE_15_CURSORRULES - Проверяю триггеры для .cursorrules"
```

### 📁 Файл
`.cursorrules` (в корне проекта)

### 🎯 Назначение
Cursor AI правила для проекта. Содержит ссылку на All_Project_rules.md и AUTO-GENERATED секцию.

### ⚡ Триггеры

1. **Bootstrap PHASE 6** - создание файла
2. **Изменение tech stack** (major технологии)
3. **Добавление важных модулей**
4. **Изменение архитектуры** (major changes)
5. **Обновление project essence** (vision/audience)

### ✅ Проверки перед обновлением

```yaml
- Проверить: файл не конфликтует с user rules
- Проверить: tech stack актуален
- Проверить: AUTO-GENERATED секция заполнена
- Проверить: ссылка на All_Project_rules корректна
```

### 🔄 Действия при срабатывании

#### При триггере 1 (Bootstrap):
```markdown
1. Прочитать .cursorrules.template
2. Заполнить AUTO-GENERATED секцию:

# ============================================
# AUTO-GENERATED PROJECT RULES
# Generated: [YYYY-MM-DD]
# Bootstrap Session: [session_id]
# ============================================

## Project Information
- **Name:** [Project Name]
- **Type:** [Web App/Mobile/SaaS/etc]
- **Status:** [Phase/% complete]
- **Tech Stack:** [brief summary]

## Key Modules
[list of modules from PRD]

## Tech Stack (Brief)
**Frontend:** [list]
**Backend:** [list]
**Database:** [name]
**AI/ML:** [if applicable]

## Important Patterns
[from ARCHITECTURE.md]

## For Detailed Rules
See: `02_PROJECT_STRUCTURE/AI_INSTRUCTIONS/All_Project_rules.md`

3. Скопировать в корень проекта как .cursorrules
4. ПРОВЕРЬ что файл создан: ls -la | grep cursorrules
```

#### При триггере 2-5 (Изменения):
```markdown
1. Прочитать текущий .cursorrules
2. Найти AUTO-GENERATED секцию
3. Обновить изменённые части:
   - Tech Stack (если trigger 2)
   - Key Modules (если trigger 3)
   - Important Patterns (если trigger 4)
   - Project Information (если trigger 5)
4. Обновить "Last Updated" timestamp
5. НЕ трогать NON-AUTO-GENERATED части (user customizations)
```

### 🔗 Зависимые файлы

**.cursorrules ЧИТАЕТ из:**

1. **All_Project_rules.md** - источник правил
2. **PROJECT_ESSENCE.md** - project info
3. **TECH_STACK.md** - tech stack summary
4. **ARCHITECTURE.md** - patterns
5. **PRD.md** - modules list

**Но сам НЕ влияет на другие файлы.**

### 🚫 Не трогать

- User customizations (вне AUTO-GENERATED секции)
- Comments от пользователя
- Custom rules добавленные вручную

### ✅ Уведомление в конце
```
"✅ RULE_15_CURSORRULES: [создан/.cursorrules / обновлена секция [X]], 
Last Updated: [timestamp], source: All_Project_rules.md 
по триггеру [bootstrap / изменение tech stack]"
```

---

## RULE_16: VERSION_HISTORY.md

### 👀 Активация в начале
```
"👀 ACTIVE: RULE_16_VERSION_HISTORY - Проверяю триггеры для VERSION_HISTORY.md"
```

### 📁 Файл
`VERSION_HISTORY.md` (в корне template)

### 🎯 Назначение
История версий UPMT template.

### ⚡ Триггеры

1. **Создание новой версии template**
2. **Major release** (breaking changes)
3. **Minor release** (new features)
4. **Patch release** (bug fixes)

### ✅ Проверки перед обновлением

```yaml
- Проверить: версия следует semver (X.Y.Z)
- Проверить: CHANGELOG entry полный
- Проверить: breaking changes документированы
- Проверить: дата корректна
```

### 🔄 Действия при срабатывании

#### При триггере 1-4 (Новая версия):
```markdown
1. Определить версию:
   - MAJOR (X.0.0): breaking changes
   - MINOR (X.Y.0): new features (backward compatible)
   - PATCH (X.Y.Z): bug fixes

2. Добавить entry (в начало файла):

## Version [X.Y.Z] - [YYYY-MM-DD]

### 🎯 Highlights
[Brief summary of major changes]

### ✨ New Features
- [Feature 1]
- [Feature 2]

### 🔧 Improvements
- [Improvement 1]
- [Improvement 2]

### 🐛 Bug Fixes
- [Fix 1]
- [Fix 2]

### ⚠️ Breaking Changes
- [Change 1] - **Migration:** [how to migrate]
- [Change 2] - **Migration:** [how to migrate]

### 📝 Documentation
- [Doc update 1]
- [Doc update 2]

### 🙏 Contributors
- [Name 1]
- [Name 2]

---

3. Обновить Summary в начале:
**Current Version:** [X.Y.Z]
**Latest Release:** [YYYY-MM-DD]
**Total Releases:** [N]
```

### 🔗 Зависимые файлы

**Не требует обновления других файлов** (это template-level change).

### 🚫 Не трогать

- Старые версии (архив)
- Unreleased section (если есть)

### ✅ Уведомление в конце
```
"✅ RULE_16_VERSION_HISTORY: добавлена версия [X.Y.Z], 
release date: [YYYY-MM-DD], breaking changes: [YES/NO] 
по триггеру [создание новой версии]"
```

---

## 🎓 КАК ЧИТАТЬ ЭТИ ПРАВИЛА

### Для Claude/Cursor:

1. **При открытии файла:**
   - Найди его правило в этом документе
   - Прочитай триггеры
   - Определи: сработал ли триггер?

2. **Если триггер сработал:**
   - Выведи: "👀 ACTIVE: RULE_[N]_[NAME]"
   - Следуй секции "Действия при срабатывании"
   - Обнови зависимые файлы
   - Выведи: "✅ RULE_[N]_[NAME]: результат"

3. **Если триггер НЕ сработал:**
   - Не выводи активацию
   - Просто работай с файлом normally

### Для пользователя:

- Этот файл справочный - НЕ редактируй его
- Cursor автоматически применяет правила
- Если видишь "👀 ACTIVE" - правило работает
- Если видишь "✅" - правило завершило работу

---

## 📊 СТАТИСТИКА ПРАВИЛ

**Всего правил:** 16  
**CRITICAL файлы:** 15  
**Самые частые триггеры:** state.md, changes_log.md, PRD.md  
**Самые редкие триггеры:** VERSION_HISTORY.md

**Граф зависимостей:**
```
metadata.yaml → [PROJECT_ESSENCE, PRD, TECH_STACK, state]
PRD.md → [ROADMAP, module_requirements, backlog]
ROADMAP.md → [sprint_current, backlog, modules_status]
state.md → [changes_log]
*ANY CHANGE* → changes_log.md
```

---

## 🔄 ОБНОВЛЕНИЕ ПРАВИЛ

**Версия правил:** 2.0.0  
**Последнее обновление:** 2025-11-10

Если правила требуют обновления:
1. Обнови этот файл (All_Project_rules.md)
2. Обнови .cursorrules.template
3. Regenerate .cursorrules в проектах
4. Update VERSION_HISTORY.md

---

**END OF ALL_PROJECT_RULES.MD**

**Используй эти правила для обеспечения полноты и консистентности документации проекта.**

