<script setup>
import AppButton from '../components/AppButton.vue'
import HeritageDivider from '../components/HeritageDivider.vue'
import LearnHeroComingSoon from '../components/learn/LearnHeroComingSoon.vue'
import LearnRoadmapSection from '../components/learn/LearnRoadmapSection.vue'

const heroHighlights = [
  { kicker: 'Pronunciation', title: 'Hear native-centered audio guidance for real sounds and rhythm.', icon: 'graphic_eq' },
  { kicker: 'Culture', title: 'Learn phrases inside stories, identity, and everyday Igala life.', icon: 'auto_stories' },
  { kicker: 'Memory', title: 'Progress through small lessons designed to be retained, not skimmed.', icon: 'neurology' },
]

const learningPillars = [
  {
    title: 'Pronunciation First',
    description: 'Audio-led learning will help users hear tonal flow, rhythm, and speaking confidence before memorizing long lists.',
    icon: 'mic',
    tone: 'bg-primary-fixed text-on-primary-fixed',
  },
  {
    title: 'Context-Rich Lessons',
    description: 'Words and expressions will be taught through greetings, family life, place, respect, ceremony, and daily conversation.',
    icon: 'forum',
    tone: 'bg-secondary-fixed text-on-secondary-fixed',
  },
  {
    title: 'Heritage-Centered Design',
    description: 'The interface is being shaped to feel rooted in Igala identity rather than copied from a generic language app template.',
    icon: 'diamond',
    tone: 'bg-tertiary-fixed text-on-tertiary-fixed',
  },
  {
    title: 'Modern, Lightweight Experience',
    description: 'Mobile-friendly learning flows, short sessions, and clean progress cues will make it easier to return consistently.',
    icon: 'phone_iphone',
    tone: 'bg-surface-container-high text-secondary',
  },
]

const roadmap = [
  {
    phase: '01',
    title: 'Foundation',
    status: 'In Design',
    description: 'We are structuring lesson flows, pronunciation patterns, and the visual language for an Igala-first learning experience.',
  },
  {
    phase: '02',
    title: 'Starter Lessons',
    status: 'Coming Soon',
    description: 'The first release will focus on greetings, common words, simple sentence building, and listening confidence for new learners.',
  },
  {
    phase: '03',
    title: 'Culture and Memory Layers',
    status: 'Planned',
    description: 'Future modules will connect language to proverbs, naming traditions, oral history, and expressions grounded in community life.',
  },
]
</script>

<template>
  <main class="flex-grow bg-surface">
    <LearnHeroComingSoon :highlights="heroHighlights" />

    <LearnRoadmapSection :pillars="learningPillars" :roadmap="roadmap" />

    <section class="bg-surface px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div class="mx-auto max-w-5xl rounded-[2rem] border border-outline-variant/30 bg-[linear-gradient(135deg,_rgba(11,61,46,0.96),_rgba(124,86,59,0.95))] px-6 py-10 text-center text-white shadow-[0_24px_70px_rgb(92_58_33_/_0.14)] sm:px-10">
        <p class="font-label text-xs font-semibold uppercase tracking-[0.18em] text-primary-fixed">Coming Soon</p>
        <h2 class="mt-3 font-display text-3xl font-semibold sm:text-4xl">The language page is live. The learning experience is next.</h2>
        <p class="mx-auto mt-4 max-w-3xl font-body text-base leading-8 text-white/80">
          Until the full course arrives, the names archive remains the best doorway into pronunciation, meaning, and cultural memory across Igalavox.
        </p>

        <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <AppButton to="/names" class="!bg-surface !text-primary hover:!bg-surface-container-low">
            <span class="material-symbols-outlined text-[18px]">menu_book</span>
            Browse Names Archive
          </AppButton>
          <AppButton to="/contribute" variant="secondary" class="!border-white/40 !text-white hover:!bg-white/10">
            <span class="material-symbols-outlined text-[18px]">celebration</span>
            Support the Vision
          </AppButton>
        </div>
      </div>
    </section>

    <HeritageDivider />
  </main>
</template>
