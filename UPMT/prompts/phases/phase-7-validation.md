# PHASE 7: COMPLETENESS VALIDATION

**Время выполнения:** 30 минут (автономно)

**Назначение:** Проверка 100% полноты и корректности созданной документации

**⚠️ КРИТИЧЕСКАЯ ФАЗА - НИЧЕГО НЕ ДОЛЖНО БЫТЬ ПРОПУЩЕНО**

---

## 📋 VALIDATION CHECKLIST

### ✅ 1. ПРОВЕРКА ДОКУМЕНТАЦИИ

**docs/core/ (6 файлов):**
- [ ] `00_PROJECT_ESSENCE.md` заполнен на 100% (НЕ template, все поля заполнены)
- [ ] `01_PRD.md` содержит ВСЕ модули из `modules_list.md`
- [ ] `02_ROADMAP.md` заполнен полностью (фазы, timeline, milestones)
- [ ] `03_TECH_STACK.md` заполнен с обоснованием каждой технологии
- [ ] `04_ARCHITECTURE.md` заполнен полностью (диаграммы, паттерны)
- [ ] `99_SYSTEM_GUIDE.md` создан

---

### ✅ 2. ПРОВЕРКА EXTRACTED FEATURES

- [ ] `extracted_features.md` создан и содержит ВСЕ функции (проверь по raw data)
- [ ] `extracted_features.md` был **APPROVED** пользователем
- [ ] `modules_list.md` создан и содержит финальный список модулей

**⚠️ CRITICAL:** Прочитай `extracted_features.md` и посчитай функции:
```
TOTAL_FUNCTIONS_IN_EXTRACTED = [N]
```

---

### ✅ 3. ПРОВЕРКА MODULE REQUIREMENTS

**Прочитай `modules_list.md` и посчитай модули:**
```
TOTAL_MODULES = [M]
```

**Для каждого модуля из `modules_list.md`:**
- [ ] Существует файл `docs/requirements/[module_name]_requirements.md`
- [ ] Файл содержит ВСЕ функции модуля из `extracted_features.md`

**⚠️ CRITICAL VALIDATION:**
```
1. Посчитай функции в ВСЕХ requirements файлах:
   TOTAL_FUNCTIONS_IN_REQUIREMENTS = [K]

2. Сравни:
   IF TOTAL_FUNCTIONS_IN_REQUIREMENTS != TOTAL_FUNCTIONS_IN_EXTRACTED:
       ❌ ERROR: "Missing functions! Found [K] functions in requirements, but extracted_features has [N]"
       → Найди какие функции пропущены
       → Добавь их в соответствующие requirements
       → ПОВТОРИ VALIDATION
   ELSE:
       ✅ PASS: All functions accounted for
```

---

### ✅ 4. ПРОВЕРКА CONTEXT FILES

**.context/ (4 файла):**
- [ ] `state.md` содержит РЕАЛЬНЫЕ данные (НЕ template):
  - Current Phase: реальная фаза
  - Last Activity: реальная активность
  - Progress: реальный прогресс [existing project: X% / new: 0%]
- [ ] `decisions.md` содержит минимум 5 decision records
- [ ] `insights.md` содержит ключевые инсайты
- [ ] `changes_log.md` содержит начальную запись о bootstrap

---

### ✅ 5. ПРОВЕРКА PROGRESS TRACKING

**docs/progress/ (3 файла):**
- [ ] `modules_status.md` содержит ВСЕ модули из `modules_list.md` с реальным статусом
- [ ] `sprint_current.md` НЕ template (содержит реальные задачи)
- [ ] `backlog.md` содержит ВСЕ функции из `extracted_features.md` (приоритизированные)

**⚠️ VALIDATION:**
```
1. Посчитай модули в modules_status.md:
   MODULES_IN_STATUS = [P]

2. Сравни:
   IF MODULES_IN_STATUS != TOTAL_MODULES:
       ❌ ERROR: "Missing modules in status! Expected [M], found [P]"
       → Добавь пропущенные модули
       → ПОВТОРИ VALIDATION
   ELSE:
       ✅ PASS
```

---

### ✅ 6. ПРОВЕРКА МЕТАДАННЫХ И AI ПРАВИЛ

- [ ] `.upmt/metadata.yaml` создан (скопирован из `00_RAW_DATA_TEMPLATE/`)
- [ ] `.cursorrules` создан в КОРНЕ проекта (не в template!)
- [ ] `.cursorrules` содержит AUTO-GENERATED секцию (заполненную)

