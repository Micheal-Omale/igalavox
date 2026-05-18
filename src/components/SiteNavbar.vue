<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppButton from './AppButton.vue'
import BrandLogo from './BrandLogo.vue'

const router = useRouter()
const route = useRoute()
const isMobileMenuOpen = ref(false)
const isMobileImpactOpen = ref(route.path.startsWith('/impact'))
const searchQuery = ref('')

const isImpactActive = computed(() => {
  return route.path.startsWith('/impact')
})

const impactSubLinks = [
  { label: 'Overview & Stats', to: '/impact', description: 'View real-time statistics and summaries', icon: 'insights' },
  { label: 'Interactive Map', to: '/impact/map', description: 'Explore community-reported concerns', icon: 'map' },
  { label: 'Stories Feed', to: '/impact/stories', description: 'Read verified cultural & impact stories', icon: 'article' },
  { label: 'Report an Issue', to: '/impact/report', description: 'Submit a new report from your area', icon: 'campaign' },
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
  <header class="sticky top-0 z-[1200] border-b border-outline-variant/60 bg-surface/92 text-primary shadow-sm backdrop-blur-md">
    <div class="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
      <BrandLogo image-class="block h-10 w-auto max-w-none object-contain sm:h-11" />

      <nav class="hidden items-center gap-6 font-label text-sm font-semibold md:flex">
        <!-- Home & Archive -->
        <RouterLink
          to="/"
          class="border-b-2 border-transparent pb-1 text-on-surface-variant transition-colors duration-300 hover:text-primary"
          active-class="!border-tertiary !text-primary"
        >
          Home
        </RouterLink>
        <RouterLink
          to="/names"
          class="border-b-2 border-transparent pb-1 text-on-surface-variant transition-colors duration-300 hover:text-primary"
          active-class="!border-tertiary !text-primary"
        >
          Archive
        </RouterLink>

        <!-- Impact Hover Dropdown -->
        <div class="relative group py-2">
          <RouterLink
            to="/impact"
            class="inline-flex items-center gap-1 border-b-2 border-transparent pb-1 text-on-surface-variant transition-colors duration-300 hover:text-primary"
            :class="{ '!border-tertiary !text-primary': isImpactActive }"
          >
            <span>Impact</span>
            <span class="material-symbols-outlined text-[16px] transition-transform duration-200 group-hover:rotate-180">keyboard_arrow_down</span>
          </RouterLink>
          
          <!-- Dropdown Card -->
          <div class="absolute left-1/2 -translate-x-1/2 mt-2 w-72 origin-top rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-2 shadow-lg transition-all duration-300 opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:visible z-[1300]">
            <div class="space-y-1">
              <RouterLink
                v-for="subLink in impactSubLinks"
                :key="subLink.to"
                :to="subLink.to"
                class="flex items-start gap-3 rounded-lg p-2.5 transition-colors duration-200 hover:bg-surface-container text-left"
                active-class="bg-surface-container-low"
              >
                <span class="material-symbols-outlined text-secondary mt-0.5 text-[20px]">{{ subLink.icon }}</span>
                <div>
                  <span class="block font-label text-sm font-semibold text-primary leading-none">{{ subLink.label }}</span>
                  <span class="block font-body text-xs text-on-surface-variant mt-1.5 leading-normal">{{ subLink.description }}</span>
                </div>
              </RouterLink>
            </div>
          </div>
        </div>

        <!-- About & Contribute -->
        <RouterLink
          to="/about"
          class="border-b-2 border-transparent pb-1 text-on-surface-variant transition-colors duration-300 hover:text-primary"
          active-class="!border-tertiary !text-primary"
        >
          About
        </RouterLink>
        <RouterLink
          to="/contribute"
          class="border-b-2 border-transparent pb-1 text-on-surface-variant transition-colors duration-300 hover:text-primary"
          active-class="!border-tertiary !text-primary"
        >
          Contribute
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

    <!-- Mobile Navigation Drawer -->
    <div
      v-if="isMobileMenuOpen"
      class="border-t border-outline-variant/60 bg-surface-container-lowest/95 px-4 py-4 shadow-sm backdrop-blur-md md:hidden"
    >
      <nav class="mx-auto flex max-w-7xl flex-col gap-2">
        <RouterLink
          to="/"
          class="rounded-lg px-4 py-3 font-label text-sm font-semibold tracking-[0.05em] text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
          active-class="!bg-primary-container/10 !text-primary"
          @click="closeMobileMenu"
        >
          Home
        </RouterLink>
        <RouterLink
          to="/names"
          class="rounded-lg px-4 py-3 font-label text-sm font-semibold tracking-[0.05em] text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
          active-class="!bg-primary-container/10 !text-primary"
          @click="closeMobileMenu"
        >
          Archive
        </RouterLink>

        <!-- Impact Collapsible Accordion on Mobile -->
        <div class="w-full">
          <button
            class="flex w-full items-center justify-between rounded-lg px-4 py-3 font-label text-sm font-semibold tracking-[0.05em] transition-colors hover:bg-surface-container hover:text-primary"
            :class="isImpactActive ? 'text-primary bg-primary-container/5' : 'text-on-surface-variant'"
            @click="isMobileImpactOpen = !isMobileImpactOpen"
          >
            <span class="flex items-center gap-2">
              Impact
            </span>
            <span class="material-symbols-outlined text-[20px] transition-transform duration-200" :class="{ 'rotate-180': isMobileImpactOpen }">keyboard_arrow_down</span>
          </button>
          
          <div v-show="isMobileImpactOpen" class="pl-4 mt-1 flex flex-col gap-1 border-l-2 border-outline-variant/40 ml-4">
            <RouterLink
              v-for="subLink in impactSubLinks"
              :key="subLink.to"
              :to="subLink.to"
              class="flex items-center gap-2 rounded-lg px-4 py-2 font-label text-xs font-semibold tracking-[0.05em] text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
              active-class="!bg-primary-container/10 !text-primary"
              @click="closeMobileMenu"
            >
              <span class="material-symbols-outlined text-[16px] text-secondary">{{ subLink.icon }}</span>
              {{ subLink.label }}
            </RouterLink>
          </div>
        </div>

        <RouterLink
          to="/about"
          class="rounded-lg px-4 py-3 font-label text-sm font-semibold tracking-[0.05em] text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
          active-class="!bg-primary-container/10 !text-primary"
          @click="closeMobileMenu"
        >
          About
        </RouterLink>
        <RouterLink
          to="/contribute"
          class="rounded-lg px-4 py-3 font-label text-sm font-semibold tracking-[0.05em] text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
          active-class="!bg-primary-container/10 !text-primary"
          @click="closeMobileMenu"
        >
          Contribute
        </RouterLink>

        <form @submit.prevent="handleSearch" class="relative mt-3 w-full max-w-64 self-center">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input
            v-model="searchQuery"
            class="w-full rounded-full border border-outline-variant bg-surface-container-low py-2 pl-10 pr-4 font-body text-base text-on-surface outline-none transition focus:border-tertiary focus:ring-1 focus:ring-tertiary"
            placeholder="Search names..."
            type="search"
          />
        </form>
      </nav>
    </div>
  </header>
</template>
