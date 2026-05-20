<script setup>
defineProps({
  search: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    default: '',
  },
  vendorName: {
    type: String,
    default: '',
  },
  featuredOnly: {
    type: Boolean,
    default: false,
  },
  categories: {
    type: Array,
    default: () => [],
  },
  vendors: {
    type: Array,
    default: () => [],
  },
})

defineEmits([
  'update:search',
  'update:category',
  'update:vendorName',
  'update:featuredOnly',
  'reset',
])
</script>

<template>
  <section class="rounded-[1.5rem] border border-outline-variant/20 bg-surface-container-lowest p-4 shadow-sm">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p class="font-label text-xs font-semibold uppercase tracking-[0.16em] text-secondary">Refined Discovery</p>
        <p class="mt-2 font-body text-sm leading-7 text-on-surface-variant">
          Search by material, artisan, or cultural object without turning the page into a crowded retail grid.
        </p>
      </div>
      <button
        class="inline-flex items-center gap-2 self-start rounded-full border border-outline-variant/40 px-4 py-2 font-label text-xs font-semibold uppercase tracking-[0.08em] text-on-surface-variant transition-colors hover:bg-surface-container"
        type="button"
        @click="$emit('reset')"
      >
        <span class="material-symbols-outlined text-base">restart_alt</span>
        Reset Filters
      </button>
    </div>

    <div class="mt-5 grid gap-3 lg:grid-cols-[1.2fr_0.9fr_0.9fr_auto]">
      <label class="relative">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
        <input
          :value="search"
          class="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low py-3 pl-10 pr-4 font-body text-sm text-on-surface outline-none transition focus:border-tertiary focus:ring-1 focus:ring-tertiary"
          placeholder="Search products, artisans, or stories"
          type="search"
          @input="$emit('update:search', $event.target.value)"
        />
      </label>

      <select
        :value="category"
        class="rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 font-body text-sm text-on-surface outline-none transition focus:border-tertiary"
        @change="$emit('update:category', $event.target.value)"
      >
        <option value="">All Categories</option>
        <option v-for="item in categories" :key="item.key" :value="item.key">{{ item.label }}</option>
      </select>

      <select
        :value="vendorName"
        class="rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 font-body text-sm text-on-surface outline-none transition focus:border-tertiary"
        @change="$emit('update:vendorName', $event.target.value)"
      >
        <option value="">All Artisans</option>
        <option v-for="vendor in vendors" :key="vendor" :value="vendor">{{ vendor }}</option>
      </select>

      <label class="inline-flex items-center gap-3 rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 font-body text-sm text-on-surface">
        <input
          :checked="featuredOnly"
          class="h-4 w-4 rounded border-outline-variant text-secondary focus:ring-secondary"
          type="checkbox"
          @change="$emit('update:featuredOnly', $event.target.checked)"
        />
        Featured only
      </label>
    </div>
  </section>
</template>
