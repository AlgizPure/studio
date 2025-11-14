# PHASE 4: SYNTHESIS

**Время выполнения:** 15 минут (автономно)

**Назначение:** Объединение всех данных из PHASE 1-3 в единый unified view

---

## 📖 КОНТЕКСТ ПЕРЕД PHASE 4

**⚠️ ОБЯЗАТЕЛЬНО ПРОЧИТАЙ:**

**⚠️ КРИТИЧНО: Обработка больших файлов**

**Используй `safe_read_file()` из адаптера для автоматической обработки больших файлов.**

**Алгоритм:**
1. Для каждого файла вызывай `safe_read_file(file_path)`
2. Если файл большой (>256KB или >25000 токенов) - функция автоматически прочитает по частям
3. Объедини все части перед анализом

**Файлы для чтения:**
- `UPMT/bootstrap/00_RAW_DATA_TEMPLATE/extracted_features.md` → `safe_read_file("UPMT/bootstrap/00_RAW_DATA_TEMPLATE/extracted_features.md")` (может быть очень большим)
- `UPMT/bootstrap/00_RAW_DATA_TEMPLATE/modules_list.md` → `safe_read_file("UPMT/bootstrap/00_RAW_DATA_TEMPLATE/modules_list.md")`
- `UPMT/bootstrap/00_RAW_DATA_TEMPLATE/metadata.yaml` → `safe_read_file("UPMT/bootstrap/00_RAW_DATA_TEMPLATE/metadata.yaml")`
- `/verification/tech-stack-analysis.md` (если есть) → `safe_read_file("/verification/tech-stack-analysis.md")`
- `/verification/final-tech-stack.md` (если есть) → `safe_read_file("/verification/final-tech-stack.md")`
- `/analysis-report.md` → `safe_read_file("/analysis-report.md")`

**⚠️ ВАЖНО:** 
- НЕ ПРОПУСКАЙ файлы из-за размера
- Функция автоматически обработает большие файлы
- Детали алгоритма см. в `cli-adapter.md` / `web-adapter.md`

---

## 📋 ИНСТРУКЦИИ

### ШАГ 1: Объединение всех данных

**Создай unified view, объединяющий:**

**Из PHASE 1 (Analysis):**
- Extracted features (N функций, M модулей)
- [Если existing project] Code analysis results
- Findings и insights

**Из PHASE 2 (Interview):**
- Ответы пользователя на вопросы
- Разрешённые противоречия
- Inferred данные

**Из PHASE 3 (Tech Verification):**
- Финальный tech stack
- Applied updates и replacements
- Migration notes

---

### ШАГ 2: Создание Synthesized Project Data

**Создай файл:** `/synthesized-project-data.md`

**Содержимое:**

