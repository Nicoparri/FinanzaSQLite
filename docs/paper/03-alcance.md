La aplicacion propuesta se utiliza como caso de estudio para evaluar capacidades de bases de datos moviles en un escenario de finanzas personales, donde la persistencia local debe sostener operaciones frecuentes, consistentes y auditables bajo uso cotidiano [2], [3].

El alcance funcional se delimita al paradigma offline-first en iOS: toda la persistencia ocurre en SQLite local y se excluye sincronizacion remota para aislar el rendimiento del SGBD de la latencia de red y de variaciones externas de conectividad [2].

En la Tabla 1 se detallan las funcionalidades principales de la app y el concepto de base de datos movil que cada una demuestra.

*Tabla 1*  
*Funcionalidades de la aplicacion financiera y requisitos de la Base de Datos Movil*

| Funcionalidad | Descripcion del Caso de Uso | Concepto de BD Demostrado |
|---|---|---|
| Registro de Transacciones (INSERT) | Registro de ingresos y gastos con cuenta y categoria. | Transacciones ACID con `withExclusiveTransactionAsync`. |
| Informes Analiticos (SELECT con agregacion) | Estadisticas de gastos mensuales por categoria. | Consultas `SUM/GROUP BY` ejecutadas en el motor SQLite, no en JavaScript. |
| Actualizacion Automatica de Presupuesto (Trigger) | Al insertar un gasto, el presupuesto restante se actualiza automaticamente. | Trigger `AFTER INSERT` en SQLite; consistencia sin logica en la capa de aplicacion. |
| Gestion de Categorias (DELETE con integridad referencial) | Eliminar una categoria elimina sus transacciones (CASCADE) o bloquea si hay cuenta vinculada (RESTRICT). | Integridad referencial con `ON DELETE CASCADE` y `ON DELETE RESTRICT` via `PRAGMA foreign_keys = ON`. |

*Nota.* La tabla muestra como los requerimientos de una aplicacion financiera se traducen en operaciones exigentes para el SGBD local. Elaboracion propia.

Como limitaciones del alcance, quedan fuera la autenticacion de usuarios, la sincronizacion con servidor, la implementacion de cifrado avanzado en build nativa y el soporte Android, porque el objetivo de esta fase es evaluar el comportamiento del SGBD local en iOS con foco en integridad y consulta [2], [3].

Este encuadre permite que las metricas posteriores se interpreten con menor ruido experimental, ya que el prototipo concentra el analisis en transacciones, restricciones y consultas agregadas directamente ejecutadas por SQLite [1], [3].

Referencias IEEE citadas en esta seccion:
[1] V. Kumar, *Mobile Database Systems*. Wiley, 2006.
[2] V. Kumar, *Fundamentals of Pervasive Information Management Systems*. Wiley, 2013.
[3] M. Owens, *The Definitive Guide to SQLite*, 2nd ed. Apress, 2010.