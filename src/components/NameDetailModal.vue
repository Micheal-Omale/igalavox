<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { resolveNameAudioSource, useAudioPlayer } from '../composables/useAudioPlayer'
import { getDisplayName, normalizeText } from '../composables/useTonalNames'

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

const {
  isSourceErrored,
  isSourceLoading,
  isSourcePlaying,
  stopAudio,
  toggleAudio: toggleSharedAudio,
} = useAudioPlayer()
const isFavorite = ref(false)
const isBookmarked = ref(false)
const shareCopied = ref(false)
const isDownloading = ref(false)
const downloadToast = ref('')
let downloadToastTimer = null

const textureImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9abV2ySsQuKE2vmMjO7ZwtEcWB00N_l-Mh6UZfAvJ7kDg42DUJ08qJmhLII3iY3k7sXlrYO-OI2M_NpgYERc0G59_iKiQwaedzODNK_dp9Ukjj5QLlcd-u64D-OoocdPqL2b6KbYlWOO5oVh85fJkoWfa8fVdE0wOG6gHOvGtGLWonn6W805OY8F3qVCW2vsuNjCZ-hz7OBZrg9WblNolZW44Fm0aOfWo3o9pAerlk6rgqqEeCvelug6E6AKOeQVqqc5VmzBmtZrE'

const entry = computed(() => (typeof props.name === 'string' ? { name: props.name } : props.name))

const displayName = computed(() => getDisplayName(entry.value) || 'Unnamed entry')
const pronunciation = computed(() => entry.value.pronunciation || '')
const category = computed(() => entry.value.category || entry.value.origin || 'Archive')
const meaning = computed(() => entry.value.meaning || 'Meaning is being reviewed by the archive team.')
const story = computed(() => entry.value.story || entry.value.description || entry.value.origin_story_final || entry.value.origin_story_ai || 'This archive entry is still gathering its full cultural context, oral history, and family usage notes.')
const proverb = computed(() => entry.value.proverb || 'A name remembered keeps the lineage awake.')
const modalAudioSrc = computed(() => resolveNameAudioSource(entry.value, props.audioSrc))
const isPlaying = isSourcePlaying(modalAudioSrc)
const isLoadingAudio = isSourceLoading(modalAudioSrc)
const hasAudioError = isSourceErrored(modalAudioSrc)
const audioButtonLabel = computed(() => {
  if (!modalAudioSrc.value) return `No pronunciation audio for ${displayName.value}`
  if (hasAudioError.value) return `${displayName.value} pronunciation failed to load`
  if (isLoadingAudio.value) return `Loading ${displayName.value} pronunciation`
  return `${isPlaying.value ? 'Pause' : 'Play'} ${displayName.value} pronunciation`
})
const audioButtonTitle = computed(() => {
  if (!modalAudioSrc.value) return 'No audio available'
  if (hasAudioError.value) return 'Audio failed to load'
  return isPlaying.value ? 'Pause pronunciation' : 'Play pronunciation'
})
const gender = computed(() => entry.value.gender || 'Unisex')
const genderIcon = computed(() => entry.value.genderIcon || (gender.value === 'Male' ? 'male' : gender.value === 'Female' ? 'female' : 'person'))
const tags = computed(() => {
  const rawTags = Array.isArray(entry.value.tags) ? entry.value.tags : []
  return [...new Set([...rawTags, gender.value].filter(Boolean))].slice(0, 3)
})
const primaryTag = computed(() => tags.value[0] || category.value)

const fileBaseName = computed(() => normalizeText(displayName.value).replace(/[^a-z0-9]+/g, '-') || 'name')

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

