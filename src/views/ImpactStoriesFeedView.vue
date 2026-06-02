<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppButton from '../components/AppButton.vue'
import ImpactStoryCardMedia from '../components/impact/ImpactStoryCardMedia.vue'
import { fetchEvidenceForReport } from '../services/evidenceService'
import { fetchImpactReports, getCategoryMeta } from '../services/impactService'

const route = useRoute()
const stories = ref([])
const isLoading = ref(true)
const errorMessage = ref('')
const storyEvidenceMap = ref({})

function formatDate(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

function excerpt(text, limit = 150) {
  if (!text) return ''
  return text.length > limit ? `${text.slice(0, limit)}...` : text
}

async function loadStories() {
  isLoading.value = true
  errorMessage.value = ''
  storyEvidenceMap.value = {}

  try {
    // Yield a microtask so the Supabase client's auth state can settle after
    // the initial getSession() call that App.vue fires on mount. Without this,
    // the first SPA navigation can race with the auth header swap and return
    // empty results despite valid RLS policies.
    await new Promise((resolve) => setTimeout(resolve, 0))

    const fetchedStories = await fetchImpactReports({ status: 'approved' })
    stories.value = fetchedStories

    // If the first attempt returns empty but we haven't retried yet, wait
    // briefly and try once more — covers the auth‑race window.
    if (fetchedStories.length === 0) {
      await new Promise((resolve) => setTimeout(resolve, 350))
      const retried = await fetchImpactReports({ status: 'approved' })
      if (retried.length > 0) {
        stories.value = retried
      }
    }

    if (stories.value.length) {
      const evidenceEntries = await Promise.all(
        stories.value.map(async (story) => {
          const linkedEvidence = await fetchEvidenceForReport(story.id)
          return [story.id, linkedEvidence[0] || null]
        })
      )
      storyEvidenceMap.value = Object.fromEntries(evidenceEntries)
    }
  } catch (error) {
    errorMessage.value = 'Unable to load impact stories.'
    console.error('Failed to fetch impact stories:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(loadStories)

// Re-fetch when navigating back to this route (e.g. browser back button)
// so data is always fresh without requiring a hard refresh.
watch(() => route.fullPath, (newPath) => {
  if (newPath === '/impact/stories') {
    loadStories()
  }
})
</script>

<template>
  <main class="flex-grow bg-surface">
    <section class="px-4 py-12 sm:px-6 sm:py-16">
      <div class="mx-auto max-w-7xl">
        <div class="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p class="mb-3 font-label text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Community Impact</p>
            <h1 class="font-display text-4xl font-bold text-primary sm:text-5xl">Impact Stories</h1>
            <p class="mt-4 max-w-2xl font-body text-base leading-7 text-on-surface-variant">
              Verified stories highlighting challenges affecting communities across Kogi State and Igala land.
            </p>
          </div>
          <AppButton to="/impact/report" variant="secondary"><span class="material-symbols-outlined text-[18px]">add_location_alt</span>Submit Report</AppButton>
        </div>

        <p v-if="errorMessage" class="mb-4 font-body text-sm text-clay">{{ errorMessage }}</p>

        <div v-if="isLoading" class="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-12 text-center text-on-surface-variant">
          Loading stories...
        </div>
        <div v-else-if="stories.length === 0" class="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-12 text-center">
          <span class="material-symbols-outlined mb-4 text-5xl text-outline">auto_stories</span>
          <p class="font-body text-on-surface-variant">No stories published yet.</p>
        </div>
        <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <article v-for="story in stories" :key="story.id" class="ambient-shadow overflow-hidden rounded-xl border border-outline-variant/25 bg-surface-container-lowest">
            <ImpactStoryCardMedia :story="story" :evidence="storyEvidenceMap[story.id]" />
            <div class="p-5">
              <div class="mb-3 flex items-center justify-between gap-3 text-xs text-on-surface-variant">
                <span class="inline-flex items-center gap-1 font-label font-semibold text-secondary">
                  <span class="material-symbols-outlined text-[15px]">{{ getCategoryMeta(story.category).icon }}</span>
                  {{ getCategoryMeta(story.category).label }}
                </span>
                <span>{{ formatDate(story.created_at) }}</span>
              </div>
              <h2 class="font-headline text-xl font-semibold text-primary">{{ story.title || story.community_name }}</h2>
              <p class="mt-1 font-body text-xs uppercase tracking-[0.12em] text-on-surface-variant">{{ story.community_name }}, {{ story.lga }}</p>
              <p class="mt-2 font-body text-sm leading-6 text-on-surface-variant">{{ excerpt(story.description) }}</p>
              <RouterLink :to="`/impact/stories/${story.id}`" class="mt-5 inline-flex items-center gap-1 font-label text-sm font-semibold text-tertiary hover:underline">
                Read Story
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </RouterLink>
            </div>
          </article>
        </div>
      </div>
    </section>
  </main>
</template>
