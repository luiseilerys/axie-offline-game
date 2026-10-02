# Axie Offline Game

Juego de criaturas coleccionables offline para Android 5.1+ (API 22), inspirado en Axie Infinity pero **100% offline y sin blockchain**.

> Nota: Capacitor 6 / Cordova requieren minSdk 22 (Android 5.1). Cubre prácticamente todos los dispositivos Android 5.0+.

## Características

- **Criaturas coleccionables** con stats (HP, ATK, DEF, SPD), clases (Bestia, Planta, Reptil, Acuático, Pájaro, Bicho) y habilidades únicas.
- **Batallas por turnos** 1v1 y 3v3 con sistema de energía, habilidades y IA enemiga.
- **Sistema de crianza**: combina dos criaturas para generar una nueva con stats heredados.
- **Economía local**: moneda guardada en localStorage / archivo de partida.
- **Guardado y carga local** sin servidor ni internet.

## Tecnologías

- HTML5 + CSS + JavaScript vanilla (sin frameworks)
- Capacitor 6 para empaquetar como app Android nativa (WebView)
- Service Worker + Manifest PWA para funcionamiento offline

## Cómo jugar (en el navegador)

Abre `www/index.html` en cualquier navegador moderno. Todo funciona offline.

## Compilar APK

El workflow de GitHub Actions (`Build APK`) se ejecuta automáticamente en cada push a `main`.

1. Ve a la pestaña **Actions** del repositorio.
2. Selecciona el workflow **Build APK** más reciente (debe aparecer en verde).
3. Descarga el artifact `axie-offline-apk`.
4. Instala el APK en tu dispositivo Android 5.1+ (activa "Orígenes desconocidos" si es necesario).

### Compilar localmente

```bash
npm install
npx cap add android
npx cap sync android
cd android && ./gradlew assembleDebug
```

El APK estará en `android/app/build/outputs/apk/debug/`.

## Estructura

```
www/
  index.html      # Interfaz principal
  css/style.css   # Estilos
  js/data.js      # Datos de criaturas y habilidades
  js/game.js      # Lógica: batallas, crianza, economía, guardado
  manifest.json   # PWA manifest
  sw.js           # Service Worker offline
package.json
capacitor.config.json
.github/workflows/build-apk.yml
```

## Requisitos Android

- Min SDK: 22 (Android 5.1 Lollipop)
- Target SDK: 34
- Sin permisos de internet necesarios para jugar

## Enlace del repositorio

https://github.com/luiseilerys/axie-offline-game

---
Hecho con ❤️ de forma completamente offline.