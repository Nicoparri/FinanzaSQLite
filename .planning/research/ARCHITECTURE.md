# Architecture Research

**Domain:** Offline-first iOS personal finance app (React Native + Expo + expo-sqlite)
**Researched:** 2026-04-06
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
+---------------------------------------------------------------+
|                     Presentation Layer                         |
|  +----------+  +----------+  +----------+  +----------+       |
|  | Cuentas  |  | Transacc |  | Categor  |  | Informes |       |
|  | Screen   |  | Screen   |  | Screen   |  | Screen   |       |
|  +----+-----+  +----+-----+  +----+-----+  +----+-----+       |
|       |              |              |              |            |
+-------+--------------+--------------+--------------+-----------+
|                     Custom Hooks Layer                          |
|  +---------------+  +----------------+  +----------------+     |
|  | useCuentas()  |  | useTransacc()  |  | useInformes()  |     |
|  +-------+-------+  +-------+--------+  +-------+--------+    |
|          |                  |                    |              |
+----------+------------------+--------------------+-------------+
|                     Data Access Layer (db/)                     |
|  +-----------------------------------------------------------+ |
|  |  useSQLiteContext() <-- provided by SQLiteProvider         | |
|  +-----------------------------------------------------------+ |
|  +---------------+  +---------------+  +-------------------+   |
|  | cuentas.ts    |  | transacc.ts   |  | informes.ts       |   |
|  | (repository)  |  | (repository)  |  | (aggregate SQL)   |   |
|  +-------+-------+  +-------+-------+  +--------+----------+  |
|          |                  |                    |              |
+----------+------------------+--------------------+-------------+
|                     SQLite Engine (native)                      |
|  +-----------------------------------------------------------+ |
|  | finanzas.db                                                | |
|  | - cuentas, categorias, transacciones, presupuestos         | |
|  | - Triggers (recalc saldo, recalc presupuesto)              | |
|  | - PRAGMA foreign_keys = ON                                 | |
|  +-----------------------------------------------------------+ |
+---------------------------------------------------------------+
```

This is a three-layer architecture suitable for an academic project: Presentation (screens/components), Custom Hooks (business logic bridge), and Data Access (direct SQL via repository functions). There is no need for a state management library (Zustand, Redux) because `useSQLiteContext` combined with React's built-in `useState`/`useEffect` is sufficient for this scope.

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| `app/_layout.tsx` | Root layout: wraps entire app in `SQLiteProvider` with `Suspense` fallback | Expo Router layout file |
| `app/(tabs)/_layout.tsx` | Tab navigation: defines bottom tab bar with 4 tabs | Expo Router tabs layout |
| `app/(tabs)/index.tsx` | Dashboard / Home screen: account balances overview | Screen component using `useCuentas()` |
| `app/(tabs)/transacciones.tsx` | Transaction list + add form | Screen component using `useTransacciones()` |
| `app/(tabs)/categorias.tsx` | Category management (CRUD) | Screen component using `useCategorias()` |
| `app/(tabs)/informes.tsx` | Reports: aggregation charts and summaries | Screen component using `useInformes()` |
| `src/db/database.ts` | DB initialization: schema creation, triggers, PRAGMAs, migrations | `migrateDbIfNeeded(db: SQLiteDatabase)` function |
| `src/db/cuentas.ts` | Repository: CRUD operations for accounts | Functions taking `SQLiteDatabase` as parameter |
| `src/db/categorias.ts` | Repository: CRUD + referential integrity for categories | Functions taking `SQLiteDatabase` as parameter |
| `src/db/transacciones.ts` | Repository: Transactional inserts/updates/deletes | Functions using `withExclusiveTransactionAsync` |
| `src/db/presupuestos.ts` | Repository: Budget CRUD | Functions taking `SQLiteDatabase` as parameter |
| `src/db/informes.ts` | Repository: Aggregate SQL queries (SUM, GROUP BY) | Pure SQL queries, no JS processing |
| `src/hooks/useCuentas.ts` | Hook: bridges accounts repository to React state | Custom hook using `useSQLiteContext()` |
| `src/hooks/useTransacciones.ts` | Hook: bridges transactions repository to React state | Custom hook with transaction support |
| `src/hooks/useCategorias.ts` | Hook: bridges categories repository to React state | Custom hook with refresh logic |
| `src/hooks/useInformes.ts` | Hook: bridges aggregate queries to React state | Custom hook returning report data |
| `src/components/` | Reusable UI components (forms, lists, cards) | Pure presentational components |
| `src/types/` | TypeScript interfaces for DB entities | `Cuenta`, `Categoria`, `Transaccion`, `Presupuesto` |

## Recommended Project Structure

```
finanzas-app/
├── app/                          # Expo Router: file-based navigation
│   ├── _layout.tsx               # Root layout: SQLiteProvider + Suspense
│   ├── (tabs)/                   # Tab group
│   │   ├── _layout.tsx           # Tab bar configuration (4 tabs)
│   │   ├── index.tsx             # Dashboard: account balances
│   │   ├── transacciones.tsx     # Transaction list + add
│   │   ├── categorias.tsx        # Category management
│   │   └── informes.tsx          # Reports / analytics
│   └── modal/                    # Modal screens (optional)
│       ├── nueva-transaccion.tsx  # New transaction form
│       └── nueva-cuenta.tsx       # New account form
├── src/                          # Application source (non-routing)
│   ├── db/                       # Data access layer
│   │   ├── database.ts           # Schema init, migrations, PRAGMAs, triggers
│   │   ├── cuentas.ts            # Account repository functions
│   │   ├── categorias.ts         # Category repository functions
│   │   ├── transacciones.ts      # Transaction repository functions
│   │   ├── presupuestos.ts       # Budget repository functions
│   │   └── informes.ts           # Aggregate query functions
│   ├── hooks/                    # Custom React hooks
│   │   ├── useCuentas.ts         # Account state + operations
│   │   ├── useTransacciones.ts   # Transaction state + operations
│   │   ├── useCategorias.ts      # Category state + operations
│   │   └── useInformes.ts        # Report data hook
│   ├── components/               # Reusable UI components
│   │   ├── TransaccionItem.tsx   # Single transaction row
│   │   ├── CategoriaCard.tsx     # Category display card
│   │   ├── CuentaResumen.tsx     # Account balance summary
│   │   ├── InformeGrafico.tsx    # Chart/summary component
│   │   └── FormularioTransaccion.tsx  # Transaction input form
│   ├── types/                    # TypeScript type definitions
│   │   └── index.ts              # Cuenta, Categoria, Transaccion, Presupuesto
│   └── constants/                # App constants
│       └── index.ts              # Colors, default categories, etc.
├── assets/                       # Static assets (images, fonts)
├── app.json                      # Expo configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies
└── expo-env.d.ts                 # Expo TypeScript environment
```

### Structure Rationale

- **`app/` at root level:** Expo Router requires the `app/` directory at the root for file-based routing in SDK 54. (`src/app/` es la convención de SDK 55+, no se usa aquí.)
- **`src/db/` separate from `app/`:** Database logic must NOT live inside `app/` because Expo Router treats every file in `app/` as a route. Placing repositories in `src/db/` keeps them importable by any screen without creating phantom routes.
- **`src/hooks/` as bridge layer:** Custom hooks sit between raw SQL repositories and React components. Each hook calls `useSQLiteContext()` to get the `db` instance, then calls repository functions. This separation means screens never write SQL directly, and repository functions never manage React state.
- **`src/types/` centralized:** All TypeScript interfaces in one place ensures consistency between repository return types and component props. For a 4-entity app, a single `index.ts` file is sufficient.
- **`src/components/` flat:** With roughly 5-8 components, a flat folder is cleaner than nested feature folders. Feature-based nesting is overkill for this scope.
- **No `src/services/` or `src/api/`:** This is an offline-first app with no backend. Adding empty abstraction layers adds complexity without value.

## Architectural Patterns

### Pattern 1: SQLiteProvider at Root Layout

**What:** Wrap the entire app in `SQLiteProvider` within the root `_layout.tsx`, using React `Suspense` for loading states and the `onInit` callback for database initialization.

**When to use:** Always. This is the canonical expo-sqlite v14+ pattern.

**Trade-offs:** Simple and idiomatic. The entire app has database access. Slight delay on first launch while schema initializes, but Suspense handles this gracefully.

**Example:**

```typescript
// app/_layout.tsx
import { Suspense } from 'react';
import { SQLiteProvider } from 'expo-sqlite';
import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { migrateDbIfNeeded } from '@/src/db/database';

