<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppButton from '../components/AppButton.vue'
import ImpactCommunityEvidenceSection from '../components/impact/ImpactCommunityEvidenceSection.vue'
import ImpactMap from '../components/ImpactMap.vue'
import { fetchImpactReports, fetchImpactStats, hasCoordinates } from '../services/impactService'

const route = useRoute()
const stats = ref({ totalReports: 0, waterIssues: 0, electricityIssues: 0, verifiedCommunities: 0 })
const previewReports = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

const fallbackReports = [
  { id: 'sample-water', category: 'water', community_name: 'Idah', lga: 'Idah', latitude: 7.1135, longitude: 6.7385 },
  { id: 'sample-road', category: 'roads', community_name: 'Anyigba', lga: 'Dekina', latitude: 7.4934, longitude: 7.1737 },
  { id: 'sample-healthcare', category: 'healthcare', community_name: 'Ankpa', lga: 'Ankpa', latitude: 7.4025, longitude: 7.6319 },
]

const statCards = computed(() => [
  { label: 'Total Reports', value: stats.value.totalReports, icon: 'campaign', tone: 'bg-primary-container/15 text-primary' },
  { label: 'Water Issues', value: stats.value.waterIssues, icon: 'water_drop', tone: 'bg-blue-100 text-blue-700' },
  { label: 'Electricity Issues', value: stats.value.electricityIssues, icon: 'bolt', tone: 'bg-yellow-100 text-yellow-800' },
  { label: 'Verified Communities', value: stats.value.verifiedCommunities, icon: 'verified', tone: 'bg-emerald-100 text-emerald-700' },
])

const mapReports = computed(() => previewReports.value.length ? previewReports.value : fallbackReports)

async function loadImpactData() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    // Yield a microtask so the Supabase client's auth state can settle
    // after the initial getSession() call from App.vue's onMounted.
    await new Promise((resolve) => setTimeout(resolve, 0))

    const [nextStats, reports] = await Promise.all([fetchImpactStats(), fetchImpactReports({ limit: 6 })])
    stats.value = nextStats
    previewReports.value = reports.filter(hasCoordinates).slice(0, 6)

    // Retry once if reports came back empty — covers auth-race window
    if (reports.length === 0) {
      await new Promise((resolve) => setTimeout(resolve, 350))
      const [retriedStats, retriedReports] = await Promise.all([fetchImpactStats(), fetchImpactReports({ limit: 6 })])
      stats.value = retriedStats
      previewReports.value = retriedReports.filter(hasCoordinates).slice(0, 6)
    }
  } catch (error) {
    errorMessage.value = 'Impact statistics are not available yet.'
    console.error('Failed to fetch impact stats:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(loadImpactData)

// Re-fetch when navigating back to this route via SPA navigation
watch(() => route.fullPath, (newPath) => {
  if (newPath === '/impact') {
    loadImpactData()
  }
})
</script>

<template>
  <main class="flex-grow">
    <section class="relative overflow-hidden bg-surface-container-lowest px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
      <div class="absolute inset-0 -z-10 texture-bg"></div>
      <div class="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
        <div class="max-w-2xl">
          <p class="mb-4 font-label text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Community Impact</p>
          <h1 class="font-display text-4xl font-bold leading-tight text-primary sm:text-5xl lg:text-[56px]">Make Your Community Visible</h1>
          <p class="mt-5 max-w-xl font-body text-base leading-8 text-on-surface-variant sm:text-lg">
            Report issues affecting your community including water, roads, electricity, and healthcare.
          </p>
          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <AppButton to="/impact/map"><span class="material-symbols-outlined text-[18px]">map</span>View Impact Map</AppButton>
            <AppButton to="/impact/report" variant="secondary"><span class="material-symbols-outlined text-[18px]">add_location_alt</span>Report an Issue</AppButton>
          </div>
        </div>

        <div class="ambient-shadow overflow-hidden rounded-xl border border-outline-variant/30 bg-surface p-3">
          <ImpactMap :reports="mapReports" preview />
        </div>
      </div>
    </section>

    <ImpactCommunityEvidenceSection />

    <section class="bg-surface px-4 py-14 sm:px-6">
      <div class="mx-auto max-w-7xl">
        <div class="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 class="font-headline text-3xl font-semibold text-primary">Visible Needs, Shared Action</h2>
            <p class="mt-2 font-body text-sm text-on-surface-variant">Live summary from community reports.</p>
          </div>
          <p v-if="errorMessage" class="font-body text-sm text-clay">{{ errorMessage }}</p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article v-for="card in statCards" :key="card.label" class="ambient-shadow rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5">
            <div class="flex items-center justify-between gap-3">
              <span :class="['flex h-11 w-11 items-center justify-center rounded-lg', card.tone]">
                <span class="material-symbols-outlined">{{ card.icon }}</span>
              </span>
              <span v-if="isLoading" class="h-5 w-14 animate-pulse rounded bg-surface-container"></span>
            </div>
            <p class="mt-5 font-display text-3xl font-bold text-primary">{{ isLoading ? '-' : card.value }}</p>
            <p class="mt-1 font-label text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant/70">{{ card.label }}</p>
          </article>
        </div>
      </div>
    </section>
  </main>
</template>
