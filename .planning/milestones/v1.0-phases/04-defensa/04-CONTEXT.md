---
phase: "04"
name: "Defensa"
created: 2026-04-06
mode: autonomous-auto-defaults
---

# Phase 4: Defensa - Context

## Phase Boundary

Preparar la defensa oral final del trabajo CBD con un paquete utilizable en clase: contenido de diapositivas, guion cronometrado de 10-15 minutos y respuestas preparadas para preguntas probables de la profesora.

## Auto-Selected Decisions (Non-Interactive)

1. Formato del entregable de defensa
- El contenido de diapositivas se entrega como guion estructurado en Markdown para facilitar exportacion a PowerPoint/Canva/Google Slides.
- El guion oral se entrega separado con bloques temporales acumulados (minuto a minuto).

2. Evidencia obligatoria por diapositiva
- La presentacion referencia figuras y mensajes clave ya existentes en el proyecto.
- Se incluyen de forma explicita: diagrama E/R, tabla comparativa de SGBD, fragmento de trigger SQL y evidencia visual de app.

3. Preguntas esperadas de evaluacion
- Se preparan respuestas concretas sobre: SQLite vs Realm, trigger, PRAGMA foreign_keys y resultados de rendimiento.
- Se agregan preguntas adicionales de respaldo sobre limitaciones y trabajos futuros.

4. Cierre GSD para fase 4
- Se generan `04-01-PLAN.md`, `04-01-SUMMARY.md` y `04-VERIFICATION.md` en la carpeta de fase.
- Se actualizan `ROADMAP.md` y `STATE.md` para reflejar fase 4 completada.
- No se ejecutan tareas de cierre de milestone (`audit`, `complete`, `cleanup`) por requerimiento de parada en `--to 4`.

## Constraints Applied

- Mantener coherencia academica y estilo documental usado en fases 1-3.
- Conservar ASCII cuando sea posible.
- Evitar inventar resultados o citas no presentes en artefactos previos.

## Canonical References

- `docs/paper/01-introduccion.md` - Mensaje de apertura y objetivo del trabajo.
- `docs/paper/02-estado-arte.md` - Tabla 2 de comparativa AsyncStorage/Realm/SQLite.
- `docs/paper/03-alcance.md` - Tabla 1 de funcionalidades y conceptos de BD movil.
- `docs/paper/04-metodologia.md` - Figura 1 (E/R), PRAGMA y trigger.
- `docs/esquema/schema.sql` - SQL fuente de trigger, indices y restricciones FK.
- `docs/paper/06-resultados-pruebas.md` - Tabla 3, Tabla 4 y conclusiones de benchmark.
- `docs/paper/data/phase3-benchmark.json` - Valores numericos reproducibles de rendimiento.
- `docs/paper/figures/README.md` - Contrato de capturas iOS para evidencia visual.

## Deferred Ideas

- Preparar una version extendida de 20 minutos para defensa ampliada.
- Incorporar demo en vivo en dispositivo fisico fuera del tiempo principal de exposicion.
