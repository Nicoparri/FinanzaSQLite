En esta seccion se describe la implementacion del prototipo en React Native + Expo SDK 54 con `expo-sqlite`, centrada en demostrar propiedades ACID, integridad referencial, triggers y consultas de agregacion ejecutadas por el motor SQL local [3], [7], [8].

## Arquitectura de implementacion

La implementacion se organiza en tres capas:

1. Capa de inicializacion y migracion (`src/db/database.ts`): abre la base local y aplica el DDL con `PRAGMA foreign_keys = ON` y versionado por `PRAGMA user_version`.
2. Capa de acceso a datos (`src/db/repository.ts`): centraliza CRUD y consultas de dominio.
3. Capa de interfaz (`App.tsx`): invoca funciones del repositorio y renderiza resultados sin recalcular agregaciones en JavaScript.

Esta separacion permite que las reglas de consistencia queden declaradas en SQL y no dispersas en la UI, lo que mejora trazabilidad tecnica para el analisis academico [1], [3].

## Inicializacion de SQLite y migracion

La inicializacion aplica reglas de integridad y crea objetos SQL avanzados (tablas, indices, vista y triggers) en el arranque de la app.

```ts
export async function migrateDbIfNeeded(db: SQLite.SQLiteDatabase): Promise<void> {
  // Activa claves foraneas para que CASCADE y RESTRICT sean efectivas.
  await db.execAsync('PRAGMA foreign_keys = ON;');
  // Usa WAL para mejorar concurrencia entre lecturas y escrituras.
  await db.execAsync('PRAGMA journal_mode = WAL;');

  const current = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
  const currentVersion = current?.user_version ?? 0;

  if (currentVersion >= SCHEMA_VERSION) {
    return;
  }

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS transacciones (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      cuenta_id    INTEGER NOT NULL REFERENCES cuentas(id)    ON DELETE RESTRICT,
      categoria_id INTEGER NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
      tipo         TEXT    NOT NULL CHECK(tipo IN ('ingreso', 'gasto')),
      importe      REAL    NOT NULL CHECK(importe > 0),
      fecha        TEXT    NOT NULL,
      descripcion  TEXT
    );

    CREATE TRIGGER IF NOT EXISTS actualizar_presupuesto_tras_gasto
    AFTER INSERT ON transacciones
    WHEN NEW.tipo = 'gasto'
    BEGIN
      UPDATE presupuestos
      SET restante = restante - NEW.importe
      WHERE categoria_id = NEW.categoria_id
        AND mes = strftime('%Y-%m', NEW.fecha);
    END;
  `);
}
```

Este bloque concreta dos principios del diseno de BD movil: (a) consistencia declarativa en el esquema y (b) automatizacion de reglas de negocio mediante triggers para reducir errores de sincronizacion en la capa de aplicacion [1], [3].

## Operaciones transaccionales ACID

Las escrituras criticas usan `withExclusiveTransactionAsync`, de forma que la insercion de cada movimiento se confirma atomicamente.

```ts
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
    // La insercion queda dentro de una transaccion exclusiva.
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
```

La consistencia de presupuesto se mantiene sin logica adicional en React Native, porque el trigger `actualizar_presupuesto_tras_gasto` se ejecuta en la misma transaccion de insercion [3], [7].

## Modulo de notificaciones y alertas

La funcionalidad de notificaciones se implementa en la interfaz (`App.tsx`) y se apoya en estado persistido en SQLite para activar alertas utiles sin depender de red. El interruptor en Ajustes sincroniza permisos iOS y guarda la preferencia en base de datos.

```ts
async function handleNotificacionesChange(next: boolean): Promise<void> {
  if (!next) {
    setNotificaciones(false);
    await syncNotifications(false);
    await persistSettings({ notificaciones: false }, 'Notificaciones desactivadas.');
    return;
  }

  const enabled = await syncNotifications(true);
  if (!enabled) {
    setNotificaciones(false);
    await persistSettings({ notificaciones: false });
    setError('Permiso de notificaciones denegado en iOS. Activalo en Ajustes del sistema.');
    return;
  }

  setNotificaciones(true);
  await persistSettings({ notificaciones: true }, 'Notificaciones iOS activadas.');
}
```

El panel de notificaciones construye alertas de presupuesto con umbrales de consumo y evidencia del ultimo movimiento, lo que traslada el foco desde reportes estaticos a avisos accionables para el usuario final [3], [7].

## Generacion de datos de prueba

Para estresar el motor local se implementa un generador de 100-500 transacciones con medicion temporal en milisegundos. Este mismo enfoque se extiende en fase 3 con un benchmark reproducible en `scripts/benchmark_sqlite.py` y resultados serializados en `docs/paper/data/phase3-benchmark.json`.

Con esta implementacion, la app satisface el objetivo tecnico de demostrar almacenamiento relacional local, reglas de integridad y analitica SQL nativa en un escenario offline-first verificable [3], [7].
