# Defensa CBD — Guion cronometrado alineado a `memoria/PresentacionCBD.pptx`

Presentación: 19 slides · Duración objetivo: **12 minutos** (rango 10–13) · Q&A aparte
Autor: Nicolás Parrilla Géniz · Profesora: Toñi Reina · Curso 2025/2026

> El guion sigue una correspondencia 1:1 con el .pptx. Cada bloque indica el slide en pantalla, qué decir y la transición.

---

## Mapa de tiempos

| Slide | Tema                            | Entrada | Duración |
|-------|---------------------------------|---------|----------|
| 1     | Portada                         | 0:00    | 0:20     |
| 2     | Decisión cotidiana              | 0:20    | 0:30     |
| 3     | Objetivo (3 metas)              | 0:50    | 0:40     |
| 4     | Comparativa SGBDM               | 1:30    | 1:00     |
| 5     | Stack técnico                   | 2:30    | 0:50     |
| 6     | Alcance funcional (4 casos)     | 3:20    | 0:50     |
| 7     | Modelo E/R                      | 4:10    | 0:50     |
| 8     | Esquema físico SQL              | 5:00    | 0:50     |
| 9     | Atomicidad ACID (código TS)     | 5:50    | 0:50     |
| 10    | Trigger AFTER INSERT            | 6:40    | 0:50     |
| 11    | Agregación SQL nativa           | 7:30    | 0:50     |
| 12    | Evidencia visual (5 pantallas)  | 8:20    | 0:40     |
| 13    | Demo / 3 atributos              | 9:00    | 0:30     |
| 14    | Resultados benchmark            | 9:30    | 0:50     |
| 15    | EXPLAIN QUERY PLAN              | 10:20   | 0:50     |
| 16    | Limitaciones                    | 11:10   | 0:30     |
| 17    | Trabajo futuro                  | 11:40   | 0:30     |
| 18    | Conclusiones (3 ideas)          | 12:10   | 0:30     |
| 19    | Gracias / Q&A                   | 12:40   | —        |

Total ponente: **~12:40 min**. Margen de seguridad para cortes: 1:00–1:30.

---

## Guion slide por slide

### Slide 1 · Portada (0:00 — 0:20)
> En pantalla: título "Almacenamiento móvil en iOS con SQLite — App de finanzas personales offline-first".

"Buenos días. Soy Nicolás Parrilla. Defiendo el trabajo de la asignatura CBD: el diseño y evaluación de una aplicación iOS de finanzas personales que utiliza SQLite local de forma offline-first."

*Transición:* "Empiezo por el problema."

---

### Slide 2 · Una decisión cotidiana (0:20 — 0:50)
> En pantalla: "Anotas un gasto en el metro — sin red".

"Imaginad que anotáis un gasto en el metro. Sin cobertura. La aplicación tiene que aceptar el dato, mantener su consistencia y, al volver a la red, no haber roto ninguna regla. Disponibilidad y consistencia local no son detalles de implementación: son **requisitos**."

*Transición:* "De ese requisito nacen tres metas verificables."

---

### Slide 3 · Objetivo del trabajo (0:50 — 1:30)
> En pantalla: tres metas — DISEÑAR, IMPLEMENTAR, EVALUAR.

"Tres objetivos. **Primero**, diseñar un esquema relacional móvil para finanzas personales. **Segundo**, implementar un prototipo iOS offline-first con expo-sqlite. **Tercero**, evaluar empíricamente ACID, integridad referencial y consultas agregadas con métricas reproducibles. Las tres metas son verificables; cada una se mapea a artefactos del documento."

*Transición:* "Antes del cómo, justifico el porqué."

---

### Slide 4 · Comparativa de opciones (1:30 — 2:30)
> En pantalla: tabla AsyncStorage / Realm / expo-sqlite.

"Comparé tres alternativas. **AsyncStorage** es clave-valor: ni claves foráneas, ni relaciones, ni SQL. Queda fuera. **Realm** es válido y rápido, pero su modelo orientado a objetos oculta el SQL — y precisamente la asignatura CBD exige demostrar conceptos relacionales. **expo-sqlite** ofrece ACID, claves foráneas declarativas y consultas SUM/GROUP BY nativas. Es la única alternativa que demuestra los conceptos del temario; por eso fue la elección."

