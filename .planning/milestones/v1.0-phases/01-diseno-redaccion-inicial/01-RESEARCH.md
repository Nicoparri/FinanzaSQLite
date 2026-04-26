# Phase 01: diseno-redaccion-inicial - Research

**Researched:** 2026-04-08  
**Domain:** Academic memory in LaTeX for CBD project (React Native + Expo + SQLite)  
**Confidence:** MEDIUM-HIGH

## User Constraints

### Locked constraints from user request and repo context
- Build a complete academic memory in LaTeX aligned to `plantillaMemoria.pdf`. [VERIFIED: user request]
- Enforce requirements from `00-Cuestiones sobre los trabajos.pdf` and `CBD2526-Instrucciones entrega.pdf`. [VERIFIED: user request]
- Perform deep analysis over existing docs and code in this repo before planning. [VERIFIED: user request]
- IEEE citations are mandatory for this project. [VERIFIED: `.planning/PROJECT.md`, `CLAUDE.md`]
- Scope is React Native + Expo + expo-sqlite academic implementation for iOS. [VERIFIED: `.planning/PROJECT.md`, `CLAUDE.md`]

### Discretion areas
- Exact LaTeX chapter decomposition and file structure. [ASSUMED]
- Local-vs-Overleaf authoring workflow. [ASSUMED]
- Number of executable plans to propose (2-4 requested). [VERIFIED: user request]

### Out of scope for this phase
- New app features or DB schema redesign. [VERIFIED: `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`]
- Backend sync architecture (offline-first remains). [VERIFIED: `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`]

## Project Constraints (from copilot-instructions.md)

- GSD workflow should be used only when explicitly requested by user. [VERIFIED: `.github/copilot-instructions.md`]
- `gsd-*` commands map to matching `.github/skills/gsd-*` workflows. [VERIFIED: `.github/copilot-instructions.md`]

## Summary

The repository already contains most academic raw material in Markdown (`docs/paper/01` to `09`) plus technical evidence in code (`src/db/*`), SQL (`docs/esquema/schema.sql`), benchmark outputs (`docs/paper/data/phase3-benchmark.json`), and Nyquist checks (`tests/nyquist`). [VERIFIED: file reads in this session]

The phase objective should now shift from content invention to **LaTeX integration + compliance hardening**: map all existing sections into the `plantillaMemoria` chapter skeleton, close strict delivery gaps (manual de usuario, references quality, anti-plagiarism validation, figure assets), and guarantee IEEE consistency end-to-end. [CITED: `plantillaMemoria.pdf` p6-p7; `CBD2526-Instrucciones entrega.pdf` p1-p2; `00-Cuestiones sobre los trabajos.pdf` p5, p7, p8-p15]

Critical blocker: local environment has no LaTeX toolchain (`pdflatex`, `latexmk`, `bibtex`, `biber` missing), so planning must include either Overleaf-first compilation or toolchain installation as Wave 0. [VERIFIED: terminal environment audit 2026-04-08]

**Primary recommendation:** execute 4 plans: (1) LaTeX scaffold and build path, (2) chapter migration from existing docs, (3) technical evidence and manuals integration, (4) compliance/quality gate and delivery package. [VERIFIED: analysis synthesis]

## Scope Understanding and Deliverable Definition

- Deliverable target: one final memory document in Word/PDF format generated from LaTeX source, aligned to plantilla chapter order and formatting conventions. [CITED: `CBD2526-Instrucciones entrega.pdf` p1; `plantillaMemoria.pdf` p1-p9]
- Required bundle for submission: presentation (PPT/PDF), memory (Word/PDF), and code repository (GitHub). [CITED: `CBD2526-Instrucciones entrega.pdf` p1]
- Since this is implementation work, include user manual and deployment/installation manual (can be in README/repo if needed). [CITED: `CBD2526-Instrucciones entrega.pdf` p1]
- Mandatory academic controls: tables/figures referenced in text, reliable references, originality, and explicit IA declaration with links to prompts/conversations. [CITED: `CBD2526-Instrucciones entrega.pdf` p1-p2; `00-Cuestiones sobre los trabajos.pdf` p11-p13]

## Standard Stack

### Core

