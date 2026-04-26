# Quick Task 260416-gla - Plan

## Objetivo
Eliminar en la interfaz los mensajes de success del header y quitar el texto de permiso iOS en Ajustes.

## Tareas

1. Quitar render del mensaje success en header
- Mantener solo el cuadro de error cuando `isStatusError` sea true.

2. Quitar texto de permiso iOS en Ajustes
- Eliminar la linea `Permiso iOS: ...`.
- Limpiar helper asociado si queda sin uso.

3. Verificacion
- Ejecutar `npm run typecheck`.
- Confirmar que no quedan referencias al texto eliminado.
