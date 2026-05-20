<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import AppButton from '../AppButton.vue'
import { marketplaceCategories, normalizeMarketplaceSlug } from '../../services/marketplaceService'

const props = defineProps({
  product: {
    type: Object,
    default: null,
  },
  submitting: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'cancel'])

const dragIndex = ref(null)
const slugTouched = ref(false)
const imageQueue = ref([])

const form = ref({
  title: '',
  slug: '',
  category: marketplaceCategories[0]?.key || '',
  description: '',
  cultural_story: '',
  vendor_name: '',
  vendor_whatsapp: '',
  vendor_email: '',
  price: '',
  inventory_count: 1,
  materials_used: '',
  availability: 'In stock',
  featured: false,
  published: true,
})

function revokeQueueUrls(queue = []) {
  queue.forEach((item) => {
    if (item.file && item.previewUrl) {
      URL.revokeObjectURL(item.previewUrl)
    }
  })
}

function buildQueueItem({ url = '', file = null }) {
  if (file) {
    return {
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      url: '',
    }
  }

  return {
    id: `${url}-${Math.random()}`,
    file: null,
    previewUrl: url,
    url,
  }
}

function syncFromProduct(product) {
  revokeQueueUrls(imageQueue.value)

  form.value = {
    title: product?.title || '',
    slug: product?.slug || '',
    category: product?.category || marketplaceCategories[0]?.key || '',
    description: product?.description || '',
    cultural_story: product?.cultural_story || '',
    vendor_name: product?.vendor_name || '',
    vendor_whatsapp: product?.vendor_whatsapp || '',
    vendor_email: product?.vendor_email || '',
    price: product?.price ?? '',
    inventory_count: product?.inventory_count ?? 1,
    materials_used: product?.materials_used || '',
    availability: product?.availability || 'In stock',
    featured: Boolean(product?.featured),
    published: product?.published !== false,
  }

  imageQueue.value = (product?.image_urls || []).map((url) => buildQueueItem({ url }))
  slugTouched.value = Boolean(product?.slug)
}

watch(() => props.product, syncFromProduct, { immediate: true })

watch(() => form.value.title, (value) => {
  if (!slugTouched.value) {
    form.value.slug = normalizeMarketplaceSlug(value)
  }
})

const queueCountLabel = computed(() => `${imageQueue.value.length}/5 images`)

function onSlugInput(value) {
  slugTouched.value = true
  form.value.slug = normalizeMarketplaceSlug(value)
}

function handleFileSelection(event) {
  const files = Array.from(event.target.files || [])
  const remaining = Math.max(0, 5 - imageQueue.value.length)
  const nextItems = files.slice(0, remaining).map((file) => buildQueueItem({ file }))
  imageQueue.value = [...imageQueue.value, ...nextItems]
  event.target.value = ''
}

function removeImage(index) {
  const [removed] = imageQueue.value.splice(index, 1)
  if (removed?.file && removed.previewUrl) {
    URL.revokeObjectURL(removed.previewUrl)
  }
}

function moveImage(index, direction) {
  const targetIndex = index + direction
  if (targetIndex < 0 || targetIndex >= imageQueue.value.length) return
  const nextQueue = [...imageQueue.value]
  const [item] = nextQueue.splice(index, 1)
  nextQueue.splice(targetIndex, 0, item)
  imageQueue.value = nextQueue
}

function onDragStart(index) {
  dragIndex.value = index
}

function onDrop(index) {
  if (dragIndex.value === null || dragIndex.value === index) return
  const nextQueue = [...imageQueue.value]
  const [item] = nextQueue.splice(dragIndex.value, 1)
  nextQueue.splice(index, 0, item)
  imageQueue.value = nextQueue
  dragIndex.value = null
}

function submitForm() {
  const existingImages = imageQueue.value.filter((item) => !item.file).map((item) => item.url)
  const newFiles = imageQueue.value.filter((item) => item.file).map((item) => item.file)

  emit('submit', {
    values: {
      ...form.value,
      slug: normalizeMarketplaceSlug(form.value.slug || form.value.title),
    },
    existingImages,
    newFiles,
  })
}

onBeforeUnmount(() => {
  revokeQueueUrls(imageQueue.value)
})
</script>

