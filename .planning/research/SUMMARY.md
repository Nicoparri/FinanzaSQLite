# Research Summary: CBD Academic iOS Finance App

**Domain:** React Native + Expo + expo-sqlite offline-first personal finance app for iOS (academic demo)
**Researched:** 2026-04-06
**Overall confidence:** HIGH

## Executive Summary

The React Native + Expo + expo-sqlite stack is mature, well-documented, and stable as of April 2026. Expo SDK 55 (released February 2026) is the current stable release, shipping with React Native 0.83, React 19.2, and mandatory New Architecture support. The expo-sqlite package has undergone a complete API rewrite since SDK 51 -- the old WebSQL-like callback API (`expo-sqlite/legacy`) was fully removed in SDK 52 (November 2024). The modern API provides async methods (`runAsync`, `getAllAsync`, `getFirstAsync`, `execAsync`), React integration via `SQLiteProvider`/`useSQLiteContext`, transaction support (`withTransactionAsync`), and a new tagged template literal API (`db.sql`) for type-safe inline queries.

For this academic project, the stack is an excellent fit. The raw SQL capabilities of expo-sqlite directly support the course requirements: ACID transactions, aggregate queries (SUM/GROUP BY), triggers, and referential integrity with PRAGMA foreign_keys. The student can demonstrate all these SQL concepts without an ORM layer abstracting them away. Expo Router (file-based navigation) simplifies the app structure, and TypeScript provides type safety that will make the codebase easier to explain in the academic paper.

**Expo Go compatible:** expo-sqlite está incluido en la app Expo Go SDK 54. El desarrollo se hace con `npx expo start` escaneando el QR, sin necesidad de Xcode ni builds nativos. Esto simplifica significativamente el setup y permite iterar rápidamente.

The ecosystem has moved decisively toward Drizzle ORM as the standard ORM for expo-sqlite, but for this project specifically, raw SQL is the correct choice because the professor is evaluating SQL knowledge, not ORM knowledge. The Drizzle Studio plugin can still be used as a development tool for inspecting the database without coupling the app code to Drizzle.

## Key Findings

**Stack:** Expo SDK 54 + expo-sqlite@~14.0.6 + Expo Router ~3.5.x + TypeScript. Stable, well-documented, compatible con Expo Go.

**Architecture:** SQLiteProvider at the root layout, useSQLiteContext in components, database migration via `onInit` callback with PRAGMA user_version pattern. File-based routing in `src/app/`.

**Critical pitfall:** The legacy expo-sqlite API (`expo-sqlite/legacy`, `SQLite.openDatabase()`, `db.transaction()` callbacks) was removed in SDK 52. Many online tutorials and Stack Overflow answers still reference it. The student must only follow the modern async API.

## Implications for Roadmap

Based on research, suggested phase structure:

1. **Project Setup + Database Schema** - Scaffold with `create-expo-app`, configure expo-sqlite, define schema with CREATE TABLE + triggers in migration function, enable PRAGMA foreign_keys
   - Addresses: APP-01, APP-02 (project setup, schema definition)
   - Expo Go compatible: `npx expo start` suficiente para desarrollo

2. **CRUD Implementation** - Build transaction entry, category management, account management screens with full CRUD
   - Addresses: APP-03, APP-06 (CRUD operations, cascade/restrict delete)
   - Avoids: Using old API patterns from outdated tutorials

3. **Advanced SQL Features** - Implement triggers for budget recalculation, aggregate queries for reports (SUM/GROUP BY by category and month)
   - Addresses: APP-04, APP-05 (triggers, aggregate queries)
   - Avoids: Processing aggregations in JavaScript instead of SQL

4. **Polish + Documentation** - Screenshots, demo in simulator, academic writeup of implementation section
   - Addresses: APP-07, DOC-05 (screenshots, implementation documentation)

**Phase ordering rationale:**
- Schema must come first because everything depends on it (referential integrity, triggers)
- CRUD before advanced features because triggers fire on INSERT/UPDATE/DELETE operations you build in CRUD phase
- Reports/aggregation last because they are read-only queries over data created by CRUD operations

**Research flags for phases:**
- Phase 1: Verificar que `npx expo start` arranca correctamente con Expo Go SDK 54
- Phase 2: Standard CRUD patterns, well-documented in expo-sqlite docs
- Phase 3: Trigger syntax in SQLite is well-documented but not specific to expo-sqlite docs (use SQLite.org reference)
- Phase 4: Standard documentation work, no additional research needed

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack versions | HIGH | SDK 54: expo@~54.0.0, expo-sqlite@~14.0.6, expo-router@~3.5.x. Compatible con Expo Go. |
| expo-sqlite API surface | HIGH | Verified via official Expo docs and multiple concordant sources. Provider/context pattern, async methods, transactions, tagged template API all confirmed. |
| Legacy API removal | HIGH | Confirmed by Expo SDK 51 and SDK 52 changelogs. `expo-sqlite/legacy` removed in SDK 52. |
| Expo Go compatibilidad | HIGH | expo-sqlite incluido en Expo Go SDK 54. No se necesita dev client. |
| Folder structure (app/ at root) | MEDIUM | SDK 54 usa `app/` en la raíz (no `src/app/`, eso es SDK 55+). |
| Drizzle ORM integration | MEDIUM | Well-documented on Drizzle's official site, but not recommended for this project so not deeply verified. |

## Gaps to Address

- `db.sql` tagged template NO está disponible en SDK 54 (es SDK 55+). Usar `db.getAllAsync<T>(sql, params)` explícito para todas las consultas.
- Trigger creation syntax works in `execAsync` but interaction with `withTransactionAsync` during trigger-fired cascades should be validated empirically.
- iOS Simulator performance characteristics for SQLite operations (needed for the Results and Tests section of the academic paper) will need to be measured during implementation, not researched upfront.

---
*Research summary for: CBD Academic iOS Finance App*
*Researched: 2026-04-06*
