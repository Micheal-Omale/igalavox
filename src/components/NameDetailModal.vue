<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  name: {
    type: [Object, String],
    required: true,
  },
  audioSrc: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close'])

const audio = ref(null)
const isPlaying = ref(false)
const isFavorite = ref(false)
const shareCopied = ref(false)
const isDownloading = ref(false)
const downloadToast = ref('')
let downloadToastTimer = null

const textureImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9abV2ySsQuKE2vmMjO7ZwtEcWB00N_l-Mh6UZfAvJ7kDg42DUJ08qJmhLII3iY3k7sXlrYO-OI2M_NpgYERc0G59_iKiQwaedzODNK_dp9Ukjj5QLlcd-u64D-OoocdPqL2b6KbYlWOO5oVh85fJkoWfa8fVdE0wOG6gHOvGtGLWonn6W805OY8F3qVCW2vsuNjCZ-hz7OBZrg9WblNolZW44Fm0aOfWo3o9pAerlk6rgqqEeCvelug6E6AKOeQVqqc5VmzBmtZrE'

const entry = computed(() => (typeof props.name === 'string' ? { name: props.name } : props.name))

const displayName = computed(() => entry.value.name || 'Unnamed entry')
const meaning = computed(() => entry.value.meaning || 'Meaning is being reviewed by the archive team.')
const story = computed(() => entry.value.story || entry.value.description || entry.value.origin_story_final || entry.value.origin_story_ai || 'This archive entry is still gathering its full cultural context, oral history, and family usage notes.')
const proverb = computed(() => entry.value.proverb || 'A name remembered keeps the lineage awake.')
const modalAudioSrc = computed(() => props.audioSrc || entry.value.audioSrc || entry.value.audio_url || entry.value.audioUrl || entry.value.audio || '')
const gender = computed(() => entry.value.gender || 'Unisex')
const region = computed(() => entry.value.region || entry.value.category || entry.value.origin || 'Igala land')
const era = computed(() => entry.value.era || 'Living archive')
const tags = computed(() => {
  const rawTags = Array.isArray(entry.value.tags) ? entry.value.tags : []
  return [...new Set([...rawTags, gender.value].filter(Boolean))].slice(0, 3)
})

const fileBaseName = computed(() => displayName.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'name')

const closeModal = () => {
  stopAudio()
  emit('close')
}

const showDownloadToast = (message, duration = 1800) => {
  downloadToast.value = message

  if (downloadToastTimer) window.clearTimeout(downloadToastTimer)

  if (duration > 0) {
    downloadToastTimer = window.setTimeout(() => {
      downloadToast.value = ''
      downloadToastTimer = null
    }, duration)
  }
}

const handleKeydown = (event) => {
  if (event.key === 'Escape') closeModal()
}

const stopAudio = () => {
  if (!audio.value) return

  audio.value.pause()
  audio.value.currentTime = 0
  isPlaying.value = false
}

const toggleAudio = async () => {
  if (!audio.value || !modalAudioSrc.value) return

  if (isPlaying.value) {
    stopAudio()
    return
  }

  audio.value.currentTime = 0
  await audio.value.play()
  isPlaying.value = true
}

const handleAudioEnded = () => {
  isPlaying.value = false
}

const roundedRect = (ctx, x, y, width, height, radius) => {
  const maxRadius = Math.min(radius, width / 2, height / 2)

  ctx.beginPath()
  ctx.moveTo(x + maxRadius, y)
  ctx.arcTo(x + width, y, x + width, y + height, maxRadius)
  ctx.arcTo(x + width, y + height, x, y + height, maxRadius)
  ctx.arcTo(x, y + height, x, y, maxRadius)
  ctx.arcTo(x, y, x + width, y, maxRadius)
  ctx.closePath()
}

const drawWrappedText = (ctx, text, x, y, maxWidth, lineHeight, maxLines) => {
  const words = text.split(/\s+/)
  const lines = []
  let line = ''

  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word

    if (ctx.measureText(testLine).width <= maxWidth) {
      line = testLine
      return
    }

    if (line) lines.push(line)
    line = word
  })

  if (line) lines.push(line)

  const visibleLines = lines.slice(0, maxLines)

  if (lines.length > maxLines) {
    let finalLine = visibleLines[visibleLines.length - 1] || ''

    while (finalLine.length > 0 && ctx.measureText(`${finalLine}...`).width > maxWidth) {
      finalLine = finalLine.slice(0, -1).trim()
    }

    visibleLines[visibleLines.length - 1] = `${finalLine}...`
  }

  visibleLines.forEach((visibleLine, index) => {
    ctx.fillText(visibleLine, x, y + index * lineHeight)
  })

  return visibleLines.length
}

