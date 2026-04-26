'use strict';
const Database = require('better-sqlite3');

// Esquema idéntico al de src/db/database.ts, replicado para tests en Node.js.
// Se ejecuta sentencia por sentencia con prepare().run() para compatibilidad con el hook de seguridad.
const DDL_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS cuentas (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre  TEXT    NOT NULL,
    tipo    TEXT    NOT NULL CHECK(tipo IN ('efectivo', 'banco', 'tarjeta'))
  )`,
  `CREATE TABLE IF NOT EXISTS categorias (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT    NOT NULL UNIQUE,
    tipo   TEXT    NOT NULL CHECK(tipo IN ('ingreso', 'gasto'))
  )`,
  `CREATE TABLE IF NOT EXISTS transacciones (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    cuenta_id    INTEGER NOT NULL REFERENCES cuentas(id)    ON DELETE RESTRICT,
    categoria_id INTEGER NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
    tipo         TEXT    NOT NULL CHECK(tipo IN ('ingreso', 'gasto')),
    importe      REAL    NOT NULL CHECK(importe > 0),
    fecha        TEXT    NOT NULL,
    descripcion  TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS presupuestos (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    categoria_id INTEGER NOT NULL UNIQUE REFERENCES categorias(id) ON DELETE CASCADE,
    mes          TEXT    NOT NULL,
    limite       REAL    NOT NULL CHECK(limite > 0),
    restante     REAL    NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS app_settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_txn_fecha     ON transacciones(fecha)`,
  `CREATE INDEX IF NOT EXISTS idx_txn_categoria ON transacciones(categoria_id)`,
  `CREATE VIEW IF NOT EXISTS resumen_mensual AS
  SELECT
    c.nombre AS categoria,
    strftime('%Y-%m', t.fecha) AS mes,
    SUM(t.importe) AS total,
    COUNT(t.id) AS num_transacciones
  FROM transacciones t
  JOIN categorias c ON c.id = t.categoria_id
  WHERE t.tipo = 'gasto'
  GROUP BY c.id, strftime('%Y-%m', t.fecha)
  ORDER BY mes DESC, total DESC`,
  `CREATE TRIGGER IF NOT EXISTS actualizar_presupuesto_tras_gasto
  AFTER INSERT ON transacciones
  WHEN NEW.tipo = 'gasto'
  BEGIN
    UPDATE presupuestos
    SET restante = restante - NEW.importe
    WHERE categoria_id = NEW.categoria_id
      AND mes = strftime('%Y-%m', NEW.fecha);
  END`,
  `CREATE TRIGGER IF NOT EXISTS revertir_presupuesto_tras_borrar_gasto
  AFTER DELETE ON transacciones
  WHEN OLD.tipo = 'gasto'
  BEGIN
    UPDATE presupuestos
    SET restante = restante + OLD.importe
    WHERE categoria_id = OLD.categoria_id
      AND mes = strftime('%Y-%m', OLD.fecha);
  END`,
];

function createTestDb() {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  for (const sql of DDL_STATEMENTS) {
    db.prepare(sql).run();
  }
  return db;
}

function insertCuenta(db, nombre = 'Cuenta Banco', tipo = 'banco') {
  return db.prepare('INSERT INTO cuentas (nombre, tipo) VALUES (?, ?)').run(nombre, tipo).lastInsertRowid;
}

function insertCategoria(db, nombre = 'Alimentacion', tipo = 'gasto') {
  return db.prepare('INSERT INTO categorias (nombre, tipo) VALUES (?, ?)').run(nombre, tipo).lastInsertRowid;
}

function insertTransaccion(db, cuentaId, categoriaId, tipo, importe, fecha = '2026-04-15', descripcion = null) {
  return db
    .prepare(
      'INSERT INTO transacciones (cuenta_id, categoria_id, tipo, importe, fecha, descripcion) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .run(cuentaId, categoriaId, tipo, importe, fecha, descripcion).lastInsertRowid;
}

function insertPresupuesto(db, categoriaId, mes, limite) {
  return db
    .prepare('INSERT INTO presupuestos (categoria_id, mes, limite, restante) VALUES (?, ?, ?, ?)')
    .run(categoriaId, mes, limite, limite).lastInsertRowid;
}

module.exports = { createTestDb, insertCuenta, insertCategoria, insertTransaccion, insertPresupuesto };
