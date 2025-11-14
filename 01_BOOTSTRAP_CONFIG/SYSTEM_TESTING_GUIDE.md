# SYSTEM TESTING GUIDE

**Версия:** 2.0.0  
**Дата:** 2025-11-10  
**Назначение:** Руководство по тестированию обновлённой системы bootstrap (v2.0)

---

## 🎯 ЦЕЛЬ ТЕСТИРОВАНИЯ

Проверить что обновлённая система bootstrap (v2.0) корректно:
1. Извлекает ВСЕ функции из raw data (100% полнота)
2. Заполняет ВСЕ файлы без templates
3. Проходит PHASE 7.5 COMPLETENESS VALIDATION
4. Создаёт .cursorrules в корне проекта
5. Активирует проектные правила (All_Project_rules.md)

---

## 📋 ЧТО НОВОГО В v2.0

### Изменения в системе:

1. **Механизм полного извлечения функций (PHASE 1)**
   - Обязательное извлечение ВСЕХ функций
   - Проверка полноты (если 150+ в чатах → 150+ в extracted_features)
   - Format: grouped by modules

2. **Усиленные требования PHASE 5**
   - Все файлы **ОБЯЗАТЕЛЬНО заполнять полностью**
   - Удалены "escape clauses" ("можешь оставить template")
   - Проверка количества функций (requirements = extracted_features)

3. **PHASE 7.5 COMPLETENESS VALIDATION**
   - Критический чек-лист (17 пунктов)
   - Автоматическая проверка полноты
   - Если failed → возврат к PHASE для исправления

4. **Система проектных правил**
   - 16 правил в All_Project_rules.md
   - Активация: "👀 ACTIVE: RULE_XX"
   - Завершение: "✅ RULE_XX: обновлены [файлы]"

5. **. cursorrules template**
   - AUTO-GENERATED секция
   - Копируется в КОРЕНЬ при bootstrap
   - Обновляется автоматически при изменениях

---

## 🧪 ТЕСТОВЫЕ СЦЕНАРИИ

### Сценарий 1: Новый проект (CLI) - Простой

**Подготовка:**
1. Создай test project папку
2. Скопируй UPMT template
3. Добавь test raw data:
   - 1 chat с 10 функциями
   - metadata.yaml (default)

**Запуск:**
1. Используй промпт: Сценарий 1 из BOOTSTRAP_START_PROMPT.md (v2.0)
2. Запусти в Cursor или `claude` CLI

**Ожидаемый результат:**
- ✅ PHASE 1: extracted_features содержит 10 функций
- ✅ PHASE 5: Все 6 PROJECT_CORE файлов заполнены (НЕ templates)
- ✅ PHASE 5: module_requirements содержит 10 функций
- ✅ PHASE 7.5: COMPLETENESS VALIDATION PASSED
- ✅ .cursorrules создан в КОРНЕ (не в template)
- ✅ BOOTSTRAP_REPORT.md: "COMPLETENESS VALIDATION: ✅ PASSED"

**Критерии успеха:**
- [ ] Все файлы созданы
- [ ] Ни один файл не template
- [ ] Количество функций: 10 = 10
- [ ] .cursorrules в корне
- [ ] VALIDATION PASSED

---

### Сценарий 2: Новый проект (CLI) - Сложный (Ground Control)