| Library/Tool | Version | Purpose | Why Standard |
|---|---|---|---|
| plantilla TFG ETSII US (Overleaf reference) | 2023 ref | Base LaTeX structure for memory | Explicitly referenced in course delivery instructions for LaTeX work. [CITED: `CBD2526-Instrucciones entrega.pdf` p2] |
| LaTeX project with BibTeX bibliography file | N/A | Chaptered academic writing + auto references | `plantillaMemoria` demonstrates BibTeX, `cite`, labels/refs, table/figure indexing. [CITED: `plantillaMemoria.pdf` p12-p16] |
| Existing repo chapter sources (`docs/paper/*.md`) | Current repo | Canonical content to migrate to LaTeX | Sections 01-09 already drafted and verified in prior phases. [VERIFIED: `docs/paper/*`, `.planning/phases/01-diseno-redaccion-inicial/01-VERIFICATION.md`] |

### Supporting

| Library/Tool | Version | Purpose | When to Use |
|---|---|---|---|
| Node built-in test runner (`node --test`) | Node v24.10.0 | Structural verification (Nyquist) | Run on each content-integration wave to avoid regressions in required artifacts. [VERIFIED: `package.json`, test runs 2026-04-08] |
| Python + pypdf | Python 3.12.10 | Extract requirement text from local PDFs | Useful for compliance traceability and quote-level checks. [VERIFIED: terminal checks 2026-04-08] |
| Overleaf online compiler | SaaS | Compile when local LaTeX stack missing | Immediate fallback given local TeX tools are absent. [ASSUMED] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|---|---|---|
| Local TeX build | Overleaf-only workflow | Faster start, but weaker local CI reproducibility. [ASSUMED] |
| `biblatex` + `biber` IEEE | `BibTeX` + IEEE style | Both valid; choose one and lock to avoid citation drift. [ASSUMED] |
| Manual chapter rewrite | Structured migration from `docs/paper` | Migration is safer and faster than re-authoring from zero. [VERIFIED: existing content completeness in `docs/paper/01-09`] |

**Installation (if local compile is required):**

```powershell
# No verified one-line installer was found in-session.
# Recommended path: use Overleaf immediately OR install a TeX distribution manually (MiKTeX/TeX Live), then verify pdflatex/latexmk/bibtex.
```

**Version verification:**
- Local command availability audit completed; TeX stack commands are missing on this machine. [VERIFIED: terminal environment audit 2026-04-08]

## Required Section Map Against plantilla Structure

| plantilla chapter/section | What plantilla expects | Existing source in repo | Gap status |
|---|---|---|---|
| Portada + metadatos | Title, author, tutor, depto, convocatoria | No LaTeX source yet | MISSING [CITED: `plantillaMemoria.pdf` p1] |
| Dedicatoria / Agradecimientos | Optional front matter pages | Not present in `docs/paper` | MISSING [CITED: `plantillaMemoria.pdf` p2] |
| Resumen (ES) + Palabras clave | Spanish abstract page | Partial ideas in intro docs; no dedicated section | PARTIAL [CITED: `plantillaMemoria.pdf` p3] |
| Abstract (EN) + Keywords | English abstract page | Not present | MISSING [CITED: `plantillaMemoria.pdf` p4] |
| Indices (general, figuras, tablas, codigo) | Auto-generated | No LaTeX scaffold yet | MISSING [CITED: `plantillaMemoria.pdf` p6-p9] |
| Cap 2 Introduccion | Intro chapter | `docs/paper/01-introduccion.md` | READY [VERIFIED: `docs/paper/01-introduccion.md`] |
| Cap 3 Estudio previo | intro/objetivos/metodologia/planificacion/presupuesto/conclusiones | `docs/paper/02-estado-arte.md` + `Analisis Inicial.md` cronograma | PARTIAL [VERIFIED: `docs/paper/02-estado-arte.md`, `Analisis Inicial.md`] |
| Cap 4 Analisis del problema | requisitos de informacion/funcionales/no funcionales | `.planning/REQUIREMENTS.md`, `docs/paper/03-alcance.md` | PARTIAL [VERIFIED: `.planning/REQUIREMENTS.md`, `docs/paper/03-alcance.md`] |
| Cap 5 Diseno de la solucion | architecture/design chapter | `docs/paper/04-metodologia.md`, `docs/esquema/diagrama-er.md`, `docs/esquema/schema.sql` | READY [VERIFIED: files listed] |
| Cap 6 Implementacion | implementation + tools | `docs/paper/05-implementacion.md`, `src/db/*`, `App.tsx` | READY [VERIFIED: files listed] |
| Cap 7 Pruebas | testing/results chapter | `docs/paper/06-resultados-pruebas.md`, benchmark JSON, Nyquist tests | READY with pending figure assets [VERIFIED: files + test outputs] |
| Cap 8 Conclusiones | conclusions chapter | `docs/paper/07-conclusiones.md` | READY [VERIFIED: file] |
| Bibliografia | cited references | `docs/paper/08-referencias.md` | READY but needs LaTeX bibliography integration [VERIFIED: file] |
| Uso de IA (delivery requirement) | explicit IA declaration + prompt links | `docs/paper/09-declaracion-ia.md` | PARTIAL (links still placeholder) [VERIFIED: file; CITED: `CBD2526-Instrucciones entrega.pdf` p1-p2] |

