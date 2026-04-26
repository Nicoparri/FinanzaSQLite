El ecosistema multiplataforma actual permite construir aplicaciones moviles con una sola base de codigo, pero en dominios financieros la capa de persistencia local sigue siendo una decision arquitectonica critica: se necesita disponibilidad offline, consistencia de datos y capacidad de consulta analitica en el propio dispositivo; por ello, esta seccion compara tres alternativas de almacenamiento local en React Native mediante un analisis tecnico orientado a requerimientos de BD movil y concluye con una seleccion justificada del motor mas adecuado para el caso de uso [2], [3], [5].

## Almacenamiento Clave-Valor (AsyncStorage)

AsyncStorage ofrece un modelo clave-valor sencillo y util para preferencias o metadatos ligeros, pero no aporta propiedades ACID completas, ni integridad referencial, ni un lenguaje de consulta relacional para agregaciones de negocio [5]. En una app financiera, esta limitacion obliga a reconstruir logica de consistencia en la capa de aplicacion y a procesar colecciones en memoria, lo que aumenta complejidad y riesgo de errores en calculos agregados [5].

## Bases de Datos Orientadas a Objetos (Realm)

Realm destaca por su rendimiento y su modelo orientado a objetos, con soporte de cifrado y sincronizacion en escenarios mas amplios, lo que la convierte en una opcion valida para ciertos productos moviles [4]. Sin embargo, cuando el objetivo principal es demostrar operaciones SQL (ACID, joins, SUM/GROUP BY, triggers y constraints) con trazabilidad academica directa, el enfoque no relacional complica el mapeo pedagogico frente a un motor SQL nativo [3], [4].

## Motor Relacional SQLite (expo-sqlite)

SQLite, accesible en Expo mediante expo-sqlite, aporta un motor SQL embebido con propiedades ACID, restricciones declarativas y soporte natural para agregacion, lo que se alinea con requisitos financieros basados en consistencia e informes mensuales [3]. Ademas, la integridad referencial habilitada con `PRAGMA foreign_keys = ON` permite modelar reglas como CASCADE y RESTRICT de forma verificable en el propio esquema [3].

En la Tabla 2 se presenta una comparativa sintetica de las tres alternativas de persistencia local analizadas para React Native.

*Tabla 2*  
*Comparativa de tecnologias de persistencia local en React Native*

| Caracteristica | AsyncStorage | Realm | expo-sqlite (SQLite) |
|---|---|---|---|
| Modelo de Datos | Clave-valor | Objetos persistentes | Relacional SQL |
| Propiedades ACID | Limitadas/no declarativas | Parciales segun modelo | Completas en transacciones SQL |
| Integridad Referencial | No declarativa | Gestion por relaciones del modelo | FK declarativas (`CASCADE`, `RESTRICT`) |
| Consultas de Agregacion | Sin SQL nativo | API propia, no SQL estandar | SQL nativo con `SUM` y `GROUP BY` |
| Idoneidad para Finanzas | Baja para analitica e integridad | Media para dominio tabular SQL | Alta para trazabilidad y consistencia |

*Nota.* Comparativa elaborada a partir de las fuentes [3], [4] y [5]. Elaboracion propia.

Como justificacion final, expo-sqlite se selecciona porque combina ACID, integridad referencial y consultas de agregacion SQL en un entorno embebido y reproducible, cubriendo mejor las necesidades del caso de uso financiero y del objetivo academico de evaluacion del SGBD local [3].

Desde la perspectiva metodologica del curso, esta eleccion tambien facilita la trazabilidad entre teoria y practica porque cada restriccion y consulta queda expresada como SQL auditable, algo especialmente util cuando se necesita defender decisiones tecnicas con evidencia reproducible [1], [2], [3].

Referencias IEEE citadas en esta seccion:
[1] V. Kumar, *Mobile Database Systems*. Wiley, 2006.
[2] V. Kumar, *Fundamentals of Pervasive Information Management Systems*. Wiley, 2013.
[3] M. Owens, *The Definitive Guide to SQLite*, 2nd ed. Apress, 2010.
[4] K. Makice, *Learning Realm: Development for Android and iOS*. O'Reilly Media, 2016.
[5] Meta Platforms Inc., "AsyncStorage," *React Native Documentation*, 2023.
[6] Apple Inc., "Core Data Programming Guide," *Apple Developer Documentation*, 2023.