*Transición:* "Sobre esa decisión se monta el stack."

---

### Slide 5 · Stack técnico elegido (2:30 — 3:20)
> En pantalla: tres capas — UI / Persistencia / Paradigma.

"Tres capas. La **UI**, en React Native con Expo SDK 54 y TypeScript estricto — Expo Go permite desarrollar sin Xcode. La **persistencia**, expo-sqlite: el motor SQLite embebido en iOS, con acceso a PRAGMA, triggers e índices. Y el **paradigma**: offline-first, sin sincronización remota. Esta última decisión es metodológica: aísla el rendimiento del SGBD del ruido de la red, para que los números no estén contaminados."

*Transición:* "El alcance se concreta en cuatro casos de uso."

---

### Slide 6 · Alcance funcional (3:20 — 4:10)
> En pantalla: cuatro casos — Movimiento / Informe / Presupuesto / Borrado.

"Cada funcionalidad expone una pieza distinta del SGBD; trazabilidad uno-a-uno entre UI y motor. **Uno**, alta de movimiento dentro de una transacción exclusiva — atomicidad ACID. **Dos**, informe mensual con SUM y GROUP BY filtrado por fecha. **Tres**, presupuesto automático mediante un trigger AFTER INSERT que decrementa el saldo restante. **Cuatro**, borrado con integridad referencial: RESTRICT en cuentas, CASCADE en categorías. Cuatro casos, cuatro conceptos del temario."

*Transición:* "El modelo de datos los soporta."

---

### Slide 7 · Modelo Entidad-Relación (4:10 — 5:00)
> En pantalla: diagrama E/R con cuatro entidades.

"Cuatro entidades — cuentas, categorías, transacciones y presupuestos — y dos reglas de borrado clave. **Cuentas a transacciones**, ON DELETE RESTRICT: no se puede borrar una cuenta con histórico, protegiendo la trazabilidad financiera. **Categorías a transacciones**, ON DELETE CASCADE: si se borra una categoría, sus movimientos se limpian. **Categorías a presupuestos**, UNIQUE: un presupuesto activo por categoría, garantizado a nivel de esquema."

*Transición:* "Estas reglas viven en el motor."

---

### Slide 8 · Esquema físico SQL (5:00 — 5:50)
> En pantalla: cuatro PRAGMA / CHECK / UNIQUE.

"Cuatro decisiones que viven en SQL, no en JavaScript. **Una**, `PRAGMA foreign_keys = ON`: SQLite no aplica FK por defecto, hay que activarlo en cada conexión. **Dos**, `CHECK (tipo IN ('ingreso','gasto'))` restringe el dominio enumerado. **Tres**, `CHECK (importe > 0)` veta importes inválidos sin código JS. **Cuatro**, `UNIQUE(categoria_id)` en presupuestos garantiza un único presupuesto activo. Validación declarativa: el motor protege la integridad."

*Transición:* "Vamos a la atomicidad real, en código."

---

### Slide 9 · Atomicidad — ACID en SQLite (5:50 — 6:40)
> En pantalla: snippet TypeScript con `withExclusiveTransactionAsync`.

"Toda alta de movimiento se ejecuta dentro de `withExclusiveTransactionAsync`. El INSERT y el trigger asociado quedan en la **misma frontera transaccional**: o todo ocurre, o nada ocurre. La interfaz nunca observa estados intermedios. ACID vive en SQLite, no en JavaScript — y eso es lo que hace la app robusta sin depender de lógica de aplicación."

*Transición:* "Esa misma frontera la aprovecha el trigger."

---

### Slide 10 · Reglas de negocio en el motor (6:40 — 7:30)
> En pantalla: `CREATE TRIGGER actualizar_presupuesto_tras_gasto AFTER INSERT ON transacciones`.

"El trigger se dispara después del INSERT, evalúa la guarda `WHEN NEW.tipo = 'gasto'`, y decrementa `restante` de la categoría afectada — todo dentro de la transacción del INSERT. Hay una sola fuente de verdad: el SGBD. La UI no recalcula nada; la consistencia es declarativa. Si la transacción aborta, el ROLLBACK alcanza también al UPDATE del trigger."

*Transición:* "El reporting sigue la misma filosofía."

---

### Slide 11 · Agregación SQL nativa (7:30 — 8:20)
> En pantalla: `SELECT SUM(importe), COUNT(id) FROM transacciones JOIN categorias ... GROUP BY ...`.

