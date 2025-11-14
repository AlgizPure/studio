# PHASE 5.5: DESIGN SYSTEM GENERATION (CONDITIONAL)

**Время выполнения:** 1-2 часа (автономно)

**Назначение:** Создание design system документации

**⚠️ УСЛОВНОЕ ВЫПОЛНЕНИЕ**

---

## ⚡ ШАГ 0: ПРОВЕРКА ПАРАМЕТРОВ И УСЛОВИЙ

**0.1: Проверь параметры сценария**

**ПЕРЕД началом фазы, проверь:**

1. Прочитай алиас сценария (`UPMT/start/1.X.md`)
2. Извлеки значение `scenario.existing_project`
3. Запиши в память: `existing_project = [true/false]`

**Если параметр не найден:**
- Проверь наличие кода в репозитории
- Если код есть → `existing_project = true`
- Если кода нет → `existing_project = false`

**0.2: Проверь наличие design raw data:**

```
UPMT/bootstrap/00_DESIGN_RAW_DATA/
```

**ЕСЛИ папка пуста или содержит только README и примеры:**
- **ЕСЛИ `existing_project == false`:** ⏭️ **SKIP PHASE 5.5** → Переход к PHASE 5.7
- **ЕСЛИ `existing_project == true`:** ✅ **ПРОДОЛЖАЙ PHASE 5.5** (анализируй код)

**ЕСЛИ есть реальные design файлы (chats/, moodboards/, screenshots/, figma/, research/, brand/):**
- ✅ **ПРОДОЛЖАЙ PHASE 5.5**

**ЕСЛИ `existing_project == true`:**
- ✅ **ПРОДОЛЖАЙ PHASE 5.5** (даже без design data, анализируй код)

---

## 📋 ИНСТРУКЦИИ (если продолжаем)

### ШАГ 1: Анализ Design Data (30-60 минут)

**1.1: Анализ Design Raw Data (если есть)**

**⚠️ КРИТИЧНО: Обработка больших файлов**

**Используй `safe_read_file()` из адаптера для автоматической обработки больших файлов.**

**Алгоритм:**
1. Для каждого файла вызывай `safe_read_file(file_path)`
2. Если файл большой (>256KB или >25000 токенов) - функция автоматически прочитает по частям
3. Объедини все части перед анализом

**Прочитай ВСЁ из `UPMT/bootstrap/00_DESIGN_RAW_DATA/`:**

**Файлы для чтения:**
- `chats/` - дизайн обсуждения (могут быть очень большими)
- `moodboards/` + notes - визуальные референсы
- `screenshots/` + notes - примеры UI
- `figma/` + links - Figma файлы/ссылки
- `research/` - user research
- `brand/` - brand guidelines
- `design-metadata.yaml` - метаданные дизайна

**Пример чтения:**

```python
# Для каждого файла в каждой папке используй safe_read_file()
for chat_file in list_dir("UPMT/bootstrap/00_DESIGN_RAW_DATA/chats/"):
    content = safe_read_file(f"UPMT/bootstrap/00_DESIGN_RAW_DATA/chats/{chat_file}")
    extract_design_info(content)

# Повтори для всех папок: moodboards/, screenshots/, figma/, research/, brand/
# Для design-metadata.yaml:
if exists("UPMT/bootstrap/00_DESIGN_RAW_DATA/design-metadata.yaml"):
    metadata = safe_read_file("UPMT/bootstrap/00_DESIGN_RAW_DATA/design-metadata.yaml")
    extract_metadata_info(metadata)
```

**⚠️ ВАЖНО:** 
- НЕ ПРОПУСКАЙ файлы из-за размера
- Функция автоматически обработает большие файлы
- Детали алгоритма см. в `cli-adapter.md` / `web-adapter.md`

**Извлеки:**
- Цветовую палитру (primary, secondary, semantic, grays)
- Типографику (font families, sizes, weights)
- Design principles (упомянутые в чатах/мудбордах)
- Компоненты (упомянутые или показанные)
- Visual style (minimal, bold, playful, etc.)

**1.2: Анализ дизайна из кода (ТОЛЬКО если `existing_project == true`)**

