# Pitfalls Research

**Domain:** React Native + expo-sqlite iOS App AND Academic Paper on Mobile Databases
**Researched:** 2026-04-06
**Confidence:** HIGH (expo-sqlite pitfalls verified via official docs + GitHub issues; academic pitfalls verified via course rules in CLAUDE.md)

This project has two distinct deliverables -- a working app and an academic paper -- each with its own failure modes. The pitfalls below are organized by severity, then by dimension (App vs. Paper).

---

## Critical Pitfalls

### Pitfall 1: PRAGMA foreign_keys Silently Ignored Inside Transactions

**What goes wrong:**
Foreign key constraints are never enforced despite the code containing `PRAGMA foreign_keys = ON`. The app appears to work, but orphaned records accumulate silently. Deleting a category does not cascade or restrict, and the professor's review of the code will immediately spot that the "integridad referencial" claim in the paper is unsupported.

**Why it happens:**
SQLite spec: `PRAGMA foreign_keys` is a no-op when executed inside an active transaction (including inside `withTransactionAsync` or `withExclusiveTransactionAsync`). Developers wrap all initialization SQL in a single transaction block and include the PRAGMA there, where it is silently discarded. The database opens without errors, giving no warning.

**How to avoid:**
Execute `PRAGMA foreign_keys = ON` and `PRAGMA journal_mode = WAL` as the very first statements after opening the database, **outside any transaction**. In the modern expo-sqlite API, use the `onInit` callback of `SQLiteProvider` or call `db.execAsync('PRAGMA foreign_keys = ON')` immediately after `openDatabaseAsync()`, before any `BEGIN` or `withTransactionAsync`. Verify with `PRAGMA foreign_keys` (returns 1 if active).

**Warning signs:**
- DELETE on a parent row succeeds when child rows exist and ON DELETE RESTRICT is set
- INSERT with an invalid foreign key value succeeds silently
- `PRAGMA foreign_keys` query returns 0 after your init code runs

**Phase to address:**
Phase 2 (Design) -- define the init sequence; Phase 3 (Implementation) -- verify enforcement with a test insert of an invalid FK.

---

### Pitfall 2: Using withTransactionAsync Instead of withExclusiveTransactionAsync for ACID Writes

**What goes wrong:**
Financial data is corrupted or inconsistent. The `withTransactionAsync` method is **not exclusive** -- other async queries running in the app can interleave within the transaction. The Expo docs explicitly state: "This transaction is not exclusive and can be interrupted by other async queries." For a finance app that claims ACID properties, this is a direct contradiction of the paper's thesis.

**Why it happens:**
The method name `withTransactionAsync` sounds like a proper database transaction. Developers assume it provides full isolation. The non-exclusive behavior is documented but easy to miss.

**How to avoid:**
Use `withExclusiveTransactionAsync` for all write operations that must be atomic (inserting a transaction + updating a budget via trigger, batch inserts, etc.). Reserve `withTransactionAsync` only for read-only operations where interleaving is acceptable. Document this distinction in the academic paper as a finding about concurrency in mobile SQLite.

**Warning signs:**
- Intermittent "database is locked" errors during concurrent operations
- Budget totals that don't match the sum of individual transactions
- Race conditions that appear under rapid UI interaction but not in slow testing

**Phase to address:**
Phase 3 (Implementation) -- establish the rule from the first line of database code.

---

### Pitfall 3: Using execAsync for User-Input Queries (SQL Injection)

**What goes wrong:**
SQL injection vulnerability. The `execAsync` method does **not support parameter binding** -- it executes raw SQL strings. If any user input (category name, transaction description, amount) is interpolated into an `execAsync` call, the app is vulnerable. The professor may flag this in the code review, and it undermines the "seguridad" claims in the paper.

**Why it happens:**
`execAsync` is convenient for multi-statement execution (CREATE TABLE, PRAGMA, etc.) and developers keep using it for everything out of habit. The Expo docs warn: "execAsync() does not escape parameters and may lead to SQL injection."

