<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  images: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    default: 'Marketplace product',
  },
})

const activeIndex = ref(0)
const isLightboxOpen = ref(false)
const touchStartX = ref(0)

const displayImages = computed(() => {
  return props.images.length
    ? props.images
    : ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80']
})

function setActiveIndex(index) {
  activeIndex.value = index
}

function nextImage() {
  activeIndex.value = (activeIndex.value + 1) % displayImages.value.length
}

function previousImage() {
  activeIndex.value = (activeIndex.value - 1 + displayImages.value.length) % displayImages.value.length
}

function handleTouchStart(event) {
  touchStartX.value = event.changedTouches?.[0]?.clientX || 0
}

function handleTouchEnd(event) {
  const touchEndX = event.changedTouches?.[0]?.clientX || 0
  const delta = touchEndX - touchStartX.value

  if (Math.abs(delta) < 40) return
  if (delta < 0) nextImage()
  if (delta > 0) previousImage()
}
</script>

<template>
  <div>
    <div
      class="relative overflow-hidden rounded-[1.75rem] border border-outline-variant/20 bg-surface-container-lowest shadow-sm"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
    >
      <img
        :alt="title"
        :src="displayImages[activeIndex]"
        class="h-[25rem] w-full object-cover sm:h-[32rem]"
        loading="eager"
      />
      <div class="absolute inset-x-0 top-0 flex items-center justify-between p-4">
        <span class="rounded-full bg-primary/70 px-3 py-1 font-label text-[11px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
          {{ activeIndex + 1 }} / {{ displayImages.length }}
        </span>
        <button
          class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-primary shadow-sm transition hover:bg-white"
          type="button"
          @click="isLightboxOpen = true"
        >
          <span class="material-symbols-outlined text-[18px]">open_in_full</span>
        </button>
      </div>
      <div class="absolute inset-y-0 left-0 flex items-center p-3">
        <button
          class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-primary shadow-sm transition hover:bg-white"
          type="button"
          @click="previousImage"
        >
          <span class="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>
      </div>
      <div class="absolute inset-y-0 right-0 flex items-center p-3">
        <button
          class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-primary shadow-sm transition hover:bg-white"
          type="button"
          @click="nextImage"
        >
          <span class="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>
    </div>

    <div class="mt-4 grid grid-cols-5 gap-3">
      <button
        v-for="(image, index) in displayImages"
        :key="`${image}-${index}`"
        :class="[
          'overflow-hidden rounded-2xl border transition-all',
          activeIndex === index ? 'border-secondary shadow-sm' : 'border-outline-variant/20 hover:border-secondary/50',
        ]"
        type="button"
        @click="setActiveIndex(index)"
      >
        <img :alt="`${title} ${index + 1}`" :src="image" class="h-20 w-full object-cover" loading="lazy" />
      </button>
    </div>

    <div
      v-if="isLightboxOpen"
      class="fixed inset-0 z-[1600] flex items-center justify-center bg-primary/80 px-4 backdrop-blur-sm"
      @click.self="isLightboxOpen = false"
    >
      <div class="relative max-w-5xl">
        <button
          class="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary shadow-sm"
          type="button"
          @click="isLightboxOpen = false"
        >
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
        <img :alt="title" :src="displayImages[activeIndex]" class="max-h-[85vh] rounded-[1.75rem] object-contain shadow-2xl" />
      </div>
    </div>
  </div>
</template>
