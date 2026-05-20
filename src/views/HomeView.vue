<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '../components/AppButton.vue'
import CulturalHeritageSection from '../components/home/CulturalHeritageSection.vue'
import EcosystemFeatureSection from '../components/home/EcosystemFeatureSection.vue'
import HomeHeroSection from '../components/home/HomeHeroSection.vue'
import ImpactStoriesPreviewSection from '../components/home/ImpactStoriesPreviewSection.vue'
import MarketplaceTeaserSection from '../components/home/MarketplaceTeaserSection.vue'
import HeritageDivider from '../components/HeritageDivider.vue'
import NameCard from '../components/NameCard.vue'
import NameDetailModal from '../components/NameDetailModal.vue'
import attahAudio from '../assets/audio/Attah.m4a'
import enefolaAudio from '../assets/audio/Enefola.m4a'
import ojonugwaAudio from '../assets/audio/Ojonugwa.m4a'
import { fetchImpactReports } from '../services/impactService'

const router = useRouter()
const heroImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCGx09habYTALPdHDiFHdU0l6gN2luQiGRsJkKbDuODFYu37RxVryvzdCyiHJ-GQ_SVo4JIzRw5BrIFI8Fng1u-F0pZinjBSmOw568fCbu4OqD6HPgs_ZmFUGhK0EOrWbLXQIzx9bl1aTSPtHipKFOKaASj7AAtpojuPe0l1JsH_A1bwnehMXb5HWTg6ZAS0SYmKLVa0J1OUZshoRP2qSrYEq2QIBtX34qcsB3JAeaMt1NyCZtJQk3Wbw92FLAv25na3JpuWhWtG-B'
const selectedName = ref(null)
const searchQuery = ref('')
const impactStories = ref([])
const isStoriesLoading = ref(true)