**⚠️ ВЫПОЛНЯЙ ТОЛЬКО ЕСЛИ `existing_project == true`**

**CLI:**
```bash
# Найди style файлы
find ../src -name "*.css" -o -name "*.scss" -o -name "*.styled.tsx" | head -20
find ../src -name "tailwind.config.*" -o -name "theme.*"
cat ../package.json | grep -E "mui|antd|bootstrap|emotion|styled"
```

**Web (GitHub API):**
```bash
gh api /repos/{owner}/{repo}/contents/src/styles
gh api /repos/{owner}/{repo}/contents/tailwind.config.js
gh api /repos/{owner}/{repo}/contents/package.json --jq '.content' | base64 -d | grep -E "mui|antd|bootstrap"
```

**A. Найди style файлы:**
- `*.css`, `*.scss`, `*.sass`
- `styled-components` (`.ts`, `.tsx`, `.js`, `.jsx` с `styled`)
- `*.module.css`
- Tailwind config (`tailwind.config.js`)
- MUI/Ant Design theme files
- CSS-in-JS (emotion, styled-components)

**B. Извлеки Colors:**

Из CSS/SCSS:
```css
/* Ищи patterns: */
--color-primary: #2196F3;
--primary-color: #2196F3;
$primary: #2196F3;
background-color: #2196F3;
color: #333;
```

Из styled-components:
```js
const primary = '#2196F3';
theme.colors.primary
```

Из Tailwind config:
```js
colors: {
  primary: '#2196F3'
}
```

**Создай палитру:**
- Собери ВСЕ уникальные цвета
- Группируй похожие (primary, gray, semantic)
- Определи most used = primary

**C. Извлеки Typography:**

Ищи:
```css
font-family: 'Inter', sans-serif;
font-size: 16px; /* собери все sizes */
font-weight: 400, 500, 600, 700; /* собери all weights */
```

**D. Извлеки Spacing:**

Ищи padding/margin patterns:
```css
padding: 16px;
margin: 24px;
gap: 8px;
```

**Определи spacing scale (4, 8, 16, 24, 32...)**

**E. Извлеки Components:**

Список существующих компонентов:

**CLI:**
```bash
find ../src/components -name "*.tsx" -o -name "*.jsx"
```

**Web (GitHub API):**
```bash
gh api /repos/{owner}/{repo}/contents/src/components
```

Для каждого компонента:
- Название
- Props interface (if TypeScript)
- Variants (if multiple)
- States (loading, error, disabled, etc.)

**F. Определи UI Framework:**

Проверь imports:
```js
import { Button } from '@mui/material' → Material-UI
import { Button } from 'antd' → Ant Design
import { Button } from 'react-bootstrap' → Bootstrap
// No imports → Custom components
```

**G. Извлеки Design Patterns:**
- Навигация (sidebar, top nav, tabs)
- Формы (layout, validation patterns)
- Data display (tables, cards, lists)
- Feedback (toasts, modals, alerts)

**1.3: Synthesis - Объединение данных (если `existing_project == true` и есть design data)**

**ЕСЛИ `existing_project == true` И есть design raw data:**

**Создай unified picture:**
```markdown
CURRENT STATE (from code):
- Colors: [extracted colors]
- Typography: [extracted fonts]
- Components: [list of existing]
- Framework: [MUI/Ant/custom]

PLANNED CHANGES (from raw data):
- [Changes mentioned in chats/design files]

GAPS:
- [What's missing in code]
- [What needs documentation]
```

---

### ШАГ 2: Создание Design System Structure (30 минут)

**Создай `docs/design/`:**

```
docs/design/
├── 00_DESIGN_SYSTEM.md           # Overview
├── foundation/
│   ├── colors.md
│   ├── typography.md
│   ├── spacing.md
│   ├── elevation.md
│   ├── motion.md
│   ├── iconography.md
│   └── principles.md
├── components/
│   └── [компоненты из design data или кода]
├── patterns/
│   └── [паттерны по необходимости]
├── content/
│   ├── voice-and-tone.md
│   ├── writing-guidelines.md
│   ├── error-messages.md
│   └── microcopy.md
├── accessibility/
│   ├── overview.md
│   ├── keyboard-navigation.md
│   ├── screen-readers.md
│   ├── color-contrast.md
│   └── testing.md
├── screens/
│   └── _SCREEN_TEMPLATE.md
└── resources/
    ├── figma-links.md
    ├── design-tokens.json
    └── changelog.md
```

