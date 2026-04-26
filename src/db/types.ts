export type TipoCuenta = 'efectivo' | 'banco' | 'tarjeta';
export type TipoMovimiento = 'ingreso' | 'gasto';
export type MonedaPreferida = 'EUR' | 'USD' | 'GBP';
export type InicioSemana = 'lunes' | 'domingo';

export interface Cuenta {
  id: number;
  nombre: string;
  tipo: TipoCuenta;
}

export interface Categoria {
  id: number;
  nombre: string;
  tipo: TipoMovimiento;
}

export interface Transaccion {
  id: number;
  cuenta_id: number;
  categoria_id: number;
  tipo: TipoMovimiento;
  importe: number;
  fecha: string;
  descripcion: string | null;
}

export interface TransaccionConNombres extends Transaccion {
  cuenta_nombre: string;
  categoria_nombre: string;
}

export interface Presupuesto {
  id: number;
  categoria_id: number;
  categoria_nombre: string;
  mes: string;
  limite: number;
  restante: number;
}

export interface InformeMensualFila {
  categoria: string;
  mes: string;
  total: number;
  num_transacciones: number;
}

export interface BalanceCuenta {
  cuenta_id: number;
  cuenta: string;
  balance: number;
}

export interface AppSettings {
  moneda: MonedaPreferida;
  inicioSemana: InicioSemana;
  notificaciones: boolean;
  faceId: boolean;
  bloqueoAuto: boolean;
}

export interface SeedMetrics {
  elapsedMs: number;
  inserted: number;
}
