---
phase: 04
slug: defensa
status: partial
nyquist_compliant: false
wave_0_complete: true
created: 2026-04-07
---

# Phase 04 - Validation Strategy

## Test Infrastructure

| Property | Value |
|----------|-------|
| Framework | node:test |
| Config file | none |
| Quick run command | `node --test tests/nyquist/phase-04.test.js` |
| Full suite command | `node --test tests/nyquist/*.test.js` |
| Estimated runtime | ~4 seconds |

## Sampling Rate

- After every task commit: run `node --test tests/nyquist/phase-04.test.js`
- After every plan wave: run `node --test tests/nyquist/*.test.js`
- Before `/gsd-verify-work`: full suite must be green
- Max feedback latency: 10 seconds

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | DEF-01 | - | Slides artifact includes required evidence references | unit | `node --test tests/nyquist/phase-04.test.js` | yes | green |
| 04-01-02 | 01 | 1 | DEF-02 | - | Script contains expected technical Q&A themes | unit | `node --test tests/nyquist/phase-04.test.js` | yes | green |
| 04-02-01 | 02 | 1 | DEF-01 | - | Coverage map and traceability gate documented | unit | `node --test tests/nyquist/phase-04.test.js` | yes | green |
| 04-02-02 | 02 | 1 | DEF-02 | - | Rehearsal time profiles and expanded Q&A documented | unit | `node --test tests/nyquist/phase-04.test.js` | yes | green |

## Wave 0 Requirements

- Existing infrastructure covers artifact-level requirements.

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Final oral rehearsal quality and timing confirmation | DEF-02 | Requires human speech delivery and real-time pacing | Run 10 and 12-15 minute rehearsals and complete script rehearsal log |
| Final deck visual check in presentation tool | DEF-01 | Requires visual rendering in PPT/Canva/Slides | Validate readability, contrast, and evidence legibility in rendered deck |

## Validation Sign-Off

- [x] All tasks have automated verify or explicit manual-only mapping
- [x] Sampling continuity defined
- [x] Wave 0 completed with node:test suite
- [x] No watch-mode flags
- [x] Feedback latency < 10s target
- [ ] `nyquist_compliant: true` (blocked by manual rehearsal/render checks)

Approval: pending
