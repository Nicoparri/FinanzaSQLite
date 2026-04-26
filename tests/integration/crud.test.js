'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createTestDb, insertCuenta, insertCategoria, insertTransaccion, insertPresupuesto } = require('../setup');

// ── cuentas ───────────────────────────────────────────────────────────────────

test('crud cuentas: crear y recuperar por id', () => {
  const db = createTestDb();
  const id = insertCuenta(db, 'Mi Banco', 'banco');
  const row = db.prepare('SELECT * FROM cuentas WHERE id = ?').get(id);

  assert.equal(row.nombre, 'Mi Banco');
  assert.equal(row.tipo, 'banco');
});

test('crud cuentas: listar todas ordenadas por nombre', () => {
  const db = createTestDb();
  insertCuenta(db, 'Zorro Bank', 'banco');
  insertCuenta(db, 'Alfa Cuenta', 'efectivo');
  insertCuenta(db, 'Mi Tarjeta', 'tarjeta');

  const rows = db.prepare('SELECT nombre FROM cuentas ORDER BY nombre ASC').all();
  assert.equal(rows[0].nombre, 'Alfa Cuenta');
  assert.equal(rows[rows.length - 1].nombre, 'Zorro Bank');
});

test('crud cuentas: eliminar cuenta sin transacciones', () => {
  const db = createTestDb();
  const id = insertCuenta(db);
  db.prepare('DELETE FROM cuentas WHERE id = ?').run(id);
  assert.equal(db.prepare('SELECT * FROM cuentas WHERE id = ?').get(id), undefined);
});

// ── categorias ────────────────────────────────────────────────────────────────

test('crud categorias: crear ingreso y gasto', () => {
  const db = createTestDb();
  const idG = insertCategoria(db, 'Alimentacion', 'gasto');
  const idI = insertCategoria(db, 'Nomina', 'ingreso');

  assert.equal(db.prepare('SELECT tipo FROM categorias WHERE id = ?').get(idG).tipo, 'gasto');
  assert.equal(db.prepare('SELECT tipo FROM categorias WHERE id = ?').get(idI).tipo, 'ingreso');
});

test('crud categorias: filtrar por tipo', () => {
  const db = createTestDb();
  insertCategoria(db, 'Alimentacion', 'gasto');
  insertCategoria(db, 'Transporte', 'gasto');
  insertCategoria(db, 'Nomina', 'ingreso');

  const gastos = db.prepare("SELECT * FROM categorias WHERE tipo = 'gasto'").all();
  const ingresos = db.prepare("SELECT * FROM categorias WHERE tipo = 'ingreso'").all();

  assert.equal(gastos.length, 2);
  assert.equal(ingresos.length, 1);
});

test('crud categorias: eliminar categoria sin dependencias', () => {
  const db = createTestDb();
  const id = insertCategoria(db, 'Temporal', 'gasto');
  db.prepare('DELETE FROM categorias WHERE id = ?').run(id);
  assert.equal(db.prepare('SELECT * FROM categorias WHERE id = ?').get(id), undefined);
});

// ── transacciones ─────────────────────────────────────────────────────────────

test('crud transacciones: crear gasto con descripcion', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const catId = insertCategoria(db, 'Comida', 'gasto');
  const id = insertTransaccion(db, cuentaId, catId, 'gasto', 50.75, '2026-04-10', 'Supermercado');

  const row = db.prepare('SELECT * FROM transacciones WHERE id = ?').get(id);
  assert.equal(row.importe, 50.75);
  assert.equal(row.descripcion, 'Supermercado');
  assert.equal(row.tipo, 'gasto');
  assert.equal(row.fecha, '2026-04-10');
});

test('crud transacciones: crear ingreso sin descripcion', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const catId = insertCategoria(db, 'Nomina', 'ingreso');
  const id = insertTransaccion(db, cuentaId, catId, 'ingreso', 2000, '2026-04-01');

  const row = db.prepare('SELECT * FROM transacciones WHERE id = ?').get(id);
  assert.equal(row.importe, 2000);
  assert.equal(row.descripcion, null);
});

test('crud transacciones: listar con JOIN cuenta y categoria', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db, 'Cuenta Principal', 'banco');
  const catId = insertCategoria(db, 'Transporte', 'gasto');
  insertTransaccion(db, cuentaId, catId, 'gasto', 25, '2026-04-10');

  const row = db.prepare(`
    SELECT t.*, c.nombre AS cuenta_nombre, g.nombre AS categoria_nombre
    FROM transacciones t
    JOIN cuentas c ON c.id = t.cuenta_id
    JOIN categorias g ON g.id = t.categoria_id
    LIMIT 1
  `).get();

  assert.equal(row.cuenta_nombre, 'Cuenta Principal');
  assert.equal(row.categoria_nombre, 'Transporte');
});

