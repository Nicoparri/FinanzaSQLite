# Finanzas SQLite

Aplicación móvil de finanzas personales desarrollada con React Native + Expo y persistencia local en SQLite. El proyecto se plantea como un caso de estudio de base de datos móvil offline-first para iOS, con foco en integridad referencial, transacciones ACID, triggers y consultas analíticas ejecutadas directamente en el motor SQL local.

## Resumen del proyecto

La app permite registrar ingresos y gastos, gestionar cuentas y categorías, definir presupuestos mensuales y consultar analítica agregada sin depender de un servidor remoto. La memoria delimita el alcance a persistencia local en SQLite para aislar el comportamiento del SGBD móvil respecto a la red y demostrar que una arquitectura relacional local es suficiente para mantener consistencia, trazabilidad y capacidad analítica en un escenario académico verificable.

## Objetivos técnicos

- Demostrar persistencia offline-first en iOS con SQLite local.
- Validar integridad referencial mediante `ON DELETE RESTRICT` y `ON DELETE CASCADE`.
- Ejecutar escrituras críticas dentro de transacciones exclusivas.
- Actualizar presupuestos automáticamente con triggers SQL.
- Obtener informes mensuales con consultas `SUM`, `GROUP BY` y vistas SQL.
- Medir el rendimiento de inserciones y consultas con un benchmark reproducible.

## Stack y arquitectura

- `Expo SDK 54`
- `React Native 0.81`
- `expo-sqlite`
- `expo-notifications`
- `expo-local-authentication`
- `better-sqlite3` para pruebas en Node.js
- `Python 3.12` para el benchmark reproducible de la memoria

Arquitectura principal:

1. `src/db/database.ts`: apertura de base de datos, migración, `PRAGMA foreign_keys = ON`, `WAL`, esquema, índices, vista y triggers.
2. `src/db/repository.ts`: operaciones CRUD, consultas de balance, presupuestos, informes y persistencia de ajustes.
3. `App.tsx`: interfaz móvil, navegación principal, formularios, analítica, notificaciones y ajustes.

## Funcionalidades principales

- Registro de transacciones de ingreso y gasto con cuenta, categoría, fecha, importe y descripción.
- Gestión de cuentas (`efectivo`, `banco`, `tarjeta`) con balance calculado desde SQL.
- Gestión de categorías con integridad referencial activa.
- Presupuestos por categoría y mes, con actualización automática del campo `restante`.
- Analítica mensual de gasto por categoría.
- Panel de notificaciones y resumen diario en iOS.
- Ajustes de moneda, inicio de semana, notificaciones, Face ID y bloqueo automático.
- Generación de datos semilla para pruebas funcionales.

## Modelo de datos

Entidades principales documentadas también en [docs/esquema/diagrama-er.md](docs/esquema/diagrama-er.md):

- `cuentas`: almacena las cuentas del usuario.
- `categorias`: clasifica ingresos y gastos.
- `transacciones`: registra movimientos financieros.
- `presupuestos`: guarda límite y restante por categoría y mes.
- `app_settings`: persiste preferencias de la aplicación.

Reglas relevantes:

- `transacciones.cuenta_id -> cuentas.id` con `ON DELETE RESTRICT`
- `transacciones.categoria_id -> categorias.id` con `ON DELETE CASCADE`
- `presupuestos.categoria_id` único por categoría
- Trigger `actualizar_presupuesto_tras_gasto`
- Trigger `revertir_presupuesto_tras_borrar_gasto`

## Estructura del repositorio

```text
.
|-- App.tsx
|-- src/
|   |-- components/
|   `-- db/
|-- tests/
|   |-- unit/
|   |-- integration/
|   `-- load/
|-- scripts/
|   `-- benchmark_sqlite.py
`-- docs/
    |-- DEPLOY-iOS.md
    |-- esquema/
    `-- paper/