**How to avoid:**
Strict rule: `execAsync` is ONLY for schema DDL and PRAGMAs (no user data). All data operations use `runAsync` (writes) or `getAllAsync`/`getFirstAsync` (reads) with parameterized queries (`?` placeholders or `$name` named params). The `$VVV` form is recommended because JavaScript allows `$` in identifiers without escaping.

**Warning signs:**
- Any string concatenation or template literals in SQL strings passed to `execAsync`
- `execAsync` calls that include WHERE clauses with dynamic values

**Phase to address:**
Phase 3 (Implementation) -- enforce from the start as a code convention.

---

### Pitfall 4: Unverifiable or Fabricated Citations in the Academic Paper

**What goes wrong:**
The professor (Toni Reina) checks citations against the reference list and may verify URLs. Citing a non-existent page, a dead URL, an incorrect author, or a hallucinated publication year results in academic penalty. This is especially dangerous when using AI-generated content, as LLMs frequently fabricate plausible-looking citations.

**Why it happens:**
Students rely on AI to generate citation text, or copy citations from secondary sources without verifying the original. The existing `Analisis Inicial.md` already has citations like "(Apple Inc., 2023)" for Core Data -- the actual URL and content must be verified.

**How to avoid:**
1. Every citation must link to a real, accessible source -- verify each URL before submission
2. For book citations (Kumar 2013, Owens 2010, Makice 2016), verify ISBN numbers and exact titles
3. For web documentation (Expo, React Native), cite specific versioned URLs, not generic landing pages
4. IEEE format requires numbered references [1], [2] in order of first appearance -- maintain a master reference list from day one
5. Any AI-generated text must be cross-referenced with a real bibliographic source per course rules

**Warning signs:**
- A citation that only appears in AI output but cannot be found via web search
- URLs that return 404 or redirect to a different page
- Year mismatches between citation and actual publication date

**Phase to address:**
Phase 1 (Research/Writing) -- build the verified reference list first; Phase 4 (Redaccion) -- final verification pass.

---

### Pitfall 5: Tables and Figures Without Required APA/IEEE Formatting

**What goes wrong:**
The professor explicitly checks: (a) tables are numbered and titled in italics above the table, (b) figures are numbered and titled in italics below the figure, (c) each has a "Nota." footnote citing the source, and (d) each is referenced in the text before it appears ("En la Tabla X se muestra..."). Missing any of these triggers grade deductions.

**Why it happens:**
Students format tables as plain markdown/Word tables without the academic apparatus. The formatting requirements are detailed in the course PDF "Cuestiones sobre los trabajos" and are easy to overlook when focused on content.

**How to avoid:**
Create a template for every table and figure from the start:
- **Table template:** Number ("Tabla N"), italic title above, content, "Nota." footnote below with source
- **Figure template:** Content, number ("Figura N") below, italic title below, "Nota." footnote with source
- **In-text reference:** Always write "En la Tabla N se muestra..." or "En la Figura N se puede observar..." BEFORE the table/figure appears
- IEEE figure captions: abbreviate as "Fig." with the number, followed by period, em-space, then caption text
- IEEE tables: label centered above with TABLE in caps and Roman numeral numbering

**Warning signs:**
- Any table without "Tabla N" heading or italic title
- Any figure without "Figura N" label below it
- Any table/figure that appears without being referenced in the preceding text

**Phase to address:**
Phase 4 (Redaccion academica) -- apply template to every table/figure; Phase 5 (Defensa) -- verify in final PDF.

---

### Pitfall 6: Conclusions That Repeat the Introduction Verbatim

**What goes wrong:**
The conclusions section paraphrases or copies sentences from the introduction instead of synthesizing actual results. The course rules explicitly state: "Sin repeticion literal, sin citas nuevas." The `Analisis Inicial.md` already has a conclusion paragraph that mirrors the introduction's language closely -- this must be rewritten from scratch based on actual implementation results.

