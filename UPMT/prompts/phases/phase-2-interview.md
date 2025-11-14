# PHASE 2: INTERVIEW

**Время выполнения:** 30-60 минут (интерактивно)

**Назначение:** Задать уточняющие вопросы пользователю, AUTO-FILL metadata.yaml

---

## 📖 КОНТЕКСТ ПЕРЕД PHASE 2

**⚠️ ОБЯЗАТЕЛЬНО ПРОЧИТАЙ:**
1. `UPMT/bootstrap/00_RAW_DATA_TEMPLATE/extracted_features.md` (согласованный список функций)
2. `UPMT/bootstrap/00_RAW_DATA_TEMPLATE/modules_list.md` (список модулей)
3. `/analysis-report.md` (findings из PHASE 1)

Эти файлы содержат контекст для формулирования вопросов.

---

## 📋 ИНСТРУКЦИИ

### ШАГ 1: Покажи Summary Findings

**Выведи краткий summary:**

```markdown
📊 PHASE 1 FINDINGS - SUMMARY

**Проект:** [название]

**Функции и модули:**
- Total Functions: [N]
- Total Modules: [M]

[Если existing project:]
- Current Progress: [X]%
- Implemented: ~[X] функций
- In Progress: ~[Y] функций
- Not Started: ~[Z] функций

**Модули (из modules_list.md):**
1. [Module 1] - [X функций] [статус]
2. [Module 2] - [Y функций] [статус]
[... топ-5 модулей]

**Ключевые фичи (из extracted_features.md):**
- [Feature 1]
- [Feature 2]
- [Feature 3]

**Упоминания технологий:**
- [Tech 1]
- [Tech 2]
- [Tech 3]

**Пробелы в информации:**
- [Пробел 1]
- [Пробел 2]

**Противоречия:**
- [Противоречие 1] (если есть)
```

---

### ШАГ 2: Анализ Raw Data и Подготовка Вопросов

**⚠️ КРИТИЧНО: Анализируй raw data на конкретные варианты!**

**Перед формулированием вопросов выполни анализ:**

#### 2.1: Извлеки конкретные варианты из raw data

**Проанализируй raw data на:**

1. **Слоганы/Tagline** (если упомянуты в чатах)
   - Найди все предложенные варианты слоганов
   - Запомни источник каждого варианта
   
2. **Tech Stack упоминания** (конкретные названия технологий)
   - Frontend: React, Vue, Next.js, и т.д.
   - Backend: Node.js, Python, Express, и т.д.
   - Database: PostgreSQL, MongoDB, Supabase, SQLite, и т.д.
   - Hosting: Vercel, Railway, AWS, Netlify, и т.д.
   - **⚠️ НЕ извлекай версии** (версии проверяются в PHASE 3)
   
3. **Противоречия** (разные варианты в разных источниках)
   - Tech stack противоречия (MongoDB в чате 1, PostgreSQL в чате 2)
   - Feature contradictions (разные описания одной фичи)
   - Timeline противоречия (разные сроки в разных чатах)
   - Архитектурные противоречия
   
4. **Упоминания Timeline/сроков**
   - Любые упоминания дедлайнов, сроков, MVP timeline
   
5. **Target Audience упоминания**
   - Кто пользователи (developers, teams, solo, enterprise)
   
6. **Deployment/Hosting упоминания**
   - Любые предпочтения по hosting
   
7. **Repository structure упоминания**
   - Monorepo vs multi-repo
   - Связь с другими проектами

#### 2.2: Определи тип вопроса для каждой находки

**Если нашёл варианты в raw data → задай вопрос с ВЫБОРОМ:**
```
"В чатах предложены слоганы:
🥇 '[вариант 1 из чата X]'
🥈 '[вариант 2 из чата Y]'
Какой выбираете или предложите свой?"
```

**Если нашёл противоречие → задай вопрос РАЗРЕШЕНИЯ:**
```
"Database - финальный выбор:
a) MongoDB (упоминалась в [дата], [источник])
b) PostgreSQL (упоминалась в [дата], [источник])
Какой вариант?"
```

