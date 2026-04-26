# 01-LATEX-MAPPING

Compact traceability matrix for scaffold stage (plan 01-03).

Primary template reference: plantillaMemoria.pdf.
Academic constraints reference: 00-Cuestiones sobre los trabajos.pdf and
CBD2526-Instrucciones entrega.pdf.

## Scope and ownership

- This file locks section order and source mapping at scaffold level.
- Full chapter migration is scheduled in plans 01-04, 01-05, and 01-06.
- This plan (01-03) only creates the structure and verification artifacts.

## Mapping Matrix

| Seccion plantilla | Fuente repo (source) | Archivo TeX destino | Requirement IDs | Estado |
| --- | --- | --- | --- | --- |
| Portada | plantillaMemoria.pdf + .planning/PROJECT.md | memoria/frontmatter/portada.tex | FMT-01, FMT-02 | scaffold listo |
| Resumen (ES) | docs/paper/01-introduccion.md + docs/paper/07-conclusiones.md | memoria/frontmatter/resumen-es.tex | DOC-01, DOC-07 | placeholder 01-03 |
| Abstract (EN) | docs/paper/01-introduccion.md + docs/paper/06-resultados-pruebas.md | memoria/frontmatter/abstract-en.tex | DOC-01, DOC-06 | placeholder 01-03 |
| Indice general/figuras/tablas | plantillaMemoria.pdf | memoria/memoria.tex | FMT-01, FMT-02 | implementado 01-03 |
| Capitulo 2 Introduccion | docs/paper/01-introduccion.md | memoria/chapters/02-introduccion.tex | DOC-01, FMT-03 | migra en 01-04 |
| Capitulo 3 Estudio previo | docs/paper/02-estado-arte.md | memoria/chapters/03-estudio-previo.tex | DOC-02, FMT-03 | migra en 01-04 |
| Capitulo 4 Analisis del problema | docs/paper/03-alcance.md + .planning/REQUIREMENTS.md | memoria/chapters/04-analisis-problema.tex | DOC-03 | migra en 01-04 |
| Capitulo 5 Diseno de la solucion | docs/paper/04-metodologia.md + docs/esquema/schema.sql | memoria/chapters/05-diseno-solucion.tex | DOC-04, BD-03 | migra en 01-04 |
| Capitulo 6 Implementacion | docs/paper/05-implementacion.md + src/db/database.ts + src/db/repository.ts | memoria/chapters/06-implementacion.tex | DOC-05, APP-02, APP-03, APP-04, APP-05, APP-06 | migra en 01-05 |
| Capitulo 7 Resultados y pruebas | docs/paper/06-resultados-pruebas.md + docs/paper/data/phase3-benchmark.json | memoria/chapters/07-pruebas.tex | DOC-06, APP-07 | migra en 01-05 |
| Capitulo 8 Conclusiones | docs/paper/07-conclusiones.md | memoria/chapters/08-conclusiones.tex | DOC-07 | migra en 01-06 |
| Referencias | docs/paper/08-referencias.md + memoria/references.bib | memoria/references.bib | DOC-08, FMT-03 | base 01-03, cierre 01-06 |
| Appendix: uso de IA | docs/paper/09-declaracion-ia.md | memoria/appendices/uso-ia.tex | DOC-09 | migra en 01-06 |
| Appendix: manual usuario | README.md + App.tsx | memoria/appendices/manual-usuario.tex | DEF-01 | migra en 01-05 |
| Appendix: manual despliegue | docs/DEPLOY-iOS.md | memoria/appendices/manual-despliegue.tex | DEF-01 | migra en 01-05 |

## Notes for next plans

1. Plan 01-04 migrates chapters 2-5 (core academic text and design evidence).
2. Plan 01-05 migrates chapters 6-7 and appendix manuals with implementation evidence.
3. Plan 01-06 finalizes chapter 8, references quality, and IA declaration traceability.
4. Any new source file used by later plans must be appended to this matrix before
   chapter text is considered complete.
