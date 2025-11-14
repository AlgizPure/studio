# PHASE 3: TECH STACK VERIFICATION

**Время выполнения:** 45-60 минут

**Назначение:** Проверка актуальности технологий (November 2025), создание verification prompt, получение recommendations

---

## 📖 КОНТЕКСТ ПЕРЕД PHASE 3

**⚠️ ОБЯЗАТЕЛЬНО ПРОЧИТАЙ:**
1. `UPMT/bootstrap/00_RAW_DATA_TEMPLATE/metadata.yaml` (tech_stack section)
2. `extracted_features.md` (упоминания технологий)
3. [Если existing project] `/analysis-report.md` (tech stack из code analysis)

---

## 📋 ИНСТРУКЦИИ

### ШАГ 1: Анализ упоминаний технологий

**⚠️ КРИТИЧНО: Обработка больших файлов**

**Используй `safe_read_file()` из адаптера для автоматической обработки больших файлов.**

**Алгоритм:**
1. Для каждого файла вызывай `safe_read_file(file_path)`
2. Если файл большой (>256KB или >25000 токенов) - функция автоматически прочитает по частям
3. Объедини все части перед анализом

**Собери все упоминания технологий из:**

**Файлы для чтения:**
- `UPMT/bootstrap/00_RAW_DATA_TEMPLATE/metadata.yaml` → `safe_read_file("UPMT/bootstrap/00_RAW_DATA_TEMPLATE/metadata.yaml")`
- `UPMT/bootstrap/00_RAW_DATA_TEMPLATE/extracted_features.md` → `safe_read_file("UPMT/bootstrap/00_RAW_DATA_TEMPLATE/extracted_features.md")` (может быть большим)
- [Если existing project] `analysis-report.md` → `safe_read_file("analysis-report.md")`

**⚠️ ВАЖНО:** 
- НЕ ПРОПУСКАЙ файлы из-за размера
- Функция автоматически обработает большие файлы
- Детали алгоритма см. в `cli-adapter.md` / `web-adapter.md`

**Группируй по категориям:**

```
Frontend:
- React 18.2
- TypeScript 5.0
- Tailwind CSS 3.x

Backend:
- Node.js 20.x
- Express 4.18
- PostgreSQL 15

Tools:
- Vite 4.x
- ESLint 8.x
```

---

### ШАГ 2: Создание Verification Prompt

**Создай файл:** `/verification/VERIFICATION_PROMPT_FOR_CLAUDE.md`

**Содержимое:**

```markdown
# TECH STACK VERIFICATION PROMPT

**Дата проверки:** November 2025  
**Проект:** [название проекта]

---

## ЗАДАЧА

Проверь актуальность следующих технологий **на ноябрь 2025 года**.

Для каждой технологии:
1. Текущая актуальная версия
2. Нужно ли обновление
3. Есть ли более современные альтернативы
4. Рекомендации

⚠️ **Используй web search для проверки актуальных версий!**

---

## ТЕХНОЛОГИИ ДЛЯ ПРОВЕРКИ

### Frontend

**React:**
- Упомянутая версия: [версия из данных]
- Актуальная версия (November 2025): ?
- Обновить до: ?
- Причина обновления: ?

**TypeScript:**
- Упомянутая версия: [версия]
- Актуальная версия (November 2025): ?
- Обновить до: ?

[... для каждой технологии frontend]

### Backend

**Node.js:**
- Упомянутая версия: [версия]
- Актуальная версия (November 2025): ?
- LTS версия: ?
- Обновить до: ?

[... для каждой технологии backend]

### Database

**PostgreSQL:**
- Упомянутая версия: [версия]
- Актуальная версия (November 2025): ?
- Обновить до: ?

[... для каждой БД]

### Tools & Dev Dependencies

[... для каждой утилиты]

---

## ВОПРОСЫ

1. Есть ли технологии, которые устарели и требуют замены?
2. Есть ли несовместимости между версиями?
3. Какие breaking changes между текущими и рекомендуемыми версиями?
4. Есть ли более современные альтернативы упомянутым технологиям?
5. Какие технологии из стека требуют особого внимания?

---

## ФОРМАТ ОТВЕТА

Для КАЖДОЙ технологии напиши:

```
### [Технология]

