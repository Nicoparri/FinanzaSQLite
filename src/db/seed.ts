import { getDatabase } from './database';
import { listCategorias, listCuentas } from './repository';
import { SeedMetrics } from './types';

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDateInMonth(month: string): string {
  const day = String(randomBetween(1, 28)).padStart(2, '0');
  return `${month}-${day}`;
}

function pickOne<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export async function generateSeedTransactions(count: number, month: string): Promise<SeedMetrics> {
  const db = await getDatabase();
  const cuentas = await listCuentas();
  const categorias = await listCategorias();

  if (cuentas.length === 0 || categorias.length === 0) {
    throw new Error('Debe existir al menos una cuenta y una categoria antes de generar seed.');
  }

  const gastos = categorias.filter((categoria) => categoria.tipo === 'gasto');
  const ingresos = categorias.filter((categoria) => categoria.tipo === 'ingreso');
  const start = globalThis.performance?.now?.() ?? Date.now();

  await db.withExclusiveTransactionAsync(async (txn) => {
    for (let index = 0; index < count; index += 1) {
      const isGasto = Math.random() < 0.8;
      const tipo = isGasto ? 'gasto' : 'ingreso';
      const categoriasFuente = isGasto ? gastos : ingresos;
      const categoria = categoriasFuente.length > 0 ? pickOne(categoriasFuente) : pickOne(categorias);
      const cuenta = pickOne(cuentas);

      await txn.runAsync(
        `
        INSERT INTO transacciones (cuenta_id, categoria_id, tipo, importe, fecha, descripcion)
        VALUES (?, ?, ?, ?, ?, ?);
        `,
        [
          cuenta.id,
          categoria.id,
          tipo,
          randomBetween(3, 180),
          randomDateInMonth(month),
          `Seed ${index + 1}`,
        ]
      );
    }
  });

  const end = globalThis.performance?.now?.() ?? Date.now();
  return {
    elapsedMs: Number((end - start).toFixed(2)),
    inserted: count,
  };
}