**Если НЕ нашёл данные → задай ОБЩИЙ вопрос:**
```
"Не обнаружил упоминание базы данных. Планируете:
a) PostgreSQL (relational)
b) MongoDB (document)
c) Supabase (PostgreSQL + services)
d) Пока не решено"
```

---

### ШАГ 2.5: Intelligent Question Filtering (НОВОЕ!)

**⚠️ КРИТИЧНО: НЕ задавай вопросы на которые уже есть ответы!**

**Цель:** Уменьшить количество вопросов, задавая только те на которые нужна ДОПОЛНИТЕЛЬНАЯ информация.

---

#### 2.5.1: Pre-check Existing Data

**Для КАЖДОЙ потенциальной категории вопроса проверь:**

```python
print("\n🔍 INTELLIGENT QUESTION FILTERING\n")

# 1. Прочитай существующие данные
metadata = read_yaml("UPMT/bootstrap/00_RAW_DATA_TEMPLATE/metadata.yaml")
extracted_features = read_file("UPMT/bootstrap/00_RAW_DATA_TEMPLATE/extracted_features.md")
modules_list = read_file("UPMT/bootstrap/00_RAW_DATA_TEMPLATE/modules_list.md")
raw_data_files = glob("UPMT/bootstrap/00_RAW_DATA_TEMPLATE/chats/*")

# 2. Определи что УЖЕ ИЗВЕСТНО
known_info = {
    "project_name": metadata.get("project_name"),
    "project_type": metadata.get("project_type"),
    "target_audience": metadata.get("target_audience"),
    "tech_stack": metadata.get("tech_stack", {}),
    "timeline": metadata.get("timeline"),
    "unique_value": metadata.get("unique_value"),
    "deployment": metadata.get("deployment"),
    "features_count": extracted_features.count("Function "),
    "modules_count": modules_list.count("## Модуль "),
    # ... продолжай извлекать
}

# 3. Создай список категорий для проверки
question_categories = {
    "project_identity": ["project_name", "tagline"],
    "target_audience": ["primary_users", "user_personas", "user_needs"],
    "tech_stack": ["frontend", "backend", "database", "deployment"],
    "timeline": ["mvp_timeline", "launch_date", "phases"],
    "unique_value": ["key_differentiators", "competitive_advantages"],
    "scope": ["must_have_features", "nice_to_have_features"],
    "constraints": ["budget", "team_size", "technical_constraints"],
    "integration": ["external_apis", "third_party_services"],
    "design": ["ui_preferences", "branding", "accessibility"],
    "analytics": ["metrics", "success_criteria"]
}

# 4. Для каждой категории проверь покрытие
questions_needed = []
questions_skipped = []

for category, data_points in question_categories.items():
    category_coverage = 0
    missing_data = []
    
    for data_point in data_points:
        # Проверка 1: Есть в metadata?
        if data_point in known_info and known_info[data_point]:
            category_coverage += 1
            continue
        
        # Проверка 2: Упомянуто в raw data?
        found_in_raw = False
        for raw_file in raw_data_files:
            content = read_file(raw_file).lower()
            # Ищем keywords related to data_point
            if is_mentioned_in_raw_data(data_point, content):
                found_in_raw = True
                category_coverage += 1
                break
        
        if not found_in_raw:
            missing_data.append(data_point)
    
    # Coverage ratio
    coverage = category_coverage / len(data_points) if data_points else 0
    
    if coverage >= 0.7:  # 70%+ coverage
        questions_skipped.append({
            "category": category,
            "reason": f"Sufficient data ({coverage*100:.0f}% coverage)",
            "known": category_coverage,
            "total": len(data_points)
        })
        print(f"   ⏭️ SKIP: {category} ({coverage*100:.0f}% known)")
    elif coverage >= 0.3:  # 30-70% coverage
        questions_needed.append({
            "category": category,
            "priority": "medium",
            "missing_data": missing_data,
            "coverage": coverage
        })
        print(f"   ⚠️ ASK (medium): {category} ({coverage*100:.0f}% known, missing: {len(missing_data)} points)")
    else:  # <30% coverage
        questions_needed.append({
            "category": category,
            "priority": "high",
            "missing_data": missing_data,
            "coverage": coverage
        })
        print(f"   ❗ ASK (high): {category} ({coverage*100:.0f}% known, missing: {len(missing_data)} points)")

print(f"\n📊 Filtering Results:")
print(f"   Questions needed: {len(questions_needed)} categories")
print(f"   Questions skipped: {len(questions_skipped)} categories (already answered)")
print(f"   Reduction: {len(questions_skipped)} / {len(question_categories)} = "
     f"{len(questions_skipped)/len(question_categories)*100:.0f}% fewer questions\n")
```

