# Despliegue en iPhone desde Windows

Guia para ejecutar la app **Finanzas SQLite** en iPhone desde Windows con dos rutas:

- **Opcion A (recomendada para entrega):** instalar el archivo `FinanzasSQLite.ipa` publicado en la [release v1.0.0](https://github.com/Nicoparri/FinanzaSQLite/releases/tag/v1.0.0).
- **Opcion B (desarrollo y pruebas):** ejecutar la app con **Expo Go**.

---

## Requisitos previos

Comunes:

- iPhone con iOS 16 o superior.
- PC Windows con conexion a Internet.

Para **Opcion A (IPA + Sideloadly)**:

- Cuenta Apple ID gratuita.
- **Sideloadly** instalado -> <https://sideloadly.io>
- **iTunes** instalado desde <https://www.apple.com/itunes/> (no Microsoft Store).
- Cable USB Lightning/USB-C para conectar el iPhone.

Para **Opcion B (Expo Go)**:

- Node.js y npm instalados en Windows.
- App **Expo Go** instalada en el iPhone desde App Store.
- PC y iPhone en la misma red Wi-Fi (o uso de `--tunnel`).

---

## Opcion A - Instalar el IPA de la release

### Paso 1 - Localizar el IPA del proyecto

Descarga `FinanzasSQLite.ipa` desde la [release v1.0.0](https://github.com/Nicoparri/FinanzaSQLite/releases/tag/v1.0.0) del repositorio.

Si necesitas una build nueva, usa el apartado opcional del final para regenerarla.

### Paso 2 - Preparar el iPhone

1. Conecta el iPhone al PC con el cable USB.
2. Si aparece **"Confiar en este ordenador"**, pulsa **Confiar** e introduce el codigo de desbloqueo.
3. Manten el iPhone desbloqueado durante toda la instalacion.

### Paso 3 - Instalar con Sideloadly

1. Abre **Sideloadly** en Windows.
2. Verifica que el iPhone aparece en **iDevice**.
3. Arrastra `FinanzasSQLite.ipa` a Sideloadly.
4. Introduce tu Apple ID en **Apple Account**.
5. Pulsa **Start**.
6. Si se solicita 2FA, introduce el codigo recibido.
7. Espera el mensaje **Done** en el log.

### Paso 4 - Activar Modo de Desarrollador (primera vez)

1. iPhone -> **Ajustes > Privacidad y seguridad > Modo de Desarrollador**.
2. Activa el modo y reinicia el dispositivo cuando se solicite.
3. Tras reiniciar, confirma **Activar** e introduce el codigo.

### Paso 5 - Confiar en el perfil de desarrollador

1. iPhone -> **Ajustes > General > VPN y gestion de dispositivos**.
2. Selecciona tu Apple ID en **APP DEL DESARROLLADOR**.
3. Pulsa **Confiar**.
4. Abre la app desde la pantalla de inicio.

### Caducidad del certificado (Apple ID gratis)

El firmado gratuito caduca a los **7 dias**. Cuando caduque, repite solo la instalacion con Sideloadly (Paso 3).

---

## Opcion B - Ejecutar con Expo Go

### Paso 1 - Instalar dependencias del proyecto

Desde la raiz del repositorio en Windows:

```bash
npm install
```

### Paso 2 - Levantar el servidor de desarrollo

```bash
npx expo start
```

Si hay problemas de red local, usar:

```bash
npx expo start --tunnel
```

### Paso 3 - Abrir en iPhone con Expo Go

1. Abre Expo Go en el iPhone.
2. Escanea el QR que muestra la terminal/web de Expo.
3. Espera a que cargue el bundle.
4. Valida que la app abre y permite navegar por Inicio, Movimientos, Presupuestos y Ajustes.

### Notas de la opcion Expo Go

- No instala una app firmada permanente: depende del servidor de desarrollo.
- Es la opcion mas rapida para pruebas funcionales y demostraciones durante desarrollo.

---

## Opcion opcional: regenerar IPA si no viene incluido

Si no tienes el `FinanzasSQLite.ipa`, puedes regenerarlo con GitHub Actions usando el workflow **Build iOS unsigned IPA** y descargar el artefacto.

---

## Resumen rapido

| Escenario | Opcion recomendada |
|---|---|
| Entrega final en iPhone sin Mac | IPA de la release + Sideloadly |
| Desarrollo y pruebas rapidas | Expo Go |
