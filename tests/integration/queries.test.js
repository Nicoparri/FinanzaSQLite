'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createTestDb, insertCuenta, insertCategoria, insertTransaccion } = require('../setup');

// ── balance de cuentas (SUM CASE WHEN) ───────────────────────────────────────

const BALANCE_SQL = `
  SELECT
    c.id AS cuenta_id,
    c.nombre AS cuenta,
    COALESCE(SUM(CASE WHEN t.tipo = 'ingreso' THEN t.importe ELSE -t.importe END), 0) AS balance
  FROM cuentas c
  LEFT JOIN transacciones t ON t.cuenta_id = c.id
  WHERE c.id = ?
  GROUP BY c.id, c.nombre
`;

test('query balance: ingreso - gasto = balance correcto', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db, 'Principal', 'banco');
  const gastoId = insertCategoria(db, 'Alimentacion', 'gasto');
  const ingresoId = insertCategoria(db, 'Nomina', 'ingreso');

  insertTransaccion(db, cuentaId, ingresoId, 'ingreso', 2000, '2026-04-01');
  insertTransaccion(db, cuentaId, gastoId, 'gasto', 300, '2026-04-05');
  insertTransaccion(db, cuentaId, gastoId, 'gasto', 150, '2026-04-10');

  const row = db.prepare(BALANCE_SQL).get(cuentaId);
  assert.equal(row.balance, 2000 - 300 - 150, 'Balance debe ser 1550');
});

test('query balance: cuenta sin transacciones tiene balance 0', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db, 'Nueva', 'tarjeta');

  const row = db.prepare(BALANCE_SQL).get(cuentaId);
  assert.equal(row.balance, 0);
});

test('query balance: solo gastos produce balance negativo', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const catId = insertCategoria(db);

  insertTransaccion(db, cuentaId, catId, 'gasto', 100, '2026-04-01');
  insertTransaccion(db, cuentaId, catId, 'gasto', 200, '2026-04-02');

  const row = db.prepare(BALANCE_SQL).get(cuentaId);
  assert.equal(row.balance, -300);
});

test('query balance: varias cuentas con balances independientes', () => {
  const db = createTestDb();
  const c1 = insertCuenta(db, 'Banco A', 'banco');
  const c2 = insertCuenta(db, 'Efectivo', 'efectivo');
  const catId = insertCategoria(db, 'Nomina', 'ingreso');

  insertTransaccion(db, c1, catId, 'ingreso', 1000, '2026-04-01');
  insertTransaccion(db, c2, catId, 'ingreso', 500, '2026-04-01');

  const r1 = db.prepare(BALANCE_SQL).get(c1);
  const r2 = db.prepare(BALANCE_SQL).get(c2);

  assert.equal(r1.balance, 1000);
  assert.equal(r2.balance, 500);
});

// ── informe mensual (SUM GROUP BY) ───────────────────────────────────────────

const INFORME_SQL = `
  SELECT
    c.nombre AS categoria,
    strftime('%Y-%m', t.fecha) AS mes,
    SUM(t.importe) AS total,
    COUNT(t.id) AS num_transacciones
  FROM transacciones t
  JOIN categorias c ON c.id = t.categoria_id
  WHERE t.tipo = 'gasto'
    AND strftime('%Y-%m', t.fecha) = ?
  GROUP BY c.id, strftime('%Y-%m', t.fecha)
  ORDER BY total DESC
`;

test('query informe: SUM GROUP BY agrupa por categoria y mes', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const alimId = insertCategoria(db, 'Alimentacion', 'gasto');
  const transpId = insertCategoria(db, 'Transporte', 'gasto');

  insertTransaccion(db, cuentaId, alimId, 'gasto', 100, '2026-04-01');
  insertTransaccion(db, cuentaId, alimId, 'gasto', 50, '2026-04-15');
  insertTransaccion(db, cuentaId, transpId, 'gasto', 30, '2026-04-10');

  const rows = db.prepare(INFORME_SQL).all('2026-04');

  assert.equal(rows.length, 2);
  const alim = rows.find((r) => r.categoria === 'Alimentacion');
  assert.equal(alim.total, 150);
  assert.equal(alim.num_transacciones, 2);
  const transp = rows.find((r) => r.categoria === 'Transporte');
  assert.equal(transp.total, 30);
  assert.equal(transp.num_transacciones, 1);
});

