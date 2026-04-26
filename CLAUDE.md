# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Contexto del Proyecto

Trabajo académico para la asignatura **CBD (Bases de Datos)** del Grado en Ingeniería del Software, Universidad de Sevilla (Dpto. Lenguajes y Sistemas Informáticos, Prof. Toñi Reina).

**Título**: "Ejemplo de implementación de una aplicación con almacenamiento móvil para iOS"

**Stack tecnológico elegido**: React Native + Expo + `expo-sqlite` (SQLite local, paradigma *offline-first*)

**Aplicación prototipo**: Gestión de finanzas personales en iOS que estresa el SGBD local con transacciones ACID, consultas de agregación (SUM/GROUP BY), triggers y control de integridad referencial.

## Comportamiento Autónomo

Operar en modo autónomo siguiendo este ciclo para cada tarea:

1. **Planificar** antes de escribir: desglosar la tarea en subtareas y verificar que cubren el objetivo académico.
2. **Implementar**: redactar o codificar según las normas de este documento.
3. **Revisar**: comprobar coherencia académica, citas, formato y estructura antes de entregar.
4. **Corregir errores automáticamente**: si se detecta un error (cita sin referencia, tabla sin nota, párrafo sin idea única, código sin comentar), corregirlo sin esperar confirmación.
5. **Preguntar solo en decisiones de diseño**: cuando haya varias opciones válidas con implicaciones académicas o técnicas distintas (p. ej., qué SGBD comparar, cómo estructurar una sección), presentar las opciones con su justificación y esperar la decisión del usuario.

## Estructura del Documento Académico

El documento final sigue este orden (las secciones marcadas con ✅ tienen borrador en `Analisis Inicial.md`):

1. Introducción ✅ (borrador)
2. Estado del Arte y Tecnologías ✅ (borrador)
3. Alcance y Funcionalidades ✅ (borrador — Tabla 1 incluida)
4. Metodología / Diseño (esquema E/R, esquema físico SQL, mockups)
5. Implementación (código Expo + expo-sqlite: CRUD, triggers, consultas analíticas)
6. Resultados y Pruebas (métricas en emulador/dispositivo)
7. Conclusiones (borrador parcial en `Analisis Inicial.md`)
8. Referencias
9. Bibliografía de consulta (opcional)

## Planificación (Cronograma 30 h)

| Fase | Horas | Estado |
|---|---|---|
| 1. Investigación y viabilidad | 5 h | Parcialmente completada |
| 2. Diseño (E/R, mockups, SQL) | 5 h | Pendiente |
| 3. Implementación (Expo + expo-sqlite) | 11 h | Pendiente |
| 4. Redacción académica | 6 h | En progreso |
| 5. Preparación defensa | 3 h | Pendiente |

## Normas Académicas Obligatorias (PDF "Cuestiones sobre los trabajos")

### Formato visual
- El texto final debe estar **justificado por ambos lados** (mencionar esto al generar contenido para documento Word/PDF).
- **Tablas**: numeradas (Tabla 1, Tabla 2…), con título en cursiva encima y nota al pie (*Nota.* …) indicando la fuente si es externa. Referenciar en el texto antes de la tabla: "En la Tabla X se muestra…"
- **Figuras**: numeradas (Figura 1, Figura 2…), con título en cursiva debajo y nota al pie con fuente si es externa. Referenciar en el texto antes de la figura: "En la Figura X se puede observar…"

### Estructura de secciones
**Introducción** (una idea por párrafo): atraer atención → contextualizar → propósito → metodología → resultados breves → conclusiones breves.

**Conclusiones**: resumir resultados → implicaciones teóricas y prácticas → limitaciones → trabajos futuros. Sin repetición literal, sin citas nuevas.

### Citas y referencias
- Usar formato **APA** (o IEEE si se decide así al inicio — preguntar al usuario).
- **Toda afirmación técnica** debe tener cita bibliográfica real y verificable.
- Distinguir "Referencias" (fuentes citadas) de "Bibliografía de consulta" (consultadas pero no citadas).
- La lista de referencias va ordenada alfabéticamente (APA) o por orden de aparición (IEEE).

### Uso de IA
- Documentar en el trabajo en qué partes se usó IA.
- Incluir enlace al prompt/conversación usada.
- Contrastar la información generada con referencias bibliográficas reales.
- El texto del documento ya incluye una sección de declaración de uso de IA al final de `Analisis Inicial.md` como modelo.

