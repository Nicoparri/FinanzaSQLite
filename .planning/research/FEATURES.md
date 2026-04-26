# Feature Research

**Domain:** Personal finance iOS app -- academic demo for mobile databases (CBD course)
**Researched:** 2026-04-06
**Confidence:** HIGH

## Feature Landscape

The guiding principle: every feature must map to a database concept the professor evaluates. Features that exist purely for UX polish or "real app" completeness are waste in a 30-hour, 11-hour-implementation academic project. The "user" is the professor grading the paper, not a consumer in the App Store.

### Table Stakes (Required to Demonstrate DB Concepts)

Features the academic paper cannot succeed without. Each maps directly to a SQLite capability the professor evaluates based on the CBD course syllabus (07-BDMoOviles.v.1.0.pdf).

| Feature | DB Concept Demonstrated | Complexity | Implementation Notes |
|---------|------------------------|------------|----------------------|
| **Account management (CRUD)** | Basic relational schema, PRIMARY KEY, NOT NULL constraints | LOW | 1-2 accounts (e.g., "Checking", "Savings"). Simple list view + add form. No need for editing/archiving -- just INSERT and SELECT. |
| **Category management with DELETE** | Referential integrity (FOREIGN KEY, ON DELETE CASCADE vs RESTRICT) | LOW | Predefined seed categories + user can add/delete. Deleting a category demonstrates CASCADE or RESTRICT behavior. PRAGMA foreign_keys = ON mandatory. |
| **Transaction recording (income/expense)** | ACID transactions (BEGIN/COMMIT/ROLLBACK), INSERT with FK references | MEDIUM | Core of the app. Each transaction references an account and a category. Wrap inserts in explicit transactions. Show atomicity by inserting transaction + updating account balance in one atomic operation. |
| **Monthly spending report by category** | Aggregate queries: SUM(), GROUP BY, HAVING | MEDIUM | SELECT category_name, SUM(amount) FROM transactions JOIN categories GROUP BY category_id WHERE month = X. Display as a simple list or basic chart. The SQL query itself is the deliverable, not the chart. |
| **Budget creation per category** | Table design, CHECK constraints (amount > 0) | LOW | Simple table: budget(id, category_id FK, month, amount_limit). User sets a monthly limit for a category. |
| **Auto-update budget remaining on expense** | Triggers (CREATE TRIGGER AFTER INSERT ON transactions) | MEDIUM | The flagship DB feature. Trigger fires after each expense insert, recalculates remaining = limit - SUM(expenses). Demonstrate with AFTER INSERT and AFTER DELETE triggers. |
| **Balance display per account** | Computed values via SQL (SUM of transactions per account) | LOW | SELECT SUM(CASE WHEN type='income' THEN amount ELSE -amount END) FROM transactions WHERE account_id = ?. Pure SQL computation, not JS-side. |
| **Database initialization with schema** | DDL: CREATE TABLE IF NOT EXISTS, PRAGMA, CREATE TRIGGER, CREATE INDEX | LOW | All schema creation in a single openDatabaseAsync callback. Demonstrates full DDL lifecycle. |

### Differentiators (Low-Cost Academic Extras)

Features that enhance the paper's rigor without adding significant implementation time. The professor will notice these as evidence of deeper SQLite understanding.

