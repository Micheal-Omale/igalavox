<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppButton from '../components/AppButton.vue'
import ProductCard from '../components/marketplace/ProductCard.vue'
import ProductGallery from '../components/marketplace/ProductGallery.vue'
import { fetchMarketplaceProductBySlug, fetchMarketplaceProducts, formatMarketplacePrice } from '../services/marketplaceService'

const route = useRoute()
const product = ref(null)
const relatedProducts = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

function cleanWhatsappNumber(value = '') {
  return String(value || '').replace(/[^\d]/g, '')
}

const whatsappLink = computed(() => {
  if (!product.value) return '#'
  const vendorNumber = cleanWhatsappNumber(product.value.vendor_whatsapp)
  const message = encodeURIComponent(`Hello, I’m interested in this product from Igalavox Marketplace: ${product.value.title}.`)
  return vendorNumber ? `https://wa.me/${vendorNumber}?text=${message}` : `https://wa.me/?text=${message}`
})

const contactLink = computed(() => {
  if (!product.value) return 'mailto:hello@igalavox.com'
  const subject = encodeURIComponent(`Marketplace inquiry: ${product.value.title}`)
  const body = encodeURIComponent(`Hello,\n\nI’m interested in "${product.value.title}" from Igalavox Marketplace.`)
  return `mailto:${product.value.vendor_email || 'hello@igalavox.com'}?subject=${subject}&body=${body}`
})

const relatedTitle = computed(() => product.value?.category || '')

