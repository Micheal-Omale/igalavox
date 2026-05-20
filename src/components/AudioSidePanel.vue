<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { isSupabaseConfigured, requireSupabase, SUPABASE_CONFIG_MESSAGE } from '../services/supabase'
import { normalizeNameRecord } from '../utils/nameRecord'

const props = defineProps({
  entry: { type: Object, required: true },
})

const emit = defineEmits(['close', 'updated'])

const normalizedEntry = computed(() => normalizeNameRecord(props.entry))

const audioFile = ref(null)
const persistedAudioId = ref(normalizedEntry.value.audio_id || null)
const persistedAudioUrl = ref(normalizedEntry.value.audioUrl || '')
const audioUrl = ref(normalizedEntry.value.audioUrl || '')
const isPlaying = ref(false)
const isUploading = ref(false)
const isDragging = ref(false)
const statusMessage = ref('')
const statusType = ref('')
const audioElement = ref(null)
const audioProgress = ref(0)
const audioDuration = ref(0)
const audioCurrentTime = ref(0)
const fileInput = ref(null)
const canvasRef = ref(null)
const animationFrame = ref(null)
const isRecording = ref(false)
const recordingSeconds = ref(0)
const recordingTimer = ref(null)
const mediaRecorder = ref(null)
const mediaStream = ref(null)
const recordedChunks = ref([])

const audioContext = ref(null)
const analyser = ref(null)
const sourceNode = ref(null)

const hasAudio = computed(() => !!persistedAudioUrl.value)
const audioProgressWidth = computed(() => `${audioProgress.value}%`)

const audioStatusLabel = computed(() => hasAudio.value ? 'Uploaded' : 'Missing')
const audioStatusClass = computed(() => hasAudio.value
  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
  : 'bg-red-100 text-red-800 border-red-200')
const isRecordingSupported = computed(() => (
  typeof window !== 'undefined'
  && typeof MediaRecorder !== 'undefined'
  && !!navigator.mediaDevices?.getUserMedia
))

const formatTime = (seconds) => {
  if (!seconds || Number.isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const showStatus = (msg, type = 'info') => {
  statusMessage.value = msg
  statusType.value = type
  if (type !== 'error') {
    setTimeout(() => {
      statusMessage.value = ''
    }, 4000)
  }
}

const onDragEnter = (e) => {
  e.preventDefault()
  isDragging.value = true
}

const onDragLeave = (e) => {
  e.preventDefault()
  isDragging.value = false
}

const onDragOver = (e) => {
  e.preventDefault()
}

const handleFile = (file) => {
  const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/webm', 'audio/ogg', 'audio/mp4', 'audio/x-m4a']
  if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|webm|ogg|m4a)$/i)) {
    showStatus('Please upload MP3, WAV, OGG, WEBM, or M4A.', 'error')
    return
  }

  if (file.size > 10 * 1024 * 1024) {
    showStatus('File too large. Max 10MB.', 'error')
    return
  }

  audioFile.value = file
  audioUrl.value = URL.createObjectURL(file)
  showStatus(`${file.name} ready to upload.`, 'info')
}

const getRecordingMimeType = () => {
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']
  return types.find((type) => MediaRecorder.isTypeSupported(type)) || ''
}

const stopRecordingStream = () => {
  if (recordingTimer.value) {
    clearInterval(recordingTimer.value)
    recordingTimer.value = null
  }

  mediaStream.value?.getTracks().forEach((track) => track.stop())
  mediaStream.value = null
}

