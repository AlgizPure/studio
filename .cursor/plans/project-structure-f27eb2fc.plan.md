<!-- f27eb2fc-a042-47f4-946d-3bf2777ffc74 8b24e4ec-06d4-4acb-a043-aef6faa89568 -->
# План: Устранение дублирования промптов

## Проблема

Во всех Quick Start Guides есть упрощенные промпты без @ссылок на инструкции, что противоречит единому источнику правды в `BOOTSTRAP_START_PROMPT.md`. Это создает риск расхождения инструкций и неполноты процесса bootstrap.

## Принцип исправления

**Единый источник правды:** `01_BOOTSTRAP_CONFIG/BOOTSTRAP_START_PROMPT.md`

Все Quick Start Guides должны ССЫЛАТЬСЯ на соответствующий сценарий, а не дублировать промпты.

---

## Изменения в файлах

### 1. QUICK_START_GUIDES/WEB_NEW_PROJECT.md

**Заменить строки 124-152 (Шаг 5):**

Было: Упрощенный промпт без @ссылок

```
Прочитай все файлы в 00_RAW_DATA_TEMPLATE/:
...
```

Должно быть:

```markdown
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
```

---

### 2. QUICK_START_GUIDES/CLI_NEW_PROJECT.md

**Проверить и удалить дублирование после строки 240:**

Секция "Особенности AUTO-FILL Режима" (строки 265-492) содержит избыточные детали, которые уже есть в BOOTSTRAP_START_PROMPT.md.

**Заменить строки 265-492 на:**

```markdown
## ✅ Готово - Что Дальше?

После ответа на вопросы и tech stack verification, Claude Code автоматически:
- Сгенерирует всю документацию (2-4 часа)
- Создаст все необходимые файлы в правильном порядке
- Заполнит PROJECT_CORE, MODULES_REQUIREMENTS, CONTEXT_MEMORY
- Создаст BOOTSTRAP_REPORT.md

**Пока Claude работает (2-4 часа):**
- Можешь заниматься другими делами
- Claude информирует о прогрессе каждые 30 минут
- Весь процесс автономный

**После завершения:** См. шаг 10 (Финальная настройка - ОБЯЗАТЕЛЬНО!)
```

---

### 3. QUICK_START_GUIDES/CLI_EXISTING_PROJECT.md

**Заменить строки 101-128 (Шаг 5):**

Было: Упрощенный промпт

```
Это СУЩЕСТВУЮЩИЙ проект с кодом в родительской директории (../).
...
```

Должно быть:

```markdown
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
```

---

### 4. QUICK_START_GUIDES/WEB_EXISTING_PROJECT.md

**А) Вариант A - Заменить строки 186-214 (Шаг 7):**

Было: Упрощенный промпт для одного репозитория

Должно быть:

```markdown
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
```

**Б) Вариант B - Заменить строки 350-381 (Шаг 7):**

Было: Упрощенный промпт для раздельных репозиториев

Должно быть:

````markdown
#### 7. Использовать готовый промпт

**Используй тот же промпт:**
→ **`01_BOOTSTRAP_CONFIG/BOOTSTRAP_START_PROMPT.md`** → **Сценарий 4** (Web + Существующий проект)

**Адаптация для Варианта B (раздельные репозитории):**

В `metadata.yaml` уже указан `code_location` на другой репозиторий:
```yaml
existing_project:
  enabled: true
  code_location: "https://github.com/your-username/my-existing-project"
````

Claude Code автоматически поймет что нужно анализировать код через GitHub API из другого репозитория.

**Используй тот же полный промпт - он работает для обоих вариантов!**

````

---

### 5. VERSION_HISTORY.md

**Обновить раздел v1.0.2:**

В секцию "Issues Fixed" добавить пункт 8:

```markdown
### 🐛 Issues Fixed

1. **Missing unified entry point** - Added START_HERE.md
2. **No post-bootstrap instructions** - Added FINAL_SETUP_INSTRUCTIONS.md
3. **Bootstrap prompts unclear** - Created BOOTSTRAP_START_PROMPT.md with 4 scenarios
4. **CONTEXT_MEMORY files too large** - Split into working + TEMPLATE files
5. **.cursorrules too verbose** - Reduced from 483 to ~250 lines
6. **Duplication in bootstrap docs** - Consolidated with cross-references
7. **No validation in setup.sh** - Added critical files check
8. **Prompt duplication in Quick Start Guides** - All guides now reference BOOTSTRAP_START_PROMPT.md (single source of truth)
````

В секцию "Обновленные Файлы" добавить:

```markdown
**Quick Start Guides (все 4):**
- `QUICK_START_GUIDES/CLI_NEW_PROJECT.md` - Ссылка на START_HERE + убрано дублирование промптов
- `QUICK_START_GUIDES/CLI_EXISTING_PROJECT.md` - Ссылка на START_HERE + промпт заменен на Сценарий 2
- `QUICK_START_GUIDES/WEB_NEW_PROJECT.md` - Ссылка на START_HERE + промпт заменен на Сценарий 3
- `QUICK_START_GUIDES/WEB_EXISTING_PROJECT.md` - Ссылка на START_HERE + промпты заменены на Сценарий 4
```

---

## Результат

После исправлений:

**Линейная последовательность:**

```
START_HERE.md
    ↓
Выбор сценария
    ↓
Quick Start Guide
    ↓
"Используй промпт из BOOTSTRAP_START_PROMPT.md - Сценарий X"
    ↓
BOOTSTRAP_START_PROMPT.md (ЕДИНСТВЕННЫЙ источник промптов)
    ↓
Копируешь полный промпт со всеми @ссылками
    ↓
Claude Code выполняет bootstrap правильно
```

**Преимущества:**

- ✅ Единый источник правды (BOOTSTRAP_START_PROMPT.md)
- ✅ Все промпты включают @ссылки на инструкции
- ✅ Нет риска расхождения между файлами
- ✅ Легко обновлять (один файл вместо четырех)
- ✅ Гарантия полноты процесса bootstrap

**Файлы для изменения:**

1. QUICK_START_GUIDES/WEB_NEW_PROJECT.md
2. QUICK_START_GUIDES/CLI_NEW_PROJECT.md
3. QUICK_START_GUIDES/CLI_EXISTING_PROJECT.md
4. QUICK_START_GUIDES/WEB_EXISTING_PROJECT.md
5. VERSION_HISTORY.md

### To-dos

- [ ] Создать 3 критически важных файла: START_HERE.md, BOOTSTRAP_START_PROMPT.md, FINAL_SETUP_INSTRUCTIONS.md
- [ ] Реорганизовать CONTEXT_MEMORY: создать _TEMPLATE файлы с примерами, минимизировать рабочие файлы
- [ ] Реорганизовать AI_INSTRUCTIONS: создать EXAMPLES/, извлечь примеры из .cursorrules, сократить .cursorrules до ~200 строк
- [ ] Устранить дублирование в BOOTSTRAP_INSTRUCTIONS.md и CLI_NEW_PROJECT.md
- [ ] Обновить ссылки и связи в README.md, SETUP_GUIDE.md и всех Quick Start Guides
- [ ] Добавить валидацию структуры в setup.sh
- [ ] Создать BOOTSTRAP_CHECKLIST.md и BOOTSTRAP_FLOW_DIAGRAM.md
- [ ] Обновить SYSTEM_GUIDE.md и создать VERSION_HISTORY.md