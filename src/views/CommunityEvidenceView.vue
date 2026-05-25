<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import AppButton from '../components/AppButton.vue'
import SocialEmbed from '../components/SocialEmbed.vue'
import { fetchEvidence, getCategoryMeta, EVIDENCE_CATEGORIES } from '../services/evidenceService'
import { getYoutubeId } from '../utils/socialVideo'

const evidenceList = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

const filters = ref({
  category: 'all',
  lga: 'all',
  platform: 'all',
  search: ''
})

const uniqueLGAs = computed(() => {
  const lgas = new Set()
  evidenceList.value.forEach(e => {
    if (e.lga) lgas.add(e.lga)
  })
  return Array.from(lgas).sort()
})

const platforms = [
  { id: 'all', label: 'All Platforms' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'facebook', label: 'Facebook' }
]

const loadEvidence = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    evidenceList.value = await fetchEvidence(filters.value)
  } catch (error) {
    console.error('Failed to load evidence:', error)
    errorMessage.value = 'Failed to load community evidence.'
  } finally {
    isLoading.value = false
  }
}

let searchTimeout = null
watch(filters, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadEvidence()
  }, 300)
}, { deep: true })

onMounted(() => {
  loadEvidence()
})

function formatDate(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

function getYoutubeThumbnail(url) {
  const videoId = getYoutubeId(url)
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : ''
}

const activeVideo = ref(null)

const openVideo = (evidence) => {
  activeVideo.value = evidence
}

const closeVideo = () => {
  activeVideo.value = null
}
</script>

<template>
  <main class="flex-grow bg-surface">
    <!-- Hero Section -->
    <section class="bg-surface-container-lowest px-4 py-16 sm:px-6 lg:px-8 border-b border-outline-variant/30">
      <div class="mx-auto max-w-7xl text-center">
        <p class="font-label text-sm font-semibold uppercase tracking-widest text-secondary">Documenting Igala Land</p>
        <h1 class="mt-4 font-display text-4xl font-bold tracking-tight text-primary sm:text-5xl lg:text-6xl">
          Community Evidence
        </h1>
        <p class="mx-auto mt-6 max-w-2xl font-body text-lg leading-8 text-on-surface-variant">
          A public archive of real happenings, cultural events, infrastructure challenges, and community stories. Submitted by the people, for the people.
        </p>
        <div class="mt-8 flex justify-center gap-4">
          <AppButton to="/impact/evidence/submit">
            <span class="material-symbols-outlined text-[18px]">publish</span>
            Submit Evidence
          </AppButton>
        </div>
      </div>
    </section>

    <section class="px-4 py-12 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        
        <!-- Filters -->
        <div class="mb-10 flex flex-col gap-4 rounded-xl bg-surface-container-low p-4 sm:flex-row sm:items-center">
          <div class="relative flex-grow">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input 
              v-model="filters.search" 
              type="text" 
              placeholder="Search evidence..." 
              class="w-full rounded-lg border-0 bg-surface-container py-2 pl-10 pr-4 text-on-surface focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          
          <select v-model="filters.category" class="rounded-lg border-0 bg-surface-container py-2 pl-3 pr-10 text-on-surface focus:ring-2 focus:ring-brand-primary">
            <option value="all">All Categories</option>
            <option v-for="cat in EVIDENCE_CATEGORIES" :key="cat.id" :value="cat.id">{{ cat.label }}</option>
          </select>
          
          <select v-if="uniqueLGAs.length > 0" v-model="filters.lga" class="rounded-lg border-0 bg-surface-container py-2 pl-3 pr-10 text-on-surface focus:ring-2 focus:ring-brand-primary">
            <option value="all">All LGAs</option>
            <option v-for="lga in uniqueLGAs" :key="lga" :value="lga">{{ lga }}</option>
          </select>

          <select v-model="filters.platform" class="rounded-lg border-0 bg-surface-container py-2 pl-3 pr-10 text-on-surface focus:ring-2 focus:ring-brand-primary">
            <option v-for="plat in platforms" :key="plat.id" :value="plat.id">{{ plat.label }}</option>
          </select>
        </div>

        <div v-if="isLoading" class="py-12 text-center text-on-surface-variant">
          Loading archive...
        </div>
        <div v-else-if="errorMessage" class="py-12 text-center text-error">
          {{ errorMessage }}
        </div>
        <div v-else-if="evidenceList.length === 0" class="py-12 text-center text-on-surface-variant">
          No evidence found matching your filters.
        </div>
        
        <!-- Grid -->
        <div v-else class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <article v-for="evidence in evidenceList" :key="evidence.id" class="flex flex-col overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-sm transition-shadow hover:shadow-md">
            <!-- Thumbnail preview area -->
            <div class="relative aspect-video w-full bg-surface-container-high group cursor-pointer" @click="openVideo(evidence)">
              <img 
                v-if="evidence.media_type === 'youtube'" 
                :src="getYoutubeThumbnail(evidence.media_url)"
                class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              />
              <div v-else class="w-full h-full flex items-center justify-center bg-tertiary-fixed text-on-tertiary-fixed opacity-80 group-hover:opacity-100 transition-opacity">
                <span class="material-symbols-outlined text-4xl">play_circle</span>
              </div>
              
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="rounded-full bg-black/60 p-3 text-white backdrop-blur-sm group-hover:scale-110 transition-transform">
                  <span class="material-symbols-outlined text-3xl">play_arrow</span>
                </div>
              </div>

              <!-- Platform Badge -->
              <div class="absolute top-3 right-3 rounded-full bg-black/70 px-3 py-1 backdrop-blur-sm">
                <span class="font-label text-xs font-semibold text-white capitalize">{{ evidence.media_type }}</span>
              </div>
            </div>

            <div class="flex flex-1 flex-col p-5">
              <div class="mb-3 flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
                <span class="inline-flex items-center gap-1 rounded bg-surface-container px-2 py-1 font-label font-medium text-primary">
                  <span class="material-symbols-outlined text-[14px]">{{ getCategoryMeta(evidence.category).icon }}</span>
                  {{ getCategoryMeta(evidence.category).label }}
                </span>
                <span v-if="evidence.lga">{{ evidence.lga }}</span>
                <span>•</span>
                <span>{{ formatDate(evidence.created_at) }}</span>
              </div>
              
              <h3 class="mb-2 font-display text-xl font-bold text-primary line-clamp-2">
                {{ evidence.title || 'Community Evidence' }}
              </h3>
              
              <p class="mb-6 flex-1 font-body text-sm text-on-surface-variant line-clamp-3">
                {{ evidence.description }}
              </p>
              
              <div class="mt-auto pt-4 border-t border-outline-variant/20 flex items-center justify-between">
                <p v-if="evidence.community_name" class="font-label text-sm font-medium text-secondary">
                  <span class="material-symbols-outlined text-[16px] align-text-bottom">location_on</span>
                  {{ evidence.community_name }}
                </p>
                <div v-else></div>
                
                <button @click="openVideo(evidence)" class="font-label text-sm font-bold text-brand-primary hover:text-brand-primary-container transition-colors">
                  Watch Evidence
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Video Modal -->
    <div v-if="activeVideo" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" @click.self="closeVideo">
      <div class="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-2xl">
        <div class="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20 bg-surface">
          <h3 class="font-display text-xl font-bold text-primary truncate pr-4">{{ activeVideo.title || 'Community Evidence' }}</h3>
          <button @click="closeVideo" class="rounded-full p-2 text-on-surface-variant hover:bg-surface-container transition-colors flex-shrink-0">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto bg-surface-container-low p-0 sm:p-6">
          <div class="mx-auto w-full max-w-4xl overflow-hidden rounded-xl bg-black shadow-lg">
            <SocialEmbed :url="activeVideo.media_url" :autoplay="true" />
          </div>
          <div class="mx-auto mt-6 max-w-4xl rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6">
            <div class="flex flex-wrap items-center gap-3 text-sm text-on-surface-variant mb-4">
              <span class="inline-flex items-center gap-1 rounded bg-surface-container px-2 py-1 font-label font-medium text-primary">
                <span class="material-symbols-outlined text-[14px]">{{ getCategoryMeta(activeVideo.category).icon }}</span>
                {{ getCategoryMeta(activeVideo.category).label }}
              </span>
              <span v-if="activeVideo.lga">{{ activeVideo.lga }}</span>
              <span class="capitalize text-secondary font-semibold border border-secondary/20 px-2 rounded">{{ activeVideo.media_type }}</span>
            </div>
            <p class="font-body text-base leading-relaxed text-on-surface-variant whitespace-pre-line">{{ activeVideo.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
