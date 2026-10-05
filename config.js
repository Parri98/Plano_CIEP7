window.CIEP7_CONFIG = {
  version: '1.3.0',
  congress: {
    shortName: 'CIEP7',
    title: 'VII Congreso Internacional de Educación Patrimonial',
    subtitle: 'Mapa de salas · Sevilla · 14–16 octubre 2026'
  },
  map: {
    center: [37.39755, -6.00780],
    initialZoom: 19,
    maxZoom: 21,
    pnoaUrl: 'https://www.ign.es/wmts/pnoa-ma?request=GetTile&service=WMTS&version=1.0.0&layer=OI.OrthoimageCoverage&style=default&TileMatrixSet=GoogleMapsCompatible&TileMatrix={z}&TileCol={x}&TileRow={y}&format=image/jpeg',
    osmUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
  },
  venues: {
    unia:       { name: 'Salón de actos · UNIA',               short: 'UNIA',      lat: 37.39858544, lng: -6.00867119 },
    abovedada:  { name: 'Sala abovedada · IAPH',               short: 'ABOV.',     lat: 37.39781111, lng: -6.00730952 },
    a2:         { name: 'Edificio A · Aula/Sala A2 · IAPH',     short: 'A2',        lat: 37.39699938, lng: -6.00755353 },
    a_conf:     { name: 'Sala de conferencias · IAPH',          short: 'CONF.',     lat: 37.39697118, lng: -6.00757437 },
    b2:         { name: 'Edificio B · Aula/Sala B2 · IAPH',     short: 'B2',        lat: 37.39684856, lng: -6.00795694 },
    biblioteca: { name: 'Biblioteca del IAPH',                  short: 'BIB.',      lat: 37.39732187, lng: -6.00777424 },
    visita_iaph:{ name: 'Punto de encuentro · Visita IAPH',        short: 'P·IAPH',     lat: 37.39739605, lng: -6.00784904, kind: 'meeting' },
    visita_caac:{ name: 'Punto de encuentro · Visita CAAC',        short: 'P·CAAC',     lat: 37.39830220, lng: -6.00869571, kind: 'meeting' }
  }
};