| Feature | Value Proposition | Complexity | Implementation Notes |
|---------|-------------------|------------|----------------------|
| **CHECK constraints on amounts** | Demonstrates domain integrity beyond FK constraints (e.g., amount > 0, type IN ('income','expense')) | LOW | Add CHECK clauses to CREATE TABLE. Zero UI work, pure DDL. Mention in paper as "constraint-based validation at DB layer vs app layer." |
| **Indexes on frequently queried columns** | Demonstrates query optimization awareness (CREATE INDEX on transactions.date, transactions.category_id) | LOW | 2-3 CREATE INDEX statements in schema init. Optionally measure query time with/without indexes for the paper's Results section. |
| **SQL VIEW for monthly summary** | Demonstrates CREATE VIEW as reusable query abstraction | LOW | CREATE VIEW monthly_summary AS SELECT ... GROUP BY month, category. Then SELECT * FROM monthly_summary in the app. Shows the professor you know views exist. |
| **Seed data generator** | Enables performance testing with realistic volume (100-1000 transactions) | LOW | A "Generate test data" button that inserts N random transactions in a loop. Essential for the Results section where you measure query performance. |
| **EXPLAIN QUERY PLAN output** | Demonstrates awareness of query execution analysis | LOW | Run EXPLAIN QUERY PLAN on the aggregate query and include the output in the paper. Shows optimizer awareness. No UI needed. |
| **Transaction rollback demo** | Demonstrates the "A" in ACID -- deliberate failure mid-transaction | LOW | A test scenario where you BEGIN, insert, then ROLLBACK. Show that the insert was reverted. Include as a "test" in the paper. |
| **Date-based filtering** | Demonstrates WHERE clauses with date functions (strftime) | LOW | Filter transactions by current month. Uses SQLite's strftime('%Y-%m', date) for grouping. |
| **Multiple ON DELETE strategies** | Shows both CASCADE and RESTRICT on different FK relationships | LOW | Use CASCADE for category->transactions and RESTRICT for account->transactions. Paper discusses tradeoffs of each strategy. |

### Anti-Features (Out of Scope -- Scope Creep for 30h)

Features that seem useful but do NOT map to graded DB concepts and would consume precious implementation hours.

| Feature | Why It Seems Needed | Why It Is Waste | Alternative |
|---------|---------------------|-----------------|-------------|
| **User authentication / login** | "Real apps have login" | No DB concept demonstrated. The app runs locally on one device. Auth adds 3-5h of implementation for zero academic value. | Mention in paper as "future work: multi-user support would require auth." |
| **Cloud sync / backup** | "What if the phone is lost?" | Project is explicitly offline-first to isolate SGBD metrics. Sync adds networking complexity that obscures DB performance measurement. | Mention in Conclusions as a limitation and future line of research. |
| **SQLCipher encryption** | Listed in CLAUDE.md as possible | SQLCipher requires a custom native build, breaks Expo Go workflow, adds 4-6h of configuration. Theoretical mention in the paper is sufficient per project spec. | Discuss encryption theoretically in Estado del Arte. Add a sentence: "Implementation deferred due to scope constraints." |
| **Beautiful charts / data visualization** | "Reports need charts" | The academic deliverable is the SQL query, not the chart. A FlatList showing "Food: 450 EUR" proves SUM/GROUP BY works just as well as a pie chart. Charts add 2-3h (library selection, configuration, styling). | Use a simple table/list to display aggregate results. If time permits at the end, add victory-native or react-native-chart-kit, but never prioritize this over DB features. |
| **Recurring transactions** | "Real finance apps have subscriptions" | Requires a scheduling mechanism (background tasks, cron-like logic) that is an app-layer feature, not a DB feature. Adds 3-4h for minimal academic return. | Out of scope. Mention as future work. |
| **Multi-currency support** | "What about EUR/USD?" | Adds exchange rate complexity (another table, API calls or manual rates, conversion logic). No new DB concept demonstrated beyond what single-currency already shows. | Hardcode a single currency (EUR). |
| **Export to CSV/PDF** | "Users want to export data" | File I/O feature, not a DB feature. 2-3h for zero academic points. | Out of scope. |
| **Push notifications / reminders** | "Remind me to log expenses" | OS-level feature, not DB-related. | Out of scope entirely. |
| **Dark mode / theming** | "Modern apps have dark mode" | Pure UI concern. Zero DB relevance. | Use Expo's default theme. Do not spend time on styling beyond functional readability. |
| **Onboarding / tutorial screens** | "Guide the user" | UX concern only. The "user" is the professor watching a demo. | Skip entirely. |
| **Pagination / infinite scroll** | "What about large datasets?" | With the seed data generator (differentiator above), you demonstrate performance. Pagination is an app-layer optimization, not a DB concept. | Use simple FlatList with all results. If performance is an issue, add LIMIT/OFFSET and mention it in the paper. |
| **Drizzle ORM** | "Modern apps use ORMs" | The academic goal is to demonstrate raw SQL capabilities (triggers, PRAGMAs, aggregate queries). An ORM abstracts away the exact features being evaluated. It hides the SQL the professor needs to see. | Use raw expo-sqlite API (execAsync, runAsync, getAllAsync). Show the SQL statements explicitly in the paper. |

