<script setup>
import AppButton from '../AppButton.vue'

defineProps({
  features: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <section id="ecosystem" class="bg-surface px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
    <div class="mx-auto max-w-7xl">
      <div class="mb-10 max-w-3xl">
        <p class="font-label text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Ecosystem</p>
        <h2 class="mt-3 font-headline text-3xl font-semibold text-primary sm:text-4xl">
          One platform, many pathways into Igala culture
        </h2>
        <p class="mt-4 font-body text-base leading-8 text-on-surface-variant">
          Igalavox is growing from a names archive into a cultural ecosystem where language, community visibility, storytelling, and heritage preservation can live together.
        </p>
      </div>

      <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="feature in features"
          :key="feature.title"
          class="ambient-shadow flex h-full flex-col rounded-[1.25rem] border border-outline-variant/20 bg-surface-container-lowest p-6"
        >
          <div class="flex items-start justify-between gap-4">
            <span :class="['flex h-14 w-14 items-center justify-center rounded-2xl', feature.tone]">
              <span class="material-symbols-outlined text-[24px]">{{ feature.icon }}</span>
            </span>
            <span
              v-if="feature.badge"
              class="rounded-full border border-secondary/20 bg-secondary-container/20 px-3 py-1 font-label text-[11px] font-semibold uppercase tracking-[0.12em] text-secondary"
            >
              {{ feature.badge }}
            </span>
          </div>

          <div class="mt-5 flex-1">
            <h3 class="font-headline text-2xl font-semibold text-primary">{{ feature.title }}</h3>
            <p class="mt-3 font-body text-sm leading-7 text-on-surface-variant">{{ feature.description }}</p>
          </div>

          <div class="mt-6">
            <AppButton
              v-if="feature.to"
              :to="feature.to"
              :variant="feature.variant || 'ghost'"
              class="w-full justify-between rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-left sm:w-auto"
            >
              <span>{{ feature.cta }}</span>
              <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
            </AppButton>
            <button
              v-else
              type="button"
              class="inline-flex w-full items-center justify-between rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 font-label text-sm font-semibold tracking-[0.05em] text-on-surface-variant sm:w-auto"
            >
              <span>{{ feature.cta }}</span>
              <span class="material-symbols-outlined text-[18px]">schedule</span>
            </button>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
