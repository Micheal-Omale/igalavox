<script setup>
import { formatMarketplacePrice } from '../../services/marketplaceService'

defineProps({
  products: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  deleteTargetId: {
    type: String,
    default: '',
  },
})

defineEmits(['edit', 'delete', 'toggle-published', 'toggle-featured', 'refresh'])

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}
</script>

<template>
  <section class="rounded-[1.75rem] border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm sm:p-6">
    <div class="flex items-end justify-between gap-4">
      <div>
        <p class="font-label text-xs font-semibold uppercase tracking-[0.16em] text-secondary">Marketplace Inventory</p>
        <h2 class="mt-2 font-headline text-3xl font-semibold text-primary">Manage listings</h2>
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-full border border-outline-variant/40 px-4 py-2 font-label text-xs font-semibold uppercase tracking-[0.08em] text-on-surface-variant transition-colors hover:bg-surface-container"
        type="button"
        @click="$emit('refresh')"
      >
        <span class="material-symbols-outlined text-base">refresh</span>
        Refresh
      </button>
    </div>

    <div v-if="isLoading" class="mt-6 space-y-4">
      <article v-for="index in 3" :key="index" class="h-32 animate-pulse rounded-[1.5rem] bg-surface-container"></article>
    </div>

    <div v-else-if="products.length" class="mt-6">
      <div class="hidden overflow-x-auto xl:block">
        <table class="min-w-full divide-y divide-outline-variant/20">
          <thead class="bg-surface-container-low/60">
            <tr class="text-left font-label text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant/70">
              <th class="px-4 py-4">Product</th>
              <th class="px-4 py-4">Category</th>
              <th class="px-4 py-4">Vendor</th>
              <th class="px-4 py-4">Price</th>
              <th class="px-4 py-4">Published</th>
              <th class="px-4 py-4">Featured</th>
              <th class="px-4 py-4">Created</th>
              <th class="px-4 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/20">
            <tr v-for="product in products" :key="product.id" class="hover:bg-surface-container-low/30">
              <td class="px-4 py-4">
                <div class="flex items-center gap-3">
                  <img
                    :alt="product.title"
                    :src="product.image_urls[0] || 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80'"
                    class="h-14 w-14 rounded-xl object-cover"
                    loading="lazy"
                  />
                  <div class="min-w-0">
                    <p class="truncate font-headline text-lg font-semibold text-primary">{{ product.title }}</p>
                    <p class="truncate font-body text-xs text-on-surface-variant">{{ product.inventory_count }} in stock</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4 font-body text-sm text-on-surface-variant">{{ product.category }}</td>
              <td class="px-4 py-4">
                <p class="font-body text-sm text-on-surface-variant">{{ product.vendor_name }}</p>
                <p class="font-body text-xs text-on-surface-variant/70">{{ product.vendor_whatsapp || product.vendor_email || 'No contact set' }}</p>
              </td>
              <td class="px-4 py-4 font-body text-sm text-primary">{{ formatMarketplacePrice(product.price) }}</td>
              <td class="px-4 py-4">
                <button
                  :class="[
                    'rounded-full px-3 py-1 font-label text-[11px] font-semibold uppercase tracking-[0.12em]',
                    product.published ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-outline-variant/30 text-on-surface-variant',
                  ]"
                  type="button"
                  @click="$emit('toggle-published', product)"
                >
                  {{ product.published ? 'Published' : 'Draft' }}
                </button>
              </td>
              <td class="px-4 py-4">
                <button
                  :class="[
                    'rounded-full px-3 py-1 font-label text-[11px] font-semibold uppercase tracking-[0.12em]',
                    product.featured ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-outline-variant/30 text-on-surface-variant',
                  ]"
                  type="button"
                  @click="$emit('toggle-featured', product)"
                >
                  {{ product.featured ? 'Featured' : 'Standard' }}
                </button>
              </td>
              <td class="px-4 py-4 font-body text-sm text-on-surface-variant">{{ formatDate(product.created_at) }}</td>
              <td class="px-4 py-4">
                <div class="flex justify-end gap-2">
                  <button class="rounded border border-outline-variant/40 px-3 py-2 font-label text-xs font-semibold text-secondary transition-colors hover:bg-surface" type="button" @click="$emit('edit', product)">Edit</button>
                  <button class="rounded border border-red-200 px-3 py-2 font-label text-xs font-semibold text-clay transition-colors hover:bg-red-50" type="button" @click="$emit('delete', product)">
                    {{ deleteTargetId === product.id ? 'Confirm Delete' : 'Delete' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="space-y-4 xl:hidden">
        <article v-for="product in products" :key="product.id" class="rounded-[1.5rem] border border-outline-variant/20 bg-surface-container-low p-4">
          <div class="flex gap-4">
            <img
              :alt="product.title"
              :src="product.image_urls[0] || 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80'"
              class="h-24 w-24 rounded-2xl object-cover"
              loading="lazy"
            />
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="font-headline text-xl font-semibold text-primary">{{ product.title }}</h3>
                <span class="inline-flex rounded-full bg-secondary-fixed px-2.5 py-1 font-label text-[10px] font-semibold uppercase tracking-[0.12em] text-on-secondary-fixed">
                  {{ product.category }}
                </span>
              </div>
              <p class="mt-2 font-body text-sm text-on-surface-variant">{{ product.vendor_name }}</p>
              <p class="mt-1 font-body text-xs text-on-surface-variant/70">{{ product.vendor_whatsapp || product.vendor_email || 'No contact set' }}</p>
              <div class="mt-3 flex flex-wrap items-center gap-2">
                <button
                  :class="[
                    'rounded-full px-2.5 py-1 font-label text-[10px] font-semibold uppercase tracking-[0.12em]',
                    product.published ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-outline-variant/30 text-on-surface-variant',
                  ]"
                  type="button"
                  @click="$emit('toggle-published', product)"
                >
                  {{ product.published ? 'Published' : 'Draft' }}
                </button>
                <button
                  :class="[
                    'rounded-full px-2.5 py-1 font-label text-[10px] font-semibold uppercase tracking-[0.12em]',
                    product.featured ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-outline-variant/30 text-on-surface-variant',
                  ]"
                  type="button"
                  @click="$emit('toggle-featured', product)"
                >
                  {{ product.featured ? 'Featured' : 'Standard' }}
                </button>
              </div>
              <div class="mt-3 flex flex-wrap items-center gap-3">
                <span class="font-body text-sm text-primary">{{ formatMarketplacePrice(product.price) }}</span>
                <span class="font-body text-sm text-on-surface-variant">{{ formatDate(product.created_at) }}</span>
              </div>
            </div>
          </div>

          <div class="mt-4 flex flex-wrap gap-2">
            <button class="rounded border border-outline-variant/40 px-4 py-2 font-label text-xs font-semibold text-secondary transition-colors hover:bg-surface" type="button" @click="$emit('edit', product)">Edit</button>
            <button class="rounded border border-red-200 px-4 py-2 font-label text-xs font-semibold text-clay transition-colors hover:bg-red-50" type="button" @click="$emit('delete', product)">
              {{ deleteTargetId === product.id ? 'Confirm Delete' : 'Delete' }}
            </button>
          </div>
        </article>
      </div>
    </div>

    <article
      v-else
      class="mt-6 rounded-[1.5rem] border border-dashed border-outline-variant/40 bg-surface-container-low px-6 py-12 text-center"
    >
      <h3 class="font-headline text-2xl font-semibold text-primary">No marketplace listings yet</h3>
      <p class="mt-3 font-body text-sm leading-7 text-on-surface-variant">
        Use the listing studio to publish the first artisan product.
      </p>
    </article>
  </section>
</template>
