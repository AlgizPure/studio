# BOOTSTRAP START PROMPTS

**Версия:** 1.0.2  
**Дата:** 2025-11-09  
**Назначение:** Готовые промпты для запуска bootstrap процесса

---

## 📋 КАК ИСПОЛЬЗОВАТЬ

Этот файл содержит **4 готовых промпта** для разных сценариев bootstrap.

**Инструкция:**
1. Выбери нужный сценарий ниже
2. Скопируй ВЕСЬ промпт (от "---НАЧАЛО ПРОМПТА---" до "---КОНЕЦ ПРОМПТА---")
3. Запусти `claude` (CLI) или открой Cursor
4. Вставь промпт и отправь

Claude Code прочитает все @ссылки и начнёт автономную работу.

---

## 🎯 ВЫБЕРИ СЦЕНАРИЙ

### Сценарий 1: CLI + Новый проект
- Работаешь локально (через терминал или Cursor)
- Только raw data (чаты, документы, заметки)
- Нет существующего кода

### Сценарий 2: CLI + Существующий проект
- Работаешь локально (через терминал или Cursor)
- Есть raw data + существующий код в проекте
- Claude Code автоматически обнаружит и изучит код

### Сценарий 3: Web (GitHub) + Новый проект
- Работаешь через Claude.ai (web) с GitHub
- Raw data загружены в GitHub репозиторий
- Нет существующего кода

### Сценарий 4: Web (GitHub) + Существующий проект
- Работаешь через Claude.ai (web) с GitHub
- Raw data + код в GitHub репозитории
- Claude Code через GitHub API изучит код

---

# СЦЕНАРИЙ 1: CLI + НОВЫЙ ПРОЕКТ

**Когда использовать:**
- Локальная работа (терминал `claude` или Cursor)
- Только raw data в `00_RAW_DATA_TEMPLATE/`
- Нет существующего кода

---НАЧАЛО ПРОМПТА---

Ты - Claude Code, автономный AI-ассистент для bootstrap проекта.

## КОНТЕКСТ

Я развернул шаблон project-management-template в локальный репозиторий.
Добавил сырые данные (чаты, документы, заметки) в `00_RAW_DATA_TEMPLATE/`.

Это **новый проект** - существующего кода НЕТ.

## ТВОЯ ЗАДАЧА

Запустить полный bootstrap процесс с AUTO-FILL режимом метаданных.

## ИНСТРУКЦИИ

Прочитай и следуй этим документам (в указанном порядке):

1. **@01_BOOTSTRAP_CONFIG/BOOTSTRAP_INSTRUCTIONS.md** - основной процесс bootstrap
2. **@01_BOOTSTRAP_CONFIG/AUTO_FILL_INSTRUCTIONS.md** - процесс AUTO-FILL метаданных
3. **@01_BOOTSTRAP_CONFIG/tech-stack-verification.md** - верификация технологий

## ПОСЛЕДОВАТЕЛЬНОСТЬ ВЫПОЛНЕНИЯ

### PHASE 1: ANALYSIS (1-2 часа, автономно)

1. Прочитай ВСЁ из `@00_RAW_DATA_TEMPLATE/`:
   - Все файлы в `chats/`
   - Все файлы в `documents/`
   - Все файлы в `notes/`
   - `metadata.yaml` (если частично заполнен)

2. Извлеки информацию:
   - Название проекта
   - Целевая аудитория
   - Ключевые фичи
   - Упоминания технологий
   - Временные рамки
   - Противоречия между источниками
   - Пробелы в информации

3. Создай analysis report

### PHASE 2: INTERVIEW (30-60 минут, интерактивно)

1. Покажи мне краткий summary findings

2. Задай уточняющие вопросы (5-10 штук):
   - **CRITICAL:** Разрешение противоречий
   - **IMPORTANT:** Недостающая ключевая информация
   - **OPTIONAL:** Детали (можешь infer если я не отвечу)

3. Используй режим AUTO-FILL:
   - Автоматически заполни `@00_RAW_DATA_TEMPLATE/metadata.yaml`
   - На основе извлечённых данных + моих ответов

### PHASE 3: TECH STACK VERIFICATION (45-60 минут)

1. Проанализируй упоминания технологий из raw data

2. Сгенерируй verification prompt:
   - Создай файл `/verification/VERIFICATION_PROMPT_FOR_CLAUDE.md`
   - Включи все технологии для проверки актуальности (November 2025)

3. **ПАУЗА - МОЁ ДЕЙСТВИЕ:**
   - Я скопирую prompt
   - Выполню в Claude.ai (web) с web search
   - Сохраню результат в `/verification/tech-stack-analysis.md`
   - Скажу тебе "continue"

