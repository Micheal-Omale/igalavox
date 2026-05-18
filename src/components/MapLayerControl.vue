<script setup>
import { BASEMAP_LABELS, BASEMAP_TYPES } from '../config/mapLayers'

const model = defineModel({
  type: String,
  default: BASEMAP_TYPES.standard,
})

const options = [
  { key: BASEMAP_TYPES.standard, label: BASEMAP_LABELS.standard, icon: 'map' },
  { key: BASEMAP_TYPES.satellite, label: BASEMAP_LABELS.satellite, icon: 'satellite_alt' },
]
</script>

<template>
  <nav
    class="pointer-events-auto absolute right-3 top-3 z-[700] flex rounded-lg border border-outline-variant/40 bg-surface-container-lowest/95 p-1 shadow-lg backdrop-blur-sm"
    aria-label="Map type"
  >
    <button
      v-for="option in options"
      :key="option.key"
      type="button"
      :class="[
        'inline-flex items-center gap-1.5 rounded-md px-3 py-2 font-label text-xs font-semibold transition',
        model === option.key
          ? 'bg-primary text-on-primary shadow-sm'
          : 'text-on-surface-variant hover:bg-surface-container',
      ]"
      :aria-pressed="model === option.key"
      @click="model = option.key"
    >
      <span class="material-symbols-outlined text-[16px]">{{ option.icon }}</span>
      <span class="hidden sm:inline">{{ option.label }}</span>
    </button>
  </nav>
</template>
