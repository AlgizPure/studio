# 🖥️ CLI ADAPTER - Локальная работа

**Назначение:** Специфичные инструкции для работы в локальном окружении (CLI/Cursor)

---

## 📁 ФАЙЛОВЫЕ ОПЕРАЦИИ

### Чтение файлов

**Используй стандартные инструменты:**

```python
# Прочитай файл
read_file("path/to/file.md")

# Прочитай папку
list_dir("path/to/directory")

# Поиск файлов
glob_file_search("**/*.md", target_directory="path")
```

**Примеры:**

```python
# Читай raw data
read_file("UPMT/bootstrap/00_RAW_DATA_TEMPLATE/metadata.yaml")
read_file("UPMT/bootstrap/00_RAW_DATA_TEMPLATE/chats/chat1.txt")

# Читай существующий код (если existing project)
list_dir("../src")
read_file("../src/index.ts")
read_file("../package.json")
```

**⚠️ ОБРАБОТКА БОЛЬШИХ ФАЙЛОВ:**

**Алгоритм автоматического чтения (ИСПОЛЬЗУЙ ВСЕГДА):**

```python
def safe_read_file(file_path):
    """
    Читает файл целиком или по частям, если большой.
    АВТОМАТИЧЕСКИ обрабатывает ошибки размера.
    """
    try:
        # Попытка прочитать целиком
        return read_file(file_path)
    except (FileTooLargeError, TokenLimitExceededError) as e:
        # Файл большой - читай по частям
        print(f"⚠️ Файл {file_path} слишком большой, читаю по частям...")
        
        # 1. Определи размер файла (строки)
        # CLI: wc -l "file_path" или используй grep для подсчета строк
        line_count = get_line_count(file_path)  # Используй wc -l или grep -c
        
        # 2. Читай порциями по 2000 строк (безопасный размер)
        chunks = []
        chunk_size = 2000
        
        for start_line in range(1, line_count + 1, chunk_size):
            end_line = min(start_line + chunk_size - 1, line_count)
            limit = end_line - start_line + 1
            
            chunk = read_file(
                file_path=file_path,
                offset=start_line,
                limit=limit
            )
            chunks.append(chunk)
            
            # Логируй прогресс
            print(f"📖 Прочитано {end_line}/{line_count} строк из {file_path}")
        
        # 3. Объедини все порции
        full_content = "\n".join(chunks)
        print(f"✅ Файл {file_path} прочитан полностью ({line_count} строк)")
        return full_content

# Использование:
content = safe_read_file("UPMT/bootstrap/00_RAW_DATA_TEMPLATE/chats/large_chat.txt")
```

**Если получил ошибку:**
- `File content (XXX KB) exceeds maximum allowed size (256KB)`
- `File content (XXXXX tokens) exceeds maximum allowed tokens (25000)`

**ТОГДА:**

1. **Определи размер файла:**
```bash
wc -l "path/to/file.txt"
# Результат: 6222 строки
```

2. **Читай по частям (по 2000 строк):**
```python
# Порция 1: строки 1-2000
chunk1 = read_file("path/to/file.txt", offset=1, limit=2000)

# Порция 2: строки 2001-4000
chunk2 = read_file("path/to/file.txt", offset=2001, limit=2000)

# Порция 3: строки 4001-6222
chunk3 = read_file("path/to/file.txt", offset=4001, limit=2222)

# Объедини
full_content = "\n".join([chunk1, chunk2, chunk3])
```

3. **Используй полное содержимое для анализа**

**Примеры с автоматической обработкой:**

```python
# Читай raw data (с автоматической обработкой больших файлов)
for chat_file in list_dir("UPMT/bootstrap/00_RAW_DATA_TEMPLATE/chats/"):
    content = safe_read_file(f"UPMT/bootstrap/00_RAW_DATA_TEMPLATE/chats/{chat_file}")
    # Анализируй content
```

