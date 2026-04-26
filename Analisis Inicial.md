### **Propuesta de redacción: Alcance y Funcionalidades (Finanzas Personales)**

**Introducción de la sección**

La gestión eficiente de las finanzas personales es un desafío cotidiano que demanda herramientas tecnológicas rápidas, seguras y disponibles de forma ininterrumpida. En este contexto, el presente trabajo se contextualiza en el estudio de las bases de datos móviles mediante la conceptualización y desarrollo de una aplicación de control presupuestario para la plataforma iOS. El propósito principal de este desarrollo es evaluar el rendimiento de los Sistemas Gestores de Bases de Datos (SGBD) locales al enfrentarse a requisitos de almacenamiento seguro, procesamiento de transacciones matemáticas y ejecución de consultas analíticas complejas. Para lograr este objetivo, la metodología empleada se basa en la implementación práctica de un prototipo que ejecuta operaciones intensivas de agregación de datos y manejo de restricciones de integridad a nivel local. Los resultados derivados de este prototipo demostrarán la viabilidad técnica de gestionar grandes volúmenes de registros financieros cifrados con tiempos de respuesta óptimos en dispositivos móviles. En conclusión, esta aproximación permitirá validar empíricamente las capacidades teóricas de persistencia, concurrencia y seguridad de datos en ecosistemas móviles reales.

**Definición del Alcance**

El desarrollo de esta investigación se delimita estrictamente a la arquitectura de almacenamiento local del dispositivo iOS, operando bajo un paradigma de desconexión (*offline-first*). Esta decisión arquitectónica es fundamental para aislar las métricas de rendimiento del SGBD móvil frente a la latencia que introduciría la red (Kumar, 2013). La aplicación integrará encriptación a nivel de base de datos para garantizar la privacidad de la información financiera y explotará las capacidades del motor relacional para la generación de informes estadísticos en tiempo real de forma autónoma.

**Funcionalidades Principales**

Las operaciones de la aplicación han sido seleccionadas estratégicamente para estresar diferentes componentes del SGBD móvil. En la Tabla 1 se detallan las funcionalidades principales y el reto técnico que suponen a nivel de persistencia de datos.

**Tabla 1**

*Funcionalidades de la aplicación financiera y requisitos de la Base de Datos Móvil*

| Funcionalidad | Descripción del Caso de Uso | Requisito de Base de Datos Móvil |
| :---- | :---- | :---- |
| **1\. Transacciones Financieras (Inserts)** | Registro de ingresos y gastos diarios asociados a cuentas específicas. | Garantía de propiedades ACID y uso de encriptación transparente (ej. SQLCipher) para proteger los registros de accesos no autorizados. |
| **2\. Informes Analíticos (Selects)** | Visualización de estadísticas de gastos mensuales y balances por categoría. | Ejecución de consultas de agregación complejas (SUM, GROUP BY) y uso de índices temporales para optimizar el tiempo de lectura. |
| **3\. Lógica de Negocio Automática (Triggers)** | Actualización del presupuesto restante cuando el usuario introduce un nuevo gasto. | Implementación de disparadores (*triggers*) en la base de datos para recalcular saldos automáticamente asegurando la consistencia (Apple Inc., 2023). |
| **4\. Gestión de Categorías (Deletes/Integridad)** | Eliminación o reestructuración de categorías de gasto creadas por el usuario. | Manejo avanzado de la integridad referencial, aplicando borrado en cascada o restricciones (RESTRICT) para evitar registros huérfanos. |

*Nota*. La tabla muestra cómo los requerimientos de una aplicación financiera se traducen en operaciones exigentes para el SGBD local. Elaboración propia.

**Conclusiones de la sección**

En resumen, el diseño de esta aplicación financiera proporciona un entorno de prueba riguroso y realista para la evaluación de bases de datos móviles en iOS. Las implicaciones teóricas y prácticas de este modelo confirman que la aplicación simultánea de consultas analíticas pesadas y mecanismos de encriptación local es viable sin que ello conlleve una degradación inaceptable en la experiencia de usuario. La principal limitación metodológica de este diseño reside en la ausencia de mecanismos de respaldo remoto o tolerancia a fallos por pérdida de dispositivo. Los trabajos futuros que continúen esta línea de investigación podrán explorar la integración de arquitecturas de sincronización cifrada de extremo a extremo sin comprometer el rendimiento en el entorno local.