function LoadingFallback() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

export default function RootLayout() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SQLiteProvider
        databaseName="finanzas.db"
        onInit={migrateDbIfNeeded}
        useSuspense
      >
        <Stack />
      </SQLiteProvider>
    </Suspense>
  );
}
```

### Pattern 2: Version-Based Migration in onInit

**What:** Use `PRAGMA user_version` to track schema version and apply incremental migrations. The `onInit` callback receives a `SQLiteDatabase` instance and runs before any child component renders.

**When to use:** Always for database initialization. Even if you never need to migrate (academic project with one version), this pattern is correct from the start and demonstrates proper practice.

**Trade-offs:** Slightly more code than a raw `CREATE TABLE` dump, but handles future schema changes and is the pattern shown in official Expo documentation.

**Example:**

```typescript
// src/db/database.ts
import { type SQLiteDatabase } from 'expo-sqlite';

const DATABASE_VERSION = 1;

export async function migrateDbIfNeeded(db: SQLiteDatabase): Promise<void> {
  // Habilitar claves foraneas (obligatorio para integridad referencial)
  await db.execAsync('PRAGMA foreign_keys = ON;');
  // Modo WAL para mejor rendimiento en lecturas concurrentes
  await db.execAsync('PRAGMA journal_mode = WAL;');

  const result = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );
  let currentVersion = result?.user_version ?? 0;

  if (currentVersion < 1) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS cuentas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        saldo REAL NOT NULL DEFAULT 0,
        tipo TEXT NOT NULL CHECK(tipo IN ('efectivo','banco','tarjeta')),
        creado_en TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL UNIQUE,
        tipo TEXT NOT NULL CHECK(tipo IN ('ingreso','gasto')),
        icono TEXT
      );

      CREATE TABLE IF NOT EXISTS transacciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        monto REAL NOT NULL,
        tipo TEXT NOT NULL CHECK(tipo IN ('ingreso','gasto')),
        descripcion TEXT,
        fecha TEXT NOT NULL DEFAULT (datetime('now')),
        cuenta_id INTEGER NOT NULL,
        categoria_id INTEGER NOT NULL,
        FOREIGN KEY (cuenta_id) REFERENCES cuentas(id) ON DELETE RESTRICT,
        FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT
      );

      CREATE TABLE IF NOT EXISTS presupuestos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        categoria_id INTEGER NOT NULL,
        monto_limite REAL NOT NULL,
        monto_gastado REAL NOT NULL DEFAULT 0,
        mes TEXT NOT NULL,
        FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
      );

      -- Trigger: actualizar saldo de cuenta tras insertar transaccion
      CREATE TRIGGER IF NOT EXISTS trg_actualizar_saldo_insert
      AFTER INSERT ON transacciones
      BEGIN
        UPDATE cuentas SET saldo = saldo +
          CASE WHEN NEW.tipo = 'ingreso' THEN NEW.monto ELSE -NEW.monto END
        WHERE id = NEW.cuenta_id;
      END;

      -- Trigger: actualizar presupuesto gastado tras insertar gasto
      CREATE TRIGGER IF NOT EXISTS trg_actualizar_presupuesto_insert
      AFTER INSERT ON transacciones
      WHEN NEW.tipo = 'gasto'
      BEGIN
        UPDATE presupuestos SET monto_gastado = monto_gastado + NEW.monto
        WHERE categoria_id = NEW.categoria_id
          AND mes = strftime('%Y-%m', NEW.fecha);
      END;
    `);
    currentVersion = 1;
  }

  // Futuras migraciones: if (currentVersion < 2) { ... }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
```

