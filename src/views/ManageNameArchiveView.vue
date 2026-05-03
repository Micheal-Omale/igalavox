<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import BrandLogo from '../components/BrandLogo.vue'

const isMobileMenuOpen = ref(false)
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')

const navItems = [
  { label: 'Dashboard', icon: 'dashboard', to: '/admin', active: false },
  { label: 'Names', icon: 'menu_book', to: '/admin/names', active: true },
  { label: 'Add New Name', icon: 'add_circle', to: '/admin', active: false },
  { label: 'Settings', icon: 'settings', to: '/admin/names', active: false },
]

const names = [
  {
    name: 'Achenyo',
    meaning: 'The one who causes joy or brings happiness to the family.',
    category: 'Descriptive',
    categoryTone: 'bg-secondary-container text-on-secondary-container border-secondary/20',
    status: 'Published',
    statusTone: 'bg-primary-container',
    dateAdded: 'Oct 12, 2023',
    initials: 'A',
    avatarTone: 'bg-primary-container text-on-primary-container',
  },
  {
    name: 'Ojochide',
    meaning: "God's protection or under God's covering.",
    category: 'Spiritual',
    categoryTone: 'bg-clay/10 text-clay border-clay/20',
    status: 'Published',
    statusTone: 'bg-primary-container',
    dateAdded: 'Oct 10, 2023',
    initials: 'O',
    avatarTone: 'bg-tertiary-container text-on-tertiary-container',
  },
  {
    name: 'Eleojo',
    meaning: 'Gift of God.',
    category: 'Spiritual',
    categoryTone: 'bg-clay/10 text-clay border-clay/20',
    status: 'Draft',
    statusTone: 'bg-outline',
    dateAdded: 'Oct 08, 2023',
    initials: 'E',
    avatarTone: 'bg-secondary-fixed text-on-secondary-fixed',
  },
  {
    name: 'Attah',
    meaning: 'Father or King (Title often used as a name).',
    category: 'Royal',
    categoryTone: 'bg-tertiary-container text-on-tertiary-container border-tertiary/20',
    status: 'Published',
    statusTone: 'bg-primary-container',
    dateAdded: 'Oct 05, 2023',
    initials: 'A',
    avatarTone: 'bg-primary-fixed-dim text-on-primary-fixed',
  },
]

const filteredNames = computed(() => {
  return names.filter((entry) => {
    const matchesSearch = !searchQuery.value
      || entry.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      || entry.meaning.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesCategory = !selectedCategory.value || entry.category.toLowerCase() === selectedCategory.value
    const matchesStatus = !selectedStatus.value || entry.status.toLowerCase() === selectedStatus.value

    return matchesSearch && matchesCategory && matchesStatus
  })
})

const tableSummary = computed(() => {
  if (!filteredNames.value.length) return 'No matching names'
  return `Showing 1-${filteredNames.value.length} of ${filteredNames.value.length} names`
})
</script>

