
it('POST /api/users creates user', async () => {
  const res = await request(app)
    .post('/api/users')
    .send({ email: 'test@example.com' })
  
  expect(res.status).toBe(201)
  expect(res.body.data.email).toBe('test@example.com')
})

**E2E Testing:**

**Example:**

Tool: Playwright 1.40
Website: https://playwright.dev

Why We Chose This:
✓ Modern (better than Cypress)
✓ Cross-browser
✓ Fast and reliable
✓ Great debugging

Example:
import { test, expect } from '@playwright/test'

test('user can sign up', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Sign Up')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'SecurePass123!')
  await page.click('button:has-text("Create Account")')
  
  await expect(page).toHaveURL('/onboarding')
})

---

### Version Control

**Example:**

Tool: Git + GitHub
Repository: Private

Branching Strategy: GitHub Flow (simplified)
- main: Production
- develop: Staging (optional)
- feature/*: Features
- hotfix/*: Emergency fixes

Commit Convention: Conventional Commits
- feat: New feature
- fix: Bug fix
- docs: Documentation
- refactor: Code refactoring
- test: Tests
- chore: Maintenance

Example:
feat(auth): add password reset functionality

Implements FR-AUTH-006. Users can now request password
reset emails and create new passwords.

Closes #42

---

## 📊 PERFORMANCE TARGETS

### Frontend

Lighthouse Score: >90 (all metrics)
First Contentful Paint: <1.5s
Time to Interactive: <3.5s
Largest Contentful Paint: <2.5s
Cumulative Layout Shift: <0.1
Bundle Size: <300KB (gzipped)

### Backend

API Response Time: <200ms (p95)
Database Query Time: <50ms (p95)
Throughput: 100 req/sec (target)
Error Rate: <0.1%
Uptime: 99.9%

### Database

Query Performance: <50ms (p95)
Connection Pool: 10-20 connections
Backups: Daily (7 days retention)
Replication: Optional (when needed)

---

## 💰 COST BREAKDOWN

### Monthly Costs (Estimated)

| Service | Tier | Cost | Notes |
|---------|------|------|-------|
| [Service 1] | [Tier] | $X | [Notes] |
| [Service 2] | [Tier] | $X | [Notes] |
| **TOTAL** | | **$XXX** | |

**Example:**
| Service | Tier | Cost | Notes |
|---------|------|------|-------|
| Vercel | Pro | $20 | Frontend hosting |
| Railway | Pro | $30 | Backend + DB + Redis |
| SendGrid | Free | $0 | 100 emails/day (enough for MVP) |
| AWS S3 | Pay-as-go | $7 | Storage + bandwidth |
| Sentry | Developer | $26 | Error tracking |
| Mixpanel | Free | $0 | <100k events |
| Domain | Yearly | $1 | $12/year ÷ 12 |
| **TOTAL** | | **$84/month** | MVP costs |

**Scaling Costs (100k users):**
- Railway: ~$150/month (more resources)
- SendGrid: $20/month (40k emails)
- S3: ~$50/month (more storage)
- Estimated: **~$300/month**

---

## 🔄 TECH STACK EVOLUTION

### Future Considerations

**When We Reach 10k Users:**
- [ ] Consider Redis caching layer
- [ ] Add CDN for API (CloudFlare)
- [ ] Scale database (read replicas)

**When We Reach 100k Users:**
- [ ] Microservices architecture (if needed)
- [ ] Dedicated monitoring (Datadog)
- [ ] Advanced analytics (PostHog)
- [ ] Load balancing

**Technical Debt to Address:**
- [ ] [Item 1]: [When to address]
- [ ] [Item 2]: [When to address]

---

## ✅ VERIFICATION STATUS

### Last Verification: [Date]

**Verification Checklist:**
- [ ] All versions current?
- [ ] All dependencies security-scanned?
- [ ] All services operational?
- [ ] All costs within budget?
- [ ] All alternatives reconsidered?

**Verification Process:**
1. Generated verification prompt (see `/verification/`)
2. Claude.ai researched current state (Nov 2025)
3. Recommendations reviewed and approved
4. Stack updated and documented
5. Migration plans created (if needed)

**Next Verification:** [Date + 6 months]

---

## 📚 REFERENCES

### Official Documentation

- React: https://react.dev
- Node.js: https://nodejs.org/docs
- PostgreSQL: https://www.postgresql.org/docs
- [Add all others...]

### Internal Resources

- Architecture: See `ARCHITECTURE.md`
- Development Setup: See `/docs/SETUP.md`
- Deployment Guide: See `/docs/DEPLOY.md`

### Learning Resources

- [Technology 1]: [Course/book/video]
- [Technology 2]: [Course/book/video]

---

## 🔄 CHANGE LOG

| Version | Date | Changes | Reason |
|---------|------|---------|--------|
| 1.0 | [Date] | Initial stack | Bootstrap + verification |
| 1.1 | [Date] | Added Redis | Caching needed |
| 1.2 | [Date] | Upgraded React 18→19 | Performance improvements |

---

**Related Documents:**
- Architecture: `ARCHITECTURE.md`
- Infrastructure setup: `/docs/INFRASTRUCTURE.md`
- Security: `/docs/SECURITY.md`


---

**(Продолжу с ARCHITECTURE.md и остальными файлами в следующем сообщении)**


You (08.11.2025, 09:51:04)
========================================

продолжай


Claude (08.11.2025, 09:54:02)
========================================

# 📦 ПРОДОЛЖАЮ - ARCHITECTURE И ОСТАЛЬНЫЕ ШАБЛОНЫ

---

## 5️⃣ ARCHITECTURE.md

### `02_PROJECT_STRUCTURE/PROJECT_CORE/04_ARCHITECTURE.md`


# SYSTEM ARCHITECTURE

**Version:** 1.0  
**Last Updated:** [YYYY-MM-DD]  
**Status:** Template - Fill during bootstrap

---

## 🎯 ARCHITECTURE OVERVIEW

### High-Level Architecture

┌─────────────────────────────────────────────────────────┐
│                        CLIENT                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Browser    │  │    Mobile    │  │   Desktop    │ │
│  │  (React SPA) │  │  (Future)    │  │  (Future)    │ │
│  └──────┬───────┘  └──────────────┘  └──────────────┘ │
└─────────┼───────────────────────────────────────────────┘
          │ HTTPS / REST API
          ▼
┌─────────────────────────────────────────────────────────┐
│                    API GATEWAY / CDN                    │
│                  (Vercel Edge Network)                  │
└─────────────────────┬───────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                      │
│  ┌────────────────────────────────────────────────┐    │
│  │         Node.js (Fastify) Backend              │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐    │    │
│  │  │   API    │  │ Business │  │   Auth   │    │    │
│  │  │ Routes   │  │  Logic   │  │ Service  │    │    │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘    │    │
│  └───────┼─────────────┼─────────────┼───────────┘    │
└──────────┼─────────────┼─────────────┼────────────────┘
           │             │             │
           ▼             ▼             ▼
┌─────────────────────────────────────────────────────────┐
│                     DATA LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  PostgreSQL  │  │    Redis     │  │   AWS S3     │ │
│  │  (Primary)   │  │   (Cache)    │  │  (Storage)   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘

---

## 🏗️ ARCHITECTURE PATTERN

### Chosen Pattern: Layered Architecture (MVC-inspired)

**Why This Pattern:**
- ✅ Simple to understand and maintain
- ✅ Clear separation of concerns
- ✅ Suitable for MVP and future scaling
- ✅ Team familiar with pattern
- ✅ Easy to test each layer

**Structure:**

┌─────────────────────────────────────────┐
│         PRESENTATION LAYER              │
│  (Controllers / Route Handlers)         │
│  • Parse HTTP requests                  │
│  • Validate input                       │
│  • Call business logic                  │
│  • Format HTTP responses                │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         BUSINESS LOGIC LAYER            │
│  (Services)                             │
│  • Core business rules                  │
│  • Data transformation                  │
│  • Orchestration                        │
│  • No HTTP/DB knowledge                 │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         DATA ACCESS LAYER               │
│  (Repositories / Models)                │
│  • Database queries                     │
│  • Data mapping                         │
│  • Cache management                     │
│  • No business logic                    │
└─────────────────────────────────────────┘

**Example Implementation:**
typescript
// LAYER 1: Controller (Presentation)
// File: src/controllers/userController.ts

import { FastifyRequest, FastifyReply } from 'fastify'
import { userService } from '../services/userService'
import { CreateUserSchema } from '../schemas/userSchema'

export async function createUser(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // 1. Parse & validate input
    const userData = CreateUserSchema.parse(request.body)
    
    // 2. Call business logic (no business logic in controller!)
    const user = await userService.createUser(userData)
    
    // 3. Format response
    return reply.status(201).send({
      success: true,
      data: user
    })
  } catch (error) {
    // 4. Handle errors
    if (error.code === 'DUPLICATE_EMAIL') {
      return reply.status(409).send({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'Email already registered'
        }
      })
    }
    throw error
  }
}

// LAYER 2: Service (Business Logic)
// File: src/services/userService.ts

import { userRepository } from '../repositories/userRepository'
import { hashPassword } from '../utils/crypto'
import { sendWelcomeEmail } from '../services/emailService'

export const userService = {
  async createUser(data: CreateUserInput) {
    // 1. Check business rules
    const existingUser = await userRepository.findByEmail(data.email)
    if (existingUser) {
      throw new Error('DUPLICATE_EMAIL')
    }
    
    // 2. Transform data (business logic)
    const hashedPassword = await hashPassword(data.password)
    
    // 3. Persist data (via repository)
    const user = await userRepository.create({
      email: data.email,
      password: hashedPassword,
      name: data.name
    })
    
    // 4. Side effects
    await sendWelcomeEmail(user.email)
    
    // 5. Return domain object (no DB details)
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    }
  }
}

// LAYER 3: Repository (Data Access)
// File: src/repositories/userRepository.ts

import { db } from '../database'
import { users } from '../database/schema'
import { eq } from 'drizzle-orm'

export const userRepository = {
  async create(data: CreateUserData) {
    // Pure database operation, no business logic
    const [user] = await db.insert(users).values(data).returning()
    return user
  },
  
  async findByEmail(email: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
    return user || null
  },
  
  async findById(id: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
    return user || null
  }
}

**Key Principles:**

1. **Controllers:**
   - Handle HTTP concerns only
   - No business logic
   - Thin layer

2. **Services:**
   - All business logic here
   - No HTTP knowledge
   - No direct DB access
   - Orchestrate repositories

3. **Repositories:**
   - Database queries only
   - No business logic
   - Return plain objects

---

## 🚀 BOOTSTRAP PROCESS

Детальное описание процесса bootstrap и как работает система auto-fill.

### Начальный Промпт

**Все начинается с:** `@01_BOOTSTRAP_CONFIG/BOOTSTRAP_START_PROMPT.md`

Этот файл содержит 4 готовых промпта для разных сценариев:
- **Сценарий 1:** CLI + Новый проект (только raw data)
- **Сценарий 2:** CLI + Существующий проект (raw data + код)
- **Сценарий 3:** Web (GitHub) + Новый проект
- **Сценарий 4:** Web (GitHub) + Существующий проект

### Последовательность Фаз

**PHASE 1: ANALYSIS (1-2 hours, autonomous)**
- Reading raw data (`@00_RAW_DATA_TEMPLATE/`)
- Extracting key information
- Detecting contradictions
- Analyzing existing code (if applicable)

**PHASE 2: INTERVIEW (30-60 min, interactive)**
- Auto-fill metadata.yaml
- Ask 5-10 clarifying questions
- Resolve contradictions
- Fill information gaps

**PHASE 3: TECH STACK VERIFICATION (45-60 min)**
- Extract tech mentions from raw data
- Generate verification prompt
- User runs in Claude.ai (web search)
- Process analysis and recommend updates (November 2025)

**PHASE 4: SYNTHESIS (15 min, autonomous)**
- Combine all data sources
- Create unified project view

**PHASE 5: DOCUMENTATION GENERATION (2-4 hours, autonomous)**

**Строгий порядок заполнения файлов:**

```
1. @02_PROJECT_STRUCTURE/PROJECT_CORE/ (по номерам):
   00_PROJECT_ESSENCE.md  → Видение, цели, аудитория
   01_PRD.md              → Требования, user stories
   02_ROADMAP.md          → Фазы, timeline
   03_TECH_STACK.md       → Технологии (верифицированные)
   04_ARCHITECTURE.md     → Архитектура системы
   
2. @02_PROJECT_STRUCTURE/MODULES_REQUIREMENTS/:
   Создать [module]_requirements.md для каждого модуля
   
3. @02_PROJECT_STRUCTURE/CONTEXT_MEMORY/:
   state.md      → Текущее состояние (Phase: Planning)
   decisions.md  → Залогировать все принятые решения
   insights.md   → Ключевые инсайты из анализа
   
4. @02_PROJECT_STRUCTURE/PROGRESS_TRACKING/:
   modules_status.md  → Статус модулей (0% для нового)
   sprint_current.md  → Планирование первого спринта
   backlog.md         → Приоритизированный backlog
   
5. @02_PROJECT_STRUCTURE/AI_INSTRUCTIONS/ (при необходимости):
   Корректировка .cursorrules/.clauderules под проект
```

**PHASE 6: FINAL SETUP INSTRUCTIONS (15 min, autonomous)**
- Generate `@01_BOOTSTRAP_CONFIG/FINAL_SETUP_INSTRUCTIONS.md`
- Инструкции по настройке Cursor
- Инструкции по настройке Claude Code
- Правила обновления при изменениях

**PHASE 7: VALIDATION & REPORT (15 min, autonomous)**
- Self-check completeness
- Generate `BOOTSTRAP_REPORT.md`
- Create `REVIEW_CHECKLIST.md`

### После Bootstrap

**Обязательно прочитать и выполнить:**
→ `@01_BOOTSTRAP_CONFIG/FINAL_SETUP_INSTRUCTIONS.md`

Это критически важно для:
- Настройки Cursor project rules
- Активации AI ассистентов
- Правильной работы системы

**Дополнительные ресурсы:**
- `@01_BOOTSTRAP_CONFIG/BOOTSTRAP_CHECKLIST.md` - Чеклист для самопроверки
- `@01_BOOTSTRAP_CONFIG/BOOTSTRAP_FLOW_DIAGRAM.md` - Визуальная диаграмма процесса
- `@WORKFLOW_GUIDE.md` - Ежедневные рабочие процессы
- `@UPDATE_RULES.md` - Правила обновления документации

### Автоматические Возможности

**AUTO-FILL метаданных:**
- Claude Code читает все raw data
- Извлекает информацию автоматически
- Заполняет metadata.yaml без ручной работы

**Tech Stack Verification:**
- Проверка актуальности технологий (2025)
- Рекомендации по обновлению
- Анализ fit с требованиями проекта

**Existing Code Analysis:**
- Автоматическое обнаружение кода
- Анализ реализованных фич
- Обнаружение устаревших зависимостей
- Рекомендации по модернизации

---

## 📁 PROJECT STRUCTURE

### Backend Structure

backend/
├── src/
│   ├── controllers/           # HTTP layer
