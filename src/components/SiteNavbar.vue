<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from './AppButton.vue'
import BrandLogo from './BrandLogo.vue'

const router = useRouter()
const isMobileMenuOpen = ref(false)
const searchQuery = ref('')

const links = [
  { label: 'Home', to: '/' },
  { label: 'Archive', to: '/names' },
  { label: 'About', to: '/about' },
  { label: 'Submit', to: '/signup' },
]

const handleSearch = () => {
  if (!searchQuery.value.trim()) return
  router.push({
    path: '/names',
    query: { q: searchQuery.value }
  })
  isMobileMenuOpen.value = false
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-outline-variant/60 bg-surface/92 text-primary shadow-sm backdrop-blur-md">
    <div class="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
      <BrandLogo image-class="block h-10 w-auto max-w-none object-contain sm:h-11" />

      <nav class="hidden items-center gap-6 font-label text-sm font-semibold md:flex">
        <RouterLink
          v-for="link in links"
          :key="link.label"
          :to="link.to"
          class="border-b-2 border-transparent pb-1 text-on-surface-variant transition-colors duration-300 hover:text-primary"
          active-class="!border-tertiary !text-primary"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <div class="hidden items-center gap-4 md:flex">
        <form @submit.prevent="handleSearch" class="relative block">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input
            v-model="searchQuery"
            class="w-56 rounded-full border border-outline-variant bg-surface-container-low py-2 pl-10 pr-4 font-body text-base text-on-surface outline-none transition focus:border-tertiary focus:ring-1 focus:ring-tertiary"
            placeholder="Search names..."
            type="search"
          />
        </form>
        <AppButton to="/signin" variant="ghost">Sign in</AppButton>
      </div>

      <div class="flex items-center gap-2 md:hidden">
        <RouterLink
          to="/signin"
          class="rounded-full border border-outline-variant px-3 py-2 font-label text-xs font-semibold tracking-[0.05em] text-secondary transition-colors hover:border-secondary hover:text-primary"
        >
          Sign in
        </RouterLink>
        <button
          class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-surface-container-lowest text-on-surface-variant transition-colors hover:text-primary"
          type="button"
          aria-label="Toggle menu"
          :aria-expanded="isMobileMenuOpen"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <span class="material-symbols-outlined">{{ isMobileMenuOpen ? 'close' : 'menu' }}</span>
        </button>
      </div>
    </div>

    <div
      v-if="isMobileMenuOpen"
      class="border-t border-outline-variant/60 bg-surface-container-lowest/95 px-4 py-4 shadow-sm backdrop-blur-md md:hidden"
    >
      <nav class="mx-auto flex max-w-7xl flex-col gap-2">
        <RouterLink
          v-for="link in links"
          :key="link.label"
          :to="link.to"
          class="rounded-lg px-4 py-3 font-label text-sm font-semibold tracking-[0.05em] text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
          active-class="!bg-primary-container/10 !text-primary"
          @click="closeMobileMenu"
        >
          {{ link.label }}
        </RouterLink>

        <form @submit.prevent="handleSearch" class="relative mt-2 block">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input
            v-model="searchQuery"
            class="w-full rounded-full border border-outline-variant bg-surface-container-low py-3 pl-10 pr-4 font-body text-base text-on-surface outline-none transition focus:border-tertiary focus:ring-1 focus:ring-tertiary"
            placeholder="Search names..."
            type="search"
          />
        </form>
      </nav>
    </div>
  </header>
</template>