**Подготовка:**
1. Используй реальные данные Ground Control
2. Ссылка: `c:\Users\333\Documents\My projects\Ground Control\Ground-Control\00_RAW_DATA_TEMPLATE\`
3. Копируй chats (3 файла, включая 150+ функций)

**Запуск:**
1. Промпт: Сценарий 1 (v2.0)
2. Запусти bootstrap

**Ожидаемый результат:**
- ✅ PHASE 1: extracted_features содержит 150+ функций
- ✅ PHASE 5: Все module_requirements содержат ВСЕ 150+ функций
- ✅ PHASE 5: Каждый модуль имеет свой requirements файл
- ✅ PHASE 7.5: Проверка полноты: 150+ = 150+ → PASSED
- ✅ BOOTSTRAP_REPORT: детальная статистика (150+ функций учтены)

**Критерии успеха:**
- [ ] extracted_features: 150+ функций
- [ ] module_requirements: 150+ функций (total)
- [ ] Каждый модуль: свой файл
- [ ] VALIDATION PASSED

---

### Сценарий 3: Существующий проект (CLI) - Zenith Trainer

**Подготовка:**
1. Используй реальные данные Zenith Trainer
2. Ссылка: `c:\Users\333\Documents\My projects\Zenith\studio\`
3. Raw data + существующий код (~12K LOC)

**Запуск:**
1. Промпт: Сценарий 2 (v2.0)
2. Запусти bootstrap

**Ожидаемый результат:**
- ✅ PHASE 1 Part B: Code analysis выполнен (package.json, src/, etc.)
- ✅ PHASE 1: Features помечены: ✅ Implemented / ⚠️ Partial / ❌ Planned
- ✅ PHASE 5: PRD содержит статусы фич
- ✅ PHASE 5: TECH_STACK.md содержит "Existing Project Analysis" секцию
- ✅ PHASE 5: state.md содержит реальный прогресс (65-70%)
- ✅ BOOTSTRAP_REPORT: "Found X features implemented, Y partial, Z planned"

**Критерии успеха:**
- [ ] Code analysis выполнен
- [ ] Features с реальными статусами
- [ ] state.md: реальный % (не 0%)
- [ ] TECH_STACK: Current vs Recommended
- [ ] VALIDATION PASSED

---

### Сценарий 4: Проверка системы правил

**Подготовка:**
1. Любой test project
2. Добавь простой raw data

**Запуск:**
1. Запусти bootstrap
2. Отслеживай вывод Claude

**Ожидаемые уведомления:**

**В начале PHASE 1:**
```
👀 АКТИВНЫ ПРАВИЛА: RULE_01_METADATA
```

**В начале PHASE 5:**
```
👀 АКТИВНЫ ПРАВИЛА: RULE_02_PROJECT_ESSENCE, RULE_03_PRD, RULE_04_ROADMAP, 
RULE_05_TECH_STACK, RULE_06_ARCHITECTURE, RULE_07_MODULE_REQUIREMENTS, 
RULE_08_STATE, RULE_09_DECISIONS, RULE_10_INSIGHTS, RULE_11_CHANGES_LOG, 
RULE_12_MODULES_STATUS, RULE_13_SPRINT_CURRENT, RULE_14_BACKLOG, RULE_15_CURSORRULES
```

**В конце PHASE 5:**
```
✅ ПРАВИЛА СРАБОТАЛИ:
- RULE_02_PROJECT_ESSENCE: создан и заполнен полностью
- RULE_03_PRD: создан со ВСЕМИ модулями и функциями
- RULE_15_CURSORRULES: создан в КОРНЕ проекта
[... остальные правила]
```

**Критерии успеха:**
- [ ] Уведомления "👀 ACTIVE" появляются
- [ ] Уведомления "✅ ПРАВИЛА СРАБОТАЛИ" появляются
- [ ] Правила корректно идентифицированы

---

### Сценарий 5: Проверка .cursorrules

**Подготовка:**
1. Test project
2. Raw data

**Запуск:**
1. Запусти bootstrap
2. После завершения проверь файловую систему

**Проверка:**
```bash
# В корне проекта (НЕ в template):
ls -la | grep cursorrules
# Должен показать: .cursorrules

# Прочитай файл:
cat .cursorrules
# Должен содержать AUTO-GENERATED секцию с реальными данными
```

**Ожидаемое содержимое:**
```
## Project Information
- **Name:** [реальное название, НЕ "[Project Name]"]
- **Type:** [реальный тип]
- **Status:** [реальный статус]

## Tech Stack (Brief)
[реальный стек, НЕ placeholder]

