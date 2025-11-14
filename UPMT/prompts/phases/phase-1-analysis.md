# PHASE 1: ANALYSIS

**Время выполнения:** 1-2 часа (автономно)

**Назначение:** Чтение raw data, извлечение функций, (опционально) анализ кода, согласование с пользователем

---

## 📖 КОНТЕКСТ ПЕРЕД PHASE 1

**Прочитано из оркестратора:**
- `scenario.existing_project` - нужен ли code analysis
- Адаптер (CLI или Web) - как работать с файлами

---

## 📋 ИНСТРУКЦИИ

### ШАГ 1: Чтение Raw Data

**⚠️ КРИТИЧНО: Обработка больших файлов**

**Прочитай ВСЁ из `UPMT/bootstrap/00_RAW_DATA_TEMPLATE/`:**

```
- chats/ (все файлы)
- documents/ (все файлы)
- notes/ (все файлы)
- metadata.yaml (если частично заполнен)
```

**Алгоритм чтения:**

**1.1: Получи список всех файлов**
```python
# CLI
chats = list_dir("UPMT/bootstrap/00_RAW_DATA_TEMPLATE/chats/")
documents = list_dir("UPMT/bootstrap/00_RAW_DATA_TEMPLATE/documents/")
notes = list_dir("UPMT/bootstrap/00_RAW_DATA_TEMPLATE/notes/")

# Web
chats = gh api /repos/{owner}/{repo}/contents/UPMT/bootstrap/00_RAW_DATA_TEMPLATE/chats
```

**1.2: Для каждого файла - используй safe_read_file()**

**⚠️ ВАЖНО:** Используй функцию `safe_read_file()` из адаптера для автоматической обработки больших файлов!

```python
# CLI режим
for file in all_files:
    content = safe_read_file(file_path)
    # ✅ Файл прочитан полностью (автоматически по частям, если большой)
    process_content(content)

# Web режим
for file in all_files:
    content = safe_read_file_github(owner, repo, file_path)
    # ✅ Файл прочитан полностью (автоматически через Git Data API, если большой)
    process_content(content)
```

**1.3: Если получил ошибку размера - автоматически читай по частям**

**⚠️ КРИТИЧНО:** Если при чтении файла получил ошибку:
- `File content (XXX KB) exceeds maximum allowed size (256KB)`
- `File content (XXXXX tokens) exceeds maximum allowed tokens (25000)`

**ТОГДА:**

1. **НЕ ПРОПУСКАЙ файл**
2. **НЕ ПРОСИ пользователя указать на файл**
3. **АВТОМАТИЧЕСКИ переключись на чтение по частям**
4. **Прочитай ВСЕ части файла**
5. **Объедини содержимое**
6. **Используй полное содержимое для извлечения функций**

**Пример обработки:**

```python
for file_path in all_chat_files:
    try:
        # Попытка прочитать целиком
        content = safe_read_file(file_path)  # Автоматически обработает большие файлы
        # ✅ Успешно
    except Exception as e:
        # Если safe_read_file() не сработал, читай вручную по частям
        print(f"⚠️ Файл {file_path} требует ручного чтения по частям...")
        
        # Определи размер
        line_count = get_line_count(file_path)  # через wc -l
        
        # Читай порциями
        all_chunks = []
        for start_line in range(1, line_count + 1, 2000):
            end_line = min(start_line + 1999, line_count)
            chunk = read_file(file_path, offset=start_line, limit=end_line - start_line + 1)
            all_chunks.append(chunk)
        
        # Объедини
        content = "\n".join(all_chunks)
        print(f"✅ Файл {file_path} прочитан полностью ({line_count} строк)")
    
    # Используй content для извлечения функций
    extract_features_from_content(content, file_path)
```

**1.4: Проверка полноты чтения**

**После чтения всех файлов:**

