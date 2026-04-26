import { currentMonthString, getDatabase, withWriteTransaction } from './database';
import {
  AppSettings,
  BalanceCuenta,
  Categoria,
  Cuenta,
  InformeMensualFila,
  InicioSemana,
  MonedaPreferida,
  Presupuesto,
  TipoCuenta,
  TipoMovimiento,
  TransaccionConNombres,
} from './types';

const DEFAULT_APP_SETTINGS: AppSettings = {
  moneda: 'EUR',
  inicioSemana: 'lunes',
  notificaciones: true,
  faceId: true,
  bloqueoAuto: true,
};

function normalizeMoneda(value: string | undefined): MonedaPreferida {
  if (value === 'USD' || value === 'GBP' || value === 'EUR') {
    return value;
  }
  return DEFAULT_APP_SETTINGS.moneda;
}

function normalizeInicioSemana(value: string | undefined): InicioSemana {
  return value === 'domingo' ? 'domingo' : 'lunes';
}

function parseBooleanSetting(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }

  return value === '1';
}

export async function ensureBaseData(): Promise<void> {
  const db = await getDatabase();

  const cuentasCount = await db.getFirstAsync<{ total: number }>('SELECT COUNT(*) as total FROM cuentas;');
  if ((cuentasCount?.total ?? 0) === 0) {
    await withWriteTransaction(async (txn) => {
      await txn.runAsync("INSERT INTO cuentas (nombre, tipo) VALUES ('Cuenta Banco', 'banco');");
      await txn.runAsync("INSERT INTO cuentas (nombre, tipo) VALUES ('Efectivo', 'efectivo');");
    });
  }

  const categoriasCount = await db.getFirstAsync<{ total: number }>('SELECT COUNT(*) as total FROM categorias;');
  if ((categoriasCount?.total ?? 0) === 0) {
    await withWriteTransaction(async (txn) => {
      await txn.runAsync("INSERT INTO categorias (nombre, tipo) VALUES ('Nomina', 'ingreso');");
      await txn.runAsync("INSERT INTO categorias (nombre, tipo) VALUES ('Alimentacion', 'gasto');");
      await txn.runAsync("INSERT INTO categorias (nombre, tipo) VALUES ('Transporte', 'gasto');");
    });
  }

  await withWriteTransaction(async (txn) => {
    await txn.runAsync(
      `
      INSERT OR IGNORE INTO app_settings (key, value)
      VALUES
        ('moneda', ?),
        ('inicioSemana', ?),
        ('notificaciones', ?),
        ('faceId', ?),
        ('bloqueoAuto', ?);
      `,
      [
        DEFAULT_APP_SETTINGS.moneda,
        DEFAULT_APP_SETTINGS.inicioSemana,
        DEFAULT_APP_SETTINGS.notificaciones ? '1' : '0',
        DEFAULT_APP_SETTINGS.faceId ? '1' : '0',
        DEFAULT_APP_SETTINGS.bloqueoAuto ? '1' : '0',
      ]
    );
  });
}

export async function getAppSettings(): Promise<AppSettings> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM app_settings;');
  const settings = new Map<string, string>(rows.map((row) => [row.key, row.value]));

  return {
    moneda: normalizeMoneda(settings.get('moneda')),
    inicioSemana: normalizeInicioSemana(settings.get('inicioSemana')),
    notificaciones: parseBooleanSetting(settings.get('notificaciones'), DEFAULT_APP_SETTINGS.notificaciones),
    faceId: parseBooleanSetting(settings.get('faceId'), DEFAULT_APP_SETTINGS.faceId),
    bloqueoAuto: parseBooleanSetting(settings.get('bloqueoAuto'), DEFAULT_APP_SETTINGS.bloqueoAuto),
  };
}

export async function saveAppSettings(next: Partial<AppSettings>): Promise<void> {
  const entries: Array<[string, string]> = [];

  if (next.moneda !== undefined) {
    entries.push(['moneda', normalizeMoneda(next.moneda)]);
  }

  if (next.inicioSemana !== undefined) {
    entries.push(['inicioSemana', normalizeInicioSemana(next.inicioSemana)]);
  }

  if (next.notificaciones !== undefined) {
    entries.push(['notificaciones', next.notificaciones ? '1' : '0']);
  }

  if (next.faceId !== undefined) {
    entries.push(['faceId', next.faceId ? '1' : '0']);
  }

  if (next.bloqueoAuto !== undefined) {
    entries.push(['bloqueoAuto', next.bloqueoAuto ? '1' : '0']);
  }

  if (entries.length === 0) {
    return;
  }

  await withWriteTransaction(async (txn) => {
    for (const [key, value] of entries) {
      await txn.runAsync(
        `
        INSERT INTO app_settings (key, value)
        VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value;
        `,
        [key, value]
      );
    }
  });
}

export async function createCuenta(nombre: string, tipo: TipoCuenta): Promise<void> {
  await withWriteTransaction(async (txn) => {
    await txn.runAsync('INSERT INTO cuentas (nombre, tipo) VALUES (?, ?);', [nombre, tipo]);
  });
}

export async function listCuentasConBalance(): Promise<BalanceCuenta[]> {
  const db = await getDatabase();
  return db.getAllAsync<BalanceCuenta>(`
    SELECT
      c.id AS cuenta_id,
      c.nombre AS cuenta,
      COALESCE(SUM(CASE WHEN t.tipo = 'ingreso' THEN t.importe ELSE -t.importe END), 0) AS balance
    FROM cuentas c
    LEFT JOIN transacciones t ON t.cuenta_id = c.id
    GROUP BY c.id, c.nombre
    ORDER BY c.nombre ASC;
  `);
}