const uploadAudioFile = async (file) => {
  if (!isSupabaseConfigured) {
    showStatus(SUPABASE_CONFIG_MESSAGE, 'error')
    return
  }

  isUploading.value = true
  showStatus('Uploading audio...', 'info')

  try {
    const supabase = requireSupabase()
    if (persistedAudioId.value || persistedAudioUrl.value) {
      await deleteExistingAudioArtifacts()
    }

    const fileExt = file.name.split('.').pop() || 'webm'
    const safeName = normalizedEntry.value.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const fileName = `${safeName || 'name-audio'}-${Date.now()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio')
      .upload(fileName, file, { upsert: true, contentType: file.type || 'audio/webm' })

    if (uploadError) throw uploadError

    const { data: publicUrlData } = supabase.storage.from('audio').getPublicUrl(uploadData.path)

    const { data: audioRecord, error: audioRecordError } = await supabase
      .from('audio_files')
      .insert({
        file_url: publicUrlData.publicUrl,
        file_name: file.name,
      })
      .select()
      .single()

    if (audioRecordError) throw audioRecordError

    const { error: updateError } = await supabase
      .from('names')
      .update({
        audio_id: audioRecord.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', normalizedEntry.value.id)

    if (updateError) throw updateError

    persistedAudioUrl.value = publicUrlData.publicUrl
    persistedAudioId.value = audioRecord.id
    audioUrl.value = publicUrlData.publicUrl
    audioFile.value = null
    showStatus('Audio uploaded to Supabase.', 'success')
    emit('updated')
  } catch (err) {
    console.error('Upload error:', err)
    showStatus(`Upload failed: ${err.message}`, 'error')
  } finally {
    isUploading.value = false
  }
}

const handleRecordingStop = async () => {
  stopRecordingStream()
  isRecording.value = false

  if (!recordedChunks.value.length) {
    showStatus('No recording captured. Please try again.', 'error')
    return
  }

  const mimeType = mediaRecorder.value?.mimeType || 'audio/webm'
  const extension = mimeType.includes('ogg') ? 'ogg' : mimeType.includes('mp4') ? 'm4a' : 'webm'
  const blob = new Blob(recordedChunks.value, { type: mimeType })
  const safeName = normalizedEntry.value.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const file = new File([blob], `${safeName || 'name-audio'}-recording.${extension}`, { type: mimeType })

  audioFile.value = file
  audioUrl.value = URL.createObjectURL(file)
  showStatus('Recording complete. Uploading to Supabase...', 'info')
  await uploadAudioFile(file)
}

const startRecording = async () => {
  if (!isRecordingSupported.value) {
    showStatus('Native recording is not supported in this browser.', 'error')
    return
  }

  try {
    if (audioElement.value) {
      audioElement.value.pause()
      isPlaying.value = false
    }

    recordedChunks.value = []
    recordingSeconds.value = 0
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mimeType = getRecordingMimeType()
    mediaStream.value = stream
    mediaRecorder.value = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)

    mediaRecorder.value.addEventListener('dataavailable', (event) => {
      if (event.data?.size) recordedChunks.value.push(event.data)
    })
    mediaRecorder.value.addEventListener('stop', handleRecordingStop, { once: true })
    mediaRecorder.value.start()
    isRecording.value = true
    recordingTimer.value = setInterval(() => {
      recordingSeconds.value += 1
    }, 1000)
    showStatus('Recording started. Speak clearly, then stop to upload.', 'info')
  } catch (err) {
    console.error('Recording error:', err)
    stopRecordingStream()
    isRecording.value = false
    showStatus(`Recording failed: ${err.message}`, 'error')
  }
}

const stopRecording = () => {
  if (!mediaRecorder.value || mediaRecorder.value.state === 'inactive') return
  mediaRecorder.value.stop()
}

const onDrop = (e) => {
  e.preventDefault()
  isDragging.value = false
  const file = e.dataTransfer.files?.[0]
  if (file) handleFile(file)
}

const openFilePicker = () => {
  fileInput.value?.click()
}

const onFileChange = (e) => {
  const file = e.target.files?.[0]
  if (file) handleFile(file)
}

const togglePlayback = () => {
  if (!audioElement.value) return
  if (isPlaying.value) audioElement.value.pause()
  else audioElement.value.play()
}

const onPlay = () => {
  isPlaying.value = true
  drawWaveform()
}

const onPause = () => {
  isPlaying.value = false
  cancelAnimationFrame(animationFrame.value)
}

const onEnded = () => {
  isPlaying.value = false
  audioProgress.value = 0
  cancelAnimationFrame(animationFrame.value)
}

const onTimeUpdate = () => {
  if (!audioElement.value) return
  audioCurrentTime.value = audioElement.value.currentTime
  audioDuration.value = audioElement.value.duration
  audioProgress.value = (audioElement.value.currentTime / audioElement.value.duration) * 100
}

const onLoadedMetadata = () => {
  if (audioElement.value) audioDuration.value = audioElement.value.duration
}

const seekAudio = (e) => {
  if (!audioElement.value || !audioDuration.value) return
  const rect = e.currentTarget.getBoundingClientRect()
  const pct = (e.clientX - rect.left) / rect.width
  audioElement.value.currentTime = pct * audioDuration.value
}

const drawWaveform = () => {
  if (!canvasRef.value || !analyser.value) return
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  const bufferLength = analyser.value.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)

  const draw = () => {
    if (!isPlaying.value) return
    animationFrame.value = requestAnimationFrame(draw)
    analyser.value.getByteTimeDomainData(dataArray)

    ctx.fillStyle = '#f6f3ee'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.lineWidth = 2
    ctx.strokeStyle = '#7c563b'
    ctx.beginPath()

    const sliceWidth = canvas.width / bufferLength
    let x = 0

    for (let i = 0; i < bufferLength; i += 1) {
      const v = dataArray[i] / 128.0
      const y = (v * canvas.height) / 2
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
      x += sliceWidth
    }

    ctx.lineTo(canvas.width, canvas.height / 2)
    ctx.stroke()
  }

  draw()
}

const setupAudioContext = () => {
  if (!audioElement.value || audioContext.value) return
  try {
    audioContext.value = new (window.AudioContext || window.webkitAudioContext)()
    analyser.value = audioContext.value.createAnalyser()
    analyser.value.fftSize = 2048
    sourceNode.value = audioContext.value.createMediaElementSource(audioElement.value)
    sourceNode.value.connect(analyser.value)
    analyser.value.connect(audioContext.value.destination)
  } catch (err) {
    console.warn('AudioContext setup skipped:', err.message)
  }
}

const getStoredAudioPath = (url) => {
  if (!url || !url.includes('/storage/v1/object/public/audio/')) return null
  return url.split('/audio/')[1] || null
}

const deleteExistingAudioArtifacts = async () => {
  if (!isSupabaseConfigured) return

  const supabase = requireSupabase()
  const storedPath = getStoredAudioPath(persistedAudioUrl.value)
  if (storedPath) {
    await supabase.storage.from('audio').remove([storedPath])
  }

  if (persistedAudioId.value) {
    await supabase.from('audio_files').delete().eq('id', persistedAudioId.value)
  }
}

const uploadAudio = async () => {
  if (!audioFile.value) {
    showStatus('No file selected.', 'error')
    return
  }

  await uploadAudioFile(audioFile.value)
}

const replaceAudio = () => {
  if (audioElement.value) {
    audioElement.value.pause()
    isPlaying.value = false
  }
  audioFile.value = null
  openFilePicker()
}

const deleteAudio = async () => {
  if (!confirm('Remove pronunciation audio for this name?')) return
  if (!isSupabaseConfigured) {
    showStatus(SUPABASE_CONFIG_MESSAGE, 'error')
    return
  }

  isUploading.value = true
  showStatus('Removing audio...', 'info')

  try {
    const supabase = requireSupabase()
    await deleteExistingAudioArtifacts()

    const { error } = await supabase
      .from('names')
      .update({
        audio_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', normalizedEntry.value.id)

    if (error) throw error

    persistedAudioUrl.value = ''
    persistedAudioId.value = null
    audioUrl.value = ''
    audioFile.value = null
    if (audioElement.value) {
      audioElement.value.pause()
      isPlaying.value = false
    }
    showStatus('Audio removed.', 'success')
    emit('updated')
  } catch (err) {
    console.error('Delete error:', err)
    showStatus(`Delete failed: ${err.message}`, 'error')
  } finally {
    isUploading.value = false
  }
}

const onKeydown = (e) => {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  nextTick(() => {
    if (audioElement.value && audioUrl.value) setupAudioContext()
  })
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  if (animationFrame.value) cancelAnimationFrame(animationFrame.value)
  if (audioElement.value) audioElement.value.pause()
  stopRecordingStream()
})

watch(audioUrl, (newUrl) => {
  if (newUrl && audioElement.value) {
    nextTick(() => setupAudioContext())
  }
})

watch(normalizedEntry, (entry) => {
  persistedAudioId.value = entry.audio_id || null
  persistedAudioUrl.value = entry.audioUrl || ''
  if (!audioFile.value) {
    audioUrl.value = entry.audioUrl || ''
  }
}, { deep: true })
</script>

<template>
  <div class="fixed inset-0 z-50 flex justify-end" @click.self="emit('close')">
    <div class="absolute inset-0 bg-inverse-surface/30 backdrop-blur-sm" @click="emit('close')"></div>

    <aside class="relative z-10 flex h-full w-full max-w-[520px] flex-col bg-surface-container-lowest shadow-2xl animate-slide-in">
      <header class="flex items-center justify-between border-b border-outline-variant/30 px-6 py-5">
        <div class="min-w-0">
          <h2 class="truncate font-display text-2xl font-bold text-primary">{{ normalizedEntry.name }}</h2>
          <p class="mt-0.5 truncate font-body text-sm text-on-surface-variant italic">{{ normalizedEntry.meaning }}</p>
        </div>
        <button
          @click="emit('close')"
          class="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-outline-variant/40 text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-primary"
          aria-label="Close panel"
        >
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </header>

      <div class="flex-1 overflow-y-auto">
        <section class="border-b border-outline-variant/20 px-6 py-5">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="block font-label text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant/60">Pronunciation</span>
              <span class="mt-1 block font-body text-sm text-on-surface">{{ normalizedEntry.pronunciation || '-' }}</span>
            </div>
            <div>
              <span class="block font-label text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant/60">Gender</span>
              <span class="mt-1 block font-body text-sm text-on-surface">{{ normalizedEntry.gender }}</span>
            </div>
            <div>
              <span class="block font-label text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant/60">Category</span>
              <span class="mt-1 block font-body text-sm capitalize text-on-surface">{{ normalizedEntry.category || 'General' }}</span>
            </div>
            <div>
              <span class="block font-label text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant/60">Audio Status</span>
              <span :class="['mt-1 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold', audioStatusClass]">
                {{ audioStatusLabel }}
              </span>
            </div>
          </div>
        </section>

        <section class="border-b border-outline-variant/20 px-6 py-5">
          <h3 class="mb-3 flex items-center gap-2 font-label text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant/60">
            <span class="material-symbols-outlined text-[16px]">graphic_eq</span>
            Audio Preview
          </h3>

          <div v-if="audioUrl" class="rounded-xl border border-outline-variant/30 bg-surface-container-low p-4">
            <audio
              ref="audioElement"
              :src="audioUrl"
              preload="metadata"
              @play="onPlay"
              @pause="onPause"
              @ended="onEnded"
              @timeupdate="onTimeUpdate"
              @loadedmetadata="onLoadedMetadata"
            ></audio>

            <div class="mb-3 overflow-hidden rounded-lg bg-surface-container-low">
              <canvas ref="canvasRef" width="460" height="60" class="block w-full"></canvas>
            </div>

            <div class="mb-3 h-1.5 w-full cursor-pointer rounded-full bg-outline-variant/20" @click="seekAudio">
              <div class="audio-progress-bar h-full rounded-full bg-secondary transition-all duration-100"></div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <button
                  @click="togglePlayback"
                  class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary shadow-md transition-transform hover:scale-105 active:scale-95"
                >
                  <span class="material-symbols-outlined filled-symbol text-[20px]">
                    {{ isPlaying ? 'pause' : 'play_arrow' }}
                  </span>
                </button>
                <span class="font-body text-xs tabular-nums text-on-surface-variant">
                  {{ formatTime(audioCurrentTime) }} / {{ formatTime(audioDuration) }}
                </span>
              </div>
            </div>
          </div>

          <div v-else class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant/40 bg-surface-container-low/50 py-10 text-center">
            <span class="material-symbols-outlined mb-2 text-[40px] text-outline-variant">mic_off</span>
            <p class="font-body text-sm text-on-surface-variant">No audio recorded yet</p>
            <p class="mt-1 font-body text-xs text-outline">Upload or record below</p>
          </div>
        </section>

        <section class="border-b border-outline-variant/20 px-6 py-5">
          <h3 class="mb-3 flex items-center gap-2 font-label text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant/60">
            <span class="material-symbols-outlined text-[16px]">mic</span>
            Record Natively
          </h3>

          <div class="rounded-xl border border-outline-variant/30 bg-surface-container-low p-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="font-body text-sm font-medium text-on-surface">
                  {{ isRecording ? 'Recording in progress...' : 'Use your microphone to record pronunciation.' }}
                </p>
                <p class="mt-1 font-body text-xs text-on-surface-variant">
                  {{ isRecording ? `Timer: ${formatTime(recordingSeconds)}` : 'Stop recording and it uploads to Supabase automatically.' }}
                </p>
              </div>

              <button
                v-if="!isRecording"
                @click="startRecording"
                :disabled="isUploading || !isRecordingSupported"
                class="inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2.5 font-label text-sm font-semibold tracking-[0.04em] text-on-secondary shadow-sm transition-all hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span class="material-symbols-outlined text-[18px]">fiber_manual_record</span>
                Start Recording
              </button>

              <button
                v-else
                @click="stopRecording"
                class="inline-flex animate-pulse items-center justify-center gap-2 rounded-lg bg-clay px-4 py-2.5 font-label text-sm font-semibold tracking-[0.04em] text-white shadow-sm transition-all hover:bg-clay/90"
              >
                <span class="material-symbols-outlined text-[18px]">stop_circle</span>
                Stop & Upload
              </button>
            </div>

            <p v-if="!isRecordingSupported" class="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 font-body text-xs text-red-800">
              Native recording needs a browser with microphone support.
            </p>
          </div>
        </section>

        <section class="border-b border-outline-variant/20 px-6 py-5">
          <h3 class="mb-3 flex items-center gap-2 font-label text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant/60">
            <span class="material-symbols-outlined text-[16px]">upload</span>
            {{ hasAudio ? 'Replace Audio' : 'Upload Audio' }}
          </h3>

          <div
            :class="[
              'relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all',
              isDragging ? 'border-secondary bg-secondary-container/20 scale-[1.01]' : 'border-outline-variant/40 bg-surface-container-low/50 hover:border-secondary/50 hover:bg-surface-container-low',
            ]"
            @click="openFilePicker"
            @dragenter="onDragEnter"
            @dragleave="onDragLeave"
            @dragover="onDragOver"
            @drop="onDrop"
          >
            <span :class="['material-symbols-outlined mb-2 text-[36px] transition-colors', isDragging ? 'text-secondary' : 'text-outline-variant']">
              {{ isDragging ? 'file_download' : 'cloud_upload' }}
            </span>
            <p class="font-body text-sm font-medium text-on-surface-variant">
              {{ isDragging ? 'Drop audio file here' : 'Drag & drop audio file' }}
            </p>
            <p class="mt-1 font-body text-xs text-outline">MP3, WAV, OGG, WEBM, M4A - max 10MB</p>

            <div v-if="audioFile" class="mt-3 inline-flex items-center gap-2 rounded-full bg-secondary-container/40 px-3 py-1.5">
              <span class="material-symbols-outlined text-[14px] text-secondary">audio_file</span>
              <span class="font-body text-xs font-medium text-on-surface">{{ audioFile.name }}</span>
            </div>
          </div>

          <input
            ref="fileInput"
            type="file"
            accept=".mp3,.wav,.ogg,.webm,.m4a,audio/*"
            class="hidden"
            @change="onFileChange"
          />
        </section>

        <div v-if="statusMessage" class="px-6 py-3">
          <div :class="[
            'flex items-center gap-2 rounded-lg border px-4 py-2.5 font-body text-sm',
            statusType === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : statusType === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-secondary-container bg-secondary-container/20 text-secondary',
          ]">
            <span class="material-symbols-outlined text-[16px]">
              {{ statusType === 'success' ? 'check_circle' : statusType === 'error' ? 'error' : 'info' }}
            </span>
            {{ statusMessage }}
          </div>
        </div>
      </div>

      <footer class="border-t border-outline-variant/30 bg-surface-container-low/50 px-6 py-4">
        <div class="flex items-center gap-3">
          <button
            v-if="audioFile"
            @click="uploadAudio"
            :disabled="isUploading"
            class="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-label text-sm font-semibold tracking-[0.04em] text-on-primary shadow-md transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span class="material-symbols-outlined text-[18px]">{{ isUploading ? 'hourglass_top' : 'cloud_upload' }}</span>
            {{ isUploading ? 'Uploading...' : 'Save Audio' }}
          </button>

          <button
            v-if="hasAudio && !audioFile"
            @click="replaceAudio"
            class="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-secondary px-4 py-2.5 font-label text-sm font-semibold tracking-[0.04em] text-secondary transition-all hover:bg-secondary hover:text-on-secondary"
          >
            <span class="material-symbols-outlined text-[18px]">swap_horiz</span>
            Replace Audio
          </button>

          <button
            v-if="hasAudio && !audioFile"
            @click="deleteAudio"
            :disabled="isUploading"
            class="inline-flex items-center justify-center gap-2 rounded-lg border border-clay/30 px-4 py-2.5 font-label text-sm font-semibold tracking-[0.04em] text-clay transition-all hover:bg-clay hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span class="material-symbols-outlined text-[18px]">delete</span>
            Delete
          </button>

          <button
            v-if="audioFile"
            @click="audioFile = null; audioUrl = persistedAudioUrl; if (fileInput) fileInput.value = ''"
            class="inline-flex items-center justify-center gap-2 rounded-lg border border-outline-variant px-4 py-2.5 font-label text-sm font-semibold tracking-[0.04em] text-on-surface-variant transition-all hover:bg-surface-variant"
          >
            Cancel
          </button>
        </div>
      </footer>
    </aside>
  </div>
</template>

<style scoped>
@keyframes slide-in {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.animate-slide-in {
  animation: slide-in 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.audio-progress-bar {
  width: v-bind(audioProgressWidth);
}

.filled-symbol {
  font-variation-settings: "FILL" 1;
}
</style>
