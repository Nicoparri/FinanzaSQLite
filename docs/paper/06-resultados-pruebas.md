En esta seccion se presentan las pruebas realizadas sobre el prototipo y las metricas obtenidas mediante un benchmark reproducible. El objetivo es cuantificar el costo de insercion masiva y el tiempo de consulta agregada con y sin indices, manteniendo el foco en SQLite local [3], [7].

## Protocolo de medicion reproducible

El benchmark se implementa en `scripts/benchmark_sqlite.py` y se ejecuta con semilla fija para reproducibilidad. La salida completa se guarda en `docs/paper/data/phase3-benchmark.json`.

Comando ejecutado:

```bash
python scripts/benchmark_sqlite.py --n 20000 --runs 5 --query-runs 25 --seed 20260406
```

Configuracion del experimento:

- Transacciones por corrida: 20000
- Corridas independientes: 5
- Consultas agregadas por corrida y escenario: 25
- Ventana de consulta: `2025-10-01` a `2025-11-01`
- Entorno: Python 3.12.10, Windows 11

## Resultados de rendimiento

En la Tabla 3 se muestran los tiempos medidos en milisegundos a partir del JSON generado por el benchmark.

*Tabla 3*  
*Metricas de rendimiento SQLite obtenidas en fase 3 (N = 20000)*

| Prueba | Muestras | Media (ms) | Mediana (ms) | Min (ms) | Max (ms) | Desv. est. (ms) |
|---|---:|---:|---:|---:|---:|---:|
| Insercion en bloque (`bulk_insert`) | 5 | 96.4607 | 92.7875 | 84.7695 | 109.4610 | 9.6274 |
| Consulta con indices | 125 | 2.4762 | 2.4493 | 1.7646 | 3.4838 | 0.4028 |
| Consulta sin indices | 125 | 1.9260 | 1.8284 | 1.5062 | 3.1037 | 0.3656 |

*Nota.* Resultados extraidos automaticamente de `docs/paper/data/phase3-benchmark.json`. Elaboracion propia.

El cociente `query_without_index / query_with_index` fue 0.78, por lo que en este escenario sintetico la consulta sin indices resulto mas rapida. Este comportamiento es posible cuando la selectividad del filtro por fecha no compensa el costo de recorrido por indice y de ordenaciones temporales [3].

## Evidencia de plan de ejecucion

Para interpretar los tiempos se capturo `EXPLAIN QUERY PLAN` en ambos escenarios. En la Tabla 4 se resume la salida principal.

*Tabla 4*  
*Resumen de EXPLAIN QUERY PLAN para consulta mensual*

| Escenario | Evidencia principal |
|---|---|
| Con indices | `SEARCH t USING INDEX idx_txn_fecha (fecha>? AND fecha<?)` |
| Sin indices | `SCAN t` |

*Nota.* En ambos casos se observa uso de estructuras temporales para ordenacion/agrupacion (`USE TEMP B-TREE`), lo que influye en el coste final de la consulta. Elaboracion propia.

## Pruebas funcionales sobre requisitos de BD

Ademas del benchmark, se verificaron los comportamientos funcionales del prototipo implementado en fase 2:

1. Insercion transaccional de movimientos con `withExclusiveTransactionAsync`.
2. Restriccion `RESTRICT` al eliminar cuentas con transacciones.
3. Borrado en cascada `CASCADE` al eliminar categorias.
4. Actualizacion automatica de `restante` por trigger tras insertar gastos.
5. Panel de notificaciones con alertas de presupuesto y envio de notificacion de prueba en iOS.

Estas pruebas confirman que la logica principal de integridad y analitica se ejecuta en el motor local, consistente con el objetivo de una arquitectura offline-first [1], [3], [7].

## Capturas de pantalla: evidencia humana requerida

La evidencia visual en simulador iOS no puede generarse automaticamente desde este entorno headless. Por ello se define el siguiente contrato de capturas para completar el documento final.

En la Figura 2 se debe incluir la lista de transacciones con registros reales.

*Figura 2*. Pantalla de transacciones con movimientos insertados y metadatos de cuenta/categoria.  
*Nota.* Captura manual requerida en iOS Simulator o dispositivo. Guardar como `docs/paper/figures/figura-2-transacciones.png`.

En la Figura 3 se debe incluir el panel de notificaciones con alertas de presupuesto.

*Figura 3*. Pantalla del panel de notificaciones con alertas de presupuesto excedido o cercano al limite.  
*Nota.* Captura manual requerida en iOS Simulator o dispositivo. Guardar como `docs/paper/figures/figura-3-notificaciones.png`.

En la Figura 4 se debe incluir la pantalla de presupuestos mostrando `restante` actualizado por trigger.

*Figura 4*. Pantalla de presupuestos evidenciando actualizacion automatica tras registrar gasto.  
*Nota.* Captura manual requerida en iOS Simulator o dispositivo. Guardar como `docs/paper/figures/figura-4-presupuestos-trigger.png`.

Las instrucciones operativas para obtener estas capturas se documentan en `docs/paper/figures/README.md`.