**⚠️ КРИТИЧНО:**
- ВСЕГДА используй `safe_read_file()` вместо `read_file()` для файлов из raw data
- НЕ ПРОПУСКАЙ файлы из-за размера
- Автоматически читай большие файлы по частям
- Объединяй все части перед анализом

---

### Создание файлов

**Используй write tool:**

```python
write(
    file_path="docs/core/00_PROJECT_ESSENCE.md",
    contents="[полное содержимое файла]"
)
```

**⚠️ ВАЖНО:**
- Всегда пиши ПОЛНОЕ содержимое файла
- Не используй placeholders типа `[...]` или `// ... more content`
- Если файл большой - пиши полностью, это важно

---

### Обновление файлов

**Используй search_replace:**

```python
search_replace(
    file_path="docs/core/01_PRD.md",
    old_string="[старый текст]",
    new_string="[новый текст]",
    replace_all=False  # или True для замены всех вхождений
)
```

---

## 📂 СТРУКТУРА ПРОЕКТА

**Локальная структура:**

```
project-root/
├── UPMT/                          # Шаблонная система (этот проект)
│   ├── bootstrap/
│   │   └── 00_RAW_DATA_TEMPLATE/  # Raw data здесь
│   ├── prompts/                   # Модульные промпты
│   └── START.md                   # Главное меню
│
├── docs/                          # Создаваемая документация
│   ├── core/
│   ├── requirements/
│   ├── progress/
│   ├── design/
│   └── backend/
│
├── .context/                      # Контекст проекта
├── .upmt/                         # Метаданные
└── .cursorrules                   # AI правила
```

**Если existing project:**

```
project-root/
├── UPMT/                          # Шаблон
├── docs/                          # Документация (создаётся)
├── src/                           # Существующий код (читать)
├── app/                           # Существующий код (читать)
├── components/                    # Существующий код (читать)
└── package.json                   # Зависимости (читать)
```

---

## 🔍 CODE ANALYSIS (для existing projects)

**Алгоритм анализа:**

```python
# 1. Найди код
code_dirs = ["../src", "../app", "../components", "../backend", "../frontend"]
for dir in code_dirs:
    if exists(dir):
        list_dir(dir)

# 2. Читай ключевые файлы
read_file("../package.json")        # Зависимости
read_file("../tsconfig.json")       # TypeScript config
read_file("../README.md")           # Project overview

# 3. Анализируй структуру
list_dir("../src")
for module in modules:
    list_dir(f"../src/{module}")
    # Читай ключевые файлы модуля

# 4. Извлеки features из кода
grep(pattern="function|class|export", path="../src")
```

**Что извлекать:**
- ✅ Tech stack (из `package.json`, imports)
- ✅ Реализованные модули (из структуры папок)
- ✅ Реализованные функции (из кода)
- ✅ Архитектурные паттерны (из структуры)
- ✅ Версии зависимостей

---

## 💾 GIT ОПЕРАЦИИ

**Checkpoint коммиты:**

```bash
# После каждой фазы
git add .
git commit -m "docs(bootstrap): PHASE X complete - [описание]"
git push
```

**Batch commits (PHASE 5):**

```bash
# После каждого батча модулей
git add docs/requirements/
git commit -m "docs(bootstrap): PHASE 5 batch {X}/{Y} - modules {start}-{end}"
git push
```

**⚠️ RETRY LOGIC если push failed:**

```python
def safe_push(max_retries=3):
    for attempt in range(max_retries):
        try:
            git push
            return True
        except NetworkError:
            if attempt < max_retries - 1:
                wait(30)  # 30 секунд
                retry
            else:
                alert_user("Push failed after 3 attempts")
                save_state(".bootstrap-state.json")
                return False
```

---

## 📊 ПРОГРЕСС TRACKING

**Показывай прогресс каждые 30 минут:**