## Feature Dependencies

```
[Database Schema Initialization]
    |
    +---> [Account Management CRUD]
    |         |
    |         +---> [Transaction Recording]
    |                   |
    |                   +---> [Monthly Spending Report (SUM/GROUP BY)]
    |                   +---> [Balance Display per Account]
    |                   +---> [Budget Auto-Update Trigger fires]
    |
    +---> [Category Management with DELETE]
    |         |
    |         +---> [Transaction Recording] (FK dependency)
    |         +---> [Referential Integrity Demo (CASCADE/RESTRICT)]
    |
    +---> [Budget Creation per Category]
              |
              +---> [Budget Auto-Update Trigger]
```

### Dependency Notes

- **Transaction Recording requires Account + Category:** A transaction references both via FK. Accounts and categories must exist first.
- **Monthly Report requires Transactions:** Cannot demonstrate SUM/GROUP BY without data in the transactions table.
- **Trigger requires Budget + Transaction tables:** The trigger fires on transactions INSERT and updates the budgets table. Both must be initialized.
- **Seed Data Generator requires full schema:** It inserts across all tables, so it depends on everything else being in place.
- **Referential Integrity Demo requires Category with child Transactions:** You need to have transactions linked to a category, then try to delete that category to demonstrate CASCADE or RESTRICT.

## MVP Definition

### Core MVP (11 hours of implementation)

The minimum set of features that demonstrates ALL four required DB concepts (ACID, aggregation, triggers, referential integrity).

- [x] **Database schema initialization** -- CREATE TABLE, PRAGMA foreign_keys, CREATE TRIGGER, CREATE INDEX (~1.5h)
- [x] **Account CRUD** -- Basic list + add form. Demonstrates relational schema. (~1h)
- [x] **Category CRUD with delete** -- Add/remove categories. Demonstrates FK CASCADE/RESTRICT. (~1h)
- [x] **Transaction recording** -- Income/expense form with account + category selection. Wrapped in BEGIN/COMMIT. Demonstrates ACID. (~2.5h)
- [x] **Budget per category** -- Set monthly limit. Simple form. (~1h)
- [x] **Trigger: auto-update budget on expense** -- AFTER INSERT trigger recalculates remaining. Demonstrates triggers. (~1h)
- [x] **Monthly report screen** -- SUM/GROUP BY query displayed in a FlatList. Demonstrates aggregate queries. (~1.5h)
- [x] **Seed data generator** -- "Insert 100 test transactions" button for Results section metrics. (~0.5h)

**Total estimated: ~10 hours** (1 hour buffer for debugging/integration)

### Add If Time Permits (last 1-2 hours)

Features to add only if the core MVP is complete and stable.

- [ ] **CHECK constraints** -- Add to schema, mention in paper (~15 min)
- [ ] **CREATE VIEW for monthly summary** -- Add to schema, use in report query (~20 min)
- [ ] **Transaction rollback demo** -- Test screen or button that shows ROLLBACK behavior (~30 min)
- [ ] **EXPLAIN QUERY PLAN** -- Run in code, capture output for paper (~15 min)
- [ ] **Basic index performance comparison** -- Time a query with/without index, include in Results (~30 min)

### Explicitly Deferred (Never Build)

Features listed in Anti-Features above. Do NOT build these even if there is spare time. Spend remaining time improving the paper instead.

- [ ] Authentication -- future work
- [ ] Cloud sync -- future work
- [ ] SQLCipher -- theoretical mention only
- [ ] Charts -- use FlatList tables instead
- [ ] Recurring transactions -- future work
- [ ] Multi-currency -- hardcode EUR
- [ ] Export -- out of scope

## Feature Prioritization Matrix

