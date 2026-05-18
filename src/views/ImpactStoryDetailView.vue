<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppButton from '../components/AppButton.vue'
import { fetchImpactStory, getCategoryMeta } from '../services/impactService'

const route = useRoute()
const story = ref(null)
const isLoading = ref(true)
const errorMessage = ref('')

const category = computed(() => getCategoryMeta(story.value?.category))

function formatDate(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

onMounted(async () => {
  try {
    story.value = await fetchImpactStory(route.params.id)
    if (!story.value) errorMessage.value = 'Impact story not found.'
  } catch (error) {
    errorMessage.value = 'Unable to load this impact story.'
    console.error('Failed to fetch impact story:', error)
  } finally {
    isLoading.value = false
  }
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
          <div v-if="story.image_urls?.length || story.image_url" class="h-72 bg-surface-container sm:h-96">
            <img :src="story.image_urls?.[0] || story.image_url" :alt="story.community_name || 'Community Impact'" class="h-full w-full object-cover" />
          </div>
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
            <div v-if="story.image_urls?.length > 1" class="mt-6 grid gap-3 sm:grid-cols-2">
              <img
                v-for="image in story.image_urls.slice(1)"
                :key="image"
                :src="image"
                alt="Additional community impact evidence"
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