## Gap Analysis (What Exists vs Missing)

### High-value existing content
- Chapters 01-09 in Markdown are already authored and structurally aligned with course intent. [VERIFIED: `docs/paper/01-09`]
- SQL design evidence is strong and explicit (`schema.sql`, ER diagram, trigger/index/view definitions). [VERIFIED: `docs/esquema/schema.sql`, `docs/esquema/diagrama-er.md`]
- Empirical results are reproducible with benchmark script + JSON output. [VERIFIED: `scripts/benchmark_sqlite.py`, `docs/paper/data/phase3-benchmark.json`]
- Verification artifacts already identify remaining human-only checks (citation sufficiency and plagiarism). [VERIFIED: `.planning/phases/01-diseno-redaccion-inicial/01-VERIFICATION.md`]

### Missing or weak areas for final LaTeX memory
- No LaTeX source tree exists (`.tex`, `bibliografia.bib`, figure includes, build script absent). [VERIFIED: `file_search **/*.tex` -> none]
- No local TeX compiler available, so local compile is blocked. [VERIFIED: environment audit]
- Required front matter not yet authored (cover metadata, resumen ES, abstract EN, dedicatoria/agradecimientos if desired). [CITED: `plantillaMemoria.pdf` p1-p4]
- `manual de usuario` is not explicitly documented as a standalone artifact; deployment exists but user manual is unclear. [VERIFIED: `docs/DEPLOY-iOS.md`; CITED: `CBD2526-Instrucciones entrega.pdf` p1]
- Figure assets `figura-2/3/4` still pending capture in iOS simulator/device. [VERIFIED: `docs/paper/figures/README.md`]
- IA declaration lacks finalized links to prompt/conversation evidence. [VERIFIED: `docs/paper/09-declaracion-ia.md`; CITED: `CBD2526-Instrucciones entrega.pdf` p1-p2]
- One Nyquist test is stale and fails because UI anchor strings changed in `App.tsx`. [VERIFIED: `npm run test:nyquist` output 2026-04-08]

## Technical Extraction from Code (DB, SQL, Transactions, Tests)

### Database schema and migration
- DB file name is `finanzas.db`; schema versioning uses `PRAGMA user_version`. [VERIFIED: `src/db/database.ts`]
- Foreign keys and WAL are enabled at initialization (`PRAGMA foreign_keys = ON;`, `PRAGMA journal_mode = WAL;`). [VERIFIED: `src/db/database.ts`]
- Core tables: `cuentas`, `categorias`, `transacciones`, `presupuestos` with checks/FKs and constraints required for academic narrative. [VERIFIED: `src/db/database.ts`, `docs/esquema/schema.sql`]

### Triggers, views, and indexes
- Trigger `actualizar_presupuesto_tras_gasto` and reverse trigger on delete are present in app migration and SQL schema. [VERIFIED: `src/db/database.ts`, `docs/esquema/schema.sql`]
- View `resumen_mensual` and indexes `idx_txn_fecha`, `idx_txn_categoria` are defined and align with reporting claims. [VERIFIED: same files]
- Important divergence: app migration trigger filters by month (`AND mes = strftime('%Y-%m', NEW.fecha)`), while standalone `schema.sql` trigger currently does not include `mes` filter. [VERIFIED: file diff observation]