**Why it happens:**
Students write the introduction first, then copy it into conclusions and tweak wording. The introduction states what the work WILL do; conclusions must state what it DID and what was learned. They serve fundamentally different purposes.

**How to avoid:**
Write conclusions LAST, after implementation and testing are complete. Follow this structure strictly:
1. Summarize actual results (metrics from emulator/device testing)
2. Theoretical and practical implications (what does this prove about mobile SQLite?)
3. Limitations of the study (offline-only, no real-device stress test, academic prototype)
4. Future work (sync, encryption, larger datasets)
Never copy-paste from the introduction. If a sentence appears in both sections, rewrite one.

**Warning signs:**
- Side-by-side diff of introduction and conclusion reveals similar sentences
- Conclusions contain forward-looking language ("se demostrara", "el proposito es") instead of past tense ("se demostro", "los resultados muestran")
- Conclusions introduce new citations

**Phase to address:**
Phase 4 (Redaccion) -- write conclusions only after Phase 3 (Implementation) and Phase 6 (Results) are complete.

---

## Moderate Pitfalls

### Pitfall 7: Using the Legacy expo-sqlite API (openDatabase)

**What goes wrong:**
Code uses the deprecated `openDatabase` synchronous API from `expo-sqlite/legacy` instead of the modern `openDatabaseAsync` / `SQLiteProvider` / `useSQLiteContext` pattern. The legacy API was removed in recent Expo SDK versions. Even if it compiles, the code will look outdated in the academic paper and may not work with the latest Expo SDK.

**Why it happens:**
Most tutorials and Stack Overflow answers still reference the old callback-based API (`db.transaction(tx => { tx.executeSql(...) })`). The modern API using `openDatabaseAsync`, `runAsync`, `getAllAsync`, and `SQLiteProvider` with React Context is relatively new and less documented in community content.

