<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import AppButton from '../components/AppButton.vue'
import ImpactMap from '../components/ImpactMap.vue'
import { fetchImpactReports, fetchLgas, getCategoryMeta, impactCategories, parseLocationContext } from '../services/impactService'

const reports = ref([])
const lgas = ref([])
const isLoading = ref(true)
const errorMessage = ref('')
const selectedCategory = ref('')
const selectedLga = ref('')
const verifiedOnly = ref(false)
const selectedReport = ref(null)

const selectedLocationContext = computed(() => {
  if (!selectedReport.value?.description) return []
  const context = parseLocationContext(selectedReport.value.description)
  return [
    context.nearbyLandmark && { icon: 'place', label: context.nearbyLandmark },
    context.marketName && { icon: 'storefront', label: context.marketName },
    context.schoolOrHospitalNearby && { icon: 'local_hospital', label: context.schoolOrHospitalNearby },
    context.localDescription && { icon: 'signpost', label: context.localDescription },
  ].filter(Boolean)
})

const filteredReports = computed(() => {
  return reports.value.filter((report) => {
    const matchesCategory = !selectedCategory.value || report.category === selectedCategory.value
    const matchesLga = !selectedLga.value || report.lga === selectedLga.value
    const matchesVerified = !verifiedOnly.value || report.verified
    return matchesCategory && matchesLga && matchesVerified
  })
})

