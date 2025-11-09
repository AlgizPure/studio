### `02_PROJECT_STRUCTURE/CONTEXT_MEMORY/insights.md`


# PROJECT INSIGHTS & LEARNINGS

**Purpose:** Capture learnings, patterns, and wisdom gained during development  
**Review:** Weekly to extract patterns and improve processes

---

## 💡 INSIGHT TEMPLATE
## [Date]: [Insight Title]

**Category:** Technical / Process / Team / Product  
**Trigger:** [What caused this learning?]

**What Happened:**
[Describe the situation]

**What We Learned:**
[The key insight or learning]

**Why It Matters:**
[Impact and importance]

**Action Items:**
- [ ] [How to apply this learning]
- [ ] [Process changes to make]

**Related:**
- Decisions: DEC-XXX
- Documentation: [Links]

---

## 📚 INSIGHTS COLLECTION

### 🔧 TECHNICAL INSIGHTS

#### 2025-11-08: Drizzle ORM Migration Gotcha

**Category:** Technical  
**Trigger:** Production migration failed unexpectedly

**What Happened:**

Deployed new migration to production. Migration syntax worked fine in 
development (PostgreSQL 15) but failed in production (PostgreSQL 16).
Issue: Used column name as keyword in newer version.

Error: 
  syntax error at or near "user"
  
Cause:
  Column named 'user' conflicted with reserved keyword in PG16

**What We Learned:**
- Always test migrations against same PostgreSQL version as production
- Use migration dry-run feature before production
- Avoid reserved keywords in column names
- Check PostgreSQL version compatibility in CI

**Why It Matters:**
Production downtime for 15 minutes while rolling back and fixing.

**Action Items:**
- [x] Add PG16 to CI pipeline
- [x] Create pre-deploy migration checklist
- [x] Document reserved keywords to avoid
- [ ] Set up staging environment with same PG version

**Related:**
- Decision: DEC-001 (PostgreSQL choice)
- Documentation: `/docs/MIGRATIONS.md`

---

#### 2025-11-06: Redis Caching Dramatically Improved Performance

**Category:** Technical  
**Trigger:** API response times were slow (800ms average)

**What Happened:**

Dashboard endpoint was querying database for team tasks on every request.
With 10+ users, database was bottleneck.

Before Redis:
- Dashboard load: 800ms average
- Database queries: 5-8 per request
- CPU: 60% usage

After Redis (15min TTL):
- Dashboard load: 120ms average (6.6x faster!)
