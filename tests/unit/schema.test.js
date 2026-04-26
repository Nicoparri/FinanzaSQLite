'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createTestDb } = require('../setup');

test('esquema: todas las tablas requeridas existen', () => {
  const db = createTestDb();
  const names = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    .all()
    .map((r) => r.name);

  for (const expected of ['app_settings', 'categorias', 'cuentas', 'presupuestos', 'transacciones']) {
    assert.ok(names.includes(expected), `Falta la tabla: ${expected}`);
  }
});

test('esquema: los índices de rendimiento existen', () => {
  const db = createTestDb();
  const names = db
    .prepare("SELECT name FROM sqlite_master WHERE type='index'")
    .all()
    .map((r) => r.name);

  assert.ok(names.includes('idx_txn_fecha'), 'Falta el índice idx_txn_fecha');
  assert.ok(names.includes('idx_txn_categoria'), 'Falta el índice idx_txn_categoria');
});

test('esquema: la vista resumen_mensual existe', () => {
  const db = createTestDb();
  const names = db
    .prepare("SELECT name FROM sqlite_master WHERE type='view'")
    .all()
    .map((r) => r.name);

  assert.ok(names.includes('resumen_mensual'), 'Falta la vista resumen_mensual');
});

test('esquema: los dos triggers del presupuesto existen', () => {
  const db = createTestDb();
  const names = db
    .prepare("SELECT name FROM sqlite_master WHERE type='trigger'")
    .all()
    .map((r) => r.name);

  assert.ok(
    names.includes('actualizar_presupuesto_tras_gasto'),
    'Falta el trigger actualizar_presupuesto_tras_gasto'
  );
  assert.ok(
    names.includes('revertir_presupuesto_tras_borrar_gasto'),
    'Falta el trigger revertir_presupuesto_tras_borrar_gasto'
  );
});

test('esquema: PRAGMA foreign_keys está activado en la conexión', () => {
  const db = createTestDb();
  const result = db.pragma('foreign_keys', { simple: true });
  assert.equal(result, 1, 'Las claves foráneas deben estar activadas');
});

test('esquema: cuentas tiene las columnas correctas', () => {
  const db = createTestDb();
  const cols = db.prepare('PRAGMA table_info(cuentas)').all().map((c) => c.name);
  for (const col of ['id', 'nombre', 'tipo']) {
    assert.ok(cols.includes(col), `Falta la columna cuentas.${col}`);
  }
});

test('esquema: transacciones tiene las columnas de integridad referencial', () => {
  const db = createTestDb();
  const cols = db.prepare('PRAGMA table_info(transacciones)').all().map((c) => c.name);
  for (const col of ['id', 'cuenta_id', 'categoria_id', 'tipo', 'importe', 'fecha', 'descripcion']) {
    assert.ok(cols.includes(col), `Falta la columna transacciones.${col}`);
  }
});

test('esquema: presupuestos tiene las columnas de seguimiento de límite', () => {
  const db = createTestDb();
  const cols = db.prepare('PRAGMA table_info(presupuestos)').all().map((c) => c.name);
  for (const col of ['id', 'categoria_id', 'mes', 'limite', 'restante']) {
    assert.ok(cols.includes(col), `Falta la columna presupuestos.${col}`);
  }
});