```markdown
# SYNTHESIZED PROJECT DATA

**Дата:** [timestamp]
**Статус:** Ready for documentation generation

---

## PROJECT OVERVIEW

**Название:** [название проекта]
**Тип:** [web app / mobile app / desktop / library]
**Версия:** [версия]

**Описание:** [краткое описание проекта]

**Проблема:** [какую проблему решает]

**Ценность:** [value proposition]

**Целевая аудитория:** [аудитория]

[Если existing project:]
**Текущий прогресс:** [X]% complete

---

## FEATURES & MODULES

**Всего функций:** [N]
**Всего модулей:** [M]

### Модули (из modules_list.md):

**1. [Module Name]**
- **Описание:** [описание]
- **Функций:** [X]
- **Приоритет:** [Critical/High/Medium/Low]
- **Статус:** [New/Existing/Partial]
- [Если existing] **Progress:** [X]%

[... для всех модулей]

### Приоритетные функции:

**🔴 CRITICAL:**
1. [Function] - [описание] - Module: [Module Name]
2. [Function] - [описание] - Module: [Module Name]

**🟠 HIGH:**
1. [Function] - [описание] - Module: [Module Name]

**🟡 MEDIUM:**
1. [Function] - [описание] - Module: [Module Name]

---

## TECH STACK (Verified November 2025)

### Frontend
- **Framework:** [React 19.0]
- **Language:** [TypeScript 5.3]
- **Styling:** [Tailwind CSS 4.0]
- **Build Tool:** [Vite 5.x]
- **State Management:** [если упомянуто]
- **Routing:** [если упомянуто]

### Backend
- **Runtime:** [Node.js 22 LTS]
- **Framework:** [Express 5.0]
- **Language:** [TypeScript 5.3]
- **API:** [REST / GraphQL / tRPC]

### Database
- **Primary:** [PostgreSQL 16]
- **ORM:** [Prisma 6.x]
- **Caching:** [Redis, если упомянуто]

### Infrastructure
- **Hosting:** [если упомянуто]
- **CI/CD:** [если упомянуто]
- **Cloud:** [если упомянуто]

### Tools & Dev
- **Testing:** [Vitest 1.x]
- **Linting:** [ESLint 9.x]
- **Formatting:** [Prettier 3.x]
- **Package Manager:** [pnpm 9.x]

**Applied Updates (from PHASE 3):**
- [Tech 1]: [old] → [new]
- [Tech 2]: [old] → [new]

---

## ARCHITECTURE (High-Level)

**Pattern:** [Monolith / Modular Monolith / Microservices]

**Frontend Architecture:**
- [Component-based / Feature-based / etc]
- [State management approach]

**Backend Architecture:**
- [Layered / Clean / Hexagonal / etc]
- [Service-oriented / Repository pattern / etc]

[Если existing project:]
**Current Code Structure:**
```
src/
├── [structure из code analysis]
```

---

## TIMELINE & MILESTONES

**Estimated Duration:** [duration]

**Target Launch:** [date, если есть]

**Milestones:**

**Phase 1: Foundation**
- Duration: [время]
- Deliverables: [список]

**Phase 2: Core Features**
- Duration: [время]
- Deliverables: [список]

**Phase 3: Polish & Launch**
- Duration: [время]
- Deliverables: [список]

---

## USER STORIES & USE CASES

**Primary User Stories (из extracted_features):**

**As a [user type], I want to [action] so that [benefit]**

1. [User Story 1]
2. [User Story 2]
3. [User Story 3]

[... топ-10 user stories]

---

## KEY DECISIONS (from Interview)

**Decision 1:** [вопрос]
- **Answer:** [ответ пользователя]
- **Impact:** [как влияет на проект]

**Decision 2:** [вопрос]
- **Answer:** [ответ пользователя]
- **Impact:** [как влияет]

[... ключевые решения]

---

## CONSTRAINTS & ASSUMPTIONS

**Constraints:**
- [Ограничение 1]
- [Ограничение 2]

**Assumptions:**
- [Предположение 1]
- [Предположение 2]

---

## RISKS & MITIGATION

**Risk 1:** [риск]
- **Probability:** [High/Medium/Low]
- **Impact:** [High/Medium/Low]
- **Mitigation:** [как минимизировать]

[... ключевые риски]

---

[Если existing project:]

## EXISTING CODE ANALYSIS

**Current Progress:** [X]%

**Implemented Modules:**
- [Module 1] - [Y]% complete
- [Module 2] - [Z]% complete

**Tech Stack (from code):**
- [список из package.json]

**Architecture Patterns Found:**
- [pattern 1]
- [pattern 2]

**Code Quality:**
- [observations из code analysis]

**Gaps (Requirements vs Reality):**
1. [Gap 1]
2. [Gap 2]

---

## NEXT STEPS

**Immediate (PHASE 5):**
- Generate full documentation
- Create module requirements
- Setup AI rules

**Short-term:**
- [action 1]
- [action 2]

**Long-term:**
- [action 3]
- [action 4]
```

---

### ШАГ 2.5: Design Data Detection (для Phase 5.5)

**⚠️ КРИТИЧНО: Проверь наличие design raw data для conditional Phase 5.5**

