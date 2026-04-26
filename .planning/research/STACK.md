# Stack Research

**Domain:** React Native + Expo + expo-sqlite iOS personal finance app (academic demo for CBD course)
**Researched:** 2026-04-06
**Revised:** 2026-04-06 — downgraded to SDK 54 for Expo Go compatibility
**Confidence:** HIGH

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

```bash
# 1. Create the project (SDK 54 default template with TypeScript + Expo Router)
npx create-expo-app@latest FinanzasApp --template default@sdk-54

# 2. Navigate into the project
cd FinanzasApp

# 3. Install core database dependency (npx expo install picks the SDK-54-compatible version)
npx expo install expo-sqlite

# 4. (Optional) Install state management if needed
npm install zustand

# 5. Start the development server (scan QR with Expo Go or press 'i' for iOS Simulator)
npx expo start
```

**IMPORTANT:** Always use `npx expo install` (not `npm install`) for Expo packages. This ensures version compatibility with your SDK version.

**Para usar Expo Go:** Con SDK 54, simplemente ejecuta `npx expo start` y escanea el QR con la app Expo Go en el iPhone, o pulsa `i` para abrir en el iOS Simulator sin necesidad de `npx expo run:ios`.

## expo-sqlite API Reference (Key Methods)

This is the API surface for SDK 54. The old WebSQL-like API (`expo-sqlite/legacy`) was removed in SDK 52. Use only the modern async API.

### Database Initialization Pattern

```typescript
// src/database/database.ts
import * as SQLite from 'expo-sqlite';

// Opcion 1: Provider pattern (recommended for React components)
// In app/_layout.tsx:
// <SQLiteProvider databaseName="finanzas.db" onInit={migrateDbIfNeeded}>
//   <App />
// </SQLiteProvider>

// Opcion 2: Direct async open (for services/utilities)
const db = await SQLite.openDatabaseAsync('finanzas.db');
await db.execAsync('PRAGMA journal_mode = WAL');
await db.execAsync('PRAGMA foreign_keys = ON');
```

### Core CRUD Methods

```typescript
// INSERT / UPDATE / DELETE -- returns { lastInsertRowId, changes }
const result = await db.runAsync(
  'INSERT INTO transacciones (monto, categoria_id, descripcion) VALUES (?, ?, ?)',
  [150.00, 1, 'Compra supermercado']
);

// SELECT multiple rows -- returns array of objects
const transacciones = await db.getAllAsync<Transaccion>(
  'SELECT * FROM transacciones WHERE categoria_id = ?',
  [1]
);

// SELECT single row -- returns object or null
const cuenta = await db.getFirstAsync<Cuenta>(
  'SELECT * FROM cuentas WHERE id = ?',
  [cuentaId]
);

// Execute raw SQL (for schema operations -- NO parameter binding)
await db.execAsync(`
  CREATE TABLE IF NOT EXISTS categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE
  );
`);
```

### Transactions

```typescript
// Standard transaction (readable, but NOT exclusive — can interleave)
await db.withTransactionAsync(async () => {
  await db.runAsync('UPDATE cuentas SET saldo = saldo - ? WHERE id = ?', [100, 1]);
  await db.runAsync('INSERT INTO transacciones (monto, cuenta_id) VALUES (?, ?)', [-100, 1]);
});

// Exclusive transaction (required for ACID writes — blocks other queries)
await db.withExclusiveTransactionAsync(async () => {
  await db.runAsync('INSERT INTO transacciones ...', [...]);
  // Trigger fires here inside the transaction
});
```

**IMPORTANTE para el paper:** `withTransactionAsync` NO es exclusivo (puede interleave con otras queries). Para garantizar ACID en las transacciones financieras, usar siempre `withExclusiveTransactionAsync`.

### SQLiteProvider + useSQLiteContext (React Integration)

```typescript
// app/_layout.tsx  (SDK 54: app/ at root, not src/app/)
import { SQLiteProvider } from 'expo-sqlite';
import { Suspense } from 'react';

export default function RootLayout() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <SQLiteProvider databaseName="finanzas.db" onInit={migrateDbIfNeeded}>
        <Stack />
      </SQLiteProvider>
    </Suspense>
  );
}

// Any child component:
import { useSQLiteContext } from 'expo-sqlite';

function TransaccionesList() {
  const db = useSQLiteContext();
  // Use db.getAllAsync, db.runAsync, etc.
}
```

### Database Migration Pattern

```typescript
async function migrateDbIfNeeded(db: SQLite.SQLiteDatabase) {
  // Enable foreign keys and WAL mode (MUST be outside any transaction)
  await db.execAsync('PRAGMA journal_mode = WAL');
  await db.execAsync('PRAGMA foreign_keys = ON');

  // Check current schema version
  const result = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion < 1) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS cuentas (...);
      CREATE TABLE IF NOT EXISTS categorias (...);
      CREATE TABLE IF NOT EXISTS transacciones (...);
      CREATE TABLE IF NOT EXISTS presupuestos (...);
      -- Triggers
      CREATE TRIGGER IF NOT EXISTS ...;
      PRAGMA user_version = 1;
    `);
  }
}
```

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

**Por qué SDK 54 para este proyecto:**
- expo-sqlite está incluido en Expo Go SDK 54 → desarrollo más ágil sin Xcode ni builds nativos
- API moderna completa disponible (`SQLiteProvider`, `useSQLiteContext`, transacciones exclusivas)
- React Native 0.81 + New Architecture disponible (no obligatoria)
- Diferencia práctica con SDK 55: solo el `db.sql` tagged template y versioning unificado de paquetes, ninguno necesario para este trabajo

## Folder Structure (SDK 54 Default Template)

```
FinanzasApp/
  app.json               # Expo configuration
  package.json
  tsconfig.json
  app/                   # Expo Router file-based routes (root level en SDK 54)
    _layout.tsx          # Root layout (SQLiteProvider wraps here)
    (tabs)/              # Tab group
      _layout.tsx        # Tab navigator layout
      index.tsx          # Home / Dashboard
      transacciones.tsx  # Transactions list
      informes.tsx       # Reports (aggregate queries)
      ajustes.tsx        # Settings
    transaccion/
      [id].tsx           # Transaction detail (dynamic route)
      nueva.tsx          # New transaction form
  components/            # Reusable UI components
  constants/             # App-wide constants (colors, etc.)
  hooks/                 # Custom hooks
  database/              # Database layer
    migrations.ts        # Schema creation + migration logic
    types.ts             # TypeScript interfaces for DB entities
```

**Nota SDK 54 vs SDK 55:** En SDK 54 el directorio de rutas es `app/` en la raíz. En SDK 55 se movió a `src/app/`. Para este proyecto se usa `app/` en la raíz (SDK 54).

## Sources

- npm registry: expo@54.0.x (SDK 54), expo-sqlite@~14.0.6 compatible
- [Expo SDK 54 Changelog](https://expo.dev/changelog/sdk-54) — SDK 54 release details
- [Expo SDK 52 Changelog](https://expo.dev/changelog/2024-11-12-sdk-52) — Legacy API removal confirmation
- [Expo SQLite Documentation](https://docs.expo.dev/versions/v54.0.0/sdk/sqlite/) — Full API reference for expo-sqlite SDK 54
- [Expo Go — Supported libraries](https://docs.expo.dev/get-started/set-up-your-environment/) — expo-sqlite included in Expo Go SDK 54

---
*Stack research for: React Native + Expo + expo-sqlite iOS Personal Finance App (Academic Demo)*
*Researched: 2026-04-06 | Revised: 2026-04-06 (SDK 54, Expo Go compatible)*