**⚠️ VALIDATION:**
```bash
# Проверь что .cursorrules в корне, не в UPMT/structure-templates/
IF file_exists(".cursorrules") AND NOT file_exists("UPMT/structure-templates/AI_INSTRUCTIONS/.cursorrules"):
    ✅ PASS
ELSE:
    ❌ ERROR: ".cursorrules must be in project root!"
    → Создай .cursorrules в корне
    → ПОВТОРИ VALIDATION
```

---

### ✅ 7. ПРОВЕРКА VERIFICATION FILES

- [ ] `/verification/VERIFICATION_PROMPT_FOR_CLAUDE.md` создан
- [ ] `/verification/tech-stack-analysis.md` создан (пользователем)
- [ ] `/verification/final-tech-stack.md` создан (APPROVED)

---

### ✅ 8. ПРОВЕРКА SYNTHESIS

- [ ] `/synthesized-project-data.md` создан
- [ ] Файл содержит полную информацию из PHASE 1-3

---

### ✅ 9. ПРОВЕРКА CONDITIONAL PHASES

**PHASE 5.5 (Design):**
```
IF design_data_exists OR existing_project:
    - [ ] docs/design/ создан
    - [ ] Foundation files (7 файлов) заполнены
    - [ ] Module requirements обновлены (Section 7)
ELSE:
    ℹ️ PHASE 5.5 SKIPPED (OK)
```

**PHASE 5.7 (Backend):**
```
IF backend_detected:
    - [ ] docs/backend/ создан
    - [ ] Entities documented
    - [ ] API endpoints documented
    - [ ] docs/adr/ создан (минимум 3 ADRs)
    - [ ] Module requirements обновлены (Section 8)
ELSE:
    ℹ️ PHASE 5.7 SKIPPED (OK)
```

---

### ✅ 10. ПРОВЕРКА SETUP INSTRUCTIONS

- [ ] `UPMT/bootstrap/BOOTSTRAP_CONFIG/FINAL_SETUP_INSTRUCTIONS.md` создан

---

### ✅ 11. QUALITY VERIFICATION (CONTENT QUALITY)

**⚠️ КРИТИЧНО: Проверка качества контента, не только наличия файлов!**

#### A. Requirements Files Quality Check

```python
print("\n🔍 PHASE 7: Quality Verification - Requirements Files\n")

requirements_errors = []
requirements_warnings = []
requirements_stats = {
    "total_files": 0,
    "total_lines": 0,
    "stub_files": 0,
    "short_files": 0,
    "missing_user_stories": 0
}

for req_file in glob("docs/requirements/*_requirements.md"):
    filename = os.path.basename(req_file)
    content = read_file(req_file)
    lines = content.split('\n')
    line_count = len(lines)
    
    requirements_stats["total_files"] += 1
    requirements_stats["total_lines"] += line_count
    
    # CRITICAL CHECK 1: Minimum line count
    if line_count < 50:
        requirements_stats["short_files"] += 1
        requirements_errors.append({
            "file": filename,
            "severity": "CRITICAL",
            "issue": f"File too short: {line_count} lines (minimum 50)",
            "fix": "Requirements file must contain detailed user stories and acceptance criteria for EVERY function"
        })
    elif line_count < 100:
        requirements_warnings.append({
            "file": filename,
            "issue": f"Short file: {line_count} lines (recommended 100+ for modules with 4+ functions)"
        })
    
    # CRITICAL CHECK 2: Stub file detection
    stub_indicators = [
        "See extracted_features.md",
        "For detailed acceptance criteria, see",
        "For complete function list"
    ]
    if any(indicator in content for indicator in stub_indicators):
        requirements_stats["stub_files"] += 1
        requirements_errors.append({
            "file": filename,
            "severity": "CRITICAL",
            "issue": "STUB FILE DETECTED (contains redirect instead of actual content)",
            "fix": "Replace with full requirements using template from phase-5-documentation.md"
        })
    
    # CRITICAL CHECK 3: User stories presence
    function_count = content.count("## Function")
    user_story_count = content.count("### User Story")
    
    if function_count > 0 and user_story_count == 0:
        requirements_stats["missing_user_stories"] += 1
        requirements_errors.append({
            "file": filename,
            "severity": "CRITICAL",
            "issue": f"NO USER STORIES found ({function_count} functions documented but no user stories)",
            "fix": "Add '### User Story' section for EVERY function"
        })
    elif user_story_count < function_count:
        requirements_warnings.append({
            "file": filename,
            "issue": f"Missing user stories for some functions ({user_story_count}/{function_count})"
        })
    
    # WARNING CHECK: Acceptance criteria
    ac_count = content.count("### Acceptance Criteria")
    if function_count > 0 and ac_count < function_count * 0.5:
        requirements_warnings.append({
            "file": filename,
            "issue": f"Insufficient acceptance criteria ({ac_count} criteria for {function_count} functions)"
        })
    
    # Success
    if not any(err["file"] == filename for err in requirements_errors):
        print(f"   ✅ {filename}: {line_count} lines, {function_count} functions, {user_story_count} user stories")

avg_lines = requirements_stats["total_lines"] / requirements_stats["total_files"] if requirements_stats["total_files"] > 0 else 0

print(f"\n📊 Requirements Files Statistics:")
print(f"   Total files: {requirements_stats['total_files']}")
print(f"   Total lines: {requirements_stats['total_lines']}")
print(f"   Average lines per file: {avg_lines:.0f}")
print(f"   Stub files detected: {requirements_stats['stub_files']}")
print(f"   Short files (<50 lines): {requirements_stats['short_files']}")

if requirements_errors:
    print(f"\n❌ REQUIREMENTS QUALITY CHECK FAILED - {len(requirements_errors)} CRITICAL ERRORS\n")
    for error in requirements_errors:
        print(f"   ❌ {error['file']}")
        print(f"      Issue: {error['issue']}")
        print(f"      Fix: {error['fix']}\n")
```

