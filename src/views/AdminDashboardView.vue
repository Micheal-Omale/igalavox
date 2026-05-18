<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { supabase, isSupabaseConfigured } from '../services/supabase'
import { useAuthStore } from '../stores/authStore'
import BrandLogo from '../components/BrandLogo.vue'
import AudioSidePanel from '../components/AudioSidePanel.vue'
import { normalizeNameRecord } from '../utils/nameRecord'

const router = useRouter()
const authStore = useAuthStore()

const names = ref([])
const isLoading = ref(true)
const isMobileMenuOpen = ref(false)
const selectedEntry = ref(null)
const searchQuery = ref('')
const selectedAudioFilter = ref('')
const selectedGender = ref('')
const selectedCategory = ref('')
const currentPage = ref(1)
const pageSize = 25
const currentlyPlayingId = ref(null)
const audioElements = ref({})

let namesSubscription = null

const totalNames = computed(() => names.value.length)
const withAudio = computed(() => names.value.filter((n) => n.audioUrl).length)
const missingAudio = computed(() => names.value.filter((n) => !n.audioUrl).length)
const completionPercent = computed(() => {
  if (!totalNames.value) return 0
  return Math.round((withAudio.value / totalNames.value) * 100)
})

const categoryOptions = computed(() => {
  return [...new Set(names.value.map((entry) => entry.category).filter(Boolean))].sort()
})

const fetchNames = async (showLoader = true) => {
  if (showLoader) isLoading.value = true
  try {
    const { data, error } = await supabase
      .from('names')
      .select('*, audio_files(file_url, file_name)')
      .order('name', { ascending: true })

    if (error) throw error
    names.value = (data || []).map(normalizeNameRecord)
  } catch (error) {
    console.error('Error fetching names:', error)
  } finally {
    if (showLoader) isLoading.value = false
  }
}

onMounted(() => {
  fetchNames()

  if (isSupabaseConfigured) {
    namesSubscription = supabase
      .channel('public:names')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'names' }, () => {
        fetchNames(false)
      })
      .subscribe()
  }
})

onUnmounted(() => {
  if (namesSubscription) {
    supabase.removeChannel(namesSubscription)
  }
})

const filteredNames = computed(() => {
  return names.value.filter((entry) => {
    const q = searchQuery.value.trim().toLowerCase()
    const matchesSearch = !q
      || entry.name?.toLowerCase().includes(q)
      || entry.meaning?.toLowerCase().includes(q)
      || entry.story?.toLowerCase().includes(q)
      || entry.category?.toLowerCase().includes(q)
      || entry.tags?.some((tag) => tag.toLowerCase().includes(q))

    let matchesAudio = true
    if (selectedAudioFilter.value === 'has-audio') matchesAudio = !!entry.audioUrl
    if (selectedAudioFilter.value === 'missing') matchesAudio = !entry.audioUrl

    let matchesGender = true
    if (selectedGender.value === 'male') matchesGender = entry.gender === 'Male'
    if (selectedGender.value === 'female') matchesGender = entry.gender === 'Female'
    if (selectedGender.value === 'unisex') matchesGender = entry.gender === 'Unisex'

    const matchesCategory = !selectedCategory.value
      || (entry.category || '').toLowerCase() === selectedCategory.value.toLowerCase()

    return matchesSearch && matchesAudio && matchesGender && matchesCategory
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredNames.value.length / pageSize)))
const paginatedNames = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredNames.value.slice(start, start + pageSize)
})

watch([searchQuery, selectedAudioFilter, selectedGender, selectedCategory], () => {
  currentPage.value = 1
})

const tableSummary = computed(() => {
  const total = filteredNames.value.length
  if (!total) return 'No matching names'
  const start = (currentPage.value - 1) * pageSize + 1
  const end = Math.min(currentPage.value * pageSize, total)
  return `${start}-${end} of ${total} names`
})

const getAudioStatus = (entry) => entry.audioUrl ? 'Uploaded' : 'Missing'
const getAudioStatusClass = (entry) => entry.audioUrl
  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
  : 'bg-red-100 text-red-800 border-red-200'
const getAudioStatusDot = (entry) => entry.audioUrl ? 'bg-emerald-500' : 'bg-red-400'