---

#### 2.5.2: Покажи пользователю ПОЧЕМУ вопросы фильтруются

**ВАЖНО: Transparency - объясни пользователю что ты делаешь!**

```markdown
🔍 **INTELLIGENT FILTERING APPLIED**

**Я проанализировал существующие данные и ПРОПУСТИЛ следующие вопросы:**

✅ **Project Identity** (90% known)
   - Project name: "[extracted from metadata]"
   - Tagline: "[found in raw data, chat X]"
   - ℹ️ Skipping: Достаточно информации

✅ **Target Audience** (80% known)
   - Primary users: "[extracted from features]"
   - User personas: "[mentioned in raw data]"
   - ℹ️ Skipping: Audience четко определена

[... для КАЖДОЙ пропущенной категории]

---

**Я ЗАДАМ вопросы только по:**

❗ **Tech Stack** (40% known)
   - ❓ Missing: Deployment preference (not mentioned)
   - ❓ Missing: State management choice (conflicting mentions)
   - ❓ Missing: Testing framework (not decided)

⚠️ **Timeline** (50% known)
   - ❓ Missing: Launch date (mentioned "soon" but no date)
   - ❓ Missing: MVP scope (features list complete, but MVP not defined)

[... для КАЖДОЙ категории где нужны вопросы]

---

**Оригинальных вопросов:** 10 категорий
**После фильтрации:** [X] вопросов
**Сэкономлено времени:** ~[Y] минут

**Готовы ответить на [X] вопросов? [y/n]**
```

---

#### 2.5.3: Adaptive Questioning (для оставшихся категорий)

**Для КАЖДОЙ категории где нужны вопросы, используй КОНТЕКСТ:**

**Bad (generic question):**
```
"Какой deployment планируете?"
```

**Good (context-aware question):**
```
"⚠️ Deployment Strategy

В raw data упомянуты:
- Next.js framework → предполагает Vercel/Netlify
- Supabase backend → может хоститься отдельно
- GitHub integration → нужен serverless для webhooks

Какой вариант предпочитаете:
a) Vercel (full-stack, Next.js optimized, $0-20/mo)
b) Railway (flexible, Docker support, free tier)
c) Netlify (JAMstack focused, free tier)
d) Пока не решено

Влияет на: CI/CD setup, environment variables, scaling strategy"
```

**Почему это лучше:**
- ✅ Показываешь ЧТО ты нашел в raw data
- ✅ Даёшь конкретные варианты с контекстом
- ✅ Объясняешь ПОЧЕМУ этот выбор важен
- ✅ Предоставляешь default если не решено

---

#### 2.5.4: Question Priority System

**Сортируй вопросы по приоритету:**

**🔴 HIGH priority (MUST answer before continuing):**
- Tech stack conflicts (contradictions)
- Critical missing data (deployment, auth, database)
- MVP scope definition

**🟡 MEDIUM priority (should answer):**
- Timeline specifics
- User personas details
- Design preferences

**🟢 LOW priority (can skip):**
- Nice-to-have features
- Future roadmap
- Advanced optimizations

**Стратегия:**
1. Задай все HIGH priority вопросы
2. Если пользователь не готов отвечать → можно пропустить MEDIUM/LOW
3. Заполни metadata.yaml с пометкой "Pending clarification" для пропущенных

---

#### 2.5.5: Validation Check

**Перед переходом к ШАГ 3, убедись:**