"El informe mensual se calcula con SUM, COUNT, JOIN y GROUP BY directamente en SQL, filtrado por `strftime('%Y-%m', fecha)`. Menos memoria, menos código, semántica declarativa. **El motor agrega; JavaScript pinta.** Esto es exactamente lo que el temario CBD pide demostrar: que las capacidades relacionales viven en el SGBD, no en la capa de aplicación."

*Transición:* "Veamos la app en marcha."

---

### Slide 12 · Evidencia visual (8:20 — 9:00)
> En pantalla: cinco capturas — Inicio, Movimientos, Presupuestos, Analítica, Ajustes.

"Cinco pantallas que cierran la trazabilidad UI ↔ SGBD. Inicio con balance y tendencia semanal. Movimientos agrupados por fecha. Presupuestos con el saldo `restante` actualizado por el trigger. Analítica con ranking por categoría usando SUM. Y ajustes, donde se demuestra el borrado con integridad referencial."

*Transición:* "Resumen en tres palabras."

---

### Slide 13 · Demo · tres atributos (9:00 — 9:30)
> En pantalla: Intuitiva · Reactiva · Offline.

"La aplicación se caracteriza en tres palabras. **Intuitiva**: la interfaz guía cada acción sin curva de aprendizaje. **Reactiva**: las consultas y actualizaciones se ejecutan en milisegundos gracias al motor SQLite embebido. **Offline**: los datos están siempre disponibles, sin red ni servidores externos."

*Transición:* "Pasamos a los números."

---

### Slide 14 · Resultados del benchmark (9:30 — 10:20)
> En pantalla: tabla `bulk_insert`, `query_with_index`, `query_without_index`.

"Tres pruebas. La inserción masiva de **20.000 filas** dentro de una transacción exclusiva tarda **96,5 ms** en media — coherente con escrituras ACID a esa escala. Y aquí aparece el hallazgo: la consulta SUM mensual con índice tarda **2,5 ms**, **sin índice 1,9 ms**. El índice no acelera. Esto exige explicación, no asumir nada."

*Transición:* "EXPLAIN QUERY PLAN da la respuesta."

---

### Slide 15 · EXPLAIN QUERY PLAN (10:20 — 11:10)
> En pantalla: comparación con/sin índice.

"Con índice, el plan es `SEARCH USING INDEX idx_txn_fecha` más un B-Tree temporal para el ORDER BY. Sin índice, `SCAN` secuencial más un único B-Tree para GROUP BY y ORDER BY combinados. **A 20.000 filas, el coste del ORDER BY pesa más que el filtro temporal**. La lección es importante: el rendimiento de un índice depende de cardinalidad y plan completo, no del filtro aislado. EXPLAIN QUERY PLAN es la herramienta de diagnóstico — y forma parte del aprendizaje del trabajo."

*Transición:* "Conviene reconocer los límites."

---

### Slide 16 · Limitaciones del estudio (11:10 — 11:40)
> En pantalla: tres limitaciones.

"Tres limitaciones honestas. **Una**, las métricas se miden en escritorio: reproducibles y aisladas, pero falta validar sobre iPhone físico. **Dos**, no hay sincronización remota: queda fuera de alcance la replicación o resolución de conflictos. **Tres**, sin cifrado avanzado: SQLCipher queda fuera del alcance académico. Estas exclusiones son intencionales y acotan la evaluación."

*Transición:* "Y abren tres líneas de continuidad."

---

### Slide 17 · Trabajo futuro (11:40 — 12:10)
> En pantalla: tres líneas — hardware, sincronización, cifrado.

"Tres líneas naturales. **Replicar** los benchmarks sobre iPhone físico ARM real. **Sincronización segura** con un backend, valorando CRDT o last-write-wins, manteniendo offline-first como base. Y **cifrado en reposo** con SQLCipher, midiendo el coste cifrado-vs-latencia."

*Transición:* "Y para terminar, tres ideas."

---

### Slide 18 · Conclusiones — tres ideas (12:10 — 12:40)
> En pantalla: tres conclusiones.