const formatUpdatedAt = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const playInline = (entry) => {
  if (!entry.audioUrl) return

  if (currentlyPlayingId.value && currentlyPlayingId.value !== entry.id) {
    const prevAudio = audioElements.value[currentlyPlayingId.value]
    if (prevAudio) {
      prevAudio.pause()
      prevAudio.currentTime = 0
    }
  }

  if (currentlyPlayingId.value === entry.id) {
    const audio = audioElements.value[entry.id]
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
    currentlyPlayingId.value = null
    return
  }

  if (!audioElements.value[entry.id]) {
    audioElements.value[entry.id] = new Audio(entry.audioUrl)
    audioElements.value[entry.id].addEventListener('ended', () => {
      currentlyPlayingId.value = null
    })
  }

  audioElements.value[entry.id].play()
  currentlyPlayingId.value = entry.id
}

const openPanel = (entry) => {
  selectedEntry.value = { ...entry }
}

const onPanelUpdated = () => {
  fetchNames()
}

const removeStoredAudio = async (entry) => {
  if (entry.audioUrl && entry.audioUrl.includes('/storage/v1/object/public/audio/')) {
    const path = entry.audioUrl.split('/audio/')[1]
    if (path) {
      await supabase.storage.from('audio').remove([path])
    }
  }

  if (entry.audio_id) {
    await supabase.from('audio_files').delete().eq('id', entry.audio_id)
  }
}

const deleteName = async (entry) => {
  if (!confirm(`Delete "${entry.name}" permanently? This cannot be undone.`)) return

  try {
    await removeStoredAudio(entry)

    const { error } = await supabase.from('names').delete().eq('id', entry.id)
    if (error) throw error

    names.value = names.value.filter((n) => n.id !== entry.id)
  } catch (err) {
    console.error('Failed to delete name:', err)
    alert(`Failed to delete name: ${err.message}`)
  }
}

const signOut = async () => {
  await authStore.signOut()
  router.push('/signin')
}
</script>

