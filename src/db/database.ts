import * as SQLite from 'expo-sqlite';

const DB_NAME = 'finanzas.db';
const SCHEMA_VERSION = 2;

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await migrateDbIfNeeded(db);
      return db;
    })();
  }

  return dbPromise;
}

export async function migrateDbIfNeeded(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await db.execAsync('PRAGMA journal_mode = WAL;');

  const current = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
  const currentVersion = current?.user_version ?? 0;

  if (currentVersion >= SCHEMA_VERSION) {
    return;
  }

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS cuentas (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre  TEXT    NOT NULL,
      tipo    TEXT    NOT NULL CHECK(tipo IN ('efectivo', 'banco', 'tarjeta'))
    );

    CREATE TABLE IF NOT EXISTS categorias (
      id     INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT    NOT NULL UNIQUE,
      tipo   TEXT    NOT NULL CHECK(tipo IN ('ingreso', 'gasto'))
    );

    CREATE TABLE IF NOT EXISTS transacciones (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      cuenta_id    INTEGER NOT NULL REFERENCES cuentas(id)    ON DELETE RESTRICT,
      categoria_id INTEGER NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
      tipo         TEXT    NOT NULL CHECK(tipo IN ('ingreso', 'gasto')),
      importe      REAL    NOT NULL CHECK(importe > 0),
      fecha        TEXT    NOT NULL,
      descripcion  TEXT
    );

    CREATE TABLE IF NOT EXISTS presupuestos (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      categoria_id INTEGER NOT NULL UNIQUE REFERENCES categorias(id) ON DELETE CASCADE,
      mes          TEXT    NOT NULL,
      limite       REAL    NOT NULL CHECK(limite > 0),
      restante     REAL    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_txn_fecha ON transacciones(fecha);
    CREATE INDEX IF NOT EXISTS idx_txn_categoria ON transacciones(categoria_id);

    CREATE VIEW IF NOT EXISTS resumen_mensual AS
    SELECT
      c.nombre AS categoria,
      strftime('%Y-%m', t.fecha) AS mes,
      SUM(t.importe) AS total,
      COUNT(t.id) AS num_transacciones
    FROM transacciones t
    JOIN categorias c ON c.id = t.categoria_id
    WHERE t.tipo = 'gasto'
    GROUP BY c.id, strftime('%Y-%m', t.fecha)
    ORDER BY mes DESC, total DESC;

    CREATE TRIGGER IF NOT EXISTS actualizar_presupuesto_tras_gasto
    AFTER INSERT ON transacciones
    WHEN NEW.tipo = 'gasto'
    BEGIN
      UPDATE presupuestos
      SET restante = restante - NEW.importe
      WHERE categoria_id = NEW.categoria_id
        AND mes = strftime('%Y-%m', NEW.fecha);
    END;

    CREATE TRIGGER IF NOT EXISTS revertir_presupuesto_tras_borrar_gasto
    AFTER DELETE ON transacciones
    WHEN OLD.tipo = 'gasto'
    BEGIN
      UPDATE presupuestos
      SET restante = restante + OLD.importe
      WHERE categoria_id = OLD.categoria_id
        AND mes = strftime('%Y-%m', OLD.fecha);
    END;

    PRAGMA user_version = ${SCHEMA_VERSION};
  `);
}

export async function withWriteTransaction<T>(
  operation: (txn: SQLite.SQLiteDatabase) => Promise<T>
): Promise<T> {
  const db = await getDatabase();
  let result: T | undefined;

  await db.withExclusiveTransactionAsync(async (txn) => {
    result = await operation(txn as SQLite.SQLiteDatabase);
  });

  return result as T;
}

export function currentMonthString(): string {
  return new Date().toISOString().slice(0, 7);
}