**⚠️ Используй templates из:**
```
UPMT/structure-templates/design-templates/
```

---

### ШАГ 3: Заполнение Foundation (30-45 минут)

**ЕСЛИ `existing_project == false` (New Project):**

**colors.md:**
- Определи PRIMARY color (из мудбордов/чатов или предложи based on brand)
- Создай полную палитру (50-900 shades) **ИЛИ** используй стандартную из template
- Semantic colors (success, error, warning, info)
- Grays (50-900)
- **ПРОВЕРЬ accessibility:** Все тексты ≥4.5:1 контраст

**typography.md:**
- Font family (из design data или предложи Inter как default)
- Font sizes (display, h1-h4, body, small, caption)
- Font weights (400, 500, 600, 700)
- Line heights

**spacing.md, elevation.md, motion.md, iconography.md:**
- Используй стандартные значения из templates
- Адаптируй если есть специфические требования из design data

**principles.md:**
- Если в чатах/мудбордах упоминались principles → используй их
- Если нет → используй стандартные: Clarity, Consistency, Efficiency, Accessibility, Feedback, Delight

**ЕСЛИ `existing_project == true` (Existing Project):**

**⚡ CRITICAL DIFFERENCE:** Документируй ЧТО УЖЕ ЕСТЬ в коде!

**colors.md:**
```markdown
# COLORS

## Current Implementation (from code)

**Primary:**
- 500: #2196F3 (found in: theme.js, Button.styled.tsx)
- Usage: Buttons, links, active states

[Document ACTUAL colors from code]

## Planned Changes (from design data)
[If any changes discussed in raw data]
```

**typography.md:**
```markdown
# TYPOGRAPHY

## Current Implementation

Font Family: 
- Primary: 'Inter' (found in: global.css, App.tsx)

Font Sizes:
- h1: 32px (found in: Typography.tsx)
- body: 16px (found in: global.css)

[Document ACTUAL typography from code]
```

**spacing.md:**
```markdown
# SPACING

## Current Implementation (from code)

Spacing Scale:
- xs: 4px (found in: theme.js, common usage)
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

[Document ACTUAL spacing patterns from code]

## Planned Changes (from design data)
[If any changes discussed]
```

**elevation.md, motion.md, iconography.md:**
- Документируй ЧТО УЖЕ в коде (если есть shadows, transitions, icons)
- Используй стандартные значения из templates для недостающего
- Адаптируй если есть специфические требования из design data

---

### ШАГ 4: Components Documentation (30-60 минут)

**ЕСЛИ `existing_project == false` (New Project):**

**ЕСЛИ в design data упомянуты конкретные компоненты:**
- Создай `docs/design/components/[name].md` для каждого
- Используй `UPMT/structure-templates/_COMPONENT_TEMPLATE.md` как base
- Документируй на основе доступной информации

**ЕСЛИ конкретных компонентов нет:**
- Создай базовые: button.md, input.md, card.md
- Минимальная документация (anatomy, variants, states)
- Остальное заполнится по мере разработки

**ЕСЛИ `existing_project == true` (Existing Project):**

**Для КАЖДОГО существующего компонента:**

Создай `docs/design/components/[name].md`:

```markdown
# [COMPONENT NAME]

**Status:** ✅ IMPLEMENTED (in codebase)

**Location:** `src/components/[Name]/[Name].tsx`

**Variants:** [extracted from code/props]

**States:** [extracted from code]

**Props/API:** [from TypeScript interface or PropTypes]

## Gaps / TODO
- [ ] Missing variants
- [ ] Accessibility improvements

## Planned Changes
[From design raw data if any]
```

---

---

## 📋 ШАГИ 6-10: ТОЛЬКО ДЛЯ EXISTING PROJECTS

**⚠️ ВЫПОЛНЯЙ ТОЛЬКО ЕСЛИ `scenario.existing_project == true`**

