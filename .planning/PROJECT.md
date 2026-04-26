# Trabajo CBD - App iOS con SQLite

## What This Is

Trabajo academico para la asignatura CBD (Bases de Datos), Grado en Ingenieria del Software, Universidad de Sevilla (Prof. Toni Reina). El objetivo es redactar un documento academico riguroso que demuestre la implementacion de una app de finanzas personales en iOS usando React Native, Expo y expo-sqlite, poniendo a prueba las capacidades del SGBD local en cuanto a transacciones ACID, consultas de agregacion, triggers e integridad referencial. El entregable incluye el documento escrito, el prototipo funcional en Expo y una presentacion de defensa.

## Core Value

Un documento academico completo y entregable que demuestre empiricamente el rendimiento de SQLite en iOS, acompanado de un prototipo React Native funcional que sirva de evidencia de la implementacion.

## Requirements

### Validated

- [x] **DOC-01**: Introduccion con estructura requerida
- [x] **DOC-02**: Estado del Arte con comparativa AsyncStorage/Realm/expo-sqlite
- [x] **DOC-03**: Alcance y Funcionalidades con Tabla 1
- [x] **DOC-04**: Metodologia/Diseno con E/R y DDL SQL
- [x] **DOC-05**: Seccion Implementacion completa
- [x] **DOC-06**: Seccion Resultados y Pruebas con metricas
- [x] **DOC-07**: Conclusiones completas
- [x] **DOC-08**: Referencias IEEE completas
- [x] **DOC-09**: Declaracion de uso de IA completa
- [x] **FMT-01**: Formato de tablas aplicado
- [x] **FMT-02**: Formato de figuras aplicado
- [x] **BD-01**: Proyecto Expo + expo-sqlite + TypeScript operativo
- [x] **BD-02**: Migracion SQLite con PRAGMA y DDL completo
- [x] **BD-03**: Esquema de 4 tablas implementado
- [x] **BD-04**: Integridad referencial CASCADE/RESTRICT implementada
- [x] **BD-05**: Trigger de presupuesto implementado
- [x] **BD-06**: Indices de rendimiento implementados
- [x] **BD-07**: Vista SQL de resumen mensual implementada
- [x] **APP-01**: Pantalla de cuentas implementada
- [x] **APP-02**: Pantalla de categorias con borrado referencial
- [x] **APP-03**: Registro de transacciones con ACID
- [x] **APP-04**: Pantalla de presupuestos implementada
- [x] **APP-05**: Informe mensual SQL implementado
- [x] **APP-06**: Generador de datos de prueba implementado
- [x] **DEF-01**: Material de defensa preparado
- [x] **DEF-02**: Guion cronometrado preparado

### Active

- [ ] **FMT-03**: Auditoria humana de suficiencia de citas IEEE por afirmacion tecnica
- [ ] **FMT-04**: Auditoria humana de originalidad/parafraseo (sin plagio mosaico)
- [ ] **APP-07**: Capturas reales en iOS para evidencia visual del prototipo
- [ ] Sincronizar `REQUIREMENTS.md` con hallazgos de `v1.0-MILESTONE-AUDIT.md`

### Out of Scope

- Sincronizacion con servidor backend - decision intencionada para aislar metricas del SGBD local frente a latencia de red
- Implementacion real de SQLCipher - se menciona teoricamente pero no se implementa por complejidad adicional
- Version Android - el trabajo pide explicitamente iOS
- Despliegue en App Store / produccion - es un prototipo academico, no un producto comercial
- Tests automatizados - el alcance de 30 h no lo incluye

## Context

- Asignatura: CBD (Bases de Datos), Grado en Ingenieria del Software, Universidad de Sevilla
- Profesora: Toni Reina
- Tema: aplicacion movil iOS con almacenamiento local y analitica SQL
- Entregables completados: documento tecnico, prototipo Expo/SQLite y paquete de defensa
- Historial del milestone v1.0 archivado en `.planning/milestones/`

## Constraints

- Timeline: 2-3 semanas, con prioridad documental
- Tech stack: React Native + Expo + expo-sqlite + TypeScript
- Citas: formato IEEE obligatorio
- IA: todo uso de IA debe quedar documentado con enlaces

## Current State

Milestone v1.0 completado y archivado el 2026-04-06.

- Audit status: `gaps_found` (pendientes humanos en FMT-03, FMT-04 y APP-07)
- Archivos de milestone: `.planning/milestones/v1.0-ROADMAP.md`, `.planning/milestones/v1.0-REQUIREMENTS.md`, `.planning/milestones/v1.0-MILESTONE-AUDIT.md`
- Historial de fases: `.planning/milestones/v1.0-phases/`
- Indice de entregas: `.planning/MILESTONES.md`

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| expo-sqlite sobre Realm/AsyncStorage | Mejor soporte para SQL completo, ACID e integridad referencial | Good |
| Arquitectura offline-first | Aislar metricas del SGBD de la latencia de red | Good |
| Finanzas personales como caso de uso | Cubre ACID, agregaciones, triggers y FKs en un dominio unico | Good |
| Formato de citas IEEE | Requisito explicito del trabajo | Good |
| Documento antes que app | Prioridad academica y control de alcance | Good |
| Completar v1.0 con brechas explicitas | Preservar historia y cerrar lifecycle con deuda documentada | Accepted with gaps |

## Evolution

This document is now aligned to a shipped v1.0 milestone.
Next update point: after defining v1.1 scope and closing the pending human verification items.

---
*Last updated: 2026-04-06 after v1.0 milestone completion*
