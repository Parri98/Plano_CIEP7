# CIEP7 · Mapa móvil de salas

Versión 1.0 preparada para GitHub Pages y diseñada prioritariamente para móviles.

## Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub.
2. Sube **todo el contenido de esta carpeta a la raíz** del repositorio (no subas la carpeta contenedora como una subcarpeta).
3. En GitHub abre **Settings → Pages**.
4. En **Build and deployment**, selecciona **Deploy from a branch**.
5. Elige `main` y `/ (root)` y guarda.
6. Espera unos minutos. GitHub mostrará la URL pública.

La geolocalización funciona en GitHub Pages porque se sirve mediante HTTPS. El navegador pedirá permiso al usuario la primera vez.

## Archivos que normalmente tendrás que editar

- `config.js`: coordenadas, nombres y abreviaturas de las salas.
- `data/programa.js`: ponencias, autores, sesiones y salas.
- `styles.css`: aspecto visual.

## Cartografía

La capa principal es **PNOA Máxima Actualidad (IGN/CNIG)** mediante WMTS. OpenStreetMap queda como capa alternativa.

La aplicación y el buscador pueden quedar almacenados por la PWA, pero las teselas de la ortofoto se solicitan en línea para no ocupar almacenamiento innecesario en los teléfonos.
