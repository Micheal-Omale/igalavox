<script setup>
import { getCategoryMeta } from '../../services/impactService'

defineProps({
  stories: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

function excerpt(text, limit = 160) {
  if (!text) return ''
  return text.length > limit ? `${text.slice(0, limit)}...` : text
}

function formatDate(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}
</script>

<template>
  <section class="bg-surface-container-low px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
    <div class="mx-auto max-w-7xl">
      <div class="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div class="max-w-3xl">
          <p class="font-label text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Impact Stories</p>
          <h2 class="mt-3 font-headline text-3xl font-semibold text-primary sm:text-4xl">
            Human stories from communities that deserve visibility
          </h2>
          <p class="mt-4 font-body text-base leading-8 text-on-surface-variant">
            Verified reports from across Igala land help transform overlooked challenges into stories people can understand, remember, and respond to.
          </p>
        </div>
        <RouterLink to="/impact/stories" class="inline-flex items-center gap-2 font-label text-sm font-semibold tracking-[0.05em] text-tertiary hover:underline">
          View all stories
          <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
        </RouterLink>
      </div>

      <div v-if="isLoading" class="grid gap-5 lg:grid-cols-3">
        <article
          v-for="index in 3"
          :key="index"
          class="overflow-hidden rounded-[1.25rem] border border-outline-variant/20 bg-surface-container-lowest"
        >
          <div class="h-52 animate-pulse bg-surface-container"></div>
          <div class="space-y-3 p-6">
            <div class="h-4 w-28 animate-pulse rounded bg-surface-container"></div>
            <div class="h-7 w-3/4 animate-pulse rounded bg-surface-container"></div>
            <div class="h-16 animate-pulse rounded bg-surface-container"></div>
          </div>
        </article>
      </div>

      <div v-else-if="stories.length" class="grid gap-5 lg:grid-cols-3">
        <article
          v-for="story in stories"
          :key="story.id"
          class="ambient-shadow overflow-hidden rounded-[1.25rem] border border-outline-variant/20 bg-surface-container-lowest"
        >
          <div class="h-56 bg-surface-container">
            <img
              v-if="story.image_urls?.length || story.image_url"
              :src="story.image_urls?.[0] || story.image_url"
              :alt="story.community_name || 'Community story'"
              class="h-full w-full object-cover"
              loading="lazy"
            />
            <div v-else class="flex h-full items-center justify-center text-outline">
              <span class="material-symbols-outlined text-5xl">{{ getCategoryMeta(story.category).icon }}</span>
            </div>
          </div>

          <div class="p-6">
            <div class="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant">
              <span class="inline-flex items-center gap-1 rounded-full bg-primary-container/10 px-3 py-1 font-label font-semibold text-primary">
                <span class="material-symbols-outlined text-[15px]">{{ getCategoryMeta(story.category).icon }}</span>
                {{ getCategoryMeta(story.category).label }}
              </span>
              <span>{{ formatDate(story.created_at) }}</span>
            </div>
            <h3 class="mt-4 font-headline text-2xl font-semibold leading-snug text-primary">
              {{ story.title || story.community_name }}
            </h3>
            <p class="mt-2 font-label text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
              {{ story.community_name }}, {{ story.lga }}
            </p>
            <p class="mt-4 font-body text-sm leading-7 text-on-surface-variant">
              {{ excerpt(story.description) }}
            </p>
            <RouterLink
              :to="`/impact/stories/${story.id}`"
              class="mt-6 inline-flex items-center gap-2 font-label text-sm font-semibold tracking-[0.05em] text-tertiary hover:underline"
            >
              Read Story
              <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </RouterLink>
          </div>
        </article>
      </div>

      <div v-else class="rounded-[1.25rem] border border-outline-variant/20 bg-surface-container-lowest p-10 text-center">
        <p class="font-body text-on-surface-variant">Stories will appear here as verified reports are published.</p>
      </div>
    </div>
  </section>
</template>