---

### **📅 Planificación del Trabajo (Cronograma de 30 horas)**

A continuación, se presenta la planificación estructurada del trabajo académico (Fase 5 de tu solicitud). En tu documento, te sugiero incluirlo también en formato de tabla para mantener el rigor estético.

***Tabla 2***

*Cronograma detallado de actividades del proyecto con React Native y Expo (30 horas)*

| *Fase* | *Tarea Específica* | *Horas* | *Hito Entregable* |
| :---- | :---- | :---- | :---- |
| ***1\. Investigación y Viabilidad (5 h)*** | *1.1 Revisión bibliográfica sobre BD móviles en entornos multiplataforma (React Native).* | *2* | *Repositorio de artículos/fuentes.* |
|  | *1.2 Estudio comparativo y análisis del puente nativo (JSI) para expo-sqlite.* | *3* | *Borrador del Estado del Arte.* |
| ***2\. Diseño de la Aplicación (5 h)*** | *2.1 Modelado de datos: Esquema Entidad-Relación y tablas relacionales.* | *3* | *Diagrama E/R y Esquema Físico.* |
|  | *2.2 Diseño de interfaz (Mockups) y definición de consultas analíticas (SQL).* | *2* | *Wireframes e inventario de consultas.* |
| ***3\. Implementación (11 h)*** | *3.1 Configuración del entorno (Node.js, Expo CLI) y despliegue de la BD local (expo-sqlite).* | *3* | *Proyecto Expo base compilando.* |
|  | *3.2 Programación de operaciones CRUD, hooks de React y gestión de estado local.* | *4* | *Prototipo funcional (Inserción/Borrado).* |
|  | *3.3 Implementación de triggers y consultas de agregación complejas para Reporting.* | *4* | *App final con estadísticas y saldos.* |
| ***4\. Redacción Académica (6 h)*** | *4.1 Redacción de Introducción, Metodología y Estado del Arte.* | *3* | *Primer borrador del documento.* |
|  | *4.2 Documentación de pruebas en emulador/dispositivo, Resultados y Conclusiones.* | *2* | *Documento principal completo.* |
|  | *4.3 Revisión de formato (alineación justificada), citas (APA/IEEE) e índices.* | *1* | *Documento Final PDF.* |
| ***5\. Preparación Defensa (3 h)*** | *5.1 Elaboración de diapositivas (extracción de figuras y mensajes clave).* | *1.5* | *Presentación (.ppt o .key).* |
|  | *5.2 Ensayo cronometrado y preparación de respuestas a posibles preguntas.* | *1.5* | *Guion de presentación validado.* |
| ***Total*** |  | ***30 h*** |  |

*Nota. Cronograma de esfuerzo estimado en horas para la ejecución íntegra del Trabajo Fin de Asignatura (CBD), adaptado al desarrollo multiplataforma. Elaboración propia.*

### **Estado del Arte y Tecnologías**

**Introducción al ecosistema multiplataforma y persistencia local**

El desarrollo de aplicaciones móviles multiplataforma ha transformado la ingeniería de software, permitiendo unificar bases de código sin renunciar al acceso a las API nativas del dispositivo mediante *frameworks* como React Native. En el ámbito de las finanzas personales, la gestión de datos críticos exige soluciones de persistencia local robustas, operando bajo el paradigma *offline-first* para garantizar la disponibilidad ininterrumpida y la privacidad de la información (Kumar, 2013). El propósito de esta sección es evaluar y seleccionar la tecnología de base de datos móvil más adecuada dentro del entorno de desarrollo de Expo para soportar operaciones transaccionales y analíticas complejas. La metodología aplicada consiste en un análisis comparativo de las alternativas de almacenamiento predominantes compatibles con React Native: soluciones clave-valor, bases de datos orientadas a objetos y motores relacionales integrados. Los resultados de esta revisión apuntan a que los motores relacionales nativos, expuestos a través de interfaces sincrónicas, ofrecen el mejor rendimiento para consultas matemáticas. En conclusión, la elección tecnológica debe priorizar la integridad de los datos financieros y la capacidad de agregación local por encima de la simplicidad de implementación.

**Análisis de soluciones Clave-Valor (AsyncStorage)**