```python
# Minimum required data check
required_data = {
    "project_name": bool(metadata.get("project_name")),
    "project_type": bool(metadata.get("project_type")),
    "target_audience": bool(metadata.get("target_audience")),
    "tech_stack_frontend": bool(metadata.get("tech_stack", {}).get("frontend")),
    "tech_stack_backend_or_approach": True,  # Can be BaaS or API routes
    "features_extracted": extracted_features.count("Function ") > 0,
    "modules_defined": modules_list.count("## Модуль ") > 0
}

missing_critical = [key for key, value in required_data.items() if not value]

if missing_critical:
    print(f"⚠️ CRITICAL DATA MISSING: {', '.join(missing_critical)}")
    print(f"   These MUST be answered before continuing.\n")
    # Поднимаем приоритет этих вопросов до HIGH
else:
    print(f"✅ All critical data present, proceeding with optional questions.\n")
```

---

### ШАГ 3: Сформулируй Вопросы по Категориям

**Количество:** 5-15 вопросов (в зависимости от контекста)

**⚠️ ВАЖНО:** Используй 10 категорий вопросов ниже как руководство

---

## 📋 10 КАТЕГОРИЙ ВОПРОСОВ

### **КАТЕГОРИЯ 1: ПОДТВЕРЖДЕНИЕ ИЗВЛЕЧЁННЫХ ДАННЫХ** 🟢

**Когда использовать:** Когда в raw data явно указана информация

**Примеры:**
- **Название:** "Обнаружил название: '[название]'. Подтверждаете?"
- **Слоган/Tagline:** "В чатах предложены варианты слогана:
  - 🥇 '[вариант 1]'
  - 🥈 '[вариант 2]'
  - 🥉 '[вариант 3]'
  Какой выбираете или предложите свой?"
- **Target Audience:** "Целевая аудитория: '[извлечённая]' (упомянута [N] раз). Подтверждаете?"
- **Описание:** "Проект описан как '[описание из raw data]'. Верно?"

**Формат:** Да/Нет или Выбор из обнаруженных вариантов

---

### **КАТЕГОРИЯ 2: РАЗРЕШЕНИЕ ПРОТИВОРЕЧИЙ** 🔴 CRITICAL

**Когда использовать:** Когда найдены противоречия между источниками

**Примеры:**
- **Tech Stack противоречия:** "В ранних чатах ([дата]): React 17. В поздних ([дата]): React 19. Какая технология финальная? (Актуальные версии проверим в PHASE 3)"
- **Database противоречия:** "База данных - финальный выбор:
  a) MongoDB (упоминалась в [дата], [источник])
  b) PostgreSQL (упоминалась в [дата], [источник])
  c) Supabase (упоминалась в [дата])
  d) Другое (указать)"
- **Hosting противоречия:** "Hosting platform:
  a) Vercel (упомянут в [источник])
  b) Railway (упомянут в [источник])
  c) AWS (упомянут в [источник])
  d) Другой"
- **Feature contradictions:** "Функция [X] описана по-разному:
  - В [источник 1]: [описание 1]
  - В [источник 2]: [описание 2]
  Какое описание правильное?"

**Формат:** Выбор из противоречащих вариантов + контекст

**⚠️ PRIORITY:** Всегда спрашивай о противоречиях!

---

### **КАТЕГОРИЯ 3: TECH STACK - ВЫБОР ТЕХНОЛОГИЙ** 🟠 IMPORTANT

**⚠️ ВАЖНО:** В PHASE 2 спрашиваем ТОЛЬКО о выборе технологий (какие), БЕЗ версий!
Проверка актуальности и версий - это PHASE 3 (с web search)

**Когда использовать:** 
- Если есть противоречия в выборе технологий
- Если технология не упомянута (критический пробел)
- Для подтверждения общего набора технологий

**Примеры:**

**3.1: Простое подтверждение набора (БЕЗ версий):**
```
"Обнаружены технологии:
Frontend: React, Next.js, TypeScript, Tailwind CSS
Backend: [если упомянут]
Database: [если упомянут]

Подтверждаете этот набор? (Актуальность версий проверим в PHASE 3)"
```

