<script setup>
import AppButton from '../AppButton.vue'
import { formatMarketplacePrice } from '../../services/marketplaceService'

defineProps({
  product: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <article class="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-outline-variant/20 bg-surface-container-lowest shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_44px_-28px_rgb(92_58_33_/_0.22)]">
    <RouterLink :to="`/marketplace/${product.slug}`" class="relative block overflow-hidden">
      <img
        :alt="product.title"
        :src="product.image_urls[0] || 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80'"
        class="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div class="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-primary/75 to-transparent p-4">
        <span class="inline-flex rounded-full bg-white/12 px-3 py-1 font-label text-[11px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
          {{ product.category }}
        </span>
        <span
          v-if="product.featured"
          class="inline-flex rounded-full border border-white/20 bg-white/12 px-3 py-1 font-label text-[11px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm"
        >
          Featured
        </span>
      </div>
    </RouterLink>

    <div class="flex flex-1 flex-col p-5">
      <p class="font-label text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">{{ product.vendor_name }}</p>
      <h3 class="mt-2 font-headline text-2xl font-semibold text-primary">{{ product.title }}</h3>
      <p class="mt-3 flex-1 font-body text-sm leading-7 text-on-surface-variant">{{ product.description }}</p>

      <div class="mt-5 flex items-center justify-between gap-4">
        <div>
          <p class="font-label text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant/70">Price</p>
          <p class="mt-1 font-headline text-xl font-semibold text-primary">{{ formatMarketplacePrice(product.price) }}</p>
        </div>
        <AppButton :to="`/marketplace/${product.slug}`" variant="secondary">View Product</AppButton>
      </div>
    </div>
  </article>
</template>
