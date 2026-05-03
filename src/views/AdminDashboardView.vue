<script setup>
import { computed, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import BrandLogo from '../components/BrandLogo.vue'

const isMobileMenuOpen = ref(false)
const audioInput = ref(null)
const isRecording = ref(false)
const uploadedAudio = ref(null)
const statusMessage = ref('')

const navItems = [
  { label: 'Dashboard', icon: 'dashboard', to: '/admin', active: false },
  { label: 'Names', icon: 'menu_book', to: '/admin/names', active: false },
  { label: 'Add New Name', icon: 'add_circle', to: '/admin', active: true },
  { label: 'Settings', icon: 'settings', to: '/admin/names', active: false },
]

const categoryOptions = [
  { label: 'Spiritual', value: 'spiritual' },
  { label: 'Royal', value: 'royal' },
  { label: 'Circumstantial', value: 'circumstantial' },
  { label: 'Historical', value: 'historical' },
]

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Unisex', value: 'unisex' },
]

const form = reactive({
  name: '',
  category: '',
  gender: '',
  meaning: '',
  originStory: '',
})

const uploadedAudioLabel = computed(() => uploadedAudio.value?.name || '')

const openUploadPicker = () => {
  audioInput.value?.click()
}

const handleAudioChange = (event) => {
  const [file] = event.target.files || []
  if (!file) return

  uploadedAudio.value = file
  statusMessage.value = `${file.name} ready for save.`
}

const removeAudio = () => {
  uploadedAudio.value = null
  statusMessage.value = 'Audio removed.'

  if (audioInput.value) {
    audioInput.value.value = ''
  }
}

const toggleRecord = () => {
  isRecording.value = !isRecording.value
  statusMessage.value = isRecording.value ? 'Native recording demo started.' : 'Native recording demo stopped.'
}

const saveDraft = () => {
  statusMessage.value = 'Draft saved locally in this demo.'
}

const saveName = () => {
  statusMessage.value = 'Name entry saved in this demo.'
}
</script>

