'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createTestDb, insertCuenta, insertCategoria, insertPresupuesto } = require('../setup');

const INSERT_TXN_SQL =
  'INSERT INTO transacciones (cuenta_id, categoria_id, tipo, importe, fecha, descripcion) VALUES (?, ?, ?, ?, ?, ?)';

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(month) {
  return `${month}-${String(randomInt(1, 28)).padStart(2, '0')}`;
}

/**
 * Inserta N transacciones en una sola transacción ACID.
 * Devuelve el tiempo transcurrido en milisegundos.
 */
function bulkInsert(db, cuentaId, categoriaGastoId, categoriaIngresoId, count, month = '2026-04') {
  const stmt = db.prepare(INSERT_TXN_SQL);
  const run = db.transaction((n) => {
    for (let i = 0; i < n; i++) {
      const isGasto = Math.random() < 0.8;
      stmt.run(
        cuentaId,
        isGasto ? categoriaGastoId : categoriaIngresoId,
        isGasto ? 'gasto' : 'ingreso',
        randomInt(3, 180),
        randomDate(month),
        `Seed ${i + 1}`
      );
    }
  });

  const start = performance.now();
  run(count);
  return performance.now() - start;
}

// ── Benchmarks de inserción ───────────────────────────────────────────────────

test('carga 500 filas: inserción ACID completa en < 5 s', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const gastoId = insertCategoria(db, 'Gasto', 'gasto');
  const ingresoId = insertCategoria(db, 'Ingreso', 'ingreso');

  const ms = bulkInsert(db, cuentaId, gastoId, ingresoId, 500);
  const count = db.prepare('SELECT COUNT(*) AS n FROM transacciones').get().n;

  console.log(`  [Carga  500 filas]  ${ms.toFixed(2)} ms`);
  assert.equal(count, 500, 'Deben haberse insertado exactamente 500 filas');
  assert.ok(ms < 5_000, `Tiempo ${ms.toFixed(2)} ms excede el límite de 5 000 ms`);
});

test('carga 1 000 filas: inserción ACID completa en < 10 s', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const gastoId = insertCategoria(db, 'Gasto', 'gasto');
  const ingresoId = insertCategoria(db, 'Ingreso', 'ingreso');

  const ms = bulkInsert(db, cuentaId, gastoId, ingresoId, 1_000);
  const count = db.prepare('SELECT COUNT(*) AS n FROM transacciones').get().n;

  console.log(`  [Carga 1 000 filas] ${ms.toFixed(2)} ms`);
  assert.equal(count, 1_000);
  assert.ok(ms < 10_000, `Tiempo ${ms.toFixed(2)} ms excede el límite de 10 000 ms`);
});

test('carga 5 000 filas con trigger activo: inserción en < 30 s', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const gastoId = insertCategoria(db, 'Gasto', 'gasto');
  const ingresoId = insertCategoria(db, 'Ingreso', 'ingreso');
  // Presupuesto activo para que el trigger se dispare en cada INSERT gasto
  insertPresupuesto(db, gastoId, '2026-04', 9_999_999);

  const ms = bulkInsert(db, cuentaId, gastoId, ingresoId, 5_000);
  const count = db.prepare('SELECT COUNT(*) AS n FROM transacciones').get().n;

  console.log(`  [Carga 5 000 filas + trigger] ${ms.toFixed(2)} ms`);
  assert.equal(count, 5_000);
  assert.ok(ms < 30_000, `Tiempo ${ms.toFixed(2)} ms excede el límite de 30 000 ms`);
});

// ── Benchmarks de consulta sobre datos masivos ────────────────────────────────

test('query SUM/GROUP BY sobre 1 000 filas termina en < 500 ms', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const gastoId = insertCategoria(db, 'Gasto', 'gasto');
  const ingresoId = insertCategoria(db, 'Ingreso', 'ingreso');
  bulkInsert(db, cuentaId, gastoId, ingresoId, 1_000);

  const start = performance.now();
  const rows = db
    .prepare(
      `SELECT strftime('%Y-%m', fecha) AS mes, SUM(importe) AS total, COUNT(*) AS n
       FROM transacciones WHERE tipo = 'gasto'
       GROUP BY mes ORDER BY mes DESC`
    )
    .all();
  const ms = performance.now() - start;

  console.log(`  [SUM/GROUP BY sobre 1 000 filas] ${ms.toFixed(2)} ms — ${rows.length} mes(es)`);
  assert.ok(rows.length > 0, 'La consulta debe devolver al menos un mes');
  assert.ok(ms < 500, `La consulta tomó ${ms.toFixed(2)} ms (límite: 500 ms)`);
});

test('query balance LEFT JOIN sobre 1 000 filas termina en < 500 ms', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const gastoId = insertCategoria(db, 'Gasto', 'gasto');
  const ingresoId = insertCategoria(db, 'Ingreso', 'ingreso');
  bulkInsert(db, cuentaId, gastoId, ingresoId, 1_000);

  const start = performance.now();
  const row = db
    .prepare(
      `SELECT COALESCE(SUM(CASE WHEN t.tipo = 'ingreso' THEN t.importe ELSE -t.importe END), 0) AS balance
       FROM cuentas c LEFT JOIN transacciones t ON t.cuenta_id = c.id
       WHERE c.id = ? GROUP BY c.id`
    )
    .get(cuentaId);
  const ms = performance.now() - start;

  console.log(`  [Balance LEFT JOIN sobre 1 000 filas] ${ms.toFixed(2)} ms — balance: ${row.balance}`);
  assert.ok(ms < 500, `La consulta tomó ${ms.toFixed(2)} ms (límite: 500 ms)`);
});

// ── Verificación de integridad post-carga ─────────────────────────────────────

test('integridad: sin referencias huérfanas tras inserción masiva de 2 000 filas', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const gastoId = insertCategoria(db, 'Gasto', 'gasto');
  const ingresoId = insertCategoria(db, 'Ingreso', 'ingreso');
  bulkInsert(db, cuentaId, gastoId, ingresoId, 2_000);

  const huerfanos = db
    .prepare(
      `SELECT COUNT(*) AS n FROM transacciones
       WHERE cuenta_id    NOT IN (SELECT id FROM cuentas)
          OR categoria_id NOT IN (SELECT id FROM categorias)`
    )
    .get().n;

  assert.equal(huerfanos, 0, 'No debe haber transacciones con referencias inválidas');
});

test('integridad: todos los importes son positivos tras inserción masiva de 2 000 filas', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const gastoId = insertCategoria(db, 'Gasto', 'gasto');
  const ingresoId = insertCategoria(db, 'Ingreso', 'ingreso');
  bulkInsert(db, cuentaId, gastoId, ingresoId, 2_000);

  const invalidos = db
    .prepare('SELECT COUNT(*) AS n FROM transacciones WHERE importe <= 0')
    .get().n;

  assert.equal(invalidos, 0, 'Todos los importes deben ser positivos');
});

test('throughput: registrar filas por segundo como métrica de referencia', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const gastoId = insertCategoria(db, 'Gasto', 'gasto');
  const ingresoId = insertCategoria(db, 'Ingreso', 'ingreso');

  const N = 1_000;
  const ms = bulkInsert(db, cuentaId, gastoId, ingresoId, N);
  const fps = Math.round((N / ms) * 1_000);

  console.log(`  [Throughput] ${fps} filas/s (${N} filas en ${ms.toFixed(2)} ms)`);
  // Sin límite rígido — sirve como referencia de rendimiento en el paper
  assert.ok(fps > 0, 'El throughput debe ser mayor que 0');
});
