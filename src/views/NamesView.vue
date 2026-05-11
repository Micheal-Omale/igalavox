<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../services/supabase'
import HeritageDivider from '../components/HeritageDivider.vue'
import NameCard from '../components/NameCard.vue'
import NameDetailModal from '../components/NameDetailModal.vue'
import SearchPanel from '../components/SearchPanel.vue'
import { normalizeNameRecord } from '../utils/nameRecord'

const route = useRoute()
const searchQuery = ref(route.query.q || '')
const selectedName = ref(null)

const names = ref([])
const isLoading = ref(true)
const isDetailLoading = ref(false)
const visibleCount = ref(60)

const SUMMARY_CACHE_KEY = 'names-view-summary-cache-v1'
const SUMMARY_CACHE_TTL_MS = 5 * 60 * 1000
const SUMMARY_SELECT = 'id, name, meaning, tags, gender, audio_id, audio_url, audio_files(file_url, file_name), updated_at'

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

const readSummaryCache = () => {
  const raw = sessionStorage.getItem(SUMMARY_CACHE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    if (Date.now() - parsed.savedAt > SUMMARY_CACHE_TTL_MS) return null
    return parsed.rows || null
  } catch {
    return null
  }
}

const writeSummaryCache = (rows) => {
  sessionStorage.setItem(SUMMARY_CACHE_KEY, JSON.stringify({
    savedAt: Date.now(),
    rows,
  }))
}

const filteredNames = computed(() => {
  if (!searchQuery.value) return names.value
  const q = searchQuery.value.toLowerCase()
  return names.value.filter(n => 
    n.name.toLowerCase().includes(q) || 
    n.meaning.toLowerCase().includes(q) ||
    (n.tags && n.tags.some(t => t.toLowerCase().includes(q)))
  )
})

const visibleNames = computed(() => filteredNames.value.slice(0, visibleCount.value))
const hasMoreNames = computed(() => visibleNames.value.length < filteredNames.value.length)

const fetchNames = async () => {
  isLoading.value = true
  try {
    const cachedRows = readSummaryCache()
    if (cachedRows) {
      names.value = cachedRows.map(normalizeNameRecord)
      isLoading.value = false
      return
    }

    const { data, error } = await supabase
      .from('names')
      .select(SUMMARY_SELECT)
      .order('name', { ascending: true })

    if (error) throw error
    const dedupedRows = dedupeByName(data || [])
    writeSummaryCache(dedupedRows)
    names.value = dedupedRows.map(normalizeNameRecord)
  } catch (error) {
    console.error('Error fetching names:', error)
  } finally {
    isLoading.value = false
  }
}

const openName = async (item) => {
  selectedName.value = item
  isDetailLoading.value = true

  try {
    const { data, error } = await supabase
      .from('names')
      .select('*, audio_files(file_url, file_name)')
      .eq('id', item.id)
      .single()

    if (error) throw error
    selectedName.value = normalizeNameRecord(data)
  } catch (error) {
    console.error('Error loading name details:', error)
  } finally {
    isDetailLoading.value = false
  }
}

const loadMore = () => {
  visibleCount.value += 60
}

onMounted(() => {
  if (route.query.q) {
    searchQuery.value = route.query.q
  }
  fetchNames()
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

        <div v-else-if="filteredNames.length > 0" class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <NameCard
            v-for="item in visibleNames"
            :key="item.id || item.name"
            :name="item.name"
            :meaning="item.meaning"
            :tags="item.tags"
            :audio-src="item.audioSrc"
            @select="openName(item)"
          />
        </div>
        <div v-if="hasMoreNames" class="mt-10 text-center">
          <button
            class="rounded-full border border-outline-variant px-5 py-3 font-label text-sm font-semibold text-primary transition-colors hover:bg-surface-container-low"
            @click="loadMore"
          >
            Load More Names
          </button>
        </div>
        <div v-else class="py-20 text-center">
          <span class="material-symbols-outlined mb-4 text-6xl text-outline-variant">search_off</span>
          <p class="font-display text-2xl text-on-surface-variant">No names found matching your search.</p>
          <button 
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
