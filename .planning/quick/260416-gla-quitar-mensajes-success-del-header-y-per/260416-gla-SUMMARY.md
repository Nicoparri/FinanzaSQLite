# Quick Task 260416-gla - Summary

## Resultado
Se eliminaron los mensajes de success visibles en el header y se quitó el texto de permiso iOS en Ajustes.

## Cambios
- `App.tsx`
  - Se eliminó la rama de render que mostraba `statusMessage` en modo success.
  - Se dejó visible solo el bloque de error (`errorBox`) cuando corresponde.
  - Se eliminó la linea `Permiso iOS: ...` en la seccion de Ajustes.
  - Se eliminó el helper `notificationPermissionLabel` por quedar sin uso.

## Verificacion
- `npm run typecheck` ejecutado correctamente.