### Transaction behavior
- There is an explicit helper `withWriteTransaction` using `BEGIN EXCLUSIVE` to preserve FK behavior on the main connection. [VERIFIED: `src/db/database.ts`]
- In contrast, `createTransaccion` uses `db.withExclusiveTransactionAsync` directly in repository. [VERIFIED: `src/db/repository.ts`]
- Risk: internal code comment says `withExclusiveTransactionAsync` may use a new connection where `foreign_keys` is OFF by default; this requires verification in runtime tests and careful wording in memory. [VERIFIED: `src/db/database.ts`; ASSUMED impact until runtime proof]

### SQL analytics and benchmarking
- Monthly report query in repository performs SQL-side `SUM`, `COUNT`, `GROUP BY`, and month filter with `strftime`. [VERIFIED: `src/db/repository.ts`]
- Seed generator inserts 100-500 synthetic transactions in one exclusive transaction and measures elapsed time. [VERIFIED: `src/db/seed.ts`, `App.tsx`]
- Benchmark evidence exists and includes query plans with/without indexes. [VERIFIED: `docs/paper/data/phase3-benchmark.json`, `scripts/benchmark_sqlite.py`]

### Test evidence
- `npm run test:nyquist:phase1` passes all 4 checks. [VERIFIED: terminal output 2026-04-08]
- `npm run test:nyquist` total: 13 pass, 1 fail (`phase-02 app/repository anchor strings`). [VERIFIED: terminal output 2026-04-08]
- Human verification remains pending for citation sufficiency and plagiarism. [VERIFIED: `.planning/phases/01-diseno-redaccion-inicial/01-VERIFICATION.md`]

## Academic Compliance Checklist

| Compliance item | Source | Current status | Evidence |
|---|---|---|---|
| Text justified in final document | 00-Cuestiones | PARTIAL (policy known, not yet in final LaTeX/PDF) | [CITED: `00-Cuestiones sobre los trabajos.pdf` p4] |
| Introduction structure (attention/context/purpose/method/results/conclusions + one idea per paragraph) | 00-Cuestiones | PARTIAL (draft aligned, needs final audit) | [CITED: `00-Cuestiones sobre los trabajos.pdf` p14], [VERIFIED: `docs/paper/01-introduccion.md`] |
| Conclusions structure (summarize results, avoid literal repetition, emphasize key points) | 00-Cuestiones | PARTIAL | [CITED: `00-Cuestiones sobre los trabajos.pdf` p15], [VERIFIED: `docs/paper/07-conclusiones.md`] |
| Table labeling and in-text reference before insertion + source note if external | 00-Cuestiones + CBD instructions | PARTIAL (drafts do this, final LaTeX check pending) | [CITED: `00-Cuestiones sobre los trabajos.pdf` p12], [CITED: `CBD2526-Instrucciones entrega.pdf` p1] |
| Figure labeling and in-text reference before insertion + source note if external | 00-Cuestiones + CBD instructions | PARTIAL (figure text exists; image assets pending) | [CITED: `00-Cuestiones sobre los trabajos.pdf` p13], [VERIFIED: `docs/paper/figures/README.md`] |
| Reliable bibliographic references included | CBD instructions | READY/PARTIAL (list exists; final `.bib` integration pending) | [CITED: `CBD2526-Instrucciones entrega.pdf` p1], [VERIFIED: `docs/paper/08-referencias.md`] |
| Distinguish references vs bibliography of consultation | 00-Cuestiones | PARTIAL (needs explicit final sectioning decision) | [CITED: `00-Cuestiones sobre los trabajos.pdf` p7] |
| Anti-plagiarism originality | 00-Cuestiones + CBD instructions | PENDING HUMAN | [CITED: `00-Cuestiones sobre los trabajos.pdf` p8-p10], [CITED: `CBD2526-Instrucciones entrega.pdf` p1] |
| IA declaration with where/how used + prompt links | 00-Cuestiones + CBD instructions | PARTIAL (section exists, links pending completion) | [CITED: `00-Cuestiones sobre los trabajos.pdf` p11], [CITED: `CBD2526-Instrucciones entrega.pdf` p1-p2], [VERIFIED: `docs/paper/09-declaracion-ia.md`] |
| Memory length ~20 pages A4, single spacing, 12pt | CBD instructions | PENDING (requires compiled final layout) | [CITED: `CBD2526-Instrucciones entrega.pdf` p1] |
| Intro and conclusions chapters mandatory | CBD instructions | READY in content, pending plantilla integration | [CITED: `CBD2526-Instrucciones entrega.pdf` p1], [VERIFIED: `docs/paper/01-introduccion.md`, `docs/paper/07-conclusiones.md`] |
| Implementation work must include user + deploy/install manual (if needed) | CBD instructions | PARTIAL (deploy manual exists, user manual unclear) | [CITED: `CBD2526-Instrucciones entrega.pdf` p1], [VERIFIED: `docs/DEPLOY-iOS.md`] |