### Plagio
- Evitar plagio mosaico (mezclar texto de múltiples fuentes sin citar) y copia-pega (incluso con referencia, sin reformular).
- Toda idea tomada de otra fuente debe ser parafraseada y citada.

## Referencias Bibliográficas ya Identificadas

```
Apple Inc. (2023). Core Data Programming Guide. Apple Developer Documentation.
Kumar, V. (2013). Fundamentals of Pervasive Information Management Systems. Wiley.
Kumar, V. (2006). Mobile Database Systems. Wiley.
Makice, K. (2016). Learning Realm: Development for Android and iOS. O'Reilly Media.
Owens, M. (2010). The Definitive Guide to SQLite (2nd ed.). Apress.
Meta Platforms Inc. (2023). AsyncStorage. React Native Documentation.
```

## Decisiones Técnicas ya Tomadas (no replantear sin consultar)

- **Plataforma**: iOS mediante React Native + Expo (justifica multiplataforma y acceso nativo a SQLite).
- **SGBD local**: `expo-sqlite` (SQLite). Justificación: propiedades ACID, integridad referencial, consultas SQL de agregación nativas, mejor rendimiento para datos financieros tabulares frente a AsyncStorage (clave-valor) o Realm (orientada a objetos).
- **Paradigma**: *offline-first* (datos locales, sin sincronización con servidor — intencionado para aislar métricas del SGBD local).
- **Encriptación**: SQLCipher o cifrado nativo AES-256 (mención teórica; implementación según viabilidad).

## Contenido Académico Clave del Temario (PDF "BDMóviles")

Asegurarse de que el trabajo cubre estos conceptos del temario (son los que evaluará la profesora):

- Definición de BD móvil y SGBDM.
- Tipos de apps (offline / online / híbridas) — la app es **offline**.
- Características de los SGBDM: alta disponibilidad, consistencia/concurrencia, sincronización, seguridad.
- Metodología de diseño de BD móvil: selección plataforma → selección BD móvil → BD central → modelo transacción → optimización → modelado E/R.
- Comparativa de SGBDM: AsyncStorage, Realm, expo-sqlite (ya redactada en `Analisis Inicial.md`).
- SQLite: autocontenida, sin servidor, código abierto, tipado flexible, acceso paralelo en lectura.

## Generación de Código (Fase 3 — Implementación)

Al generar código Expo/React Native:
- Usar **TypeScript**.
- Inicializar la BD en un hook `useSQLiteContext` o en un módulo `database.ts` separado.
- La creación de tablas (`CREATE TABLE IF NOT EXISTS`) y triggers deben ejecutarse en `openDatabaseAsync` al inicio.
- Habilitar claves foráneas explícitamente: `PRAGMA foreign_keys = ON;`.
- Las consultas de agregación (para el reporting) deben ejecutarse directamente en SQL, no procesarse en JS.
- Comentar el código en español para facilitar la redacción académica de la sección de implementación.
- Tras implementar cada funcionalidad, generar la explicación académica correspondiente para incluir en el documento.

## Defensa (Fase 5)