function formatDate(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

async function shareReport() {
  if (!selectedReport.value) return
  const url = `${window.location.origin}/impact/stories/${selectedReport.value.id}`
  const text = selectedReport.value.title || `${getCategoryMeta(selectedReport.value.category).label} issue in ${selectedReport.value.community_name}`

  if (navigator.share) {
    await navigator.share({ title: text, text, url })
    return
  }

  await navigator.clipboard.writeText(url)
}

watch(filteredReports, (reports) => {
  if (selectedReport.value && !reports.some((report) => report.id === selectedReport.value.id)) {
    selectedReport.value = null
  }
})

onMounted(async () => {
  try {
    const [impactReports, nextLgas] = await Promise.all([fetchImpactReports(), fetchLgas()])
    reports.value = impactReports
    lgas.value = nextLgas
  } catch (error) {
    errorMessage.value = 'Unable to load impact reports.'
    console.error('Failed to fetch impact reports:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <main class="flex-grow bg-surface">
    <section class="px-4 py-12 sm:px-6 sm:py-16">
      <div class="mx-auto max-w-7xl">
        <div class="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="mb-3 font-label text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Community Impact Map</p>
            <h1 class="font-display text-4xl font-bold text-primary sm:text-5xl">Reports rooted in real places</h1>
            <p class="mt-4 max-w-2xl font-body text-base leading-7 text-on-surface-variant">
              Visualize approved impact reports across Igala land and Kogi State.
            </p>
          </div>
          <AppButton to="/impact/report"><span class="material-symbols-outlined text-[18px]">add_location_alt</span>Report an Issue</AppButton>
        </div>

        <div class="mb-5 grid gap-3 rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-4 shadow-sm lg:grid-cols-[1fr_auto] lg:items-center">
          <div class="grid gap-3 sm:grid-cols-3">
            <select
              v-model="selectedCategory"
              class="rounded-lg border border-outline-variant bg-surface px-3 py-2.5 font-body text-sm text-on-surface outline-none focus:border-secondary"
            >
              <option value="">All categories</option>
              <option v-for="category in impactCategories" :key="category.key" :value="category.key">{{ category.label }}</option>
            </select>
            <select
              v-model="selectedLga"
              class="rounded-lg border border-outline-variant bg-surface px-3 py-2.5 font-body text-sm text-on-surface outline-none focus:border-secondary"
            >
              <option value="">All LGAs</option>
              <option v-for="lga in lgas" :key="lga" :value="lga">{{ lga }}</option>
            </select>
            <label class="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface px-3 py-2.5 font-label text-sm font-semibold text-on-surface-variant">
              <input v-model="verifiedOnly" type="checkbox" class="h-4 w-4 accent-secondary" />
              Verified only
            </label>
          </div>
          <span class="font-body text-sm text-on-surface-variant">{{ filteredReports.length }} reports visible</span>
        </div>

        <p v-if="errorMessage" class="mb-4 font-body text-sm text-clay">{{ errorMessage }}</p>
        <div v-if="isLoading" class="ambient-shadow rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-12 text-center text-on-surface-variant">
          Loading impact map...
        </div>
        <div v-else class="relative ambient-shadow overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3">
          <ImpactMap :reports="filteredReports" @select="selectedReport = $event" />

          <article
            v-if="selectedReport"
            class="absolute bottom-4 left-4 right-4 z-[500] max-h-[80%] overflow-auto rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-2xl sm:left-auto sm:w-[390px]"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-label text-xs font-semibold uppercase tracking-[0.14em] text-secondary">{{ selectedReport.lga }}</p>
                <h2 class="mt-1 font-headline text-2xl font-semibold text-primary">{{ selectedReport.community_name }}</h2>
              </div>
              <button class="rounded-full p-1 text-on-surface-variant hover:bg-surface-container" type="button" @click="selectedReport = null">
                <span class="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <img
              v-if="selectedReport.image_urls?.length || selectedReport.image_url"
              :src="selectedReport.image_urls?.[0] || selectedReport.image_url"
              :alt="selectedReport.community_name"
              class="mt-4 h-40 w-full rounded-lg object-cover"
              loading="lazy"
            />

            <div class="mt-4 flex flex-wrap items-center gap-2">
              <span class="inline-flex items-center gap-1 rounded-full bg-surface-container px-3 py-1 font-label text-xs font-semibold text-primary">
                <span class="material-symbols-outlined text-[15px]">{{ getCategoryMeta(selectedReport.category).icon }}</span>
                {{ getCategoryMeta(selectedReport.category).label }}
              </span>
              <span
                :class="[
                  'inline-flex items-center gap-1 rounded-full px-3 py-1 font-label text-xs font-semibold',
                  selectedReport.verified ? 'bg-emerald-100 text-emerald-700' : 'bg-surface-container text-on-surface-variant',
                ]"
              >
                <span class="material-symbols-outlined text-[15px]">{{ selectedReport.verified ? 'verified' : 'pending' }}</span>
                {{ selectedReport.verified ? 'Verified' : 'Unverified' }}
              </span>
            </div>

            <ul v-if="selectedLocationContext.length" class="mt-4 space-y-2">
              <li
                v-for="item in selectedLocationContext"
                :key="item.label"
                class="flex items-start gap-2 rounded-lg bg-surface-container-low px-3 py-2 font-body text-sm text-on-surface-variant"
              >
                <span class="material-symbols-outlined mt-0.5 text-[16px] text-secondary">{{ item.icon }}</span>
                <span>{{ item.label }}</span>
              </li>
            </ul>

            <p class="mt-4 line-clamp-4 font-body text-sm leading-7 text-on-surface-variant">
              {{ parseLocationContext(selectedReport.description).issueDescription || selectedReport.description }}
            </p>
            <p class="mt-3 font-body text-xs text-on-surface-variant">Reported {{ formatDate(selectedReport.created_at) }}</p>
            <div class="mt-4 grid grid-cols-2 gap-2">
              <button class="inline-flex items-center justify-center gap-2 rounded border border-outline-variant px-3 py-2 font-label text-xs font-semibold text-on-surface-variant hover:bg-surface-container" type="button" @click="shareReport">
                <span class="material-symbols-outlined text-[16px]">share</span>
                Share
              </button>
              <RouterLink :to="`/impact/stories/${selectedReport.id}`" class="inline-flex items-center justify-center gap-2 rounded bg-primary px-3 py-2 font-label text-xs font-semibold text-on-primary hover:bg-primary-container">
                <span class="material-symbols-outlined text-[16px]">article</span>
                Full Story
              </RouterLink>
            </div>
          </article>
        </div>
      </div>
    </section>
  </main>
</template>
