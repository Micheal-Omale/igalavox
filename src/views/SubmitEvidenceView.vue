<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '../components/AppButton.vue'
import { submitEvidence, EVIDENCE_CATEGORIES } from '../services/evidenceService'
import { detectPlatform, normalizeMediaUrl } from '../utils/socialVideo'

const router = useRouter()

const formData = ref({
  mediaUrl: '',
  category: 'general',
  description: '',
  title: '',
  communityName: '',
  lga: ''
})

const detectedPlatform = ref('unknown')
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref(false)

const kogiLGAs = [
  'Adavi', 'Ajaokuta', 'Ankpa', 'Bassa', 'Dekina', 'Ibaji', 'Idah', 'Igalamela-Odolu', 
  'Ijumu', 'Kabba/Bunu', 'Kogi', 'Lokoja', 'Mopa-Muro', 'Ofu', 'Ogori/Magongo', 
  'Okehi', 'Okene', 'Olamaboro', 'Omala', 'Yagba East', 'Yagba West'
].sort()

watch(() => formData.value.mediaUrl, (url) => {
  detectedPlatform.value = detectPlatform(url)
})

const handleSubmit = async () => {
  errorMessage.value = ''
  successMessage.value = false
  
  if (detectedPlatform.value === 'invalid' || detectedPlatform.value === 'unknown') {
    errorMessage.value = 'Please provide a valid YouTube, TikTok, or Facebook URL.'
    return
  }
  
  isSubmitting.value = true
  try {
    const normalizedMediaUrl = normalizeMediaUrl(formData.value.mediaUrl)

    await submitEvidence({
      media_url: normalizedMediaUrl,
      media_type: detectedPlatform.value,
      category: formData.value.category,
      description: formData.value.description,
      title: formData.value.title,
      community_name: formData.value.communityName,
      lga: formData.value.lga
    })
    
    successMessage.value = true
    
    // reset form
    formData.value = {
      mediaUrl: '',
      category: 'general',
      description: '',
      title: '',
      communityName: '',
      lga: ''
    }
  } catch (err) {
    console.error('Submission failed:', err)
    errorMessage.value = 'An error occurred while submitting. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="flex-grow bg-surface py-12 sm:py-16">
    <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      <RouterLink to="/impact/evidence" class="mb-8 inline-flex items-center gap-1 font-label text-sm font-semibold text-tertiary hover:underline">
        <span class="material-symbols-outlined text-sm">arrow_back</span>
        Back to Archive
      </RouterLink>

      <div class="mb-10">
        <p class="font-label text-sm font-semibold uppercase tracking-widest text-secondary">Contribute</p>
        <h1 class="mt-2 font-display text-3xl font-bold text-primary sm:text-4xl">Submit Community Evidence</h1>
        <p class="mt-4 font-body text-base text-on-surface-variant max-w-2xl">
          Help document life, challenges, and cultural events in our communities. 
          Provide a link to a public video on Facebook, TikTok, or YouTube, and tell us what it's about.
        </p>
      </div>

      <div v-if="successMessage" class="rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 mb-4">
          <span class="material-symbols-outlined text-emerald-600">check_circle</span>
        </div>
        <h2 class="font-display text-xl font-bold text-emerald-800">Evidence Submitted!</h2>
        <p class="mt-2 text-emerald-700">Thank you for contributing. Your submission has been received and is pending admin approval.</p>
        <div class="mt-6">
          <AppButton @click="successMessage = false" variant="secondary">Submit Another</AppButton>
        </div>
      </div>

      <form v-else @submit.prevent="handleSubmit" class="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 sm:p-8 shadow-sm">
        
        <div v-if="errorMessage" class="mb-6 rounded-lg bg-error-container/20 p-4 border border-error/20 text-error text-sm">
          {{ errorMessage }}
        </div>

        <div class="space-y-6">
          <!-- Required Fields -->
          <div>
            <label for="mediaUrl" class="block font-label text-sm font-bold text-on-surface mb-2">
              Video URL <span class="text-error">*</span>
            </label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">link</span>
              <input 
                type="url" 
                id="mediaUrl" 
                v-model="formData.mediaUrl"
                required
                placeholder="https://www.youtube.com/watch?v=..."
                class="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 pl-10 text-on-surface focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                :class="{'border-error': detectedPlatform === 'invalid'}"
              />
            </div>
            
            <div class="mt-3">
              <div v-if="detectedPlatform === 'invalid'" class="text-xs font-semibold text-error flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">error</span> Unsupported link. Please use Facebook, TikTok, or YouTube.
              </div>
              <div v-else-if="detectedPlatform !== 'unknown'" class="flex items-center gap-2">
                <span class="inline-flex items-center gap-1 rounded bg-tertiary-container px-2 py-1 font-label text-xs font-bold text-on-tertiary-container capitalize">
                  <span class="material-symbols-outlined text-[14px]">play_circle</span>
                  {{ detectedPlatform }} Detected
                </span>
                <span class="text-xs text-on-surface-variant">A preview will be generated upon approval.</span>
              </div>
            </div>
          </div>

          <div class="grid gap-6 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label for="category" class="block font-label text-sm font-bold text-on-surface mb-2">
                Category <span class="text-error">*</span>
              </label>
              <select 
                id="category" 
                v-model="formData.category"
                required
                class="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 text-on-surface focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              >
                <option v-for="cat in EVIDENCE_CATEGORIES" :key="cat.id" :value="cat.id">{{ cat.label }}</option>
              </select>
            </div>
            
            <div class="sm:col-span-2">
              <label for="description" class="block font-label text-sm font-bold text-on-surface mb-2">
                Description <span class="text-error">*</span>
              </label>
              <textarea 
                id="description" 
                v-model="formData.description"
                required
                rows="3"
                placeholder="What is happening in this video? Why is it important?"
                class="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 text-on-surface focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              ></textarea>
            </div>
          </div>

          <hr class="border-outline-variant/30 my-2" />
          
          <p class="font-label text-xs font-bold uppercase tracking-wider text-secondary">Optional Details</p>

          <div class="space-y-6">
            <div>
              <label for="title" class="block font-label text-sm font-semibold text-on-surface mb-2">Title</label>
              <input 
                type="text" 
                id="title" 
                v-model="formData.title"
                placeholder="Give this evidence a clear, descriptive title"
                class="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 text-on-surface focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
            </div>
            
            <div class="grid gap-6 sm:grid-cols-2">
              <div>
                <label for="community" class="block font-label text-sm font-semibold text-on-surface mb-2">Community / Village</label>
                <input 
                  type="text" 
                  id="community" 
                  v-model="formData.communityName"
                  placeholder="e.g. Anyigba"
                  class="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 text-on-surface focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
              </div>
              
              <div>
                <label for="lga" class="block font-label text-sm font-semibold text-on-surface mb-2">Local Government Area (LGA)</label>
                <select 
                  id="lga" 
                  v-model="formData.lga"
                  class="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 text-on-surface focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                >
                  <option value="">Select LGA...</option>
                  <option v-for="lga in kogiLGAs" :key="lga" :value="lga">{{ lga }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8 flex items-center justify-end border-t border-outline-variant/30 pt-6">
          <AppButton type="submit" :disabled="isSubmitting || detectedPlatform === 'invalid'">
            <span class="material-symbols-outlined text-[18px]">cloud_upload</span>
            {{ isSubmitting ? 'Submitting...' : 'Submit Evidence' }}
          </AppButton>
        </div>
      </form>
      
    </div>
  </main>
</template>