## Architecture Patterns

### Recommended Project Structure (for LaTeX memory)

```text
memoria/
├── memoria.tex                 # main entrypoint
├── frontmatter/
│   ├── portada.tex
│   ├── resumen-es.tex
│   └── abstract-en.tex
├── chapters/
│   ├── 02-introduccion.tex
│   ├── 03-estudio-previo.tex
│   ├── 04-analisis-problema.tex
│   ├── 05-diseno-solucion.tex
│   ├── 06-implementacion.tex
│   ├── 07-pruebas.tex
│   └── 08-conclusiones.tex
├── appendices/
│   ├── uso-ia.tex
│   ├── manual-usuario.tex
│   └── manual-despliegue.tex
├── figures/
├── tables/
└── bibliografia.bib
```

### Pattern 1: Source-to-Chapter Traceability
**What:** each plantilla chapter must map to one or more existing repo artifacts (`docs/paper`, code files, SQL, benchmark JSON). [VERIFIED: repo analysis]
**When to use:** always, to avoid fabrication and reduce rewrite churn. [ASSUMED]
**Example:**
```text
Chapter 06 Implementacion <= docs/paper/05-implementacion.md + src/db/database.ts + src/db/repository.ts
Chapter 07 Pruebas <= docs/paper/06-resultados-pruebas.md + phase3-benchmark.json + tests/nyquist outputs
```

### Pattern 2: Evidence-first technical writing
**What:** include measurable outputs (query plan lines, timing metrics, test pass/fail summary) before interpretation. [VERIFIED: available evidence files]
**When to use:** implementation and testing chapters, defense alignment, and anti-hallucination control. [ASSUMED]

### Pattern 3: Compliance gates per chapter
**What:** each chapter closes with a mini-checklist: references present, figure/table labels, no uncited technical claims. [CITED: 00-Cuestiones p5, p12, p13]
**When to use:** before each merge/plan closure. [ASSUMED]

### Anti-patterns to avoid
- Writing LaTeX chapters from memory without traceability to repo evidence. [VERIFIED risk]
- Manually numbering references, figures, and tables. [CITED: `plantillaMemoria.pdf` p14-p16]
- Mixing IEEE and non-IEEE citation formats in the same memory. [VERIFIED: project mandate IEEE in `.planning/PROJECT.md`]
- Claiming iOS visual evidence before capturing Figure 2/3/4 images. [VERIFIED: `docs/paper/figures/README.md`]

## Don't Hand-Roll

| Problem | Do Not Build | Use Instead | Why |
|---|---|---|---|
| Citation numbering | Manual `[1]...[N]` edits | BibTeX-driven citations | Prevents ordering errors and broken bibliography. [CITED: `plantillaMemoria.pdf` p16] |
| Figure/table numbering | Hardcoded numbers in text | `label`/`ref` workflow | Auto-updates and cross-links are native in LaTeX. [CITED: `plantillaMemoria.pdf` p14] |
| Chapter ordering | Ad hoc manual paste in one file | `\input` chapter modules | Scales and preserves reviewability. [ASSUMED] |
| Compliance tracking | Memory-only checklist | Explicit matrix linked to source PDFs and repo files | Needed for auditable academic delivery. [VERIFIED need from PDFs + current gaps] |

**Key insight:** this phase is a packaging and compliance problem, not a greenfield writing problem. Most content already exists; risk is in integration fidelity. [VERIFIED: repo content audit]

## Common Pitfalls

