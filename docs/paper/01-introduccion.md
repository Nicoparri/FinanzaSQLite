NOTA: El texto final debe justificarse por ambos lados en el documento Word/PDF.

La gestion de finanzas personales en movilidad exige que los datos criticos esten disponibles en todo momento, incluso cuando el dispositivo no tiene conectividad, porque las decisiones de gasto e ingreso se producen en contexto real y no pueden depender de una red estable [2].

En el marco de las bases de datos moviles, un SGBDM debe equilibrar disponibilidad local, consistencia de la informacion y capacidad de consulta bajo limitaciones de bateria, memoria y variabilidad de uso, aspectos senalados en la literatura clasica del area [1], [2].

Este trabajo tiene como proposito demostrar de forma empirica que una aplicacion iOS de finanzas personales puede apoyarse en un motor local relacional para mantener integridad referencial, ejecutar operaciones transaccionales y producir informes analiticos sin depender de un servidor remoto [3].

La metodologia adoptada sigue un enfoque offline-first con React Native, Expo y expo-sqlite, donde el esquema SQL incorpora restricciones, triggers y consultas de agregacion para tensionar el SGBD local en escenarios representativos de uso financiero cotidiano [1], [3].

Como resultado esperado, el prototipo permitira medir tiempos de insercion y consulta en simulador iOS para comparar el efecto de estructuras SQL como indices y vistas sobre cargas de datos financieras con volumen controlado [3].

En terminos de conclusion breve, se plantea que un diseno relacional local bien definido puede ofrecer una base tecnica viable para aplicaciones financieras moviles, aportando trazabilidad, consistencia y capacidad analitica en un contexto academico verificable [1], [3].

Referencias IEEE citadas en esta seccion:
[1] V. Kumar, *Mobile Database Systems*. Wiley, 2006.
[2] V. Kumar, *Fundamentals of Pervasive Information Management Systems*. Wiley, 2013.
[3] M. Owens, *The Definitive Guide to SQLite*, 2nd ed. Apress, 2010.
[4] K. Makice, *Learning Realm: Development for Android and iOS*. O'Reilly Media, 2016.
[5] Meta Platforms Inc., "AsyncStorage," *React Native Documentation*, 2023.
[6] Apple Inc., "Core Data Programming Guide," *Apple Developer Documentation*, 2023.