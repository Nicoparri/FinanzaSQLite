'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createTestDb, insertCuenta, insertCategoria, insertTransaccion } = require('../setup');

// ── ACID: atomicidad ──────────────────────────────────────────────────────────

test('ACID rollback: error en transacción revierte todos los cambios', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const catId = insertCategoria(db);

  const atomicInsert = db.transaction(() => {
    insertTransaccion(db, cuentaId, catId, 'gasto', 100, '2026-04-01', 'Pago 1');
    insertTransaccion(db, cuentaId, catId, 'gasto', 200, '2026-04-02', 'Pago 2');
    throw new Error('Error simulado — debe hacer rollback');
  });

  assert.throws(() => atomicInsert(), { message: 'Error simulado — debe hacer rollback' });

  const count = db.prepare('SELECT COUNT(*) AS n FROM transacciones').get().n;
  assert.equal(count, 0, 'El rollback debe dejar la tabla vacía');
});

test('ACID commit: transacción exitosa persiste todos los cambios', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const catId = insertCategoria(db);

  const atomicInsert = db.transaction(() => {
    insertTransaccion(db, cuentaId, catId, 'gasto', 100, '2026-04-01');
    insertTransaccion(db, cuentaId, catId, 'gasto', 200, '2026-04-02');
    insertTransaccion(db, cuentaId, catId, 'ingreso', 500, '2026-04-03');
  });

  atomicInsert();

  const count = db.prepare('SELECT COUNT(*) AS n FROM transacciones').get().n;
  assert.equal(count, 3, 'Las 3 transacciones deben haberse persistido');
});

test('ACID aislamiento: transacciones anidadas en better-sqlite3 usan SAVEPOINT', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const catId = insertCategoria(db);

  const outer = db.transaction(() => {
    insertTransaccion(db, cuentaId, catId, 'gasto', 10, '2026-04-01');
    // Transacción interna que falla — solo ella revierte via SAVEPOINT
    const inner = db.transaction(() => {
      insertTransaccion(db, cuentaId, catId, 'gasto', 20, '2026-04-02');
      throw new Error('Inner rollback');
    });
    try { inner(); } catch (_) { /* esperado */ }
    insertTransaccion(db, cuentaId, catId, 'gasto', 30, '2026-04-03');
  });

  outer();

  const count = db.prepare('SELECT COUNT(*) AS n FROM transacciones').get().n;
  assert.equal(count, 2, 'Solo los INSERTs de la transacción externa deben persistir');
});

// ── FK RESTRICT ───────────────────────────────────────────────────────────────

test('FK RESTRICT: DELETE cuenta con transacciones falla', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const catId = insertCategoria(db);
  insertTransaccion(db, cuentaId, catId, 'gasto', 50, '2026-04-01');

  assert.throws(
    () => db.prepare('DELETE FROM cuentas WHERE id = ?').run(cuentaId),
    /FOREIGN KEY constraint failed/,
    'RESTRICT debe impedir borrar la cuenta'
  );

  const cuenta = db.prepare('SELECT * FROM cuentas WHERE id = ?').get(cuentaId);
  assert.ok(cuenta, 'La cuenta debe seguir existiendo tras el intento fallido');
});

test('FK RESTRICT: DELETE cuenta sin transacciones tiene éxito', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);

  assert.doesNotThrow(() => db.prepare('DELETE FROM cuentas WHERE id = ?').run(cuentaId));
  assert.equal(db.prepare('SELECT * FROM cuentas WHERE id = ?').get(cuentaId), undefined);
});

test('FK RESTRICT: la transacción permanece si el DELETE falla', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const catId = insertCategoria(db);
  const txnId = insertTransaccion(db, cuentaId, catId, 'gasto', 50, '2026-04-01');

  try { db.prepare('DELETE FROM cuentas WHERE id = ?').run(cuentaId); } catch (_) { /* esperado */ }

  const txn = db.prepare('SELECT * FROM transacciones WHERE id = ?').get(txnId);
  assert.ok(txn, 'La transacción debe seguir existiendo');
});

// ── FK CASCADE ────────────────────────────────────────────────────────────────

test('FK CASCADE: DELETE categoria elimina sus transacciones', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const catId = insertCategoria(db, 'Temporal', 'gasto');
  insertTransaccion(db, cuentaId, catId, 'gasto', 100, '2026-04-01');
  insertTransaccion(db, cuentaId, catId, 'gasto', 200, '2026-04-02');

  db.prepare('DELETE FROM categorias WHERE id = ?').run(catId);

  const count = db.prepare('SELECT COUNT(*) AS n FROM transacciones WHERE categoria_id = ?').get(catId).n;
  assert.equal(count, 0, 'CASCADE debe eliminar las transacciones huérfanas');
});

test('FK CASCADE: DELETE categoria elimina su presupuesto', () => {
  const db = createTestDb();
  const catId = insertCategoria(db, 'Ocio', 'gasto');
  db.prepare('INSERT INTO presupuestos (categoria_id, mes, limite, restante) VALUES (?, ?, ?, ?)').run(
    catId, '2026-04', 300, 300
  );

  db.prepare('DELETE FROM categorias WHERE id = ?').run(catId);

  const p = db.prepare('SELECT * FROM presupuestos WHERE categoria_id = ?').get(catId);
  assert.equal(p, undefined, 'CASCADE debe eliminar el presupuesto al borrar la categoría');
});

test('FK CASCADE: DELETE categoria no afecta transacciones de otras categorias', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const catBorradaId = insertCategoria(db, 'Borrada', 'gasto');
  const catOtraId = insertCategoria(db, 'Otra', 'gasto');

  insertTransaccion(db, cuentaId, catBorradaId, 'gasto', 100, '2026-04-01');
  insertTransaccion(db, cuentaId, catOtraId, 'gasto', 200, '2026-04-02');

  db.prepare('DELETE FROM categorias WHERE id = ?').run(catBorradaId);

  const count = db.prepare('SELECT COUNT(*) AS n FROM transacciones WHERE categoria_id = ?').get(catOtraId).n;
  assert.equal(count, 1, 'Las transacciones de otras categorías deben permanecer intactas');
});

// ── integridad referencial ────────────────────────────────────────────────────

test('FK: transaccion con cuenta_id inexistente falla', () => {
  const db = createTestDb();
  const catId = insertCategoria(db);

  assert.throws(
    () =>
      db
        .prepare(
          'INSERT INTO transacciones (cuenta_id, categoria_id, tipo, importe, fecha) VALUES (?, ?, ?, ?, ?)'
        )
        .run(9999, catId, 'gasto', 50, '2026-04-01'),
    /FOREIGN KEY constraint failed/
  );
});

test('FK: transaccion con categoria_id inexistente falla', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);

  assert.throws(
    () =>
      db
        .prepare(
          'INSERT INTO transacciones (cuenta_id, categoria_id, tipo, importe, fecha) VALUES (?, ?, ?, ?, ?)'
        )
        .run(cuentaId, 9999, 'gasto', 50, '2026-04-01'),
    /FOREIGN KEY constraint failed/
  );
});