### Pitfall 1: plantilla structure mismatch
**What goes wrong:** final memory keeps project-specific section order but not plantilla chapter skeleton. [VERIFIED risk]
**Why:** existing drafts are topic-based markdown sections, not plantilla chapter files. [VERIFIED: `docs/paper/01-09`]
**How to avoid:** create a chapter mapping matrix first, then migrate content section-by-section. [ASSUMED]
**Warning signs:** unresolved placeholders in front matter and missing generated indexes. [CITED: `plantillaMemoria.pdf` p6-p9]

### Pitfall 2: evidence drift between SQL docs and app code
**What goes wrong:** memory describes trigger behavior from `schema.sql` while runtime code uses month-filtered trigger logic. [VERIFIED]
**Why:** two authoritative SQL definitions exist. [VERIFIED: `docs/esquema/schema.sql`, `src/db/database.ts`]
**How to avoid:** declare one canonical runtime definition and align narrative/examples. [ASSUMED]
**Warning signs:** inconsistent `WHERE` clauses in trigger snippets across chapters. [VERIFIED]

### Pitfall 3: unresolved human-only quality checks
**What goes wrong:** phase marked complete without citation sufficiency/plagiarism validation. [VERIFIED]
**Why:** automated checks cannot prove semantic citation quality. [VERIFIED: `01-VERIFICATION.md`]
**How to avoid:** include explicit manual gate before final PDF freeze. [ASSUMED]

### Pitfall 4: stale tests and false confidence
**What goes wrong:** full Nyquist suite failure ignored because phase-specific tests pass. [VERIFIED]
**Why:** test anchors in `phase-02.test.js` no longer match current app strings. [VERIFIED: `npm run test:nyquist`]
**How to avoid:** update stale tests or scope quick command to relevant plan with documented rationale. [ASSUMED]

## Code Examples

Verified or template-aligned patterns to use in LaTeX migration:

### 1) Cross-reference pattern for figures/tables
```latex
En la Figura \ref{fig:er} se puede observar el modelo entidad-relacion.

\begin{figure}[htbp]
  \centering
  \includegraphics[width=0.9\textwidth]{figures/figura-er.png}
  \caption{Diagrama entidad-relacion de la base de datos}
  \label{fig:er}
\end{figure}
```
Source basis: label/ref and figure workflow in plantilla docs. [CITED: `plantillaMemoria.pdf` p12-p14]

### 2) Bibliography citation flow
```latex
SQLite proporciona propiedades ACID en escenarios embebidos \cite{owens2010sqlite}.
```
Source basis: BibTeX + `cite` process described in plantilla. [CITED: `plantillaMemoria.pdf` p16]

### 3) SQL evidence snippet inclusion
```latex
\begin{lstlisting}[language=SQL,caption={Trigger de actualizacion de presupuesto}]
CREATE TRIGGER IF NOT EXISTS actualizar_presupuesto_tras_gasto
AFTER INSERT ON transacciones
WHEN NEW.tipo = 'gasto'
BEGIN
  UPDATE presupuestos
  SET restante = restante - NEW.importe
  WHERE categoria_id = NEW.categoria_id
    AND mes = strftime('%Y-%m', NEW.fecha);
END;
\end{lstlisting}
```
Source basis: runtime SQL in repository. [VERIFIED: `src/db/database.ts`]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|---|---|---|---|
| Single markdown drafts as final deliverable | Markdown drafts as source feeding plantilla-aligned LaTeX memory | Needed now for final submission requirements | Improves formal compliance and defense traceability. [VERIFIED + CITED] |
| Citation marker presence check only | Marker check + human semantic audit + plagiarism gate | Already identified in phase verification | Reduces academic integrity risk. [VERIFIED: `01-VERIFICATION.md`] |
| Isolated chapter writing | End-to-end traceability matrix from source evidence to chapter claims | Required by current gaps | Prevents ungrounded claims. [VERIFIED need] |