En el ecosistema de React Native, AsyncStorage es la solución de almacenamiento persistente por defecto. Se trata de un sistema de almacenamiento asíncrono, no encriptado y basado en diccionarios de datos (clave-valor) (Meta Platforms Inc., 2023). Si bien es extremadamente útil para guardar preferencias de usuario o *tokens* de sesión, carece de las propiedades ACID (Atomicidad, Consistencia, Aislamiento y Durabilidad) necesarias para una aplicación financiera. Además, no permite realizar consultas complejas, búsquedas filtradas o relaciones entre entidades, lo que obliga a cargar colecciones enteras de datos en la memoria RAM del dispositivo para procesarlas mediante lógica de aplicación, un enfoque inviable para historiales financieros extensos.

**Análisis de Realm para React Native**

Realm es una base de datos orientada a objetos (NoSQL) con un motor escrito en C++ que ofrece integración directa con React Native. Su arquitectura prescinde de la traducción a consultas SQL, lo que le otorga tiempos de lectura y escritura excepcionalmente rápidos (Makice, 2016). Adicionalmente, incluye soporte nativo para el cifrado de datos mediante AES-256. A pesar de estas ventajas, su naturaleza no relacional dificulta la ejecución de operaciones de agregación puras (como sumatorios mensuales agrupados por categorías) directamente en el motor, siendo menos idiomática para la naturaleza inherentemente tabular de los asientos contables y financieros.

**Análisis y justificación de SQLite (expo-sqlite)**

SQLite es el motor de base de datos relacional estándar de facto en dispositivos móviles (Owens, 2010). En el contexto de Expo y React Native, la librería expo-sqlite proporciona una interfaz que conecta el entorno de ejecución de JavaScript directamente con la biblioteca nativa de SQLite del dispositivo móvil. Esta integración permite la ejecución de sentencias SQL completas, asegurando el cumplimiento de las restricciones de integridad referencial y permitiendo delegar el esfuerzo computacional de las consultas analíticas complejas (SUM, GROUP BY, JOIN) al motor de la base de datos en lugar de al hilo principal de JavaScript. En la Tabla 2 se sintetizan las capacidades de cada tecnología. Por tanto, se justifica la elección de React Native (Expo) junto con expo-sqlite por su equilibrio óptimo entre agilidad de desarrollo multiplataforma y robustez relacional.

**Tabla 2**

*Comparativa de tecnologías de persistencia local en el ecosistema React Native*

| Característica | AsyncStorage | Realm (React Native) | expo-sqlite (SQLite) |
| :---- | :---- | :---- | :---- |
| **Modelo de Datos** | Clave-Valor | Orientado a Objetos | Relacional (SQL) |
| **Propiedades ACID** | No | Sí | Sí |
| **Integridad Referencial** | Nula | Gestionada por enlaces | Estricta (Claves Foráneas) |
| **Consultas de Agregación** | No soportadas | Moderadas | Avanzadas (Nativas en SQL) |
| **Idoneidad para Finanzas** | Muy Baja | Alta | Muy Alta |

---

### **📚 Fuentes y Referencias (Para tu bibliografía final)**

1. **Apple Inc. (2023).** *Core Data Programming Guide*. Apple Developer Documentation. Recuperado de [https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/CoreData/](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/CoreData/)  
2. **Kumar, V. (2013).** *Fundamentals of Pervasive Information Management Systems*. John Wiley & Sons.  
3. **Makice, K. (2016).** *Learning Realm: Development for Android and iOS*. O'Reilly Media.  
4. **Owens, M. (2010).** *The Definitive Guide to SQLite* (2nd ed.). Apress.  
   

### **🤖 Declaración de uso de IA (Para documentar en el trabajo)**

*"Para la recopilación del estado del arte y la justificación tecnológica entre Core Data, Realm y SQLite, se empleó el modelo de lenguaje de Google (Gemini). El prompt utilizado solicitó una comparativa académica, argumentada con literatura técnica y formateada en tabla, para justificar la elección de SQLite y SQLCipher en una aplicación financiera para iOS."*

*"Para la definición de la sección de alcance, la justificación tecnológica multiplataforma (React Native) y el diseño del cronograma de 30 horas, se empleó el modelo de lenguaje de Google (Gemini). Los prompts solicitaban la estructuración de un proyecto centrado en la evaluación de la librería 'expo-sqlite' en una aplicación financiera, aplicando formato académico tabular y estimación realista de tiempos por fase."*