const fitFontSize = (ctx, text, maxWidth, fontFamily, weight, startSize, minSize) => {
  let size = startSize

  while (size > minSize) {
    ctx.font = `${weight} ${size}px ${fontFamily}`
    if (ctx.measureText(text).width <= maxWidth) return size
    size -= 2
  }

  return minSize
}

const drawNoise = (ctx, width, height) => {
  const noiseCanvas = document.createElement('canvas')
  noiseCanvas.width = 180
  noiseCanvas.height = 320
  const noiseCtx = noiseCanvas.getContext('2d')
  const imageData = noiseCtx.createImageData(noiseCanvas.width, noiseCanvas.height)

  for (let index = 0; index < imageData.data.length; index += 4) {
    const value = Math.random() > 0.5 ? 255 : 0
    imageData.data[index] = value
    imageData.data[index + 1] = value
    imageData.data[index + 2] = value
    imageData.data[index + 3] = 16
  }

  noiseCtx.putImageData(imageData, 0, 0)
  const pattern = ctx.createPattern(noiseCanvas, 'repeat')

  ctx.save()
  ctx.globalCompositeOperation = 'overlay'
  ctx.fillStyle = pattern
  ctx.fillRect(0, 0, width, height)
  ctx.restore()
}

const triggerDownload = (url, filename) => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
}

const wait = (duration) => new Promise((resolve) => {
  window.setTimeout(resolve, duration)
})

const canvasToBlob = (canvas, type) => new Promise((resolve, reject) => {
  canvas.toBlob((blob) => {
    if (!blob) {
      reject(new Error('Failed to create download image'))
      return
    }

    resolve(blob)
  }, type)
})

const downloadEntry = async () => {
  if (isDownloading.value) return

  isDownloading.value = true
  showDownloadToast('Downloading...', 0)
  const downloadStart = performance.now()

  try {
    await document.fonts?.ready

    const width = 1080
    const height = 1920
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    canvas.width = width
    canvas.height = height

    ctx.clearRect(0, 0, width, height)
    roundedRect(ctx, 0, 0, width, height, 72)
    ctx.clip()

    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#d4af37')
    gradient.addColorStop(1, '#a44a3f')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
    drawNoise(ctx, width, height)

    const sans = '"Plus Jakarta Sans", sans-serif'
    const serif = '"Noto Serif", serif'
    const tagText = tags.value.filter(Boolean).join(' / ').toUpperCase()

    ctx.save()
    ctx.font = `700 38px ${sans}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const tagWidth = Math.min(ctx.measureText(tagText).width + 92, width - 160)
    const tagX = (width - tagWidth) / 2
    roundedRect(ctx, tagX, 168, tagWidth, 76, 38)
    ctx.fillStyle = 'rgba(252, 249, 244, 0.2)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(252, 249, 244, 0.3)'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = '#fcf9f4'
    ctx.fillText(tagText, width / 2, 206, tagWidth - 56)
    ctx.restore()

    ctx.save()
    const nameSize = fitFontSize(ctx, displayName.value, width - 160, serif, 700, 128, 62)
    ctx.font = `700 ${nameSize}px ${serif}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(0, 38, 27, 0.35)'
    ctx.shadowBlur = 20
    ctx.shadowOffsetY = 8
    ctx.fillStyle = '#fcf9f4'
    ctx.fillText(displayName.value, width / 2, 700)
    ctx.restore()

    ctx.save()
    roundedRect(ctx, 120, 820, width - 240, 180, 44)
    ctx.fillStyle = 'rgba(252, 249, 244, 0.12)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(252, 249, 244, 0.25)'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = '#fcf9f4'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const meaningText = `"${meaning.value.replace(/^"|"$/g, '')}"`
    const meaningSize = fitFontSize(ctx, meaningText, width - 320, serif, 600, 62, 36)
    ctx.font = `italic 600 ${meaningSize}px ${serif}`
    drawWrappedText(ctx, meaningText, width / 2, 910 - meaningSize / 3, width - 320, meaningSize * 1.25, 2)
    ctx.restore()

    ctx.save()
    roundedRect(ctx, 88, 1270, width - 176, 360, 44)
    ctx.fillStyle = 'rgba(252, 249, 244, 0.12)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(252, 249, 244, 0.24)'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = 'rgba(252, 249, 244, 0.78)'
    ctx.font = `700 34px ${sans}`
    ctx.fillText('ORIGIN STORY', width / 2, 1362)
    ctx.fillStyle = 'rgba(252, 249, 244, 0.92)'
    ctx.font = `400 42px ${sans}`
    drawWrappedText(ctx, story.value, width / 2, 1442, width - 280, 64, 4)
    ctx.restore()

    ctx.save()
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(252, 249, 244, 0.62)'
    ctx.font = `400 30px ${sans}`
    ctx.fillText('- IGALAVOX -', width / 2, 1800)
    ctx.restore()

    const blob = await canvasToBlob(canvas, 'image/png')
    const url = URL.createObjectURL(blob)
    triggerDownload(url, `${fileBaseName.value}-card.png`)

    const remainingTime = 700 - (performance.now() - downloadStart)
    if (remainingTime > 0) await wait(remainingTime)

    showDownloadToast('Downloaded', 1800)
    URL.revokeObjectURL(url)
  } catch {
    showDownloadToast('Download failed', 2200)
  } finally {
    isDownloading.value = false
  }
}

