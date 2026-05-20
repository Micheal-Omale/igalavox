<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AppButton from '../components/AppButton.vue'
import ImpactMap from '../components/ImpactMap.vue'
import {
  fetchLgas,
  getCategoryMeta,
  normalizeCoordinate,
  impactCategories,
  buildLocationDescription,
  submitImpactReport,
  uploadImpactImages,
} from '../services/impactService'

const defaultCenter = [7.4934, 7.1737]

const lgas = ref([])
const mapCenter = ref(defaultCenter)
const form = ref({
  lga: '',
  communityName: '',
  nearbyLandmark: '',
  marketName: '',
  schoolOrHospitalNearby: '',
  localDescription: '',
  latitude: null,
  longitude: null,
  category: '',
  description: '',
})
const imageFiles = ref([])
const imagePreviews = ref([])
const isLoading = ref(false)
const isSubmitting = ref(false)
const isUsingLocation = ref(false)
const submitStage = ref('')
const success = ref(false)
const errorMessage = ref('')

const coordinateDraft = computed({
  get() {
    return {
      latitude: form.value.latitude,
      longitude: form.value.longitude,
    }
  },
  set(value) {
    form.value.latitude = normalizeCoordinate(value?.latitude)
    form.value.longitude = normalizeCoordinate(value?.longitude)
  },
})

const canSubmit = computed(() => {
  return form.value.category
    && form.value.description.trim().length >= 20
    && form.value.latitude !== null
    && form.value.longitude !== null
    && imageFiles.value.length > 0
    && !isSubmitting.value
})

function syncCenter(latitude, longitude) {
  if (latitude === null || longitude === null) return
  mapCenter.value = [latitude, longitude]
}

function setCoordinates(latitude, longitude) {
  form.value.latitude = normalizeCoordinate(latitude)
  form.value.longitude = normalizeCoordinate(longitude)
  syncCenter(form.value.latitude, form.value.longitude)
}

function formatCoordinates() {
  if (form.value.latitude === null || form.value.longitude === null) return 'No location pin placed yet'
  return `${form.value.latitude}, ${form.value.longitude}`
}

function resetPreviews() {
  imagePreviews.value.forEach((url) => URL.revokeObjectURL(url))
  imagePreviews.value = []
}

async function loadLgas() {
  isLoading.value = true
  try {
    lgas.value = await fetchLgas()
  } catch (error) {
    errorMessage.value = 'Location options could not be loaded yet.'
    console.error('Failed to load LGAs:', error)
  } finally {
    isLoading.value = false
  }
}

function useCurrentLocation() {
  errorMessage.value = ''

  if (!navigator.geolocation) {
    errorMessage.value = 'Current location is not supported by this browser.'
    return
  }

  isUsingLocation.value = true
  navigator.geolocation.getCurrentPosition(
    (position) => {
      setCoordinates(position.coords.latitude, position.coords.longitude)
      isUsingLocation.value = false
    },
    () => {
      errorMessage.value = 'Location access was not granted. You can drag the map pin manually.'
      isUsingLocation.value = false
    },
    { enableHighAccuracy: true, timeout: 10000 },
  )
}

function handleImageChange(event) {
  const selectedFiles = Array.from(event.target.files || [])
  const files = selectedFiles.slice(0, 3)
  errorMessage.value = ''

  const validFiles = []
  if (selectedFiles.length > 3) {
    errorMessage.value = 'Maximum 3 images allowed. Only the first 3 were selected.'
  }

  for (const file of files) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      errorMessage.value = 'Upload JPG, PNG, or WEBP images only.'
      continue
    }
    if (file.size > 5 * 1024 * 1024) {
      errorMessage.value = 'Each image must be smaller than 5MB.'
      continue
    }
    validFiles.push(file)
  }

  imageFiles.value = validFiles
  resetPreviews()
  imagePreviews.value = validFiles.map((file) => URL.createObjectURL(file))
}

