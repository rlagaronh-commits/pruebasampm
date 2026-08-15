# AM & PM — Dos meses

Versión 2 del regalo interactivo. Está preparada para GitHub Pages y funciona sin build ni dependencias.

## Archivos que debes subir al repositorio

- `index.html` — biblioteca / portada general.
- `capitulo-1.html` — experiencia del Capítulo I.
- `capitulo-2.html` — experiencia nueva y protegida del Capítulo II.
- `style.css` — diseño, responsive y animaciones.
- `script.js` — interacciones, clave, ambiente, efectos y progreso.
- `assets/heart.svg` — favicon.

Sube estos archivos manteniendo exactamente la misma estructura. Si ya tienes el repositorio del primer mes, puedes sustituir su contenido por esta versión.

## Clave del Capítulo II

La clave elegida es `Teamufelizmes`. En `script.js` no se guarda como texto plano: se compara mediante SHA-256. Es una protección romántica/casual del contenido, no seguridad de servidor; cualquier web estática de GitHub Pages puede ser inspeccionada por una persona técnica.

## GitHub Pages

En GitHub: `Settings` → `Pages` → `Deploy from a branch` → rama `main` → `/root`.

## Música

El botón Ambiente genera tres temas instrumentales suaves con Web Audio. No necesita Spotify, YouTube ni archivos de audio externos.