**Deprecated/outdated in current context:**
- Treating front matter/indices as optional in LaTeX memory workflow. [CITED: `plantillaMemoria.pdf` p1-p9]
- Assuming local compile readiness without TeX tools. [VERIFIED: environment audit]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|---|---|---|
| A1 | Overleaf-only workflow is acceptable without local TeX toolchain | Standard Stack / Environment | Could reduce reproducibility in local CI and delay final PDF QA |
| A2 | Citation backend is locked to BibTeX + IEEE style (`references.bib` single source) | Standard Stack | Low; drift risk only if references are edited outside the bib authority |
| A3 | Chapter modularization with `\input` is adopted as execution baseline | Architecture Patterns | Low; changes would only affect include wiring, not core content |
| A4 | Existing Markdown text can be migrated with low semantic rewrite | Summary / Gap Analysis | Hidden stylistic mismatches may increase editorial effort |

## Resolved Questions

1. **Citation backend lock**
  - Decision: use `BibTeX` with IEEE style and a single `memoria/references.bib` authority.
  - Resolution status: resolved in planning baseline (Plan 01-03 scaffold + Plan 01-06 hardening).
  - Why: minimizes tooling friction (no local `biber`) and keeps IEEE numbering stable.

2. **Placement of "Uso de IA"**
  - Decision: keep it as appendix (`memoria/appendices/uso-ia.tex`) and cross-reference it from conclusions/compliance checklist.
  - Resolution status: resolved in plan decomposition (Plan 01-06 ownership).
  - Why: satisfies explicit IA declaration requirement while preserving chapter flow.

3. **Manual de usuario / despliegue location**
  - Decision: include both manuals as appendices (`manual-usuario.tex`, `manual-despliegue.tex`) and link operational detail to existing deploy docs.
  - Resolution status: resolved in plan decomposition (Plan 01-05 ownership).
  - Why: complies with delivery instructions for implementation projects and keeps memory self-contained.

No open planning blockers remain in this research file.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|---|---|---|---|---|
| pdflatex | Local PDF compile | ✗ | - | Overleaf compile |
| xelatex | Unicode/local compile alternative | ✗ | - | Overleaf compile |
| lualatex | Unicode/local compile alternative | ✗ | - | Overleaf compile |
| latexmk | Build automation | ✗ | - | Manual compile on Overleaf |
| bibtex | Bibliography build | ✗ | - | Overleaf-managed build |
| biber | Bibliography build (biblatex) | ✗ | - | Prefer BibTeX workflow |
| makeindex | Index generation | ✗ | - | Overleaf index generation |
| pandoc | MD->TeX conversion helper | ✗ | - | Manual migration |
| node | Nyquist checks | ✓ | v24.10.0 | - |
| npm | Script orchestration | ✓ | 11.6.1 | - |
| python | PDF extraction / benchmark scripts | ✓ | 3.12.10 | - |
| git | Submission/review workflow | ✓ | 2.46.1.windows.1 | - |

**Missing dependencies with no fallback:**
- None blocking planning itself.

**Missing dependencies with fallback:**
- Entire TeX toolchain (fallback: Overleaf-first until local install).

## Validation Architecture

### Test Framework

| Property | Value |
|---|---|
| Framework | Node built-in test runner (`node --test`) |
| Config file | none (script-driven from `package.json`) |
| Quick run command | `npm run test:nyquist:phase1` |
| Full suite command | `npm run test:nyquist` |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|---|---|---|---|---|
| DOC-01..DOC-04 | Existence/anchors for chapters 1-4 content | structural | `npm run test:nyquist:phase1` | ✅ |
| FMT-01..FMT-02 | Presence of figure/table anchors and labels | structural | `npm run test:nyquist:phase1` | ✅ |
| FMT-03 | Citation sufficiency (semantic) | manual | N/A | ❌ Wave 0 manual |
| FMT-04 | Plagiarism/originality | manual | N/A | ❌ Wave 0 manual |
| Phase2 drift check | SQL-first app behavior anchors | structural | `npm run test:nyquist` | ✅ (currently 1 fail) |

### Sampling Rate
- **Per task commit:** `npm run test:nyquist:phase1`
- **Per wave merge:** `npm run test:nyquist`
- **Phase gate:** full suite green OR documented exception + manual audits complete