<template>
  <section class="rounded-[1.75rem] border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm sm:p-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="font-label text-xs font-semibold uppercase tracking-[0.16em] text-secondary">Listing Studio</p>
        <h2 class="mt-2 font-headline text-3xl font-semibold text-primary">
          {{ product ? 'Edit marketplace listing' : 'Create new marketplace listing' }}
        </h2>
      </div>
      <p class="font-body text-sm text-on-surface-variant">{{ queueCountLabel }}</p>
    </div>

    <form class="mt-6 space-y-6" @submit.prevent="submitForm">
      <div class="grid gap-4 md:grid-cols-2">
        <label class="space-y-2">
          <span class="block font-label text-sm font-semibold tracking-[0.05em] text-on-surface">Product Title</span>
          <input v-model="form.title" class="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 font-body text-sm text-on-surface outline-none transition focus:border-tertiary focus:ring-1 focus:ring-tertiary" placeholder="Royal Anyigba textile wrap" type="text" required />
        </label>
        <label class="space-y-2">
          <span class="block font-label text-sm font-semibold tracking-[0.05em] text-on-surface">Slug</span>
          <input :value="form.slug" class="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 font-body text-sm text-on-surface outline-none transition focus:border-tertiary focus:ring-1 focus:ring-tertiary" placeholder="royal-anyigba-textile-wrap" type="text" @input="onSlugInput($event.target.value)" required />
        </label>
      </div>

      <div class="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <label class="space-y-2">
          <span class="block font-label text-sm font-semibold tracking-[0.05em] text-on-surface">Category</span>
          <select v-model="form.category" class="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 font-body text-sm text-on-surface outline-none transition focus:border-tertiary">
            <option v-for="item in marketplaceCategories" :key="item.key" :value="item.key">{{ item.label }}</option>
          </select>
        </label>
        <label class="space-y-2">
          <span class="block font-label text-sm font-semibold tracking-[0.05em] text-on-surface">Artisan / Vendor</span>
          <input v-model="form.vendor_name" class="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 font-body text-sm text-on-surface outline-none transition focus:border-tertiary focus:ring-1 focus:ring-tertiary" placeholder="Attah Loom House" type="text" required />
        </label>
        <label class="space-y-2">
          <span class="block font-label text-sm font-semibold tracking-[0.05em] text-on-surface">Price (NGN)</span>
          <input v-model="form.price" class="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 font-body text-sm text-on-surface outline-none transition focus:border-tertiary focus:ring-1 focus:ring-tertiary" min="0" placeholder="85000" type="number" required />
        </label>
        <label class="space-y-2">
          <span class="block font-label text-sm font-semibold tracking-[0.05em] text-on-surface">Inventory</span>
          <input v-model="form.inventory_count" class="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 font-body text-sm text-on-surface outline-none transition focus:border-tertiary focus:ring-1 focus:ring-tertiary" min="0" type="number" required />
        </label>
      </div>

      <div class="grid gap-4 xl:grid-cols-2">
        <label class="space-y-2">
          <span class="block font-label text-sm font-semibold tracking-[0.05em] text-on-surface">Vendor WhatsApp Number</span>
          <input v-model="form.vendor_whatsapp" class="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 font-body text-sm text-on-surface outline-none transition focus:border-tertiary focus:ring-1 focus:ring-tertiary" placeholder="2348012345678" type="text" required />
        </label>
        <label class="space-y-2">
          <span class="block font-label text-sm font-semibold tracking-[0.05em] text-on-surface">Vendor Email (Optional)</span>
          <input v-model="form.vendor_email" class="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 font-body text-sm text-on-surface outline-none transition focus:border-tertiary focus:ring-1 focus:ring-tertiary" placeholder="artisan@example.com" type="email" />
        </label>
      </div>

      <div class="grid gap-4 xl:grid-cols-2">
        <label class="space-y-2">
          <span class="block font-label text-sm font-semibold tracking-[0.05em] text-on-surface">Short Description</span>
          <textarea v-model="form.description" class="min-h-32 w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 font-body text-sm leading-7 text-on-surface outline-none transition focus:border-tertiary focus:ring-1 focus:ring-tertiary" placeholder="Describe the piece, use, and quality in a concise editorial tone." required></textarea>
        </label>
        <label class="space-y-2">
          <span class="block font-label text-sm font-semibold tracking-[0.05em] text-on-surface">Cultural Story</span>
          <textarea v-model="form.cultural_story" class="min-h-32 w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 font-body text-sm leading-7 text-on-surface outline-none transition focus:border-tertiary focus:ring-1 focus:ring-tertiary" placeholder="Explain the cultural significance, historical meaning, or artisan context." required></textarea>
        </label>
      </div>

      <div class="grid gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <label class="space-y-2">
          <span class="block font-label text-sm font-semibold tracking-[0.05em] text-on-surface">Materials Used</span>
          <input v-model="form.materials_used" class="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 font-body text-sm text-on-surface outline-none transition focus:border-tertiary focus:ring-1 focus:ring-tertiary" placeholder="Handwoven cotton, natural dye, brass clasp" type="text" />
        </label>
        <label class="space-y-2">
          <span class="block font-label text-sm font-semibold tracking-[0.05em] text-on-surface">Availability</span>
          <input v-model="form.availability" class="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 font-body text-sm text-on-surface outline-none transition focus:border-tertiary focus:ring-1 focus:ring-tertiary" placeholder="Limited edition, In stock, Made to order" type="text" />
        </label>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <label class="space-y-2 rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4">
          <span class="block font-label text-sm font-semibold tracking-[0.05em] text-on-surface">Product Images</span>
          <p class="font-body text-sm leading-7 text-on-surface-variant">Upload up to five images. Drag cards to reorder, or use the arrow controls.</p>
          <input accept="image/*" class="block w-full font-body text-sm text-on-surface-variant file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:font-label file:text-xs file:font-semibold file:uppercase file:tracking-[0.08em] file:text-on-primary" multiple type="file" @change="handleFileSelection" />
        </label>

        <div class="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
          <article
            v-for="(item, index) in imageQueue"
            :key="item.id"
            class="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-3 shadow-sm"
            draggable="true"
            @dragstart="onDragStart(index)"
            @dragover.prevent
            @drop="onDrop(index)"
          >
            <img :alt="`Preview ${index + 1}`" :src="item.previewUrl" class="h-28 w-full rounded-xl object-cover" />
            <div class="mt-3 flex items-center justify-between gap-2">
              <span class="font-body text-xs text-on-surface-variant">{{ item.file ? 'New upload' : 'Existing image' }}</span>
              <div class="flex items-center gap-1">
                <button class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant/40 text-on-surface-variant transition-colors hover:bg-surface" type="button" @click="moveImage(index, -1)">
                  <span class="material-symbols-outlined text-[16px]">arrow_back</span>
                </button>
                <button class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant/40 text-on-surface-variant transition-colors hover:bg-surface" type="button" @click="moveImage(index, 1)">
                  <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
                <button class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant/40 text-clay transition-colors hover:bg-red-50" type="button" @click="removeImage(index)">
                  <span class="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </div>
          </article>

          <article
            v-if="!imageQueue.length"
            class="flex min-h-36 items-center justify-center rounded-2xl border border-dashed border-outline-variant/40 bg-surface-container-low px-4 text-center font-body text-sm text-on-surface-variant sm:col-span-2 lg:col-span-3"
          >
            Image previews appear here after upload.
          </article>
        </div>
      </div>

      <div class="flex flex-wrap gap-4 rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4">
        <label class="inline-flex items-center gap-3 font-body text-sm text-on-surface">
          <input v-model="form.featured" class="h-4 w-4 rounded border-outline-variant text-secondary focus:ring-secondary" type="checkbox" />
          Feature this product
        </label>
        <label class="inline-flex items-center gap-3 font-body text-sm text-on-surface">
          <input v-model="form.published" class="h-4 w-4 rounded border-outline-variant text-secondary focus:ring-secondary" type="checkbox" />
          Published and visible to the public
        </label>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row">
        <AppButton as="button" type="submit">
          {{ submitting ? 'Saving Listing...' : product ? 'Update Listing' : 'Publish Listing' }}
        </AppButton>
        <AppButton as="button" type="button" variant="secondary" @click="$emit('cancel')">Reset</AppButton>
      </div>
    </form>
  </section>
</template>
