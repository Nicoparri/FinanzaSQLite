'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createTestDb, insertCuenta, insertCategoria } = require('../setup');

// ── cuentas ──────────────────────────────────────────────────────────────────

test('constraint cuentas: tipo acepta efectivo, banco y tarjeta', () => {
  const db = createTestDb();
  for (const tipo of ['efectivo', 'banco', 'tarjeta']) {
    assert.doesNotThrow(() => insertCuenta(db, `Mi ${tipo}`, tipo), `Debería aceptar tipo: ${tipo}`);
  }
});

test('constraint cuentas: tipo CHECK rechaza valores fuera del enum', () => {
  const db = createTestDb();
  assert.throws(
    () => db.prepare("INSERT INTO cuentas (nombre, tipo) VALUES ('X', 'credito')").run(),
    /CHECK constraint failed/,
    'Tipo inválido debería lanzar error CHECK'
  );
});

test('constraint cuentas: nombre NOT NULL rechaza inserción sin nombre', () => {
  const db = createTestDb();
  assert.throws(
    () => db.prepare("INSERT INTO cuentas (nombre, tipo) VALUES (NULL, 'banco')").run(),
    /NOT NULL constraint failed/
  );
});

// ── categorias ────────────────────────────────────────────────────────────────

test('constraint categorias: tipo acepta ingreso y gasto', () => {
  const db = createTestDb();
  assert.doesNotThrow(() => insertCategoria(db, 'Nomina', 'ingreso'));
  assert.doesNotThrow(() => insertCategoria(db, 'Comida', 'gasto'));
});

test('constraint categorias: tipo CHECK rechaza valores fuera del enum', () => {
  const db = createTestDb();
  assert.throws(
    () => db.prepare("INSERT INTO categorias (nombre, tipo) VALUES ('X', 'mixto')").run(),
    /CHECK constraint failed/
  );
});

test('constraint categorias: nombre UNIQUE rechaza nombres duplicados', () => {
  const db = createTestDb();
  insertCategoria(db, 'Alimentacion', 'gasto');
  assert.throws(
    () => insertCategoria(db, 'Alimentacion', 'gasto'),
    /UNIQUE constraint failed/,
    'El nombre duplicado debe lanzar error UNIQUE'
  );
});

// ── transacciones ─────────────────────────────────────────────────────────────

test('constraint transacciones: importe CHECK rechaza cero y negativos', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const catId = insertCategoria(db);

  for (const importe of [0, -1, -0.01, -999]) {
    assert.throws(
      () =>
        db
          .prepare(
            'INSERT INTO transacciones (cuenta_id, categoria_id, tipo, importe, fecha) VALUES (?, ?, ?, ?, ?)'
          )
          .run(cuentaId, catId, 'gasto', importe, '2026-04-15'),
      /CHECK constraint failed/,
      `importe ${importe} debería fallar`
    );
  }
});

test('constraint transacciones: importe CHECK acepta valores positivos', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const catId = insertCategoria(db);

  for (const importe of [0.01, 1, 100, 9999.99]) {
    assert.doesNotThrow(
      () =>
        db
          .prepare(
            'INSERT INTO transacciones (cuenta_id, categoria_id, tipo, importe, fecha) VALUES (?, ?, ?, ?, ?)'
          )
          .run(cuentaId, catId, 'gasto', importe, '2026-04-15'),
      `importe ${importe} debería ser válido`
    );
  }
});

test('constraint transacciones: tipo CHECK rechaza valores fuera del enum', () => {
  const db = createTestDb();
  const cuentaId = insertCuenta(db);
  const catId = insertCategoria(db);

  assert.throws(
    () =>
      db
        .prepare(
          'INSERT INTO transacciones (cuenta_id, categoria_id, tipo, importe, fecha) VALUES (?, ?, ?, ?, ?)'
        )
        .run(cuentaId, catId, 'transferencia', 50, '2026-04-15'),
    /CHECK constraint failed/
  );
});

// ── presupuestos ──────────────────────────────────────────────────────────────

test('constraint presupuestos: limite CHECK rechaza cero y negativos', () => {
  const db = createTestDb();
  const catId = insertCategoria(db);

  for (const limite of [0, -1, -100]) {
    assert.throws(
      () =>
        db
          .prepare('INSERT INTO presupuestos (categoria_id, mes, limite, restante) VALUES (?, ?, ?, ?)')
          .run(catId, '2026-04', limite, limite),
      /CHECK constraint failed/,
      `limite ${limite} debería fallar`
    );
  }
});

test('constraint presupuestos: categoria_id UNIQUE impide dos presupuestos por categoria', () => {
  const db = createTestDb();
  const catId = insertCategoria(db);

  db.prepare('INSERT INTO presupuestos (categoria_id, mes, limite, restante) VALUES (?, ?, ?, ?)').run(
    catId,
    '2026-04',
    500,
    500
  );

  assert.throws(
    () =>
      db
        .prepare('INSERT INTO presupuestos (categoria_id, mes, limite, restante) VALUES (?, ?, ?, ?)')
        .run(catId, '2026-05', 300, 300),
    /UNIQUE constraint failed/,
    'Una segunda inserción con la misma categoría debe fallar'
  );
});

// ── app_settings ──────────────────────────────────────────────────────────────

test('constraint app_settings: key PRIMARY KEY rechaza duplicados', () => {
  const db = createTestDb();
  db.prepare("INSERT INTO app_settings (key, value) VALUES ('moneda', 'EUR')").run();
  assert.throws(
    () => db.prepare("INSERT INTO app_settings (key, value) VALUES ('moneda', 'USD')").run(),
    /UNIQUE constraint failed/
  );
});

test('constraint app_settings: INSERT OR IGNORE no sobreescribe valor existente', () => {
  const db = createTestDb();
  db.prepare("INSERT INTO app_settings (key, value) VALUES ('moneda', 'EUR')").run();
  db.prepare("INSERT OR IGNORE INTO app_settings (key, value) VALUES ('moneda', 'USD')").run();

  const row = db.prepare("SELECT value FROM app_settings WHERE key = 'moneda'").get();
  assert.equal(row.value, 'EUR', 'INSERT OR IGNORE no debe sobreescribir el valor existente');
});
