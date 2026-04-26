---
phase: 01
slug: diseno-redaccion-inicial
status: verified
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-08
updated: 2026-04-08
---

# Phase 01 - Validation Strategy

Per-phase validation contract for execution feedback loops.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| Framework | Node built-in test runner (`node --test`) |
| Config file | none (script-driven via `package.json`) |
| Quick run command | `npm run test:nyquist:phase1` |
| Full suite command | `npm run test:nyquist` |
| Estimated runtime | quick: ~5-10s, full: ~15-30s |

---

## Sampling Rate

- After every task commit: run `npm run test:nyquist:phase1`
- After every wave completion: run `npm run test:nyquist`
- Before `/gsd-verify-work`: full suite must be green (or exception documented in verification/UAT)
- Max feedback latency target: < 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-T1 | 01 | 1 | BD-03 | - | E/R reflects entities/FK semantics exactly | structural | `Select-String -Path docs/esquema/diagrama-er.md -Pattern "erDiagram|ON DELETE RESTRICT|ON DELETE CASCADE"` | yes | green |
| 01-01-T2 | 01 | 1 | BD-03 | - | Physical schema contains required constraints/triggers/index/view | structural | `Select-String -Path docs/esquema/schema.sql -Pattern "PRAGMA foreign_keys = ON|actualizar_presupuesto_tras_gasto|idx_txn_fecha|resumen_mensual"` | yes | green |
| 01-02-T1 | 02 | 2 | DOC-01,DOC-02,FMT-03,FMT-04 | - | Intro + state of art include IEEE markers and no APA pattern | structural | `npm run test:nyquist:phase1` | yes | green |
| 01-02-T2 | 02 | 2 | DOC-03,DOC-04,FMT-01,FMT-02 | - | Scope/design sections include table/figure anchors and ordering | structural | `npm run test:nyquist:phase1` | yes | green |
| 01-03-T1 | 03 | 3 | DOC-08,FMT-01,FMT-02 | T-01-03-03 | LaTeX scaffold includes mandatory indices and bibliography hooks | structural | `if ((Test-Path "memoria/memoria.tex") -and (Test-Path "memoria/references.bib")) { "OK" } else { exit 1 }` | planned output | green |
| 01-03-T2 | 03 | 3 | DOC-08,FMT-01,FMT-02 | T-01-03-01,T-01-03-02 | Scaffold/mapping validation prevents structure drift | unit | `node --test tests/nyquist/phase-01-latex-scaffold.test.js` | no (created by task) | green |
| 01-04-T1 | 04 | 4 | DOC-01,DOC-02,DOC-03,DOC-04,FMT-01,FMT-02 | T-01-04-01,T-01-04-02 | Core chapter migration preserves chapter/table semantics | structural | `if ((Select-String -Path "memoria/chapters/02-introduccion.tex" -Pattern "\\chapter{Introduccion}" -Quiet) -and (Select-String -Path "memoria/chapters/03-estudio-previo.tex" -Pattern "\\begin{table}" -Quiet) -and (Select-String -Path "memoria/chapters/04-analisis-problema.tex" -Pattern "\\label{tab:alcance-funcionalidades}" -Quiet)) { "OK" } else { exit 1 }` | no (created by task) | green |
| 01-04-T2 | 04 | 4 | DOC-04,FMT-02 | T-01-04-03 | Design chapter keeps ER/SQL evidence anchors | unit | `node --test tests/nyquist/phase-01-latex-chapters-core.test.js` | no (created by task) | green |
| 01-05-T1 | 05 | 4 | DOC-05 | T-01-05-02 | Implementation chapter cites real repo artifacts | structural | `if ((Select-String -Path "memoria/chapters/06-implementacion.tex" -Pattern "migrateDbIfNeeded" -Quiet) -and (Select-String -Path "memoria/chapters/06-implementacion.tex" -Pattern "withExclusiveTransactionAsync" -Quiet)) { "OK" } else { exit 1 }` | no (created by task) | green |
| 01-05-T2 | 05 | 4 | DOC-06,APP-07 | T-01-05-01 | Results chapter tied to benchmark data + figure contract | structural | `if ((Select-String -Path "memoria/chapters/07-pruebas.tex" -Pattern "phase3-benchmark.json" -Quiet) -and (Select-String -Path "memoria/figures/README.md" -Pattern "Figura 2|Figura 3|Figura 4" -Quiet)) { "OK" } else { exit 1 }` | no (created by task) | green |
| 01-05-T3 | 05 | 4 | APP-07 | T-01-05-03 | User/deploy manuals present and evidence checks enforced | unit | `node --test tests/nyquist/phase-01-latex-evidence.test.js` | no (created by task) | green |
| 01-06-T1 | 06 | 5 | DOC-07,DOC-08,DOC-09 | T-01-06-03 | Conclusions/IA/references are complete and linked | structural | `if ((Select-String -Path "memoria/chapters/08-conclusiones.tex" -Pattern "Limitaciones" -Quiet) -and (Select-String -Path "memoria/appendices/uso-ia.tex" -Pattern "trazabilidad" -Quiet) -and (Select-String -Path "memoria/references.bib" -Pattern "@" -Quiet)) { "OK" } else { exit 1 }` | no (created/updated by task) | green |
| 01-06-T2 | 06 | 5 | FMT-03,FMT-04,DEF-01 | T-01-06-01,T-01-06-02,T-01-06-04 | Compliance artifacts exist and are test-enforced | unit | `node --test tests/nyquist/phase-01-latex-compliance.test.js` | no (created by task) | green |
| 01-06-T3 | 06 | 5 | FMT-03,FMT-04 | T-01-06-01,T-01-06-02 | Human gate explicitly records citation/plagiarism decision | checkpoint | `if (Test-Path ".planning/phases/01-diseno-redaccion-inicial/01-HUMAN-UAT.md") { "OK" } else { exit 1 }` | yes | green |