### Wave 0 Gaps
- [ ] Create/lock LaTeX compile validation command (Overleaf export check or local `latexmk` command).
- [ ] Add citation semantic audit checklist artifact.
- [ ] Add plagiarism/manual originality verification artifact.
- [ ] Resolve failing `phase-02` Nyquist assertion or document accepted temporary exception.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---|---|---|
| V2 Authentication | no | out of scope for local academic memory build |
| V3 Session Management | no | out of scope |
| V4 Access Control | no | out of scope |
| V5 Input Validation | yes | Parameterized SQL in repository queries (`?` placeholders) |
| V6 Cryptography | partial | No implemented DB encryption; only theoretical mention in docs |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---|---|---|
| SQL injection in app queries | Tampering | Use parameterized `runAsync/getAllAsync` with bind params. [VERIFIED: `src/db/repository.ts`] |
| Referential integrity not enforced per connection | Tampering | Execute `PRAGMA foreign_keys = ON` at init and validate transaction path behavior. [VERIFIED: `src/db/database.ts`] |
| Academic integrity breach (uncited or copied text) | Repudiation | Human citation audit + anti-plagiarism gate + IA declaration with links. [CITED: `00-Cuestiones` p8-p11; `CBD2526` p1-p2] |

## Recommended Planning Strategy (4 executable plans)

### Plan 01 - Wave 0 LaTeX Scaffold and Build Gate
- Goal: create LaTeX project skeleton aligned to plantilla and lock compile path (Overleaf-first + optional local instructions).
- Outputs: `memoria/memoria.tex`, chapter includes, bibliography stub, figure/table folders, compile checklist.
- Verification: minimal compile artifact generated; references/indices configured.

### Plan 02 - Chapter Migration and plantilla Mapping
- Goal: migrate `docs/paper/01-09` into plantilla chapter order with explicit source traceability.
- Outputs: chapters 2-8 in `.tex`, front matter placeholders filled, section map matrix.
- Verification: no orphan content; every chapter links back to source files.

### Plan 03 - Technical Evidence and Manuals Integration
- Goal: integrate SQL/code excerpts, benchmark tables, Nyquist evidence, and manual de usuario/despliegue requirements.
- Outputs: implementation/testing chapters with reproducible evidence, appendices for manuals and IA declaration.
- Verification: all claims point to repo artifacts; pending screenshots tracked with file contract.

### Plan 04 - Compliance Hardening and Delivery Package
- Goal: close human audits (FMT-03/FMT-04), finalize references, enforce IEEE consistency, and prepare submission bundle.
- Outputs: final PDF memory, presentation traceability checklist, IA links finalized.
- Verification: checklist from both PDFs closed; no unresolved blockers.

## Sources

### Primary (HIGH confidence)
- Local course and template PDFs:
  - `plantillaMemoria.pdf` (p1-p9, p12-p16, p24-p25) - structure, indices, labels/refs, citation workflow.
  - `00-Cuestiones sobre los trabajos.pdf` (p4-p5, p7-p15) - formatting, citation/plagiarism rules, intro/conclusion guidance, IA usage.
  - `CBD2526-Instrucciones entrega.pdf` (p1-p2) - official delivery requirements and IA policy.
- Repository artifacts:
  - `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`, `.planning/STATE.md`
  - `docs/paper/01-09`
  - `docs/esquema/diagrama-er.md`, `docs/esquema/schema.sql`
  - `src/db/database.ts`, `src/db/repository.ts`, `src/db/seed.ts`, `src/db/types.ts`, `App.tsx`
  - `scripts/benchmark_sqlite.py`, `docs/paper/data/phase3-benchmark.json`
  - `.planning/phases/01-diseno-redaccion-inicial/01-VERIFICATION.md`
  - `tests/nyquist/*.test.js`
- Runtime checks executed in this session:
  - tool availability audit
  - `npm run test:nyquist:phase1`
  - `npm run test:nyquist`

### Secondary (MEDIUM confidence)
- None required; local primary sources were sufficient.

### Tertiary (LOW confidence)
- Overleaf-first and bibliography backend recommendations where not explicitly locked by repository policy. [ASSUMED]

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM - strong constraints from course PDFs, but local TeX workflow choice remains open.
- Architecture: HIGH - directly grounded in existing repo structure and plantilla chapter map.
- Pitfalls: HIGH - validated by current repo/test inconsistencies and explicit verification artifacts.

**Research date:** 2026-04-08  
**Valid until:** 2026-05-08 (content and tooling assumptions should be rechecked if phase slips)
