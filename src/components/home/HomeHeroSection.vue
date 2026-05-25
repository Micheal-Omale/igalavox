<script setup>
import AppButton from '../AppButton.vue'
import SearchPanel from '../SearchPanel.vue'

defineProps({
  heroImage: {
    type: String,
    required: true,
  },
  searchQuery: {
    type: String,
    default: '',
  },
  highlights: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['update:searchQuery', 'search'])
</script>

<template>
  <section class="relative overflow-hidden bg-surface-container-lowest px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
    <div class="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_top_left,rgba(203,167,47,0.18),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(57,103,86,0.18),transparent_32%)]"></div>
    <div class="absolute inset-0 -z-20 texture-bg opacity-80"></div>
    <img
      :src="heroImage"
      alt="Warm Igala-inspired visual texture"
      class="absolute inset-0 -z-10 h-full w-full object-cover opacity-12"
      loading="lazy"
    />

    <div class="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
      <div class="max-w-3xl">
        <p class="mb-4 font-label text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
          The Digital Home of Igala Culture
        </p>
        <h1 class="max-w-4xl font-display text-4xl font-bold leading-tight text-primary sm:text-5xl lg:text-[58px]">
          Preserving Igala Identity Through Technology
        </h1>
        <p class="mt-5 max-w-2xl font-body text-base leading-8 text-on-surface-variant sm:text-lg">
          Explore names and meanings, hear authentic pronunciations, discover community stories, learn the Igala language, and help preserve living heritage for generations to come.
        </p>

        <SearchPanel
          :model-value="searchQuery"
          @update:model-value="$emit('update:searchQuery', $event)"
          @search="$emit('search')"
        />

        <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <AppButton to="/names">Explore Names</AppButton>
          <AppButton to="/impact" variant="secondary">Community Impact</AppButton>
          <AppButton to="/learn-igala" variant="secondary">
            <span class="material-symbols-outlined text-[18px]">language</span>
            Learn Igala
          </AppButton>
        </div>
      </div>

      <div class="relative">
        <div class="ambient-shadow overflow-hidden rounded-[1.5rem] border border-secondary/10 bg-surface-container-lowest p-5 sm:p-6">
          <div class="rounded-[1.25rem] border border-outline-variant/30 bg-surface p-5 sm:p-6">
            <div class="flex items-center justify-between gap-4 border-b border-outline-variant/25 pb-4">
              <div>
                <p class="font-label text-xs font-semibold uppercase tracking-[0.14em] text-tertiary">Ecosystem Snapshot</p>
                <h2 class="mt-2 font-headline text-2xl font-semibold text-primary">Culture, language, community</h2>
              </div>
              <span class="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-on-primary">
                <span class="material-symbols-outlined text-[22px]">auto_stories</span>
              </span>
            </div>

            <div class="mt-5 space-y-3">
              <article
                v-for="highlight in highlights"
                :key="highlight.title"
                class="rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-4"
              >
                <div class="flex items-start gap-3">
                  <span :class="['mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', highlight.tone]">
                    <span class="material-symbols-outlined text-[20px]">{{ highlight.icon }}</span>
                  </span>
                  <div>
                    <h3 class="font-headline text-xl font-semibold text-primary">{{ highlight.title }}</h3>
                    <p class="mt-1 font-body text-sm leading-6 text-on-surface-variant">{{ highlight.body }}</p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
