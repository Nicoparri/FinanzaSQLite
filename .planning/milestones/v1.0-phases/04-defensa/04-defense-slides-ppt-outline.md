# Defensa CBD - PPT Copy-Ready Outline

Use one section per slide. Paste title + bullets directly into your slide tool.

## Slide 1 - Titulo
Title:
Aplicacion iOS offline-first con SQLite local para finanzas personales

Bullets:
- Trabajo CBD - Universidad de Sevilla
- Caso de estudio: gestion financiera personal en iOS
- Pregunta central: SQLite local cubre consistencia y analitica sin backend?

## Slide 2 - Objetivo y alcance
Title:
Objetivo del trabajo y alcance

Bullets:
- Demostrar ACID, integridad referencial, triggers y SUM/GROUP BY en local
- Enfoque offline-first (sin sincronizacion remota)
- Entregable dual: documento academico + prototipo funcional

## Slide 3 - Eleccion tecnologica
Title:
Por que SQLite y no AsyncStorage/Realm

Bullets:
- AsyncStorage: clave-valor, sin SQL relacional ni FK declarativas
- Realm: fuerte en OO, menor foco SQL explicito para esta evaluacion
- SQLite (expo-sqlite): ACID + FK + triggers + agregaciones SQL

Insert visual:
- Tabla comparativa (Tabla 2 del paper)

## Slide 4 - Modelo de datos
Title:
Diseno de base de datos

Bullets:
- 4 entidades: cuentas, categorias, transacciones, presupuestos
- Regla 1: ON DELETE RESTRICT en cuenta_id (proteger historico)
- Regla 2: ON DELETE CASCADE en categoria_id (evitar huerfanos)

Insert visual:
- Figura 1 (E/R)

## Slide 5 - Arquitectura implementada
Title:
Implementacion tecnica en Expo + SQLite

Bullets:
- Inicializacion y migracion en database.ts
- Operaciones SQL de dominio en repository.ts
- UI funcional en App.tsx
- PRAGMA foreign_keys = ON + versionado de esquema

## Slide 6 - Trigger de negocio
Title:
Trigger para consistencia de presupuestos

Bullets:
- Al insertar gasto: restante se actualiza automaticamente
- Regla vive en la BD, no en la UI
- Menor riesgo de inconsistencias entre pantallas

Insert visual/code:
- Fragmento del trigger actualizar_presupuesto_tras_gasto

## Slide 7 - Analitica SQL
Title:
Informe mensual con SQL nativo

Bullets:
- Consulta con SUM y GROUP BY por categoria y mes
- Calculo dentro del motor SQLite
- Sin postproceso de agregacion en JavaScript

Insert visual:
- Consulta SQL resumida + salida ejemplo

## Slide 8 - Benchmark
Title:
Resultados de rendimiento

Bullets:
- Insercion masiva (N=20000): media 96.4607 ms
- Query con indice: media 2.4762 ms
- Query sin indice: media 1.9260 ms (dataset sintetico)
- Evidencia reproducible en JSON versionado

Insert visual:
- Tabla 3 + Tabla 4 (query plan)

## Slide 9 - Evidencia visual de app
Title:
Pantallas clave del prototipo

Bullets:
- Lista de transacciones
- Informe mensual
- Presupuestos con restante actualizado por trigger

Insert visual:
- Figura 2, Figura 3, Figura 4
- Si falta captura: usar placeholder y reemplazar antes de defensa

## Slide 10 - Conclusiones
Title:
Conclusiones

Bullets:
- SQLite local es viable para app financiera offline-first
- Integridad + analitica SQL demostradas con evidencia
- Arquitectura simple, trazable y alineada con temario CBD

## Slide 11 - Limitaciones y futuro
Title:
Limitaciones y trabajo futuro

Bullets:
- Sin sincronizacion remota en esta fase
- Cifrado nativo no implementado en build final
- Futuro: sincronizacion cifrada, pruebas en dispositivo fisico, extension Android

## Slide 12 - Cierre y preguntas
Title:
Cierre

Bullets:
- Resumen: problema, decision, implementacion, evidencia
- Gracias
- Preguntas tecnicas sobre SQLite, trigger, PRAGMA y benchmark

## Slide notes (speaker cues)

- Duracion objetivo total: 12 minutos (rango valido 10-15)
- Reparto sugerido:
  - Slides 1-2: 1.5 min
  - Slides 3-5: 3.5 min
  - Slides 6-8: 4.0 min
  - Slides 9-12: 3.0 min

## Source traceability

- Slide base content: .planning/phases/04-defensa/04-defense-slides.md
- Timed narrative and Q&A: .planning/phases/04-defensa/04-defense-script.md
- Metrics source: docs/paper/data/phase3-benchmark.json
- Figures contract: docs/paper/figures/README.md