**Проверка перед выполнением:**
1. Убедись что `existing_project == true` (из ШАГ 0.1)
2. Если `existing_project == false` → **SKIP ШАГИ 6-10**, переход к ШАГ 11
3. Если `existing_project == true` → **ВЫПОЛНЯЙ ШАГИ 6-10**

---

### ШАГ 6: Patterns - ЧТО ИСПОЛЬЗУЕТСЯ (30 минут)

**ТОЛЬКО ДЛЯ EXISTING PROJECTS**

Документируй СУЩЕСТВУЮЩИЕ patterns из кода:

**CLI:**
```bash
# Анализируй структуру кода
find ../src -type f -name "*.tsx" -o -name "*.jsx" | head -20
```

**Web (GitHub API):**
```bash
gh api /repos/{owner}/{repo}/contents/src
```

**Документируй в `docs/design/patterns/`:**

**Forms:**
- Как формы реализованы в коде (layout, validation patterns)
- Примеры из существующих компонентов

**Data Display:**
- Tables/cards/lists patterns из кода
- Примеры использования

**Navigation:**
- Sidebar/nav patterns из кода
- Структура навигации

**Feedback:**
- Toasts/modals/alerts из кода
- Как обрабатываются ошибки/успехи

**Layouts:**
- Layout patterns из кода
- Grid systems, containers

**Создай файлы:**
- `docs/design/patterns/forms.md`
- `docs/design/patterns/data-display.md`
- `docs/design/patterns/navigation.md`
- `docs/design/patterns/feedback.md`
- `docs/design/patterns/layouts.md`

---

### ШАГ 7: Content Guidelines - ТЕКУЩИЙ STYLE (20 минут)

**ТОЛЬКО ДЛЯ EXISTING PROJECTS**

Проанализируй existing UI text:

**CLI:**
```bash
# Извлеки текст из UI компонентов
grep -r "placeholder\|label\|title" ../src/components/ | head -30
```

**Web (GitHub API):**
```bash
# Читай UI компоненты через GitHub API
gh api /repos/{owner}/{repo}/contents/src/components
```

**Извлеки:**
- Button labels
- Error messages
- Help text
- Success messages
- Empty state messages

**Определи current voice & tone:**

**voice-and-tone.md:**
```markdown
# VOICE & TONE

## Current Voice (from existing UI)
- Characteristic 1: [based on UI text analysis]
- Characteristic 2: [based on UI text]
- Characteristic 3: [based on UI text]

## Examples from Current UI
- Success: "[actual success message from code]"
- Error: "[actual error message from code]"
- Empty state: "[actual empty state message]"
```

**Обнови `docs/design/content/voice-and-tone.md`** с анализом существующего текста.

---

### ШАГ 8: Accessibility - CURRENT STATE (15 минут)

**ТОЛЬКО ДЛЯ EXISTING PROJECTS**

Audit existing code:

**CLI:**
```bash
# Проверь ARIA labels
grep -r "aria-label\|aria-labelledby\|role=" ../src/components/ | head -20
```

**Web (GitHub API):**
```bash
# Читай компоненты через GitHub API
gh api /repos/{owner}/{repo}/contents/src/components/[Component].tsx
```

**Проверь:**
- ✅ ARIA labels present?
- ✅ Semantic HTML used?
- ✅ Keyboard navigation implemented?
- ✅ Color contrast (from extracted colors)

**accessibility/overview.md:**
```markdown
# ACCESSIBILITY

## Current State (from code audit)
- ✅ ARIA labels: [Found in X components]
- ⚠️ Semantic HTML: [Gaps in Y components]
- ❌ Keyboard nav: [Not implemented in Z components]

## Target: WCAG 2.1 AA Compliance

## Action Items
- [ ] Add ARIA labels to [components]
- [ ] Improve keyboard navigation in [components]
- [ ] Fix color contrast issues (see color-contrast.md)
```

**Обнови `docs/design/accessibility/overview.md`** с результатами аудита.

---

### ШАГ 9: User Research (если есть)

**ТОЛЬКО ДЛЯ EXISTING PROJECTS**

