-- Proyecto: Trabajo CBD - App iOS con SQLite
-- Asignatura: CBD (Bases de Datos)
-- Fecha: 2026-04-06
-- Descripcion: Esquema fisico SQL con tablas, restricciones, indices, vista y triggers.

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- Tabla de cuentas del usuario para clasificar origen de fondos.
CREATE TABLE IF NOT EXISTS cuentas (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre  TEXT    NOT NULL,
  tipo    TEXT    NOT NULL CHECK(tipo IN ('efectivo', 'banco', 'tarjeta'))
);

-- Tabla de categorias para organizar ingresos y gastos.
CREATE TABLE IF NOT EXISTS categorias (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT    NOT NULL UNIQUE,
  tipo   TEXT    NOT NULL CHECK(tipo IN ('ingreso', 'gasto'))
);

-- Tabla de transacciones con integridad referencial y validaciones de importe.
CREATE TABLE IF NOT EXISTS transacciones (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  cuenta_id    INTEGER NOT NULL REFERENCES cuentas(id)    ON DELETE RESTRICT,
  categoria_id INTEGER NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
  tipo         TEXT    NOT NULL CHECK(tipo IN ('ingreso', 'gasto')),
  importe      REAL    NOT NULL CHECK(importe > 0),
  fecha        TEXT    NOT NULL DEFAULT (date('now')),
  descripcion  TEXT
);

-- Tabla de presupuestos por categoria y mes, con un unico registro activo por categoria.
CREATE TABLE IF NOT EXISTS presupuestos (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  categoria_id INTEGER NOT NULL UNIQUE REFERENCES categorias(id) ON DELETE CASCADE,
  mes          TEXT    NOT NULL,
  limite       REAL    NOT NULL CHECK(limite > 0),
  restante     REAL    NOT NULL
);

-- Indices para acelerar filtros por fecha y agrupaciones por categoria.
CREATE INDEX IF NOT EXISTS idx_txn_fecha     ON transacciones(fecha);
CREATE INDEX IF NOT EXISTS idx_txn_categoria ON transacciones(categoria_id);

-- Vista de reporte mensual para agregacion de gastos por categoria.
CREATE VIEW IF NOT EXISTS resumen_mensual AS
SELECT
  c.nombre                   AS categoria,
  strftime('%Y-%m', t.fecha) AS mes,
  SUM(t.importe)             AS total,
  COUNT(t.id)                AS num_transacciones
FROM transacciones t
JOIN categorias c ON t.categoria_id = c.id
WHERE t.tipo = 'gasto'
GROUP BY c.id, strftime('%Y-%m', t.fecha)
ORDER BY mes DESC, total DESC;

-- Trigger: descuenta del presupuesto al registrar un gasto.
CREATE TRIGGER IF NOT EXISTS actualizar_presupuesto_tras_gasto
AFTER INSERT ON transacciones
WHEN NEW.tipo = 'gasto'
BEGIN
  UPDATE presupuestos
  SET    restante = restante - NEW.importe
  WHERE  categoria_id = NEW.categoria_id;
END;

-- Trigger simetrico: devuelve al presupuesto al borrar un gasto.
CREATE TRIGGER IF NOT EXISTS revertir_presupuesto_tras_borrar_gasto
AFTER DELETE ON transacciones
WHEN OLD.tipo = 'gasto'
BEGIN
  UPDATE presupuestos
  SET    restante = restante + OLD.importe
  WHERE  categoria_id = OLD.categoria_id;
END;