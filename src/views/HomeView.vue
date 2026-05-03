<script setup>
import { ref } from 'vue'
import AppButton from '../components/AppButton.vue'
import HeritageDivider from '../components/HeritageDivider.vue'
import NameCard from '../components/NameCard.vue'
import NameDetailModal from '../components/NameDetailModal.vue'
import SearchPanel from '../components/SearchPanel.vue'
import attahAudio from '../assets/audio/Attah.m4a'
import enefolaAudio from '../assets/audio/Enefola.m4a'
import ojonugwaAudio from '../assets/audio/Ojonugwa.m4a'

const heroImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCGx09habYTALPdHDiFHdU0l6gN2luQiGRsJkKbDuODFYu37RxVryvzdCyiHJ-GQ_SVo4JIzRw5BrIFI8Fng1u-F0pZinjBSmOw568fCbu4OqD6HPgs_ZmFUGhK0EOrWbLXQIzx9bl1aTSPtHipKFOKaASj7AAtpojuPe0l1JsH_A1bwnehMXb5HWTg6ZAS0SYmKLVa0J1OUZshoRP2qSrYEq2QIBtX34qcsB3JAeaMt1NyCZtJQk3Wbw92FLAv25na3JpuWhWtG-B'
const selectedName = ref(null)

const featuredNames = [
  {
    name: 'Enefola',
    meaning: '"God is the greatest" or "God has done me well."',
    tags: ['Divine', 'Praise'],
    audioSrc: enefolaAudio,
    gender: 'Unisex',
    genderIcon: 'person',
    story: 'Enefola carries gratitude for divine goodness and protection. Families use it to remember moments of help, survival, or blessing that feel larger than human effort.',
    proverb: 'A name of praise keeps the memory of mercy alive.',
  },
  {
    name: 'Attah',
    meaning: '"Father" or "King." A title of supreme respect and royalty.',
    tags: ['Royalty', 'Masculine'],
    audioSrc: attahAudio,
    gender: 'Male',
    genderIcon: 'male',
    story: 'Attah is tied to authority, ancestry, and the royal imagination of Igala identity. It speaks of fatherhood, leadership, and the responsibility to protect a people.',
    proverb: 'Where the father stands, the lineage finds its path.',
  },
  {
    name: 'Ojonugwa',
    meaning: '"God is good." A popular name expressing gratitude.',
    tags: ['Unisex', 'Gratitude'],
    audioSrc: ojonugwaAudio,
    gender: 'Unisex',
    genderIcon: 'person',
    story: 'Ojonugwa is a declaration of faith and thanksgiving. It is often chosen to mark a season where goodness, relief, or hope became visible to the family.',
    proverb: 'Goodness remembered becomes strength for tomorrow.',
  },
]

const steps = [
  {
    title: 'Search',
    body: 'Look up any Igala name using our comprehensive database.',
    icon: 'search',
    tone: 'bg-primary-fixed text-on-primary-fixed',
  },
  {
    title: 'Learn',
    body: 'Read detailed explanations of the cultural and linguistic meanings.',
    icon: 'menu_book',
    tone: 'bg-tertiary-fixed text-on-tertiary-fixed',
  },
  {
    title: 'Hear',
    body: 'Listen to authentic audio pronunciations recorded by native speakers.',
    icon: 'record_voice_over',
    tone: 'bg-secondary-fixed text-on-secondary-fixed',
  },
]

const genderOptions = [
  { label: 'Male', to: '/names?gender=male' },
  { label: 'Female', to: '/names?gender=female' },
  { label: 'Unisex', to: '/names?gender=unisex' },
]
</script>

