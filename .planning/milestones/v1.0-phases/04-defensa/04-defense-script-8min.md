# Defensa CBD - Guion de emergencia (8 minutos)

Target: 8 minutes total.
Use when defense time is reduced.

## Time map

- 0:00-0:40 Context and objective
- 0:40-2:00 Technology decision
- 2:00-3:20 Data model and integrity
- 3:20-4:40 Implementation architecture
- 4:40-6:10 Trigger + monthly SQL analytics
- 6:10-7:20 Benchmark results
- 7:20-8:00 Conclusion and Q&A opening

## Script by block

### 0:00-0:40 - Opening
"Presento una app iOS offline-first de finanzas personales para demostrar capacidades de SQLite local en contexto academico CBD: consistencia, integridad y analitica sin backend."

### 0:40-2:00 - Why SQLite
"Compare AsyncStorage, Realm y SQLite. AsyncStorage no cubre SQL relacional ni FK declarativas. Realm es valido, pero el objetivo evaluado exige evidencia SQL explicita. Por eso selecciono expo-sqlite: ACID, claves foraneas, triggers y SUM/GROUP BY."

### 2:00-3:20 - Data model
"El modelo tiene cuatro entidades: cuentas, categorias, transacciones y presupuestos. Dos reglas clave: ON DELETE RESTRICT en cuenta_id para proteger historico y ON DELETE CASCADE en categoria_id para evitar huerfanos."

### 3:20-4:40 - Implementation
"La implementacion se divide en database.ts, repository.ts y App.tsx. En arranque activo PRAGMA foreign_keys y migro esquema versionado. Las escrituras criticas usan withExclusiveTransactionAsync para atomicidad."

### 4:40-6:10 - Trigger and analytics
"El trigger actualizar_presupuesto_tras_gasto descuenta restante automaticamente tras insertar un gasto; la regla vive en BD y no en UI. El informe mensual se calcula en SQL con SUM y GROUP BY, evitando recalculo en JavaScript."

### 6:10-7:20 - Results
"Benchmark reproducible con N=20000: insercion media 96.4607 ms, query con indice 2.4762 ms, query sin indice 1.9260 ms en dataset sintetico. Los datos y query plan estan versionados para trazabilidad."

### 7:20-8:00 - Close
"Conclusiones: SQLite local es viable para este caso offline-first, mantiene integridad y soporta analitica SQL con evidencia medible. Limitaciones actuales: sin sincronizacion remota y sin cifrado nativo final en esta fase. Gracias, abro preguntas."

## Fast Q&A (20-second answers)

Q1: Why SQLite instead of Realm?
A: "Porque el objetivo evaluado exige SQL explicito auditable: FK, triggers y agregaciones. SQLite alinea mejor practica y temario."

Q2: What does PRAGMA foreign_keys = ON do?
A: "Activa enforcement real de claves foraneas en SQLite; sin eso, RESTRICT/CASCADE no se aplican correctamente."

Q3: What does the trigger guarantee?
A: "Garantiza que restante del presupuesto se actualiza en el mismo contexto transaccional del gasto."

Q4: Why was query without index faster in this run?
A: "Depende de selectividad y shape del dataset sintetico; se reporta con transparencia junto a EXPLAIN QUERY PLAN."

## Slide selection for 8-minute mode

Keep only:
1. Title
2. Why SQLite
3. Data model
4. Architecture
5. Trigger
6. Benchmark
7. Conclusion
8. Q&A