**- [ ] Requirements files quality check: PASSED (no stub files, all detailed)**

---

#### B. Core Documentation Quality Check

```python
print("\n🔍 PHASE 7: Quality Verification - Core Documentation\n")

core_docs_errors = []
core_docs_requirements = {
    "docs/core/00_PROJECT_ESSENCE.md": 50,
    "docs/core/01_PRD.md": 200,  # PRD должен быть большим!
    "docs/core/02_ROADMAP.md": 80,
    "docs/core/03_TECH_STACK.md": 80,
    "docs/core/04_ARCHITECTURE.md": 100,
    "docs/core/99_SYSTEM_GUIDE.md": 60
}

for doc_file, min_lines in core_docs_requirements.items():
    if os.path.exists(doc_file):
        content = read_file(doc_file)
        line_count = len(content.split('\n'))
        
        if line_count < min_lines:
            core_docs_errors.append({
                "file": os.path.basename(doc_file),
                "severity": "CRITICAL",
                "issue": f"Core doc too short: {line_count} lines (minimum {min_lines})",
                "expected": min_lines,
                "actual": line_count,
                "fix": "Expand with detailed content from synthesized-project-data.md and extracted_features.md"
            })
            print(f"   ❌ {os.path.basename(doc_file)}: {line_count} lines (minimum {min_lines})")
        else:
            print(f"   ✅ {os.path.basename(doc_file)}: {line_count} lines")
    else:
        core_docs_errors.append({
            "file": os.path.basename(doc_file),
            "severity": "CRITICAL",
            "issue": "File missing",
            "fix": f"Create {doc_file}"
        })
        print(f"   ❌ {os.path.basename(doc_file)}: MISSING")

if core_docs_errors:
    print(f"\n❌ CORE DOCS QUALITY CHECK FAILED - {len(core_docs_errors)} errors")
```

**- [ ] Core documentation quality check: PASSED (all files meet minimum line count)**

---

#### C. Combined Quality Report

