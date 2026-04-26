# Phase 02 Human UAT Checklist

## Objective

Validar manualmente en simulador iOS que la app Expo demuestra los requisitos funcionales de SQLite.

## Steps

1. Ejecutar `npm run ios` y esperar a que la app inicie sin errores de migracion.
2. Crear una cuenta y una categoria, luego insertar transacciones de ingreso y gasto.
3. Intentar borrar una cuenta con transacciones asociadas: debe fallar por RESTRICT.
4. Borrar una categoria con transacciones: deben borrarse en cascada (CASCADE).
5. Crear presupuesto para categoria de gasto y mes actual; insertar gasto en misma categoria/mes.
6. Verificar que `restante` disminuye automaticamente por trigger.
7. Abrir informe mensual y confirmar totales por categoria (SUM/GROUP BY).
8. Ejecutar seed con 100-500 filas y validar mensaje de tiempo total.

## Expected Outcomes

- Integridad referencial visible y coherente con `ON DELETE RESTRICT` / `ON DELETE CASCADE`.
- Triggers activos en actualizacion de presupuesto.
- Reporte mensual calculado en SQL, no por agregacion en JS.
- Seed genera metricas reproducibles para fase de resultados.