test('crud transacciones: actualizar importe', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const catId = insertCategoria(db);
  const id = insertTransaccion(db, cuentaId, catId, 'gasto', 100, '2026-04-01');

  db.prepare('UPDATE transacciones SET importe = ? WHERE id = ?').run(200, id);
  assert.equal(db.prepare('SELECT importe FROM transacciones WHERE id = ?').get(id).importe, 200);
});

test('crud transacciones: eliminar transaccion', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const catId = insertCategoria(db);
  const id = insertTransaccion(db, cuentaId, catId, 'gasto', 50, '2026-04-01');

  db.prepare('DELETE FROM transacciones WHERE id = ?').run(id);
  assert.equal(db.prepare('SELECT * FROM transacciones WHERE id = ?').get(id), undefined);
});

test('crud transacciones: listar con LIMIT devuelve max N registros', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const catId = insertCategoria(db);

  for (let i = 0; i < 10; i++) {
    insertTransaccion(db, cuentaId, catId, 'gasto', 10 + i, `2026-04-${String(i + 1).padStart(2, '0')}`);
  }

  const rows = db.prepare('SELECT * FROM transacciones ORDER BY fecha DESC, id DESC LIMIT 5').all();
  assert.equal(rows.length, 5);
});

// ── presupuestos ──────────────────────────────────────────────────────────────

test('crud presupuestos: crear con limite = restante inicial', () => {
  const db = createTestDb();
  const catId = insertCategoria(db, 'Ocio', 'gasto');
  insertPresupuesto(db, catId, '2026-04', 300);

  const row = db.prepare('SELECT limite, restante FROM presupuestos WHERE categoria_id = ?').get(catId);
  assert.equal(row.limite, 300);
  assert.equal(row.restante, 300);
});

test('crud presupuestos: JOIN con categorias devuelve nombre', () => {
  const db = createTestDb();
  const catId = insertCategoria(db, 'Ropa', 'gasto');
  insertPresupuesto(db, catId, '2026-04', 150);

  const row = db.prepare(`
    SELECT p.*, c.nombre AS categoria_nombre
    FROM presupuestos p
    JOIN categorias c ON c.id = p.categoria_id
    WHERE p.categoria_id = ?
  `).get(catId);

  assert.equal(row.categoria_nombre, 'Ropa');
  assert.equal(row.mes, '2026-04');
});

test('crud presupuestos: upsert ON CONFLICT actualiza limite y restaura restante', () => {
  const db = createTestDb();
  const catId = insertCategoria(db);
  insertPresupuesto(db, catId, '2026-04', 300);

  db.prepare(`
    INSERT INTO presupuestos (categoria_id, mes, limite, restante)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(categoria_id) DO UPDATE SET
      mes      = excluded.mes,
      limite   = excluded.limite,
      restante = excluded.limite
  `).run(catId, '2026-05', 500, 500);

  const row = db.prepare('SELECT limite, restante, mes FROM presupuestos WHERE categoria_id = ?').get(catId);
  assert.equal(row.limite, 500);
  assert.equal(row.restante, 500);
  assert.equal(row.mes, '2026-05');
});

// ── app_settings ──────────────────────────────────────────────────────────────

test('crud app_settings: ON CONFLICT DO UPDATE cambia el valor', () => {
  const db = createTestDb();
  db.prepare("INSERT INTO app_settings (key, value) VALUES ('moneda', 'EUR')").run();
  db.prepare(`
    INSERT INTO app_settings (key, value) VALUES ('moneda', 'USD')
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run();

  const row = db.prepare("SELECT value FROM app_settings WHERE key = 'moneda'").get();
  assert.equal(row.value, 'USD');
});

test('crud app_settings: recuperar múltiples settings como mapa', () => {
  const db = createTestDb();
  const pairs = [
    ['moneda', 'EUR'],
    ['inicioSemana', 'lunes'],
    ['notificaciones', '1'],
  ];
  const stmt = db.prepare('INSERT INTO app_settings (key, value) VALUES (?, ?)');
  for (const [k, v] of pairs) stmt.run(k, v);

  const rows = db.prepare('SELECT key, value FROM app_settings').all();
  const map = new Map(rows.map((r) => [r.key, r.value]));

  assert.equal(map.get('moneda'), 'EUR');
  assert.equal(map.get('inicioSemana'), 'lunes');
  assert.equal(map.get('notificaciones'), '1');
});