function buildDescription() {
  return buildLocationDescription({
    nearbyLandmark: form.value.nearbyLandmark,
    marketName: form.value.marketName,
    schoolOrHospitalNearby: form.value.schoolOrHospitalNearby,
    localDescription: form.value.localDescription,
    description: form.value.description,
  })
}

function locationLabel() {
  const community = form.value.communityName.trim()
  const lga = form.value.lga.trim()
  const landmark = form.value.nearbyLandmark.trim()
  if (community && lga) return `${community}, ${lga}`
  if (community) return community
  if (landmark) return landmark
  if (lga) return lga
  return 'Shared community location'
}

function resetForm() {
  form.value = {
    lga: '',
    communityName: '',
    nearbyLandmark: '',
    marketName: '',
    schoolOrHospitalNearby: '',
    localDescription: '',
    latitude: null,
    longitude: null,
    category: '',
    description: '',
  }
  imageFiles.value = []
  resetPreviews()
  mapCenter.value = defaultCenter
}

async function handleSubmit() {
  if (!canSubmit.value) return

  isSubmitting.value = true
  submitStage.value = 'Uploading evidence images...'
  errorMessage.value = ''

  try {
    const imageUrls = await uploadImpactImages(imageFiles.value)
    submitStage.value = 'Saving report...'

    const categoryMeta = getCategoryMeta(form.value.category)
    await submitImpactReport({
      category: form.value.category,
      title: `${categoryMeta.label} issue near ${locationLabel()}`,
      description: buildDescription(),
      community_name: form.value.communityName.trim()
        || form.value.nearbyLandmark.trim()
        || 'Shared community location',
      lga: form.value.lga.trim() || 'Unspecified',
      latitude: form.value.latitude,
      longitude: form.value.longitude,
      image_urls: imageUrls.filter(Boolean).slice(0, 3),
      status: 'pending',
      verified: false,
    })

    success.value = true
    resetForm()
  } catch (error) {
    errorMessage.value = error.message || 'Report could not be submitted.'
    console.error('Failed to submit impact report:', error)
  } finally {
    isSubmitting.value = false
    submitStage.value = ''
  }
}

onMounted(loadLgas)

function categoryAccentClass(categoryKey) {
  return {
    water: 'impact-category-water',
    electricity: 'impact-category-electricity',
    roads: 'impact-category-roads',
    healthcare: 'impact-category-healthcare',
  }[categoryKey] || 'impact-category-default'
}

function categoryIconClass(categoryKey) {
  return {
    water: 'bg-blue-600',
    electricity: 'bg-yellow-600',
    roads: 'bg-clay',
    healthcare: 'bg-emerald-700',
  }[categoryKey] || 'bg-primary'
}

function categorySelectedIconClass(categoryKey) {
  return {
    water: 'border-blue-600 text-blue-600',
    electricity: 'border-yellow-600 text-yellow-600',
    roads: 'border-clay text-clay',
    healthcare: 'border-emerald-700 text-emerald-700',
  }[categoryKey] || 'border-primary text-primary'
}

watch(
  () => [form.value.latitude, form.value.longitude],
  ([latitude, longitude]) => {
    syncCenter(latitude, longitude)
  },
)

onBeforeUnmount(() => {
  resetPreviews()
})
</script>