### Pattern 3: Repository Functions (Not Classes)

**What:** Each entity gets a file in `src/db/` containing plain exported functions that take `SQLiteDatabase` as their first parameter. No classes, no ORM, no abstraction beyond typed functions.

**When to use:** For this academic project scope. A repository class or Drizzle ORM would be overkill for 4 tables. Plain functions are easier to explain in an academic paper and demonstrate direct SQL usage, which is the pedagogical goal.

**Trade-offs:** No type-safe query building (you write raw SQL strings). This is actually a benefit here: the academic paper needs to show SQL queries running in the engine, not hidden behind an ORM.

**Example:**

```typescript
// src/db/transacciones.ts
import { type SQLiteDatabase } from 'expo-sqlite';
import { type Transaccion, type NuevaTransaccion } from '@/src/types';

// Obtener todas las transacciones ordenadas por fecha
export async function obtenerTransacciones(
  db: SQLiteDatabase
): Promise<Transaccion[]> {
  return await db.getAllAsync<Transaccion>(
    `SELECT t.*, c.nombre AS categoria_nombre, cu.nombre AS cuenta_nombre
     FROM transacciones t
     JOIN categorias c ON t.categoria_id = c.id
     JOIN cuentas cu ON t.cuenta_id = cu.id
     ORDER BY t.fecha DESC`
  );
}

// Insertar transaccion con garantia ACID
export async function insertarTransaccion(
  db: SQLiteDatabase,
  transaccion: NuevaTransaccion
): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO transacciones (monto, tipo, descripcion, fecha, cuenta_id, categoria_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      transaccion.monto,
      transaccion.tipo,
      transaccion.descripcion ?? null,
      transaccion.fecha,
      transaccion.cuenta_id,
      transaccion.categoria_id,
    ]
  );
  return result.lastInsertRowId;
}

// Eliminar transaccion dentro de transaccion exclusiva (ACID)
export async function eliminarTransaccion(
  db: SQLiteDatabase,
  id: number
): Promise<void> {
  await db.withExclusiveTransactionAsync(async (txn) => {
    // Obtener datos de la transaccion antes de eliminar
    const t = await txn.getFirstAsync<Transaccion>(
      'SELECT * FROM transacciones WHERE id = ?', [id]
    );
    if (!t) throw new Error('Transaccion no encontrada');

    // Revertir saldo de la cuenta
    const ajuste = t.tipo === 'ingreso' ? -t.monto : t.monto;
    await txn.runAsync(
      'UPDATE cuentas SET saldo = saldo + ? WHERE id = ?',
      [ajuste, t.cuenta_id]
    );

    // Revertir presupuesto si era gasto
    if (t.tipo === 'gasto') {
      await txn.runAsync(
        `UPDATE presupuestos SET monto_gastado = monto_gastado - ?
         WHERE categoria_id = ? AND mes = strftime('%Y-%m', ?)`,
        [t.monto, t.categoria_id, t.fecha]
      );
    }

    // Eliminar la transaccion
    await txn.runAsync('DELETE FROM transacciones WHERE id = ?', [id]);
  });
}
```

