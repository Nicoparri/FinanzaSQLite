# Defensa CBD - Contenido de diapositivas (v1)

Duracion objetivo: 10-15 minutos (recomendado: 12 minutos)
Publico: Profesora y tribunal de la asignatura CBD
Formato: contenido base para exportar a PowerPoint/Canva/Google Slides

## Slide 01 - Titulo y problema

Titulo sugerido:
"Aplicacion iOS offline-first con SQLite local para finanzas personales"

Mensaje clave en slide:
- Trabajo CBD (Universidad de Sevilla)
- Caso: finanzas personales en iOS
- Pregunta central: "Puede SQLite local sostener consistencia + analitica sin servidor?"

Visual sugerido:
- Fondo limpio con 3 bloques: contexto, objetivo, resultado esperado.

Fuentes del mensaje:
- `docs/paper/01-introduccion.md`

## Slide 02 - Objetivo y alcance

Mensaje clave en slide:
- Objetivo: demostrar ACID, integridad referencial, triggers y consultas agregadas en local.
- Alcance: modo offline-first, sin sincronizacion remota.
- Entregables: documento academico + prototipo funcional.

Visual sugerido:
- Diagrama simple "Objetivo -> Implementacion -> Evidencia".

Fuentes del mensaje:
- `docs/paper/03-alcance.md`
- `.planning/PROJECT.md`

## Slide 03 - Por que SQLite y no AsyncStorage/Realm

Mensaje clave en slide:
- AsyncStorage: clave-valor, sin SQL de agregacion ni FK declarativas.
- Realm: buen rendimiento OO, pero menos alineado al objetivo de demostrar SQL academico.
- SQLite: SQL relacional, ACID, FK, triggers, SUM/GROUP BY.

Visual sugerido:
- Reutilizar tabla comparativa con resaltado en columna SQLite.

Figura/tabla a insertar:
- Tabla 2 (comparativa de SGBD)

Fuentes del mensaje:
- `docs/paper/02-estado-arte.md`

## Slide 04 - Diseno de la base de datos

Mensaje clave en slide:
- Modelo E/R con 4 entidades: cuentas, categorias, transacciones, presupuestos.
- Relaciones clave: RESTRICT para cuentas, CASCADE para categorias.

Visual sugerido:
- Figura 1 completa (diagrama E/R).

Figura/tabla a insertar:
- Figura 1 (E/R)

Fuentes del mensaje:
- `docs/esquema/diagrama-er.md`
- `docs/paper/04-metodologia.md`

## Slide 05 - Implementacion tecnica en Expo + SQLite

Mensaje clave en slide:
- Inicializacion con migracion y `PRAGMA foreign_keys = ON`.
- Transacciones criticas con `withExclusiveTransactionAsync`.
- Separacion en capas: `database.ts`, `repository.ts`, `App.tsx`.

Visual sugerido:
- Bloques de arquitectura por capas (3 cajas).

Fuentes del mensaje:
- `docs/paper/05-implementacion.md`
- `src/db/database.ts`
- `src/db/repository.ts`

## Slide 06 - Trigger de negocio (punto fuerte)

Mensaje clave en slide:
- Regla: al insertar un gasto, se descuenta automaticamente `restante` del presupuesto.
- Ventaja: consistencia en BD, no en la UI.

Fragmento a mostrar en slide (resumido):
```sql
CREATE TRIGGER IF NOT EXISTS actualizar_presupuesto_tras_gasto
AFTER INSERT ON transacciones
WHEN NEW.tipo = 'gasto'
BEGIN
  UPDATE presupuestos
  SET restante = restante - NEW.importe
  WHERE categoria_id = NEW.categoria_id;
END;
```

Fuentes del mensaje:
- `docs/esquema/schema.sql`
- `docs/paper/04-metodologia.md`
- `docs/paper/05-implementacion.md`

## Slide 07 - Analitica SQL y reporte mensual

Mensaje clave en slide:
- Informe mensual calculado en SQL con `SUM` y `GROUP BY`.
- No se recalculan agregaciones en JavaScript.

Visual sugerido:
- Captura del SQL de agregacion + mini salida ejemplo por categoria.

Fuentes del mensaje:
- `docs/paper/05-implementacion.md`
- `src/db/repository.ts`

## Slide 08 - Resultados cuantitativos (benchmark)

Mensaje clave en slide:
- Insercion masiva: media 96.46 ms para N=20000.
- Consulta con indice: media 2.4762 ms.
- Consulta sin indice: media 1.9260 ms en dataset sintetico (speedup 0.78x).

Visual sugerido:
- Tabla 3 simplificada + nota de interpretacion tecnica.

Figura/tabla a insertar:
- Tabla 3 (resultados)
- Tabla 4 (EXPLAIN QUERY PLAN resumido)