## Key Modules
[реальные модули из PRD]
```

**Критерии успеха:**
- [ ] .cursorrules в КОРНЕ (не в template)
- [ ] AUTO-GENERATED заполнен реальными данными
- [ ] НЕТ placeholders ([Project Name], [version], etc.)

---

## ✅ ОБЩИЙ ЧЕК-ЛИСТ ТЕСТИРОВАНИЯ

### Pre-test Setup
- [ ] UPMT v2.0 развёрнут
- [ ] All_Project_rules.md создан (v2.0)
- [ ] BOOTSTRAP_START_PROMPT.md обновлён (v2.0)
- [ ] .cursorrules.template создан
- [ ] UPMT.md справочник создан

### Test Execution
- [ ] Сценарий 1: Простой проект ✅ PASSED
- [ ] Сценарий 2: Сложный проект (150+ функций) ✅ PASSED
- [ ] Сценарий 3: Существующий проект ✅ PASSED
- [ ] Сценарий 4: Система правил ✅ PASSED
- [ ] Сценарий 5: .cursorrules ✅ PASSED

### Post-test Validation
- [ ] Все extracted_features полные (100%)
- [ ] Все module_requirements содержат ВСЕ функции
- [ ] Ни один файл не template
- [ ] .cursorrules в корне (для всех test projects)
- [ ] COMPLETENESS VALIDATION PASSED (для всех)

---

## 🐛 ЧАСТЫЕ ПРОБЛЕМЫ И РЕШЕНИЯ

### Проблема 1: Claude пропускает функции

**Симптомы:**
- В чате 150 функций
- extracted_features содержит только 50

**Причина:**
- Claude не прочитал все чаты полностью
- Или shortcuts/summarizing

**Решение:**
1. В промпте явно указано: "Прочитай КАЖДЫЙ чат ПОЛНОСТЬЮ"
2. Проверка в PHASE 1: "Пройдись по чатам ПОВТОРНО"
3. ЕСЛИ неполный → ERROR, переделай

**Проверка:**
```
Подсчитай функции вручную в чате → compare с extracted_features
Если не совпадает → bootstrap failed, начни заново
```

---

### Проблема 2: Template файлы не заполнены

**Симптомы:**
- state.md содержит "[Last Updated]"
- PROJECT_ESSENCE содержит "Your Project Name"

**Причина:**
- Claude всё ещё использует старые промпты (v1.0)
- Или игнорирует требования "ОБЯЗАТЕЛЬНО заполни"

**Решение:**
1. Убедись что используешь BOOTSTRAP_START_PROMPT.md v2.0.0
2. В v2.0 удалены все "можешь оставить template"
3. PHASE 7.5 проверит это → вернёт к PHASE 5

**Проверка:**
```bash
grep -r "\[Project Name\]" 02_PROJECT_STRUCTURE/
# Не должно находить ничего!

grep -r "\[Last Updated\]" 02_PROJECT_STRUCTURE/
# Не должно находить ничего!
```

---

### Проблема 3: .cursorrules не в корне

**Симптомы:**
- Cursor не видит правила
- Файл находится в `02_PROJECT_STRUCTURE/AI_INSTRUCTIONS/`

**Причина:**
- Claude создал но не скопировал в корень
- Или создал только template

**Решение:**
1. PHASE 5 явно требует: "ОБЯЗАТЕЛЬНО скопируй в КОРЕНЬ"
2. PHASE 5 требует: "ПРОВЕРЬ что создан в корне"
3. PHASE 7.5 проверяет: ".cursorrules создан в КОРНЕ"

**Manual fix:**
```bash
cp 02_PROJECT_STRUCTURE/AI_INSTRUCTIONS/.cursorrules .
# Копируй в корень вручную если нужно
```

---

### Проблема 4: VALIDATION FAILED

**Симптомы:**
```
❌ COMPLETENESS VALIDATION FAILED
→ Недостающие файлы: [список]
```

**Причина:**
- Не все файлы созданы
- Или файлы templates
- Или функции lost

**Решение:**
1. Claude должен вернуться к соответствующей PHASE
2. Исправить недостатки
3. Повторить PHASE 7.5

**Если Claude не возвращается автоматически:**
```
Скажи: "VALIDATION FAILED. Вернись к PHASE 5 и заполни [файлы]. 
После этого повтори PHASE 7.5."
```

---

## 📊 КРИТЕРИИ УСПЕХА ТЕСТИРОВАНИЯ

**v2.0 считается работающей, если:**

1. ✅ **Полнота функций: 100%**
   - Все функции из чатов извлечены
   - Все функции отражены в module_requirements
   - Проверка: extracted_features count = module_requirements total count

2. ✅ **Нет template файлов: 100%**
   - Ни один файл не содержит placeholders
   - Все CONTEXT_MEMORY файлы заполнены
   - state.md содержит реальные данные

3. ✅ **VALIDATION PASSED: 100%**
   - PHASE 7.5 проходит успешно
   - Все 17 пунктов чек-листа выполнены
   - "✅ COMPLETENESS VALIDATION PASSED" в выводе

4. ✅ **.cursorrules работает: 100%**
   - Файл в КОРНЕ проекта
   - AUTO-GENERATED секция заполнена
   - Cursor видит правила

5. ✅ **Проектные правила активны: 100%**
   - Уведомления "👀 ACTIVE" появляются
   - Уведомления "✅ ПРАВИЛА СРАБОТАЛИ" появляются
   - All_Project_rules.md используется

**Если хотя бы один критерий НЕ выполнен:**
```
❌ SYSTEM TEST FAILED
→ Fix issues and re-test
```

**Если все критерии выполнены:**
```
✅ SYSTEM TEST PASSED
→ v2.0 готов к использованию
→ Можно применять на реальных проектах
```

---

## 🚀 РЕКОМЕНДАЦИИ ПО ТЕСТИРОВАНИЮ

### Последовательность тестирования:

1. **Начни с простого (Сценарий 1)**
   - 10 функций, базовый проект
   - Проверь основную механику
   - Если fails → проще debugить

2. **Затем сложный (Сценарий 2)**
   - 150+ функций
   - Проверка масштабируемости
   - Проверка полноты извлечения

3. **Существующий проект (Сценарий 3)**
   - Code analysis
   - Feature statuses
   - Modernization recommendations

4. **Проверка правил (Сценарий 4)**
   - Активация работает
   - Уведомления появляются

5. **Финальная проверка (Сценарий 5)**
   - .cursorrules deployment
   - Работает в Cursor

### Время выполнения:

- Сценарий 1: ~1-2 часа
- Сценарий 2: ~3-4 часа (большой объём)
- Сценарий 3: ~2-3 часа
- Сценарий 4: ~30 минут
- Сценарий 5: ~15 минут

**Всего:** ~7-10 часов полного тестирования

### Рекомендация:
- День 1: Сценарии 1, 4, 5 (простые)
- День 2: Сценарии 2, 3 (сложные)

---

## 📝 ОТЧЁТ О ТЕСТИРОВАНИИ (Template)

```markdown
# UPMT v2.0 Testing Report