### Pattern 4: Custom Hooks as Bridge Layer

**What:** Each domain entity gets a custom hook in `src/hooks/` that calls `useSQLiteContext()` to obtain the database instance, then delegates to repository functions. The hook manages React state (loading, error, data) and exposes operations to the screen.

**When to use:** Always. This is the clean boundary between "React world" (state, effects, re-renders) and "SQL world" (queries, transactions).

**Trade-offs:** One more file per entity. Worth it because screens remain purely presentational and the hook is testable in isolation.

**Example:**

```typescript
// src/hooks/useTransacciones.ts
import { useState, useEffect, useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import * as repo from '@/src/db/transacciones';
import { type Transaccion, type NuevaTransaccion } from '@/src/types';

export function useTransacciones() {
  const db = useSQLiteContext();
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const datos = await repo.obtenerTransacciones(db);
      setTransacciones(datos);
    } finally {
      setCargando(false);
    }
  }, [db]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const agregar = useCallback(async (nueva: NuevaTransaccion) => {
    await repo.insertarTransaccion(db, nueva);
    await cargar(); // Re-fetch after insert
  }, [db, cargar]);

  const eliminar = useCallback(async (id: number) => {
    await repo.eliminarTransaccion(db, id);
    await cargar(); // Re-fetch after delete
  }, [db, cargar]);

  return { transacciones, cargando, agregar, eliminar, recargar: cargar };
}
```

### Pattern 5: Aggregate Queries in Pure SQL