**3.2: Database выбор (если нет противоречий, но не указано):**
```
"Для проекта нужна база данных. Планируете:
a) Supabase (PostgreSQL + auth + hosting) - проще для MVP
b) PostgreSQL напрямую - больше контроля
c) SQLite - для solo developers
d) MongoDB - для гибкой схемы
e) Пока не решено"
```

**3.3: UI Framework (если не упомянут):**
```
"UI компоненты:
a) shadcn/ui + Tailwind (modern, customizable)
b) Material-UI (comprehensive)
c) Ant Design (enterprise)
d) Custom components
Какой подход?"
```

**❌ НЕ спрашивай в PHASE 2:**
- ❌ "Какую версию React использовать?" → это PHASE 3
- ❌ "React 19.2 актуален?" → это PHASE 3 с web search
- ❌ "Tailwind v4 или v3?" → это PHASE 3
- ❌ Детальные вопросы о совместимости → это PHASE 3

**Формат:** Подтверждение списка технологий или выбор между вариантами

---

### **КАТЕГОРИЯ 4: ПРИОРИТИЗАЦИЯ ФУНКЦИЙ И МОДУЛЕЙ** 🟠 IMPORTANT

**Когда использовать:** Для определения MVP scope

**Примеры:**

**4.1: Module Priority:**
```
"Обнаружил [N] модулей. Я пометил [M] как CRITICAL для MVP. Это реалистично?

CRITICAL (MVP v1.0):
1. [Module 1] - [X функций]
2. [Module 2] - [Y функций]

HIGH (v1.1):
1. [Module N]

MEDIUM (v2.0):
1. [Module M]

Нужно сузить MVP scope или согласны?"
```

**4.2: Feature Prioritization:**
```
"Ключевые фичи:

Must Have (MVP):
✅ [Feature 1]
✅ [Feature 2]

Should Have (Phase 2):
🟡 [Feature 3]
🟡 [Feature 4]

Could Have (Later):
⚪ [Feature 5]

Изменить приоритеты?"
```

**4.3: Scope-specific вопросы:**
```
"[Module Name] включает [N] функций. Это must-have для MVP или можно отложить?"
```

**Формат:** Подтверждение или реприоритизация списка

---

### **КАТЕГОРИЯ 5: DEPLOYMENT & INFRASTRUCTURE** 🟠 IMPORTANT

**Когда использовать:** Для определения deployment стратегии

**Примеры:**

**5.1: Hosting Platform:**
```
"Hosting для MVP:
a) Vercel (рекомендуется для Next.js, free tier)
b) Railway (PostgreSQL included)
c) AWS/Google Cloud (больше контроля)
d) Другой (указать)
Какой выбираете?"
```

**5.2: Deployment Strategy:**
```
"Deployment:
a) Self-hosted (users deploy locally)
b) SaaS (cloud-hosted, вы управляете)
c) Hybrid (оба варианта)
Какой вариант?"
```

**5.3: Environment Setup:**
```
"Environments:
a) Dev + Production только
b) Dev + Staging + Production
c) Пока только локально
Какая структура?"
```

**Формат:** Выбор варианта

---

### **КАТЕГОРИЯ 6: PROJECT STRUCTURE & REPOSITORY** 🟡 MODULE-RELATED

**Когда использовать:** Для определения структуры проекта

**Примеры:**

**6.1: Repository Setup:**
```
"Repository для кода:
a) Создать новый [owner]/[project-name]
b) В текущем репо в папке /app
c) У вас уже есть (укажите URL)
Что делать?"
```

**6.2: Monorepo vs Multi-repo:**
```
"Структура:
a) Monorepo (frontend + backend вместе)
b) Separate repos
Какой подход?"
```

**6.3: Relationship with Other Projects:**
```
"Проект [название] - это:
a) Standalone продукт
b) Часть [другой проект] экосистемы
c) Использует [другой проект] как инструмент
Какой вариант?"
```

**Формат:** Выбор варианта

---

### **КАТЕГОРИЯ 7: TIMELINE & MILESTONES** 🟠 IMPORTANT

**Когда использовать:** Для определения временных рамок

**Примеры:**