test('query informe: los ingresos NO aparecen en el informe de gastos', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const catId = insertCategoria(db, 'Nomina', 'ingreso');

  insertTransaccion(db, cuentaId, catId, 'ingreso', 2000, '2026-04-01');

  const rows = db.prepare(INFORME_SQL).all('2026-04');
  assert.equal(rows.length, 0, 'Los ingresos no deben aparecer en el informe de gastos');
});

test('query informe: mes sin gastos devuelve resultado vacío', () => {
  const db = createTestDb();
  const rows = db.prepare(INFORME_SQL).all('2099-01');
  assert.equal(rows.length, 0);
});

test('query informe: ORDER BY total DESC pone mayor gasto primero', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const baratoId = insertCategoria(db, 'Barato', 'gasto');
  const caroId = insertCategoria(db, 'Caro', 'gasto');

  insertTransaccion(db, cuentaId, baratoId, 'gasto', 10, '2026-04-01');
  insertTransaccion(db, cuentaId, caroId, 'gasto', 500, '2026-04-02');

  const rows = db.prepare(INFORME_SQL).all('2026-04');
  assert.equal(rows[0].categoria, 'Caro', 'La categoría más cara debe aparecer primero');
});

// ── vista resumen_mensual ─────────────────────────────────────────────────────

test('vista resumen_mensual: ORDER BY mes DESC coloca el mes más reciente primero', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const catId = insertCategoria(db, 'Alimentacion', 'gasto');

  insertTransaccion(db, cuentaId, catId, 'gasto', 100, '2026-03-15');
  insertTransaccion(db, cuentaId, catId, 'gasto', 200, '2026-05-10');
  insertTransaccion(db, cuentaId, catId, 'gasto', 50, '2026-04-01');

  const rows = db.prepare('SELECT mes FROM resumen_mensual').all();
  const meses = rows.map((r) => r.mes);

  assert.equal(meses[0], '2026-05', 'Mayo debe aparecer primero');
  assert.ok(meses.indexOf('2026-05') < meses.indexOf('2026-04'), 'Mayo antes que Abril');
  assert.ok(meses.indexOf('2026-04') < meses.indexOf('2026-03'), 'Abril antes que Marzo');
});

test('vista resumen_mensual: ingresos no aparecen en la vista', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const catId = insertCategoria(db, 'Nomina', 'ingreso');

  insertTransaccion(db, cuentaId, catId, 'ingreso', 5000, '2026-04-01');

  const rows = db.prepare('SELECT * FROM resumen_mensual').all();
  assert.equal(rows.length, 0, 'Los ingresos no deben aparecer en la vista');
});

// ── listTransacciones (ORDER BY fecha DESC) ───────────────────────────────────

test('query listTransacciones: ORDER BY fecha DESC, id DESC respeta orden cronológico', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const catId = insertCategoria(db);

  insertTransaccion(db, cuentaId, catId, 'gasto', 10, '2026-04-01');
  insertTransaccion(db, cuentaId, catId, 'gasto', 20, '2026-04-03');
  insertTransaccion(db, cuentaId, catId, 'gasto', 30, '2026-04-02');

  const rows = db.prepare('SELECT fecha FROM transacciones ORDER BY fecha DESC, id DESC LIMIT 50').all();
  assert.equal(rows[0].fecha, '2026-04-03');
  assert.equal(rows[1].fecha, '2026-04-02');
  assert.equal(rows[2].fecha, '2026-04-01');
});

// ── getTotalTransacciones (COUNT) ─────────────────────────────────────────────

test('query COUNT: devuelve el número exacto de transacciones', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const catId = insertCategoria(db);

  for (let i = 0; i < 7; i++) {
    insertTransaccion(db, cuentaId, catId, 'gasto', 10 + i, `2026-04-${String(i + 1).padStart(2, '0')}`);
  }

  const row = db.prepare('SELECT COUNT(*) AS total FROM transacciones').get();
  assert.equal(row.total, 7);
});
