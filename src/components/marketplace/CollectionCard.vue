<script setup>
defineProps({
  collection: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <article class="group overflow-hidden rounded-[1.5rem] border border-outline-variant/20 bg-surface-container-lowest shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_40px_-28px_rgb(92_58_33_/_0.24)]">
    <div class="relative h-56 overflow-hidden">
      <img
        :alt="collection.title"
        :src="collection.image"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/10 to-transparent"></div>
      <div class="absolute bottom-4 left-4 right-4">
        <p class="font-label text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-fixed">{{ collection.eyebrow }}</p>
        <h3 class="mt-2 font-headline text-2xl font-semibold text-white">{{ collection.title }}</h3>
      </div>
    </div>
    <div class="p-5">
      <p class="font-body text-sm leading-7 text-on-surface-variant">{{ collection.description }}</p>
    </div>
  </article>
</template>