**Current (упомянутая):** [версия]
**Latest (November 2025):** [версия]
**Recommendation:** [Keep / Update to X.X / Replace with Y]
**Reason:** [краткое объяснение]
**Breaking changes:** [если есть]
**Migration effort:** [Low / Medium / High]
```

В конце добавь:

```
## FINAL RECOMMENDATIONS

**Critical updates:**
- [обновление 1]
- [обновление 2]

**Nice to have:**
- [обновление 3]

**Consider replacing:**
- [технология X] → [альтернатива Y] (причина)
```
```

---

### ШАГ 3: PAUSE - Действие пользователя

**Покажи пользователю:**

```markdown
⏸️ PHASE 3: TECH VERIFICATION - ТРЕБУЕТСЯ ВАШЕ ДЕЙСТВИЕ

Я создал verification prompt: `/verification/VERIFICATION_PROMPT_FOR_CLAUDE.md`

**ЧТО ДЕЛАТЬ ДАЛЬШЕ:**

1. Скопируй содержимое файла `/verification/VERIFICATION_PROMPT_FOR_CLAUDE.md`

2. Открой новую вкладку Claude.ai (или ChatGPT с web search)

3. Вставь prompt и **включи web search**

4. Claude проверит актуальность всех технологий на November 2025

5. Скопируй ответ Claude и сохрани в файл: `/verification/tech-stack-analysis.md`

6. Напиши мне **"continue"** после завершения

---

**⏱️ Это займёт 5-10 минут**

ЖДУ ВАШЕГО "continue" ДЛЯ ПРОДОЛЖЕНИЯ...
```

**⏸️ PAUSE** - жди "continue" от пользователя

---

### ШАГ 4: Чтение Analysis Results

**После "continue":**

**Прочитай файл:** `/verification/tech-stack-analysis.md`

**⚠️ Используй адаптер:**
- **CLI:** `read_file("/verification/tech-stack-analysis.md")`
- **Web:** `gh api /repos/{owner}/{repo}/contents/verification/tech-stack-analysis.md`

**Извлеки:**
- Critical updates
- Recommended updates
- Technologies to replace
- Breaking changes
- Migration effort estimates

---

### ШАГ 5: Формирование Final Tech Stack

**Проанализируй recommendations и создай финальный tech stack:**

**Покажи пользователю:**

```markdown
📊 TECH STACK RECOMMENDATIONS

На основе verification analysis (November 2025):

**🔴 CRITICAL UPDATES (обязательные):**

1. [Technology 1]: [current version] → [recommended version]
   - Причина: [security / EOL / major improvements]
   - Breaking changes: [описание]
   - Migration: [Low/Medium/High effort]

2. [Technology 2]: ...

**🟠 RECOMMENDED UPDATES (желательные):**

1. [Technology 3]: ...

**🟡 CONSIDER (можно отложить):**

1. [Technology 4]: ...

**🔄 REPLACE (замены):**

1. [Old Tech] → [New Tech]
   - Причина: [better performance / modern alternative / etc]
   - Migration: [effort]

---

**ФИНАЛЬНЫЙ TECH STACK (с учётом recommendations):**

### Frontend
- [Tech 1] [recommended version]
- [Tech 2] [recommended version]

### Backend
- [Tech 1] [recommended version]
- [Tech 2] [recommended version]

### Database
- [DB] [recommended version]

### Tools
- [Tool 1] [recommended version]

---

**Вопросы:**

1. Согласны с critical updates?
2. Какие recommended updates применить?
3. Согласны с предложенными заменами?

Напиши "APPROVED" или укажи корректировки.
```

**⏸️ PAUSE** - жди подтверждения или корректировок

---

### ШАГ 6: Сохранение Final Tech Stack

**После APPROVED:**

**Создай файл:** `/verification/final-tech-stack.md`

**Содержимое:**

