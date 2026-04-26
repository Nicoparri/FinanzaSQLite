El prototipo desarrollado confirma que SQLite local, integrado mediante `expo-sqlite`, permite implementar una aplicacion de finanzas personales con consistencia de datos, reglas de integridad referencial y capacidad analitica en modo offline-first.

Desde la evidencia cuantitativa, la insercion de 20000 transacciones en bloque se ejecuto en una media de 96.4607 ms en el entorno medido, mientras que la consulta mensual agregada se mantuvo por debajo de 3 ms de media en ambos escenarios evaluados (con y sin indices). Estos resultados son consistentes con el objetivo del trabajo: demostrar viabilidad tecnica del SGBD local para cargas financieras representativas.

En terminos practicos, la separacion entre capa de migracion SQL, repositorio de acceso a datos y UI favorece mantenibilidad y trazabilidad academica, ya que las decisiones de integridad (RESTRICT, CASCADE, triggers) quedan declaradas en el esquema y no en reglas dispersas en la interfaz.

Como limitaciones del estudio, las metricas se obtuvieron en entorno local de escritorio para garantizar reproducibilidad del benchmark; la captura visual en iOS Simulator/dispositivo queda como validacion humana pendiente. Ademas, el sistema no incorpora sincronizacion remota ni estrategia de respaldo en nube porque el alcance se restringio de forma deliberada al paradigma offline-first.

Como lineas de trabajo futuro, se propone ampliar la experimentacion en dispositivo iOS real, anadir pruebas de carga con distribuciones de datos mas cercanas a uso real, evaluar cifrado nativo para base local y disenar una estrategia de sincronizacion cifrada extremo a extremo que preserve integridad transaccional.