<template>
  <main class="min-h-dvh bg-background text-on-background">
    <div class="flex min-h-dvh">
      <aside class="hidden w-64 shrink-0 border-r border-outline-variant bg-surface-container-lowest md:flex md:flex-col">
        <div class="px-6 pb-8 pt-6">
          <BrandLogo
            image-class="block h-10 w-auto max-w-none object-contain"
          />
          <p class="mt-2 font-body text-sm text-on-surface-variant">Heritage Manager</p>
        </div>

        <nav class="flex-1 space-y-1 px-3">
          <RouterLink
            v-for="item in navItems"
            :key="item.label"
            :to="item.to"
            :class="[
              'flex items-center gap-3 rounded-lg px-4 py-3 font-label text-sm font-semibold transition-colors',
              item.active
                ? 'border-r-4 border-primary bg-primary-container/10 text-primary'
                : 'text-on-surface-variant hover:bg-surface-variant hover:text-primary',
            ]"
          >
            <span class="material-symbols-outlined">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </RouterLink>
        </nav>
      </aside>

      <div class="flex min-w-0 flex-1 flex-col">
        <header class="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-outline-variant bg-surface-container-lowest/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div class="flex items-center gap-4">
            <button
              class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant text-on-surface-variant transition-colors hover:text-primary md:hidden"
              type="button"
              aria-label="Open menu"
              @click="isMobileMenuOpen = true"
            >
              <span class="material-symbols-outlined">menu</span>
            </button>
            <h2 class="font-display text-xl font-bold text-primary">Heritage Admin</h2>
          </div>

          <div class="flex items-center gap-4 sm:gap-6">
            <label class="relative hidden sm:block">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
              <input
                v-model="searchQuery"
                class="w-64 rounded-full border border-outline-variant bg-surface-container-low py-1.5 pl-9 pr-4 font-body text-sm text-on-surface outline-none transition focus:border-tertiary-container focus:ring-1 focus:ring-tertiary-container"
                placeholder="Search..."
                type="text"
              />
            </label>

            <div class="flex items-center gap-4 text-on-surface-variant">
              <button class="transition-colors hover:text-primary" type="button" aria-label="Notifications">
                <span class="material-symbols-outlined">notifications</span>
              </button>
              <button class="transition-colors hover:text-primary" type="button" aria-label="Help">
                <span class="material-symbols-outlined">help_outline</span>
              </button>
              <div class="h-8 w-8 overflow-hidden rounded-full border border-outline-variant bg-primary-container">
                <img
                  alt="Administrator profile"
                  class="h-full w-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2nhjzZwl2m3XHOi3XqJc8ywejsT5aD7RuFRl77BJuDE22ITzXImfUcvYWuC1_7rkFM9mAm4CnJyomR0hZDy_erRlnGrl2d07jfuzPmUFQ-SuXoFc6LrQGWkvucKMsx6huy-VaI13TgpQgDuApBagiBvv4KwBzhdVl9xpZ6dbkoGN--2qj6-EZ5YfGa0NzhOx4D50soSQCM4JDgPNAy6yLxlsHi04ijUifMCXgZEsrLuZx9CDwcVdDq9vbUsP2HSQgFGBE6SSleg9Y"
                />
              </div>
            </div>
          </div>
        </header>

        <div
          v-if="isMobileMenuOpen"
          class="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm md:hidden"
          @click.self="isMobileMenuOpen = false"
        >
          <aside class="h-full w-72 max-w-[85vw] border-r border-outline-variant bg-surface-container-lowest px-4 py-6 shadow-xl">
            <div class="mb-8 flex items-start justify-between gap-4">
              <div>
                <BrandLogo
                  image-class="block h-10 w-auto max-w-none object-contain"
                />
                <p class="mt-2 font-body text-sm text-on-surface-variant">Heritage Manager</p>
              </div>
              <button
                class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant text-on-surface-variant"
                type="button"
                aria-label="Close menu"
                @click="isMobileMenuOpen = false"
              >
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <nav class="space-y-1">
              <RouterLink
                v-for="item in navItems"
                :key="item.label"
                :to="item.to"
                :class="[
                  'flex items-center gap-3 rounded-lg px-4 py-3 font-label text-sm font-semibold transition-colors',
                  item.active
                    ? 'bg-primary-container/10 text-primary'
                    : 'text-on-surface-variant hover:bg-surface-variant hover:text-primary',
                ]"
                @click="isMobileMenuOpen = false"
              >
                <span class="material-symbols-outlined">{{ item.icon }}</span>
                <span>{{ item.label }}</span>
              </RouterLink>
            </nav>
          </aside>
        </div>

        <main class="flex-1 bg-surface px-4 py-6 sm:px-6 lg:px-8">
          <div class="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 class="font-headline text-3xl font-semibold text-on-surface sm:text-[32px]">Names</h1>
              <p class="mt-1 font-body text-base text-on-surface-variant">Manage and preserve the Igala heritage archive.</p>
            </div>

            <RouterLink
              class="inline-flex items-center gap-2 rounded-full border border-tertiary bg-tertiary-container px-6 py-2.5 font-label text-sm font-semibold tracking-[0.05em] text-on-tertiary-container transition-all hover:bg-tertiary-fixed-dim"
              to="/admin"
            >
              <span class="material-symbols-outlined text-sm">add</span>
              Add New Name
            </RouterLink>
          </div>

          <section class="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-[0_4px_12px_rgba(92,58,33,0.05)]">
            <div class="flex flex-1 flex-wrap gap-4">
              <label class="relative min-w-[200px] flex-1 sm:flex-none">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
                <input
                  v-model="searchQuery"
                  class="w-full rounded-lg border border-outline-variant bg-surface-container py-2 pl-10 pr-4 font-body text-sm text-on-surface outline-none transition placeholder:text-outline focus:border-tertiary-container focus:ring-1 focus:ring-tertiary-container"
                  placeholder="Search names..."
                  type="text"
                />
              </label>

              <select
                v-model="selectedCategory"
                class="min-w-[150px] rounded-lg border border-outline-variant bg-surface-container px-4 py-2 font-body text-sm text-on-surface outline-none transition focus:border-tertiary-container"
              >
                <option value="">All Categories</option>
                <option value="spiritual">Spiritual</option>
                <option value="royal">Royal</option>
                <option value="descriptive">Descriptive</option>
              </select>

              <select
                v-model="selectedStatus"
                class="min-w-[150px] rounded-lg border border-outline-variant bg-surface-container px-4 py-2 font-body text-sm text-on-surface outline-none transition focus:border-tertiary-container"
              >
                <option value="">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div class="font-body text-sm text-on-surface-variant">
              {{ tableSummary }}
            </div>
          </section>

          <section class="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0_4px_12px_rgba(92,58,33,0.05)]">
            <div class="overflow-x-auto">
              <table class="w-full min-w-[820px] border-collapse text-left">
                <thead>
                  <tr class="border-b border-outline-variant bg-surface-container-low">
                    <th class="px-6 py-4 font-label text-sm font-semibold tracking-[0.05em] text-on-surface-variant">Name</th>
                    <th class="px-6 py-4 font-label text-sm font-semibold tracking-[0.05em] text-on-surface-variant">Meaning</th>
                    <th class="px-6 py-4 font-label text-sm font-semibold tracking-[0.05em] text-on-surface-variant">Category</th>
                    <th class="px-6 py-4 font-label text-sm font-semibold tracking-[0.05em] text-on-surface-variant">Status</th>
                    <th class="px-6 py-4 font-label text-sm font-semibold tracking-[0.05em] text-on-surface-variant">Date Added</th>
                    <th class="px-6 py-4 text-right font-label text-sm font-semibold tracking-[0.05em] text-on-surface-variant">Actions</th>
                  </tr>
                </thead>

                <tbody class="divide-y divide-outline-variant">
                  <tr v-for="entry in filteredNames" :key="entry.name" class="group transition-colors hover:bg-surface-container-low">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div :class="['flex h-10 w-10 items-center justify-center rounded-full font-headline text-lg font-semibold', entry.avatarTone]">
                          {{ entry.initials }}
                        </div>
                        <span class="font-headline text-lg font-semibold text-on-surface">{{ entry.name }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <span class="block max-w-[250px] truncate font-body text-sm text-on-surface-variant" :title="entry.meaning">
                        {{ entry.meaning }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <span :class="['inline-flex items-center rounded-full border px-2.5 py-0.5 font-body text-xs', entry.categoryTone]">
                        {{ entry.category }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <span class="inline-flex items-center gap-1.5 font-body text-sm text-on-surface">
                        <span :class="['h-2 w-2 rounded-full', entry.statusTone]"></span>
                        {{ entry.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 font-body text-sm text-on-surface-variant">
                      {{ entry.dateAdded }}
                    </td>
                    <td class="px-6 py-4 text-right">
                      <div class="flex items-center justify-end gap-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                        <button class="rounded p-1.5 text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-tertiary-container" type="button" title="View">
                          <span class="material-symbols-outlined text-sm">visibility</span>
                        </button>
                        <button class="rounded p-1.5 text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-tertiary-container" type="button" title="Edit">
                          <span class="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button class="rounded p-1.5 text-on-surface-variant transition-colors hover:bg-error-container hover:text-error" type="button" title="Delete">
                          <span class="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr v-if="!filteredNames.length">
                    <td colspan="6" class="px-6 py-12 text-center font-body text-sm text-on-surface-variant">
                      No names match current filters.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="flex items-center justify-between border-t border-outline-variant bg-surface-container-low px-6 py-4">
              <button
                class="inline-flex items-center gap-1 font-label text-sm font-semibold tracking-[0.05em] text-on-surface-variant disabled:cursor-not-allowed disabled:opacity-50"
                disabled
                type="button"
              >
                <span class="material-symbols-outlined text-sm">chevron_left</span>
                Previous
              </button>

              <div class="flex items-center gap-2">
                <button class="flex h-8 w-8 items-center justify-center rounded-full bg-tertiary-container font-label text-sm font-semibold text-on-tertiary-container" type="button">1</button>
                <button class="flex h-8 w-8 items-center justify-center rounded-full font-label text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-variant" type="button">2</button>
                <button class="flex h-8 w-8 items-center justify-center rounded-full font-label text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-variant" type="button">3</button>
                <span class="text-on-surface-variant">...</span>
                <button class="flex h-8 w-8 items-center justify-center rounded-full font-label text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-variant" type="button">25</button>
              </div>

              <button class="inline-flex items-center gap-1 font-label text-sm font-semibold tracking-[0.05em] text-on-surface-variant transition-colors hover:text-on-surface" type="button">
                Next
                <span class="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  </main>
</template>