const toggleAudio = async () => {
  await toggleSharedAudio(modalAudioSrc, `${displayName.value} pronunciation`)
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
    const height = 1350
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    canvas.width = width
    canvas.height = height

    ctx.clearRect(0, 0, width, height)
    roundedRect(ctx, 0, 0, width, height, 72)
    ctx.clip()

    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#fcf9f4')
    gradient.addColorStop(0.56, '#f4ede1')
    gradient.addColorStop(1, '#efe4d2')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
    drawNoise(ctx, width, height)

    const sans = '"Plus Jakarta Sans", sans-serif'
    const serif = '"Noto Serif", serif'
    const tagText = `${category.value} • ${gender.value}`.toUpperCase()

    ctx.save()
    roundedRect(ctx, 48, 48, width - 96, height - 96, 58)
    ctx.fillStyle = '#fcf9f4'
    ctx.fill()
    ctx.strokeStyle = 'rgba(124, 86, 59, 0.18)'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.restore()

    ctx.save()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `700 32px ${sans}`
    const tagWidth = Math.min(ctx.measureText(tagText).width + 88, width - 220)
    const tagX = (width - tagWidth) / 2
    roundedRect(ctx, tagX, 92, tagWidth, 68, 34)
    ctx.fillStyle = '#f6f3ee'
    ctx.fill()
    ctx.strokeStyle = 'rgba(124, 86, 59, 0.18)'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = '#7c563b'
    ctx.fillText(tagText, width / 2, 126, tagWidth - 48)
    ctx.restore()

    ctx.save()
    ctx.beginPath()
    ctx.moveTo(164, 184)
    ctx.lineTo(916, 184)
    ctx.strokeStyle = 'rgba(203, 167, 47, 0.48)'
    ctx.lineWidth = 2
    ctx.stroke()
    for (let index = 0; index < 3; index += 1) {
      const cx = 460 + index * 80
      ctx.fillStyle = index === 1 ? '#cba72f' : '#d6c6aa'
      ctx.beginPath()
      ctx.moveTo(cx, 184)
      ctx.lineTo(cx + 10, 194)
      ctx.lineTo(cx, 204)
      ctx.lineTo(cx - 10, 194)
      ctx.closePath()
      ctx.fill()
    }
    ctx.restore()

    ctx.save()
    const nameSize = fitFontSize(ctx, displayName.value, width - 170, serif, 700, 112, 58)
    ctx.font = `700 ${nameSize}px ${serif}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(92, 67, 49, 0.18)'
    ctx.shadowBlur = 18
    ctx.shadowOffsetY = 8
    ctx.fillStyle = '#00261b'
    ctx.fillText(displayName.value.toUpperCase(), width / 2, 280)
    ctx.restore()

    ctx.save()
    roundedRect(ctx, 114, 350, width - 228, 136, 32)
    ctx.fillStyle = '#7c563b'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255, 224, 136, 0.22)'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#fcf9f4'
    ctx.font = `700 28px ${sans}`
    ctx.fillText('MEANING', width / 2, 377)
    const meaningText = `"${meaning.value.replace(/^"|"$/g, '')}"`
    const meaningSize = fitFontSize(ctx, meaningText, width - 300, serif, 600, 42, 28)
    ctx.font = `italic 600 ${meaningSize}px ${serif}`
    ctx.fillText(meaningText, width / 2, 432)
    ctx.restore()

    ctx.save()
    roundedRect(ctx, 114, 516, width - 228, 502, 34)
    ctx.fillStyle = '#f6f3ee'
    ctx.fill()
    ctx.strokeStyle = 'rgba(124, 86, 59, 0.16)'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = '#7c563b'
    ctx.font = `700 26px ${sans}`
    ctx.fillText('ORIGIN STORY', width / 2, 562)
    ctx.fillStyle = '#2f1502'
    ctx.font = `400 38px ${sans}`
    drawWrappedText(ctx, story.value, width / 2, 626, width - 300, 52, 5)
    ctx.restore()

    ctx.save()
    ctx.beginPath()
    ctx.moveTo(164, 1090)
    ctx.lineTo(916, 1090)
    ctx.strokeStyle = 'rgba(124, 86, 59, 0.18)'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.restore()

    ctx.save()
    ctx.textAlign = 'center'
    ctx.fillStyle = '#00261b'
    ctx.font = `700 30px ${sans}`
    ctx.fillText('IGALAVOX', width / 2, 1152)
    ctx.fillStyle = '#7c563b'
    ctx.font = `400 21px ${sans}`
    ctx.fillText('Preserving Igala Language & Heritage', width / 2, 1190)
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
    <Transition name="name-modal" appear>
      <div
        class="fixed inset-0 z-50 flex items-start justify-center bg-inverse-surface/60 px-3 pb-4 pt-16 backdrop-blur-[2px] sm:px-4 sm:pb-6 sm:pt-24"
        role="presentation"
        @click.self="closeModal"
      >
        <article
          class="relative flex max-h-[82vh] w-full max-w-[95vw] flex-col overflow-hidden rounded-[1.25rem] border border-secondary/15 bg-surface shadow-[0_30px_80px_-34px_rgb(0_0_0_/_0.6)] sm:max-h-[85vh] sm:max-w-[560px] sm:rounded-[1.5rem]"
          aria-labelledby="name-detail-title"
          role="dialog"
          aria-modal="true"
        >
          <div
            v-if="downloadToast"
            class="pointer-events-none absolute left-1/2 top-5 z-30 -translate-x-1/2 rounded-full border border-tertiary-fixed/25 bg-inverse-surface/90 px-4 py-2 text-center text-sm font-semibold text-inverse-on-surface shadow-lg backdrop-blur-sm"
          >
            {{ downloadToast }}
          </div>

          <header class="relative flex-none overflow-hidden bg-[linear-gradient(135deg,#0b3d2e_0%,#2f1502_52%,#735c00_100%)] px-4 py-4 text-on-primary sm:px-8 sm:py-7">
            <img
              :src="textureImage"
              alt=""
              class="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.08] mix-blend-overlay"
            />
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,224,136,0.16),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(188,237,215,0.16),transparent_28%)]"></div>

            <div class="relative z-10 flex items-start justify-between gap-4">
              <div class="flex min-w-0 flex-wrap items-center gap-2">
                <span class="inline-flex items-center rounded-full border border-primary-fixed/20 bg-primary-fixed/10 px-3 py-1 font-label text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-fixed">
                  {{ primaryTag }}
                </span>
                <span class="inline-flex items-center gap-1 rounded-full border border-tertiary-fixed/20 bg-tertiary-fixed/10 px-3 py-1 font-label text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-fixed">
                  <span class="material-symbols-outlined text-[14px]">{{ genderIcon }}</span>
                  {{ gender }}
                </span>
              </div>

              <button
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-tertiary-fixed/20 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary-fixed"
                type="button"
                aria-label="Close name details"
                @click="closeModal"
              >
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <div class="relative z-10 mt-6 sm:mt-8">
              <h1 id="name-detail-title" class="max-w-full break-words font-display text-3xl font-bold leading-[0.96] text-white sm:text-5xl">
                {{ displayName }}
              </h1>

              <div class="mt-3 flex flex-wrap items-center gap-2 sm:mt-4 sm:gap-3">
                <p v-if="pronunciation" class="font-headline text-sm italic text-primary-fixed sm:text-xl">
                  {{ pronunciation }}
                </p>
                <button
                  :class="[
                    'inline-flex min-h-10 items-center gap-2 rounded-full border border-tertiary-fixed/20 bg-tertiary-fixed px-3 py-2 text-on-tertiary-fixed transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:px-4',
                    isPlaying ? 'bg-white text-primary' : 'hover:bg-white/90',
                  ]"
                  type="button"
                  :disabled="!modalAudioSrc"
                  :aria-label="audioButtonLabel"
                  :aria-busy="isLoadingAudio"
                  :title="audioButtonTitle"
                  @click.stop="toggleAudio"
                >
                  <span
                    v-if="isLoadingAudio"
                    class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                    aria-hidden="true"
                  ></span>
                  <span v-else class="material-symbols-outlined text-[18px]">
                    {{ hasAudioError ? 'volume_off' : isPlaying ? 'pause' : 'volume_up' }}
                  </span>
                  <span class="font-label text-sm font-semibold tracking-[0.05em]">
                    {{ hasAudioError ? 'Unavailable' : isLoadingAudio ? 'Loading' : isPlaying ? 'Playing' : modalAudioSrc ? 'Listen' : 'No audio' }}
                  </span>
                </button>
              </div>
            </div>
          </header>

          <div class="custom-scrollbar flex-1 overflow-y-auto bg-[linear-gradient(180deg,#f8f2e8_0%,#fcf9f4_100%)] px-4 py-5 sm:px-8 sm:py-8">
            <div class="space-y-5 sm:space-y-6">
              <section class="space-y-2">
                <h2 class="font-label text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
                  Meaning
                </h2>
                <p class="font-headline text-xl font-semibold leading-snug text-primary sm:text-3xl">
                  {{ meaning }}
                </p>
              </section>

              <section class="relative pl-6">
                <div class="absolute bottom-0 left-0 top-0 w-0.5 bg-secondary"></div>
                <p class="font-body text-sm italic leading-7 text-on-surface-variant sm:text-lg sm:leading-8">
                  {{ story }}
                </p>
              </section>

              <section class="rounded-[1.2rem] border border-tertiary-container/30 bg-[linear-gradient(180deg,rgba(203,167,47,0.12)_0%,rgba(246,243,238,0.8)_100%)] p-4 sm:p-6">
                <h2 class="mb-2 font-label text-xs font-semibold uppercase tracking-[0.18em] text-tertiary sm:mb-3">
                  Related Proverb
                </h2>
                <blockquote class="font-headline text-lg font-medium italic leading-snug text-on-tertiary-container sm:text-2xl">
                  "{{ proverb }}"
                </blockquote>
              </section>

              <section class="mt-2 flex flex-col gap-3 border-t border-outline-variant/20 pt-5 sm:hidden">
                <div class="flex items-center gap-3">
                  <button
                    class="flex h-11 w-11 items-center justify-center rounded-full border border-secondary/15 bg-surface-container-lowest text-secondary transition-colors hover:bg-secondary-fixed/20"
                    type="button"
                    :aria-pressed="isFavorite"
                    aria-label="Like this entry"
                    @click="isFavorite = !isFavorite"
                  >
                    <span :class="['material-symbols-outlined', { 'filled-symbol': isFavorite }]">favorite</span>
                  </button>
                  <button
                    class="flex h-11 w-11 items-center justify-center rounded-full border border-tertiary/20 bg-surface-container-lowest text-tertiary transition-colors hover:bg-tertiary-fixed/20"
                    type="button"
                    :aria-pressed="isBookmarked"
                    aria-label="Save this entry"
                    @click="isBookmarked = !isBookmarked"
                  >
                    <span :class="['material-symbols-outlined', { 'filled-symbol': isBookmarked }]">bookmark</span>
                  </button>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <button
                    :class="[
                      'flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-on-primary transition-all',
                      isDownloading ? 'cursor-wait opacity-95 shadow-lg' : 'hover:bg-primary-container hover:shadow-lg',
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
                    class="flex items-center justify-center gap-2 rounded-full border border-outline/20 bg-outline/10 px-4 py-3 text-on-surface transition-colors hover:bg-surface-container"
                    type="button"
                    @click="shareEntry"
                  >
                    <span class="material-symbols-outlined text-[20px]">{{ shareCopied ? 'check' : 'share' }}</span>
                    <span class="font-label text-sm font-semibold tracking-[0.05em]">{{ shareCopied ? 'Copied' : 'Share' }}</span>
                  </button>
                </div>
              </section>
            </div>
          </div>

          <footer class="hidden flex-none flex-col gap-4 border-t border-outline-variant/20 bg-surface-container-low px-4 py-4 sm:flex sm:px-6 sm:py-5">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex items-center gap-3">
                <button
                  class="flex h-11 w-11 items-center justify-center rounded-full border border-secondary/15 bg-surface-container-lowest text-secondary transition-colors hover:bg-secondary-fixed/20"
                  type="button"
                  :aria-pressed="isFavorite"
                  aria-label="Like this entry"
                  @click="isFavorite = !isFavorite"
                >
                  <span :class="['material-symbols-outlined', { 'filled-symbol': isFavorite }]">favorite</span>
                </button>
                <button
                  class="flex h-11 w-11 items-center justify-center rounded-full border border-tertiary/20 bg-surface-container-lowest text-tertiary transition-colors hover:bg-tertiary-fixed/20"
                  type="button"
                  :aria-pressed="isBookmarked"
                  aria-label="Save this entry"
                  @click="isBookmarked = !isBookmarked"
                >
                  <span :class="['material-symbols-outlined', { 'filled-symbol': isBookmarked }]">bookmark</span>
                </button>
              </div>

              <div class="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
                <button
                  :class="[
                    'flex min-w-[144px] items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-on-primary transition-all sm:px-6',
                    isDownloading ? 'cursor-wait opacity-95 shadow-lg' : 'hover:bg-primary-container hover:shadow-lg',
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
                  class="flex items-center gap-2 rounded-full border border-outline/20 bg-outline/10 px-5 py-3 text-on-surface transition-colors hover:bg-surface-container sm:px-6"
                  type="button"
                  @click="shareEntry"
                >
                  <span class="material-symbols-outlined text-[20px]">{{ shareCopied ? 'check' : 'share' }}</span>
                  <span class="font-label text-sm font-semibold tracking-[0.05em]">{{ shareCopied ? 'Copied' : 'Share' }}</span>
                </button>
              </div>
            </div>
          </footer>
        </article>
      </div>
    </Transition>
  </Teleport>
</template>

  <style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 10px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(240, 237, 233, 0.9);
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #7c563b;
  border-radius: 9999px;
  border: 2px solid rgba(240, 237, 233, 0.9);
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #7c563b rgba(240, 237, 233, 0.9);
}

.filled-symbol {
  font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24;
}

.name-modal-enter-active,
.name-modal-leave-active {
  transition: opacity 220ms ease, transform 220ms ease;
}

.name-modal-enter-from,
.name-modal-leave-to {
  opacity: 0;
  transform: scale(0.985);
}
</style>
