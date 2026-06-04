<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { isSupabaseConfigured, requireSupabase } from '../services/supabase'
import AppButton from './AppButton.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'search'])

const isOpen = ref(false)
const isLoading = ref(false)
const suggestions = ref([])
const selectedIndex = ref(-1)
const searchContainer = ref(null)

const defaultSuggestions = [
  { name: 'Omojo', meaning: '"God\'s child"' },
  { name: 'Ache', meaning: '"Female child born after her father\'s death"' },
  { name: 'Okolo', meaning: '"Helper"' },
  { name: 'Ugbane', meaning: '"Saviour"' }
]

let debounceTimer = null

const fetchSuggestions = async (query) => {
  if (!query) {
    suggestions.value = defaultSuggestions
    isLoading.value = false
    return
  }
  
  if (!isSupabaseConfigured) {
    // Basic fallback simulation if no database connection
    suggestions.value = defaultSuggestions.filter(s => 
      s.name.toLowerCase().includes(query.toLowerCase()) || 
      s.meaning.toLowerCase().includes(query.toLowerCase())
    )
    isLoading.value = false
    return
  }

  isLoading.value = true
  
  try {
    const supabase = requireSupabase()
    const escaped = query.replace(/[%_,]/g, '\\$&')
    
    const { data, error } = await supabase
      .from('names')
      .select('id, name, meaning, audio_id, audio_url')
      .or(`name.ilike.%${escaped}%,meaning.ilike.%${escaped}%`)
      .limit(8)
      
    if (error) throw error
    
    // Sort locally to prioritize exact or starts-with matches over inner matches
    const sorted = (data || []).sort((a, b) => {
      const qLower = query.toLowerCase()
      const aName = a.name.toLowerCase()
      const bName = b.name.toLowerCase()
      
      const aStarts = aName.startsWith(qLower)
      const bStarts = bName.startsWith(qLower)
      
      if (aStarts && !bStarts) return -1
      if (!aStarts && bStarts) return 1
      return 0
    })
    
    suggestions.value = sorted
  } catch (error) {
    console.error('Failed to fetch autocomplete suggestions:', error)
  } finally {
    isLoading.value = false
  }
}

const onInput = (e) => {
  const value = e.target.value
  emit('update:modelValue', value)
  isOpen.value = true
  selectedIndex.value = -1
  
  if (debounceTimer) clearTimeout(debounceTimer)
  
  if (!value.trim()) {
    suggestions.value = defaultSuggestions
    return
  }
  
  debounceTimer = setTimeout(() => {
    fetchSuggestions(value.trim())
  }, 250)
}

const onFocus = () => {
  isOpen.value = true
  if (!props.modelValue.trim() && suggestions.value.length === 0) {
    suggestions.value = defaultSuggestions
  } else if (props.modelValue.trim() && suggestions.value.length === 0) {
    fetchSuggestions(props.modelValue.trim())
  }
}