```markdown
✅ ПРОЧИТАНЫ ВСЕ ФАЙЛЫ:

**Chats:**
- ✅ chat1.txt (1292 строки) - прочитан полностью
- ✅ ###2_Claude-Conversation-2025-11-09T16-06-06.txt (6222 строки) - прочитан по частям (3 порции)
- ✅ Chat3.txt (892 строки) - прочитан полностью

**Documents:**
- ✅ doc1.md (500 строк) - прочитан полностью

**Notes:**
- ✅ Важная заметка.txt (5 строк) - прочитан полностью

**Всего прочитано:** [N] файлов, [X] строк
**Больших файлов (>2000 строк):** [M] файлов, прочитаны по частям
```

**⚠️ Используй адаптер:**
- **CLI:** Используй `safe_read_file()` из `cli-adapter.md`
- **Web:** Используй `safe_read_file_github()` из `web-adapter.md`

---

### ШАГ 2: Извлечение ВСЕХ Функций

**⚠️ КРИТИЧНО: ПОЛНОЕ извлечение ВСЕХ функций**

**ОБЯЗАТЕЛЬНЫЕ действия:**
1. Прочитай КАЖДЫЙ чат, документ, заметку **ПОЛНОСТЬЮ**
2. Извлеки КАЖДУЮ упомянутую функцию/фичу
3. Создай ПОЛНЫЙ список функций, сгруппированный по модулям
4. **НИЧЕГО НЕ ПРОПУСКАЙ** - каждое упоминание функционала важно

**Формат extracted_features:**

```markdown
## EXTRACTED FEATURES (ПОЛНЫЙ СПИСОК)

**Total Functions:** [N]

### Модуль 1: [Name]
- Function 1.1: [description]
- Function 1.2: [description]
- Function 1.3: [description]

### Модуль 2: [Name]
- Function 2.1: [description]
- Function 2.2: [description]

[... для ВСЕХ модулей]
```

**Проверка полноты:**
- Пройдись по каждому чату ПОВТОРНО
- Убедись что ВСЕ функции извлечены
- Если в чате упомянуто 150+ функций → в списке должно быть 150+
- **ЕСЛИ НЕПОЛНЫЙ СПИСОК → ПЕРЕДЕЛАЙ!**

---

### ШАГ 3: Code Analysis (ТОЛЬКО для existing_project: true)

**ЕСЛИ `scenario.existing_project == false`:**
- **SKIP этот шаг** → Переход к ШАГ 4

**ЕСЛИ `scenario.existing_project == true`:**

**Что анализировать:**

**CLI режим:**
```
- ../src/
- ../app/
- ../components/
- ../backend/
- ../frontend/
- ../package.json (зависимости)
- ../tsconfig.json
- ../README.md
```

**Web режим (GitHub API):**
```
gh api /repos/{owner}/{repo}/contents/src
gh api /repos/{owner}/{repo}/contents/app
gh api /repos/{owner}/{repo}/contents/package.json
```

**Что извлекать:**
- ✅ Tech stack (из `package.json`, imports)
- ✅ Реализованные модули (из структуры)
- ✅ Реализованные функции (из кода)
- ✅ Архитектурные паттерны
- ✅ Версии зависимостей
- ✅ Статус функций (Implemented/Partial/Not Started)

**Обнови `extracted_features` с учётом code analysis:**
- Добавь статусы: `✅ Implemented`, `⚠️ Partial`, `❌ Not Started`
- Добавь "Current Progress: X%" (из code analysis)

---

### ШАГ 4: Сохранение extracted_features

**Создай файл:** `UPMT/bootstrap/00_RAW_DATA_TEMPLATE/extracted_features.md`

**⚠️ Используй адаптер:**
- **CLI:** `write("UPMT/bootstrap/00_RAW_DATA_TEMPLATE/extracted_features.md", content)`
- **Web:** `gh api PUT /repos/{owner}/{repo}/contents/UPMT/bootstrap/00_RAW_DATA_TEMPLATE/extracted_features.md`

**Содержимое:** ПОЛНЫЙ список в формате выше (ШАГ 2)

---

### ШАГ 5: Согласование с пользователем

**⚠️ КРИТИЧНО: Покажи ВСЕ функции для КАЖДОГО модуля прямо в диалоге!**