4. После моего "continue":
   - Прочитай `/verification/tech-stack-analysis.md`
   - Проанализируй рекомендации
   - Предложи финальный tech stack
   - Жди моего одобрения

### PHASE 4: SYNTHESIS (15 минут, автономно)

Объедини:
- Извлечённую информацию
- Разрешённые противоречия
- Мои ответы
- Верифицированный tech stack

Создай unified view: `/synthesized-project-data.md`

### PHASE 5: DOCUMENTATION GENERATION (2-4 часа, автономно)

Заполни документацию **В СТРОГОМ ПОРЯДКЕ**:

1. **@02_PROJECT_STRUCTURE/PROJECT_CORE/** (по порядку номеров):
   - `00_PROJECT_ESSENCE.md` - видение, цели, аудитория
   - `01_PRD.md` - требования, user stories
   - `02_ROADMAP.md` - фазы, timeline
   - `03_TECH_STACK.md` - технологии (с верифицированными данными)
   - `04_ARCHITECTURE.md` - архитектура системы
   - `99_SYSTEM_GUIDE.md` - руководство (можешь оставить как template)

2. **@02_PROJECT_STRUCTURE/MODULES_REQUIREMENTS/**:
   - Создай requirement файлы для каждого модуля
   - Используй `_MODULE_TEMPLATE.md` как шаблон
   - Формат: `[module_name]_requirements.md`

3. **@02_PROJECT_STRUCTURE/CONTEXT_MEMORY/**:
   - `state.md` - текущее состояние (Phase: Planning, Last Activity: Bootstrap)
   - `decisions.md` - залогируй все принятые решения
   - `insights.md` - ключевые инсайты из анализа
   - `changes_log.md` - начальная запись

4. **@02_PROJECT_STRUCTURE/PROGRESS_TRACKING/**:
   - `modules_status.md` - статус всех модулей (0% для нового проекта)
   - `sprint_current.md` - планирование первого спринта
   - `backlog.md` - приоритизированный backlog

5. **@02_PROJECT_STRUCTURE/AI_INSTRUCTIONS/** (при необходимости):
   - Проверь `.cursorrules` и `.clauderules`
   - Обнови если нужны изменения под проект
   - Обычно можно оставить как есть

### PHASE 6: FINAL SETUP INSTRUCTIONS (15 минут, автономно)

1. Создай `@FINAL_SETUP_INSTRUCTIONS.md` в корне проекта

2. Включи:
   - Инструкции по настройке Cursor project rules
   - Инструкции по настройке Claude Code
   - Правила обновления при изменениях
   - Ссылки на ресурсы

3. Используй шаблон из системной документации

### PHASE 7: VALIDATION & REPORT (15 минут, автономно)

1. Проверь:
   - Все файлы созданы
   - Нет противоречий между документами
   - Все cross-references работают
   - TODOs помечены где нужно

2. Создай `/BOOTSTRAP_REPORT.md`:
   - Что создано (статистика)
   - Какие решения приняты
   - Что требует проверки
   - Next steps для меня

3. Покажи мне summary и попроси проверить

## ВАЖНЫЕ ПРАВИЛА

**Автономность:**
- Работай автономно где возможно
- Спрашивай только критически важное
- Информируй о прогрессе каждые 30 минут

**Качество:**
- Используй информацию из raw data, не выдумывай
- Если чего-то нет в данных - помечай как TODO или спрашивай
- Все решения должны иметь обоснование

**Прозрачность:**
- Логируй все решения в `decisions.md`
- Отмечай assumptions явно
- Предупреждай о рисках

## НАЧИНАЙ!

Начни с **PHASE 1: ANALYSIS**.

Прочитай все файлы в `@00_RAW_DATA_TEMPLATE/` и создай analysis report.

---КОНЕЦ ПРОМПТА---

---

# СЦЕНАРИЙ 2: CLI + СУЩЕСТВУЮЩИЙ ПРОЕКТ

**Когда использовать:**
- Локальная работа (терминал `claude` или Cursor)
- Raw data в `00_RAW_DATA_TEMPLATE/`
- **Есть существующий код** (в ../src, ../app, и т.д.)

---НАЧАЛО ПРОМПТА---

Ты - Claude Code, автономный AI-ассистент для bootstrap проекта.

## КОНТЕКСТ

Я развернул шаблон project-management-template в локальный репозиторий.
Добавил сырые данные (чаты, документы, заметки) в `00_RAW_DATA_TEMPLATE/`.

Это **существующий проект** - есть код в соседних директориях (например: `../src`, `../app`, `../backend`, и т.д.).

## ТВОЯ ЗАДАЧА

Запустить полный bootstrap процесс с:
- AUTO-FILL режимом метаданных
- **Автоматическим анализом существующего кода**

## ИНСТРУКЦИИ

Прочитай и следуй этим документам:

1. **@01_BOOTSTRAP_CONFIG/BOOTSTRAP_INSTRUCTIONS.md** - основной процесс
2. **@01_BOOTSTRAP_CONFIG/AUTO_FILL_INSTRUCTIONS.md** - AUTO-FILL + анализ кода (Step 4)
3. **@01_BOOTSTRAP_CONFIG/tech-stack-verification.md** - верификация технологий

## ПОСЛЕДОВАТЕЛЬНОСТЬ ВЫПОЛНЕНИЯ

### PHASE 1: ANALYSIS (1-2 часа, автономно)

**Часть A: Анализ Raw Data**

1. Прочитай ВСЁ из `@00_RAW_DATA_TEMPLATE/`:
   - Все файлы в `chats/`, `documents/`, `notes/`
   - `metadata.yaml`

2. Извлеки информацию (как в Сценарии 1)

**Часть B: Анализ Существующего Кода** ⚠️ ВАЖНО!

1. **Автоматическое обнаружение кода:**
   - Проверь наличие директорий: `../src`, `../app`, `../backend`, `../frontend`, `../server`, `../client`
   - Если нашёл → это существующий проект, код нужно изучить

2. **Сканирование кода:**
   ```
   Прочитай:
   - package.json / requirements.txt / go.mod (зависимости)
   - Структуру директорий (какие модули есть)
   - Ключевые файлы (main, index, app entry points)
   - README.md (если есть в коде)
   ```

3. **Извлеки из кода:**
   - Tech stack (реальный, из зависимостей)
   - Уже реализованные фичи (из структуры папок, файлов)
   - Архитектурные паттерны (из кода)
   - Версии зависимостей

4. **Сопоставь:**
   ```
   Raw Data Requirements     vs     Existing Code Reality
   
   Feature X (planned)       →      ✅ Implemented (found in /src/feature-x)
   Feature Y (planned)       →      ⚠️ Partial (UI found, backend missing)
   Feature Z (planned)       →      ❌ Not Found (нужно реализовать)
   ```

5. **Проверь устаревшие зависимости:**
   ```
   Из package.json:
   - react: "18.2.0" (2022) → Latest: 19.0 (2025) ⚠️ Outdated
   - typescript: "5.0" (2023) → Latest: 5.3 (2025) ⚠️ Minor update
   
   Рекомендации: UPDATE список
   ```

**Часть C: Создай Combined Analysis Report**
- Findings из raw data
- Findings из existing code
- Сопоставление требований vs реальности
- Рекомендации по модернизации

### PHASE 2: INTERVIEW (30-60 минут, интерактивно)

1. Покажи мне краткий summary findings (raw data + code analysis)

2. Задай уточняющие вопросы (5-10 штук):
   - **CRITICAL:** Разрешение противоречий
   - **IMPORTANT:** Недостающая ключевая информация
   - **CODE-RELATED:** Подтверждение обнаруженных фич:
     * "Нашёл реализацию Feature X, это правильно?"
     * "Feature Y частично реализован, это корректно?"
   - **MODERNIZATION:** Устаревшие зависимости:
     * "Рекомендую обновить React 18→19, согласен?"
   - **OPTIONAL:** Детали (можешь infer если я не отвечу)

3. Используй режим AUTO-FILL:
   - Автоматически заполни `@00_RAW_DATA_TEMPLATE/metadata.yaml`
   - На основе: raw data + code analysis + мои ответы

### PHASE 3: TECH STACK VERIFICATION (45-60 минут)

1. Проанализируй технологии:
   - Из raw data (упоминания)
   - **Из code analysis (реальные версии из package.json)**

2. Сгенерируй verification prompt:
   - Создай файл `/verification/VERIFICATION_PROMPT_FOR_CLAUDE.md`
   - Включи:
     * Текущие версии из кода
     * Упоминания из raw data
     * Вопросы об обновлениях

3. **ПАУЗА - МОЁ ДЕЙСТВИЕ:**
   - Я скопирую prompt
   - Выполню в Claude.ai (web) с web search
   - Сохраню результат в `/verification/tech-stack-analysis.md`
   - Скажу тебе "continue"

4. После моего "continue":
   - Прочитай `/verification/tech-stack-analysis.md`
   - Проанализируй рекомендации
   - Предложи финальный tech stack + план модернизации
   - Жди моего одобрения

### PHASE 4: SYNTHESIS (15 минут, автономно)

Объедини:
- Raw data информацию
- Code analysis результаты
- Разрешённые противоречия
- Мои ответы
- Верифицированный tech stack + modernization plan

Создай unified view: `/synthesized-project-data.md`

### PHASE 5: DOCUMENTATION GENERATION (2-4 часа, автономно)

Заполни документацию **В СТРОГОМ ПОРЯДКЕ**:

1. **@02_PROJECT_STRUCTURE/PROJECT_CORE/**:
   - `00_PROJECT_ESSENCE.md` - видение, цели, аудитория
   - `01_PRD.md` - требования с отметками статуса:
     * ✅ Implemented (из code analysis)
     * ⚠️ Partial (UI есть, backend нет)
     * ❌ Planned (не реализовано)
   - `02_ROADMAP.md` - фазы с учётом текущего прогресса
   - `03_TECH_STACK.md` - **ВАЖНО:** добавь секцию:
     ```markdown
     ## Existing Project Analysis
     
     **Current Stack (from code):**
     - React 18.2.0 (из package.json)
     - TypeScript 5.0
     - Express 4.18
     
     **Recommendations (November 2025):**
     - React 18.2 → 19.0 (performance improvements)
     - TypeScript 5.0 → 5.3 (minor update)
     - Express 4.18 → Keep (stable)
     ```
   - `04_ARCHITECTURE.md` - с учётом найденных паттернов
   - `99_SYSTEM_GUIDE.md` - можешь оставить как template

2. **@02_PROJECT_STRUCTURE/MODULES_REQUIREMENTS/**:
   - Для реализованных модулей: включи ссылки на код
   - Для нереализованных: стандартный requirements
   - Формат: `[module_name]_requirements.md`

3. **@02_PROJECT_STRUCTURE/CONTEXT_MEMORY/**:
   - `state.md` - **ВАЖНО:**
     * Current Phase: "In Progress (добавление документации)"
     * Last Activity: "Analyzed existing code, found X features implemented"
     * Progress: "35% complete" (реальный % из анализа)
   - `decisions.md` - залогируй решения + найденные паттерны
   - `insights.md` - инсайты из code analysis
   - `changes_log.md` - начальная запись

4. **@02_PROJECT_STRUCTURE/PROGRESS_TRACKING/**:
   - `modules_status.md` - **ВАЖНО:** отметь реальный статус:
     * ✅ Complete (100%)
     * 🔄 In Progress (частичная реализация)
     * ❌ Not Started (0%)
   - `sprint_current.md` - планирование с учётом существующего кода
   - `backlog.md` - нереализованные фичи в приоритете

5. **@02_PROJECT_STRUCTURE/AI_INSTRUCTIONS/**:
   - Проверь `.cursorrules` и `.clauderules`
   - Обнови если нужны изменения

### PHASE 6: FINAL SETUP INSTRUCTIONS (15 минут, автономно)

1. Создай `@FINAL_SETUP_INSTRUCTIONS.md` в корне проекта

2. Включи:
   - Инструкции по настройке Cursor project rules
   - Инструкции по настройке Claude Code
   - Правила обновления при изменениях
   - Ссылки на ресурсы

3. Используй шаблон из системной документации

### PHASE 7: VALIDATION & REPORT (15 минут, автономно)

1. Проверь:
   - Все файлы созданы
   - Документация отражает code reality
   - Все cross-references работают
   - TODOs помечены где нужно

2. Создай `/BOOTSTRAP_REPORT.md`:
   - **Existing Code Summary:**
     * Found X features implemented (список)
     * Y features partial (список)
     * Z features missing (список)
   - **Progress:** X% complete
   - **Tech Stack:** Current vs Recommended
   - **Next Steps:** Что делать дальше

3. Покажи мне summary и попроси проверить

## КРИТИЧЕСКИ ВАЖНО

**Автоматическое обнаружение:**
Ты ДОЛЖЕН автоматически обнаружить существующий код БЕЗ явного указания.

Проверяй директории:
- `../src/` - исходный код
- `../app/` - приложение
- `../backend/` - бэкенд
- `../frontend/` - фронтенд
- `../server/` - сервер
- `../client/` - клиент
- `../packages/` - monorepo пакеты

Если НЕ НАШЁЛ код - спроси: "Не нашёл существующий код. Это действительно новый проект?"

## ВАЖНЫЕ ПРАВИЛА

**Автономность:**
- Работай автономно где возможно
- Спрашивай только критически важное
- Информируй о прогрессе каждые 30 минут

**Качество:**
- Используй информацию из raw data + code analysis, не выдумывай
- Если чего-то нет в данных - помечай как TODO или спрашивай
- Все решения должны иметь обоснование

**Прозрачность:**
- Логируй все решения в `decisions.md`
- Отмечай assumptions явно
- Предупреждай о рисках

## НАЧИНАЙ!

Начни с **PHASE 1: ANALYSIS** (обе части: Raw Data + Existing Code).

---КОНЕЦ ПРОМПТА---

---

# СЦЕНАРИЙ 3: WEB (GITHUB) + НОВЫЙ ПРОЕКТ

**Когда использовать:**
- Работа через Claude.ai (web) с GitHub
- Raw data загружены в GitHub репозиторий
- Нет существующего кода

---НАЧАЛО ПРОМПТА---

Ты - Claude, AI-ассистент для bootstrap проекта через GitHub API.

## КОНТЕКСТ

Я загрузил project-management-template в GitHub репозиторий.
Добавил сырые данные (чаты, документы, заметки) в `00_RAW_DATA_TEMPLATE/`.

Это **новый проект** - существующего кода НЕТ.

**Важно:** Ты работаешь через GitHub API (ограниченный доступ к файлам).

## НАСТРОЙКА

В `00_RAW_DATA_TEMPLATE/metadata.yaml` установлено:
```yaml
existing_project:
  enabled: false
  github_repo: "https://github.com/[username]/[repo]"
```

## ТВОЯ ЗАДАЧА

Запустить bootstrap процесс через GitHub API с AUTO-FILL режимом.

## ИНСТРУКЦИИ

**Используй GitHub API для:**
1. Чтения файлов из репозитория
2. Создания новых файлов
3. Обновления существующих файлов

**Прочитай через GitHub API:**
- `01_BOOTSTRAP_CONFIG/BOOTSTRAP_INSTRUCTIONS.md`
- `01_BOOTSTRAP_CONFIG/AUTO_FILL_INSTRUCTIONS.md`
- `01_BOOTSTRAP_CONFIG/tech-stack-verification.md`

## ПОСЛЕДОВАТЕЛЬНОСТЬ ВЫПОЛНЕНИЯ

### PHASE 1: ANALYSIS (1-2 часа, автономно)

**⚠️ ВАЖНО:** Все операции через GitHub API.

1. Прочитай через GitHub API ВСЁ из `00_RAW_DATA_TEMPLATE/`:
   ```
   GET /repos/{owner}/{repo}/contents/00_RAW_DATA_TEMPLATE/chats
   GET /repos/{owner}/{repo}/contents/00_RAW_DATA_TEMPLATE/documents
   GET /repos/{owner}/{repo}/contents/00_RAW_DATA_TEMPLATE/notes
   GET /repos/{owner}/{repo}/contents/00_RAW_DATA_TEMPLATE/metadata.yaml
   ```

2. Извлеки информацию:
   - Название проекта
   - Целевая аудитория
   - Ключевые фичи
   - Упоминания технологий
   - Временные рамки
   - Противоречия между источниками
   - Пробелы в информации

3. Создай analysis report в репозитории

### PHASE 2: INTERVIEW (30-60 минут, интерактивно)

1. Покажи мне краткий summary findings

2. Задай уточняющие вопросы (5-10 штук):
   - **CRITICAL:** Разрешение противоречий
   - **IMPORTANT:** Недостающая ключевая информация
   - **OPTIONAL:** Детали (можешь infer если я не отвечу)

3. Используй режим AUTO-FILL:
   - Автоматически заполни `00_RAW_DATA_TEMPLATE/metadata.yaml`
   - На основе извлечённых данных + моих ответов
   - Обнови файл через GitHub API (PUT request)

### PHASE 3: TECH STACK VERIFICATION (45-60 минут)

1. Проанализируй упоминания технологий из raw data

2. Сгенерируй verification prompt:
   - Создай файл `/verification/VERIFICATION_PROMPT_FOR_CLAUDE.md` в репозитории
   - Включи все технологии для проверки актуальности (November 2025)

3. **ПАУЗА - МОЁ ДЕЙСТВИЕ:**
   - Я скопирую prompt из GitHub
   - Выполню в Claude.ai (новая вкладка) с web search
   - Создам `/verification/tech-stack-analysis.md` в репозитории с результатом
   - Скажу тебе "continue"

4. После моего "continue":
   - Прочитай `/verification/tech-stack-analysis.md` через GitHub API
   - Проанализируй рекомендации
   - Предложи финальный tech stack
   - Жди моего одобрения

### PHASE 4: SYNTHESIS (15 минут, автономно)

Объедини:
- Извлечённую информацию
- Разрешённые противоречия
- Мои ответы
- Верифицированный tech stack

Создай unified view: `/synthesized-project-data.md` в репозитории

### PHASE 5: DOCUMENTATION GENERATION (2-4 часа, автономно)

**⚠️ ЧЕРЕЗ GITHUB API:** Создавай файлы постепенно, коммить каждый.

Заполни документацию **В СТРОГОМ ПОРЯДКЕ**:

1. **02_PROJECT_STRUCTURE/PROJECT_CORE/** (по порядку):
   - `00_PROJECT_ESSENCE.md` - видение, цели, аудитория
   - `01_PRD.md` - требования, user stories
   - `02_ROADMAP.md` - фазы, timeline
   - `03_TECH_STACK.md` - технологии (с верифицированными данными)
   - `04_ARCHITECTURE.md` - архитектура системы
   - `99_SYSTEM_GUIDE.md` - можешь оставить как template

2. **02_PROJECT_STRUCTURE/MODULES_REQUIREMENTS/**:
   - Создай requirement файлы для каждого модуля
   - Используй `_MODULE_TEMPLATE.md` как шаблон
   - Формат: `[module_name]_requirements.md`

3. **02_PROJECT_STRUCTURE/CONTEXT_MEMORY/**:
   - `state.md` - текущее состояние (Phase: Planning)
   - `decisions.md` - залогируй все принятые решения
   - `insights.md` - ключевые инсайты из анализа
   - `changes_log.md` - начальная запись

4. **02_PROJECT_STRUCTURE/PROGRESS_TRACKING/**:
   - `modules_status.md` - статус всех модулей (0% для нового проекта)
   - `sprint_current.md` - планирование первого спринта
   - `backlog.md` - приоритизированный backlog

5. **02_PROJECT_STRUCTURE/AI_INSTRUCTIONS/** (при необходимости):
   - Проверь `.cursorrules` и `.clauderules`
   - Обнови если нужны изменения под проект

### PHASE 6: FINAL SETUP INSTRUCTIONS (15 минут, автономно)

1. Создай `FINAL_SETUP_INSTRUCTIONS.md` в корне репозитория

2. Включи:
   - Инструкции по настройке Cursor project rules
   - Инструкции по настройке Claude Code
   - Правила обновления при изменениях
   - Ссылки на ресурсы

### PHASE 7: VALIDATION & REPORT (15 минут, автономно)

1. Проверь:
   - Все файлы созданы в GitHub
   - Нет противоречий между документами
   - Все cross-references работают
   - TODOs помечены где нужно

2. Создай `/BOOTSTRAP_REPORT.md` в репозитории:
   - Что создано (статистика)
   - Какие решения приняты
   - Что требует проверки
   - Next steps для меня

3. Покажи мне summary и попроси проверить

## ОГРАНИЧЕНИЯ GITHUB API

- Нельзя читать файлы вне репозитория
- Медленнее чем CLI (API calls)
- Нужно коммитить каждое изменение
- Лимиты на количество API calls (делай паузы если нужно)

## ВАЖНЫЕ ПРАВИЛА

**Автономность:**
- Работай автономно где возможно
- Спрашивай только критически важное
- Информируй о прогрессе каждые 30 минут

**Качество:**
- Используй информацию из raw data, не выдумывай
- Если чего-то нет в данных - помечай как TODO или спрашивай
- Все решения должны иметь обоснование

**Прозрачность:**
- Логируй все решения в `decisions.md`
- Отмечай assumptions явно
- Предупреждай о рисках

**GitHub API:**
- Коммить файлы постепенно (не все сразу)
- Делай паузы при лимитах API
- Информируй о прогрессе коммитов

## НАЧИНАЙ!

Начни с **PHASE 1: ANALYSIS**.

Прочитай через GitHub API все файлы в `00_RAW_DATA_TEMPLATE/`.

---КОНЕЦ ПРОМПТА---

---

# СЦЕНАРИЙ 4: WEB (GITHUB) + СУЩЕСТВУЮЩИЙ ПРОЕКТ

**Когда использовать:**
- Работа через Claude.ai (web) с GitHub
- Raw data + код в GitHub репозитории
- Claude анализирует код через GitHub API

---НАЧАЛО ПРОМПТА---

Ты - Claude, AI-ассистент для bootstrap проекта через GitHub API.

## КОНТЕКСТ

Я загрузил project-management-template в GitHub репозиторий.
Добавил сырые данные в `00_RAW_DATA_TEMPLATE/`.

Это **существующий проект** - есть код в репозитории (например: `/src`, `/app`, и т.д.).

## НАСТРОЙКА

В `00_RAW_DATA_TEMPLATE/metadata.yaml` установлено:
```yaml
existing_project:
  enabled: true
  github_repo: "https://github.com/[username]/[repo]"
  code_location: "https://github.com/[username]/[repo]"
```

## ТВОЯ ЗАДАЧА

Bootstrap с:
- AUTO-FILL режимом
- **Анализом существующего кода через GitHub API**

## ИНСТРУКЦИИ

Прочитай через GitHub API:
- `01_BOOTSTRAP_CONFIG/BOOTSTRAP_INSTRUCTIONS.md`
- `01_BOOTSTRAP_CONFIG/AUTO_FILL_INSTRUCTIONS.md` (особенно Step 4: Existing Code Analysis)
- `01_BOOTSTRAP_CONFIG/tech-stack-verification.md`

## ПОСЛЕДОВАТЕЛЬНОСТЬ

### PHASE 1: ANALYSIS

**Часть A: Raw Data** (как в Сценарии 3)

**Часть B: Existing Code Analysis** ⚠️ ЧЕРЕЗ GITHUB API

1. **Обнаружение кода:**
   ```
   GET /repos/{owner}/{repo}/contents/
   
   Ищи директории:
   - src/
   - app/
   - backend/
   - frontend/
   - packages/
   ```

2. **Анализ структуры:**
   ```
   GET /repos/{owner}/{repo}/contents/src
   
   Изучи:
   - Какие модули/папки есть
   - Naming patterns
   - Архитектуру
   ```

3. **Читай ключевые файлы:**
   ```
   GET /repos/{owner}/{repo}/contents/package.json
   GET /repos/{owner}/{repo}/contents/tsconfig.json
   GET /repos/{owner}/{repo}/contents/README.md
   GET /repos/{owner}/{repo}/contents/src/index.ts (или main entry)
   ```

4. **Извлеки:**
   - Tech stack (из package.json, зависимости)
   - Реализованные фичи (из структуры)
   - Версии зависимостей

5. **Сопоставь:**
   ```
   Raw Data требования  vs  GitHub Code реальность
   ```

**Часть C: Combined Analysis Report**
- Findings из raw data
- Findings из existing code (через GitHub API)
- Сопоставление требований vs реальности
- Рекомендации по модернизации

### PHASE 2: INTERVIEW (30-60 минут, интерактивно)

1. Покажи мне краткий summary findings (raw data + code analysis)

2. Задай уточняющие вопросы (5-10 штук):
   - **CRITICAL:** Разрешение противоречий
   - **IMPORTANT:** Недостающая информация
   - **CODE-RELATED:** Подтверждение обнаруженных фич:
     * "Нашёл реализацию Feature X в src/, это правильно?"
     * "Feature Y частично реализован - UI есть, backend нет. Это корректно?"
   - **MODERNIZATION:** Устаревшие зависимости:
     * "Рекомендую обновить React 18→19, согласен?"

3. Используй режим AUTO-FILL:
   - Автоматически заполни `00_RAW_DATA_TEMPLATE/metadata.yaml`
   - На основе: raw data + code analysis + мои ответы
   - Обнови через GitHub API (PUT request)

### PHASE 3: TECH STACK VERIFICATION (45-60 минут)

1. Проанализируй технологии:
   - Из raw data (упоминания)
   - **Из code analysis (реальные версии из package.json)**

2. Сгенерируй verification prompt:
   - Создай `/verification/VERIFICATION_PROMPT_FOR_CLAUDE.md`
   - Включи:
     * Текущие версии из кода
     * Упоминания из raw data
     * Вопросы об обновлениях

3. **ПАУЗА - МОЁ ДЕЙСТВИЕ:**
   - Я скопирую prompt из GitHub
   - Выполню в Claude.ai (новая вкладка) с web search
   - Создам `/verification/tech-stack-analysis.md` с результатом
   - Скажу "continue"

4. После моего "continue":
   - Прочитай analysis через GitHub API
   - Предложи финальный tech stack + план модернизации
   - Жди одобрения

### PHASE 4: SYNTHESIS (15 минут, автономно)

Объедини:
- Raw data информацию
- Code analysis результаты
- Разрешённые противоречия
- Мои ответы
- Верифицированный tech stack + modernization plan

Создай `/synthesized-project-data.md` в репозитории

### PHASE 5: DOCUMENTATION GENERATION (2-4 часа, автономно)

**⚠️ ЧЕРЕЗ GITHUB API:** Создавай файлы постепенно, коммить каждый.

Заполни документацию **В СТРОГОМ ПОРЯДКЕ**:

1. **02_PROJECT_STRUCTURE/PROJECT_CORE/**:
   - `00_PROJECT_ESSENCE.md` - видение, цели, аудитория
   - `01_PRD.md` - требования с отметками статуса:
     * ✅ Implemented (из code analysis)
     * ⚠️ Partial (UI есть, backend нет)
     * ❌ Planned (не реализовано)
   - `02_ROADMAP.md` - фазы с учётом текущего прогресса
   - `03_TECH_STACK.md` - **ВАЖНО:** добавь секцию:
     ```markdown
     ## Existing Project Analysis
     
     **Current Stack (from code):**
     - React 18.2.0 (из package.json)
     - TypeScript 5.0
     - Express 4.18
     
     **Recommendations (November 2025):**
     - React 18.2 → 19.0 (performance improvements)
     - TypeScript 5.0 → 5.3 (minor update)
     - Express 4.18 → Keep (stable)
     ```
   - `04_ARCHITECTURE.md` - с учётом найденных паттернов
   - `99_SYSTEM_GUIDE.md` - можешь оставить template

2. **02_PROJECT_STRUCTURE/MODULES_REQUIREMENTS/**:
   - Для реализованных модулей: включи ссылки на код
   - Для нереализованных: стандартный requirements
   - Формат: `[module_name]_requirements.md`

3. **02_PROJECT_STRUCTURE/CONTEXT_MEMORY/**:
   - `state.md` - **ВАЖНО:**
     * Current Phase: "In Progress (добавление документации)"
     * Last Activity: "Analyzed existing code, found X features implemented"
     * Progress: "35% complete" (реальный % из анализа)
   - `decisions.md` - залогируй решения + найденные паттерны
   - `insights.md` - инсайты из code analysis
   - `changes_log.md` - начальная запись

4. **02_PROJECT_STRUCTURE/PROGRESS_TRACKING/**:
   - `modules_status.md` - **ВАЖНО:** отметь реальный статус:
     * ✅ Complete (100%)
     * 🔄 In Progress (частичная реализация)
     * ❌ Not Started (0%)
   - `sprint_current.md` - планирование с учётом существующего кода
   - `backlog.md` - нереализованные фичи в приоритете

5. **02_PROJECT_STRUCTURE/AI_INSTRUCTIONS/**:
   - Проверь `.cursorrules` и `.clauderules`
   - Обнови если нужны изменения

### PHASE 6: FINAL SETUP INSTRUCTIONS (15 минут, автономно)

Создай `FINAL_SETUP_INSTRUCTIONS.md` в репозитории с:
- Cursor setup
- Claude Code setup
- Правила обновления
- Ссылки на ресурсы

### PHASE 7: VALIDATION & REPORT (15 минут, автономно)

1. Проверь:
   - Все файлы созданы
   - Документация отражает code reality
   - Cross-references работают

2. Создай `/BOOTSTRAP_REPORT.md`:
   - **Existing Code Summary:**
     * Found X features implemented (список)
     * Y features partial (список)
     * Z features missing (список)
   - **Progress:** X% complete
   - **Tech Stack:** Current vs Recommended
   - **Next Steps:** Что делать дальше

3. Покажи summary и попроси проверить

## ОГРАНИЧЕНИЯ GITHUB API

- Нельзя выполнять команды (npm, git)
- Нельзя анализировать код вне репозитория
- Лимиты на количество API calls
- Нужно коммитить каждое изменение

## ВАЖНЫЕ ПРАВИЛА

**Автономность:**
- Работай автономно где возможно
- Спрашивай только критически важное
- Информируй о прогрессе каждые 30 минут

**Качество:**
- Используй информацию из raw data + code analysis, не выдумывай
- Если чего-то нет в данных - помечай как TODO или спрашивай
- Все решения должны иметь обоснование
- Документация ДОЛЖНА отражать реальный код

**Прозрачность:**
- Логируй все решения в `decisions.md`
- Отмечай assumptions явно
- Предупреждай о рисках
- Различай: что реализовано vs что планируется

**GitHub API:**
- Коммить файлы постепенно (не все сразу)
- Делай паузы при лимитах API
- Информируй о прогрессе коммитов

## НАЧИНАЙ!

Начни с **PHASE 1: ANALYSIS** (Raw Data + Code через GitHub API).

---КОНЕЦ ПРОМПТА---

---

## 📝 ПРИМЕЧАНИЯ

### После Bootstrap

Независимо от сценария, после завершения bootstrap:

1. **Прочитай:** `@FINAL_SETUP_INSTRUCTIONS.md`
2. **Настрой:** Cursor project rules / Claude Code
3. **Проверь:** Работу AI ассистентов
4. **Начинай:** Разработку!

### Отличия сценариев

| Аспект | CLI | Web (GitHub) |
|--------|-----|--------------|
| Доступ к файлам | Прямой (filesystem) | Через GitHub API |
| Скорость | Быстрее | Медленнее (API calls) |
| Анализ кода | Полный (локальный) | Ограниченный (только в repo) |
| Коммиты | Вручную | Автоматически (каждое изменение) |
| Web search | Через паузу (Claude.ai) | Через паузу (новая вкладка) |

### Поддержка

Если промпт не работает:
- Проверь что все файлы на месте (BOOTSTRAP_INSTRUCTIONS.md и др.)
- Убедись что raw data добавлены
- Для существующих проектов - проверь metadata.yaml (existing_project.enabled)
- Открой Issue на GitHub

---

**Готово! Выбери промпт выше и начинай bootstrap.** 🚀

