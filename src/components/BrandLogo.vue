<script setup>
defineProps({
  imageClass: {
    type: String,
    default: 'block h-10 w-auto max-w-none object-contain sm:h-11',
  },
})
</script>

<template>
  <RouterLink to="/" class="inline-flex items-center text-primary">
    <h2 class="text-2xl font-bold font-sans">Igala<span class="text-secondary">Vox</span></h2>
  </RouterLink>
</template>
