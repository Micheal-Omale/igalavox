<script setup>
import { computed, ref } from 'vue'
import { resolveLiveNameAudioSource, resolveNameAudioSource, useAudioPlayer } from '../composables/useAudioPlayer'
import { getDisplayName } from '../composables/useTonalNames'

const props = defineProps({
  name: {
    type: [String, Object],
    required: true,
  },
  meaning: {
    type: String,
    required: true,
  },
  story: {
    type: String,
    default: '',
  },
  tags: {
    type: Array,
    default: () => [],
  },
  gender: {
    type: String,
    default: '',
  },
  genderIcon: {
    type: String,
    default: 'person',
  },
  audioSrc: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['select'])
const { isSourceErrored, isSourceLoading, isSourcePlaying, toggleAudio: toggleSharedAudio } = useAudioPlayer()
const entry = computed(() => (typeof props.name === 'string' ? { name: props.name } : props.name || {}))
const displayName = computed(() => getDisplayName(props.name) || '')
const resolvedAudioSrc = ref(resolveNameAudioSource(entry.value, props.audioSrc))
const isPlaying = isSourcePlaying(resolvedAudioSrc)
const isLoadingAudio = isSourceLoading(resolvedAudioSrc)
const hasAudioError = isSourceErrored(resolvedAudioSrc)
const isResolvingAudio = ref(false)
const isAudioMissing = ref(false)
const audioButtonLabel = computed(() => {
  if (isAudioMissing.value) return `No pronunciation audio for ${displayName.value}`
  if (isResolvingAudio.value) return `Resolving ${displayName.value} pronunciation`
  if (hasAudioError.value) return `${displayName.value} pronunciation failed to load`
  if (isLoadingAudio.value) return `Loading ${displayName.value} pronunciation`
  return `${isPlaying.value ? 'Pause' : 'Play'} ${displayName.value} pronunciation`
})
const audioButtonTitle = computed(() => {
  if (isAudioMissing.value) return 'No audio available'
  if (isResolvingAudio.value) return 'Resolving audio source'
  if (hasAudioError.value) return 'Audio failed to load'
  return isPlaying.value ? 'Pause pronunciation' : 'Play pronunciation'
})

const handleAudioClick = async () => {
  if (!resolvedAudioSrc.value) {
    isResolvingAudio.value = true
    try {
      resolvedAudioSrc.value = await resolveLiveNameAudioSource(entry.value)
    } finally {
      isResolvingAudio.value = false
    }
  }

  if (!resolvedAudioSrc.value) {
    isAudioMissing.value = true
    return
  }

  await toggleSharedAudio(resolvedAudioSrc.value, `${displayName.value} pronunciation`)
}

const openDetails = () => {
  emit('select')
}
</script>

<template>
  <article
    class="ambient-shadow group relative cursor-pointer overflow-hidden rounded-[1.5rem] border border-secondary/12 bg-surface-container-lowest shadow-[0_10px_28px_-24px_rgb(92_58_33_/_0.18)] transform-gpu transition-[transform,box-shadow] duration-500 ease-out hover:scale-[1.015] hover:shadow-[0_22px_48px_-28px_rgb(92_58_33_/_0.32)] focus:outline-none focus-visible:ring-2 focus-visible:ring-tertiary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    role="button"
    tabindex="0"
    @click="openDetails"
    @keydown.enter.prevent="openDetails"
    @keydown.space.prevent="openDetails"
  >
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,86,59,0.18),transparent_56%),radial-gradient(circle_at_bottom,rgba(203,167,47,0.12),transparent_44%)] opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"></div>
    <div class="h-1.5 bg-[linear-gradient(90deg,#f2c94c_0%,#f2994a_45%,#d95f36_100%)]"></div>
    <div class="px-6 py-6 sm:px-7 sm:py-7">
      <div class="mb-5 flex items-start justify-between gap-4">
        <div class="flex min-w-0 items-center gap-2">
          <span
            v-if="tags.length"
            class="inline-flex shrink-0 items-center rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 font-label text-[11px] font-semibold uppercase tracking-[0.12em] text-secondary"
          >
            {{ tags[0] }}
          </span>
          <span v-if="gender" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
            <span class="material-symbols-outlined text-[16px] text-secondary">{{ genderIcon }}</span>
            {{ gender }}
          </span>
        </div>
        <button
          :class="[
            'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-outline-variant/30 bg-surface-container-low text-tertiary transition-colors disabled:cursor-not-allowed disabled:opacity-40',
            isPlaying ? 'border-tertiary bg-tertiary-fixed text-on-tertiary-fixed' : 'hover:bg-tertiary-fixed/20',
          ]"
          type="button"
          :aria-label="audioButtonLabel"
          :aria-busy="isLoadingAudio || isResolvingAudio"
          :disabled="isAudioMissing"
          :title="audioButtonTitle"
          @click.stop="handleAudioClick"
        >
          <span
            v-if="isResolvingAudio || isLoadingAudio"
            class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          ></span>
          <span v-else class="material-symbols-outlined text-[18px]">
            {{ hasAudioError ? 'volume_off' : isPlaying ? 'pause' : 'volume_up' }}
          </span>
        </button>
      </div>

      <h3 class="font-headline text-[2rem] font-semibold leading-none tracking-[-0.02em] text-primary sm:text-[2.25rem]">
        {{ displayName }}
      </h3>

      <p class="mt-4 font-headline text-lg italic leading-8 text-earth sm:text-xl">
        {{ meaning }}
      </p>

      <p v-if="story" class="mt-5 max-h-24 overflow-hidden font-body text-sm leading-7 text-on-surface-variant">
        {{ story }}
      </p>

      <div class="mt-6 border-t border-outline-variant/20 pt-5">
        <p class="font-label text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">
          Open record for more context
        </p>
      </div>
    </div>
  </article>
</template>
