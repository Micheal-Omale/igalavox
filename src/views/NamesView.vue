<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import HeritageDivider from '../components/HeritageDivider.vue'
import NameCard from '../components/NameCard.vue'
import NameDetailModal from '../components/NameDetailModal.vue'
import SearchPanel from '../components/SearchPanel.vue'
import { searchArchiveNames } from '../composables/useNameArchive'
import { isSupabaseConfigured, requireSupabase } from '../services/supabase'
import { normalizeNameRecord } from '../utils/nameRecord'

const route = useRoute()
const searchQuery = ref(route.query.q || '')
const selectedName = ref(null)

const names = ref([])
const isLoading = ref(true)
const isLoadingMore = ref(false)
const isDetailLoading = ref(false)
const hasMoreNames = ref(false)
const errorMessage = ref('')
let searchTimer = null

const PAGE_SIZE = 60

const dedupeByName = (rows) => {
  const byName = new Map()

  for (const row of rows) {
    const existing = byName.get(row.name)
    if (!existing) {
      byName.set(row.name, row)
      continue
    }

    const existingScore = Number(Boolean(existing.audio_id || existing.audio_url || existing.audio_files?.file_url)) + Number(Boolean(existing.updated_at))
    const nextScore = Number(Boolean(row.audio_id || row.audio_url || row.audio_files?.file_url)) + Number(Boolean(row.updated_at))

    if (nextScore >= existingScore) {
      byName.set(row.name, row)
    }
  }

  return [...byName.values()]
}

const visibleNames = computed(() => names.value)
const hasActiveSearch = computed(() => Boolean(searchQuery.value.trim()))
const shouldShowEmptyState = computed(() => !isLoading.value && visibleNames.value.length === 0)

const fetchNames = async ({ reset = true } = {}) => {
  if (reset) isLoading.value = true
  else isLoadingMore.value = true
  errorMessage.value = ''

  try {
    const from = reset ? 0 : names.value.length
    const { rows, total } = searchArchiveNames(searchQuery.value.trim(), { offset: from, limit: PAGE_SIZE })

    names.value = reset ? rows : dedupeByName([...names.value, ...rows])
    hasMoreNames.value = from + rows.length < total
  } catch (error) {
    errorMessage.value = 'Unable to load archive records.'
    names.value = []
    hasMoreNames.value = false
    console.error('Error fetching names:', error)
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

const openName = async (item) => {
  selectedName.value = item
  if (!isSupabaseConfigured) return

  isDetailLoading.value = true

  try {
    const supabase = requireSupabase()
    let query = supabase
      .from('names')
      .select('*, audio_files(file_url, file_name)')

    query = item.id
      ? query.eq('id', item.id)
      : query.eq('name', item.name)

    const { data, error } = await query.single()

    if (error) throw error
    selectedName.value = normalizeNameRecord(data)
  } catch (error) {
    console.error('Error loading name details:', error)
  } finally {
    isDetailLoading.value = false
  }
}

const loadMore = () => {
  fetchNames({ reset: false })
}

onMounted(() => {
  if (route.query.q) {
    searchQuery.value = route.query.q
  }
  fetchNames()
})

watch(searchQuery, () => {
  if (searchTimer) window.clearTimeout(searchTimer)
  searchTimer = window.setTimeout(() => fetchNames(), 300)
})
</script>

<template>
  <main class="flex-grow">
    <section class="bg-surface-container-lowest px-4 py-12 sm:px-6 sm:py-16">
      <div class="mx-auto max-w-7xl text-center">
        <h1 class="mb-4 font-display text-4xl font-bold text-primary">Igala Name Archive</h1>
        <p class="mx-auto max-w-2xl font-body text-lg text-on-surface-variant">
          Browse our collection of Igala names, their meanings, and pronunciations.
        </p>
        <SearchPanel v-model="searchQuery" />
      </div>
    </section>

    <section class="bg-surface px-4 py-16 sm:px-6 sm:py-20">
      <div class="mx-auto max-w-7xl">
        <!-- Loading state -->
        <div v-if="isLoading" class="flex items-center justify-center py-20">
          <div class="flex flex-col items-center gap-3">
            <div class="h-8 w-8 animate-spin rounded-full border-2 border-outline-variant border-t-secondary"></div>
            <span class="font-body text-sm text-on-surface-variant">Loading names...</span>
          </div>
        </div>

        <div v-else-if="visibleNames.length > 0" class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <NameCard
            v-for="item in visibleNames"
            :key="item.id || item.name"
            :name="item"
            :meaning="item.meaning"
            :story="item.story"
            :tags="item.tags"
            :gender="item.gender"
            :gender-icon="item.gender === 'Male' ? 'male' : item.gender === 'Female' ? 'female' : 'person'"
            :audio-src="item.audioSrc"
            @select="openName(item)"
          />
        </div>
        <div v-if="hasMoreNames" class="mt-10 text-center">
          <button
            :disabled="isLoadingMore"
            class="rounded-full border border-outline-variant px-5 py-3 font-label text-sm font-semibold text-primary transition-colors hover:bg-surface-container-low"
            @click="loadMore"
          >
            {{ isLoadingMore ? 'Loading...' : 'Load More Names' }}
          </button>
        </div>
        <p v-if="errorMessage" class="mt-8 text-center font-body text-sm text-clay">{{ errorMessage }}</p>
        <div v-if="shouldShowEmptyState" class="py-20 text-center">
          <span class="material-symbols-outlined mb-4 text-6xl text-outline-variant">search_off</span>
          <p class="font-display text-2xl text-on-surface-variant">
            {{ hasActiveSearch ? 'No names found matching your search.' : 'No names available right now.' }}
          </p>
          <button 
            v-if="hasActiveSearch"
            @click="searchQuery = ''" 
            class="mt-4 text-primary underline font-label font-semibold"
          >
            Clear search
          </button>
        </div>
      </div>
    </section>

    <NameDetailModal
      v-if="selectedName"
      :name="selectedName"
      :audio-src="selectedName.audioSrc"
      @close="selectedName = null"
    />
    <div
      v-if="selectedName && isDetailLoading"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-inverse-surface/20 backdrop-blur-[1px]"
    >
      <div class="rounded-full bg-surface px-4 py-2 font-body text-sm text-on-surface shadow-lg">
        Loading details...
      </div>
    </div>

    <HeritageDivider />
  </main>
</template>
