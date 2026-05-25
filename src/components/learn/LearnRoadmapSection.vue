<script setup>
defineProps({
  pillars: {
    type: Array,
    default: () => [],
  },
  roadmap: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <section class="bg-surface-container-low px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
    <div class="mx-auto max-w-7xl">
      <div class="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div class="rounded-[1.75rem] border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm sm:p-8">
          <p class="font-label text-xs font-semibold uppercase tracking-[0.18em] text-secondary">What It Will Feel Like</p>
          <h2 class="mt-3 font-display text-3xl font-semibold text-primary sm:text-4xl">Built for language, not just vocabulary lists</h2>
          <p class="mt-4 max-w-2xl font-body text-base leading-8 text-on-surface-variant">
            Learn Igala is being designed as a culturally specific learning environment where words, pronunciation, memory, and context reinforce each other.
          </p>

          <div class="mt-8 grid gap-4 sm:grid-cols-2">
            <article
              v-for="item in pillars"
              :key="item.title"
              class="rounded-2xl border border-outline-variant/20 bg-surface px-5 py-5"
            >
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl" :class="item.tone">
                <span class="material-symbols-outlined text-2xl">{{ item.icon }}</span>
              </div>
              <h3 class="mt-4 font-display text-xl font-semibold text-primary">{{ item.title }}</h3>
              <p class="mt-2 font-body text-sm leading-7 text-on-surface-variant">{{ item.description }}</p>
            </article>
          </div>
        </div>

        <div class="rounded-[1.75rem] border border-outline-variant/30 bg-[linear-gradient(180deg,_rgba(252,249,244,1),_rgba(235,232,227,0.9))] p-6 shadow-sm sm:p-8">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="font-label text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Roadmap</p>
              <h2 class="mt-3 font-display text-3xl font-semibold text-primary">Coming soon, in deliberate stages</h2>
            </div>
            <div class="hidden h-14 w-14 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-sm sm:flex">
              <span class="material-symbols-outlined text-2xl">schedule</span>
            </div>
          </div>

          <div class="mt-8 space-y-4">
            <article
              v-for="step in roadmap"
              :key="step.phase"
              class="grid gap-4 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 sm:grid-cols-[auto_1fr]"
            >
              <div class="flex items-start gap-3">
                <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-container/15 text-primary">
                  <span class="font-label text-sm font-bold">{{ step.phase }}</span>
                </div>
              </div>
              <div>
                <div class="flex flex-wrap items-center gap-3">
                  <h3 class="font-display text-xl font-semibold text-primary">{{ step.title }}</h3>
                  <span class="rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 font-label text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">
                    {{ step.status }}
                  </span>
                </div>
                <p class="mt-2 font-body text-sm leading-7 text-on-surface-variant">{{ step.description }}</p>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
