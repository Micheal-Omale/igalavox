<script setup>
import BrandLogo from './BrandLogo.vue'

const currentYear = new Date().getFullYear()

const links = [
  { label: 'About Project', to: '/about' },
  { label: 'About', to: '/about' },
  { label: 'History', to: '/history' },
  { label: 'Privacy', to: '/privacy' },
]
</script>

<template>
  <footer class="border-t border-secondary/10 bg-surface-container py-10 font-serif text-sm italic text-on-surface">
    <div class="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-center md:justify-between">
      <BrandLogo />
      <p class="text-center text-on-surface-variant md:text-left">
        Copyright {{ currentYear }} igalavox Archive. Preserving cultural lineage.
      </p>
      <nav class="flex flex-wrap gap-5 md:justify-end">
        <RouterLink
          v-for="link in links"
          :key="link.label"
          :to="link.to"
          class="text-on-surface-variant underline underline-offset-4 transition-colors duration-200 hover:text-tertiary"
        >
          {{ link.label }}
        </RouterLink>
      </nav>
    </div>
  </footer>
</template>