"**Una**, SQLite local es viable para finanzas móviles offline-first — viabilidad técnica demostrada empíricamente. **Dos**, delegar reglas al SGBD, mediante FK, triggers y agregaciones, reduce errores y mantenimiento — la consistencia es declarativa. **Tres**, la evidencia empírica importa: índice no equivale a más rápido. EXPLAIN QUERY PLAN es la herramienta para razonar sobre el rendimiento."

*Transición:* "Cierro."

---

### Slide 19 · Gracias / Preguntas (12:40 — fin)
> En pantalla: "Gracias. ¿Preguntas?".

"Gracias por la atención. Quedo a disposición para cualquier pregunta."

---

## Q&A — Preguntas probables y respuestas preparadas

**1. ¿Por qué offline-first y no online?**
> "Para aislar las métricas del SGBD del ruido de la red. Una sincronización remota introduce latencias y errores que no son atribuibles al motor; al excluirla, los números reflejan exclusivamente el comportamiento de SQLite."

**2. ¿Cómo se garantiza la atomicidad si el dispositivo se apaga durante una transacción?**
> "SQLite implementa journaling: en modo rollback journal o WAL, una transacción incompleta se descarta al reabrir la base. Así, el INSERT y su trigger asociado son atómicos incluso ante un apagado abrupto."

**3. ¿Por qué `withExclusiveTransactionAsync` y no `withTransactionAsync`?**
> "Exclusive bloquea la base contra escrituras concurrentes durante la transacción, garantizando aislamiento estricto. En este escenario móvil de un solo proceso es ligeramente más restrictivo de lo necesario, pero garantiza ACID puro y simplifica el razonamiento sobre el orden de operaciones."

**4. ¿Por qué CASCADE en categorías y RESTRICT en cuentas?**
> "Son decisiones semánticas. Borrar una cuenta debe estar prohibido si hay histórico — afecta trazabilidad financiera y auditoría, por eso RESTRICT. Borrar una categoría es una operación de mantenimiento del catálogo: si el usuario decide eliminarla, los movimientos asociados pierden sentido como categorizados, y CASCADE limpia coherentemente."

**5. ¿Por qué el índice no aceleró la consulta?**
> "A 20.000 filas el plan completo pesa más que el filtro temporal. El índice acelera el `WHERE`, pero introduce un B-Tree temporal adicional para el ORDER BY. Sin índice, el motor combina GROUP BY y ORDER BY en un solo B-Tree, ahorrando trabajo. EXPLAIN QUERY PLAN deja ver exactamente esa diferencia. A escalas mayores el balance probablemente se invertiría."

**6. ¿Qué pasaría con miles de usuarios concurrentes?**
> "El escenario móvil es por diseño mono-usuario y mono-proceso por dispositivo. SQLite soporta múltiples lectores y un único escritor activo; en concurrencia masiva no es la herramienta adecuada, y por eso esta arquitectura es offline-first y local. La sincronización con un servidor compartido es trabajo futuro."

**7. ¿Cómo garantiza la integridad referencial si SQLite no la activa por defecto?**
> "Ejecutamos `PRAGMA foreign_keys = ON` como primera sentencia al abrir cada conexión, fuera de cualquier transacción. La suite de tests verifica explícitamente este pragma."

**8. ¿Por qué expo-sqlite y no la API nativa de iOS Core Data?**
> "Core Data es una capa de abstracción Objective-C/Swift sobre SQLite, pero oculta el SQL. El objetivo académico CBD pide demostrar SQL relacional explícito — triggers, FK, SUM/GROUP BY visibles. expo-sqlite expone el motor crudo y permite enseñar exactamente esos conceptos."

---

## Notas de ensayo

- **Cronometrar** en cada ensayo: pausar al cambiar de slide y verificar que coincide con el mapa.
- **Punto de corte de emergencia** si quedan 3 minutos: saltar de slide 11 directamente a slide 14 (resultados) → 18 (conclusiones) → 19. Ver `04-defense-script-8min.md` para versión reducida.
- **Errores típicos a evitar**: leer el slide literal, perder contacto visual con tribunal, justificar sin afirmar ("creo que…"). El trabajo está hecho — defenderlo con seguridad.
- Antes de la slide 9 y 10 (snippets de código), **dar 2 segundos** para que el tribunal ubique el código antes de hablar.
- Para la slide 14–15 (benchmark), **mantener tono de hallazgo**, no de error: el resultado contraintuitivo es parte del aprendizaje.