<template>
  <main class="min-h-dvh bg-background text-on-background">
    <div class="flex min-h-dvh">
      <aside class="hidden w-[260px] shrink-0 flex-col border-r border-outline-variant/40 bg-surface-container-lowest md:flex">
        <div class="px-6 pb-6 pt-6">
          <BrandLogo image-class="block h-10 w-auto max-w-none object-contain" />
          <p class="mt-1.5 font-label text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
            Audio Archive
          </p>
        </div>

        <nav class="flex-1 space-y-0.5 px-3">
          <RouterLink
            to="/admin"
            class="flex w-full items-center gap-3 rounded-lg px-4 py-3 font-label text-sm font-semibold transition-all"
            active-class="bg-primary-container/10 text-primary shadow-sm"
            exact-active-class="bg-primary-container/10 text-primary shadow-sm"
            :class="[ $route.path === '/admin' ? '' : 'text-on-surface-variant hover:bg-surface-variant hover:text-primary' ]"
          >
            <span class="material-symbols-outlined text-[20px]">library_music</span>
            <span>Audio Archive</span>
          </RouterLink>
          <RouterLink
            to="/admin/impact"
            class="flex w-full items-center gap-3 rounded-lg px-4 py-3 font-label text-sm font-semibold transition-all"
            active-class="bg-primary-container/10 text-primary shadow-sm"
            :class="[ $route.path.startsWith('/admin/impact') ? '' : 'text-on-surface-variant hover:bg-surface-variant hover:text-primary' ]"
          >
            <span class="material-symbols-outlined text-[20px]">campaign</span>
            <span>Community Impact</span>
          </RouterLink>
        </nav>

        <div class="border-t border-outline-variant/30 px-4 py-4">
          <RouterLink
            to="/"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 font-label text-sm text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-primary"
          >
            <span class="material-symbols-outlined text-[20px]">language</span>
            View Site
          </RouterLink>
          <button
            @click="signOut"
            class="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-label text-sm text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-clay"
          >
            <span class="material-symbols-outlined text-[20px]">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      <div class="flex min-w-0 flex-1 flex-col">
        <header class="sticky top-0 z-40 flex h-[60px] items-center justify-between border-b border-outline-variant/30 bg-surface-container-lowest/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div class="flex items-center gap-4">
            <button
              class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant/40 text-on-surface-variant transition-colors hover:text-primary md:hidden"
              @click="isMobileMenuOpen = true"
              aria-label="Open menu"
            >
              <span class="material-symbols-outlined text-[20px]">menu</span>
            </button>
            <div>
              <h1 class="font-display text-lg font-bold text-primary sm:text-xl">Audio Archive Manager</h1>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div class="hidden items-center gap-1.5 sm:flex">
              <span class="inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              <span class="font-body text-xs text-on-surface-variant">{{ completionPercent }}% recorded</span>
            </div>
            <div class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-outline-variant/40 bg-primary-container">
              <span class="material-symbols-outlined text-[18px] text-on-primary-container">person</span>
            </div>
          </div>
        </header>

        <div
          v-if="isMobileMenuOpen"
          class="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm md:hidden"
          @click.self="isMobileMenuOpen = false"
        >
          <aside class="h-full w-72 max-w-[85vw] border-r border-outline-variant bg-surface-container-lowest px-4 py-6 shadow-xl">
            <div class="mb-6 flex items-start justify-between">
              <div>
                <BrandLogo image-class="block h-10 w-auto max-w-none object-contain" />
                <p class="mt-1.5 font-label text-xs font-semibold uppercase tracking-[0.14em] text-secondary">Audio Archive</p>
              </div>
              <button
                class="flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant text-on-surface-variant"
                @click="isMobileMenuOpen = false"
                aria-label="Close menu"
              >
                <span class="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <nav class="space-y-0.5">
              <RouterLink
                to="/admin"
                class="flex w-full items-center gap-3 rounded-lg px-4 py-3 font-label text-sm font-semibold transition-colors"
                active-class="bg-primary-container/10 text-primary"
                exact-active-class="bg-primary-container/10 text-primary"
                :class="[ $route.path === '/admin' ? '' : 'text-on-surface-variant hover:bg-surface-variant hover:text-primary' ]"
                @click="isMobileMenuOpen = false"
              >
                <span class="material-symbols-outlined text-[20px]">library_music</span>
                <span>Audio Archive</span>
              </RouterLink>
              <RouterLink
                to="/admin/impact"
                class="flex w-full items-center gap-3 rounded-lg px-4 py-3 font-label text-sm font-semibold transition-colors"
                active-class="bg-primary-container/10 text-primary"
                :class="[ $route.path.startsWith('/admin/impact') ? '' : 'text-on-surface-variant hover:bg-surface-variant hover:text-primary' ]"
                @click="isMobileMenuOpen = false"
              >
                <span class="material-symbols-outlined text-[20px]">campaign</span>
                <span>Community Impact</span>
              </RouterLink>
            </nav>
          </aside>
        </div>

        <div class="flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <div class="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div class="rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-4 shadow-sm">
              <div class="flex items-center gap-2">
                <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-container/15 text-primary">
                  <span class="material-symbols-outlined text-[18px]">menu_book</span>
                </span>
                <span class="font-label text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant/60">Total Names</span>
              </div>
              <p class="mt-2 font-display text-2xl font-bold text-on-surface">{{ totalNames }}</p>
            </div>

            <div class="rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-4 shadow-sm">
              <div class="flex items-center gap-2">
                <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <span class="material-symbols-outlined text-[18px]">check_circle</span>
                </span>
                <span class="font-label text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant/60">With Audio</span>
              </div>
              <p class="mt-2 font-display text-2xl font-bold text-emerald-700">{{ withAudio }}</p>
            </div>

            <div class="rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-4 shadow-sm">
              <div class="flex items-center gap-2">
                <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600">
                  <span class="material-symbols-outlined text-[18px]">mic_off</span>
                </span>
                <span class="font-label text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant/60">Missing</span>
              </div>
              <p class="mt-2 font-display text-2xl font-bold text-clay">{{ missingAudio }}</p>
            </div>

            <div class="rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-4 shadow-sm">
              <div class="flex items-center gap-2">
                <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-container/40 text-secondary">
                  <span class="material-symbols-outlined text-[18px]">speed</span>
                </span>
                <span class="font-label text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant/60">Progress</span>
              </div>
              <div class="mt-2 flex items-end gap-2">
                <p class="font-display text-2xl font-bold text-secondary">{{ completionPercent }}%</p>
              </div>
              <div class="mt-2 h-1.5 w-full rounded-full bg-outline-variant/20">
                <div class="h-full rounded-full bg-secondary transition-all duration-500" :style="{ width: completionPercent + '%' }"></div>
              </div>
            </div>
          </div>

          <section class="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-3 shadow-sm">
            <div class="flex flex-1 flex-wrap items-center gap-2.5">
              <label class="relative min-w-[180px] flex-1 sm:max-w-[280px]">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
                <input
                  v-model="searchQuery"
                  class="w-full rounded-lg border border-outline-variant/40 bg-surface-container py-2 pl-9 pr-3 font-body text-sm text-on-surface outline-none transition placeholder:text-outline focus:border-secondary focus:ring-1 focus:ring-secondary/30"
                  placeholder="Search names..."
                  type="text"
                />
              </label>

              <select
                v-model="selectedAudioFilter"
                class="rounded-lg border border-outline-variant/40 bg-surface-container px-3 py-2 font-body text-sm text-on-surface outline-none transition focus:border-secondary"
              >
                <option value="">All Audio</option>
                <option value="has-audio">Has Audio</option>
                <option value="missing">Missing Audio</option>
              </select>

              <select
                v-model="selectedGender"
                class="rounded-lg border border-outline-variant/40 bg-surface-container px-3 py-2 font-body text-sm text-on-surface outline-none transition focus:border-secondary"
              >
                <option value="">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="unisex">Unisex</option>
              </select>

              <select
                v-model="selectedCategory"
                class="rounded-lg border border-outline-variant/40 bg-surface-container px-3 py-2 font-body text-sm text-on-surface outline-none transition focus:border-secondary"
              >
                <option value="">All Categories</option>
                <option v-for="category in categoryOptions" :key="category" :value="category.toLowerCase()">
                  {{ category }}
                </option>
              </select>
            </div>

            <span class="font-body text-xs text-on-surface-variant">{{ tableSummary }}</span>
          </section>

          <section class="overflow-hidden rounded-xl border border-outline-variant/25 bg-surface-container-lowest shadow-sm">
            <div v-if="isLoading" class="flex items-center justify-center py-20">
              <div class="flex flex-col items-center gap-3">
                <div class="h-8 w-8 animate-spin rounded-full border-2 border-outline-variant border-t-secondary"></div>
                <span class="font-body text-sm text-on-surface-variant">Loading archive...</span>
              </div>
            </div>

            <div v-else class="overflow-x-auto">
              <table class="w-full min-w-[780px] border-collapse text-left">
                <thead>
                  <tr class="border-b border-outline-variant/30 bg-surface-container-low/50">
                    <th class="px-5 py-3 font-label text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant/70">Name</th>
                    <th class="px-5 py-3 font-label text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant/70">Meaning</th>
                    <th class="px-5 py-3 font-label text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant/70">Audio</th>
                    <th class="hidden px-5 py-3 font-label text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant/70 lg:table-cell">Category</th>
                    <th class="hidden px-5 py-3 font-label text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant/70 md:table-cell">Updated</th>
                    <th class="px-5 py-3 text-right font-label text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant/70">Actions</th>
                  </tr>
                </thead>

                <tbody class="divide-y divide-outline-variant/20">
                  <tr
                    v-for="entry in paginatedNames"
                    :key="entry.id"
                    class="group cursor-pointer transition-colors hover:bg-surface-container-low/40"
                    @click="openPanel(entry)"
                  >
                    <td class="px-5 py-3.5">
                      <div class="flex items-center gap-3">
                        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-container/12 font-display text-sm font-bold text-primary">
                          {{ entry.name?.charAt(0) }}
                        </div>
                        <div class="min-w-0">
                          <span class="block truncate font-display text-sm font-semibold text-on-surface">{{ entry.name }}</span>
                          <span class="block truncate font-body text-xs text-on-surface-variant/60">{{ entry.gender }}</span>
                        </div>
                      </div>
                    </td>

                    <td class="px-5 py-3.5">
                      <span class="block max-w-[200px] truncate font-body text-sm text-on-surface-variant" :title="entry.meaning">
                        {{ entry.meaning }}
                      </span>
                    </td>

                    <td class="px-5 py-3.5">
                      <div class="flex items-center gap-2">
                        <button
                          v-if="entry.audioUrl"
                          @click.stop="playInline(entry)"
                          :class="[
                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all',
                            currentlyPlayingId === entry.id ? 'border-secondary bg-secondary text-on-secondary scale-105' : 'border-outline-variant/40 text-secondary hover:border-secondary hover:bg-secondary/10',
                          ]"
                          :title="currentlyPlayingId === entry.id ? 'Stop' : 'Play'"
                        >
                          <span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1">
                            {{ currentlyPlayingId === entry.id ? 'stop' : 'play_arrow' }}
                          </span>
                        </button>
                        <span :class="['inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-label text-[11px] font-semibold', getAudioStatusClass(entry)]">
                          <span :class="['inline-block h-1.5 w-1.5 rounded-full', getAudioStatusDot(entry)]"></span>
                          {{ getAudioStatus(entry) }}
                        </span>
                      </div>
                    </td>

                    <td class="hidden px-5 py-3.5 lg:table-cell">
                      <span class="font-body text-sm capitalize text-on-surface-variant">{{ entry.category || '-' }}</span>
                    </td>

                    <td class="hidden px-5 py-3.5 md:table-cell">
                      <span class="font-body text-xs text-on-surface-variant/60">{{ formatUpdatedAt(entry.updated_at) }}</span>
                    </td>

                    <td class="px-5 py-3.5 text-right">
                      <div class="flex items-center justify-end gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                        <button
                          @click.stop="openPanel(entry)"
                          class="rounded-md p-1.5 text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-secondary"
                          :title="entry.audioUrl ? 'Manage Audio' : 'Record Audio'"
                        >
                          <span class="material-symbols-outlined text-[18px]">{{ entry.audioUrl ? 'edit_note' : 'mic' }}</span>
                        </button>
                        <button
                          @click.stop="deleteName(entry)"
                          class="rounded-md p-1.5 text-on-surface-variant transition-colors hover:bg-red-50 hover:text-clay"
                          title="Delete Name"
                        >
                          <span class="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr v-if="!paginatedNames.length">
                    <td colspan="6" class="px-6 py-16 text-center">
                      <span class="material-symbols-outlined mb-2 block text-[40px] text-outline-variant">search_off</span>
                      <p class="font-body text-sm text-on-surface-variant">No names match your filters.</p>
                      <button
                        @click="searchQuery = ''; selectedAudioFilter = ''; selectedGender = ''; selectedCategory = ''"
                        class="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-outline-variant px-4 py-2 font-label text-xs font-semibold text-on-surface-variant transition-colors hover:bg-surface-variant"
                      >
                        <span class="material-symbols-outlined text-[14px]">filter_alt_off</span>
                        Clear Filters
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="totalPages > 1" class="flex items-center justify-between border-t border-outline-variant/20 bg-surface-container-low/30 px-5 py-3">
              <button
                :disabled="currentPage <= 1"
                @click="currentPage--"
                class="inline-flex items-center gap-1 font-label text-xs font-semibold tracking-[0.04em] text-on-surface-variant transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span class="material-symbols-outlined text-[16px]">chevron_left</span>
                Previous
              </button>

              <div class="flex items-center gap-1">
                <button
                  v-for="page in Math.min(totalPages, 7)"
                  :key="page"
                  @click="currentPage = page"
                  :class="[
                    'flex h-7 w-7 items-center justify-center rounded-full font-label text-xs font-semibold transition-colors',
                    currentPage === page ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-variant',
                  ]"
                >
                  {{ page }}
                </button>
                <span v-if="totalPages > 7" class="px-1 text-on-surface-variant">...</span>
                <button
                  v-if="totalPages > 7"
                  @click="currentPage = totalPages"
                  :class="[
                    'flex h-7 w-7 items-center justify-center rounded-full font-label text-xs font-semibold transition-colors',
                    currentPage === totalPages ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-variant',
                  ]"
                >
                  {{ totalPages }}
                </button>
              </div>

              <button
                :disabled="currentPage >= totalPages"
                @click="currentPage++"
                class="inline-flex items-center gap-1 font-label text-xs font-semibold tracking-[0.04em] text-on-surface-variant transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <span class="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>

    <AudioSidePanel
      v-if="selectedEntry"
      :entry="selectedEntry"
      @close="selectedEntry = null"
      @updated="onPanelUpdated"
    />
  </main>
</template>