**7.1: MVP Timeline:**
```
"Timeline для MVP:
a) 1-2 месяца
b) 3-4 месяца
c) 6+ месяцев
d) Без жесткого дедлайна ('когда готово')
Планируемый срок?"
```

**7.2: Target Launch Date:**
```
"Есть ли target launch date или soft deadline для MVP?"
```

**7.3: Development Phases:**
```
"Разработка:
a) Поэтапная (MVP → v1.1 → v2.0)
b) Iterative (постоянные улучшения)
c) Big Bang (всё сразу)
Какой подход?"
```

**Формат:** Выбор варианта или конкретная дата

---

### **КАТЕГОРИЯ 8: TEAM & DEVELOPMENT CONTEXT** 🟢 OPTIONAL

**Когда использовать:** Для понимания контекста разработки (можно infer)

**Примеры:**

**8.1: Team Size:**
```
"Размер команды:
a) Solo developer
b) 2-3 человека
c) 4-10 человек
d) 10+ человек
Сколько разработчиков?"
```

**8.2: Development Methodology:**
```
"Методология:
a) Agile/Scrum
b) Kanban
c) Waterfall
d) Flexible
Какой подход?"
```

**8.3: Budget Constraints:**
```
"Budget:
a) Minimal (<$50/month)
b) Moderate ($50-200/month)
c) Flexible
Какие ограничения?"
```

**Формат:** Выбор варианта

**⚠️ OPTIONAL:** Если пользователь не ответит - infer на основе контекста проекта

---

### **КАТЕГОРИЯ 9: BUSINESS & MONETIZATION** 🟢 OPTIONAL

**Когда использовать:** Для понимания бизнес-контекста (можно infer)

**Примеры:**

**9.1: Monetization:**
```
"Монетизация:
a) Free & Open Source
b) Freemium (free + paid tiers)
c) Paid (subscription/one-time)
d) Enterprise (B2B)
e) Пока не решено
Планируемая стратегия?"
```

**9.2: Target Audience Detail:**
```
"Primary пользователи:
a) Solo developers
b) Small teams (2-5)
c) Medium teams (5-15)
d) Large teams/Enterprise (15+)
e) Open source projects
Основная аудитория?"
```

**Формат:** Выбор варианта

**⚠️ OPTIONAL:** Можно infer или пропустить

---

### **КАТЕГОРИЯ 10: MISSING CRITICAL INFO** 🔴 CRITICAL

**Когда использовать:** Когда критическая информация не найдена в raw data

**Примеры:**

**10.1: Название (если не найдено):**
```
"Не обнаружил название проекта. Как называется проект?"
```

**10.2: Authentication (если не упомянуто):**
```
"Не обнаружил упоминание аутентификации. Планируете:
a) Email/password only
b) Email/password + OAuth2 (Google, GitHub)
c) OAuth2 only
d) Без аутентификации (public app)
e) Пока не решено"
```

**10.3: User Roles:**
```
"Будут ли разные роли пользователей (Admin, User, Guest) или все равны?"
```

**Формат:** Прямой вопрос или выбор варианта

**⚠️ PRIORITY:** Всегда спрашивай о критических пробелах!

---

### ШАГ 4: Сформулируй Финальный Список Вопросов

**Приоритизация вопросов:**

**🔴 CRITICAL (обязательно спросить):**
- Разрешение ВСЕХ противоречий (Категория 2)
- Критически недостающая информация (Категория 10)
- [Если existing project] Подтверждение обнаруженных фич из кода

**🟠 IMPORTANT (желательно спросить):**
- Tech Stack выбор технологий - ТОЛЬКО выбор, БЕЗ версий (Категория 3)
- Приоритизация модулей для MVP (Категория 4)
- Timeline & Milestones (Категория 7)
- Deployment & Infrastructure (Категория 5)

**🟡 MODULE-RELATED (если есть уточнения):**
- Repository structure (Категория 6)
- Project relationship (Категория 6)
- Module-specific вопросы (Категория 4)

**🟢 OPTIONAL (можешь infer):**
- Team context (Категория 8)
- Business context (Категория 9)
- Детали реализации