**ТРЕБОВАНИЯ:**
1. ✅ НЕ используй сокращения типа "и еще 5 функций"
2. ✅ НЕ используй "см. extracted_features.md" 
3. ✅ Покажи КАЖДУЮ функцию для КАЖДОГО модуля
4. ✅ Формат: "Function X.Y: [название] - [описание]"
5. ✅ Все сообщения на РУССКОМ ЯЗЫКЕ (см. orchestrator.md ШАГ 0.0)

**СТРУКТУРА вывода (ОБЯЗАТЕЛЬНО):**

```markdown
📋 EXTRACTED FEATURES - СОГЛАСОВАНИЕ

Я извлек [N] функций из ваших данных [источник: raw data / raw data + code analysis], сгруппированных в [M] модулей:

**Модули с детальным списком функций:**

### Модуль 1: [Module Name] - [X] функций [статус: New/Implemented/Partial/Not Started]

**Функции:**
- Function 1.1: [название функции] - [краткое описание] [статус, если есть код]
- Function 1.2: [название функции] - [краткое описание] [статус]
- Function 1.3: [название функции] - [краткое описание] [статус]
[... ВСЕ функции модуля 1, БЕЗ пропусков - если модуль имеет 10 функций, покажи все 10]

### Модуль 2: [Module Name] - [Y] функций [статус]

**Функции:**
- Function 2.1: [название функции] - [краткое описание] [статус]
- Function 2.2: [название функции] - [краткое описание] [статус]
[... ВСЕ функции модуля 2, БЕЗ пропусков]

[... повтори для КАЖДОГО модуля с ПОЛНЫМ списком ВСЕХ функций]

**Ключевые находки:**
- Total Functions: [N]
- Total Modules: [M]
- [Если existing project] Current Progress: [X]% overall (из code analysis)
- [Если existing project] Implemented: ~[X] функций
- [Если existing project] In Progress: ~[Y] функций
- [Если existing project] Not Started: ~[Z] функций

**Приоритеты (если есть в данных):**
- 🔴 CRITICAL: [модуль/функция] - [описание]
- 🟠 HIGH: [модуль/функция] - [описание]
- 🟡 MEDIUM: [модуль/функция] - [описание]

**Вопросы для согласования:**
1. Все модули корректны? Есть ли модули, которые нужно объединить или разделить?
2. Все функции извлечены? Не пропущено ли что-то важное?
3. Названия модулей правильные? (можно предложить альтернативы)
4. Есть ли функции, которые нужно переместить в другой модуль?
5. [Если existing project] Статусы функций (implemented/partial/not started) соответствуют реальности?

**Инструкции:**
- Если всё корректно → напиши "APPROVED" или "✅"
- Если нужны изменения → опиши что изменить, я обновлю список
- Если пропущены функции → укажи их, я добавлю
- Если модули нужно перегруппировать → укажи как

⏸️ ЖДУ ВАШЕГО ПОДТВЕРЖДЕНИЯ ПЕРЕД ПРОДОЛЖЕНИЕМ
```

**ПРОВЕРКА перед выводом:**
- [ ] Все модули из `extracted_features.md` включены?
- [ ] Все функции каждого модуля перечислены полностью?
- [ ] Нет сокращений типа "и еще X функций"?
- [ ] Формат Function X.Y используется для каждой функции?
- [ ] Все сообщения на русском языке?
- [ ] Нет ссылок типа "см. extracted_features.md" вместо показа функций?

**⚠️ КРИТИЧНО:** Если модуль имеет 20 функций, покажи ВСЕ 20 функций. Не используй сокращения!

---

### ШАГ 6: Обработка ответа пользователя

**ЕСЛИ пользователь написал "APPROVED" или "✅":**
- Продолжай к ШАГ 7

**ЕСЛИ пользователь запросил изменения:**
- Обнови `extracted_features` согласно замечаниям
- Обнови файл `extracted_features.md`
- Покажи обновлённый список снова (ШАГ 5)
- Повторяй до получения APPROVED