```python
all_errors = requirements_errors + core_docs_errors
all_warnings = requirements_warnings

print(f"\n📊 COMBINED QUALITY VERIFICATION RESULTS:\n")
print(f"   Requirements files: {requirements_stats['total_files']} files, {requirements_stats['total_lines']} lines total")
print(f"   Core documentation: {len(core_docs_requirements)} files")
print(f"   Critical errors: {len(all_errors)}")
print(f"   Warnings: {len(all_warnings)}")

if all_errors:
    print(f"\n❌ QUALITY VALIDATION FAILED\n")
    print(f"⛔ Bootstrap cannot be considered complete with stub files or inadequate documentation!")
    print(f"\n📋 Critical Issues to Fix:\n")
    
    for i, error in enumerate(all_errors, 1):
        print(f"{i}. {error['file']}")
        print(f"   Issue: {error['issue']}")
        print(f"   Fix: {error['fix']}\n")
    
    print(f"⚠️ ACTION REQUIRED:")
    print(f"   1. Fix all critical issues listed above")
    print(f"   2. Re-run PHASE 7 validation")
    print(f"   3. Do NOT proceed to PHASE 8 until quality check passes\n")
    
    return "FAILED"

if all_warnings:
    print(f"\n⚠️ {len(all_warnings)} warnings (not blocking):\n")
    for warning in all_warnings:
        print(f"   ⚠️ {warning['file']}: {warning['issue']}")
    print(f"\n   Consider addressing these warnings for better quality.")

print(f"\n✅ QUALITY VALIDATION PASSED")
print(f"   All files meet minimum quality standards.\n")

return "PASSED"
```

**⚠️ ЕСЛИ QUALITY CHECK FAILED:**
1. ❌ **STOP - НЕ ПРОДОЛЖАЙ к PHASE 8**
2. 🔧 Исправь все критические ошибки
3. 🔄 Перезапусти PHASE 7 validation
4. ✅ Продолжай только после PASSED

**- [ ] Combined quality verification: PASSED**

---

## 📊 VALIDATION REPORT

**После проверки всех чеклистов:**

```markdown
# VALIDATION REPORT

**Дата:** [timestamp]

## ✅ PASSED CHECKS:

**Documentation:**
- ✅ docs/core/ (6/6 files)
- ✅ docs/requirements/ ([TOTAL_MODULES]/[TOTAL_MODULES] modules)
- ✅ .context/ (4/4 files)
- ✅ docs/progress/ (3/3 files)
- [If created] ✅ docs/design/
- [If created] ✅ docs/backend/
- [If created] ✅ docs/adr/

**Completeness:**
- ✅ extracted_features.md (APPROVED, [N] functions)
- ✅ modules_list.md ([M] modules)
- ✅ All functions accounted for: [N] functions in requirements = [N] functions in extracted_features
- ✅ All modules documented: [M] modules in status = [M] modules in modules_list

**Metadata:**
- ✅ .upmt/metadata.yaml
- ✅ .cursorrules (in root)

**Verification:**
- ✅ final-tech-stack.md (APPROVED)

**Setup:**
- ✅ FINAL_SETUP_INSTRUCTIONS.md

## 📈 STATISTICS:

**Total Files Created:** [N]
**Total Functions:** [M]
**Total Modules:** [K]
**Documentation Coverage:** 100%

## ✅ VALIDATION STATUS: **PASSED**

Bootstrap процесс завершён корректно. Все файлы созданы и заполнены.

---

[ЕСЛИ БЫЛИ ОШИБКИ]

## ❌ FAILED CHECKS:

**Issue 1:** [описание]
- Location: [файл/путь]
- Problem: [что не так]
- Fix: [что нужно исправить]

**Issue 2:** ...

## ⚠️ VALIDATION STATUS: **FAILED**

→ Требуется исправление перед PHASE 8
→ После исправления: ПОВТОРИ PHASE 7
```

---

## 🔧 AUTOMATED RE-GENERATION (НОВОЕ!)

**⚠️ КРИТИЧНО: Если validation failed, АВТОМАТИЧЕСКИ исправь проблемы!**

**Цель:** Не просто сообщать об ошибках, а АВТОМАТИЧЕСКИ регенерировать проблемные файлы.

---

### ШАГ 1: Categorize Failed Checks

**Для КАЖДОЙ провалившей проверки определи тип проблемы:**

