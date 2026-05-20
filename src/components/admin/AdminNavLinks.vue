<script setup>
import { useRoute } from 'vue-router'

const emit = defineEmits(['navigate'])
const route = useRoute()

const navItems = [
  { label: 'Audio Archive', to: '/admin', icon: 'library_music', exact: true },
  { label: 'Community Impact', to: '/admin/impact', icon: 'campaign', exact: false },
  { label: 'Marketplace', to: '/admin/marketplace', icon: 'storefront', exact: false },
]

function isActive(item) {
  return item.exact ? route.path === item.to : route.path.startsWith(item.to)
}
</script>

<template>
  <nav class="space-y-0.5">
    <RouterLink
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      :class="[
        'flex w-full items-center gap-3 rounded-lg px-4 py-3 font-label text-sm font-semibold transition-all',
        isActive(item)
          ? 'bg-primary-container/10 text-primary shadow-sm'
          : 'text-on-surface-variant hover:bg-surface-variant hover:text-primary',
      ]"
      @click="$emit('navigate')"
    >
      <span class="material-symbols-outlined text-[20px]">{{ item.icon }}</span>
      <span>{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>
