<script setup>
defineProps({
  pillars: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <section id="language-lab" class="bg-surface px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
    <div class="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
      <div>
        <p class="font-label text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Heritage Preservation</p>
        <h2 class="mt-3 font-headline text-3xl font-semibold text-primary sm:text-4xl">
          Building a living archive for language, memory, and tradition
        </h2>
        <p class="mt-4 font-body text-base leading-8 text-on-surface-variant">
          Beyond names, Igalavox is preparing a long-term cultural record for proverbs, oral history, festivals, ancestral wisdom, and the everyday practices that shape Igala identity.
        </p>

        <div class="mt-8 rounded-[1.25rem] border border-outline-variant/20 bg-surface-container-low p-6">
          <p class="font-label text-xs font-semibold uppercase tracking-[0.14em] text-tertiary">Future archive direction</p>
          <p class="mt-3 font-body text-sm leading-7 text-on-surface-variant">
            Interactive language lessons, recorded oral traditions, proverb collections, festival timelines, and digital historical records will extend this platform into a home for cultural continuity.
          </p>
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <article
          v-for="pillar in pillars"
          :key="pillar.title"
          class="ambient-shadow rounded-[1.25rem] border border-outline-variant/20 bg-surface-container-lowest p-6"
        >
          <span :class="['flex h-12 w-12 items-center justify-center rounded-2xl', pillar.tone]">
            <span class="material-symbols-outlined text-[22px]">{{ pillar.icon }}</span>
          </span>
          <h3 class="mt-5 font-headline text-2xl font-semibold text-primary">{{ pillar.title }}</h3>
          <p class="mt-3 font-body text-sm leading-7 text-on-surface-variant">{{ pillar.body }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
