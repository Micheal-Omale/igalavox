import { computed, ref, unref } from 'vue'
import { isSupabaseConfigured, requireSupabase } from '../services/supabase'
import { normalizeNameRecord } from '../utils/nameRecord'

const currentSrc = ref('')
const currentState = ref('idle')
const playbackError = ref(null)

let audioElement = null
const liveAudioCache = new Map()

const normalizeAudioSource = (value) => String(value || '').trim()

export function resolveNameAudioSource(entry = {}, fallback = '') {
  return normalizeAudioSource(
    fallback
      || entry.audioSrc
      || entry.audio_url
      || entry.audioUrl
      || entry.audio
      || entry.audio_files?.file_url
      || '',
  )
}

export async function resolveLiveNameAudioSource(entry = {}) {
  const normalizedEntry = unref(entry) || {}
  const cacheKey = normalizedEntry.id || normalizedEntry.name || normalizeAudioSource(normalizedEntry.audioSrc || normalizedEntry.audio_url || normalizedEntry.audioUrl || normalizedEntry.audio || normalizedEntry.audio_files?.file_url)

  if (!cacheKey) return ''
  if (liveAudioCache.has(cacheKey)) return liveAudioCache.get(cacheKey)
  if (!isSupabaseConfigured) return ''

  try {
    const supabase = requireSupabase()
    let query = supabase
      .from('names')
      .select('*, audio_files(file_url, file_name)')

    query = normalizedEntry.id
      ? query.eq('id', normalizedEntry.id)
      : query.eq('name', normalizedEntry.name)

    const { data, error } = await query.single()
    if (error) throw error

    const resolved = normalizeNameRecord(data).audioSrc || ''
    liveAudioCache.set(cacheKey, resolved)
    return resolved
  } catch (error) {
    console.error('Failed to resolve live audio source:', error)
    liveAudioCache.set(cacheKey, '')
    return ''
  }
}

const setAudioError = (message, error = null) => {
  playbackError.value = message
  currentState.value = 'error'
  console.error(message, error)
}

const ensureAudioElement = () => {
  if (audioElement || typeof Audio === 'undefined') return audioElement

  audioElement = new Audio()
  audioElement.preload = 'metadata'

  audioElement.addEventListener('loadstart', () => {
    if (currentSrc.value) currentState.value = 'loading'
  })

  audioElement.addEventListener('waiting', () => {
    if (currentSrc.value) currentState.value = 'loading'
  })

  audioElement.addEventListener('playing', () => {
    playbackError.value = null
    currentState.value = 'playing'
  })

  audioElement.addEventListener('pause', () => {
    if (audioElement?.ended) return
    if (currentState.value === 'playing' || currentState.value === 'loading') {
      currentState.value = 'paused'
    }
  })

  audioElement.addEventListener('ended', () => {
    currentState.value = 'idle'
    currentSrc.value = ''
  })

  audioElement.addEventListener('error', () => {
    setAudioError(`Audio file failed to load: ${currentSrc.value}`, audioElement?.error)
  })

  return audioElement
}

const stopCurrentAudio = ({ reset = false } = {}) => {
  if (!audioElement) return

  audioElement.pause()
  if (reset) audioElement.currentTime = 0
}

export function useAudioPlayer() {
  const toggleAudio = async (source, label = 'audio') => {
    const src = normalizeAudioSource(unref(source))

    if (!src) {
      console.warn(`No audio source available for ${label}.`)
      return false
    }

    const audio = ensureAudioElement()
    if (!audio) {
      setAudioError('Audio playback is not available in this browser.')
      return false
    }

    if (currentSrc.value === src && currentState.value === 'playing') {
      stopCurrentAudio()
      return true
    }

    if (currentSrc.value !== src) {
      stopCurrentAudio({ reset: true })
      currentSrc.value = src
      currentState.value = 'loading'
      playbackError.value = null
      audio.src = src
      audio.currentTime = 0
      audio.load()
    } else {
      currentState.value = 'loading'
      playbackError.value = null
    }

    try {
      await audio.play()
      currentState.value = 'playing'
      playbackError.value = null
      return true
    } catch (error) {
      setAudioError(`Audio playback failed for ${label}: ${src}`, error)
      return false
    }
  }

  const stopAudio = () => {
    stopCurrentAudio({ reset: true })
    currentSrc.value = ''
    currentState.value = 'idle'
  }

  const isSourcePlaying = (source) => computed(() => currentSrc.value === normalizeAudioSource(unref(source)) && currentState.value === 'playing')
  const isSourceLoading = (source) => computed(() => currentSrc.value === normalizeAudioSource(unref(source)) && currentState.value === 'loading')
  const isSourceErrored = (source) => computed(() => currentSrc.value === normalizeAudioSource(unref(source)) && currentState.value === 'error')

  return {
    currentSrc,
    currentState,
    playbackError,
    isSourcePlaying,
    isSourceLoading,
    isSourceErrored,
    resolveNameAudioSource,
    resolveLiveNameAudioSource,
    stopAudio,
    toggleAudio,
  }
}
