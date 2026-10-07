# CIEP7 · Mapa móvil del congreso

Versión 1.4 preparada para GitHub Pages y diseñada prioritariamente para móviles.

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


## Ubicaciones v1.4

La versión 1.4 mantiene los ocho puntos georreferenciados de la tabla definitiva. Además de las seis salas ya existentes, se añaden dos puntos de encuentro diferenciados visualmente en el mapa:

- `P·IAPH` — Punto de encuentro · Visita IAPH (`37.39739605, -6.00784904`)
- `P·CAAC` — Punto de encuentro · Visita CAAC (`37.39830220, -6.00869571`)

Los puntos de encuentro se muestran en verde para distinguirlos de las salas de presentación.

## Cartografía

La capa principal es **PNOA Máxima Actualidad (IGN/CNIG)** mediante WMTS. OpenStreetMap queda como capa alternativa.

La aplicación y el buscador pueden quedar almacenados por la PWA, pero las teselas de la ortofoto se solicitan en línea para no ocupar almacenamiento innecesario en los teléfonos.

## URL sin el nombre de usuario de GitHub

La aplicación usa rutas relativas, por lo que funciona igualmente con un dominio personalizado.
Para ocultar `parri98.github.io` de la barra de direcciones, configura un dominio o subdominio propio en **Settings → Pages → Custom domain** y crea en el proveedor DNS el registro que indique GitHub.

Ejemplos posibles: `mapa.ciep7.es`, `ciep7.iaph.es` o `mapa.congresociep.es` (si la organización dispone del dominio y autoriza su uso).

Si no se dispone de dominio propio, una alternativa es publicar el repositorio desde una organización de GitHub con un nombre institucional o del congreso. En ese caso seguirá apareciendo `github.io`, pero no el usuario personal.


## Horarios
La ficha y los resultados de búsqueda muestran la franja horaria oficial de la sesión de cada presentación, según el cronograma del CIEP7.


## Mejora de visualización móvil v1.4

- Los puntos del mapa se muestran como círculos pequeños sobre su coordenada exacta, sin abreviaturas permanentes que se solapen.
- Al tocar un punto aparece temporalmente su nombre completo.
- Al buscar una comunicación, solo el destino se destaca en naranja y con un halo; el resto de ubicaciones se atenúan.
- El mapa acerca automáticamente el destino para separar mejor ubicaciones muy próximas, como Aula A2 y Sala de conferencias.
- El botón **Centrar destino** usa un zoom mayor y deja espacio para la ficha inferior en móviles.
- No se desplaza ninguna coordenada: la geometría coincide con los puntos de QGIS.