**What:** All reporting and analytics queries run entirely in the SQLite engine via `getAllAsync`. The JavaScript layer receives pre-computed results -- no `Array.reduce()`, no `map/filter` for aggregation. This is a core academic requirement: demonstrating that the DBMS performs the computation.

**When to use:** Every report, summary, or chart data source. SUM, COUNT, AVG, GROUP BY, and date functions all execute in SQL.

**Trade-offs:** SQL strings can be long and harder to maintain than JS code. This is acceptable because the academic paper needs to show these SQL queries verbatim as evidence.

**Example:**

```typescript
// src/db/informes.ts
import { type SQLiteDatabase } from 'expo-sqlite';

export interface GastosPorCategoria {
  categoria_nombre: string;
  total: number;
  num_transacciones: number;
}

export interface ResumenMensual {
  mes: string;
  ingresos: number;
  gastos: number;
  balance: number;
}

// Gastos agrupados por categoria en un mes dado
export async function obtenerGastosPorCategoria(
  db: SQLiteDatabase,
  mes: string // formato: '2026-04'
): Promise<GastosPorCategoria[]> {
  return await db.getAllAsync<GastosPorCategoria>(
    `SELECT c.nombre AS categoria_nombre,
            SUM(t.monto) AS total,
            COUNT(t.id) AS num_transacciones
     FROM transacciones t
     JOIN categorias c ON t.categoria_id = c.id
     WHERE t.tipo = 'gasto'
       AND strftime('%Y-%m', t.fecha) = ?
     GROUP BY c.nombre
     ORDER BY total DESC`,
    [mes]
  );
}

// Resumen mensual: ingresos vs gastos con balance
export async function obtenerResumenMensual(
  db: SQLiteDatabase,
  anio: string // formato: '2026'
): Promise<ResumenMensual[]> {
  return await db.getAllAsync<ResumenMensual>(
    `SELECT strftime('%Y-%m', fecha) AS mes,
            SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) AS ingresos,
            SUM(CASE WHEN tipo = 'gasto' THEN monto ELSE 0 END) AS gastos,
            SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE -monto END) AS balance
     FROM transacciones
     WHERE strftime('%Y', fecha) = ?
     GROUP BY mes
     ORDER BY mes ASC`,
    [anio]
  );
}
```

## Data Flow

### Request Flow (Write: Insert Transaction)

```
[User taps "Guardar"]
    |
[TransaccionesScreen] --> useTransacciones().agregar(data)
    |
[useTransacciones hook] --> repo.insertarTransaccion(db, data)
    |
[transacciones.ts repo] --> db.runAsync('INSERT INTO transacciones ...')
    |
[SQLite Engine] --> INSERT row + fire trg_actualizar_saldo_insert
                                  + fire trg_actualizar_presupuesto_insert
    |
[Hook] --> repo.obtenerTransacciones(db)  // re-fetch
    |
[Hook] --> setTransacciones(newData)  // React state update
    |
[TransaccionesScreen] --> re-renders with new data
```

### Request Flow (Read: Monthly Report)

```
[InformesScreen mounts]
    |
[useInformes hook] --> useEffect triggers cargar()
    |
[informes.ts repo] --> db.getAllAsync('SELECT ... GROUP BY ...')
    |
[SQLite Engine] --> executes SUM/GROUP BY entirely in native engine
    |
[Hook] --> setDatos(results)  // already aggregated, no JS processing
    |
[InformesScreen] --> renders chart/table with pre-computed data
```

### State Management

There is no global state store. Each screen manages its own data through its dedicated hook. This is sufficient because:

1. **No shared mutable state:** Each screen fetches its own data from the single SQLite database (the source of truth).
2. **No cross-screen real-time sync needed:** When the user navigates to a different tab, the hook in the destination screen re-fetches from the database via `useEffect`. Data is always fresh from SQLite.
3. **Triggers handle side effects:** When a transaction is inserted, triggers automatically update account balances and budget amounts in the database. The next screen that reads those values gets the updated data.

```
SQLite DB (single source of truth)
    |
    +-- useCuentas() reads cuentas table
    +-- useTransacciones() reads transacciones + writes
    +-- useCategorias() reads/writes categorias
    +-- useInformes() reads via aggregate queries
```

