'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createTestDb, insertCuenta, insertCategoria, insertTransaccion, insertPresupuesto } = require('../setup');

// ── trigger: actualizar_presupuesto_tras_gasto ────────────────────────────────

test('trigger gasto: INSERT gasto reduce presupuesto.restante', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const catId = insertCategoria(db, 'Alimentacion', 'gasto');
  insertPresupuesto(db, catId, '2026-04', 500);

  insertTransaccion(db, cuentaId, catId, 'gasto', 100, '2026-04-15');

  const p = db.prepare('SELECT restante FROM presupuestos WHERE categoria_id = ?').get(catId);
  assert.equal(p.restante, 400, 'Restante debe ser 500 - 100 = 400');
});

test('trigger gasto: múltiples gastos acumulan la reducción', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const catId = insertCategoria(db, 'Transporte', 'gasto');
  insertPresupuesto(db, catId, '2026-04', 200);

  insertTransaccion(db, cuentaId, catId, 'gasto', 50, '2026-04-01');
  insertTransaccion(db, cuentaId, catId, 'gasto', 30, '2026-04-10');
  insertTransaccion(db, cuentaId, catId, 'gasto', 20, '2026-04-20');

  const p = db.prepare('SELECT restante FROM presupuestos WHERE categoria_id = ?').get(catId);
  assert.equal(p.restante, 100, 'Restante debe ser 200 - 50 - 30 - 20 = 100');
});

test('trigger gasto: INSERT ingreso NO modifica el presupuesto de gastos', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const catGastoId = insertCategoria(db, 'Alimentacion', 'gasto');
  const catIngresoId = insertCategoria(db, 'Nomina', 'ingreso');
  insertPresupuesto(db, catGastoId, '2026-04', 500);

  insertTransaccion(db, cuentaId, catIngresoId, 'ingreso', 2000, '2026-04-01');

  const p = db.prepare('SELECT restante FROM presupuestos WHERE categoria_id = ?').get(catGastoId);
  assert.equal(p.restante, 500, 'Un ingreso no debe afectar el presupuesto de gastos');
});

test('trigger gasto: gasto en mes diferente NO afecta presupuesto de otro mes', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const catId = insertCategoria(db, 'Alimentacion', 'gasto');
  insertPresupuesto(db, catId, '2026-04', 500);

  // Gasto en mayo, presupuesto de abril
  insertTransaccion(db, cuentaId, catId, 'gasto', 100, '2026-05-10');

  const p = db.prepare('SELECT restante FROM presupuestos WHERE categoria_id = ?').get(catId);
  assert.equal(p.restante, 500, 'Un gasto en mayo no debe reducir el presupuesto de abril');
});

test('trigger gasto: sin presupuesto configurado el INSERT no lanza error', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const catId = insertCategoria(db, 'Ocio', 'gasto');
  // No se crea presupuesto — el trigger debe ignorar el UPDATE sin filas

  assert.doesNotThrow(() => insertTransaccion(db, cuentaId, catId, 'gasto', 50, '2026-04-15'));
});

// ── trigger: revertir_presupuesto_tras_borrar_gasto ───────────────────────────

test('trigger borrar gasto: DELETE gasto restaura presupuesto.restante', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const catId = insertCategoria(db, 'Alimentacion', 'gasto');
  insertPresupuesto(db, catId, '2026-04', 500);

  const txnId = insertTransaccion(db, cuentaId, catId, 'gasto', 100, '2026-04-15');

  let p = db.prepare('SELECT restante FROM presupuestos WHERE categoria_id = ?').get(catId);
  assert.equal(p.restante, 400, 'Restante reducido antes del borrado');

  db.prepare('DELETE FROM transacciones WHERE id = ?').run(txnId);

  p = db.prepare('SELECT restante FROM presupuestos WHERE categoria_id = ?').get(catId);
  assert.equal(p.restante, 500, 'Restante restaurado tras borrar el gasto');
});

test('trigger borrar gasto: borrar ingreso NO modifica el presupuesto', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const catGastoId = insertCategoria(db, 'Alimentacion', 'gasto');
  const catIngresoId = insertCategoria(db, 'Nomina', 'ingreso');
  insertPresupuesto(db, catGastoId, '2026-04', 500);

  const txnId = insertTransaccion(db, cuentaId, catIngresoId, 'ingreso', 2000, '2026-04-01');
  db.prepare('DELETE FROM transacciones WHERE id = ?').run(txnId);

  const p = db.prepare('SELECT restante FROM presupuestos WHERE categoria_id = ?').get(catGastoId);
  assert.equal(p.restante, 500, 'Borrar un ingreso no debe modificar el presupuesto de gastos');
});

test('trigger borrar gasto: borrar parcialmente restaura el restante correcto', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const catId = insertCategoria(db, 'Transporte', 'gasto');
  insertPresupuesto(db, catId, '2026-04', 300);

  const id1 = insertTransaccion(db, cuentaId, catId, 'gasto', 50, '2026-04-01');
  const id2 = insertTransaccion(db, cuentaId, catId, 'gasto', 80, '2026-04-05');

  // Borrar solo el primer gasto
  db.prepare('DELETE FROM transacciones WHERE id = ?').run(id1);

  const p = db.prepare('SELECT restante FROM presupuestos WHERE categoria_id = ?').get(catId);
  // 300 - 50 - 80 + 50 = 220
  assert.equal(p.restante, 220, 'Solo se debe restaurar el importe del gasto borrado');

  // Verificar que el segundo gasto sigue en la tabla
  assert.ok(db.prepare('SELECT id FROM transacciones WHERE id = ?').get(id2), 'El segundo gasto debe persistir');
});
