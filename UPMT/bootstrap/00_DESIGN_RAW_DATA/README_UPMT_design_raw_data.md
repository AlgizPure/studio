# DESIGN RAW DATA

**"Входящие" для дизайн-материалов**

Эта папка предназначена для сбора всех исходных материалов, связанных с UI/UX дизайном вашего проекта.

---

## 📂 СТРУКТУРА

### chats/
**Что класть:** Чаты с AI про UI/UX (ChatGPT, Claude, Gemini)

**Примеры:**
- Обсуждения UI layout
- Вопросы про компоненты
- Дискуссии про цветовую палитру
- UX flow обсуждения

**Формат:** `.txt`, `.md`, `.pdf`

---

### moodboards/
**Что класть:** Визуальные мудборды + файлы с комментариями

**Примеры:**
- `moodboard-v1.png` + `moodboard-v1-notes.md`
- Pinterest boards (screenshot + описание)
- Dribbble collections
- Визуальное направление проекта

**Формат:** `.png`, `.jpg`, `.pdf` + `.md` (комментарии)

**Совет:** К каждому мудборду создавай файл `[name]-notes.md` с объяснением что и почему.

---

### screenshots/
**Что класть:** Скриншоты продуктов-вдохновений + notes

**Примеры:**
- Скриншоты конкурентов
- Вдохновляющие UI (Linear, Notion, Figma...)
- Примеры паттернов (как другие решают похожие задачи)
- `notes.md` с общими комментариями

**Формат:** `.png`, `.jpg` + `notes.md`

**Совет:** Называй файлы описательно: `linear-dashboard.png`, `notion-sidebar.png`

---

### figma/
**Что класть:** Всё из Figma

**Примеры:**
- Экспорты компонентов
- Экспорты экранов
- Design specs (PDF)
- `figma-links.md` - ссылки на Figma files/prototypes

**Формат:** `.png`, `.jpg`, `.pdf`, `.md`

**Совет:** Если используешь Figma, храни здесь экспорты + ссылки на live files.

---

### research/
**Что класть:** ВСЁ про UX research (без подпапок, префикс в имени файла)

**Примеры:**
- `interview-001.md` - интервью с пользователем #1
- `interview-002-notes.md` - заметки с интервью #2
- `survey-results-2025-01.csv` - результаты опроса
- `usability-test-01-notes.md` - наблюдения с usability теста
- `heatmaps.png` - тепловые карты
- `analytics-data.csv` - данные аналитики

**Формат:** `.md`, `.csv`, `.png`, `.pdf`

**Принцип:** Префикс в имени = категория (`interview-`, `survey-`, `test-`, `analytics-`)

---

### brand/
**Что класть:** Брендинг (если есть)

**Примеры:**
- Логотипы (все варианты)
- Brand guidelines (PDF)
- Color palettes
- Typography choices
- Brand assets

**Формат:** `.png`, `.svg`, `.pdf`

**Совет:** Если бренда еще нет - пропусти эту папку.

---

## 🚀 МИНИМУМ ДЛЯ BOOTSTRAP

**Нужен хотя бы 1 из:**
- ✅ 1 design chat ИЛИ
- ✅ 1 moodboard ИЛИ
- ✅ Figma exports

**Плюс:** 2-3 screenshot-референса

**Этого достаточно** для запуска design bootstrap!

---

## 💡 WORKFLOW

### 1. Сбор Материалов

Собери всё что есть про дизайн:
```
✓ Чаты с AI → chats/
✓ Мудборды → moodboards/
✓ Скриншоты → screenshots/
✓ Figma → figma/
✓ Research → research/
✓ Брендинг → brand/
```

### 2. Заполнение Metadata (опционально)

Заполни `design-metadata.yaml` если хочешь:
- Ключевые design decisions
- Известные противоречия
- Вопросы для разрешения

**Или:** Оставь пустым, Claude заполнит автоматически.

### 3. Чеклист

Проверь `COLLECTION_CHECKLIST.md` - собрал ли всё нужное?

### 4. Bootstrap

Запусти bootstrap → Claude Code:
- Прочитает все design raw data
- Создаст `docs/design/` структуру
- Задокументирует design system
- Задаст 3-5 уточняющих вопросов

---

## 📊 ЧТО ПРОИСХОДИТ ВО ВРЕМЯ BOOTSTRAP?

Claude Code автоматически:

**1. Анализирует данные:**
- Читает все чаты про UI/UX
- Анализирует мудборды
- Изучает screenshots референсов
- Смотрит Figma exports

**2. Извлекает design decisions:**
- Цветовая палитра
- Типография
- Визуальный стиль
- Компоненты
- Design principles

**3. Создаёт docs/design/:**
```
docs/design/
├── 00_DESIGN_SYSTEM.md      # Overview
├── foundation/               # Tokens (colors, typography...)
├── components/               # Компоненты (button, input...)
├── patterns/                 # Design patterns
├── accessibility/            # A11y guidelines
├── user-research/            # Research artifacts
└── resources/                # Figma links, tokens
```

**4. Задаёт вопросы:**
- Если есть противоречия
- Если неясен финальный выбор
- Если отсутствуют критичные данные

---

## ⚠️ ВАЖНО

### Для Существующих Проектов

Если у тебя **уже есть код**, Claude также:
- Проанализирует существующий CSS/styles
- Извлечёт цвета, шрифты, spacing
- Задокументирует существующие компоненты
- Объединит с design raw data

**Итог:** Документация того что УЖЕ есть + что ПЛАНИРУЕТСЯ.

---

## 📝 ПРИМЕРЫ

В каждой папке есть `_example-*` файлы - посмотри их для понимания формата.

---

## ❓ FAQ

**Q: Можно ли использовать только screenshots без чатов?**
A: Да! Любые материалы помогают. Claude адаптируется к тому что есть.

**Q: Обязательно ли заполнять design-metadata.yaml?**
A: Нет. Claude заполнит автоматически, анализируя raw data.

**Q: Что если у меня только идея в голове, без материалов?**
A: Проведи 1-2 чата с AI (ChatGPT/Claude) про UI/UX → сохрани в `chats/`.

**Q: Нужна ли мне эта папка если дизайн не важен?**
A: Нет. Можешь пропустить. Bootstrap сгенерирует базовую структуру без неё.

---

## ✨ ГОТОВ?

1. ✅ Собрал материалы в папки выше
2. ✅ Проверил чеклист (COLLECTION_CHECKLIST.md)
3. ✅ Запускай bootstrap!

Claude Code сделает остальное. 🚀

---

**Made with ❤️ for designers and developers who love structure**