const featuredNames = [
  {
    name: 'Enefola',
    meaning: '"Who finds trouble."',
    tags: ['Life', 'Experience'],
    audioSrc: enefolaAudio,
    gender: 'Unisex',
    genderIcon: 'person',
    story: 'Enefola reflects caution and lived experience, naming one who encounters trouble or difficult situations and must learn wisdom through them.',
    proverb: 'One who meets trouble also learns the path around it.',
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

const ecosystemHighlights = [
  {
    title: 'Names & Meanings',
    body: 'Search the archive, hear pronunciation, and uncover the stories behind Igala names.',
    icon: 'menu_book',
    tone: 'bg-primary-fixed text-on-primary-fixed',
  },
  {
    title: 'Community Visibility',
    body: 'Map real challenges, publish verified stories, and make overlooked communities seen.',
    icon: 'campaign',
    tone: 'bg-tertiary-fixed text-on-tertiary-fixed',
  },
  {
    title: 'Future Language Tools',
    body: 'Prepare for interactive learning, oral history, and a stronger digital Igala language presence.',
    icon: 'translate',
    tone: 'bg-secondary-fixed text-on-secondary-fixed',
  },
]

const featureModules = [
  {
    title: 'Igala Names Archive',
    description: 'Explore authentic Igala names, meanings, pronunciations, and origin stories preserved in a searchable cultural archive.',
    icon: 'record_voice_over',
    cta: 'Explore archive',
    to: '/names',
    tone: 'bg-primary-fixed text-on-primary-fixed',
  },
  {
    title: 'Community Impact',
    description: 'Discover and report real community challenges across Igala land and Kogi State through maps, evidence, and local context.',
    icon: 'public',
    cta: 'View impact',
    to: '/impact',
    tone: 'bg-secondary-fixed text-on-secondary-fixed',
  },
  {
    title: 'Impact Stories',
    description: 'Read verified human-centered stories from underserved communities and follow how place, dignity, and heritage intersect.',
    icon: 'article',
    cta: 'Read stories',
    to: '/impact/stories',
    tone: 'bg-tertiary-fixed text-on-tertiary-fixed',
  },
  {
    title: 'Learn Igala',
    description: 'A future interactive language learning experience inspired by modern educational platforms and rooted in cultural continuity.',
    icon: 'school',
    cta: 'See vision',
    to: '/about',
    tone: 'bg-primary-container/15 text-primary',
  },
  {
    title: 'Cultural Marketplace',
    description: 'Discover books, crafts, art, fabrics, fashion, and heritage-centered cultural products through a curated marketplace experience.',
    icon: 'storefront',
    cta: 'Enter marketplace',
    to: '/marketplace',
    tone: 'bg-secondary-container/40 text-secondary',
  },
]

const heritagePillars = [
  {
    title: 'Proverbs & Wisdom',
    body: 'Preserve sayings, reflections, and symbolic language that carry generations of memory.',
    icon: 'format_quote',
    tone: 'bg-tertiary-fixed text-on-tertiary-fixed',
  },
  {
    title: 'Oral History',
    body: 'Document family stories, ancestral accounts, and the voices that shaped Igala identity.',
    icon: 'mic',
    tone: 'bg-primary-fixed text-on-primary-fixed',
  },
  {
    title: 'Festivals & Traditions',
    body: 'Build a digital record of ceremonies, rites, and seasonal practices that define communal life.',
    icon: 'celebration',
    tone: 'bg-secondary-fixed text-on-secondary-fixed',
  },
  {
    title: 'Historical Archives',
    body: 'Prepare an enduring foundation for texts, timelines, and future heritage collections.',
    icon: 'history_edu',
    tone: 'bg-surface-container-high text-secondary',
  },
]

function handleSearch() {
  router.push({
    path: '/names',
    query: { q: searchQuery.value },
  })
}

onMounted(async () => {
  try {
    impactStories.value = await fetchImpactReports({ status: 'approved', limit: 3 })
  } catch (error) {
    console.error('Failed to load homepage impact stories:', error)
  } finally {
    isStoriesLoading.value = false
  }
})
</script>

<template>
  <main class="flex-grow">
    <HomeHeroSection
      :hero-image="heroImage"
      :search-query="searchQuery"
      :highlights="ecosystemHighlights"
      @update:search-query="searchQuery = $event"
      @search="handleSearch"
    />

    <EcosystemFeatureSection :features="featureModules" />

    <section class="bg-surface px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div class="mx-auto max-w-7xl">
        <div class="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div class="max-w-3xl">
            <p class="font-label text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Names Spotlight</p>
            <h2 class="mt-3 font-headline text-3xl font-semibold text-primary sm:text-4xl">Begin with names, then go deeper</h2>
            <p class="mt-4 font-body text-base leading-8 text-on-surface-variant">
              The names archive remains a core doorway into lineage, identity, and the stories that hold Igala memory together.
            </p>
          </div>
          <RouterLink class="flex items-center gap-1 font-label text-sm font-semibold tracking-[0.05em] text-tertiary hover:underline" to="/names">
            View Full Archive
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

    <ImpactStoriesPreviewSection :stories="impactStories" :is-loading="isStoriesLoading" />

    <CulturalHeritageSection :pillars="heritagePillars" />

    <MarketplaceTeaserSection />

    <section class="bg-surface px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div class="mx-auto max-w-4xl text-center">
        <p class="font-label text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Shared Future</p>
        <h2 class="mt-3 font-headline text-3xl font-semibold text-primary sm:text-4xl">
          Help shape the long-term digital future of Igala culture
        </h2>
        <p class="mt-4 font-body text-base leading-8 text-on-surface-variant">
          Contribute names, report community realities, and support a platform designed to keep identity, language, and memory visible in the modern world.
        </p>
        <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <AppButton to="/contribute">Contribute a Name</AppButton>
          <AppButton to="/impact/report" variant="secondary">Report Community Issue</AppButton>
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