export async function listCuentas(): Promise<Cuenta[]> {
  const db = await getDatabase();
  return db.getAllAsync<Cuenta>('SELECT id, nombre, tipo FROM cuentas ORDER BY nombre ASC;');
}

export async function deleteCuenta(cuentaId: number): Promise<void> {
  await withWriteTransaction(async (txn) => {
    await txn.runAsync('DELETE FROM cuentas WHERE id = ?;', [cuentaId]);
  });
}

export async function createCategoria(nombre: string, tipo: TipoMovimiento): Promise<void> {
  await withWriteTransaction(async (txn) => {
    await txn.runAsync('INSERT INTO categorias (nombre, tipo) VALUES (?, ?);', [nombre, tipo]);
  });
}

export async function listCategorias(tipo?: TipoMovimiento): Promise<Categoria[]> {
  const db = await getDatabase();
  if (!tipo) {
    return db.getAllAsync<Categoria>('SELECT id, nombre, tipo FROM categorias ORDER BY nombre ASC;');
  }

  return db.getAllAsync<Categoria>('SELECT id, nombre, tipo FROM categorias WHERE tipo = ? ORDER BY nombre ASC;', [tipo]);
}

export async function deleteCategoria(categoriaId: number): Promise<void> {
  await withWriteTransaction(async (txn) => {
    await txn.runAsync('DELETE FROM categorias WHERE id = ?;', [categoriaId]);
  });
}

export async function createPresupuesto(categoriaId: number, mes: string, limite: number): Promise<void> {
  await withWriteTransaction(async (txn) => {
    await txn.runAsync(
      `
      INSERT INTO presupuestos (categoria_id, mes, limite, restante)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(categoria_id) DO UPDATE SET
        mes = excluded.mes,
        limite = excluded.limite,
        restante = excluded.limite;
      `,
      [categoriaId, mes, limite, limite]
    );
  });
}

export async function listPresupuestos(): Promise<Presupuesto[]> {
  const db = await getDatabase();
  return db.getAllAsync<Presupuesto>(`
    SELECT
      p.id,
      p.categoria_id,
      c.nombre AS categoria_nombre,
      p.mes,
      p.limite,
      p.restante
    FROM presupuestos p
    JOIN categorias c ON c.id = p.categoria_id
    ORDER BY p.mes DESC, c.nombre ASC;
  `);
}

export async function createTransaccion(input: {
  cuentaId: number;
  categoriaId: number;
  tipo: TipoMovimiento;
  importe: number;
  fecha: string;
  descripcion?: string;
}): Promise<void> {
  const db = await getDatabase();

  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync(
      `
      INSERT INTO transacciones (
        cuenta_id,
        categoria_id,
        tipo,
        importe,
        fecha,
        descripcion
      ) VALUES (?, ?, ?, ?, ?, ?);
      `,
      [
        input.cuentaId,
        input.categoriaId,
        input.tipo,
        input.importe,
        input.fecha,
        input.descripcion ?? null,
      ]
    );
  });
}

export async function updateTransaccion(input: {
  id: number;
  cuentaId: number;
  categoriaId: number;
  tipo: TipoMovimiento;
  importe: number;
  fecha: string;
  descripcion?: string;
}): Promise<void> {
  await withWriteTransaction(async (txn) => {
    await txn.runAsync(
      `
      UPDATE transacciones
      SET
        cuenta_id = ?,
        categoria_id = ?,
        tipo = ?,
        importe = ?,
        fecha = ?,
        descripcion = ?
      WHERE id = ?;
      `,
      [
        input.cuentaId,
        input.categoriaId,
        input.tipo,
        input.importe,
        input.fecha,
        input.descripcion ?? null,
        input.id,
      ]
    );
  });
}

export async function deleteTransaccion(transaccionId: number): Promise<void> {
  await withWriteTransaction(async (txn) => {
    await txn.runAsync('DELETE FROM transacciones WHERE id = ?;', [transaccionId]);
  });
}

export async function listTransacciones(limit = 50): Promise<TransaccionConNombres[]> {
  const db = await getDatabase();
  return db.getAllAsync<TransaccionConNombres>(
    `
      SELECT
        t.id,
        t.cuenta_id,
        t.categoria_id,
        t.tipo,
        t.importe,
        t.fecha,
        t.descripcion,
        c.nombre AS cuenta_nombre,
        g.nombre AS categoria_nombre
      FROM transacciones t
      JOIN cuentas c ON c.id = t.cuenta_id
      JOIN categorias g ON g.id = t.categoria_id
      ORDER BY t.fecha DESC, t.id DESC
      LIMIT ?;
    `,
    [limit]
  );
}

export async function getInformeMensual(mes: string): Promise<InformeMensualFila[]> {
  const db = await getDatabase();
  return db.getAllAsync<InformeMensualFila>(
    `
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
      ORDER BY total DESC;
    `,
    [mes]
  );
}

export async function getTotalTransacciones(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ total: number }>('SELECT COUNT(*) AS total FROM transacciones;');
  return row?.total ?? 0;
}

export function defaultMonth(): string {
  return currentMonthString();
}
