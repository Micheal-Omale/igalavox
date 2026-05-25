<script setup>
import AppButton from '../AppButton.vue'

defineProps({
  highlights: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <section class="relative overflow-hidden border-b border-outline-variant/30 bg-surface px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(188,237,215,0.22),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(254,202,168,0.3),_transparent_32%),linear-gradient(180deg,_rgba(252,249,244,1),_rgba(240,237,233,0.9))]"></div>
    <div class="absolute left-0 top-16 h-40 w-40 rounded-full bg-primary-fixed/20 blur-3xl"></div>
    <div class="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-secondary-fixed/20 blur-3xl"></div>

    <div class="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <div class="max-w-3xl">
        <div class="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-surface-container-low px-4 py-2">
          <span class="material-symbols-outlined text-[18px] text-secondary">school</span>
          <span class="font-label text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Learn Igala</span>
        </div>

        <h1 class="mt-6 font-display text-4xl font-bold leading-tight text-primary sm:text-5xl lg:text-6xl">
          A beautiful digital home for learning Igala is on the way.
        </h1>

        <p class="mt-6 max-w-2xl font-body text-lg leading-8 text-on-surface-variant">
          We are shaping a language-learning experience rooted in pronunciation, memory, culture, and everyday expression. The first release is still in development, but the vision is already clear.
        </p>

        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
          <AppButton to="/names">
            <span class="material-symbols-outlined text-[18px]">record_voice_over</span>
            Explore Names First
          </AppButton>
          <AppButton to="/about" variant="secondary">
            <span class="material-symbols-outlined text-[18px]">info</span>
            About Igalavox
          </AppButton>
        </div>
      </div>

      <div class="relative">
        <div class="rounded-[1.75rem] border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-[0_18px_50px_rgb(92_58_33_/_0.08)]">
          <div class="rounded-[1.5rem] border border-outline-variant/20 bg-surface p-4">
            <div class="rounded-[1.25rem] bg-[linear-gradient(145deg,_rgba(11,61,46,0.98),_rgba(57,103,86,0.92))] p-5 text-white shadow-inner">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-label text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-fixed">Coming Soon</p>
                  <h2 class="mt-2 font-display text-2xl font-semibold">Speak. Hear. Remember.</h2>
                </div>
                <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <span class="material-symbols-outlined text-2xl text-primary-fixed">translate</span>
                </div>
              </div>

              <div class="mt-6 space-y-3">
                <div
                  v-for="item in highlights"
                  :key="item.title"
                  class="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/8 px-4 py-3"
                >
                  <div class="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    <span class="material-symbols-outlined text-[20px] text-primary-fixed">{{ item.icon }}</span>
                  </div>
                  <div>
                    <p class="font-label text-xs font-semibold uppercase tracking-[0.14em] text-primary-fixed/80">{{ item.kicker }}</p>
                    <p class="mt-1 font-body text-sm leading-6 text-white/90">{{ item.title }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-4 grid gap-3 sm:grid-cols-3">
              <div class="rounded-2xl bg-surface-container-low px-4 py-4">
                <p class="font-label text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">Format</p>
                <p class="mt-2 font-body text-sm leading-6 text-on-surface-variant">Short lessons, guided pronunciation, and culturally grounded examples.</p>
              </div>
              <div class="rounded-2xl bg-surface-container-low px-4 py-4">
                <p class="font-label text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">Focus</p>
                <p class="mt-2 font-body text-sm leading-6 text-on-surface-variant">Everyday speech, heritage words, and patterns that make meaning stick.</p>
              </div>
              <div class="rounded-2xl bg-surface-container-low px-4 py-4">
                <p class="font-label text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">Status</p>
                <p class="mt-2 font-body text-sm leading-6 text-on-surface-variant">Designing the first release with care, not rushing a generic course shell.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