| Feature | Academic Value | Implementation Cost | Priority |
|---------|---------------|---------------------|----------|
| Database schema initialization (DDL) | HIGH | LOW | P1 |
| Transaction recording (ACID) | HIGH | MEDIUM | P1 |
| Monthly report (SUM/GROUP BY) | HIGH | MEDIUM | P1 |
| Trigger: budget auto-update | HIGH | MEDIUM | P1 |
| Category delete (CASCADE/RESTRICT) | HIGH | LOW | P1 |
| Account CRUD | MEDIUM | LOW | P1 |
| Budget creation | MEDIUM | LOW | P1 |
| Seed data generator | MEDIUM | LOW | P1 |
| CHECK constraints | MEDIUM | LOW | P2 |
| CREATE INDEX + performance test | MEDIUM | LOW | P2 |
| CREATE VIEW | LOW | LOW | P2 |
| Transaction rollback demo | MEDIUM | LOW | P2 |
| EXPLAIN QUERY PLAN | LOW | LOW | P2 |
| Charts / data visualization | LOW | MEDIUM | P3 (never) |
| User authentication | LOW | HIGH | P3 (never) |
| Cloud sync | LOW | HIGH | P3 (never) |
| SQLCipher encryption | LOW | HIGH | P3 (never) |

**Priority key:**
- P1: Must have -- directly maps to a graded DB concept
- P2: Should have -- enriches the paper with deeper SQLite knowledge, very low cost
- P3: Do not build -- no academic value relative to implementation cost

## Feature-to-DB-Concept Mapping (Academic Traceability)

This is the critical table for the paper. Every P1 feature must trace to a specific concept from the CBD syllabus.

| App Feature | DB Concept (Syllabus) | SQL Demonstrated | Paper Section |
|-------------|----------------------|------------------|---------------|
| Transaction recording | ACID properties | BEGIN; INSERT; INSERT; COMMIT; / ROLLBACK on error | Sec. 5: Implementation |
| Monthly spending report | Aggregate queries | SELECT cat, SUM(amt) FROM txn JOIN cat GROUP BY cat_id | Sec. 5: Implementation |
| Budget auto-update trigger | Triggers / business logic in DB | CREATE TRIGGER AFTER INSERT ON transactions ... | Sec. 5: Implementation |
| Category cascade delete | Referential integrity | FOREIGN KEY ... ON DELETE CASCADE; PRAGMA foreign_keys=ON | Sec. 4: Design |
| Schema initialization | DDL, constraints | CREATE TABLE, CHECK, NOT NULL, FOREIGN KEY | Sec. 4: Design |
| Seed data + query timing | Performance evaluation | INSERT loop + time measurement | Sec. 6: Results |
| Index creation | Query optimization | CREATE INDEX idx_txn_date ON transactions(date) | Sec. 6: Results |

## Sources

- [SQLite Official: CREATE TRIGGER](https://www.sqlite.org/lang_createtrigger.html) -- Trigger syntax and NEW/OLD references
- [SQLite Official: Foreign Key Support](https://sqlite.org/foreignkeys.html) -- CASCADE, RESTRICT, PRAGMA foreign_keys
- [SQLite Official: Aggregate Functions](https://sqlite.org/lang_aggfunc.html) -- SUM, COUNT, AVG, GROUP BY
- [SQLite Official: CREATE TABLE](https://www.sqlite.org/lang_createtable.html) -- CHECK constraints, column definitions
- [SQLite Official: CREATE INDEX](https://sqlite.org/lang_createindex.html) -- B-tree indexes
- [Expo Documentation: expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) -- API surface, transaction support
- [Expo Blog: Modern SQLite for React Native apps](https://expo.dev/blog/modern-sqlite-for-react-native-apps) -- Current best practices
- Project context: `Analisis Inicial.md` Tabla 1 -- original feature-to-DB mapping
- Project context: `.planning/PROJECT.md` -- requirements APP-01 through APP-07

---
*Feature research for: CBD Academic Project -- Personal Finance iOS App with expo-sqlite*
*Researched: 2026-04-06*