<template>
  <main class="bg-surface px-4 py-10 sm:px-6 lg:py-14">
    <div class="mx-auto max-w-6xl">
      <div v-if="success" class="ambient-shadow rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-8 text-center">
        <span class="material-symbols-outlined mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">check_circle</span>
        <h1 class="mt-5 font-display text-3xl font-bold text-primary">Report Submitted</h1>
        <p class="mx-auto mt-3 max-w-xl font-body text-base leading-7 text-on-surface-variant">
          Your community report is pending review. Approved reports appear on the public impact map and stories feed.
        </p>
        <div class="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <AppButton to="/impact/stories">View Stories</AppButton>
          <AppButton to="/impact" variant="secondary">Back to Impact</AppButton>
        </div>
      </div>

      <template v-else>
        <div class="mb-8 max-w-3xl">
          <p class="mb-3 font-label text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Report an Issue</p>
          <h1 class="font-display text-4xl font-bold leading-tight text-primary sm:text-5xl">Tell the story from your community</h1>
          <p class="mt-4 font-body text-base leading-7 text-on-surface-variant">
            Start with the location, drag the map pin to the exact spot, then add the context and evidence that help reviewers understand the issue.
          </p>
        </div>

        <form class="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]" @submit.prevent="handleSubmit">
          <section class="ambient-shadow space-y-8 rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-5 sm:p-8">
            <p v-if="errorMessage" class="rounded-lg border border-error-container bg-error-container/40 px-4 py-3 font-body text-sm text-on-error-container">
              {{ errorMessage }}
            </p>

            <section>
              <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 class="font-headline text-2xl font-semibold text-primary">Pin the location</h2>
                  <p class="mt-2 font-body text-sm leading-6 text-on-surface-variant">
                    Use your current location first, then tap or drag the pin to the exact place on the map.
                  </p>
                </div>
                <button
                  type="button"
                  class="inline-flex items-center justify-center gap-2 rounded border border-secondary px-4 py-2.5 font-label text-sm font-semibold text-secondary transition hover:bg-surface-container"
                  @click="useCurrentLocation"
                >
                  <span class="material-symbols-outlined text-[18px]">{{ isUsingLocation ? 'progress_activity' : 'my_location' }}</span>
                  {{ isUsingLocation ? 'Finding Location...' : 'Use My Current Location' }}
                </button>
              </div>

              <div class="mt-5 overflow-hidden rounded-xl border border-outline-variant/25 bg-surface p-3">
                <ImpactMap v-model="coordinateDraft" interactive :center="mapCenter" :zoom="11" />
              </div>

              <div class="mt-4 grid gap-4 sm:grid-cols-2">
                <label class="block">
                  <span class="font-label text-sm font-semibold text-on-surface-variant">Latitude</span>
                  <input
                    :value="form.latitude ?? ''"
                    class="mt-2 w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 font-body text-sm text-on-surface outline-none transition focus:border-secondary focus:ring-1 focus:ring-secondary"
                    inputmode="decimal"
                    type="number"
                    step="0.000001"
                    @input="setCoordinates($event.target.value, form.longitude)"
                  />
                </label>

                <label class="block">
                  <span class="font-label text-sm font-semibold text-on-surface-variant">Longitude</span>
                  <input
                    :value="form.longitude ?? ''"
                    class="mt-2 w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 font-body text-sm text-on-surface outline-none transition focus:border-secondary focus:ring-1 focus:ring-secondary"
                    inputmode="decimal"
                    type="number"
                    step="0.000001"
                    @input="setCoordinates(form.latitude, $event.target.value)"
                  />
                </label>
              </div>

              <p class="mt-3 font-body text-xs text-on-surface-variant">Current pin: {{ formatCoordinates() }}</p>
            </section>

            <section>
              <h2 class="font-headline text-2xl font-semibold text-primary">Add local context</h2>
              <p class="mt-2 font-body text-sm leading-6 text-on-surface-variant">
                Coordinates stay primary. Add nearby landmarks or local directions so reviewers can find the place even when map data is incomplete.
              </p>

              <div class="mt-4 grid gap-4 md:grid-cols-2">
                <label class="block">
                  <span class="font-label text-sm font-semibold text-on-surface-variant">LGA</span>
                  <select
                    v-model="form.lga"
                    class="mt-2 w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 font-body text-sm text-on-surface outline-none transition focus:border-secondary focus:ring-1 focus:ring-secondary"
                    :disabled="isLoading"
                  >
                    <option value="">Select LGA if known</option>
                    <option v-for="lga in lgas" :key="lga" :value="lga">{{ lga }}</option>
                  </select>
                </label>

                <label class="block">
                  <span class="font-label text-sm font-semibold text-on-surface-variant">Community or village name</span>
                  <input
                    v-model="form.communityName"
                    class="mt-2 w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 font-body text-sm text-on-surface outline-none transition focus:border-secondary focus:ring-1 focus:ring-secondary"
                    placeholder="Anyigba, Odu, or another local name"
                    type="text"
                  />
                </label>

                <label class="block md:col-span-2">
                  <span class="font-label text-sm font-semibold text-on-surface-variant">Nearby landmark</span>
                  <input
                    v-model="form.nearbyLandmark"
                    class="mt-2 w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 font-body text-sm text-on-surface outline-none transition focus:border-secondary focus:ring-1 focus:ring-secondary"
                    placeholder="Near Ejule market, community borehole, main junction"
                    type="text"
                  />
                </label>

                <label class="block">
                  <span class="font-label text-sm font-semibold text-on-surface-variant">Nearby market</span>
                  <input
                    v-model="form.marketName"
                    class="mt-2 w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 font-body text-sm text-on-surface outline-none transition focus:border-secondary focus:ring-1 focus:ring-secondary"
                    placeholder="Ejule market, Anyigba market"
                    type="text"
                  />
                </label>

                <label class="block">
                  <span class="font-label text-sm font-semibold text-on-surface-variant">Nearby school or hospital</span>
                  <input
                    v-model="form.schoolOrHospitalNearby"
                    class="mt-2 w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 font-body text-sm text-on-surface outline-none transition focus:border-secondary focus:ring-1 focus:ring-secondary"
                    placeholder="Primary school, health centre, clinic"
                    type="text"
                  />
                </label>

                <label class="block md:col-span-2">
                  <span class="font-label text-sm font-semibold text-on-surface-variant">Local description</span>
                  <input
                    v-model="form.localDescription"
                    class="mt-2 w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 font-body text-sm text-on-surface outline-none transition focus:border-secondary focus:ring-1 focus:ring-secondary"
                    placeholder="Behind the chief's palace, along the old Idah road"
                    type="text"
                  />
                </label>
              </div>
            </section>

            <section>
              <h2 class="font-headline text-2xl font-semibold text-primary">Issue Category</h2>
              <div class="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <button
                  v-for="category in impactCategories"
                  :key="category.key"
                  type="button"
                  :class="[
                    'group rounded-2xl border p-4 text-left transition-all duration-300',
                    form.category === category.key
                      ? categoryAccentClass(category.key)
                      : 'border-outline-variant/60 bg-surface hover:border-secondary/60 hover:-translate-y-0.5',
                  ]"
                  @click="form.category = category.key"
                >
                  <div class="flex items-start justify-between gap-3">
                    <span
                      :class="['flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm', categoryIconClass(category.key)]"
                    >
                      <span class="material-symbols-outlined text-[24px]">{{ category.icon }}</span>
                    </span>
                    <span
                      :class="[
                        'inline-flex h-8 w-8 items-center justify-center rounded-full border bg-white/90 transition-all',
                        form.category === category.key ? categorySelectedIconClass(category.key) : 'border-outline-variant/60 text-outline',
                      ]"
                    >
                      <span class="material-symbols-outlined text-[17px]">{{ form.category === category.key ? 'check' : 'radio_button_unchecked' }}</span>
                    </span>
                  </div>
                  <div class="mt-4">
                    <span class="block font-headline text-xl font-semibold leading-snug text-primary">{{ category.label }}</span>
                    <span class="mt-2 block font-body text-sm leading-6 text-on-surface-variant">
                      {{ getCategoryMeta(category.key).label }} issue affecting the community.
                    </span>
                  </div>
                </button>
              </div>
            </section>

            <section>
              <h2 class="font-headline text-2xl font-semibold text-primary">Describe the issue</h2>
              <textarea
                v-model="form.description"
                class="mt-4 min-h-40 w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 font-body text-sm leading-7 text-on-surface outline-none transition focus:border-secondary focus:ring-1 focus:ring-secondary"
                placeholder="Describe what is happening, who is affected, how long the issue has existed, and what people are doing to cope."
                required
              ></textarea>
              <p class="mt-2 font-body text-xs text-on-surface-variant">{{ form.description.trim().length }}/20 minimum characters</p>
            </section>
          </section>

          <aside class="ambient-shadow h-fit space-y-6 rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-5 sm:p-8">
            <section>
              <h2 class="font-headline text-2xl font-semibold text-primary">Upload evidence</h2>
              <p class="mt-2 font-body text-sm leading-6 text-on-surface-variant">
                Attach up to three recent images so the issue can be reviewed clearly before publication.
              </p>

              <label class="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant bg-surface px-4 py-8 text-center transition hover:border-secondary hover:bg-surface-container-low">
                <span class="material-symbols-outlined text-4xl text-secondary">add_photo_alternate</span>
                <span class="mt-3 font-label text-sm font-semibold text-primary">Upload evidence images</span>
                <span class="mt-1 font-body text-xs text-on-surface-variant">JPG, PNG, or WEBP, maximum 3 images</span>
                <input class="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple @change="handleImageChange" />
              </label>

              <div v-if="imagePreviews.length" class="mt-4 grid gap-3 sm:grid-cols-2">
                <img
                  v-for="preview in imagePreviews"
                  :key="preview"
                  :src="preview"
                  alt="Selected report preview"
                  class="h-48 w-full rounded-xl object-cover"
                />
              </div>
            </section>

            <section class="rounded-xl bg-surface-container-low p-4">
              <h3 class="font-label text-sm font-semibold uppercase tracking-[0.08em] text-secondary">Submission Checklist</h3>
              <ul class="mt-3 space-y-2 font-body text-sm text-on-surface-variant">
                <li>Location pin placed on the map</li>
                <li>Issue category selected</li>
                <li>Description gives enough community context</li>
                <li>One to three evidence images attached</li>
              </ul>
            </section>

            <div class="border-t border-outline-variant/30 pt-6">
              <p class="font-body text-sm text-on-surface-variant">Reports are reviewed before they appear publicly as stories.</p>
              <p v-if="submitStage" class="mt-2 font-body text-sm text-secondary">{{ submitStage }}</p>
              <button
                type="submit"
                :disabled="!canSubmit"
                class="mt-4 inline-flex w-full items-center justify-center gap-2 rounded bg-primary px-6 py-3 font-label text-sm font-semibold tracking-[0.05em] text-on-primary transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span class="material-symbols-outlined text-[18px]">{{ isSubmitting ? 'progress_activity' : 'send' }}</span>
                {{ isSubmitting ? 'Submitting...' : 'Submit Report' }}
              </button>
            </div>
          </aside>
        </form>
      </template>
    </div>
  </main>
</template>

<style scoped>
.impact-category-default {
  border-color: rgb(11 61 46 / 0.42);
  background: rgb(11 61 46 / 0.08);
  box-shadow: 0 0 0 2px rgb(11 61 46 / 0.12);
}

.impact-category-water {
  border-color: rgb(37 99 235 / 0.6);
  background: rgb(37 99 235 / 0.08);
  box-shadow: 0 0 0 2px rgb(37 99 235 / 0.12);
}

.impact-category-electricity {
  border-color: rgb(202 138 4 / 0.6);
  background: rgb(202 138 4 / 0.08);
  box-shadow: 0 0 0 2px rgb(202 138 4 / 0.12);
}

.impact-category-roads {
  border-color: rgb(164 74 63 / 0.6);
  background: rgb(164 74 63 / 0.08);
  box-shadow: 0 0 0 2px rgb(164 74 63 / 0.12);
}

.impact-category-healthcare {
  border-color: rgb(4 120 87 / 0.6);
  background: rgb(4 120 87 / 0.08);
  box-shadow: 0 0 0 2px rgb(4 120 87 / 0.12);
}
</style>