const shareEntry = async () => {
  const shareText = `${displayName.value}: ${meaning.value}`

  if (navigator.share) {
    await navigator.share({
      title: displayName.value,
      text: shareText,
      url: window.location.href,
    })
    return
  }

  await navigator.clipboard.writeText(`${shareText}\n${window.location.href}`)
  shareCopied.value = true
  window.setTimeout(() => {
    shareCopied.value = false
  }, 1600)
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  stopAudio()
  if (downloadToastTimer) window.clearTimeout(downloadToastTimer)
})
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-end justify-center bg-inverse-surface/45 p-3 backdrop-blur-sm sm:items-center sm:p-4"
      role="presentation"
      @click.self="closeModal"
    >
      <article
        class="relative flex max-h-[88vh] w-full max-w-[560px] flex-col overflow-hidden rounded-t-[1.5rem] border border-outline-variant/30 bg-surface shadow-2xl sm:max-h-[min(819px,calc(100vh-2rem))] sm:rounded-xl"
        aria-labelledby="name-detail-title"
        role="dialog"
        aria-modal="true"
      >
        <div
          v-if="downloadToast"
          class="pointer-events-none absolute left-1/2 top-5 z-30 -translate-x-1/2 rounded-full border border-white/15 bg-inverse-surface/90 px-4 py-2 text-center text-sm font-semibold text-inverse-on-surface shadow-lg backdrop-blur-sm"
        >
          {{ downloadToast }}
        </div>

        <header class="relative flex min-h-56 flex-none flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-primary-container via-[#1a2e28] to-secondary px-6 py-8 text-center sm:h-64 sm:p-8">
          <img
            :src="textureImage"
            alt=""
            class="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover opacity-10 mix-blend-overlay"
          />

          <div class="absolute left-4 top-4 z-20 flex max-w-[calc(100%-5rem)] flex-wrap gap-2 sm:left-6 sm:top-6 sm:max-w-[calc(100%-6rem)]">
            <span
              v-for="tag in tags"
              :key="tag"
              class="rounded-full border border-white/20 bg-white/10 px-2 py-1 font-label text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm"
            >
              {{ tag }}
            </span>
          </div>

          <button
            class="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary-fixed sm:right-6 sm:top-6"
            type="button"
            aria-label="Close name details"
            @click="closeModal"
          >
            <span class="material-symbols-outlined">close</span>
          </button>

          <h1 id="name-detail-title" class="relative z-10 mt-3 max-w-full break-words font-display text-3xl font-bold leading-tight text-white sm:mt-4 sm:text-display">
            {{ displayName }}
          </h1>
          <div class="relative z-10 mt-3 flex flex-col items-center gap-3">
            <button
              class="flex items-center gap-2 rounded-full bg-tertiary-fixed px-4 py-1.5 text-on-tertiary-fixed transition-transform hover:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              :disabled="!modalAudioSrc"
              @click.stop="toggleAudio"
            >
              <span class="material-symbols-outlined text-[18px]">
                {{ isPlaying ? 'pause' : 'volume_up' }}
              </span>
              <span class="font-label text-sm font-semibold tracking-[0.05em]">
                {{ isPlaying ? 'Playing' : modalAudioSrc ? 'Listen' : 'No audio' }}
              </span>
            </button>
            <audio v-if="modalAudioSrc" ref="audio" :src="modalAudioSrc" preload="metadata" @ended="handleAudioEnded" />
          </div>
        </header>

        <div class="custom-scrollbar flex-1 space-y-8 overflow-y-auto bg-surface-bright px-5 py-6 sm:space-y-10 sm:px-8 sm:py-10">
          <section class="space-y-2">
            <h2 class="font-label text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
              Meaning
            </h2>
            <p class="font-headline text-2xl font-semibold leading-tight text-primary sm:text-3xl">
              {{ meaning }}
            </p>
          </section>

          <section class="relative pl-6">
            <div class="absolute bottom-0 left-0 top-0 w-0.5 bg-tertiary-fixed-dim"></div>
            <p class="font-body text-base italic leading-8 text-on-surface-variant sm:text-lg">
              {{ story }}
            </p>
          </section>

          <section class="rounded-xl border-l-4 border-tertiary-container bg-tertiary-container/10 p-5 sm:p-6">
            <h2 class="mb-3 font-label text-xs font-semibold uppercase tracking-[0.18em] text-tertiary">
              Related Proverb
            </h2>
            <blockquote class="font-headline text-xl font-medium italic leading-snug text-on-tertiary-container sm:text-2xl">
              "{{ proverb }}"
            </blockquote>
          </section>

          <section class="grid grid-cols-1 gap-5 pt-1 sm:grid-cols-2 sm:gap-6 sm:pt-2">
            <div class="space-y-1">
              <span class="font-label text-xs font-semibold uppercase tracking-[0.14em] text-outline">Region</span>
              <p class="font-body text-base font-semibold text-primary">{{ region }}</p>
            </div>
            <div class="space-y-1">
              <span class="font-label text-xs font-semibold uppercase tracking-[0.14em] text-outline">Era</span>
              <p class="font-body text-base font-semibold text-primary">{{ era }}</p>
            </div>
          </section>
        </div>

        <footer class="flex flex-none flex-col items-stretch gap-3 border-t border-outline-variant/20 bg-surface-container-low p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-6">
          <button
            class="flex h-12 w-12 shrink-0 items-center justify-center self-start rounded-xl bg-surface-container-high text-tertiary transition-colors hover:bg-tertiary-fixed"
            type="button"
            :aria-pressed="isFavorite"
            aria-label="Toggle favorite"
            @click="isFavorite = !isFavorite"
          >
            <span
              class="material-symbols-outlined"
              :style="{ fontVariationSettings: isFavorite ? `'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24` : undefined }"
            >
              favorite
            </span>
          </button>

          <div class="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
            <button
              :class="[
                'flex min-w-[144px] items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-on-primary transition-all sm:px-6',
                isDownloading ? 'cursor-wait opacity-95 shadow-lg' : 'hover:shadow-lg',
              ]"
              type="button"
              :disabled="isDownloading"
              @click="downloadEntry"
            >
              <span
                v-if="isDownloading"
                class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                aria-hidden="true"
              ></span>
              <span v-else class="material-symbols-outlined text-[20px]">download</span>
              <span class="font-label text-sm font-semibold tracking-[0.05em]">
                {{ isDownloading ? 'Downloading...' : 'Download' }}
              </span>
            </button>
            <button
              class="flex items-center gap-2 rounded-full border border-outline/20 bg-outline/10 px-5 py-3 text-on-surface transition-colors hover:bg-outline/20 sm:px-6"
              type="button"
              @click="shareEntry"
            >
              <span class="material-symbols-outlined text-[20px]">{{ shareCopied ? 'check' : 'share' }}</span>
              <span class="font-label text-sm font-semibold tracking-[0.05em]">{{ shareCopied ? 'Copied' : 'Share' }}</span>
            </button>
          </div>
        </footer>
      </article>
    </div>
  </Teleport>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #dcdad5;
  border-radius: 10px;
}
</style>