**How to avoid:**
Only reference the official Expo SQLite docs (https://docs.expo.dev/versions/latest/sdk/sqlite/). Use:
- `SQLiteProvider` wrapping the app with `useSuspense` for loading state
- `useSQLiteContext()` hook to access the database in components
- `openDatabaseAsync()` for non-component contexts
- `runAsync` for writes, `getAllAsync`/`getFirstAsync` for reads, `execAsync` for DDL only

**Warning signs:**
- Imports from `expo-sqlite/legacy`
- Code using `db.transaction(tx => ...)` callback pattern
- `executeSql` method calls instead of `runAsync`/`getAllAsync`

**Phase to address:**
Phase 3 (Implementation) -- verify against official docs before writing any database code.

---

### Pitfall 8: No Schema Migration Strategy

**What goes wrong:**
During development, the database schema changes (adding columns, renaming tables, adding indexes) but the app has no migration mechanism. On the emulator, developers just delete the app and reinstall, which hides the problem. If the professor installs a prior version, the app crashes on schema mismatch.

**Why it happens:**
For a 30-hour academic project, migration seems like overkill. But even during development, schema changes are inevitable, and the demo must work reliably.

**How to avoid:**
Use SQLite's built-in `PRAGMA user_version` for simple version tracking:
```typescript
// In onInit callback of SQLiteProvider
const currentVersion = await db.getFirstAsync<{user_version: number}>('PRAGMA user_version');
if (currentVersion.user_version < 1) {
  await db.execAsync(`CREATE TABLE IF NOT EXISTS ...`);
  await db.execAsync('PRAGMA user_version = 1');
}
if (currentVersion.user_version < 2) {
  await db.execAsync('ALTER TABLE ...');
  await db.execAsync('PRAGMA user_version = 2');
}
```
This is simple, requires no ORM, and is worth documenting in the paper as a "migration methodology" finding.

**Warning signs:**
- Multiple `DROP TABLE IF EXISTS` statements in init code (destructive migration)
- Schema changes that work on emulator but crash when app is updated
- Init code that only uses `CREATE TABLE IF NOT EXISTS` without version checks

**Phase to address:**
Phase 2 (Design) -- plan migration strategy; Phase 3 (Implementation) -- implement from day one.

---

### Pitfall 9: Running Aggregate Queries in JavaScript Instead of SQL

**What goes wrong:**
The paper claims that "las consultas de agregacion se delegan al motor de la base de datos", but the code fetches all rows with `getAllAsync('SELECT * FROM transacciones')` and then computes SUM/GROUP BY in JavaScript using `.reduce()` or loops. This defeats the purpose of the project and contradicts the academic thesis.

**Why it happens:**
JavaScript developers are comfortable with array methods and may not think to write complex SQL. It's faster to prototype with JS logic, then the SQL refactor never happens.

**How to avoid:**
Write SQL-native aggregation queries from the start:
```sql
SELECT categoria_id, strftime('%Y-%m', fecha) AS mes, SUM(cantidad) AS total
FROM transacciones
WHERE tipo = 'gasto'
GROUP BY categoria_id, mes
ORDER BY mes DESC;
```
The CLAUDE.md already mandates this: "Las consultas de agregacion deben ejecutarse directamente en SQL, no procesarse en JS." Enforce it.

**Warning signs:**
- `getAllAsync('SELECT * FROM ...')` followed by `.filter()`, `.reduce()`, `.map()` for aggregation
- No SQL queries containing SUM, AVG, COUNT, GROUP BY, or HAVING
- JavaScript utility functions that compute totals from arrays of transaction objects

**Phase to address:**
Phase 2 (Design) -- write the SQL queries during design; Phase 3 (Implementation) -- implement them directly.

---

### Pitfall 10: Mosaic Plagiarism in the Academic Paper

**What goes wrong:**
The student takes phrases from multiple sources (Wikipedia, blog posts, documentation), changes a few words, and combines them into a paragraph without citation. This is "plagio mosaico" -- one of the most common forms of plagiarism in Spanish universities. The professor may run the text through Turnitin or similar tools. Studies show 60-70% of Spanish university students have incorporated web text without proper citation.

**Why it happens:**
When paraphrasing technical content, students inadvertently retain the original sentence structure and key phrases. AI-assisted writing amplifies this risk because LLMs synthesize from training data in ways that may closely mirror source text.

**How to avoid:**
1. Read the source, close it, then write the idea in your own words
2. After writing, compare with the source -- if the sentence structure is similar, rewrite
3. Always cite, even when paraphrasing: "(Kumar, 2013)" or "[1]" in IEEE format
4. For AI-generated text: explicitly mark which sections used AI, provide conversation links, and verify every factual claim against a real source (course requirement)
5. Never use Wikipedia as a primary source -- trace claims back to academic references

**Warning signs:**
- Sentences that switch writing style mid-paragraph (indicator of copied text)
- Technical vocabulary that the student cannot explain when questioned during defense
- Suspiciously polished prose in sections adjacent to rough prose

**Phase to address:**
Phase 4 (Redaccion) -- apply anti-plagiarism discipline paragraph by paragraph.

---

### Pitfall 11: AI Usage Not Properly Declared

**What goes wrong:**
The course requires explicit documentation of AI usage: which sections used AI, links to the conversations/prompts, and cross-referencing of AI output with real bibliographic sources. Failure to declare AI usage, or declaring it vaguely, violates course policy.

**Why it happens:**
Students use AI extensively during research and writing but forget to track which specific sections were AI-assisted. By the time the paper is due, they cannot reconstruct which conversations produced which content.

**How to avoid:**
1. Keep a running log: for every AI interaction that produces content for the paper, record the date, the section it contributed to, and save the conversation link
2. Include a dedicated "Declaracion de uso de IA" section in the paper (the `Analisis Inicial.md` already has a template for this)
3. After each AI-assisted writing session, immediately annotate the draft with "[AI-asistido, ver enlace X]"
4. Cross-reference every AI-generated claim with a real bibliographic source

**Warning signs:**
- No AI declaration section in the final document
- Vague declarations like "Se uso IA para ayudar en la redaccion" without specifics
- AI-generated claims without corresponding bibliographic verification

**Phase to address:**
All phases -- maintain the log continuously; Phase 4 (Redaccion) -- compile and format the declaration section.

---

## Minor Pitfalls

### Pitfall 12: Forgetting WAL Mode for Concurrent Reads

**What goes wrong:**
The default SQLite journal mode is DELETE, which blocks readers during writes. In a React Native app where the UI thread reads data while background operations write, this causes UI freezes or "database is locked" errors.

**How to avoid:**
Set WAL mode immediately after opening the database: `await db.execAsync('PRAGMA journal_mode = WAL')`. WAL allows concurrent readers with a single writer, which is the correct mode for a mobile app.

**Warning signs:**
- UI freezes when saving a transaction while a list is displayed
- "database is locked" errors in the console

**Phase to address:**
Phase 3 (Implementation) -- include in database init sequence alongside `PRAGMA foreign_keys = ON`.

---

### Pitfall 13: SQLite Triggers Not Firing Due to Missing PRAGMA

**What goes wrong:**
Triggers that reference foreign key actions (like cascading deletes) may behave unexpectedly if foreign keys are not enabled. Additionally, triggers that attempt to modify the same table that fired them can cause infinite recursion errors.

**How to avoid:**
1. Ensure `PRAGMA foreign_keys = ON` is set before triggers are created
2. Test each trigger in isolation with a simple INSERT/UPDATE/DELETE and verify the side effect
3. Remember: SQLite only supports `FOR EACH ROW` triggers (not `FOR EACH STATEMENT`)
4. SQLite does not allow triggers on views
5. Triggers cannot recursively invoke other triggers by default

**Warning signs:**
- Trigger exists in schema but budget totals never update automatically
- "too many levels of trigger recursion" error

**Phase to address:**
Phase 3 (Implementation) -- test triggers immediately after creation.

---

### Pitfall 14: Incorrect IEEE In-Text Citation Format

**What goes wrong:**
Using APA-style "(Author, Year)" citations instead of IEEE "[N]" numbered citations. The project explicitly chose IEEE format. Common errors: placing the bracket after punctuation instead of before, using author names in brackets, or not numbering references in order of first appearance.

**How to avoid:**
IEEE rules:
- In-text: [1], [2], [3] -- numbered in order of first appearance in the text
- Bracket goes BEFORE punctuation, with a space before the opening bracket: "...mobile devices [2]."
- Do NOT use articles (a, an, the) at the beginning of figure/table captions
- Reference list at the end is numbered [1], [2], [3] matching in-text order
- Build the reference list incrementally as you write, assigning numbers sequentially

**Warning signs:**
- References numbered out of order (e.g., [3] appears before [1] in the text)
- APA-style "(Kumar, 2013)" appearing anywhere in the document
- Inconsistent formatting between reference list entries

**Phase to address:**
Phase 4 (Redaccion) -- establish IEEE numbering from the first sentence written.

---

### Pitfall 15: Text Not Justified in Final PDF

**What goes wrong:**
The professor checks that the final PDF has justified text alignment (both left and right margins). Submitting with left-aligned or ragged-right text loses formatting marks.

**How to avoid:**
When generating the final PDF (from Word, LaTeX, or any tool), ensure paragraph alignment is set to "Justify" globally. Check headers, captions, and footnotes separately -- they may have different alignment rules.

**Warning signs:**
- Ragged right margin visible in PDF preview
- Different alignment in different sections

**Phase to address:**
Phase 4 (Redaccion) -- set document template with justified alignment from the start.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| DROP TABLE + recreate instead of migration | Fast schema iteration | Loses all test data; hides migration bugs before demo | Only in first week of development, never after demo data exists |
| Inline SQL strings instead of constants file | Faster prototyping | SQL scattered across components; hard to review for paper | Never -- centralize SQL in a `database.ts` module from day one |
| Hardcoded category IDs in queries | Avoids a JOIN | Breaks if categories are reordered or deleted | Never -- always use foreign keys |
| `execAsync` for everything | One method to remember | SQL injection risk; no parameter binding | Only for DDL statements (CREATE TABLE, PRAGMA) |
| Skip TypeScript types for DB rows | Less boilerplate | Runtime errors when accessing wrong column names | Never -- define interfaces for every table row |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Fetching all rows then filtering in JS | Slow list rendering, high memory usage | Use SQL WHERE clauses and LIMIT/OFFSET | Beyond ~500 transactions |
| No indexes on frequently queried columns | Aggregate queries slow down as data grows | CREATE INDEX on `categoria_id`, `fecha`, `tipo` | Beyond ~1000 rows |
| Re-rendering entire list on every DB change | UI jank after insert/update | Use React state management; only re-query affected data | Immediately with FlatList of 50+ items |
| Synchronous database access on UI thread | App freezes during large operations | Use async methods exclusively; never `openDatabaseSync` for heavy queries | With any dataset requiring >10ms query time |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Using `execAsync` with template literals containing user input | SQL injection -- malicious category names could DROP tables | Always use parameterized queries via `runAsync`/`getAllAsync` |
| Storing sensitive financial data without encryption | Data exposed if device is compromised | Mention SQLCipher theoretically in paper; note as limitation that encryption is not implemented |
| Not validating numeric input before DB insert | Invalid amounts (NaN, negative for income) corrupt financial reports | Validate in TypeScript before calling `runAsync` |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No loading state during DB initialization | White screen on app launch | Use `SQLiteProvider` with `useSuspense={true}` and a `React.Suspense` fallback |
| No confirmation before destructive operations (delete category) | Accidental data loss | Show confirmation dialog; explain cascade effects |
| Aggregate reports recalculate on every render | Sluggish reporting screen | Cache results in state; recalculate only on data change |

## "Looks Done But Isn't" Checklist

- [ ] **Foreign keys:** Code has PRAGMA but it's inside a transaction -- verify with `PRAGMA foreign_keys` query returning 1
- [ ] **Triggers:** Trigger is created but never tested with actual INSERT -- verify budget recalculates after adding a gasto
- [ ] **ACID claims:** Paper says "ACID" but code uses `withTransactionAsync` (non-exclusive) -- verify `withExclusiveTransactionAsync` is used for writes
- [ ] **Aggregate queries:** Paper says "SQL nativo" but code uses JS `.reduce()` -- grep for `SUM(`, `GROUP BY` in actual SQL strings
- [ ] **IEEE citations:** All references numbered [1]-[N] in order of appearance -- manually check sequence
- [ ] **Table/Figure formatting:** Every table has: number, italic title, "Nota." footnote, in-text reference before it appears
- [ ] **AI declaration:** Section exists with specific conversation links, not just a generic statement
- [ ] **Justified text:** Final PDF checked on every page for consistent alignment
- [ ] **WAL mode:** `PRAGMA journal_mode = WAL` appears in init code, not just `PRAGMA foreign_keys`

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Foreign keys not enforced | LOW | Add PRAGMA outside transaction, re-test all FK constraints, clean orphaned records |
| Wrong transaction type (non-exclusive) | LOW | Replace `withTransactionAsync` with `withExclusiveTransactionAsync` in write operations |
| SQL injection via `execAsync` | MEDIUM | Audit all `execAsync` calls, refactor to `runAsync`/`getAllAsync` with params |
| Fabricated citations | HIGH | Verify every citation URL/ISBN; replace fabricated ones with real sources; may require rewriting sections |
| Missing table/figure formatting | MEDIUM | Apply template retroactively to all tables/figures; add in-text references |
| Conclusions copied from introduction | MEDIUM | Delete conclusions entirely, rewrite from actual results after testing is complete |
| Legacy API usage | HIGH | Rewrite all database code to use modern async API; significant refactor if deeply integrated |
| No migration strategy | LOW | Add `PRAGMA user_version` checks retroactively; simple if schema is still in initial version |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| PRAGMA foreign_keys in transaction | Phase 2 (Design) | Query `PRAGMA foreign_keys` returns 1 after init |
| Non-exclusive transactions for writes | Phase 3 (Implementation) | Code review: no `withTransactionAsync` for writes |
| SQL injection via execAsync | Phase 3 (Implementation) | Grep: `execAsync` only in schema DDL, never with user data |
| Unverifiable citations | Phase 1 (Research) + Phase 4 (Writing) | Every URL in reference list loads successfully |
| Table/figure formatting | Phase 4 (Writing) | Checklist: every table/figure has number, title, note, in-text ref |
| Conclusions = introduction copy | Phase 4 (Writing) | Diff analysis between intro and conclusion paragraphs |
| Legacy API usage | Phase 3 (Implementation) | No imports from `expo-sqlite/legacy`; no `executeSql` calls |
| No migration strategy | Phase 2 (Design) | `PRAGMA user_version` check exists in init code |
| JS aggregation instead of SQL | Phase 2 (Design) + Phase 3 (Implementation) | SQL files contain SUM/GROUP BY; no JS `.reduce()` on raw rows |
| Mosaic plagiarism | Phase 4 (Writing) | Self-check with plagiarism tool before submission |
| AI usage undeclared | All phases | Log maintained; declaration section complete with links |
| Missing WAL mode | Phase 3 (Implementation) | `PRAGMA journal_mode` returns `wal` after init |
| Triggers not firing | Phase 3 (Implementation) | Manual test: INSERT a gasto, verify budget row updated |
| IEEE format errors | Phase 4 (Writing) | References numbered sequentially matching in-text order |
| Text not justified | Phase 4 (Writing) | Visual check of every page in final PDF |

## Sources

- [Expo SQLite Official Documentation](https://docs.expo.dev/versions/latest/sdk/sqlite/) -- API reference, SQLiteProvider, transaction methods, PRAGMA guidance
- [SQLite Official PRAGMA Documentation](https://sqlite.org/pragma.html) -- foreign_keys no-op in transactions
- [SQLite Official CREATE TRIGGER Documentation](https://www.sqlite.org/lang_createtrigger.html) -- trigger limitations
- [Expo GitHub Issue #3496: Foreign keys not working](https://github.com/expo/expo/issues/3496) -- PRAGMA foreign_keys must be outside transaction
- [Expo GitHub Issue #9206 (TypeORM): PRAGMA foreign_keys](https://github.com/typeorm/typeorm/issues/9206) -- confirms the transaction scope problem
- [SQLite Foreign Keys: Common Pitfalls and Solutions](https://runebook.dev/en/docs/sqlite/foreignkeys) -- comprehensive FK enforcement guide
- [Modern SQLite for React Native apps (Expo Blog)](https://expo.dev/blog/modern-sqlite-for-react-native-apps) -- modern API patterns
- [Guia academica sobre el plagio (Universidad de Valladolid)](https://digital.uva.es/wp-content/uploads/2022/05/GuiaAcademicaPlagio_UVa.pdf) -- mosaic plagiarism definition
- [Evitar el plagio (Universidad de Sevilla BUS)](https://guiasbus.us.es/c.php?g=458850&p=5128555) -- US-specific plagiarism guidelines
- [APA Tables and Figures (Purdue OWL)](https://owl.purdue.edu/owl/research_and_citation/apa_style/apa_formatting_and_style_guide/apa_tables_and_figures.html) -- formatting rules
- [IEEE Editorial Style Manual](https://journals.ieeeauthorcenter.ieee.org/wp-content/uploads/sites/7/IEEE-Editorial-Style-Manual-for-Authors.pdf) -- IEEE citation and figure/table formatting
- [PowerSync: React Native Database Performance Comparison](https://www.powersync.com/blog/react-native-database-performance-comparison) -- performance benchmarks

---
*Pitfalls research for: React Native + expo-sqlite iOS App AND Academic Paper on Mobile Databases*
*Researched: 2026-04-06*
