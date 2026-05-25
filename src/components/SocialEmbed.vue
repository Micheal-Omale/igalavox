<script setup>
import { computed, ref, watch } from 'vue'
import { getEmbedConfig } from '../utils/socialVideo'

const props = defineProps({
  url: {
    type: String,
    required: true
  },
  autoplay: {
    type: Boolean,
    default: false
  }
})

const isPlaying = ref(false)
const isIframeLoaded = ref(false)

const embedConfig = computed(() => getEmbedConfig(props.url))

const platform = computed(() => embedConfig.value?.provider || 'unknown')
const normalizedUrl = computed(() => embedConfig.value?.normalizedUrl || props.url?.trim() || '')

const embedUrl = computed(() => {
  if (!embedConfig.value?.embedUrl) return null

  const url = new URL(embedConfig.value.embedUrl)
  if (props.autoplay && embedConfig.value.provider === 'youtube') {
    url.searchParams.set('autoplay', '1')
  }

  return url.toString()
})

const thumbnailUrl = computed(() => embedConfig.value?.thumbnailUrl || null)

const platformLabel = computed(() => {
  switch (platform.value) {
    case 'youtube': return 'YouTube'
    case 'tiktok': return 'TikTok'
    case 'facebook': return 'Facebook'
    default: return 'Media'
  }
})

const aspectClass = computed(() => {
  if (platform.value === 'tiktok') return 'aspect-[9/16]'
  return 'aspect-video'
})

const canPlay = computed(() => Boolean(embedUrl.value))
const shouldShowFrame = computed(() => isPlaying.value && canPlay.value)

watch([() => props.url, () => props.autoplay, canPlay], () => {
  isPlaying.value = props.autoplay && canPlay.value
  isIframeLoaded.value = false
}, { immediate: true })

const play = () => {
  isPlaying.value = true
}

const handleIframeLoad = () => {
  isIframeLoaded.value = true
}
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-outline-variant/25 bg-surface-container-lowest shadow-sm">
    <div class="relative w-full bg-neutral-950" :class="aspectClass">
      <template v-if="!isPlaying && canPlay">
        <button
          type="button"
          class="absolute inset-0 flex h-full w-full flex-col items-center justify-center overflow-hidden bg-neutral-900 text-left"
          @click="play"
        >
          <img
            v-if="thumbnailUrl"
            :src="thumbnailUrl"
            alt="Video thumbnail"
            class="absolute inset-0 h-full w-full object-cover opacity-65 transition-opacity duration-300 hover:opacity-50"
            loading="lazy"
          />
          <div
            v-else
            class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(188,237,215,0.18),_transparent_45%),linear-gradient(135deg,_rgba(11,61,46,0.92),_rgba(28,28,25,0.98))]"
          ></div>

          <div class="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 text-on-primary shadow-xl transition-transform duration-300 hover:scale-105">
            <span class="material-symbols-outlined ml-1 text-3xl">play_arrow</span>
          </div>

          <div class="absolute bottom-4 left-4 z-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 backdrop-blur-md">
            <span class="material-symbols-outlined text-sm text-white/80">play_circle</span>
            <span class="font-label text-xs font-semibold uppercase tracking-[0.14em] text-white">{{ platformLabel }}</span>
          </div>
        </button>
      </template>

      <template v-else-if="shouldShowFrame">
        <iframe
          :src="embedUrl"
          class="absolute inset-0 h-full w-full border-0"
          :title="`${platformLabel} embed`"
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
          @load="handleIframeLoad"
        ></iframe>

        <div
          v-if="!isIframeLoaded"
          class="absolute inset-0 flex items-center justify-center bg-neutral-950/80 text-center text-white"
        >
          <div class="space-y-2 px-6">
            <div class="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
            <p class="font-label text-xs font-semibold uppercase tracking-[0.14em] text-white/75">Loading embed</p>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="absolute inset-0 flex items-center justify-center bg-[linear-gradient(135deg,_rgba(240,237,233,1),_rgba(229,226,221,1))]">
          <div class="mx-auto flex max-w-md flex-col items-center gap-4 px-6 text-center">
            <div class="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-secondary shadow-sm">
              <span class="material-symbols-outlined text-3xl">open_in_new</span>
            </div>
            <div class="space-y-2">
              <p class="font-display text-xl font-semibold text-primary">Embed unavailable</p>
              <p class="font-body text-sm leading-6 text-on-surface-variant">
                This link cannot be rendered safely inside the archive. You can still open the original post directly.
              </p>
            </div>
          </div>
        </div>
      </template>
    </div>

    <div class="flex items-center justify-between gap-3 border-t border-outline-variant/20 bg-surface-container-low px-4 py-3">
      <div class="min-w-0">
        <p class="font-label text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">Source</p>
        <p class="truncate font-body text-sm text-on-surface-variant">{{ platformLabel }}</p>
      </div>
      <a
        :href="normalizedUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex shrink-0 items-center gap-2 rounded-full border border-outline-variant/40 px-3 py-2 font-label text-xs font-semibold uppercase tracking-[0.14em] text-primary transition-colors hover:border-primary/40 hover:bg-primary/5"
      >
        <span class="material-symbols-outlined text-[16px]">open_in_new</span>
        <span>{{ platform === 'facebook' ? 'Open on Facebook' : 'Open source' }}</span>
      </a>
    </div>
  </div>
</template>