async function loadProduct() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const currentProduct = await fetchMarketplaceProductBySlug(route.params.slug)
    product.value = currentProduct

    if (!currentProduct) {
      relatedProducts.value = []
      errorMessage.value = 'This marketplace item could not be found.'
      return
    }

    const candidates = await fetchMarketplaceProducts({
      category: currentProduct.category,
    })

    relatedProducts.value = candidates
      .filter((item) => item.slug !== currentProduct.slug)
      .slice(0, 3)
  } catch (error) {
    errorMessage.value = 'Unable to load this marketplace item.'
    console.error('Failed to load marketplace item:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(loadProduct)
watch(() => route.params.slug, loadProduct)
</script>

<template>
  <main class="bg-surface px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
    <div class="mx-auto max-w-7xl">
      <RouterLink class="inline-flex items-center gap-2 font-label text-xs font-semibold uppercase tracking-[0.14em] text-secondary transition-colors hover:text-primary" to="/marketplace">
        <span class="material-symbols-outlined text-base">arrow_back</span>
        Back to Marketplace
      </RouterLink>

      <div v-if="isLoading" class="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div class="h-[32rem] animate-pulse rounded-[1.75rem] border border-outline-variant/20 bg-surface-container-lowest"></div>
        <div class="space-y-4">
          <div class="h-10 w-1/3 animate-pulse rounded-full bg-surface-container"></div>
          <div class="h-16 w-4/5 animate-pulse rounded-2xl bg-surface-container"></div>
          <div class="h-44 animate-pulse rounded-[1.75rem] bg-surface-container"></div>
        </div>
      </div>

      <article v-else-if="errorMessage" class="mt-8 rounded-[1.75rem] border border-error-container bg-error-container/60 px-6 py-12 text-center">
        <h1 class="font-headline text-3xl font-semibold text-on-error-container">{{ errorMessage }}</h1>
      </article>

      <template v-else-if="product">
        <section class="mt-8 grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <ProductGallery :images="product.image_urls" :title="product.title" />

          <div>
            <div class="flex flex-wrap items-center gap-3">
              <span class="inline-flex rounded-full bg-secondary-fixed px-3 py-1 font-label text-[11px] font-semibold uppercase tracking-[0.12em] text-on-secondary-fixed">
                {{ product.category }}
              </span>
              <span class="inline-flex rounded-full border border-outline-variant/40 px-3 py-1 font-label text-[11px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
                {{ product.availability }}
              </span>
            </div>

            <h1 class="mt-5 font-display text-4xl font-bold leading-tight text-primary sm:text-5xl">
              {{ product.title }}
            </h1>

            <p class="mt-3 font-label text-sm font-semibold uppercase tracking-[0.12em] text-secondary">
              By {{ product.vendor_name }}
            </p>

            <p class="mt-6 font-body text-base leading-8 text-on-surface-variant">
              {{ product.description }}
            </p>

            <div class="mt-8 rounded-[1.5rem] border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
              <div class="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p class="font-label text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant/70">Price</p>
                  <p class="mt-2 font-display text-3xl font-bold text-primary">{{ formatMarketplacePrice(product.price) }}</p>
                </div>
                <div>
                  <p class="font-label text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant/70">Inventory</p>
                  <p class="mt-2 font-body text-sm text-on-surface-variant">{{ product.inventory_count }} available</p>
                </div>
              </div>

              <div class="mt-6 flex flex-col gap-3">
                <AppButton :href="contactLink">Contact Vendor</AppButton>
                <a
                  :href="whatsappLink"
                  class="inline-flex items-center justify-center gap-2 rounded border border-secondary bg-secondary px-6 py-3 font-label text-sm font-semibold tracking-[0.05em] text-on-secondary transition-all duration-300 hover:bg-secondary-container hover:text-on-secondary-container"
                  rel="noreferrer"
                  target="_blank"
                >
                  Buy via WhatsApp
                </a>
                <a
                  v-if="product.vendor_email"
                  :href="contactLink"
                  class="inline-flex items-center justify-center gap-2 rounded border border-outline-variant/40 px-6 py-3 font-label text-sm font-semibold tracking-[0.05em] text-on-surface-variant transition-colors hover:bg-surface"
                >
                  Email Inquiry
                </a>
              </div>
            </div>

            <div class="mt-8 grid gap-4 sm:grid-cols-2">
              <article class="rounded-[1.5rem] border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
                <p class="font-label text-xs font-semibold uppercase tracking-[0.14em] text-secondary">Materials Used</p>
                <p class="mt-3 font-body text-sm leading-7 text-on-surface-variant">{{ product.materials_used || 'Shared directly by the artisan on request.' }}</p>
              </article>
              <article class="rounded-[1.5rem] border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
                <p class="font-label text-xs font-semibold uppercase tracking-[0.14em] text-secondary">Cultural Note</p>
                <p class="mt-3 font-body text-sm leading-7 text-on-surface-variant">Each item in the marketplace is framed as both a product and a cultural document.</p>
              </article>
            </div>
          </div>
        </section>

        <section class="mt-14 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article class="rounded-[1.75rem] border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm">
            <p class="font-label text-xs font-semibold uppercase tracking-[0.16em] text-secondary">Cultural Story</p>
            <h2 class="mt-3 font-headline text-3xl font-semibold text-primary">The meaning behind the piece</h2>
            <p class="mt-5 font-body text-base leading-8 text-on-surface-variant">
              {{ product.cultural_story || product.description }}
            </p>
          </article>

          <article class="rounded-[1.75rem] border border-outline-variant/20 bg-primary text-on-primary p-6 shadow-[0_24px_40px_-30px_rgb(0_38_27_/_0.5)]">
            <p class="font-label text-xs font-semibold uppercase tracking-[0.16em] text-primary-fixed">Artisan Context</p>
            <h2 class="mt-3 font-headline text-3xl font-semibold text-white">{{ product.vendor_name }}</h2>
            <p class="mt-5 font-body text-base leading-8 text-primary-fixed">
              This listing centers craft as a living archive. The artisan identity remains visible so commerce strengthens story instead of erasing it.
            </p>
          </article>
        </section>

        <section v-if="relatedProducts.length" class="mt-16">
          <div class="mb-6 flex items-end justify-between gap-4">
            <div>
              <p class="font-label text-xs font-semibold uppercase tracking-[0.16em] text-secondary">Related Pieces</p>
              <h2 class="mt-2 font-headline text-3xl font-semibold text-primary">More from {{ relatedTitle }}</h2>
            </div>
          </div>
          <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <ProductCard v-for="item in relatedProducts" :key="item.id" :product="item" />
          </div>
        </section>
      </template>
    </div>
  </main>
</template>