**Рекомендуемый формат вопросов:**

```markdown
❓ УТОЧНЯЮЩИЕ ВОПРОСЫ

Перед тем как продолжить к PHASE 3, у меня есть несколько вопросов для уточнения:

**🔴 CRITICAL (обязательно ответить):**

1. [Противоречие 1 - с контекстом источников и датами]
   Пример: "База данных - финальный выбор:
   a) MongoDB (упоминалась в чате от 2024-09)
   b) PostgreSQL (упоминалась в чате от 2024-11)
   Какой вариант?"

2. [Противоречие 2]

3. [Критический пробел - название/аудитория/etc]
   Пример: "Не обнаружил название проекта. Как называется?"

**🟠 IMPORTANT (желательно ответить):**

4. [Tech Stack подтверждение - список технологий БЕЗ версий]
   Пример: "Обнаружены технологии:
   Frontend: React, Next.js, TypeScript, Tailwind CSS
   Backend: Node.js, Express
   Database: PostgreSQL
   Подтверждаете этот набор? (Актуальность версий проверим в PHASE 3)"

5. [Database выбор - если не указано]
   Пример: "Для проекта нужна база данных:
   a) Supabase (PostgreSQL + auth + hosting)
   b) PostgreSQL напрямую
   c) MongoDB
   d) SQLite
   Какой вариант?"

6. [Hosting platform]
   Пример: "Hosting для MVP:
   a) Vercel (для Next.js, free tier)
   b) Railway (PostgreSQL included)
   c) AWS/Google Cloud
   Какой выбираете?"

7. [Timeline & MVP Scope]
   Пример: "Timeline для MVP:
   a) 1-2 месяца
   b) 3-4 месяца
   c) 6+ месяцев
   d) Без жесткого дедлайна
   Планируемый срок?"

8. [Module Priority]
   Пример: "Обнаружил [N] модулей. Я пометил [M] как CRITICAL для MVP.
   Это реалистично или нужно сузить scope?"

**🟡 MODULE-RELATED (если есть уточнения):**

9. [Repository structure]
   Пример: "Repository: создать новый [owner]/[project] или в текущем репо?"

10. [Project relationship]
    Пример: "Проект [название] - это standalone или часть [другой проект]?"

11. [Deployment strategy]
    Пример: "Deployment: self-hosted, SaaS или hybrid?"

[Если existing project:]

**🔵 CODE VERIFICATION:**

12. "Нашёл реализацию Feature X в src/, это правильно?"
13. "Feature Y частично реализован - UI есть, backend нет. Это корректно?"

**🟢 OPTIONAL (можешь пропустить):**

14. [Team size]
    Пример: "Размер команды: a) Solo, b) 2-3, c) 4-10, d) 10+?"

15. [Monetization]
    Пример: "Монетизация: a) Open Source, b) Freemium, c) Paid, d) Пока не решено?"

**📋 ИНСТРУКЦИИ:**
- 🔴 CRITICAL - обязательно ответить
- 🟠 IMPORTANT - желательно для качественной документации
- 🟡 MODULE-RELATED - если есть уточнения
- 🟢 OPTIONAL - можешь пропустить, я сделаю разумные предположения

Можно отвечать кратко, например:
1. PostgreSQL
2. Да, согласен
3. a) Vercel
4. c) Без жесткого дедлайна
5. Пропускаю (infer)
```

---

### ШАГ 5: Дождись ответов пользователя

**⏸️ PAUSE** - жди ответов пользователя

**Обработка ответов:**
- Если пользователь ответил только на часть - это нормально
- Для неотвеченных OPTIONAL вопросов - infer сам на основе контекста
- Для неотвеченных CRITICAL - спроси ещё раз (один раз)
- Если пользователь сказал "infer" или "пропускаю" - используй inference на основе имеющихся данных

---

### ШАГ 6: AUTO-FILL metadata.yaml

**После получения ответов:**

**Прочитай текущий:**
```
UPMT/bootstrap/00_RAW_DATA_TEMPLATE/metadata.yaml
```