```python
print("\n🔧 AUTOMATED RE-GENERATION ANALYSIS\n")

failed_checks = []  # Из validation выше

# Группируй проблемы по типу
problems_by_type = {
    "stub_files": [],           # Requirements files с "See extracted_features.md"
    "short_core_docs": [],      # Core docs короче минимума
    "short_requirements": [],   # Requirements файлы короче 50 строк
    "missing_user_stories": [], # Requirements без user stories
    "missing_files": [],        # Отсутствующие файлы
    "other": []                 # Прочие проблемы
}

for check in failed_checks:
    if "STUB FILE" in check["issue"]:
        problems_by_type["stub_files"].append(check)
    elif "too short" in check["issue"].lower() and "core" in check["file"].lower():
        problems_by_type["short_core_docs"].append(check)
    elif "too short" in check["issue"].lower() and "requirements" in check["file"].lower():
        problems_by_type["short_requirements"].append(check)
    elif "user stories" in check["issue"].lower():
        problems_by_type["missing_user_stories"].append(check)
    elif "missing" in check["issue"].lower():
        problems_by_type["missing_files"].append(check)
    else:
        problems_by_type["other"].append(check)

# Покажи категоризацию
for problem_type, problems in problems_by_type.items():
    if problems:
        print(f"   🔧 {problem_type}: {len(problems)} issues")

print(f"\n📊 Re-generation Plan:")
auto_fixable = sum([
    len(problems_by_type["stub_files"]),
    len(problems_by_type["short_core_docs"]),
    len(problems_by_type["short_requirements"]),
    len(problems_by_type["missing_user_stories"])
])
print(f"   Auto-fixable: {auto_fixable} / {len(failed_checks)} issues")
print(f"   Manual intervention needed: {len(failed_checks) - auto_fixable} issues\n")

if auto_fixable == 0:
    print("   ⚠️ No auto-fixable issues, manual intervention required.\n")
    # Skip auto-regeneration
else:
    print("   ✅ Starting automated re-generation...\n")
```

---

### ШАГ 2: Re-generate Stub Files (Requirements)

**Для КАЖДОГО stub file:**

```python
print("\n🔧 STEP 2.1: Re-generating stub requirements files\n")

for stub_file_problem in problems_by_type["stub_files"]:
    file_path = stub_file_problem["file_path"]
    module_name = extract_module_name_from_path(file_path)
    
    print(f"   🔧 Re-generating: {os.path.basename(file_path)}")
    
    # 1. Прочитай данные для этого модуля
    modules_content = safe_read_file("UPMT/bootstrap/00_RAW_DATA_TEMPLATE/modules_list.md")
    features_content = safe_read_file("UPMT/bootstrap/00_RAW_DATA_TEMPLATE/extracted_features.md")
    synthesis = safe_read_file("synthesized-project-data.md")
    
    # 2. Извлеки функции и детали модуля
    module_functions = extract_functions_for_module(features_content, module_name)
    module_details = extract_module_details(modules_content, module_name)
    
    # 3. Используй TEMPLATE из phase-5-documentation.md
    # (Читаем phase-5 чтобы взять requirements template)
    phase_5 = read_file("UPMT/prompts/phases/phase-5-documentation.md")
    requirements_template = extract_requirements_template(phase_5)
    
    # 4. Генерируй ДЕТАЛЬНЫЙ requirements file
    new_content = generate_detailed_requirements(
        module_name=module_name,
        module_details=module_details,
        module_functions=module_functions,
        template=requirements_template,
        synthesis_context=synthesis
    )
    
    # 5. ПРОВЕРКА качества перед сохранением
    line_count = len(new_content.split('\n'))
    user_story_count = new_content.count("### User Story")
    ac_count = new_content.count("### Acceptance Criteria")
    
    if line_count < 50:
        print(f"      ❌ Generated file still too short ({line_count} lines), needs manual fix")
        continue
    
    if user_story_count == 0:
        print(f"      ❌ No user stories generated, needs manual fix")
        continue
    
    # 6. Сохрани новый файл
    write_file(file_path, new_content)
    
    print(f"      ✅ Regenerated: {line_count} lines, {len(module_functions)} functions, {user_story_count} user stories")

print(f"\n   ✅ Stub files re-generation complete\n")
```

---

### ШАГ 3: Re-generate Short Core Docs

**Для КАЖДОГО короткого core документа:**