<template>
  <main class="flex-grow">
    <section class="relative flex flex-col items-center px-4 py-16 text-center sm:px-6 sm:py-20 md:py-32">
      <div class="absolute inset-0 -z-10 bg-surface-container-lowest/80"></div>
      <img
        :src="heroImage"
        alt="Subtle African patterned background texture in earthy tones with warm lighting"
        class="absolute inset-0 -z-20 h-full w-full object-cover opacity-10"
      />

      <div class="mx-auto max-w-4xl space-y-6 sm:space-y-8">
        <h1 class="font-display text-4xl font-bold leading-tight text-primary sm:text-5xl md:text-[48px]">
          Discover the Meaning Behind Igala Names
        </h1>
        <p class="mx-auto max-w-2xl font-body text-base leading-8 text-on-surface-variant sm:text-lg">
          Explore a rich digital archive of cultural lineage. Understand the profound meanings and hear authentic native pronunciations of Igala names.
        </p>

        <SearchPanel />

        <div class="mt-6 flex flex-col justify-center gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-4">
          <AppButton to="/names" class="w-full justify-center sm:w-auto">Explore Names</AppButton>
          <div class="group relative z-30">
            <button
              class="inline-flex w-full items-center justify-center gap-2 rounded border border-secondary px-6 py-3 font-label text-sm font-semibold tracking-[0.05em] text-secondary transition-all duration-300 hover:bg-surface-container hover:shadow-[0_8px_22px_rgb(92_58_33_/_0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary sm:w-auto"
              type="button"
            >
              Gender
              <span class="material-symbols-outlined text-lg transition-transform duration-300 group-hover:rotate-180 group-focus-within:rotate-180">
                keyboard_arrow_down
              </span>
            </button>
            <div class="ambient-shadow invisible absolute left-1/2 z-50 mt-2 min-w-40 -translate-x-1/2 overflow-hidden rounded-lg border border-secondary/15 bg-surface-container-lowest p-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-1 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-1 group-focus-within:opacity-100">
              <RouterLink
                v-for="option in genderOptions"
                :key="option.label"
                :to="option.to"
                class="block rounded px-4 py-3 text-left font-label text-sm font-semibold tracking-[0.05em] text-on-surface-variant transition-colors hover:bg-tertiary-fixed hover:text-on-tertiary-fixed focus:bg-tertiary-fixed focus:text-on-tertiary-fixed focus:outline-none"
              >
                {{ option.label }}
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-surface px-4 py-16 sm:px-6 sm:py-20">
      <div class="mx-auto max-w-7xl">
        <div class="mb-10 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 class="mb-2 font-headline text-3xl font-semibold text-primary">Featured Names</h2>
            <p class="font-body text-base leading-relaxed text-on-surface-variant">
              Discover names steeped in history and tradition.
            </p>
          </div>
          <RouterLink class="flex items-center gap-1 font-label text-sm font-semibold tracking-[0.05em] text-tertiary hover:underline" to="/names">
            View All
            <span class="material-symbols-outlined text-sm">arrow_forward</span>
          </RouterLink>
        </div>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <NameCard
            v-for="item in featuredNames"
            :key="item.name"
            :name="item.name"
            :meaning="item.meaning"
            :tags="item.tags"
            :audio-src="item.audioSrc"
            @select="selectedName = item"
          />
        </div>
      </div>
    </section>

    <NameDetailModal
      v-if="selectedName"
      :name="selectedName"
      :audio-src="selectedName.audioSrc"
      @close="selectedName = null"
    />

    <HeritageDivider />

    <section class="bg-surface-container-low px-4 py-16 sm:px-6 sm:py-20">
      <div class="mx-auto max-w-7xl text-center">
        <h2 class="mb-12 font-headline text-3xl font-semibold text-primary md:mb-16">How to Use the Archive</h2>
        <div class="relative grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-12">
          <div class="absolute left-[15%] right-[15%] top-1/2 z-0 hidden h-px -translate-y-1/2 bg-surface-variant md:block"></div>

          <article
            v-for="step in steps"
            :key="step.title"
            class="ambient-shadow relative z-10 flex flex-col items-center rounded-lg bg-surface-container-lowest p-6 sm:p-8"
          >
            <div :class="['mb-6 flex h-16 w-16 items-center justify-center rounded-full', step.tone]">
              <span class="material-symbols-outlined text-3xl">{{ step.icon }}</span>
            </div>
            <h3 class="mb-3 font-headline text-2xl font-semibold text-primary">{{ step.title }}</h3>
            <p class="text-center font-body text-base leading-relaxed text-on-surface-variant">
              {{ step.body }}
            </p>
          </article>
        </div>
      </div>
    </section>
  </main>
</template>