```

## Instalación y ejecución local

### Requisitos

- Node.js 20 o superior recomendado
- npm
- Expo Go en iPhone si vas a probar en dispositivo
- Python 3.12 si vas a ejecutar el benchmark de la memoria

### Instalación

```bash
npm install
```

### Arranque en desarrollo

```bash
npm run start
```

Comandos útiles:

```bash
npm run ios
npm run android
npm run web
npm run typecheck
```

Si pruebas en iPhone con Expo Go y la red local da problemas:

```bash
npx expo start --tunnel
```

## Manual de despliegue

El binario `FinanzasSQLite.ipa` se publica en la [release v1.0.0](https://github.com/Nicoparri/FinanzaSQLite/releases/tag/v1.0.0), por lo que hay dos rutas de despliegue habituales.

### Opción A: instalar el `.ipa` en iPhone desde Windows

Requisitos:

- iPhone con iOS 16 o superior
- `FinanzasSQLite.ipa`, descargado de la [release v1.0.0](https://github.com/Nicoparri/FinanzaSQLite/releases/tag/v1.0.0)
- Apple ID gratuita
- Sideloadly
- iTunes instalado desde la web de Apple, no desde Microsoft Store
- Cable USB

Pasos:

1. Conecta el iPhone al PC y acepta "Confiar en este ordenador".
2. Abre Sideloadly y verifica que detecta el dispositivo.
3. Arrastra `FinanzasSQLite.ipa` a la ventana de Sideloadly.
4. Introduce tu Apple ID y pulsa `Start`.
5. Si iOS lo pide, activa `Modo de Desarrollador`.
6. En el iPhone, ve a `Ajustes > General > VPN y gestión de dispositivos` y confía en el perfil.
7. Abre la aplicación desde la pantalla de inicio.

Nota: con Apple ID gratuita el firmado suele caducar a los 7 días, por lo que hay que reinstalar.

### Opción B: ejecutar con Expo Go

1. Instala dependencias con `npm install`.
2. Lanza `npx expo start`.
3. Abre Expo Go en el iPhone.
4. Escanea el QR mostrado por Expo.
5. Verifica la navegación por `Inicio`, `Movimientos`, `Presupuestos` y `Ajustes`.

Documentación ampliada: [docs/DEPLOY-iOS.md](docs/DEPLOY-iOS.md)

## Cómo correr los tests

La batería de pruebas está separada en unitarias, integración y carga.

### Ejecutar todas las pruebas

```bash
npm test
```

### Ejecutar solo unitarias

```bash
npm run test:unit
```

### Ejecutar solo integración

```bash
npm run test:integration
```

### Ejecutar solo carga

```bash
npm run test:load
```

### Verificación estática

```bash
npm run typecheck
```

Cobertura funcional actual:

- `tests/unit/schema.test.js`: valida esquema, índices, vistas y triggers.
- `tests/unit/constraints.test.js`: valida restricciones de integridad.
- `tests/integration/*.test.js`: valida CRUD, transacciones, consultas y comportamiento de triggers.
- `tests/load/benchmark.test.js`: valida escenarios de carga sobre SQLite.

## Benchmark reproducible de la memoria

La memoria documenta un benchmark reproducible adicional en Python:

```bash
python scripts/benchmark_sqlite.py --n 20000 --runs 5 --query-runs 25 --seed 20260406
```

La salida se guarda en:

- [docs/paper/data/phase3-benchmark.json](docs/paper/data/phase3-benchmark.json)

Resultados destacados recogidos en la memoria:

- Inserción masiva de `20000` transacciones: media de `96.4607 ms`
- Consulta agregada con índices: media de `2.4762 ms`
- Consulta agregada sin índices: media de `1.9260 ms`

## Manual de usuario

### Primer arranque

Al iniciar la app por primera vez se crea automáticamente la base SQLite y se cargan datos base:

- Cuentas iniciales: `Cuenta Banco` y `Efectivo`
- Categorías iniciales: `Nómina`, `Alimentación` y `Transporte`
- Ajustes por defecto: moneda `EUR`, inicio de semana en `lunes`, notificaciones activadas

### Pantalla Inicio

- Muestra el resumen general del periodo actual.
- Presenta indicadores rápidos de ingresos, gastos y balance.
- Permite abrir el panel de notificaciones y la vista de analítica desde la cabecera.

### Pantalla Movimientos

1. Selecciona cuenta y categoría.
2. Indica si el movimiento es `ingreso` o `gasto`.
3. Introduce importe, fecha y descripción opcional.
4. Guarda el movimiento.

Desde esta vista también puedes consultar el listado reciente y editar o eliminar transacciones existentes.

### Pantalla Presupuestos

1. Selecciona una categoría de gasto.
2. Indica el mes en formato `YYYY-MM`.
3. Define el límite del presupuesto.
4. Guarda el presupuesto.

Cuando registras un gasto de esa categoría y mes, SQLite actualiza automáticamente el campo `restante` mediante trigger.

### Pantalla Ajustes

Desde `Ajustes` puedes:

- Cambiar moneda (`EUR`, `USD`, `GBP`)
- Elegir inicio de semana
- Activar o desactivar notificaciones
- Activar Face ID
- Activar bloqueo automático
- Crear y eliminar cuentas
- Crear y eliminar categorías
- Consultar el total de transacciones

### Analítica y notificaciones

- La vista de analítica muestra gasto mensual agregado por categoría.
- El panel de notificaciones destaca alertas de presupuesto y resumen de actividad.
- Si iOS deniega permisos, la app informa del problema y mantiene el estado consistente en base de datos.

## Resultados y conclusiones de la memoria

Según la memoria, el prototipo demuestra que una app financiera móvil puede apoyarse en SQLite local para:

- Mantener integridad referencial sin backend remoto
- Ejecutar reglas de negocio en SQL mediante triggers
- Resolver analítica agregada en el propio motor de base de datos
- Ofrecer una experiencia offline-first verificable en iOS

También se documentan como limitaciones de alcance:

- Sin sincronización remota
- Sin autenticación multiusuario
- Sin cifrado nativo avanzado en esta fase
- Sin soporte Android como objetivo principal de evaluación

## Metodología: flujo GSD con agentes de IA

El proyecto (app, memoria académica y defensa) se desarrolló con [GSD](https://github.com/open-gsd/gsd-core), un framework open source de desarrollo guiado por especificaciones para agentes de IA. Cada fase sigue el ciclo **discutir → planificar → ejecutar → verificar**, y cada paso deja un artefacto versionado en `.planning/` que sirve de fuente de verdad para el siguiente.

- **Investigación previa** del stack, la arquitectura y los riesgos en `.planning/research/`.
- **Hito v1.0 en 4 fases** (diseño y redacción inicial, implementación de la app, resultados y redacción final, defensa) con 17 planes, sus resúmenes de ejecución, verificación y pruebas de aceptación (UAT) por fase, en `.planning/milestones/`.
- **Auditoría del hito**: comprobó requisito a requisito qué estaba cubierto; los huecos detectados se cerraron con un plan específico antes de dar el hito por terminado.
- **Tareas rápidas** (`.planning/quick/`) para cambios pequeños sin recorrer el ciclo completo.

Mi papel fue definir el alcance y los criterios de aceptación, dirigir a los agentes y revisar y validar cada entrega.

## Documentación relacionada

- [Despliegue en iPhone desde Windows](docs/DEPLOY-iOS.md)
- [Diagrama entidad-relación](docs/esquema/diagrama-er.md)
- [Resultados del benchmark](docs/paper/data/phase3-benchmark.json)

## Licencia

Distribuido bajo la licencia MIT. Consulta [LICENSE](LICENSE).
