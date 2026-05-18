export const MAP_MAX_ZOOM = 20
export const MAP_MIN_ZOOM = 7

export const TILE_OPTIONS = {
  maxZoom: MAP_MAX_ZOOM,
  maxNativeZoom: 19,
  keepBuffer: 3,
  updateWhenIdle: true,
  updateWhenZooming: false,
  crossOrigin: true,
}

export const BASEMAP_TYPES = {
  standard: 'standard',
  satellite: 'satellite',
}

export const BASEMAP_LABELS = {
  standard: 'Standard Map',
  satellite: 'Satellite View',
}

export function createStandardLayer(L) {
  return L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    ...TILE_OPTIONS,
    subdomains: 'abcd',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  })
}

export function createSatelliteLayer(L) {
  const imagery = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      ...TILE_OPTIONS,
      attribution: 'Imagery &copy; Esri',
    },
  )

  const labels = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    {
      ...TILE_OPTIONS,
      pane: 'overlayPane',
      opacity: 0.92,
      attribution: 'Labels &copy; Esri',
    },
  )

  const roads = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',
    {
      ...TILE_OPTIONS,
      pane: 'overlayPane',
      opacity: 0.65,
    },
  )

  return L.layerGroup([imagery, roads, labels])
}