```python
print("\n🔧 STEP 3: Re-generating short core documentation\n")

for short_doc_problem in problems_by_type["short_core_docs"]:
    file_path = short_doc_problem["file_path"]
    doc_name = os.path.basename(file_path)
    min_lines = short_doc_problem.get("expected", 50)
    
    print(f"   🔧 Re-generating: {doc_name} (min {min_lines} lines)")
    
    # Прочитай контекст
    synthesis = safe_read_file("synthesized-project-data.md")
    modules_list = safe_read_file("UPMT/bootstrap/00_RAW_DATA_TEMPLATE/modules_list.md")
    features = safe_read_file("UPMT/bootstrap/00_RAW_DATA_TEMPLATE/extracted_features.md")
    metadata = read_yaml("UPMT/bootstrap/00_RAW_DATA_TEMPLATE/metadata.yaml")
    final_tech_stack = read_file("verification/final-tech-stack.md")
    
    # Используй соответствующий template из phase-5
    phase_5 = read_file("UPMT/prompts/phases/phase-5-documentation.md")
    
    # Определи какой template нужен
    if "00_PROJECT_ESSENCE" in doc_name:
        template = extract_template_by_name(phase_5, "Template 1: 00_PROJECT_ESSENCE.md")
        new_content = generate_project_essence(template, synthesis, metadata)
        
    elif "01_PRD" in doc_name:
        template = extract_template_by_name(phase_5, "Template 2: 01_PRD.md")
        new_content = generate_prd(template, synthesis, modules_list, features, metadata)
        
    elif "02_ROADMAP" in doc_name:
        template = extract_template_by_name(phase_5, "Template 3: 02_ROADMAP.md")
        new_content = generate_roadmap(template, modules_list, metadata)
        
    elif "03_TECH_STACK" in doc_name:
        template = extract_template_by_name(phase_5, "Template 4: 03_TECH_STACK.md")
        new_content = generate_tech_stack(template, final_tech_stack)
        
    elif "04_ARCHITECTURE" in doc_name:
        template = extract_template_by_name(phase_5, "Template 5: 04_ARCHITECTURE.md")
        new_content = generate_architecture(template, synthesis, final_tech_stack)
        
    elif "99_SYSTEM_GUIDE" in doc_name:
        template = extract_template_by_name(phase_5, "Template 6: 99_SYSTEM_GUIDE.md")
        new_content = generate_system_guide(template, modules_list, metadata)
    
    # ПРОВЕРКА
    line_count = len(new_content.split('\n'))
    
    if line_count < min_lines:
        print(f"      ❌ Still too short ({line_count}/{min_lines} lines), needs manual expansion")
        continue
    
    # Сохрани
    write_file(file_path, new_content)
    print(f"      ✅ Regenerated: {line_count} lines (min {min_lines})")

print(f"\n   ✅ Core docs re-generation complete\n")
```

---

### ШАГ 4: Add Missing User Stories

**Для requirements файлов БЕЗ user stories:**

```python
print("\n🔧 STEP 4: Adding missing user stories\n")

for missing_us_problem in problems_by_type["missing_user_stories"]:
    file_path = missing_us_problem["file_path"]
    
    print(f"   🔧 Adding user stories to: {os.path.basename(file_path)}")
    
    # Прочитай существующий файл
    current_content = read_file(file_path)
    
    # Найди все функции без user stories
    functions_without_us = find_functions_without_user_stories(current_content)
    
    print(f"      Functions without user stories: {len(functions_without_us)}")
    
    # Для КАЖДОЙ функции добавь user story секцию
    updated_content = current_content
    
    for func in functions_without_us:
        # Генерируй user story на основе func description
        user_story = generate_user_story_for_function(
            function_name=func["name"],
            function_description=func["description"],
            module_context=func["module"]
        )
        
        acceptance_criteria = generate_acceptance_criteria(
            function_name=func["name"],
            function_description=func["description"]
        )
        
        # Вставь после function header
        updated_content = insert_user_story_section(
            content=updated_content,
            function_name=func["name"],
            user_story=user_story,
            acceptance_criteria=acceptance_criteria
        )
    
    # Сохрани обновлённый файл
    write_file(file_path, updated_content)
    
    new_line_count = len(updated_content.split('\n'))
    print(f"      ✅ Added {len(functions_without_us)} user stories, new line count: {new_line_count}")

print(f"\n   ✅ User stories addition complete\n")
```

---

### ШАГ 5: Commit Re-generated Files

```bash
git add docs/core/ docs/requirements/
git commit -m "fix(bootstrap): automated re-generation of failed validation files

AUTOMATED FIX applied:
- Regenerated {N} stub requirements files with full content
- Expanded {M} short core documentation files
- Added {K} missing user stories

All files now meet quality standards."
git push
```

---

### ШАГ 6: Re-run Validation

**КРИТИЧНО: После регенерации автоматически повторить validation!**