### Key Data Flows

1. **Transaction insert cascade:** User inserts a transaction -> `INSERT INTO transacciones` fires -> trigger `trg_actualizar_saldo_insert` updates `cuentas.saldo` -> trigger `trg_actualizar_presupuesto_insert` updates `presupuestos.monto_gastado` -> hook re-fetches and re-renders. All three table updates happen atomically within a single SQLite statement.

2. **Category deletion with integrity:** User attempts to delete a category -> `DELETE FROM categorias WHERE id = ?` -> SQLite checks FK constraint on `transacciones.categoria_id` (RESTRICT) -> if transactions exist, the delete fails with an error -> hook catches error and shows message to user. Presupuestos use CASCADE so they are cleaned up automatically.

3. **Report generation:** User opens reports tab -> `useInformes` fires aggregate query with `SUM`, `GROUP BY`, `strftime` -> SQLite engine computes everything natively -> hook receives pre-aggregated results -> component renders directly.

## Build Order (Implementation Sequence)

This build order reflects technical dependencies (what must exist before what):

| Step | What | Depends On | Deliverable |
|------|------|------------|-------------|
| 1 | Expo project scaffold + TypeScript config | Nothing | `npx create-expo-app` with tabs template |
| 2 | Type definitions (`src/types/index.ts`) | Nothing | `Cuenta`, `Categoria`, `Transaccion`, `Presupuesto` interfaces |
| 3 | DB initialization (`src/db/database.ts`) | Types (for reference) | `migrateDbIfNeeded` with schema, PRAGMAs, triggers |
| 4 | SQLiteProvider in root layout (`app/_layout.tsx`) | DB init function | App wraps children in provider |
| 5 | Account repository (`src/db/cuentas.ts`) | DB init (tables exist) | CRUD functions for accounts |
| 6 | Category repository (`src/db/categorias.ts`) | DB init | CRUD + integrity constraint handling |
| 7 | Transaction repository (`src/db/transacciones.ts`) | DB init, accounts + categories exist | CRUD with exclusive transactions |
| 8 | Budget repository (`src/db/presupuestos.ts`) | DB init, categories exist | CRUD for budgets |
| 9 | Report queries (`src/db/informes.ts`) | DB init, transactions populated | Aggregate query functions |
| 10 | Custom hooks (`src/hooks/*.ts`) | Repositories | Bridge layer for all entities |
| 11 | UI components (`src/components/*.tsx`) | Types | Presentational components |
| 12 | Screen implementations (`app/(tabs)/*.tsx`) | Hooks + components | Functional screens |
| 13 | Tab navigation (`app/(tabs)/_layout.tsx`) | Screens exist | Configured tab bar |

**Critical path:** Steps 1-4 are the foundation. Steps 5-9 (repositories) can be built in parallel. Steps 10-13 build on top.

## Anti-Patterns

### Anti-Pattern 1: SQL in Components

**What people do:** Write SQL queries directly in screen components using `useSQLiteContext()`.
**Why it's wrong:** Mixes data access logic with presentation. Makes SQL queries hard to find, reuse, or explain in the academic paper. Creates tightly coupled components.
**Do this instead:** Components call hooks, hooks call repository functions, repository functions contain SQL. The screen never sees a SQL string.

### Anti-Pattern 2: JavaScript Aggregation

**What people do:** Fetch all rows with `SELECT *` and then use `Array.reduce()` or loops in JavaScript to compute sums, averages, and groupings.
**Why it's wrong:** Defeats the purpose of using a relational database. Wastes memory loading all rows into JS. Slower than native SQLite aggregation. Academically, fails to demonstrate DBMS capabilities.
**Do this instead:** Write `SUM()`, `COUNT()`, `AVG()`, `GROUP BY`, `HAVING` in SQL. The JS layer receives pre-computed results.

### Anti-Pattern 3: Using withTransactionAsync for Writes

**What people do:** Use `withTransactionAsync` for write operations that need ACID guarantees.
**Why it's wrong:** `withTransactionAsync` is NOT exclusive. Other async queries can interleave and execute within the transaction boundary, breaking isolation. The order of execution is not guaranteed.
**Do this instead:** Use `withExclusiveTransactionAsync` for any multi-step write operation. It ensures that while the transaction is active, other write queries will abort with a "database is locked" error, preserving true ACID isolation.