**ЕСЛИ в `UPMT/bootstrap/00_DESIGN_RAW_DATA/research/` есть файлы:**

**CLI:**
```bash
ls -la UPMT/bootstrap/00_DESIGN_RAW_DATA/research/
```

**Web (GitHub API):**
```bash
gh api /repos/{owner}/{repo}/contents/UPMT/bootstrap/00_DESIGN_RAW_DATA/research
```

**Создай:**
- `docs/design/user-research/personas.md` (из interview data)
- `docs/design/user-research/pain-points.md` (из research)
- `docs/design/user-research/journey-maps.md` (если упомянуты)

**ЕСЛИ research данных нет:**
- Создай templates как placeholders
- Заполнятся позже на основе реальных users

---

### ШАГ 10: Resources & Tokens - Извлечение из кода (15 минут)

**ТОЛЬКО ДЛЯ EXISTING PROJECTS**

**figma-links.md:**
- Добавь ссылки из `figma/figma-links.md` (если есть)
- Placeholder если нет

**design-tokens.json:**
- Экспортируй ИЗВЛЕЧЕННЫЕ colors, typography, spacing в JSON
- Формат:
  ```json
  {
    "colors": { 
      "primary": { "500": "#2196F3" },
      ...
    },
    "typography": { 
      "fontSize": { "h1": "32px", ... },
      ...
    },
    "spacing": { "xs": "4px", ... }
  }
  ```

**changelog.md:**
- Первая запись: "v1.0.0 - Design system documented from existing codebase"

---

## 📋 ШАГИ 11-13: ОБЩИЕ ДЛЯ ВСЕХ СЦЕНАРИЕВ

---

### ШАГ 11: Resources & Tokens (для New Projects) / Integration (для Existing)

**ЕСЛИ `existing_project == false` (New Project):**

**figma-links.md:**
- Добавь ссылки из `figma/figma-links.md` (если есть)
- Placeholder если нет

**design-tokens.json:**
- Экспортируй определенные colors, typography, spacing в JSON
- Формат:
  ```json
  {
    "colors": { "primary": { "500": "#..." }, ... },
    "typography": { "fontSize": { ... }, ... },
    "spacing": { ... }
  }
  ```

**changelog.md:**
- Первая запись: "v1.0.0 - Initial design system created during bootstrap"

**ЕСЛИ `existing_project == true` (Existing Project):**
- Этот шаг уже выполнен в ШАГ 10
- Переход к ШАГ 12

---

### ШАГ 12: Integration with Module Requirements (15 минут)

**ОБЩИЙ ДЛЯ ВСЕХ**

**⚠️ КРИТИЧНО: Обработка больших файлов**

**Используй `safe_read_file()` из адаптера для автоматической обработки больших файлов.**

**Алгоритм:**
1. Для каждого файла вызывай `safe_read_file(file_path)`
2. Если файл большой (>256KB или >25000 токенов) - функция автоматически прочитает по частям
3. Объедини все части перед анализом

**Обнови module requirements:**

**Прочитай `modules_list.md` перед обновлением!**

**Файлы для чтения:**
- `UPMT/bootstrap/00_RAW_DATA_TEMPLATE/modules_list.md` → `safe_read_file("UPMT/bootstrap/00_RAW_DATA_TEMPLATE/modules_list.md")` (CLI) или `safe_read_file_github(owner, repo, "UPMT/bootstrap/00_RAW_DATA_TEMPLATE/modules_list.md")` (Web)

**⚠️ ВАЖНО:** 
- НЕ ПРОПУСКАЙ файлы из-за размера
- Функция автоматически обработает большие файлы
- Детали алгоритма см. в `cli-adapter.md` / `web-adapter.md`

Для каждого модуля из `modules_list.md`:
- Найди `docs/requirements/[module_name]_requirements.md`
- Найди секцию "7. UI/UX REQUIREMENTS" (или создай если нет)
- Заполни **7.1 Design System Reference:**

```markdown
## 7. UI/UX REQUIREMENTS

### 7.1 Design System Reference
**Foundation:**
- Colors: See docs/design/foundation/colors.md [extracted from code - если existing]
- Typography: See docs/design/foundation/typography.md [extracted from code - если existing]
- Spacing: See docs/design/foundation/spacing.md [extracted from code - если existing]

**Design Files:**
- Figma: [Link if exists]
```

