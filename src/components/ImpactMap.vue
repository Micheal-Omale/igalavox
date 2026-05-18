<script setup>
import 'leaflet/dist/leaflet.css'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import localCommunities from '../data/local_govt_area.json'
import {
  BASEMAP_TYPES,
  MAP_MAX_ZOOM,
  MAP_MIN_ZOOM,
  createSatelliteLayer,
  createStandardLayer,
} from '../config/mapLayers'
import MapLayerControl from './MapLayerControl.vue'
import { getCategoryMeta, hasCoordinates, normalizeCoordinate, parseLocationContext } from '../services/impactService'

const kogiEastBounds = [
  [6.45, 6.35],
  [8.45, 8.05],
]

const props = defineProps({
  reports: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: Object,
    default: null,
  },
  preview: {
    type: Boolean,
    default: false,
  },
  interactive: {
    type: Boolean,
    default: false,
  },
  center: {
    type: Array,
    default: () => [7.42, 7.18],
  },
  zoom: {
    type: Number,
    default: 9,
  },
  showLabels: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:modelValue', 'select'])

const mapId = `impact-map-${Math.random().toString(36).slice(2)}`
const activeBasemap = ref(BASEMAP_TYPES.standard)

let L
let map
let reportLayer
let labelLayer
let draftMarker
let resizeObserver
let standardLayer
let satelliteLayer
let currentBasemapLayer

function makeIcon(category) {
  const meta = getCategoryMeta(category)
  return L.divIcon({
    className: 'impact-marker',
    html: `<span style="background:${meta.marker}"><span class="material-symbols-outlined">${meta.icon}</span></span>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  })
}

function emitCoordinates(latlng) {
  emit('update:modelValue', {
    latitude: normalizeCoordinate(latlng.lat),
    longitude: normalizeCoordinate(latlng.lng),
  })
}

function validDraftCoordinates() {
  const latitude = normalizeCoordinate(props.modelValue?.latitude)
  const longitude = normalizeCoordinate(props.modelValue?.longitude)
  if (latitude === null || longitude === null) return null
  return [latitude, longitude]
}

function labelIcon(name, tone = 'community') {
  return L.divIcon({
    className: `impact-map-label impact-map-label-${tone}`,
    html: `<span>${name}</span>`,
    iconSize: [160, 26],
    iconAnchor: [80, 13],
  })
}

function shouldShowCommunityLabels() {
  if (!map) return false
  return map.getZoom() >= 10
}

function shouldShowLandmarkLabels() {
  if (!map) return false
  return map.getZoom() >= 12
}

function renderLabels() {
  if (!map || !labelLayer || !props.showLabels) return

  labelLayer.clearLayers()
  const showCommunities = shouldShowCommunityLabels()
  const showLandmarks = shouldShowLandmarkLabels()
  if (!showCommunities && !showLandmarks) return

  const seen = new Set()
  const addLabel = (name, latitude, longitude, tone = 'community') => {
    const lat = normalizeCoordinate(latitude)
    const lng = normalizeCoordinate(longitude)
    if (!name || lat === null || lng === null) return

    const key = `${tone}-${name}-${lat}-${lng}`
    if (seen.has(key)) return
    seen.add(key)

    L.marker([lat, lng], {
      icon: labelIcon(name, tone),
      interactive: false,
      keyboard: false,
    }).addTo(labelLayer)
  }

  if (showCommunities) {
    localCommunities.forEach((community) => {
      addLabel(community.community_name, community.latitude, community.longitude)
    })

    props.reports.filter(hasCoordinates).forEach((report) => {
      addLabel(report.community_name, report.latitude, report.longitude, 'report')
    })
  }

  if (showLandmarks) {
    props.reports.filter(hasCoordinates).forEach((report) => {
      const context = parseLocationContext(report.description)
      const landmark = context.nearbyLandmark || context.marketName || context.schoolOrHospitalNearby
      if (landmark) {
        addLabel(landmark, report.latitude, report.longitude, 'landmark')
      }
    })
  }
}

function renderReports() {
  if (!map || !reportLayer || props.interactive) return

  reportLayer.clearLayers()
  const validReports = props.reports.filter(hasCoordinates)

  validReports.forEach((report) => {
    const marker = L.marker([Number(report.latitude), Number(report.longitude)], {
      icon: makeIcon(report.category),
    })

    marker.on('click', () => emit('select', report))
    reportLayer.addLayer(marker)
  })

  if (validReports.length && !props.preview) {
    const bounds = L.latLngBounds(validReports.map((report) => [Number(report.latitude), Number(report.longitude)]))
    map.fitBounds(bounds, { padding: [32, 32], maxZoom: 14 })
  }

  renderLabels()
}

function renderDraftMarker() {
  if (!map || !props.interactive) return

  const coords = validDraftCoordinates()
  if (!coords) {
    if (draftMarker) {
      map.removeLayer(draftMarker)
      draftMarker = null
    }
    return
  }

  if (!draftMarker) {
    draftMarker = L.marker(coords, {
      draggable: true,
      zIndexOffset: 1000,
      icon: L.divIcon({
        className: 'impact-picker',
        html: '<span class="material-symbols-outlined">place</span>',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      }),
    }).addTo(map)

    draftMarker.on('dragend', () => {
      emitCoordinates(draftMarker.getLatLng())
    })
  } else {
    draftMarker.setLatLng(coords)
  }

  map.panTo(coords, { animate: true })
}

function sendBasemapToBack(layer) {
  if (!layer) return
  if (typeof layer.eachLayer === 'function') {
    layer.eachLayer(sendBasemapToBack)
    return
  }
  layer.bringToBack?.()
}

function setBasemap(type) {
  if (!map || !L) return

  const nextLayer = type === BASEMAP_TYPES.satellite ? satelliteLayer : standardLayer
  if (currentBasemapLayer === nextLayer) return

  if (currentBasemapLayer) {
    map.removeLayer(currentBasemapLayer)
  }

  currentBasemapLayer = nextLayer
  currentBasemapLayer.addTo(map)
  sendBasemapToBack(currentBasemapLayer)
}

function createReportLayer() {
  return L.markerClusterGroup({
    showCoverageOnHover: false,
    spiderfyOnMaxZoom: true,
    removeOutsideVisibleBounds: true,
    maxClusterRadius: 52,
    iconCreateFunction(cluster) {
      const count = cluster.getChildCount()
      return L.divIcon({
        className: 'impact-cluster',
        html: `<span>${count}</span>`,
        iconSize: [42, 42],
        iconAnchor: [21, 21],
      })
    },
  })
}

function invalidateMap() {
  if (map) map.invalidateSize(false)
}

onMounted(async () => {
  const leafletModule = await import('leaflet')
  L = leafletModule.default || leafletModule
  await import('leaflet.markercluster')
  await nextTick()

  map = L.map(mapId, {
    center: props.center,
    zoom: props.preview ? Math.min(props.zoom, 9) : props.zoom,
    maxBounds: kogiEastBounds,
    maxBoundsViscosity: 0.9,
    minZoom: MAP_MIN_ZOOM,
    maxZoom: MAP_MAX_ZOOM,
    scrollWheelZoom: !props.preview,
    dragging: true,
    touchZoom: true,
    doubleClickZoom: true,
    zoomControl: !props.preview,
    attributionControl: !props.preview,
    zoomAnimation: true,
    fadeAnimation: true,
  })

  standardLayer = createStandardLayer(L)
  satelliteLayer = createSatelliteLayer(L)
  setBasemap(activeBasemap.value)

  if (props.interactive) {
    reportLayer = L.layerGroup().addTo(map)
  } else {
    reportLayer = createReportLayer()
    reportLayer.addTo(map)
  }

  labelLayer = L.layerGroup().addTo(map)
  map.fitBounds(kogiEastBounds, { padding: [14, 14] })

  map.on('zoomend', renderLabels)

  if (props.interactive) {
    map.on('click', (event) => {
      emitCoordinates(event.latlng)
    })
    renderDraftMarker()
    renderLabels()
  } else {
    renderReports()
  }

  const mapEl = document.getElementById(mapId)
  if (mapEl && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => invalidateMap())
    resizeObserver.observe(mapEl)
  }

  setTimeout(invalidateMap, 0)
})

watch(activeBasemap, (type) => {
  setBasemap(type)
})

watch(() => props.reports, () => {
  renderReports()
  renderLabels()
}, { deep: true })

watch(() => props.modelValue, renderDraftMarker, { deep: true })

watch(
  () => props.center,
  (center) => {
    if (!map || !Array.isArray(center) || center.length < 2 || props.interactive) return
    map.setView(center, map.getZoom(), { animate: true })
  },
  { deep: true },
)

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }

  if (map) {
    map.remove()
    map = null
  }
})
</script>

<template>
  <div class="relative">
    <MapLayerControl v-if="!preview" v-model="activeBasemap" />
    <div
      :id="mapId"
      class="min-h-[320px] overflow-hidden rounded-lg border border-outline-variant/40"
      :class="preview ? 'h-[320px]' : 'h-[520px]'"
    ></div>
  </div>
</template>

<style scoped>
:deep(.leaflet-container) {
  touch-action: pan-x pan-y;
  font-family: "Plus Jakarta Sans", sans-serif;
}

:deep(.leaflet-pane) {
  z-index: 1;
}

:deep(.leaflet-tile-pane) {
  z-index: 1;
}

:deep(.leaflet-overlay-pane) {
  z-index: 2;
}

:deep(.leaflet-shadow-pane) {
  z-index: 3;
}

:deep(.leaflet-marker-pane) {
  z-index: 4;
}

:deep(.leaflet-tooltip-pane) {
  z-index: 5;
}

:deep(.leaflet-popup-pane) {
  z-index: 6;
}

:deep(.leaflet-control-container) {
  position: relative;
  z-index: 7;
}

:deep(.leaflet-control-zoom) {
  border: 1px solid rgb(192 200 195 / 0.7);
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 4px 14px rgb(0 0 0 / 0.08);
}

:deep(.leaflet-control-zoom a) {
  width: 34px;
  height: 34px;
  line-height: 34px;
  color: #00261b;
  background: #fcf9f4;
}

:deep(.leaflet-control-zoom a:hover) {
  background: #f0ede9;
}

:deep(.leaflet-control-attribution) {
  font-size: 10px;
  background: rgb(252 249 244 / 0.88);
}

:deep(.impact-marker),
:deep(.impact-picker) {
  background: transparent;
  border: 0;
}

:deep(.impact-marker > span) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 2.5px solid #fff;
  border-radius: 999px;
  color: #fff;
  box-shadow: 0 10px 20px rgb(0 0 0 / 0.24);
}

:deep(.impact-marker .material-symbols-outlined) {
  font-size: 18px;
}

:deep(.impact-picker > span) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 2.5px solid #fff;
  border-radius: 999px;
  background: #00261b;
  color: #fff;
  box-shadow: 0 12px 26px rgb(0 0 0 / 0.28);
}

:deep(.impact-picker .material-symbols-outlined) {
  font-size: 22px;
}

:deep(.impact-cluster > span) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border: 2.5px solid #fff;
  border-radius: 999px;
  background: #00261b;
  color: #fff;
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 10px 22px rgb(0 0 0 / 0.22);
}

:deep(.impact-map-label) {
  background: transparent;
  border: 0;
  pointer-events: none;
}

:deep(.impact-map-label > span) {
  display: inline-block;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 2px 8px;
  border-radius: 999px;
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0.01em;
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.12);
}

:deep(.impact-map-label-community > span) {
  color: #00261b;
  background: rgb(252 249 244 / 0.94);
  border: 1px solid rgb(192 200 195 / 0.8);
}

:deep(.impact-map-label-report > span) {
  color: #7c563b;
  background: rgb(254 202 168 / 0.95);
  border: 1px solid rgb(124 86 59 / 0.35);
}

:deep(.impact-map-label-landmark > span) {
  color: #0b3d2e;
  background: rgb(188 237 215 / 0.95);
  border: 1px solid rgb(57 103 86 / 0.35);
}

:deep(.marker-cluster-small),
:deep(.marker-cluster-medium),
:deep(.marker-cluster-large),
:deep(.marker-cluster) {
  background: transparent;
}

:deep(.leaflet-cluster-anim .leaflet-marker-icon),
:deep(.leaflet-cluster-anim .leaflet-marker-shadow) {
  transition: transform 0.3s ease-out, opacity 0.3s ease-in;
}

:deep(.leaflet-cluster-spider-leg) {
  transition: stroke-dashoffset 0.3s ease-out, stroke-opacity 0.3s ease-in;
}
</style>