### Anti-Pattern 4: Forgetting PRAGMA foreign_keys = ON

**What people do:** Define FOREIGN KEY constraints in CREATE TABLE statements but never execute `PRAGMA foreign_keys = ON`.
**Why it's wrong:** SQLite does NOT enforce foreign key constraints by default. The constraints are parsed but ignored. Your referential integrity is a lie.
**Do this instead:** Execute `PRAGMA foreign_keys = ON` as the first statement in `onInit` / `migrateDbIfNeeded`, before any table creation or data operations.

### Anti-Pattern 5: Database Files Inside app/ Directory

**What people do:** Place `database.ts` or repository files inside the `app/` directory for convenience.
**Why it's wrong:** Expo Router treats every `.ts`/`.tsx` file in `app/` as a route. Your `database.ts` would become a navigable screen.
**Do this instead:** All non-routing code goes in `src/`. Only layout files and screen components live in `app/`.

## Integration Points

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Screen <-> Hook | Hook returns `{ data, loading, operations }` | Screens are purely presentational |
| Hook <-> Repository | Repository functions take `SQLiteDatabase` as first arg | Pure functions, no React dependencies |
| Repository <-> SQLite | `db.getAllAsync`, `db.runAsync`, `db.getFirstAsync` | Typed generics for return types |
| SQLite <-> Triggers | Automatic: triggers fire on INSERT/UPDATE/DELETE | No application code needed; triggers maintain consistency |
| Root Layout <-> All Screens | `SQLiteProvider` context propagation | Provider at root ensures all descendants have DB access |

### External Dependencies (minimal)

| Dependency | Purpose | Notes |
|------------|---------|-------|
| `expo-sqlite` | SQLite database access | Core dependency, v14+ with async API |
| `expo-router` | File-based navigation | Built into Expo, provides tab navigation |
| `react-native` | UI framework | Core framework |
| `expo` | Platform tooling | Build, dev server, asset management |

No external charting library is strictly required. Reports can use styled `View` components with percentage-width bars. If a chart is desired for visual impact in the academic paper, `react-native-chart-kit` or `victory-native` are options but not architectural decisions -- they are presentation-only additions.

## Sources

- [Expo SQLite Official Documentation](https://docs.expo.dev/versions/latest/sdk/sqlite/) - PRIMARY source for SQLiteProvider, useSQLiteContext, onInit, API methods -- HIGH confidence
- [Expo Official Example: with-sqlite](https://github.com/expo/examples/blob/master/with-sqlite/App.tsx) - Reference implementation from Expo team -- HIGH confidence
- [Expo Blog: Modern SQLite for React Native apps](https://expo.dev/blog/modern-sqlite-for-react-native-apps) - Architecture patterns and modern API usage -- HIGH confidence
- [Expo Blog: App Folder Structure Best Practices](https://expo.dev/blog/expo-app-folder-structure-best-practices) - Project organization guidance for Expo Router -- HIGH confidence
- [Expo Docs: Project Structure](https://docs.expo.dev/versions/v54.0.0/develop/project-structure/) - Official default structure for SDK 54 — `app/` at root -- HIGH confidence
- [Expo Docs: src Directory](https://docs.expo.dev/router/reference/src-directory/) - Using src/ with Expo Router -- HIGH confidence
- [expo-sqlite GitHub docs source](https://github.com/expo/expo/blob/main/docs/pages/versions/unversioned/sdk/sqlite.mdx) - Raw documentation source for API details -- HIGH confidence
- [Expo SQLite: Complete Guide for Offline-First Apps (Medium)](https://medium.com/@aargon007/expo-sqlite-a-complete-guide-for-offline-first-react-native-apps-984fd50e3adb) - Community patterns, verified against official docs -- MEDIUM confidence
- [DB Pro Blog: Using SQLite with Expo](https://www.dbpro.app/blog/expo-sqlite) - Additional examples and patterns -- MEDIUM confidence

---
*Architecture research for: Offline-first iOS personal finance app (React Native + Expo + expo-sqlite)*
*Researched: 2026-04-06*