**Дата:** [YYYY-MM-DD]
**Тестировщик:** [Имя]
**Версия UPMT:** 2.0.0

## Сценарии

### Сценарий 1: Простой проект
- Status: ✅ PASSED / ❌ FAILED
- Функций: [N] extracted, [N] in requirements
- Validation: ✅ PASSED / ❌ FAILED
- Проблемы: [описание или "None"]

### Сценарий 2: Сложный проект (150+)
- Status: ✅ PASSED / ❌ FAILED
- Функций: [N] extracted, [N] in requirements
- Validation: ✅ PASSED / ❌ FAILED
- Проблемы: [описание или "None"]

### Сценарий 3: Существующий проект
- Status: ✅ PASSED / ❌ FAILED
- Code analysis: ✅ OK / ❌ FAILED
- Features marked: ✅ OK / ❌ FAILED
- Validation: ✅ PASSED / ❌ FAILED
- Проблемы: [описание или "None"]

### Сценарий 4: Проектные правила
- Status: ✅ PASSED / ❌ FAILED
- Активация работает: ✅ YES / ❌ NO
- Уведомления появляются: ✅ YES / ❌ NO
- Проблемы: [описание или "None"]

### Сценарий 5: .cursorrules
- Status: ✅ PASSED / ❌ FAILED
- Файл в корне: ✅ YES / ❌ NO
- AUTO-GENERATED заполнен: ✅ YES / ❌ NO
- Cursor видит: ✅ YES / ❌ NO
- Проблемы: [описание или "None"]

## Общий результат

**Критерии успеха:**
- [ ] Полнота функций: 100%
- [ ] Нет templates: 100%
- [ ] VALIDATION PASSED: 100%
- [ ] .cursorrules работает: 100%
- [ ] Правила активны: 100%

**Итоговый статус:** ✅ ALL TESTS PASSED / ⚠️ SOME FAILED / ❌ FAILED

**Рекомендация:** [READY FOR PRODUCTION / NEEDS FIXES]

## Найденные проблемы

1. [Проблема 1]: [описание]
   - Severity: HIGH/MEDIUM/LOW
   - Fix: [как исправили]

2. [Проблема 2]: [описание]
   - Severity: HIGH/MEDIUM/LOW
   - Fix: [как исправили]

## Выводы

[Общие выводы о готовности v2.0]

---

**Тестирование завершено:** [YYYY-MM-DD]
```

---

## 🔄 CONTINUOUS TESTING

После внесения изменений в v2.0, повтори тестирование:

**Что тестировать при изменениях:**

- Изменение промптов → Сценарий 1 + 2
- Изменение правил → Сценарий 4
- Изменение .cursorrules.template → Сценарий 5
- Major изменения → Все сценарии

**Regression testing:**
- Раз в месяц: полное тестирование (все сценарии)
- Перед релизом: обязательно все сценарии

---

**SYSTEM TESTING GUIDE v2.0.0 - Complete**

**Готов к тестированию!** 🚀

Начни с Сценария 1 (простой проект) для первой проверки системы.

