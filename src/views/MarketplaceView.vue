<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import CollectionCard from '../components/marketplace/CollectionCard.vue'
import MarketplaceFilters from '../components/marketplace/MarketplaceFilters.vue'
import MarketplaceHero from '../components/marketplace/MarketplaceHero.vue'
import ProductCard from '../components/marketplace/ProductCard.vue'
import { fetchMarketplaceProducts, fetchMarketplaceVendorNames, marketplaceCategories } from '../services/marketplaceService'

const search = ref('')
const selectedCategory = ref('')
const selectedVendorName = ref('')
const featuredOnly = ref(false)
const isLoading = ref(true)
const errorMessage = ref('')
const products = ref([])
const vendors = ref([])
let searchDebounceTimer = null

const collectionCards = [
  {
    eyebrow: 'Textiles',
    title: 'Traditional Fabrics',
    description: 'Ceremonial cloth, woven textures, and wardrobe pieces that carry place and prestige.',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    eyebrow: 'Object Culture',
    title: 'Handmade Crafts',
    description: 'Functional and decorative pieces shaped by touch, patience, and indigenous making.',
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=80',
  },
  {
    eyebrow: 'Knowledge',
    title: 'Books & Archives',
    description: 'Reading materials and cultural references that help memory travel across generations.',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80',
  },
]

const featuredProducts = computed(() => products.value.filter((item) => item.featured).slice(0, 3))
const artisanCount = computed(() => new Set(products.value.map((item) => item.vendor_name).filter(Boolean)).size)

async function loadMarketplace() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const filters = {
      search: search.value,
      category: selectedCategory.value,
      vendorName: selectedVendorName.value,
      featuredOnly: featuredOnly.value,
    }

    const [nextProducts, nextVendors] = await Promise.all([
      fetchMarketplaceProducts(filters),
      fetchMarketplaceVendorNames(),
    ])

    products.value = nextProducts
    vendors.value = nextVendors
  } catch (error) {
    errorMessage.value = 'Unable to load marketplace products right now.'
    console.error('Failed to load marketplace:', error)
  } finally {
    isLoading.value = false
  }
}

function resetFilters() {
  search.value = ''
  selectedCategory.value = ''
  selectedVendorName.value = ''
  featuredOnly.value = false
}

onMounted(loadMarketplace)

// Debounce search input to avoid firing a query per keystroke
watch(search, () => {
  clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(loadMarketplace, 350)
})

// Category, vendor, and featured changes trigger immediately
watch([selectedCategory, selectedVendorName, featuredOnly], loadMarketplace)

onBeforeUnmount(() => {
  clearTimeout(searchDebounceTimer)
})
</script>

<template>
  <main class="bg-background text-on-background">
    <MarketplaceHero :artisan-count="artisanCount" :featured-count="products.length" />

    <section class="bg-surface px-4 py-16 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="mb-8 max-w-3xl">
          <p class="font-label text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Featured Collections</p>
          <h2 class="mt-3 font-headline text-3xl font-semibold text-primary sm:text-4xl">A curated entry into craftsmanship, memory, and modern cultural ownership</h2>
        </div>

        <div class="grid gap-6 lg:grid-cols-3">
          <CollectionCard v-for="collection in collectionCards" :key="collection.title" :collection="collection" />
        </div>
      </div>
    </section>

    <section id="marketplace-grid" class="bg-surface-container-low px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div class="mx-auto max-w-7xl">
        <MarketplaceFilters
          :categories="marketplaceCategories"
          :category="selectedCategory"
          :featured-only="featuredOnly"
          :search="search"
          :vendor-name="selectedVendorName"
          :vendors="vendors"
          @reset="resetFilters"
          @update:category="selectedCategory = $event"
          @update:featured-only="featuredOnly = $event"
          @update:search="search = $event"
          @update:vendor-name="selectedVendorName = $event"
        />

        <div v-if="featuredProducts.length" class="mt-10">
          <div class="mb-5 flex items-end justify-between gap-4">
            <div>
              <p class="font-label text-xs font-semibold uppercase tracking-[0.16em] text-secondary">Editor’s Selection</p>
              <h2 class="mt-2 font-headline text-3xl font-semibold text-primary">Featured marketplace stories</h2>
            </div>
          </div>

          <div class="grid gap-6 lg:grid-cols-3">
            <ProductCard v-for="product in featuredProducts" :key="product.id" :product="product" />
          </div>
        </div>

        <div class="mt-10 flex items-end justify-between gap-4">
          <div>
            <p class="font-label text-xs font-semibold uppercase tracking-[0.16em] text-secondary">All Listings</p>
            <h2 class="mt-2 font-headline text-3xl font-semibold text-primary">Curated products across the Igala cultural economy</h2>
          </div>
          <p class="font-body text-sm text-on-surface-variant">{{ products.length }} products</p>
        </div>

        <p v-if="errorMessage" class="mt-6 rounded-2xl border border-error-container bg-error-container/70 px-4 py-3 font-body text-sm text-on-error-container">
          {{ errorMessage }}
        </p>

        <div v-if="isLoading" class="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <article v-for="index in 3" :key="index" class="h-[30rem] animate-pulse rounded-[1.5rem] border border-outline-variant/20 bg-surface-container-lowest"></article>
        </div>

        <div v-else-if="products.length" class="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <ProductCard v-for="product in products" :key="product.id" :product="product" />
        </div>

        <article
          v-else
          class="mt-8 rounded-[1.75rem] border border-outline-variant/20 bg-surface-container-lowest px-6 py-14 text-center shadow-sm"
        >
          <span class="material-symbols-outlined text-[42px] text-outline-variant">search_off</span>
          <h3 class="mt-4 font-headline text-2xl font-semibold text-primary">No products match this current view</h3>
          <p class="mt-3 font-body text-sm leading-7 text-on-surface-variant">
            Try a broader search or clear filters to continue exploring the cultural marketplace.
          </p>
        </article>
      </div>
    </section>
  </main>
</template>
