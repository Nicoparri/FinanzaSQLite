#!/usr/bin/env python3
"""Benchmark reproducible para la fase 3 del trabajo CBD.

Mide:
1) Insercion en bloque de N transacciones dentro de una unica transaccion.
2) Tiempo de consulta mensual con indices activos.
3) Tiempo de consulta mensual tras eliminar indices.

Salida: JSON con metadatos de ejecucion y metricas agregadas.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import platform
import random
import sqlite3
import statistics
import tempfile
import time
from pathlib import Path

REPORT_QUERY = """
SELECT
  c.nombre AS categoria,
  SUM(t.importe) AS total,
  COUNT(t.id) AS num_transacciones
FROM transacciones t
JOIN categorias c ON c.id = t.categoria_id
WHERE t.tipo = 'gasto'
  AND t.fecha >= ?
  AND t.fecha < ?
GROUP BY c.id
ORDER BY total DESC;
"""


def project_root() -> Path:
    return Path(__file__).resolve().parents[1]


def default_output_path() -> Path:
    return project_root() / "docs" / "paper" / "data" / "phase3-benchmark.json"


def schema_path() -> Path:
    return project_root() / "docs" / "esquema" / "schema.sql"


def iso_date_for_month(rng: random.Random, month: int) -> str:
    day = rng.randint(1, 28)
    return f"2025-{month:02d}-{day:02d}"


def bootstrap_catalogs(conn: sqlite3.Connection) -> tuple[list[int], list[int], list[int]]:
    cuentas = [
        ("Cuenta Banco", "banco"),
        ("Efectivo", "efectivo"),
        ("Tarjeta", "tarjeta"),
    ]
    categorias = [
        ("Nomina", "ingreso"),
        ("Alimentacion", "gasto"),
        ("Transporte", "gasto"),
        ("Vivienda", "gasto"),
        ("Ocio", "gasto"),
    ]

    conn.executemany("INSERT INTO cuentas (nombre, tipo) VALUES (?, ?);", cuentas)
    conn.executemany("INSERT INTO categorias (nombre, tipo) VALUES (?, ?);", categorias)

    cuenta_ids = [row[0] for row in conn.execute("SELECT id FROM cuentas ORDER BY id;")]
    categoria_gasto_ids = [
        row[0]
        for row in conn.execute("SELECT id FROM categorias WHERE tipo = 'gasto' ORDER BY id;")
    ]
    categoria_ingreso_ids = [
        row[0]
        for row in conn.execute("SELECT id FROM categorias WHERE tipo = 'ingreso' ORDER BY id;")
    ]

    for categoria_id in categoria_gasto_ids:
        conn.execute(
            """
            INSERT INTO presupuestos (categoria_id, mes, limite, restante)
            VALUES (?, '2025-10', 1200.0, 1200.0);
            """,
            (categoria_id,),
        )

    return cuenta_ids, categoria_gasto_ids, categoria_ingreso_ids


def build_transactions(
    n: int,
    rng: random.Random,
    cuenta_ids: list[int],
    categoria_gasto_ids: list[int],
    categoria_ingreso_ids: list[int],
) -> list[tuple[int, int, str, float, str, str]]:
    rows: list[tuple[int, int, str, float, str, str]] = []

    for idx in range(n):
        is_gasto = rng.random() < 0.8
        tipo = "gasto" if is_gasto else "ingreso"
        categoria_id = (
            rng.choice(categoria_gasto_ids)
            if is_gasto
            else rng.choice(categoria_ingreso_ids)
        )
        cuenta_id = rng.choice(cuenta_ids)
        month = rng.randint(1, 12)
        fecha = iso_date_for_month(rng, month)
        importe = round(rng.uniform(5.0, 250.0), 2)
        rows.append(
            (
                cuenta_id,
                categoria_id,
                tipo,
                importe,
                fecha,
                f"tx_{idx}",
            )
        )

    return rows


def setup_connection(db_path: str, ddl: str) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.executescript(ddl)
    conn.commit()
    return conn


def explain_query(conn: sqlite3.Connection, start_date: str, end_date: str) -> list[str]:
    rows = conn.execute(
        f"EXPLAIN QUERY PLAN {REPORT_QUERY}",
        (start_date, end_date),
    ).fetchall()
    return [str(row[3]) for row in rows]


def run_benchmark(
    n_transactions: int,
    repetitions: int,
    query_repetitions: int,
    seed: int,
) -> dict:
    ddl = schema_path().read_text(encoding="utf-8")

    insert_times_ms: list[float] = []
    query_with_index_ms: list[float] = []
    query_without_index_ms: list[float] = []

    explain_with_index: list[str] = []
    explain_without_index: list[str] = []

    start_date = "2025-10-01"
    end_date = "2025-11-01"

    for run_id in range(repetitions):
        run_seed = seed + run_id
        rng = random.Random(run_seed)

        with tempfile.TemporaryDirectory(prefix="cbd-phase3-bench-") as tmp_dir:
            db_path = os.path.join(tmp_dir, "benchmark.db")
            conn = setup_connection(db_path, ddl)
            try:
                cuenta_ids, categoria_gasto_ids, categoria_ingreso_ids = bootstrap_catalogs(conn)
                conn.commit()

                rows = build_transactions(
                    n_transactions,
                    rng,
                    cuenta_ids,
                    categoria_gasto_ids,
                    categoria_ingreso_ids,
                )

                t0 = time.perf_counter()
                conn.execute("BEGIN;")
                conn.executemany(
                    """
                    INSERT INTO transacciones (
                      cuenta_id,
                      categoria_id,
                      tipo,
                      importe,
                      fecha,
                      descripcion
                    ) VALUES (?, ?, ?, ?, ?, ?);
                    """,
                    rows,
                )
                conn.execute("COMMIT;")
                insert_times_ms.append((time.perf_counter() - t0) * 1000)

                conn.execute("PRAGMA optimize;")
                conn.execute(REPORT_QUERY, (start_date, end_date)).fetchall()

                if not explain_with_index:
                    explain_with_index = explain_query(conn, start_date, end_date)

                for _ in range(query_repetitions):
                    q0 = time.perf_counter()
                    conn.execute(REPORT_QUERY, (start_date, end_date)).fetchall()
                    query_with_index_ms.append((time.perf_counter() - q0) * 1000)

                conn.execute("DROP INDEX IF EXISTS idx_txn_fecha;")
                conn.execute("DROP INDEX IF EXISTS idx_txn_categoria;")
                conn.commit()
                conn.execute("PRAGMA optimize;")
                conn.execute(REPORT_QUERY, (start_date, end_date)).fetchall()

                if not explain_without_index:
                    explain_without_index = explain_query(conn, start_date, end_date)

                for _ in range(query_repetitions):
                    q1 = time.perf_counter()
                    conn.execute(REPORT_QUERY, (start_date, end_date)).fetchall()
                    query_without_index_ms.append((time.perf_counter() - q1) * 1000)
            finally:
                conn.close()

    return {
        "n_transactions": n_transactions,
        "repetitions": repetitions,
        "query_repetitions_per_run": query_repetitions,
        "seed_base": seed,
        "date_window": {
            "start": start_date,
            "end_exclusive": end_date,
        },
        "metrics_ms": {
            "bulk_insert": summarize(insert_times_ms),
            "query_with_index": summarize(query_with_index_ms),
            "query_without_index": summarize(query_without_index_ms),
        },
        "derived": {
            "query_speedup_x": round(
                (
                    statistics.mean(query_without_index_ms)
                    / statistics.mean(query_with_index_ms)
                ),
                2,
            )
            if query_with_index_ms and query_without_index_ms
            else None
        },
        "query_plan": {
            "with_index": explain_with_index,
            "without_index": explain_without_index,
        },
    }


def summarize(values: list[float]) -> dict:
    return {
        "samples": len(values),
        "mean": round(statistics.mean(values), 4),
        "median": round(statistics.median(values), 4),
        "min": round(min(values), 4),
        "max": round(max(values), 4),
        "stddev": round(statistics.pstdev(values), 4),
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Benchmark SQLite reproducible para fase 3")
    parser.add_argument("--n", type=int, default=20000, help="Numero de transacciones por corrida")
    parser.add_argument("--runs", type=int, default=5, help="Numero de corridas independientes")
    parser.add_argument(
        "--query-runs",
        type=int,
        default=20,
        help="Numero de consultas de reporte por corrida y por escenario",
    )
    parser.add_argument("--seed", type=int, default=20260406, help="Semilla base para aleatoriedad")
    parser.add_argument(
        "--output",
        type=Path,
        default=default_output_path(),
        help="Ruta del JSON de salida",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    started_at = dt.datetime.now(dt.timezone.utc).isoformat()
    result = run_benchmark(
        n_transactions=args.n,
        repetitions=args.runs,
        query_repetitions=args.query_runs,
        seed=args.seed,
    )
    finished_at = dt.datetime.now(dt.timezone.utc).isoformat()

    payload = {
        "benchmark": "phase3-sqlite-performance",
        "generated_at": finished_at,
        "started_at": started_at,
        "environment": {
            "python": platform.python_version(),
            "platform": platform.platform(),
        },
        "configuration": {
            "command": (
                f"python scripts/benchmark_sqlite.py --n {args.n} --runs {args.runs} "
                f"--query-runs {args.query_runs} --seed {args.seed}"
            )
        },
        "results": result,
    }

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    print(f"Benchmark completado. Resultado guardado en: {args.output}")
    print(json.dumps(payload["results"]["metrics_ms"], indent=2))


if __name__ == "__main__":
    main()