```markdown
⏱️ BOOTSTRAP PROGRESS UPDATE

**Текущая фаза:** PHASE X - [название]
**Прогресс:** [X%]
**Время работы:** [HH:MM]

**Последние действия:**
- ✅ Создано docs/core/00_PROJECT_ESSENCE.md
- ✅ Создано docs/core/01_PRD.md
- 🔄 Создаю docs/requirements/module_1_requirements.md

**Следующие шаги:**
- [ ] Создать requirements для модуля 2
- [ ] ...

**Checkpoint commits:** 5
```

---

## 🚨 КРИТИЧЕСКИЕ ПРАВИЛА CLI

1. **НЕ ИСПОЛЬЗУЙ TERMINAL ДЛЯ ЧТЕНИЯ ФАЙЛОВ**
   - ❌ `cat file.md`
   - ✅ `read_file("file.md")`

2. **НЕ ИСПОЛЬЗУЙ TERMINAL ДЛЯ СОЗДАНИЯ ФАЙЛОВ**
   - ❌ `echo "content" > file.md`
   - ✅ `write("file.md", "content")`

3. **ИСПОЛЬЗУЙ СПЕЦИАЛИЗИРОВАННЫЕ ИНСТРУМЕНТЫ**
   - ✅ `read_file` - для чтения
   - ✅ `write` - для создания
   - ✅ `search_replace` - для обновления
   - ✅ `list_dir` - для просмотра структуры
   - ✅ `glob_file_search` - для поиска

4. **GIT OPERATIONS - ТОЛЬКО ЧЕРЕЗ TERMINAL**
   - ✅ `git add`, `git commit`, `git push`
   - ❌ Никакие другие операции

5. **ПИШИ ПОЛНЫЕ ФАЙЛЫ**
   - Не используй `[...]` или placeholders
   - Не используй `// ... rest of content`
   - Пиши всё полностью

---

## 💡 ПРИМЕРЫ

### Пример: Создание module requirements

```python
# 1. Прочитай context
modules = read_file("UPMT/bootstrap/00_RAW_DATA_TEMPLATE/modules_list.md")
features = read_file("UPMT/bootstrap/00_RAW_DATA_TEMPLATE/extracted_features.md")

# 2. Посчитай модули
total_modules = count_modules(modules)

# 3. Создай requirements для каждого модуля
for i, module in enumerate(modules, start=1):
    module_name = module["name"]
    module_features = filter_features(features, module_name)
    
    requirements_content = generate_requirements(module, module_features)
    
    write(
        file_path=f"docs/requirements/{module_name}_requirements.md",
        contents=requirements_content
    )
    
    # Checkpoint после каждых 6 модулей
    if i % 6 == 0:
        git_commit(f"docs(bootstrap): PHASE 5 batch {i//6} - modules {i-5}-{i}")

# 4. Финальный commit
git_commit("docs(bootstrap): PHASE 5 complete - all module requirements")
```

### Пример: Code analysis (existing project)

```python
# 1. Найди код
if os.path.exists("../src"):
    # 2. Читай package.json
    package = read_file("../package.json")
    tech_stack = extract_dependencies(package)
    
    # 3. Анализируй структуру
    structure = list_dir("../src")
    modules_in_code = extract_modules(structure)
    
    # 4. Сравни с requirements
    modules_in_raw_data = read_file("UPMT/bootstrap/00_RAW_DATA_TEMPLATE/modules_list.md")
    
    comparison = compare(modules_in_raw_data, modules_in_code)
    
    # 5. Задай вопросы пользователю о расхождениях
    if comparison.has_discrepancies:
        ask_user(comparison.questions)
```

---

## 📚 ССЫЛКИ

- **Оркестратор:** `UPMT/prompts/orchestrator.md`
- **Фазы:** `UPMT/prompts/phases/phase-X-*.md`
- **Этот адаптер используется для сценариев:** 1.1, 1.2

---

**Адаптер прочитан. Возвращайся к оркестратору и начинай PHASE 1.**