const handleClickOutside = (event) => {
  if (searchContainer.value && !searchContainer.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

const selectSuggestion = (suggestion) => {
  emit('update:modelValue', suggestion.name)
  emit('search', suggestion.name)
  isOpen.value = false
}

const onSubmit = () => {
  if (selectedIndex.value >= 0 && selectedIndex.value < suggestions.value.length) {
    selectSuggestion(suggestions.value[selectedIndex.value])
  } else {
    emit('search', props.modelValue)
    isOpen.value = false
  }
}

const onKeyDown = (e) => {
  if (!isOpen.value) return
  
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (selectedIndex.value < suggestions.value.length - 1) {
      selectedIndex.value++
    } else {
      selectedIndex.value = 0
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (selectedIndex.value > 0) {
      selectedIndex.value--
    } else {
      selectedIndex.value = suggestions.value.length - 1
    }
  } else if (e.key === 'Escape') {
    isOpen.value = false
  }
}
</script>

<template>
  <form 
    ref="searchContainer"
    class="group relative mx-auto mt-8 w-full max-w-2xl sm:mt-10" 
    role="search"
    @submit.prevent="onSubmit"
  >
    <!-- Background Blur Glow -->
    <div 
      class="absolute -inset-1 bg-gradient-to-r from-tertiary to-primary opacity-25 blur transition-all"
      :class="isOpen && (suggestions.length > 0 || isLoading) ? 'rounded-[2rem]' : 'rounded-full'"
    ></div>

    <!-- Search Input Container -->
    <div 
      class="ambient-shadow relative flex items-stretch gap-2 border-2 bg-surface-container-lowest p-2 transition-all"
      :class="[
        isOpen && (suggestions.length > 0 || isLoading)
          ? 'rounded-t-[1.75rem] rounded-b-none border-tertiary shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)]' 
          : 'rounded-full border-surface-variant focus-within:border-tertiary'
      ]"
    >
      <div class="flex min-w-0 flex-1 items-center">
        <span class="material-symbols-outlined ml-2 text-outline sm:ml-4">search</span>
        <input
          :value="modelValue"
          class="min-w-0 flex-1 border-none bg-transparent px-2 py-2 font-body text-base text-on-surface outline-none focus:ring-0 sm:px-4 sm:py-3 sm:text-lg"
          placeholder="Search for a name (e.g., Idoko)"
          type="search"
          autocomplete="off"
          spellcheck="false"
          aria-autocomplete="list"
          :aria-expanded="isOpen"
          @input="onInput"
          @focus="onFocus"
          @keydown="onKeyDown"
        />
      </div>
      <AppButton type="submit" class="shrink-0 justify-center self-stretch rounded-full px-4 sm:h-auto sm:px-6">Search</AppButton>
    </div>

    <!-- Autocomplete Dropdown -->
    <div 
      v-show="isOpen && (suggestions.length > 0 || isLoading)"
      class="absolute left-0 right-0 top-full z-50 overflow-hidden rounded-b-[1.75rem] border-x-2 border-b-2 border-tertiary bg-surface-container-lowest shadow-[0_20px_40px_-15px_rgba(11,61,46,0.15)]"
    >
      <div v-if="isLoading" class="flex items-center justify-center p-8 text-on-surface-variant">
        <div class="h-6 w-6 animate-spin rounded-full border-2 border-outline-variant border-t-tertiary"></div>
      </div>
      
      <ul v-else class="max-h-[60vh] overflow-y-auto py-2" role="listbox">
        <li 
          v-if="!modelValue.trim() && suggestions.length > 0" 
          class="px-5 py-3 font-label text-[11px] font-bold uppercase tracking-[0.16em] text-secondary"
        >
          Popular Searches
        </li>
        <li 
          v-for="(item, index) in suggestions" 
          :key="item.id || item.name"
          class="cursor-pointer px-4 py-3 transition-colors sm:px-5"
          :class="[
            selectedIndex === index ? 'bg-surface-container-low' : 'hover:bg-surface-container-low'
          ]"
          role="option"
          :aria-selected="selectedIndex === index"
          @click="selectSuggestion(item)"
          @mouseenter="selectedIndex = index"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <h4 class="truncate font-headline text-lg font-semibold text-primary">{{ item.name }}</h4>
              <p v-if="item.meaning" class="mt-0.5 truncate font-body text-sm text-on-surface-variant">
                {{ item.meaning }}
              </p>
            </div>
            <div 
              v-if="item.audio_id || item.audio_url" 
              class="mt-1 flex shrink-0 items-center gap-1 rounded bg-tertiary-container/30 px-2 py-1 font-label text-[10px] font-bold uppercase tracking-[0.12em] text-tertiary"
              title="Audio available"
            >
              <span class="material-symbols-outlined text-[14px]">volume_up</span>
              Audio
            </div>
          </div>
        </li>
      </ul>
      
      <div v-if="!isLoading && suggestions.length === 0 && modelValue.trim()" class="px-5 py-6 text-center">
        <p class="font-body text-sm text-on-surface-variant">No names found matching "{{ modelValue }}"</p>
      </div>
    </div>
  </form>
</template>