Status legend: pending, green, red, flaky.

---

## Wave 0 Requirements

- [x] `node --test` available (framework already installed)
- [x] `npm run test:nyquist:phase1` and `npm run test:nyquist` exist in `package.json`
- [x] Baseline nyquist suite exists under `tests/nyquist/`
- [x] Every missing phase-specific test file has explicit owner task:
  - `tests/nyquist/phase-01-latex-scaffold.test.js` -> 01-03-T2
  - `tests/nyquist/phase-01-latex-chapters-core.test.js` -> 01-04-T2
  - `tests/nyquist/phase-01-latex-evidence.test.js` -> 01-05-T3
  - `tests/nyquist/phase-01-latex-compliance.test.js` -> 01-06-T2

No unowned Wave 0 blocker remains.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Citation completeness by claim | FMT-03 | Marker checks do not prove semantic sufficiency | Review `memoria/compliance/citation-audit.md`, verify each technical claim is backed by a real IEEE source, then log verdict in `01-HUMAN-UAT.md` |
| Originality/paraphrase audit | FMT-04 | Requires external anti-plagiarism tooling and academic judgement | Run institutional plagiarism checker, capture score/result in `memoria/compliance/plagiarism-audit.md`, then update `01-HUMAN-UAT.md` |
| Defense rehearsal quality gate | DEF-01 | Timing and oral clarity cannot be fully automated | Rehearse 10-15 min script, check slide-to-artifact traceability, log result in final checklist |

---

## Validation Sign-Off

- [x] All tasks have an automated verify command or explicit human-checkpoint command
- [x] Sampling continuity defined (quick and full cadence)
- [x] Wave 0 closure documented with explicit ownership
- [x] No watch-mode commands in verification contract
- [x] Nyquist strategy defined and frontmatter updated (`nyquist_compliant: true`)

Approval: verified 2026-04-08 (phase 01 Nyquist rerun green after gap closure)

## Validation Audit 2026-04-08

| Metric | Count |
|--------|-------|
| Gaps found | 1 |
| Resolved | 1 |
| Escalated | 0 |
