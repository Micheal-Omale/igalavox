<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppButton from '../components/AppButton.vue'
import SocialEmbed from '../components/SocialEmbed.vue'
import { fetchImpactStory, getCategoryMeta } from '../services/impactService'
import { fetchEvidenceForReport } from '../services/evidenceService'

const route = useRoute()
const story = ref(null)
const isLoading = ref(true)
const errorMessage = ref('')
const linkedEvidence = ref(null)

const category = computed(() => getCategoryMeta(story.value?.category))

function formatDate(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

async function loadStory(storyId) {
  if (!storyId) return

  isLoading.value = true
  errorMessage.value = ''
  story.value = null
  linkedEvidence.value = null

  try {
    // Yield a microtask so the Supabase client's auth state can settle
    await new Promise((resolve) => setTimeout(resolve, 0))

    let fetched = await fetchImpactStory(storyId)

    // Retry once if the story wasn't found — covers auth-race window
    if (!fetched) {
      await new Promise((resolve) => setTimeout(resolve, 350))
      fetched = await fetchImpactStory(storyId)
    }

    story.value = fetched
    if (!fetched) {
      errorMessage.value = 'Impact story not found.'
      return
    }

    const evidenceItems = await fetchEvidenceForReport(fetched.id)
    linkedEvidence.value = evidenceItems[0] || null
  } catch (error) {
    errorMessage.value = 'Unable to load this impact story.'
    console.error('Failed to fetch impact story:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => loadStory(route.params.id))

// Re-fetch when navigating between different stories without unmounting
watch(() => route.params.id, (newId) => {
  if (newId) loadStory(newId)
})
</script>

<template>
  <main class="flex-grow bg-surface">
    <section class="px-4 py-12 sm:px-6 sm:py-16">
      <div class="mx-auto max-w-4xl">
        <RouterLink to="/impact/stories" class="mb-8 inline-flex items-center gap-1 font-label text-sm font-semibold text-tertiary hover:underline">
          <span class="material-symbols-outlined text-sm">arrow_back</span>
          Back to Stories
        </RouterLink>

        <div v-if="isLoading" class="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-12 text-center text-on-surface-variant">
          Loading story...
        </div>
        <div v-else-if="errorMessage" class="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-12 text-center">
          <p class="font-body text-clay">{{ errorMessage }}</p>
        </div>
        <article v-else class="overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest">
          <div class="p-6 sm:p-8">
            <div class="mb-4 flex flex-wrap items-center gap-3 text-sm text-on-surface-variant">
              <span class="inline-flex items-center gap-1 rounded-full bg-primary-container/10 px-3 py-1 font-label font-semibold text-primary">
                <span class="material-symbols-outlined text-[16px]">{{ category.icon }}</span>
                {{ category.label }}
              </span>
              <span>{{ story.community_name }}, {{ story.lga }}</span>
              <span>{{ formatDate(story.created_at) }}</span>
            </div>
            <h1 class="font-display text-3xl font-bold text-primary sm:text-4xl">{{ story.title || story.community_name }}</h1>
            <p class="mt-5 whitespace-pre-line font-body text-base leading-8 text-on-surface-variant">{{ story.description }}</p>

            <section v-if="linkedEvidence" class="mt-8 overflow-hidden rounded-[1.5rem] border border-outline-variant/25 bg-surface-container-low shadow-[0_18px_40px_-34px_rgb(92_58_33_/_0.2)]">
              <div class="border-b border-outline-variant/20 px-5 py-4 sm:px-6">
                <p class="font-label text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">Source Video</p>
                <p class="mt-1 font-body text-sm leading-6 text-on-surface-variant">
                  Original community evidence linked to this published impact story.
                </p>
              </div>

              <div class="p-4 sm:p-6">
                <div class="mx-auto max-w-3xl">
                  <SocialEmbed :url="linkedEvidence.media_url" />
                </div>

                <div class="mt-5 flex flex-wrap items-center gap-3 text-xs text-on-surface-variant">
                  <span class="inline-flex items-center gap-1 rounded-full bg-primary/5 px-3 py-1 font-label font-semibold uppercase tracking-[0.12em] text-primary">
                    <span class="material-symbols-outlined text-[14px]">play_circle</span>
                    {{ linkedEvidence.media_type }}
                  </span>
                  <span v-if="linkedEvidence.community_name">{{ linkedEvidence.community_name }}</span>
                  <span v-if="linkedEvidence.lga">{{ linkedEvidence.lga }}</span>
                </div>
              </div>
            </section>

            <div v-if="story.image_urls?.length || story.image_url" class="mt-8 space-y-4">
              <div class="overflow-hidden rounded-xl bg-surface-container">
                <img :src="story.image_urls?.[0] || story.image_url" :alt="story.community_name || 'Community Impact'" class="h-72 w-full object-cover sm:h-96" />
              </div>
            </div>
            <div v-if="story.image_urls?.length > 1" class="mt-6 grid gap-3 sm:grid-cols-2">
              <img
                v-for="image in story.image_urls.slice(1)"
                :key="image"
                :src="image"
                alt="Additional impact report image"
                class="h-48 w-full rounded-xl object-cover"
                loading="lazy"
              />
            </div>

            <div class="mt-8 flex flex-col gap-3 sm:flex-row">
              <AppButton to="/impact/report"><span class="material-symbols-outlined text-[18px]">add_location_alt</span>Report Similar Issue</AppButton>
              <AppButton to="/impact/map" variant="secondary"><span class="material-symbols-outlined text-[18px]">map</span>View Map</AppButton>
            </div>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>