<template>
  <main class="min-h-dvh bg-surface text-on-surface">
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
          <div class="flex items-center gap-3">
            <button
              class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant text-on-surface-variant transition-colors hover:text-primary md:hidden"
              type="button"
              aria-label="Open menu"
              @click="isMobileMenuOpen = true"
            >
              <span class="material-symbols-outlined">menu</span>
            </button>
            <div>
              <p class="font-display text-lg font-bold text-primary">Heritage Admin</p>
              <p class="hidden font-body text-sm text-on-surface-variant sm:block">Add and manage archive name entries.</p>
            </div>
          </div>

          <div class="flex items-center gap-3 sm:gap-4">
            <button class="text-on-surface-variant transition-colors hover:text-primary" type="button" aria-label="Notifications">
              <span class="material-symbols-outlined">notifications</span>
            </button>
            <button class="text-on-surface-variant transition-colors hover:text-primary" type="button" aria-label="Help">
              <span class="material-symbols-outlined">help_outline</span>
            </button>
            <div class="h-9 w-9 overflow-hidden rounded-full bg-primary-container">
              <img
                alt="Administrator profile"
                class="h-full w-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkZYYrCO5XJhwskCvHMcMMohx9M580KkZAG_JLTwahAAQQk_5HRgZ9de_0TPxhI2rn1wJsJ6Yn6poqMMkvXsBqroJq7kTceHW1oTB52J88qAz5UL5_Uo91GDwcKz4avNokzsFwkiOgzNgqnap8f1mJfV76DD31r0g6cfytv3TWBRUa15vbU_UU8Kp77kEtTNZURoU8y5BHytftROsEsmQMPib0emn09foIC5nG0MZJk3ebFKwnTKO1m0QkprpEVCVEmc5YtWDQ4r49"
              />
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

        <section class="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div class="mx-auto max-w-3xl">
            <div class="mb-8">
              <h2 class="mb-2 font-headline text-3xl font-semibold text-primary sm:text-[32px]">Add New Name</h2>
              <p class="font-body text-base text-on-surface-variant">
                Enter details for a new heritage name entry into the digital archive.
              </p>
            </div>

            <form class="space-y-6" @submit.prevent="saveName">
              <section class="rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-[0_2px_10px_rgba(92,58,33,0.05)] sm:p-6">
                <h3 class="mb-4 border-b border-outline-variant/40 pb-2 font-headline text-2xl font-semibold text-primary">
                  Basic Info
                </h3>

                <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <label class="md:col-span-2">
                    <span class="mb-2 block font-label text-sm font-semibold tracking-[0.05em] text-on-surface">Name</span>
                    <input
                      v-model="form.name"
                      class="w-full rounded border border-outline-variant bg-surface-container px-4 py-3 font-body text-base text-on-surface outline-none transition focus:border-tertiary focus:ring-1 focus:ring-tertiary"
                      placeholder="e.g. Achile"
                      type="text"
                    />
                  </label>

                  <label>
                    <span class="mb-2 block font-label text-sm font-semibold tracking-[0.05em] text-on-surface">Category</span>
                    <select
                      v-model="form.category"
                      class="w-full rounded border border-outline-variant bg-surface-container px-4 py-3 font-body text-base text-on-surface outline-none transition focus:border-tertiary focus:ring-1 focus:ring-tertiary"
                    >
                      <option disabled value="">Select category</option>
                      <option v-for="option in categoryOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                    </select>
                  </label>

                  <label>
                    <span class="mb-2 block font-label text-sm font-semibold tracking-[0.05em] text-on-surface">Gender</span>
                    <select
                      v-model="form.gender"
                      class="w-full rounded border border-outline-variant bg-surface-container px-4 py-3 font-body text-base text-on-surface outline-none transition focus:border-tertiary focus:ring-1 focus:ring-tertiary"
                    >
                      <option disabled value="">Select gender</option>
                      <option v-for="option in genderOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                    </select>
                  </label>
                </div>
              </section>

              <section class="rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-[0_2px_10px_rgba(92,58,33,0.05)] sm:p-6">
                <h3 class="mb-4 border-b border-outline-variant/40 pb-2 font-headline text-2xl font-semibold text-primary">
                  Meaning
                </h3>

                <label>
                  <span class="mb-2 block font-label text-sm font-semibold tracking-[0.05em] text-on-surface">Short Meaning</span>
                  <input
                    v-model="form.meaning"
                    class="w-full rounded border border-outline-variant bg-surface-container px-4 py-3 font-body text-base text-on-surface outline-none transition focus:border-tertiary focus:ring-1 focus:ring-tertiary"
                    placeholder="Brief translation or essence"
                    type="text"
                  />
                </label>
              </section>

              <section class="rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-[0_2px_10px_rgba(92,58,33,0.05)] sm:p-6">
                <h3 class="mb-4 border-b border-outline-variant/40 pb-2 font-headline text-2xl font-semibold text-primary">
                  Origin Story
                </h3>

                <label>
                  <span class="mb-2 block font-label text-sm font-semibold tracking-[0.05em] text-on-surface">Detailed Narrative</span>
                  <textarea
                    v-model="form.originStory"
                    class="min-h-36 w-full rounded border border-outline-variant bg-surface-container px-4 py-3 font-body text-base text-on-surface outline-none transition focus:border-tertiary focus:ring-1 focus:ring-tertiary"
                    placeholder="Provide cultural context, historical background, and deep meaning..."
                  ></textarea>
                </label>
              </section>

              <section class="rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-[0_2px_10px_rgba(92,58,33,0.05)] sm:p-6">
                <h3 class="mb-4 border-b border-outline-variant/40 pb-2 font-headline text-2xl font-semibold text-primary">
                  Pronunciation Audio
                </h3>

                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <button
                    class="group flex min-h-40 flex-col items-center justify-center rounded-lg border-2 border-dashed border-outline-variant bg-surface-container-low p-6 text-center transition-colors hover:bg-surface-container"
                    type="button"
                    @click="toggleRecord"
                  >
                    <span class="material-symbols-outlined mb-2 text-4xl text-tertiary transition-transform group-hover:scale-110">
                      {{ isRecording ? 'radio_button_checked' : 'mic' }}
                    </span>
                    <p class="font-label text-sm font-semibold tracking-[0.05em] text-on-surface">
                      {{ isRecording ? 'Stop Recording' : 'Record Natively' }}
                    </p>
                    <p class="font-body text-xs text-outline">Capture audio using your device</p>
                  </button>

                  <button
                    class="group flex min-h-40 flex-col items-center justify-center rounded-lg border-2 border-dashed border-outline-variant bg-surface-container-low p-6 text-center transition-colors hover:bg-surface-container"
                    type="button"
                    @click="openUploadPicker"
                  >
                    <span class="material-symbols-outlined mb-2 text-4xl text-tertiary transition-transform group-hover:scale-110">cloud_upload</span>
                    <p class="font-label text-sm font-semibold tracking-[0.05em] text-on-surface">Upload Locally</p>
                    <p class="font-body text-xs text-outline">MP3, WAV (Max 5MB)</p>
                  </button>
                </div>

                <input
                  ref="audioInput"
                  class="hidden"
                  accept=".mp3,.wav,audio/mpeg,audio/wav"
                  type="file"
                  @change="handleAudioChange"
                />

                <div
                  v-if="uploadedAudioLabel"
                  class="mt-4 flex flex-wrap items-center justify-between gap-3 rounded border border-outline-variant bg-surface p-3"
                >
                  <div class="flex min-w-0 items-center gap-3">
                    <button
                      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-tertiary text-tertiary transition-colors hover:bg-tertiary hover:text-on-tertiary"
                      type="button"
                    >
                      <span class="material-symbols-outlined text-sm">play_arrow</span>
                    </button>
                    <span class="truncate font-body text-base text-on-surface">{{ uploadedAudioLabel }}</span>
                  </div>

                  <button class="text-error transition-colors hover:opacity-80" type="button" @click="removeAudio">
                    <span class="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </section>

              <div class="flex flex-col items-start justify-between gap-4 border-t border-outline-variant/50 pt-2 sm:flex-row sm:items-center">
                <p v-if="statusMessage" class="font-body text-sm text-on-surface-variant">{{ statusMessage }}</p>
                <div v-else class="hidden sm:block"></div>

                <div class="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
                  <RouterLink class="font-label text-sm font-semibold tracking-[0.05em] text-on-surface-variant transition-colors hover:text-on-surface" to="/">
                    Cancel
                  </RouterLink>
                  <button
                    class="rounded border border-secondary px-4 py-2 font-label text-sm font-semibold tracking-[0.05em] text-secondary transition-colors hover:bg-secondary/5"
                    type="button"
                    @click="saveDraft"
                  >
                    Save as Draft
                  </button>
                  <button
                    class="rounded bg-tertiary px-4 py-2 font-label text-sm font-semibold tracking-[0.05em] text-on-tertiary transition-colors hover:bg-tertiary-container"
                    type="submit"
                  >
                    Save Name
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>