**Заполни автоматически на основе:**
- Raw data (из PHASE 1)
- `extracted_features.md`
- `modules_list.md`
- Ответы пользователя из ШАГ 3

**Секции для заполнения:**

```yaml
project:
  name: "[название проекта]"
  version: "0.1.0"
  description: "[краткое описание]"
  type: "[web app / mobile app / desktop / library / etc]"

metadata:
  created_date: "[дата]"
  last_updated: "[дата]"
  author: "[автор, если упомянут]"
  
project_info:
  target_audience: "[целевая аудитория]"
  problem_statement: "[какую проблему решает]"
  value_proposition: "[ценность для пользователей]"
  
features_summary:
  total_functions: [N]
  total_modules: [M]
  priority_features:
    - "[critical feature 1]"
    - "[critical feature 2]"
    
modules:
  - name: "[Module 1]"
    description: "[описание]"
    functions_count: [X]
    status: "[New/Existing/Partial]"
    priority: "[Critical/High/Medium/Low]"
  [... для всех модулей из modules_list.md]
  
tech_stack:
  frontend:
    - "[технология 1]"
    - "[технология 2]"
  backend:
    - "[технология 1]"
    - "[технология 2]"
  [... из упоминаний + ответов пользователя]
  
timeline:
  estimated_duration: "[duration из ответов]"
  target_launch: "[дата из ответов, если есть]"
  milestones:
    - name: "[milestone 1]"
      date: "[дата]"
      
development:
  methodology: "[Agile / Scrum / Kanban / etc из ответов или infer]"
  team_size: "[размер команды, если упомянут]"
  
existing_project:  # Только для existing projects
  enabled: true
  current_progress: "[X]%"
  code_location: "[src/, app/, etc]"
  implemented_modules: [список]
  
decisions:
  - question: "[вопрос]"
    answer: "[ответ пользователя]"
    inference: "[если inferred]"
  [... для каждого вопроса]
```

**Сохрани обновлённый файл:**

```
UPMT/bootstrap/00_RAW_DATA_TEMPLATE/metadata.yaml
```

---

### ШАГ 7: Подтверди заполнение

**Покажи пользователю:**

```markdown
✅ METADATA AUTO-FILL COMPLETE

Я автоматически заполнил metadata.yaml на основе:
- Extracted features ([N] функций)
- Modules list ([M] модулей)
- Ваших ответов на вопросы

**Заполненные секции:**
✅ Project info (название, описание, тип)
✅ Target audience
✅ Features summary ([N] функций, [M] модулей)
✅ Modules ([M] модулей с приоритетами)
✅ Tech stack (frontend/backend)
✅ Timeline [если было в ответах]
[Если existing project:] ✅ Existing project info ([X]% progress)

**Файл:** UPMT/bootstrap/00_RAW_DATA_TEMPLATE/metadata.yaml

Можешь просмотреть файл для проверки. Продолжаю к PHASE 3?

Если нужны корректировки metadata - напиши, я обновлю.
```

**⏸️ PAUSE** - дождись подтверждения или корректировок

**Если корректировки:**
- Обнови `metadata.yaml`
- Покажи обновлённый summary
- Спроси подтверждение ещё раз

---

## 💾 CHECKPOINT

**После заполнения metadata:**

```bash
git add UPMT/bootstrap/00_RAW_DATA_TEMPLATE/metadata.yaml
git commit -m "docs(bootstrap): PHASE 2 complete - interview finished, metadata auto-filled"
git push
```

**Показать прогресс:**

```markdown
✅ PHASE 2 COMPLETE

**Interview:**
- Задано [N] вопросов
- Получено [M] ответов
- [K] inferred

**Metadata AUTO-FILL:**
- ✅ metadata.yaml заполнен
- [N] функций
- [M] модулей
- Tech stack определён

**Next:** PHASE 3 - Tech Stack Verification

⏱️ PHASE 2 завершена за [время]
```

---

## 🔄 СЛЕДУЮЩИЙ ШАГ

```
→ ПЕРЕХОД К PHASE 3: TECH STACK VERIFICATION
→ Прочитай: UPMT/prompts/phases/phase-3-tech-verification.md
```

