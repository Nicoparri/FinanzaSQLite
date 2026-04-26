# Quick Task 260416-fw4 - Summary

## Resultado
Se implementaron las funcionalidades de notificaciones y seguridad iOS en la pantalla de ajustes de la app.

## Cambios realizados

- `App.tsx`
  - Integracion de `expo-notifications`:
    - Solicitud de permisos iOS.
    - Programacion de notificacion diaria local.
    - Accion para enviar notificacion de prueba.
    - Estado de permiso mostrado en Ajustes.
  - Integracion de `expo-local-authentication`:
    - Verificacion de disponibilidad biometrica.
    - Desbloqueo por Face ID/Touch ID.
    - Bloqueo automatico al pasar a background (si esta activado).
    - Modal de bloqueo con fallback PIN demo (`2580`).
  - Ajustes conectados a persistencia SQLite (`getAppSettings` y `saveAppSettings`).
  - Correccion de copy en confirmacion de borrado de movimiento.

- Dependencias
  - Se anadieron `expo-notifications` y `expo-local-authentication`.

## Verificacion

- `npm run typecheck` ejecutado con exito.
