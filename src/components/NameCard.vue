<script setup>
import { ref } from 'vue'

defineProps({
  name: {
    type: String,
    required: true,
  },
  meaning: {
    type: String,
    required: true,
  },
  tags: {
    type: Array,
    default: () => [],
  },
  audioSrc: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['select'])
const audio = ref(null)
const isPlaying = ref(false)
const audioError = ref(false)

const toggleAudio = async () => {
  if (!audio.value) return

  if (isPlaying.value) {
    audio.value.pause()
    audio.value.currentTime = 0
    isPlaying.value = false
    return
  }

  audio.value.currentTime = 0
  try {
    await audio.value.play()
    isPlaying.value = true
    audioError.value = false
  } catch (error) {
    console.error('Audio playback failed:', error)
    audioError.value = true
    isPlaying.value = false
  }
}

const handleEnded = () => {
  isPlaying.value = false
}

const openDetails = () => {
  emit('select')
}
</script>

<template>
  <article
    class="ambient-shadow group relative cursor-pointer overflow-hidden rounded-lg border border-secondary/15 bg-surface-container-lowest p-8 transition-shadow hover:shadow-[0_12px_28px_rgb(92_58_33_/_0.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-tertiary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    role="button"
    tabindex="0"
    @click="openDetails"
    @keydown.enter.prevent="openDetails"
    @keydown.space.prevent="openDetails"
  >
    <div class="absolute left-0 top-0 h-full w-1 bg-tertiary opacity-0 transition-opacity group-hover:opacity-100"></div>
    <div class="mb-4 flex items-start justify-between gap-4">
      <h3 class="font-headline text-2xl font-semibold leading-tight text-primary">{{ name }}</h3>
      <button
        class="rounded-full p-2 text-tertiary transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40"
        type="button"
        :aria-label="`Play ${name} pronunciation`"
        :disabled="!audioSrc || audioError"
        @click.stop="toggleAudio"
      >
        <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">
          {{ audioError ? 'volume_off' : isPlaying ? 'pause_circle' : 'play_circle' }}
        </span>
      </button>
      <audio v-if="audioSrc" ref="audio" :src="audioSrc" preload="none" @ended="handleEnded" @error="audioError = true" />
    </div>
    <p class="mb-6 font-body text-lg leading-relaxed text-on-surface">{{ meaning }}</p>
    <div class="flex flex-wrap gap-2">
      <span
        v-for="tag in tags"
        :key="tag"
        class="rounded-full bg-clay/10 px-3 py-1 font-body text-xs text-clay"
      >
        {{ tag }}
      </span>
    </div>
  </article>
</template>
