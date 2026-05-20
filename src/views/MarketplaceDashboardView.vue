<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import BrandLogo from '../components/BrandLogo.vue'
import AdminNavLinks from '../components/admin/AdminNavLinks.vue'
import VendorProductForm from '../components/marketplace/VendorProductForm.vue'
import MarketplaceAdminTable from '../components/marketplace/MarketplaceAdminTable.vue'
import {
  createMarketplaceProduct,
  deleteMarketplaceProduct,
  fetchMarketplaceProducts,
  updateMarketplaceProduct,
  uploadMarketplaceImages,
} from '../services/marketplaceService'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()
const router = useRouter()

const products = ref([])
const isLoading = ref(true)
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const editingProduct = ref(null)
const deleteTargetId = ref('')
const isMobileMenuOpen = ref(false)

const profileDisplayName = computed(() => {
  return authStore.profile?.full_name || authStore.user?.email || 'Marketplace curator'
})

const publishedCount = computed(() => products.value.filter((item) => item.published).length)
const draftCount = computed(() => products.value.filter((item) => !item.published).length)
const featuredCount = computed(() => products.value.filter((item) => item.featured).length)

async function loadProducts() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    products.value = await fetchMarketplaceProducts({}, true)
  } catch (error) {
    errorMessage.value = 'Unable to load marketplace products.'
    console.error('Failed to load dashboard marketplace:', error)
  } finally {
    isLoading.value = false
  }
}

async function handleSubmit({ values, existingImages, newFiles }) {
  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const uploadedImages = newFiles.length ? await uploadMarketplaceImages(newFiles) : []
    const payload = {
      ...values,
      image_urls: [...existingImages, ...uploadedImages].slice(0, 5),
    }

    if (editingProduct.value?.id) {
      const updated = await updateMarketplaceProduct(editingProduct.value.id, payload)
      products.value = products.value.map((item) => item.id === updated.id ? updated : item)
      successMessage.value = 'Marketplace listing updated.'
    } else {
      const created = await createMarketplaceProduct(payload)
      products.value = [created, ...products.value]
      successMessage.value = 'Marketplace listing published.'
    }

    editingProduct.value = null
  } catch (error) {
    errorMessage.value = error.message || 'Unable to save marketplace listing.'
    console.error('Failed to save marketplace listing:', error)
  } finally {
    isSubmitting.value = false
  }
}

function startEditing(product) {
  editingProduct.value = { ...product }
  successMessage.value = ''
  errorMessage.value = ''
}

function resetForm() {
  editingProduct.value = null
}

async function handleDelete(product) {
  if (deleteTargetId.value !== product.id) {
    deleteTargetId.value = product.id
    window.setTimeout(() => {
      if (deleteTargetId.value === product.id) {
        deleteTargetId.value = ''
      }
    }, 4000)
    return
  }

  try {
    await deleteMarketplaceProduct(product)
    products.value = products.value.filter((item) => item.id !== product.id)
    deleteTargetId.value = ''
    if (editingProduct.value?.id === product.id) {
      editingProduct.value = null
    }
    successMessage.value = 'Marketplace listing deleted.'
  } catch (error) {
    errorMessage.value = error.message || 'Unable to delete marketplace listing.'
    console.error('Failed to delete marketplace listing:', error)
  }
}

async function togglePublished(product) {
  try {
    errorMessage.value = ''
    const updated = await updateMarketplaceProduct(product.id, {
      ...product,
      published: !product.published,
    })
    products.value = products.value.map((item) => item.id === updated.id ? updated : item)
    if (editingProduct.value?.id === updated.id) editingProduct.value = { ...updated }
    successMessage.value = updated.published ? 'Listing published.' : 'Listing moved to draft.'
  } catch (error) {
    errorMessage.value = error.message || 'Unable to update publish state.'
  }
}

async function toggleFeatured(product) {
  try {
    errorMessage.value = ''
    const updated = await updateMarketplaceProduct(product.id, {
      ...product,
      featured: !product.featured,
    })
    products.value = products.value.map((item) => item.id === updated.id ? updated : item)
    if (editingProduct.value?.id === updated.id) editingProduct.value = { ...updated }
    successMessage.value = updated.featured ? 'Product featured.' : 'Product returned to standard listing.'
  } catch (error) {
    errorMessage.value = error.message || 'Unable to update featured state.'
  }
}

async function signOut() {
  await authStore.signOut()
  router.push('/signin')
}

onMounted(async () => {
  await authStore.initializeAuth()
  await loadProducts()
})
</script>