**ЕСЛИ пользователь добавил новые функции:**
- Добавь их в соответствующие модули
- Обнови счётчик Total Functions
- Обнови файл `extracted_features.md`
- Покажи обновлённый список (ШАГ 5)

---

### ШАГ 7: Создание modules_list.md (PHASE 1.5)

**После APPROVED:**

**7.1: Определи финальный список модулей**

Из согласованного `extracted_features` извлеки уникальные модули.

**Если existing_project:**
- Объедини модули из raw data + модули из code analysis
- Сравни списки, отметь расхождения

**7.2: Сохрани список модулей**

**Создай:** `UPMT/bootstrap/00_RAW_DATA_TEMPLATE/modules_list.md`

**Формат (new project):**

```markdown
# СПИСОК МОДУЛЕЙ ПРОЕКТА

## Всего модулей: [N]

### 1. [Module Name]
**Описание:** [краткое описание модуля]
**Функций:** [X]
**Источник:** Raw Data
**Статус:** New

[... для всех модулей]
```

**Формат (existing project):**

```markdown
# СПИСОК МОДУЛЕЙ ПРОЕКТА

## Всего модулей: [N]

### 1. [Module Name]
**Описание:** [краткое описание модуля]
**Функций:** [X]
**Источник:** Raw Data / Existing Code / Both
**Статус:** New / Existing / Partial
**Расположение в коде:** [путь, если есть]
**Progress:** [X%] (если existing)

[... для всех модулей]
```

**⚠️ Если existing project и есть расхождения:**

Задай вопросы пользователю:
```
"В коде найден модуль X, но его нет в requirements. Это корректно?"
"В requirements есть модуль Y, но в коде его нет. Это новый модуль?"
"Модуль Z найден и в коде, и в requirements. Статус: Implemented или Partial?"
```

Дождись ответа и обнови `modules_list.md`.

---

### ШАГ 8: Создание Analysis Report

**Создай файл:** `/analysis-report.md` (в корне проекта)

**Содержимое:**

```markdown
# ANALYSIS REPORT

**Дата:** [timestamp]
**Источники:** [raw data / raw data + code analysis]

## FINDINGS

**Название проекта:** [название]
**Целевая аудитория:** [аудитория]
**Ключевые фичи:** (из СОГЛАСОВАННОГО extracted_features)

[Если existing project:]
**Current Progress:** [X]% overall
**Tech Stack (from code):** [список]

## EXTRACTED FEATURES

См. детальный список: UPMT/bootstrap/00_RAW_DATA_TEMPLATE/extracted_features.md

**Всего функций:** [N]
**Всего модулей:** [M]

## MODULES

См. детальный список: UPMT/bootstrap/00_RAW_DATA_TEMPLATE/modules_list.md

[Если existing project:]
## CODE ANALYSIS

**Реализованные модули:** [список]
**Статусы:** [breakdown]
**Архитектурные паттерны:** [найденные]

## ПРОТИВОРЕЧИЯ

[Список противоречий между источниками]

## ПРОБЕЛЫ

[Недостающая информация]
```

---

## 💾 CHECKPOINT

**После завершения PHASE 1:**

```bash
git add UPMT/bootstrap/00_RAW_DATA_TEMPLATE/extracted_features.md
git add UPMT/bootstrap/00_RAW_DATA_TEMPLATE/modules_list.md
git add analysis-report.md
git commit -m "docs(bootstrap): PHASE 1 complete - extracted [N] features, [M] modules"
git push
```

**Показать прогресс:**

```markdown
✅ PHASE 1 COMPLETE

**Extracted:**
- [N] functions
- [M] modules
- [Если existing project] [X]% progress analyzed

**Files created:**
- extracted_features.md (APPROVED by user)
- modules_list.md
- analysis-report.md

**Next:** PHASE 2 - Interview

⏱️ PHASE 1 завершена за [время]
```

---

## 🔄 СЛЕДУЮЩИЙ ШАГ

```
→ ПЕРЕХОД К PHASE 2: INTERVIEW
→ Прочитай: UPMT/prompts/phases/phase-2-interview.md
```