**Если existing project:**
- Заполни **7.2 Components Used** с references к реальным компонентам:
  ```markdown
  ### 7.2 Components Used
  - Button: `src/components/Button/Button.tsx` (docs/design/components/button.md)
  - Input: `src/components/Input/Input.tsx` (docs/design/components/input.md)
  ```

---

### ШАГ 13: Design Questions (5-10 минут)

**ОБЩИЙ ДЛЯ ВСЕХ**

**Задай 3-5 уточняющих вопросов пользователю:**

**Если `existing_project == false` (New Project):**
1. "Цветовая палитра: Я извлек [primary color] как основной. Подтверждаешь или хочешь изменить?"
2. "Font: Предлагаю [Inter/другой]. Согласен или есть предпочтения?"
3. "Visual style: Понял как [minimal/bold/playful]. Верно?"
4. "UI framework: Видел упоминание [MUI/Ant Design/custom]. Подтверждаешь выбор?"
5. "Accessibility: Target WCAG 2.1 AA compliance. Нужен AAA или AA достаточно?"

**Если `existing_project == true` (Existing Project):**
1. "Извлек [primary color] как основной цвет из кода. Это correct или планируются changes?"
2. "Нашел UI framework: [MUI/Ant Design/custom]. Будем менять?"
3. "Компоненты: [list extracted]. Missing какие-то?"
4. "Accessibility: Обнаружены gaps [list]. Priority для fixes?"
5. "Design data: [mention any contradictions between code and raw data]. Как резолвим?"

**Подожди ответов (если пользователь онлайн) ИЛИ продолжай с assumptions.**

---

### ШАГ 14: Finalize & Validate (10 минут)

**ОБЩИЙ ДЛЯ ВСЕХ**

**Проверь что создано:**

- [ ] `docs/design/00_DESIGN_SYSTEM.md` (overview заполнен)
- [ ] `docs/design/foundation/*` (7 файлов: colors, typography, spacing, elevation, motion, iconography, principles)
- [ ] `docs/design/components/` (ВСЕ существующие компоненты documented - если existing, или минимум 3 для new)
- [ ] `docs/design/content/*` (4 файла - current voice из кода если existing)
- [ ] `docs/design/accessibility/*` (5 файлов - current state audit если existing)
- [ ] `docs/design/patterns/*` (5 файлов - ТОЛЬКО если existing)
- [ ] `docs/design/resources/` (figma-links, design-tokens.json с извлеченными tokens, changelog)
- [ ] Module requirements section 7 обновлен (design system references)

**Залогируй:**

```markdown
✅ PHASE 5.5 COMPLETED:

**Design System:**
- ✅ Foundation (7 files)
- ✅ Components ([N] documented)
- ✅ Content guidelines
- ✅ Accessibility guidelines
- [Если existing] ✅ Code analysis complete
- [Если existing] ✅ Patterns documented
- [Если existing] ✅ Accessibility audit completed

**Module requirements updated:**
- [M] modules have design references

⏱️ PHASE 5.5 завершена за [время]
```

---

## 💾 CHECKPOINT

```bash
git add docs/design/
git add docs/requirements/ # обновлённые
git commit -m "docs(bootstrap): PHASE 5.5 complete - design system documented"
git push
```

**Показать итоги:**

```markdown
✅ PHASE 5.5 COMPLETE

**Design System:**
- ✅ Foundation (7 files)
- ✅ Components ([N] documented)
- ✅ Content guidelines
- ✅ Accessibility guidelines
- [Если existing] ✅ Code analysis complete

**Module requirements updated:**
- [M] modules have design references

**Next:** PHASE 5.7 - Backend Documentation (conditional)

⏱️ PHASE 5.5 завершена за [время]
```

---

## 🔄 СЛЕДУЮЩИЙ ШАГ

```
→ ПЕРЕХОД К PHASE 5.7: BACKEND DOCUMENTATION (conditional)
→ Прочитай: UPMT/prompts/phases/phase-5.7-backend.md
```