La presentación de defensa debe seguir las indicaciones del PDF "Cuestiones sobre los trabajos":
- Referencia: video "La mejor presentación de tu vida" (https://www.youtube.com/watch?v=l0s6ZLkV-U0).
- Estructura de diapositivas: extraer figuras y mensajes clave del documento, no transcribir texto completo.
- Incluir guion cronometrado y preguntas probables de la profesora.

<!-- GSD:project-start source:PROJECT.md -->
## Project

**Trabajo CBD – App iOS con SQLite**

Trabajo académico para la asignatura CBD (Bases de Datos), Grado en Ingeniería del Software, Universidad de Sevilla (Prof. Toñi Reina). El objetivo es redactar un documento académico riguroso que demuestre la implementación de una app de finanzas personales en iOS usando React Native, Expo y expo-sqlite, poniendo a prueba las capacidades del SGBD local en cuanto a transacciones ACID, consultas de agregación, triggers e integridad referencial. El entregable incluye el documento escrito, el prototipo funcional en Expo y una presentación de defensa.

**Core Value:** Un documento académico completo y entregable que demuestre empíricamente el rendimiento de SQLite en iOS, acompañado de un prototipo React Native funcional que sirva de evidencia de la implementación.

### Constraints

- **Timeline**: 2-3 semanas — priorizar documento escrito sobre la app
- **Tech stack**: React Native + Expo + expo-sqlite + TypeScript (decidido, no renegociable sin consultar)
- **Citas**: Formato IEEE obligatorio (especificado por el usuario)
- **Formato**: Texto justificado en el PDF final; tablas y figuras con título, numeración y nota al pie
- **IA**: Todo uso de IA debe documentarse en el documento con enlace al prompt
- **Temario**: El documento debe cubrir los conceptos del PDF 07-BDMóviles.v.1.0 (definiciones, tipos de apps, SGBDM, metodología de diseño, SQLite)
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Core Technologies
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Expo SDK | 54.0.x (`expo@~54.0.0`) | Application framework and build system | Stable SDK compatible with Expo Go. Ships with React Native 0.81, React 18.3, New Architecture by default (opt-out possible). expo-sqlite está empaquetado en la app Expo Go SDK 54, eliminando la necesidad de un build nativo para el desarrollo. |
| React Native | 0.81.x (bundled with Expo 54) | Cross-platform UI runtime | Bundled with Expo SDK 54. Hermes engine for JS execution on iOS. New Architecture enabled by default but can be disabled. |
| expo-sqlite | ~14.0.6 (`expo-sqlite@~14.0.6`) | Local SQLite database access | Core of the project. Included in Expo Go SDK 54. Provides `SQLiteProvider`, `useSQLiteContext`, `openDatabaseAsync`, `runAsync`, `getAllAsync`, `getFirstAsync`, `execAsync`, and `withExclusiveTransactionAsync`. Fully async API. |
| TypeScript | ~5.3.x (bundled with Expo 54 template) | Type safety | Expo has first-class TypeScript support. The default template is TypeScript. Required by project spec (CLAUDE.md). |
| Expo Router | ~3.5.x (`expo-router@~3.5.x`) | File-based navigation | Built on React Navigation. File-based routing (`app/` directory at root). Typed routes. Tab navigation. Included in default `create-expo-app` template for SDK 54. |
### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-native-safe-area-context | ~4.10.x | Safe area insets for iOS notch/Dynamic Island | Always — installed as Expo Router peer dep. Handles notch-safe layouts automatically. |
| react-native-screens | ~3.31.x | Native navigation screens | Always — installed as Expo Router peer dep. Required for stack/tab navigation performance. |
| react-native-reanimated | ~3.10.x | Smooth animations | Only if you add animated transitions (optional for academic demo). SDK 54 compatible (v3, not v4). |
| react-native-gesture-handler | ~2.16.x | Touch gesture handling | Only if you add swipe-to-delete or custom gestures. |
| @expo/vector-icons | ~14.0.x | Icon library (Ionicons, MaterialIcons, etc.) | Always — for tab bar icons, category icons. Bundled with Expo. |
| expo-splash-screen | ~0.27.x | Splash screen management | Always — included in default template. Prevents white flash on app load. |
| Zustand | ~4.5.x | Client-side state management | Optional. For this academic project, `useSQLiteContext` + React state may suffice. Use only if you need cross-component state not derived from the DB. |
### Development Tools
| Tool | Purpose | Notes |
|------|---------|-------|
| `create-expo-app` | Project scaffolding | Run `npx create-expo-app@latest FinanzasApp --template default@sdk-54` to create the project. Default template includes TypeScript, Expo Router, tab navigation, `app/` folder structure. |
| **Expo Go** | **Quick testing on device/simulator** | **expo-sqlite está incluido en Expo Go SDK 54.** Escanear el QR con la app Expo Go en iPhone o usar iOS Simulator con `npx expo start`. No se necesita Xcode ni build nativo para el desarrollo. |
| EAS Build | Cloud builds for iOS (production) | Solo necesario si se distribuye la app fuera de Expo Go. No requerido para este trabajo académico. |
| Metro bundler | JS bundling | Ships with Expo. No configuration needed. |
| Expo Drizzle Studio Plugin | DB inspection during development | `expo-drizzle-studio-plugin` — optional but very helpful for debugging SQLite schema and data. Access via Expo CLI dev tools. |
## Installation
# 1. Create the project (SDK 54 default template with TypeScript + Expo Router)
# 2. Navigate into the project
# 3. Install core database dependency (npx expo install picks the SDK-54-compatible version)
# 4. (Optional) Install state management if needed
# 5. Start the development server (scan QR with Expo Go or press 'i' for iOS Simulator)
## expo-sqlite API Reference (Key Methods)
### Database Initialization Pattern
### Core CRUD Methods
### Transactions
### SQLiteProvider + useSQLiteContext (React Integration)
### Database Migration Pattern
## Alternatives Considered
| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| expo-sqlite (raw SQL) | Drizzle ORM + expo-sqlite | Use Drizzle if you need type-safe schema definitions and reactive hooks. **For this academic project: skip Drizzle** — the professor wants to see raw SQL (ACID transactions, triggers, aggregate queries). |
| Expo Router (file-based) | React Navigation (code-based) | Use raw React Navigation for custom navigation patterns or brownfield apps. For this greenfield project, Expo Router is simpler and ships with the default template. |
| Zustand (if needed) | React Context | For this project, no external state manager is needed — all data lives in SQLite, accessed via `useSQLiteContext`. |
| expo-sqlite | Realm | Project spec explicitly chose expo-sqlite over Realm. Realm's object model would not demonstrate SQL concepts (the academic goal). |
## What NOT to Use
| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `expo-sqlite/legacy` | **Removed in SDK 52** (Nov 2024). Any tutorial referencing `SQLite.openDatabase()` (sync) is outdated. | `expo-sqlite` modern API: `openDatabaseAsync()`, `runAsync()`, `getAllAsync()`, `SQLiteProvider` |
| `SQLite.openDatabase()` (sync) | Legacy sync API. Removed. | `SQLite.openDatabaseAsync()` or `SQLiteProvider` |
| `db.transaction()` callback style | Old callback-based transactions from the legacy API. | `db.withTransactionAsync()` or `db.withExclusiveTransactionAsync()` |
| `db.sql` tagged template literals | **SDK 55+ only.** Not available in SDK 54. | Usar `db.getAllAsync<T>(sql, params)` explícito — más compatible y más claro para el paper. |
| TypeORM with expo-sqlite | Poorly maintained, conflicts with modern expo-sqlite API. | Raw SQL via expo-sqlite methods. |
| `@react-native-async-storage/async-storage` | Key-value store, cannot do SQL queries, transactions, triggers, or referential integrity. | `expo-sqlite` |
## SDK / Version Compatibility Matrix
| Expo SDK | React Native | expo-sqlite | expo-router | Expo Go | Status |
|----------|-------------|-------------|-------------|---------|--------|
| SDK 52 | 0.76 | ~14.x | ~4.0.x | ✓ Incluido | Soportado |
| SDK 53 | 0.79 | ~14.x | ~4.1.x | ✓ Incluido | Soportado |
| **SDK 54** | **0.81** | **~14.0.6** | **~3.5.x** | **✓ Incluido** | **Seleccionado — Expo Go compatible** |
| SDK 55 | 0.83 | ~55.0.x | ~55.0.x | ✓ Incluido | Más reciente, pero versioning unificado innecesario |
- expo-sqlite está incluido en Expo Go SDK 54 → desarrollo más ágil sin Xcode ni builds nativos
- API moderna completa disponible (`SQLiteProvider`, `useSQLiteContext`, transacciones exclusivas)
- React Native 0.81 + New Architecture disponible (no obligatoria)
- Diferencia práctica con SDK 55: solo el `db.sql` tagged template y versioning unificado de paquetes, ninguno necesario para este trabajo
## Folder Structure (SDK 54 Default Template)
## Sources
- npm registry: expo@54.0.x (SDK 54), expo-sqlite@~14.0.6 compatible
- [Expo SDK 54 Changelog](https://expo.dev/changelog/sdk-54) — SDK 54 release details
- [Expo SDK 52 Changelog](https://expo.dev/changelog/2024-11-12-sdk-52) — Legacy API removal confirmation
- [Expo SQLite Documentation](https://docs.expo.dev/versions/v54.0.0/sdk/sqlite/) — Full API reference for expo-sqlite SDK 54
- [Expo Go — Supported libraries](https://docs.expo.dev/get-started/set-up-your-environment/) — expo-sqlite included in Expo Go SDK 54
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