```python
print("\n🔍 STEP 2.5: Checking for design raw data...\n")

design_folders = {
    "chats": "00_DESIGN_RAW_DATA/chats/",
    "moodboards": "00_DESIGN_RAW_DATA/moodboards/",
    "figma": "00_DESIGN_RAW_DATA/figma/",
    "screenshots": "00_DESIGN_RAW_DATA/screenshots/",
    "research": "00_DESIGN_RAW_DATA/research/",
    "brand": "00_DESIGN_RAW_DATA/brand/"
}

design_files_found = {}
total_design_files = 0

for category, folder in design_folders.items():
    # Список всех файлов
    all_files = list_files(folder)
    
    # Исключаем README и _example
    actual_files = [f for f in all_files 
                   if not f.startswith("README") 
                   and not f.startswith("_example")]
    
    design_files_found[category] = actual_files
    total_design_files += len(actual_files)
    
    if actual_files:
        print(f"   ✅ {folder}: {len(actual_files)} files")
        for file in actual_files[:3]:  # Первые 3
            print(f"      - {file}")
        if len(actual_files) > 3:
            print(f"      ... and {len(actual_files) - 3} more")
    else:
        print(f"   ⚠️ {folder}: empty (only README)")

print(f"\n📊 Design Data Summary:")
print(f"   Total design files: {total_design_files}")

if total_design_files > 0:
    print(f"\n✅ DESIGN DATA DETECTED!")
    print(f"   → PHASE 5.5 (Design System) WILL BE EXECUTED")
    print(f"   → Design files will be analyzed and documented\n")
    
    # Сохрани в synthesis
    synthesis_data["design_data_detected"] = True
    synthesis_data["design_files_count"] = total_design_files
    synthesis_data["design_files_by_category"] = design_files_found
else:
    print(f"\nℹ️ No design data found (only README files)")
    print(f"   → PHASE 5.5 (Design System) WILL BE SKIPPED")
    print(f"   → This is OK for projects without design materials\n")
    
    synthesis_data["design_data_detected"] = False
    synthesis_data["design_files_count"] = 0
```

**Добавь в synthesized-project-data.md секцию:**

```markdown
## DESIGN DATA STATUS

**Design Data Detected:** [Yes/No]
**Total Design Files:** [N]

[If detected:]
**Files by Category:**
- Chats: [N] files
- Moodboards: [N] files
- Figma: [N] files
- Screenshots: [N] files
- Research: [N] files
- Brand: [N] files

**Next Phase:** PHASE 5.5 (Design System) will be executed
```

---

### ШАГ 3: Валидация Synthesis

**Проверь что включены ВСЕ данные:**

✅ Project overview (из metadata.yaml)
✅ Features & modules (из extracted_features.md, modules_list.md)
✅ Tech stack (из final-tech-stack.md)
✅ Timeline (из metadata.yaml + interview)
✅ Key decisions (из PHASE 2)
✅ [Если existing] Code analysis results

**Если что-то отсутствует:**
- Вернись к соответствующему файлу
- Дополни synthesized-project-data.md

---

## 💾 CHECKPOINT

**После создания:**

```bash
git add synthesized-project-data.md
git commit -m "docs(bootstrap): PHASE 4 complete - synthesized unified view"
git push
```

**Показать прогресс:**

```markdown
✅ PHASE 4 COMPLETE

**Synthesized Data:**
- ✅ Project overview
- ✅ Features & modules ([N] функций, [M] модулей)
- ✅ Tech stack (verified)
- ✅ Timeline & milestones
- ✅ Key decisions
- [Если existing] ✅ Code analysis

**File created:**
- synthesized-project-data.md

**Next:** PHASE 5 - Documentation Generation (самая большая фаза - 2-4 часа)

⏱️ PHASE 4 завершена за [время]
```

---

## 🔄 СЛЕДУЮЩИЙ ШАГ

```
→ ПЕРЕХОД К PHASE 5: DOCUMENTATION GENERATION
→ Прочитай: UPMT/prompts/phases/phase-5-documentation.md
```