<template>
  <main class="min-h-dvh bg-background text-on-background">
    <div class="flex min-h-dvh">
      <aside class="hidden w-[260px] shrink-0 flex-col border-r border-outline-variant/40 bg-surface-container-lowest md:flex">
        <div class="px-6 pb-6 pt-6">
          <BrandLogo image-class="block h-10 w-auto max-w-none object-contain" />
          <p class="mt-1.5 font-label text-xs font-semibold uppercase tracking-[0.14em] text-secondary">Admin Console</p>
        </div>
        <div class="flex-1 px-3">
          <AdminNavLinks />
        </div>
        <div class="border-t border-outline-variant/30 px-4 py-4">
          <RouterLink
            to="/"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 font-label text-sm text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-primary"
          >
            <span class="material-symbols-outlined text-[20px]">language</span>
            View Site
          </RouterLink>
          <button
            class="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-label text-sm text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-clay"
            type="button"
            @click="signOut"
          >
            <span class="material-symbols-outlined text-[20px]">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      <div class="flex min-w-0 flex-1 flex-col">
        <header class="sticky top-0 z-40 flex h-[60px] items-center justify-between border-b border-outline-variant/30 bg-surface-container-lowest/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div class="flex items-center gap-4">
            <button
              class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant/40 text-on-surface-variant transition-colors hover:text-primary md:hidden"
              @click="isMobileMenuOpen = true"
              aria-label="Open menu"
            >
              <span class="material-symbols-outlined text-[20px]">menu</span>
            </button>
            <div>
              <h1 class="font-display text-lg font-bold text-primary sm:text-xl">Marketplace Manager</h1>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <RouterLink
              to="/marketplace"
              class="hidden rounded-full border border-outline-variant px-4 py-2 font-label text-xs font-semibold uppercase tracking-[0.08em] text-secondary transition-colors hover:border-secondary hover:text-primary sm:inline-flex"
            >
              View Marketplace
            </RouterLink>
            <div class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-outline-variant/40 bg-primary-container">
              <span class="material-symbols-outlined text-[18px] text-on-primary-container">storefront</span>
            </div>
          </div>
        </header>

        <div
          v-if="isMobileMenuOpen"
          class="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm md:hidden"
          @click.self="isMobileMenuOpen = false"
        >
          <aside class="h-full w-72 max-w-[85vw] border-r border-outline-variant bg-surface-container-lowest px-4 py-6 shadow-xl">
            <div class="mb-6 flex items-start justify-between">
              <div>
                <BrandLogo image-class="block h-10 w-auto max-w-none object-contain" />
                <p class="mt-1.5 font-label text-xs font-semibold uppercase tracking-[0.14em] text-secondary">Admin Console</p>
              </div>
              <button
                class="flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant text-on-surface-variant"
                @click="isMobileMenuOpen = false"
                aria-label="Close menu"
              >
                <span class="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <AdminNavLinks @navigate="isMobileMenuOpen = false" />
          </aside>
        </div>

        <div class="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div class="mx-auto max-w-7xl">
            <header class="rounded-[1.75rem] border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm">
              <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p class="font-label text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Admin Marketplace</p>
                  <h2 class="mt-3 font-display text-4xl font-bold text-primary">Marketplace studio</h2>
                  <p class="mt-4 max-w-2xl font-body text-base leading-8 text-on-surface-variant">
                    Publish culturally grounded listings, manage imagery, and keep artisan stories visible inside the Igalavox ecosystem.
                  </p>
                </div>
              </div>
            </header>

            <section class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article class="rounded-[1.5rem] border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
          <p class="font-label text-xs font-semibold uppercase tracking-[0.14em] text-secondary">Vendor Profile</p>
          <h2 class="mt-3 font-headline text-2xl font-semibold text-primary">{{ profileDisplayName }}</h2>
          <p class="mt-3 font-body text-sm leading-7 text-on-surface-variant">Approved vendor or admin curator for the cultural marketplace.</p>
        </article>
        <article class="rounded-[1.5rem] border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
          <p class="font-label text-xs font-semibold uppercase tracking-[0.14em] text-secondary">Published</p>
          <p class="mt-3 font-display text-3xl font-bold text-primary">{{ publishedCount }}</p>
        </article>
        <article class="rounded-[1.5rem] border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
          <p class="font-label text-xs font-semibold uppercase tracking-[0.14em] text-secondary">Drafts</p>
          <p class="mt-3 font-display text-3xl font-bold text-primary">{{ draftCount }}</p>
        </article>
        <article class="rounded-[1.5rem] border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
          <p class="font-label text-xs font-semibold uppercase tracking-[0.14em] text-secondary">Featured</p>
          <p class="mt-3 font-display text-3xl font-bold text-primary">{{ featuredCount }}</p>
        </article>
            </section>

            <p v-if="errorMessage" class="mt-6 rounded-2xl border border-error-container bg-error-container/60 px-4 py-3 font-body text-sm text-on-error-container">
              {{ errorMessage }}
            </p>
            <p v-if="successMessage" class="mt-6 rounded-2xl border border-primary-container/20 bg-primary-container/10 px-4 py-3 font-body text-sm text-primary">
              {{ successMessage }}
            </p>

            <div class="mt-6 space-y-6">
              <VendorProductForm
                :product="editingProduct"
                :submitting="isSubmitting"
                @cancel="resetForm"
                @submit="handleSubmit"
              />

              <MarketplaceAdminTable
                :delete-target-id="deleteTargetId"
                :is-loading="isLoading"
                :products="products"
                @delete="handleDelete"
                @edit="startEditing"
                @refresh="loadProducts"
                @toggle-featured="toggleFeatured"
                @toggle-published="togglePublished"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
