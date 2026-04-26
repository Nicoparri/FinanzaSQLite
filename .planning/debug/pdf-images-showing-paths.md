---
status: diagnosed
trigger: "UAT Test 2: images should render in final PDF, but user sees route/path instead of image"
created: 2026-04-08T00:00:00Z
updated: 2026-04-08T19:20:00Z
---

## Current Focus

hypothesis: Figure include paths are incorrect relative to the main file directory (memoria/), so LaTeX resolves to non-existent files; this manifests as path text placeholders in user-observed output.
test: Compare includegraphics paths in chapter 07 against actual files on disk and LaTeX main-file path resolution; also verify draft-mode flags are absent.
expecting: includegraphics uses ../figures/... while actual files are at memoria/figures/..., and no draft options are configured in TeX/build docs.
next_action: Return root-cause diagnosis only (no code fix implementation).

## Symptoms

expected: images should render in final PDF
actual: user reports "Las imagenes no se muestran, se muestra la ruta"
errors: none reported in UAT gap description
reproduction: Run UAT Test 2 against final PDF output and inspect figures/tables/section references.
started: discovered during UAT

## Eliminated

- hypothesis: Global or package-level draft mode is forcing image path placeholders.
	evidence: No draft flags found in memoria TeX sources (document class, graphicx, Gin keys, PassOptionsToPackage) and build instructions do not use draft options.
	timestamp: 2026-04-08T19:12:00Z

## Evidence

- timestamp: 2026-04-08T19:08:00Z
	checked: memoria/memoria.tex
	found: Main document uses \documentclass[12pt,a4paper]{report} and \usepackage{graphicx}; no draft option at root.
	implication: Root TeX configuration does not intentionally disable image rendering.

- timestamp: 2026-04-08T19:09:00Z
	checked: memoria/chapters/07-pruebas.tex
	found: All figure includes point to ../figures/figura-2..4-*.png.
	implication: Paths are likely resolved one level above memoria/ when compiling memoria.tex.

- timestamp: 2026-04-08T19:10:00Z
	checked: Filesystem path checks
	found: memoria/figures/figura-2..4-*.png exist (True), while memoria/../figures/figura-2..4-*.png do not exist (False).
	implication: Include paths used in chapter 07 do not map to actual files.

- timestamp: 2026-04-08T19:11:00Z
	checked: memoria/figures/README.md and memoria/compliance/final-delivery-checklist.md
	found: Canonical image location is documented as memoria/figures/figura-2..4-*.png.
	implication: Documentation and file contract contradict current includegraphics paths.

- timestamp: 2026-04-08T19:12:00Z
	checked: TeX/build draft-related settings
	found: No draft matches across memoria/*.tex; memoria/BUILD.md compile commands use pdflatex/latexmk without draft options.
	implication: Draft mode is unlikely to be the primary root cause in source configuration.

- timestamp: 2026-04-08T19:14:00Z
	checked: .planning/phases/01-diseno-redaccion-inicial/01-VERIFICATION.md
	found: Phase verification marks APP-07 as wired based on includegraphics presence, without asserting resolved/valid image paths.
	implication: Path mismatch could pass prior checks and surface only in final PDF UAT.

## Resolution

root_cause: The three \includegraphics commands in memoria/chapters/07-pruebas.tex use ../figures/... paths that are wrong relative to memoria/memoria.tex compilation context; the real files are in memoria/figures/..., so image resolution fails in final output.
fix: Diagnose-only mode. No fix applied.
verification: 
files_changed: []