```markdown
# FINAL TECH STACK

**Дата:** [timestamp]
**Статус:** APPROVED
**На основе:** Tech Stack Verification (November 2025)

---

## ПРИМЕНЯЕМЫЕ ОБНОВЛЕНИЯ

### Critical Updates
1. [Tech] [old] → [new] - [причина]

### Recommended Updates
2. [Tech] [old] → [new] - [причина]

### Replacements
3. [Old Tech] → [New Tech] - [причина]

---

## TECH STACK

### Frontend
- **Framework:** [React 19.0]
- **Language:** [TypeScript 5.3]
- **Styling:** [Tailwind CSS 4.0]
- **Build Tool:** [Vite 5.x]

### Backend
- **Runtime:** [Node.js 22 LTS]
- **Framework:** [Express 5.0]
- **Language:** [TypeScript 5.3]

### Database
- **Primary:** [PostgreSQL 16]
- **ORM:** [Prisma 6.x / Drizzle 0.30]

### Tools & Dev
- **Testing:** [Vitest 1.x / Jest 30.x]
- **Linting:** [ESLint 9.x]
- **Formatting:** [Prettier 3.x]
- **Package Manager:** [pnpm 9.x / npm 10.x]

---

## ВЕРСИИ ДЛЯ DEPENDENCIES

```json
{
  "dependencies": {
    "[package]": "^[version]",
    ...
  },
  "devDependencies": {
    "[package]": "^[version]",
    ...
  }
}
```

---

## MIGRATION NOTES

### Breaking Changes
1. [Tech]: [breaking change описание]
   - Решение: [как мигрировать]

### Compatibility
- All versions tested for compatibility (November 2025)
- No known conflicts

---

## АЛЬТЕРНАТИВЫ РАССМОТРЕНЫ

1. [Alternative 1] вместо [Current] - отклонено по причине [reason]
2. [Alternative 2] вместо [Current] - отклонено по причине [reason]
```

---

### ШАГ 7: Обновление metadata.yaml

**Обнови секцию tech_stack в:** `UPMT/bootstrap/00_RAW_DATA_TEMPLATE/metadata.yaml`

```yaml
tech_stack:
  verified_date: "[date]"
  verification_status: "APPROVED"
  
  frontend:
    framework: "[React 19.0]"
    language: "[TypeScript 5.3]"
    styling: "[Tailwind CSS 4.0]"
    build_tool: "[Vite 5.x]"
    
  backend:
    runtime: "[Node.js 22 LTS]"
    framework: "[Express 5.0]"
    language: "[TypeScript 5.3]"
    
  database:
    primary: "[PostgreSQL 16]"
    orm: "[Prisma 6.x]"
    
  tools:
    testing: "[Vitest 1.x]"
    linting: "[ESLint 9.x]"
    formatting: "[Prettier 3.x]"
    package_manager: "[pnpm 9.x]"
```

---

## 💾 CHECKPOINT

**После заполнения:**

```bash
git add verification/VERIFICATION_PROMPT_FOR_CLAUDE.md
git add verification/tech-stack-analysis.md
git add verification/final-tech-stack.md
git add UPMT/bootstrap/00_RAW_DATA_TEMPLATE/metadata.yaml
git commit -m "docs(bootstrap): PHASE 3 complete - tech stack verified (November 2025)"
git push
```

**Показать прогресс:**

```markdown
✅ PHASE 3 COMPLETE

**Tech Verification:**
- ✅ Verification prompt создан
- ✅ Analysis выполнен (web search)
- ✅ Final tech stack APPROVED
- ✅ metadata.yaml обновлён

**Applied Updates:**
- Critical: [N]
- Recommended: [M]
- Replacements: [K]

**Next:** PHASE 4 - Synthesis

⏱️ PHASE 3 завершена за [время]
```

---

## 🔄 СЛЕДУЮЩИЙ ШАГ

```
→ ПЕРЕХОД К PHASE 4: SYNTHESIS
→ Прочитай: UPMT/prompts/phases/phase-4-synthesis.md
```