```python
print("\n🔄 STEP 6: Re-running validation after auto-fix\n")

# Повторить ВСЕ проверки из начала PHASE 7
validation_result_2 = run_all_validation_checks()

if validation_result_2 == "PASSED":
    print(f"\n✅ VALIDATION PASSED AFTER AUTO-FIX!\n")
    print(f"   All {auto_fixable} issues were automatically resolved.")
    print(f"   Proceeding to PHASE 8...\n")
    
    # Переход к PHASE 8
    return "PROCEED_TO_PHASE_8"
    
elif validation_result_2 == "IMPROVED":
    print(f"\n⚠️ VALIDATION IMPROVED but not fully passed\n")
    
    # Посчитай сколько проблем осталось
    remaining_issues = count_remaining_issues()
    
    print(f"   Fixed: {auto_fixable} issues")
    print(f"   Remaining: {remaining_issues} issues")
    print(f"   Improvement: {(auto_fixable / (auto_fixable + remaining_issues)) * 100:.0f}%\n")
    
    if remaining_issues <= 3:
        print(f"   ℹ️ Only {remaining_issues} minor issues remain.")
        print(f"   Recommendation: Manually fix these and re-run PHASE 7.\n")
    else:
        print(f"   ⚠️ {remaining_issues} issues remain, may need deeper fixes.\n")
    
    return "MANUAL_INTERVENTION_NEEDED"
    
else:
    print(f"\n❌ VALIDATION STILL FAILED after auto-fix\n")
    print(f"   Auto-regeneration did not resolve all issues.")
    print(f"   Manual intervention required.\n")
    
    return "MANUAL_INTERVENTION_NEEDED"
```

---

### ШАГ 7: Report Auto-fix Results

```markdown
🔧 **AUTOMATED RE-GENERATION RESULTS**

**Issues detected:** {total_issues}
**Auto-fixable:** {auto_fixable}
**Auto-fixed:** {actually_fixed}

**Actions taken:**
✅ Regenerated {N} stub requirements files
   - Now {X} lines average (was {Y})
   - Added user stories and acceptance criteria
   
✅ Expanded {M} short core docs
   - 00_PROJECT_ESSENCE.md: {X} lines (was {Y})
   - 01_PRD.md: {X} lines (was {Y})
   - ... etc

✅ Added {K} missing user stories
   - {K} functions now have user stories
   - {K} functions now have acceptance criteria

**Validation re-run result:**
[✅ PASSED / ⚠️ IMPROVED / ❌ FAILED]

[IF PASSED:]
→ Proceeding to PHASE 8 automatically

[IF IMPROVED:]
→ {remaining} minor issues remain
→ Recommendation: Manual fix + re-run PHASE 7

[IF FAILED:]
→ Auto-fix unsuccessful
→ Manual intervention required
```

---

## 🔄 ДЕЙСТВИЯ ПОСЛЕ VALIDATION

### ЕСЛИ VALIDATION PASSED:

```markdown
✅ VALIDATION PASSED - ПЕРЕХОД К PHASE 8

Все проверки пройдены! Bootstrap завершён корректно.

**Next:** PHASE 8 - Final Report
```

```
→ ПЕРЕХОД К PHASE 8: FINAL REPORT
→ Прочитай: UPMT/prompts/phases/phase-8-report.md
```

---

### ЕСЛИ VALIDATION FAILED:

```markdown
❌ VALIDATION FAILED

**Обнаружены проблемы:**
1. [Problem 1]
2. [Problem 2]
[...]

**Действия:**
→ Исправь проблемы
→ После исправления: ПОВТОРИ PHASE 7
→ НЕ ПЕРЕХОДИ к PHASE 8 пока validation не пройдёт
```

**Исправь проблемы и повтори validation:**
```
→ ВЕРНУТЬСЯ К PHASE 7: VALIDATION
→ Прочитай: UPMT/prompts/phases/phase-7-validation.md
```

---

## 💾 CHECKPOINT (только если PASSED)

```bash
git add . # Любые исправления
git commit -m "docs(bootstrap): PHASE 7 complete - validation passed"
git push
```

**Показать итоги:**

```markdown
✅ PHASE 7 COMPLETE

**Validation:**
- ✅ All checks passed
- ✅ [N] files validated
- ✅ [M] functions accounted for
- ✅ [K] modules documented
- ✅ 100% completeness

**Next:** PHASE 8 - Final Report (последняя фаза!)

⏱️ PHASE 7 завершена за [время]
```

---

## 🔄 СЛЕДУЮЩИЙ ШАГ

```
→ ПЕРЕХОД К PHASE 8: FINAL REPORT
→ Прочитай: UPMT/prompts/phases/phase-8-report.md
```