Fuentes del mensaje:
- `docs/paper/06-resultados-pruebas.md`
- `docs/paper/data/phase3-benchmark.json`

## Slide 09 - Evidencia visual del prototipo

Mensaje clave en slide:
- Flujo funcional mostrado en 3 pantallas: transacciones, informe mensual, presupuestos.
- La evidencia visual es consistente con los requisitos APP-07.

Visual sugerido:
- Collage de 3 capturas.

Figura/tabla a insertar:
- Figura 2: transacciones
- Figura 3: informe mensual
- Figura 4: presupuestos con trigger

Fuentes del mensaje:
- `docs/paper/figures/README.md`
- `docs/paper/06-resultados-pruebas.md`

Nota de estado actual:
- Si las capturas aun no existen, usar placeholders y completar antes de defender.

## Slide 10 - Conclusiones

Mensaje clave en slide:
- SQLite local es viable para finanzas personales offline-first.
- Se valida integridad y analitica SQL en iOS sin backend.
- Evidencia reproducible y trazable en artefactos de proyecto.

Visual sugerido:
- 3 bullets de cierre + bloque "limitaciones".

Fuentes del mensaje:
- `docs/paper/07-conclusiones.md`

## Slide 11 - Limitaciones y trabajo futuro

Mensaje clave en slide:
- Limitaciones: sin sincronizacion remota, sin cifrado nativo implementado en esta fase.
- Futuro: sincronizacion cifrada, evaluacion en iPhone fisico, extension Android.

Visual sugerido:
- Matriz "actual / futuro".

Fuentes del mensaje:
- `docs/paper/07-conclusiones.md`
- `docs/paper/09-declaracion-ia.md`

## Slide 12 - Cierre y preguntas

Mensaje clave en slide:
- "Gracias. Quedo disponible para preguntas tecnicas sobre SQL, triggers y resultados."

Visual sugerido:
- Pantalla limpia con 4 etiquetas: SQLite, Trigger, PRAGMA, Benchmark.

Fuentes del mensaje:
- `.planning/phases/04-defensa/04-defense-script.md`

## Mapa de cobertura y trazabilidad (quality gate)

| Slide | Mensaje evaluable | Evidencia obligatoria | Fuente canonica | Tiempo base |
|---|---|---|---|---|
| 01 | Contexto y problema | Titulo + pregunta central | `docs/paper/01-introduccion.md` | 0:45 |
| 02 | Objetivo y alcance offline-first | Diagrama objetivo -> implementacion -> evidencia | `docs/paper/03-alcance.md` | 0:45 |
| 03 | Justificacion de SQLite | Tabla comparativa SGBD (Tabla 2) | `docs/paper/02-estado-arte.md` | 1:30 |
| 04 | Modelo de datos | Figura 1 (E/R) + cardinalidades | `docs/paper/04-metodologia.md` | 1:15 |
| 05 | Arquitectura tecnica | Capas DB/repo/UI + PRAGMA | `docs/paper/05-implementacion.md` | 1:00 |
| 06 | Regla de negocio en trigger | Fragmento SQL legible | `docs/esquema/schema.sql` | 1:30 |
| 07 | Analitica en SQL | Consulta SUM/GROUP BY y salida ejemplo | `src/db/repository.ts` | 1:15 |
| 08 | Resultados y lectura critica | Tabla 3 + Tabla 4 + unidades/escenario | `docs/paper/data/phase3-benchmark.json` | 1:45 |
| 09 | Evidencia visual APP-07 | Figuras 2, 3 y 4 | `docs/paper/figures/README.md` | 0:45 |
| 10 | Conclusiones | 3 hallazgos verificables | `docs/paper/07-conclusiones.md` | 0:35 |
| 11 | Limitaciones y futuro | Limites actuales + mejoras concretas | `docs/paper/07-conclusiones.md` | 0:35 |
| 12 | Cierre + apertura a preguntas | Recapitulacion de defensa | `.planning/milestones/v1.0-phases/04-defensa/04-defense-script.md` | 0:15 |

Regla de salida:
- No se marca deck como listo si algun slide no tiene evidencia y fuente explicita.

## Checklist de montaje final

- [ ] Verificar que cada slide incluya la referencia visual solicitada.
- [ ] Confirmar que Tabla 2, Figura 1 y fragmento de trigger esten visibles y legibles.
- [ ] Confirmar que los numeros de benchmark coinciden con `phase3-benchmark.json`.
- [ ] Sustituir placeholders por capturas reales de `docs/paper/figures/`.
- [ ] Verificar legibilidad visual (tamano de letra y contraste) desde la ultima fila del aula.
- [ ] Verificar que ninguna captura contiene datos sensibles, rutas locales o overlays de debug.
- [ ] Exportar en PDF para respaldo y en formato editable para exposicion.
