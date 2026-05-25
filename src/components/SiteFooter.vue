<script setup>
import BrandLogo from './BrandLogo.vue'

const currentYear = new Date().getFullYear()

const footerGroups = [
  {
    title: 'Culture',
    links: [
      { label: 'Names Archive', to: '/names' },
      { label: 'About Igalavox', to: '/about' },
      { label: 'Digital Preservation', to: '/about' },
    ],
  },
  {
    title: 'Language',
    links: [
      { label: 'Explore Names', to: '/names' },
      { label: 'Learn Igala', to: '/learn-igala' },
      { label: 'Pronunciation Archive', to: '/names' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Impact Overview', to: '/impact' },
      { label: 'Impact Stories', to: '/impact/stories' },
      { label: 'Report an Issue', to: '/impact/report' },
    ],
  },
  {
    title: 'Marketplace',
    links: [
      { label: 'Marketplace Home', to: '/marketplace' },
      { label: 'Cultural Goods', to: '/marketplace' },
      { label: 'Artisan Network', to: '/marketplace' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Contribute', to: '/contribute' },
      { label: 'Privacy', to: '/privacy' },
      { label: 'Contact Vision', to: '/about' },
    ],
  },
]
</script>

<template>
  <footer class="border-t border-secondary/10 bg-surface-container py-12 text-on-surface">
    <div class="mx-auto max-w-7xl px-4 sm:px-6">
      <div class="grid gap-10 border-b border-outline-variant/20 pb-10 lg:grid-cols-[1.1fr_1.9fr]">
        <div class="max-w-sm">
          <BrandLogo />
          <p class="mt-4 font-body text-sm leading-7 text-on-surface-variant">
            Igalavox is building a long-term digital home for Igala names, language, stories, heritage, and community visibility.
          </p>
        </div>

        <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div v-for="group in footerGroups" :key="group.title">
            <h2 class="font-label text-xs font-semibold uppercase tracking-[0.14em] text-secondary">{{ group.title }}</h2>
            <nav class="mt-4 flex flex-col gap-3">
              <RouterLink
                v-for="link in group.links"
                :key="link.label"
                :to="link.to"
                class="font-body text-sm text-on-surface-variant transition-colors duration-200 hover:text-tertiary"
              >
                {{ link.label }}
              </RouterLink>
            </nav>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-3 pt-6 md:flex-row md:items-center md:justify-between">
        <p class="font-body text-sm text-on-surface-variant">
          Copyright {{ currentYear }} Igalavox. Preserving Igala identity through language, story, and digital heritage.
        </p>
        <p class="font-label text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
          Built for continuity, memory, and community
        </p>
      </div>
    </div>
  </footer>
</template>
