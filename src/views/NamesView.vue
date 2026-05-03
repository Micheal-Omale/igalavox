<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import HeritageDivider from '../components/HeritageDivider.vue'
import NameCard from '../components/NameCard.vue'
import NameDetailModal from '../components/NameDetailModal.vue'
import SearchPanel from '../components/SearchPanel.vue'
import attahAudio from '../assets/audio/Attah.m4a'
import enefolaAudio from '../assets/audio/Enefola.m4a'
import ojonugwaAudio from '../assets/audio/Ojonugwa.m4a'
import ikojoAudio from '../assets/audio/Ikojo U.m4a'
import enyojoAudio from '../assets/audio/enyojo U.m4a'

const route = useRoute()
const searchQuery = ref(route.query.q || '')
const selectedName = ref(null)

const names = [
  {
    name: 'Enefola',
    meaning: '"God is the greatest" or "God has done me well."',
    tags: ['Divine', 'Praise'],
    audioSrc: enefolaAudio,
    gender: 'Unisex',
    story: 'Enefola carries gratitude for divine goodness and protection. Families use it to remember moments of help, survival, or blessing that feel larger than human effort.',
    proverb: 'A name of praise keeps the memory of mercy alive.',
  },
  {
    name: 'Attah',
    meaning: '"Father" or "King." A title of supreme respect and royalty.',
    tags: ['Royalty', 'Masculine'],
    audioSrc: attahAudio,
    gender: 'Male',
    story: 'Attah is tied to authority, ancestry, and the royal imagination of Igala identity. It speaks of fatherhood, leadership, and the responsibility to protect a people.',
    proverb: 'Where the father stands, the lineage finds its path.',
  },
  {
    name: 'Ojonugwa',
    meaning: '"God is good." A popular name expressing gratitude.',
    tags: ['Unisex', 'Gratitude'],
    audioSrc: ojonugwaAudio,
    gender: 'Unisex',
    story: 'Ojonugwa is a declaration of faith and thanksgiving. It is often chosen to mark a season where goodness, relief, or hope became visible to the family.',
    proverb: 'Goodness remembered becomes strength for tomorrow.',
  },
  {
    name: 'Ikojo',
    meaning: "God's time or God's season.",
    tags: ['Divine', 'Timing'],
    audioSrc: ikojoAudio,
    gender: 'Unisex',
    story: 'Ikojo reflects the belief that everything happens in the perfect timing of the creator. It is often given when a child arrives after a long wait.',
    proverb: 'The clock of heaven never misses a beat.',
  },
  {
    name: 'Enyojo',
    meaning: "God's grace or favor.",
    tags: ['Divine', 'Grace'],
    audioSrc: enyojoAudio,
    gender: 'Unisex',
    story: 'Enyojo is a testimony of unmerited favor. It signifies that the child is a gift from God, given out of His infinite grace.',
    proverb: 'Grace is the rain that falls on every heart.',
  },
]

const filteredNames = computed(() => {
  if (!searchQuery.value) return names
  const q = searchQuery.value.toLowerCase()
  return names.filter(n => 
    n.name.toLowerCase().includes(q) || 
    n.meaning.toLowerCase().includes(q) ||
    n.tags.some(t => t.toLowerCase().includes(q))
  )
})

onMounted(() => {
  if (route.query.q) {
    searchQuery.value = route.query.q
  }
})
</script>

<template>
  <main class="flex-grow">
    <section class="bg-surface-container-lowest px-4 py-12 sm:px-6 sm:py-16">
      <div class="mx-auto max-w-7xl text-center">
        <h1 class="mb-4 font-display text-4xl font-bold text-primary">Igala Name Archive</h1>
        <p class="mx-auto max-w-2xl font-body text-lg text-on-surface-variant">
          Browse our collection of Igala names, their meanings, and pronunciations.
        </p>
        <SearchPanel v-model="searchQuery" />
      </div>
    </section>

    <section class="px-4 py-12 sm:px-6 sm:py-16">
      <div class="mx-auto max-w-7xl">
        <div v-if="filteredNames.length > 0" class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <NameCard
            v-for="item in filteredNames"
            :key="item.name"
            :name="item.name"
            :meaning="item.meaning"
            :tags="item.tags"
            :audio-src="item.audioSrc"
            @select="selectedName = item"
          />
        </div>
        <div v-else class="py-20 text-center">
          <span class="material-symbols-outlined mb-4 text-6xl text-outline-variant">search_off</span>
          <p class="font-display text-2xl text-on-surface-variant">No names found matching your search.</p>
          <button 
            @click="searchQuery = ''" 
            class="mt-4 text-primary underline font-label font-semibold"
          >
            Clear search
          </button>
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
  </main>
</template>
