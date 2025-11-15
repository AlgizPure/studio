# TECH STACK VERIFICATION PROMPT

**Дата проверки:** November 2025
**Проект:** Zenith Trainer - AI-Driven Fitness Platform

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

### Frontend Framework & Core

**Next.js:**
- Упомянутая версия: 15.5.6 (App Router, Turbopack)
- Актуальная версия (November 2025): ?
- Обновить до: ?
- Причина обновления: ?
- Breaking changes: ?

**React:**
- Упомянутая версия: 18.3.1 (Server Components)
- Актуальная версия (November 2025): ?
- Обновить до: ?
- Причина обновления: ?
- Breaking changes: ?

**TypeScript:**
- Упомянутая версия: 5.x (strict mode)
- Актуальная версия (November 2025): ?
- Обновить до: ?
- Причина обновления: ?

### Styling & UI

**Tailwind CSS:**
- Упомянутая версия: 3.x
- Актуальная версия (November 2025): ?
- Обновить до: ?
- Причина обновления: ?

**Radix UI:**
- Упомянутая версия: (multiple components installed)
- Актуальная версия (November 2025): ?
- Обновить до: ?
- Совместимость с React: ?

**next-themes:**
- Упомянутая версия: (для dark/light mode)
- Актуальная версия (November 2025): ?
- Обновить до: ?

**lucide-react:**
- Упомянутая версия: (для иконок)
- Актуальная версия (November 2025): ?
- Обновить до: ?

### Backend & Infrastructure

**Firebase:**
- Упомянутая версия: 11.9.1 (Auth, Firestore, Storage)
- Актуальная версия (November 2025): ?
- Обновить до: ?
- Причина обновления: ?
- Breaking changes: ?

**Genkit AI:**
- Упомянутая версия: 1.20.0
- Актуальная версия (November 2025): ?
- Обновить до: ?
- Причина обновления: ?
- Совместимость с Firebase: ?

**@genkit-ai/google-genai:**
- Упомянутая версия: (для Gemini API)
- Актуальная версия (November 2025): ?
- Обновить до: ?

### Data Handling & Validation

**Zod:**
- Упомянутая версия: (для ZTL DSL и validation)
- Актуальная версия (November 2025): ?
- Обновить до: ?
- Причина обновления: ?

**date-fns:**
- Упомянутая версия: (для date handling)
- Актуальная версия (November 2025): ?
- Обновить до: ?

**yaml:**
- Упомянутая версия: (для ZTL DSL parser)
- Актуальная версия (November 2025): ?
- Обновить до: ?

### UI Components & Interactions

**Recharts:**
- Упомянутая версия: 2.15.1 (для analytics charts)
- Актуальная версия (November 2025): ?
- Обновить до: ?
- Совместимость с React 18+: ?

**@dnd-kit/core & @dnd-kit/sortable:**
- Упомянутая версия: (для drag & drop)
- Актуальная версия (November 2025): ?
- Обновить до: ?
- Совместимость с React 18+: ?

### Development Tools

**ESLint:**
- Упомянутая версия: (configured)
- Актуальная версия (November 2025): ?
- Обновить до: ?
- Flat config migration: ?

**Playwright:**
- Упомянутая версия: (установлен, но тесты не написаны)
- Актуальная версия (November 2025): ?
- Обновить до: ?
- Причина обновления: ?

---

## ВОПРОСЫ

1. Есть ли технологии, которые устарели и требуют замены?
2. Есть ли несовместимости между версиями?
3. Какие breaking changes между текущими и рекомендуемыми версиями?
4. Есть ли более современные альтернативы упомянутым технологиям?
5. Какие технологии из стека требуют особого внимания?
6. **Особый вопрос:** Genkit AI 1.20.0 - актуальная версия для November 2025? Есть ли более стабильные версии?
7. **Next.js 15.5.6** - стабильная версия или есть newer patch/minor versions?
8. **Firebase 11.9.1** - актуальная SDK версия для November 2025?

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
- [обновление 1 - security/EOL/critical bugs]
- [обновление 2]

**Recommended updates:**
- [обновление 3 - new features/performance]
- [обновление 4]

**Nice to have:**
- [обновление 5 - minor improvements]

**Consider replacing:**
- [технология X] → [альтернатива Y] (причина)

**Keep as is:**
- [технологии, которые не требуют обновления]
```

---

## КОНТЕКСТ ПРОЕКТА

**Zenith Trainer** - AI-Driven Fitness Platform
- Next.js SPA с Firebase backend
- AI integration через Genkit + Gemini API
- Собственный DSL (ZTL) для тренировочных программ (YAML-based)
- 191 TypeScript файлов, 15 модулей
- MVP готовность: 65-70%
- TypeScript strict mode
- Production deployment: еще не решено

**Критичные требования:**
- Стабильность (проект близок к MVP)
- TypeScript strict mode compatibility
- Firebase SDK compatibility (критично для backend)
- Genkit AI compatibility (критично для AI features)
- Next.js 15 App Router (уже используется)

**Следующие этапы разработки:**
- Stage 4.2.2: Gemini AI Integration (автоматический анализ)
- Stage 4.3: Advanced Analytics (визуализации)
- Habit Tracker 2.0 (Stages 3-6)
- E2E тесты (Playwright)

---

## ОСОБЫЕ ЗАМЕЧАНИЯ

1. **Firebase 11.9.1** - проверить, актуальная ли версия для November 2025
2. **Genkit AI 1.20.0** - КРИТИЧНО: это недавняя технология, проверить стабильность и актуальность
3. **Next.js 15.5.6** - проверить, есть ли newer patch versions
4. **React 18.3.1** - проверить, вышла ли React 19 stable
5. **TypeScript 5.x** - проверить latest minor version

⚠️ **IMPORTANT:** Project is using cutting-edge tech (Next.js 15, Firebase 11, Genkit AI 1.20). Verify these are stable for production use in November 2025.
