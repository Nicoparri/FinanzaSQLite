---
phase: quick
plan: 260416-ddc
type: execute
autonomous: true
files_modified:
  - App.tsx
  - src/db/database.ts
  - src/db/repository.ts
  - src/db/types.ts
requirements:
  - APP-SETTINGS-01
  - APP-SETTINGS-02
must_haves:
  truths:
    - "Los ajustes de notificaciones y seguridad se persisten en SQLite y sobreviven reinicios"
    - "Los toggles de notificaciones y seguridad ejecutan comportamiento funcional, no solo visual"
  artifacts:
    - path: "App.tsx"
      provides: "Lógica funcional de notificaciones y seguridad en pantalla de ajustes"
      min_lines: 200
      contains: "activeTab === 'ajustes'"
    - path: "src/db/repository.ts"
      provides: "Lectura y escritura de ajustes de app"
      min_lines: 60
      contains: "getAppSettings"
---

# Quick Task 260416-ddc: Notificaciones y Seguridad en Ajustes

<objective>
Implementar de extremo a extremo las funcionalidades de notificaciones y seguridad expuestas en la UI de Ajustes, con persistencia local en SQLite y comportamiento visible en la app.
</objective>

<tasks>

<task type="auto">
  <name>Task 1: Persistencia de ajustes en SQLite</name>
  <files>src/db/database.ts, src/db/repository.ts, src/db/types.ts</files>
  <action>Agregar tabla app_settings, defaults y repositorio para guardar/cargar moneda, inicio de semana, notificaciones, Face ID y bloqueo automatico.</action>
  <verify>Los ajustes cambian en UI y se mantienen tras recarga.</verify>
  <done>Funciones getAppSettings/saveAppSettings disponibles y usadas por la app.</done>
</task>

<task type="auto">
  <name>Task 2: Notificaciones funcionales en UI</name>
  <files>App.tsx</files>
  <action>Conectar el toggle de notificaciones a comportamiento real: abrir/cerrar panel, control de estado habilitado/deshabilitado, indicador de pendientes y persistencia.</action>
  <verify>Al desactivar notificaciones se bloquea el panel y se refleja en cabecera/estado.</verify>
  <done>El panel y el icono responden a la configuración guardada.</done>
</task>

<task type="auto">
  <name>Task 3: Seguridad funcional en UI</name>
  <files>App.tsx</files>
  <action>Implementar bloqueo automatico al volver desde background y modal de desbloqueo por Face ID simulado o PIN segun configuración, con persistencia.</action>
  <verify>Con bloqueo activo, la app queda bloqueada al volver a foreground y requiere desbloqueo.</verify>
  <done>Los toggles de seguridad controlan el flujo de bloqueo/desbloqueo.</done>
</task>

</tasks>

<success_criteria>
- Ajustes persistidos en SQLite y restaurados en inicio.
- Notificaciones y seguridad afectan comportamiento real de la app.
- TypeScript compila sin errores nuevos.
</success_criteria>
